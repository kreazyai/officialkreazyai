# KreazyAI Database Migration & Schema Compatibility Review
**Document ID:** DOC-DB-06  
**Classification:** Database Architecture & Data Integrity  
**Version:** 2.4.0  
**Authors:** PostgreSQL / Database & Senior Systems Reliability Engineers  

---

## 1. Schema Topology & Table Catalog Review

The KreazyAI persistence layer comprises 31 relational tables spanning 5 architectural phases. Every migration script is idempotent (`CREATE TABLE IF NOT EXISTS`) and supports zero-downtime non-destructive schema evolution.

| Phase | Table Count | Domain & Tables | Dialect Support |
| :--- | :--- | :--- | :--- |
| **Phase 1: Core Commerce** | 1–11 | `businesses`, `users`, `products`, `customers`, `orders`, `order_items`, `conversations`, `messages`, `ai_configs`, `demo_bookings`, `leads` | SQLite & PostgreSQL |
| **Phase 2: Operational Data** | 12–16 | `audit_logs`, `broadcasts`, `tags`, `custom_fields`, `integrations` | SQLite & PostgreSQL |
| **Phase 3: Identity & Security** | 17–21 | `kyc_documents`, `kyc_submissions`, `notification_preferences`, `api_keys`, `team_members` | SQLite & PostgreSQL |
| **Phase 4: Meta & AI Ledger** | 22–28 | `meta_connections`, `meta_webhook_events`, `whatsapp_connections`, `whatsapp_onboarding_sessions`, `ai_credit_wallets`, `credit_transactions`, `subscriptions`, `payment_events`, `billing_invoices` | SQLite & PostgreSQL |
| **Phase 5: Smart Sales Recovery** | 29–31 | `recovery_settings`, `recovery_candidates`, `recovery_attempts`, `recovery_events`, `recovery_attributions`, `recovery_outbox` | SQLite & PostgreSQL |

---

## 2. Dialect Neutrality & Compatibility Matrix

| Feature | SQLite Dialect (`better-sqlite3`) | PostgreSQL Dialect (`pg.Pool` on Neon) | Bridge Strategy |
| :--- | :--- | :--- | :--- |
| **Timestamps** | `TEXT DEFAULT (datetime('now'))` | `TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP` | Stored as ISO-8601 strings, parsed via `new Date(val)` |
| **JSON Fields** | `TEXT DEFAULT '{}'` / `DEFAULT '[]'` | `JSONB` / `TEXT` | `JSON.parse(val \|\| '{}')` safe parsing wrapper |
| **Transactions** | `db.transaction(fn)(db)` with Mutex | `db.transaction(async (trx) => ...)` | Normalized in `runInTransaction(db, fn)` |
| **Casing** | Preserves case (`WABA_id`, `tenant_id`) | Lowercase folding (`waba_id`, `tenant_id`) | Unified via `normalizeRowCompat` wrapper |
| **Concurrency Lock**| Serialized FIFO Queue | Row-level locking (`FOR UPDATE`) | Preserves ACID isolation without deadlocks |

---

## 3. Concurrency & Optimistic Locking Strategy

In Phase 5 Smart Sales Recovery, multiple worker processes and incoming webhooks interact concurrently with recovery candidates. To prevent race conditions, duplicate follow-ups, and double-claims:
- **Version Field:** Every candidate row includes `version INTEGER DEFAULT 1`.
- **Optimistic Lock Execution:**
  ```sql
  UPDATE recovery_candidates
  SET state = 'PROCESSING', version = version + 1, updated_at = ?
  WHERE id = ? AND version = ? AND state = 'PENDING';
  ```
- **Execution Guarantee:** If `changes === 0`, the worker detects that another thread claimed or transitioned the candidate and immediately skips execution without side effects.

---

## 4. Non-Destructive Migration Validation

1. **Zero Dropped Columns or Tables:** Migrations never execute `DROP TABLE` or `DROP COLUMN` in production environments.
2. **Selective Schema Patching:** The migration runner checks `PRAGMA table_info` (or `information_schema.columns`) before adding missing columns (`tenant_id`, `description`, `currency`, `attributes`).
3. **Data Preservation:** Development seed routines are strictly bypass-protected in production (`if (config.isProduction) return;`), guaranteeing zero mutation of live Neon records.
