# KreazyAI Enterprise Admin Panel & Backend Architecture Manual

> **Confidential & Proprietary — For Backend Platform Developers & System Administrators**  
> **Platform Version:** KreazyAI 2.4.0-Production  
> **Runtime Target:** Node.js v22+ / Express 5.2.1 / Better-SQLite3 (WAL Mode) / PostgreSQL (Neon)  
> **Author:** Antigravity Engineering (ElevenLabs-Grade Architecture Standard)  
> **Last Updated:** November 2026

---

## 1. System Topology & Architecture Overview

KreazyAI is built as a unified, low-latency social commerce automation platform engineered for high-throughput messaging across WhatsApp Business Cloud API, Instagram Direct, and Facebook Messenger.

```
                              ┌────────────────────────────────────────┐
                              │      Internet / Cloud Inbound         │
                              └───────────────────┬────────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │   Reverse Proxy / SSL │
                                      └───────────┬───────────┘
                                                  │
                                                  ▼
                                ┌───────────────────────────────────┐
                                │   Express 5 REST API (:5000)      │
                                │   - Helmet Security Headers       │
                                │   - Rate Limiting Middleware      │
                                │   - CORS Isolation                │
                                └─────────┬───────────────┬─────────┘
                                          │               │
                     ┌────────────────────┴──┐         ┌──┴─────────────────────┐
                     ▼                       ▼         ▼                        ▼
           ┌───────────────────┐   ┌──────────────┐ ┌───────────────────┐  ┌─────────────┐
           │ Meta Graph API    │   │  AI Recovery │ │ Multi-Tenant      │  │ Super Admin │
           │ Webhook Ingestion │   │  Cron Engine │ │ Workspace Manager │  │ Telemetry   │
           └─────────┬─────────┘   └──────────────┘ └─────────┬─────────┘  └──────┬──────┘
                     │                                        │                   │
                     └────────────────────┬───────────────────┴───────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │   SQLite 3 with WAL Journaling  │
                         │   (Zero-lock concurrent reads,  │
                         │    sub-millisecond query perf)  │
                         │   Optional: PostgreSQL (Neon)   │
                         └─────────────────────────────────┘
```

---

## 2. Core Backend Modules & Developer Knowledge

Every backend developer maintaining the KreazyAI administrative infrastructure must understand the following 8 core systems:

### Module 1: Super Admin Authentication & Cryptographic Session Engine
- **Files:** `src/server/controllers/authController.js`, `src/server/middleware/authMiddleware.js`
- **Mechanism:**
  - Administrative authentication operates on dual identifiers: administrative email (`admin@kreazyai.com`) or system username (`kreazyadmin`).
  - Passwords are salt-hashed using `bcryptjs` (cost factor 10).
  - JWT tokens (`jsonwebtoken`) are issued with `role: 'super_admin'` and strict TTL expiration (default 24h).
  - The middleware `requireSuperAdmin` intercepts every `/api/admin/*` route, validating the bearer token and confirming that `user.role === 'super_admin'` in the database.
- **Active Sessions & Device Fingerprinting:**
  - Every login records `user_id`, `ip_address`, `user_agent`, `device_type`, `os`, `browser`, and `last_active_at` into `login_sessions`.
  - Stale sessions (>7 days inactive) are automatically invalidated.
  - Revocation of a session deletes the token hash, immediately logging out unauthorized devices.

### Module 2: Multi-Tenant Workspace Isolation & Customer Impersonation Protocol
- **Files:** `src/server/controllers/adminController.js`, `src/services/api.js`
- **Tenant Data Isolation:**
  - Every merchant store has an isolated `workspace_id`.
  - All inventory (`products`), orders (`orders`), customers (`customers`), and conversation logs (`messages`) enforce foreign keys with `tenant_id` / `workspace_id`.
  - A merchant token can **never** query data belonging to another workspace.
- **Dynamic Customer Impersonation (One-Click Takeover):**
  - **Endpoint:** `POST /api/admin/impersonate/:userId`
  - **Mechanics:**
    1. Super Admin clicks "Inspect Workspace" or "Impersonate" on any tenant.
    2. The server issues a scoped JWT containing the target user's identity plus an audit claim `is_impersonated: true, original_admin: req.user.id`.
    3. The frontend backs up the admin's session in `sessionStorage.getItem('kreazy_superadmin_auth_backup')`.
    4. The admin is instantly routed into the live customer dashboard with full merchant capabilities.
    5. A sticky top banner allows the Super Admin to click "Exit Impersonation", which restores the cached admin token and returns them to the Admin Panel.
    6. All actions during impersonation are logged in `admin_audit_logs`.

### Module 3: Meta Cloud API Webhook Ingestion & Channel Architecture
- **Files:** `src/server/controllers/webhookController.js`, `src/server/services/metaService.js`
- **HMAC Verification:**
  - Meta Webhook requests arrive with `X-Hub-Signature-256`.
  - The backend computes `crypto.createHmac('sha256', META_APP_SECRET).update(rawBody).digest('hex')` and validates with timing-safe comparison.
- **Idempotent Queue Pipeline:**
  - High-traffic sales events can send duplicate webhooks.
  - Inbound messages are deduplicated via `entry[].id` + `entry[].messaging[].message.mid`.
  - If a message ID exists in `messages` within the last 5 minutes, it is acknowledged with HTTP 200 and dropped from the queue.
- **Channel Routing:**
  - WhatsApp: `whatsapp_business_account_id` → tenant mapping.
  - Instagram: `instagram_business_account` → tenant mapping.
  - Messenger: `page_id` → tenant mapping.

### Module 4: Multilingual AI Commerce Engine & Autonomous Recovery Cron
- **Files:** `src/server/services/aiAgentService.js`, `src/server/workers/recoveryWorker.js`
- **Multilingual Support:**
  - Detects incoming customer language: **English**, **Bengali (বাংলা & Banglish)**, or **Spanish (Español)**.
  - Bengali engine handles colloquial Banglish phonetics (e.g., *"bhai size 42 ache?"*, *"price koto?"*, *"bKash e taka pathabo"*).
  - Spanish engine handles Latin American and European dialects with natural, localized tone.
- **Autonomous Cart Recovery Scheduler:**
  - Runs in the background on a 30-second tick (`scripts/dev-all.mjs` / `recoveryWorker.js`).
  - Scans `carts` where `status = 'abandoned'` and `updated_at < (now - 15 minutes)`.
  - Sequences automated recovery messages:
    - **Stage 1 (15 min):** Gentle reminder with direct checkout link.
    - **Stage 2 (1 hour):** Dynamic 5% discount offer or free shipping voucher.
    - **Stage 3 (24 hour):** Final urgent stock reservation alert.

### Module 5: Subscription Quotas, Billing & Manual bKash/Stripe Verification
- **Files:** `src/server/controllers/billingController.js`
- **Plan Limits & Quota Enforcement:**
  - **Starter ($49/mo):** 1 channel, 1,000 AI conversations/mo.
  - **Growth ($119/mo):** Omnichannel (WhatsApp + IG + FB), 5,000 AI conversations/mo, Courier sync.
  - **Scale ($299/mo):** Dedicated Cloud API, 25,000 AI conversations/mo, ERP sync.
- **Quota Throttling:**
  - When a merchant reaches 100% of their conversation quota, non-critical AI auto-replies pause with an alert email, switching messages into manual agent takeover mode without dropping incoming leads.
- **Manual bKash / Nagad Verification:**
  - For Bangladesh merchants paying via bKash/Nagad Personal or Merchant numbers, the merchant submits their Transaction ID (`TrxID`).
  - Super Admin views the pending invoice under **Finances & Invoices**, verifies the incoming funds on the physical device or MFS portal, and clicks "Approve".
  - This transitions the invoice to `paid`, updates the workspace subscription tier, and unlocks higher quotas.

### Module 6: Worldwide Geo-Fencing & Fraud Prevention
- **Files:** `src/pages/auth/SignUpPage.jsx`, `src/server/controllers/authController.js`
- **Policy Enforcement:**
  - KreazyAI is available globally across 190+ countries with dynamic dialing code selection (+1, +44, +880, +971, +34, +49, +81, etc.).
  - **Strict Geo-Restriction Rule:** Signups from **India (+91)** and **Pakistan (+92)** are strictly disallowed by business policy.
  - Attempting to submit a phone number or select country codes `IN` or `PK` triggers immediate client and server rejection: `403 Forbidden: Registration from this region is currently unsupported.`

### Module 7: AI Bootcamp Masterclass Intake & Registrations
- **Files:** `src/pages/website/AIBootcampPage.jsx`, `src/server/controllers/bootcampController.js`
- **Intake Pipeline:**
  - Public registration at `/aibootcampwithsadat` captures: Full Name, Email, WhatsApp Phone, Experience Level (Beginner/Intermediate/Advanced), and Primary Career Goal.
  - Data is validated, stored in `bootcamp_registrations`, and surfaced live in the Admin Panel under **Growth & Community → AI Bootcamp (Sadat)**.
- **Status Lifecycle:**
  - `pending` → `confirmed` → `attended` → `cancelled`.
  - Admins can filter attendees by status, search by phone or name, and export attendee rosters.

### Module 8: Production Telemetry, System Runbooks & Maintenance
- **Files:** `src/server/controllers/adminController.js`, `src/server/database/db.js`
- **High-Resolution Database Latency Calculation:**
  ```javascript
  const start = process.hrtime();
  db.prepare('SELECT 1').get();
  const diff = process.hrtime(start);
  const latencyMs = ((diff[0] * 1e9 + diff[1]) / 1e6).toFixed(2);
  ```
- **Operational Endpoints:**
  - `POST /api/admin/cache/flush`: Clears in-memory route caches, token lookup buffers, and ephemeral metric counters.
  - `POST /api/admin/system/vacuum`: Executes SQLite WAL checkpoint (`PRAGMA wal_checkpoint(TRUNCATE)`) and `VACUUM` to release fragmented disk pages.
  - `GET /api/admin/system-health`: Returns live JSON payload of DB latency, memory RSS, CPU load, and webhook pipeline counters.

---

## 3. Database Schema Reference

The database resides at `data/kreazy.db` (SQLite 3 with WAL journal mode) and contains the following core tables:

| Table Name | Primary Key | Key Foreign Keys | Purpose |
|---|---|---|---|
| `users` | `id` (UUID/Integer) | — | Merchants, store admins, and super admins. |
| `workspaces` | `id` | `owner_id` → `users.id` | Multi-tenant merchant store workspaces. |
| `products` | `id` | `workspace_id` → `workspaces.id` | Catalog items, SKU, stock quantity, variants. |
| `orders` | `id` | `workspace_id`, `customer_id` | Customer orders, checkout status, courier tracking. |
| `customers` | `id` | `workspace_id` | Customer directory across WhatsApp/Instagram/Web. |
| `messages` | `id` | `workspace_id`, `customer_id` | Full omnichannel chat history and AI draft logs. |
| `integrations` | `id` | `workspace_id` | Meta Cloud API tokens, WABA credentials, Webhooks. |
| `automations` | `id` | `workspace_id` | Active conversational AI triggers and flow rules. |
| `invoices` | `id` | `workspace_id` | Subscription invoices, bKash TrxID, Stripe IDs. |
| `login_sessions` | `id` | `user_id` → `users.id` | Active devices, IP addresses, user agents. |
| `bootcamp_registrations` | `id` | — | AI Bootcamp masterclass attendees and statuses. |
| `admin_audit_logs` | `id` | `admin_id` → `users.id` | Immutable ledger of administrative and impersonation events. |

---

## 4. Operational Runbook for Backend Engineers

### Daily Checklist:
1. **Check Telemetry Strip:** Verify DB Latency is `< 1.0 ms` and Memory RSS is `< 150 MB`.
2. **Review Inbound Webhooks:** Ensure webhook events are steadily increasing and zero dropped packets.
3. **Verify bKash Payments:** Go to **Finances & Invoices**, cross-reference pending TrxIDs with your mobile financial service app, and approve valid transactions.
4. **Inspect Failed Sessions:** Under **Login Sessions & Devices**, revoke suspicious or duplicate IP sessions.

### Weekly Maintenance:
1. **Database Vacuum & WAL Flush:** Click `Optimize DB` on the admin telemetry bar, or run `npm run db:export` to generate an encrypted snapshot.
2. **Audit Report Generation:** Download the official 12-page PDF audit report directly from the top bar (`Audit Report (PDF)`).
3. **Review Bootcamp Enrollment:** Confirm verified attendees for upcoming live cohort batches.

---
*End of Backend Developer Manual — KreazyAI Engineering 2026*
