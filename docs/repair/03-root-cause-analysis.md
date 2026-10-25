# KreazyAI Root Cause Analysis (RCA) Report
**Document ID:** DOC-RCA-03  
**Classification:** Engineering Audit / Systems Reliability  
**Version:** 2.4.0  
**Authors:** Principal Software Architect & Application Security Engineer  

---

## 1. Architectural RCA Framework

This Root Cause Analysis examines the structural, systemic, and environmental factors that introduced defects into the KreazyAI platform prior to this remediation effort. The analysis groups findings into 5 structural categories:
1. **Dual Database Adapter Sync/Async Divergence**
2. **Transaction Runner & Mutex Serialization Collisions**
3. **Database Constraints & Schema Compatibility Mismatches**
4. **Security Perimeter & Information Disclosure Vulnerabilities**
5. **Financial Ledger & Payment State Machine Flaws**

---

## 2. Category 1: Dual Database Adapter Sync/Async Divergence

### Background & Mechanism of Failure
KreazyAI supports both local development/testing using `better-sqlite3` and cloud production deployment using Serverless PostgreSQL (`pg.Pool` on Neon). 
- `better-sqlite3` is fundamentally **synchronous**. Queries return row objects immediately.
- `pg` (PostgreSQL) is fundamentally **asynchronous**. Queries return `Promise` instances.

When service code written for PostgreSQL was executed in test harnesses or local environments without uniform sync/async abstraction, several failure modes emerged:
- In `knowledgeService.js`, methods like `getTenantKnowledge` and `findMatchingFaq` were defined with the `async` keyword, unconditionally returning a Promise. Test suites asserting on synchronous SQLite returns received pending Promises instead of data objects.
- In `conversationController.js` and `adminController.js`, queries were executed without the `await` keyword, causing Express controllers to serialize raw Promise objects into the HTTP response (e.g. `{ totalUsers: {} }` instead of `{ totalUsers: 3 }`).

### Engineering Remediation
Adopted the **Dual Sync/Async Pattern** across all core database-facing services:
```javascript
// Example from knowledgeService.js
getTenantKnowledge(tenantId) {
  const db = getDatabase();
  const res = db.prepare('SELECT ...').get(tenantId);
  if (res instanceof Promise) {
    return (async () => {
      const data = await res;
      return formatKnowledge(data);
    })();
  }
  return formatKnowledge(res);
}
```
If the database adapter returns a Promise (PostgreSQL mode), the service returns an asynchronous Promise pipeline. If the adapter returns an immediate object (SQLite mode), the service returns the parsed object immediately.

---

## 3. Category 2: Transaction Runner & Mutex Serialization Collisions

### Background & Mechanism of Failure
In SQLite, transactions cannot be nested on the same database connection. Attempting to begin a transaction while one is already active triggers the fatal error:
```text
SqliteError: cannot start a transaction within a transaction
```
Furthermore, in `better-sqlite3`, calling `db.transaction(fn)` returns a wrapped function that accepts arguments to pass to `fn`. In the previous codebase:
```javascript
// BROKEN PATTERN:
async function runInTransaction(db, fn) {
  if (db.isPostgres) {
    return await db.transaction(async (trx) => await fn(trx));
  } else {
    return await db.transaction(fn)(); // db was NOT passed! txDb was undefined!
  }
}
```
When `fn(txDb)` executed, `txDb` was `undefined`, throwing `Cannot read properties of undefined (reading 'prepare')`.
Additionally, when concurrent operations (such as parallel AI credit reservations across three simultaneous messages) were executed using `Promise.all`, SQLite crashed with the nested transaction error.

### Engineering Remediation
1. **Argument Propagation:** Corrected the invocation to `db.transaction(fn)(db)`, guaranteeing that `txDb` receives the valid database instance.
2. **Mutex Serialization Queue:** Implemented an asynchronous promise-chain lock (`sqliteTxLock`) in SQLite mode:
```javascript
let sqliteTxLock = Promise.resolve();

async function runInTransaction(db, fn) {
  if (db.isPostgres) {
    return await db.transaction(async (trx) => await fn(trx));
  } else {
    const prev = sqliteTxLock;
    let release;
    sqliteTxLock = new Promise(resolve => { release = resolve; });
    try {
      await prev;
      return await db.transaction(fn)(db);
    } finally {
      release();
    }
  }
}
```
This guarantees that concurrent SQLite operations are executed sequentially in strict FIFO order, eliminating collision while preserving full transactional atomicity.

---

## 4. Category 3: Database Constraints & Schema Compatibility Mismatches

### Background & Mechanism of Failure
1. **Meta Connection Conflict Target:**
   The `meta_connections` table was defined with a composite unique constraint: `UNIQUE(business_id, platform)`. However, `metaConnectionService.saveConnectionFromOAuth` utilized:
   ```sql
   INSERT INTO meta_connections (...) VALUES (...) ON CONFLICT(id) DO UPDATE ...
   ```
   Because `id` was generated randomly on each connect attempt (`conn-whatsapp-timestamp`), the `ON CONFLICT(id)` clause was never triggered, causing a primary key collision with the composite `UNIQUE(business_id, platform)` index and crashing the OAuth reconnect flow.
2. **Column Naming Discrepancies:**
   Legacy migrations created `whatsapp_connections` with `WABA_id` (uppercase), while Meta service modules queried `waba_id` (lowercase). On PostgreSQL, unquoted identifiers fold to lowercase, whereas SQLite preserved exact casing, causing sporadic `undefined` field values.

### Engineering Remediation
1. Updated the conflict target in `metaConnectionService.js` to match the exact schema constraint:
   ```sql
   ON CONFLICT(business_id, platform) DO UPDATE SET ...
   ```
2. Implemented `normalizeRowCompat` across database adapters to automatically map and bridge identifier casing differences (`WABA_id` <-> `waba_id`).

---

## 5. Category 4: Security Perimeter & Information Disclosure Vulnerabilities

### Background & Mechanism of Failure
1. **Anonymous Schema Exposure on `/api/health/db`:**
   The health check route executed a query listing all table names from `sqlite_master` / `pg_tables` and returned them in the HTTP 200 response body. An unauthenticated attacker could map the entire database structure, table names, and internal architectures.
2. **Rate Limit Key Spoofing:**
   The Express rate limiting middleware attempted to group requests by workspace using `req.headers['x-workspace-id']`. An attacker could bypass rate limits simply by rotating the header value on every request.

### Engineering Remediation
1. Sanitized `/api/health/db` to execute a lightweight `SELECT 1` ping and return only `{ status: 'CONNECTED', database: 'ready' }` without disclosing tables or schemas.
2. Hardened the rate limiter key generator to prioritize authenticated JWT token identifiers (`req.user.businessId`), falling back strictly to client IP subnet masks when unauthenticated.

---

## 6. Category 5: Financial Ledger & Payment State Machine Flaws

### Background & Mechanism of Failure
In the original billing implementation:
1. Submitting a payment reference via `POST /billing/submit-payment` automatically transitioned the subscription status to `ACTIVE` and immediately granted 25,000 paid credits before any financial verification was performed.
2. The transaction ID (`trx_id`) was not verified for idempotency, allowing merchants or attackers to replay the same bKash/Nagad transaction reference repeatedly to acquire unlimited unpaid credit allocations.

### Engineering Remediation
1. **Two-Stage Payment State Machine:** Submitting a payment now creates an invoice record with status `Pending` and leaves `planActivated: false`. The subscription and credits remain unchanged until an authorized Super-Admin verifies the funds via `PATCH /admin/invoices/:id/verify`.
2. **Idempotency Enforcement:** An indexed lookup on `UPPER(trx_id)` rejects duplicate transaction claims with HTTP 409 Conflict.
