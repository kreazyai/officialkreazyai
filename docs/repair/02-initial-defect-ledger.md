# KreazyAI Initial Defect Ledger & Anomaly Inventory
**Document ID:** DOC-DEF-02  
**Classification:** Engineering Audit / Root Cause Tracking  
**Version:** 2.4.0  
**Authors:** QA Automation & Application Security Taskforce  

---

## 1. Executive Summary

During the comprehensive audit of the KreazyAI codebase against the 100 test cases defined in `KreazyAI_Manual_Test_Cases_Report(1).pdf`, 13 critical and high-severity functional, security, and architectural defects were cataloged. This ledger details each defect, its initial severity, affected components, reproduction vector, and current remediation status.

---

## 2. Complete Defect Inventory

| Defect ID | Severity | Category | Affected Component | Test Case(s) | Remediation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEF-001** | CRITICAL | AI & Knowledge Base | `knowledgeService.js` | TC-078, TC-083 | **VERIFIED FIXED** |
| **DEF-002** | CRITICAL | Billing & Ledger | `creditWalletService.js`, `billingController.js` | TC-044, TC-048, TC-049 | **VERIFIED FIXED** |
| **DEF-003** | HIGH | Meta OAuth Integration | `metaConnectionService.js` | TC-069, TC-071 | **VERIFIED FIXED** |
| **DEF-004** | HIGH | WhatsApp Connection Service | `whatsappConnectionService.js` | TC-069, TC-070 | **VERIFIED FIXED** |
| **DEF-005** | MEDIUM | Frontend SPA Navigation | `App.jsx` | TC-015, TC-016, TC-080 | **VERIFIED FIXED** |
| **DEF-006** | HIGH | Multi-Tenant Data Isolation | `database.js` | TC-032, TC-056, TC-067 | **VERIFIED FIXED** |
| **DEF-007** | MEDIUM | Authentication & Password Reset | `authController.js`, `apiRoutes.js` | TC-024, TC-025, TC-026 | **VERIFIED FIXED** |
| **DEF-008** | HIGH | Administrative Telemetry | `adminController.js` | TC-091 | **VERIFIED FIXED** |
| **DEF-009** | CRITICAL | Information Disclosure | `src/server/app/app.js` | TC-094 | **VERIFIED FIXED** |
| **DEF-010** | HIGH | Rate Limiting & Spoofing | `src/server/app/app.js` | TC-095 | **VERIFIED FIXED** |
| **DEF-011** | HIGH | Conversation Controller | `conversationController.js` | TC-064 | **VERIFIED FIXED** |
| **DEF-012** | CRITICAL | Billing Security & Fraud | `billingController.js` | TC-050, TC-051 | **VERIFIED FIXED** |
| **DEF-013** | HIGH | Payment Replay Protection | `billingController.js` | TC-052 | **VERIFIED FIXED** |

---

## 3. In-Depth Defect Descriptions & Impact Analysis

### DEF-001: Knowledge Service Dual Sync/Async Discrepancy
- **Component:** `src/server/services/whatsapp/knowledgeService.js`
- **Impact:** Calling `getTenantKnowledge`, `getTenantAiSettings`, `findMatchingFaq`, and `getPolicy` from synchronous SQLite contexts caused unhandled Promise rejections and broken responses when handling inbound WhatsApp customer queries.
- **Root Cause:** Methods were declared `async` without checking database adapter type, breaking synchronous test callers.
- **Verification:** Verified in both `test-whatsapp-production.mjs` and `scripts/run-all-100-tests.mjs` (TC-078).

### DEF-002: SQLite Transaction Runner Undefined Target
- **Component:** `src/server/services/billing/creditWalletService.js`, `src/server/controllers/billingController.js`
- **Impact:** Attempting to reserve credits or update subscriptions threw `TypeError: Cannot read properties of undefined (reading 'prepare')`.
- **Root Cause:** In SQLite mode, `runInTransaction` called `db.transaction(fn)()` without passing `db` as the parameter to the returned transaction wrapper function.
- **Verification:** Verified via `creditWalletService.reserveCredits` and rollback tests (TC-048, TC-049).

### DEF-003: Meta Connection Conflict Clause Constraint Mismatch
- **Component:** `src/server/services/meta/metaConnectionService.js`
- **Impact:** Saving connection tokens after OAuth re-authentication crashed with `SqliteError: UNIQUE constraint failed: meta_connections.business_id, meta_connections.platform`.
- **Root Cause:** The `INSERT` query used `ON CONFLICT(id)` which did not match the table's composite unique index `UNIQUE(business_id, platform)`.
- **Verification:** Verified via reconnect and status update tests (TC-071).

### DEF-004: Missing Awaits in WhatsApp Diagnostics
- **Component:** `src/server/services/whatsapp/whatsappConnectionService.js`
- **Impact:** `runHealthCheck(tenantId)` failed because `getConnectionWithToken` returned an unresolved Promise object to diagnostic assertions.
- **Root Cause:** Missing `await` on asynchronous token retrieval helper.
- **Verification:** Verified via `POST /api/v1/whatsapp/health-check` (TC-069, TC-070).

### DEF-005: Unmounted Dashboard Recovery Page and Missing Legal Aliases
- **Component:** `src/App.jsx`
- **Impact:** Navigating to `/dashboard/recovery` or clicking Recovery Module resulted in a fallback redirect to `overview`. Navigating to `/privacy` or `/terms` loaded 404 views.
- **Root Cause:** `'recovery'` was omitted from `VALID_DASHBOARD_MODULES` and legal routes lacked alias mappings.
- **Verification:** Verified in frontend router routing table (TC-015, TC-016, TC-080).

### DEF-006: Missing Secondary Tenant User Seed
- **Component:** `src/server/config/database.js`
- **Impact:** Automated cross-tenant penetration tests could not execute authentic Tenant B queries without manual token fabrication.
- **Root Cause:** Development seeder created secondary business `ws-artisan-02` but omitted a corresponding user account.
- **Verification:** Verified secondary merchant authentication and isolation (TC-032, TC-056, TC-067).

### DEF-007: Unimplemented Password Reset Flow
- **Component:** `src/server/controllers/authController.js`, `src/server/routes/apiRoutes.js`
- **Impact:** Requests to `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` returned 404 Route Not Found.
- **Root Cause:** Endpoints were described in specification but omitted from controller implementation and route tables.
- **Verification:** Verified complete password reset token lifecycle (TC-024, TC-025, TC-026).

### DEF-008: Admin Controller Missing Async Awaits
- **Component:** `src/server/controllers/adminController.js`
- **Impact:** GET `/api/v1/admin/metrics` returned empty Promise objects instead of numeric statistics for `totalUsers`, `totalBusinesses`, and `totalOrders`.
- **Root Cause:** Async database queries were not awaited before populating the response payload.
- **Verification:** Verified numeric telemetry on admin endpoints (TC-091).

### DEF-009: Database Health Endpoint Schema Disclosure
- **Component:** `src/server/app/app.js`
- **Impact:** Anonymous callers querying `/api/health/db` received a complete dump of all database table names and schema metadata.
- **Root Cause:** Endpoint queried `sqlite_master` / `information_schema` and echoed raw query results directly to unauthenticated clients.
- **Verification:** Verified sanitized response containing only operational health status `CONNECTED` (TC-094).

### DEF-010: Rate Limiting Spoofing Vulnerability
- **Component:** `src/server/app/app.js`
- **Impact:** Malicious actors could bypass API rate limits by sending arbitrary `x-workspace-id` headers.
- **Root Cause:** Key generator trusted unverified client headers for rate-limit grouping.
- **Verification:** Verified key generator relies exclusively on verified JWT tokens or client IP addresses (TC-095).

### DEF-011: Unawaited Conversation Query Error
- **Component:** `src/server/controllers/conversationController.js`
- **Impact:** Calling GET `/api/v1/conversations` failed with unhandled Promise iteration errors.
- **Root Cause:** Database query was treated as synchronous array without awaiting async database resolution.
- **Verification:** Verified iterable array response format (TC-064).

### DEF-012: Unverified Payment Auto-Activation
- **Component:** `src/server/controllers/billingController.js`
- **Impact:** Submitting a payment reference automatically granted subscription tier and credits without administrative or bank verification.
- **Root Cause:** Payment submission immediately executed plan upgrade transactions.
- **Verification:** Verified payment submission marks invoice `Pending` and keeps `planActivated: false` until admin clearance (TC-050, TC-051).

### DEF-013: Replay Vulnerability on Payment Transaction IDs
- **Component:** `src/server/controllers/billingController.js`
- **Impact:** The same payment transaction ID could be submitted multiple times across accounts.
- **Root Cause:** Invoices table was not checked for existing transaction references before insertion.
- **Verification:** Verified strict HTTP 409 Conflict rejection on replayed transaction IDs (TC-052).
