# KreazyAI Deployment, Operational Runbook & Rollback Procedure
**Document ID:** DOC-OPS-11  
**Classification:** DevOps / Production Engineering Runbook  
**Version:** 2.4.0  
**Authors:** DevOps & Production Reliability Engineers  

---

## 1. Production Architecture & Environment Topology

KreazyAI is designed for zero-downtime deployment across modern cloud platforms:
- **Backend API Server:** Render / DigitalOcean / AWS ECS (Node.js runtime, port 5000 / `$PORT`).
- **Frontend SPA:** Vercel / Cloudflare Pages / Render Static (Static HTML/JS/CSS from `dist/`).
- **Database Engine:** Neon Serverless PostgreSQL with SSL connection pooling (`sslmode=require`).
- **External Webhook Gateway:** Meta Cloud API (`/api/v1/meta/webhook`).

---

## 2. Environment Variables Verification Checklist

Before triggering production deployment, the following environment variables must be configured in the host environment settings:

| Variable Name | Required | Description | Safe Example / Format |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Target runtime mode | `production` |
| `PORT` | Yes | Express listener port | `5000` |
| `DATABASE_URL` | Yes | Neon PostgreSQL pooled URI | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Yes | Cryptographic HMAC secret (min 32 chars) | `kz_prod_sec_9941a8e23f019b...` |
| `META_APP_ID` | Yes | Official Meta App ID | `159829301928374` |
| `META_APP_SECRET` | Yes | Meta App Secret for webhook HMAC | `cd27b440aeb673bebcf8f6b5521f9238` |
| `META_WEBHOOK_VERIFY_TOKEN` | Yes | Webhook verification challenge token | `kz_meta_verify_token_prod_2026` |
| `FRONTEND_URL` | Yes | Target SPA origin for OAuth redirects | `https://app.kreazyai.com` |
| `SUPER_ADMIN_EMAIL` | Yes | Primary Super-Admin identifier | `kreazyai@gmail.com` |
| `SUPER_ADMIN_PASSWORD` | Yes | Initial secure Super-Admin password | `[Managed via Secure Vault]` |

---

## 3. Pre-Flight Verification & Health Check Procedure

Prior to routing production customer traffic, execute the pre-flight verification sequence:

1. **System Health Probe:**
   ```bash
   curl -i https://api.kreazyai.com/api/health
   # Expected: HTTP 200 OK {"status":"UP","uptime":...}
   ```
2. **Database Connectivity Probe:**
   ```bash
   curl -i https://api.kreazyai.com/api/health/db
   # Expected: HTTP 200 OK {"status":"CONNECTED","database":"ready"}
   # CRITICAL: Confirm response exposes ZERO table names or schema metadata.
   ```
3. **Observability Telemetry Probe:**
   ```bash
   curl -i https://api.kreazyai.com/api/v1/whatsapp/observability
   # Expected: HTTP 200 OK {"status":"UP","components":{"metaApi":"HEALTHY"}}
   ```
4. **Bundle Sanity Test:**
   ```bash
   npm run build
   # Expected: Exit code 0, 2,145 modules bundled without compilation errors.
   ```

---

## 4. Zero-Downtime Rollback Procedure

If a critical regression, upstream Meta disruption, or unexpected error rate spike occurs post-deployment, execute the following standardized rollback protocol:

### Step 1: Immediate Traffic Isolation
- Route traffic via reverse-proxy or load balancer back to the previous stable release tag (e.g. `v2.3.9`).
- Render: In Dashboard, select the previous successful build and trigger **"Rollback to this version"**.

### Step 2: Persistence Safety & Data Preservation
- **Schema Safety:** All database schema changes in KreazyAI are strictly backward-compatible. Columns are added with default values and tables are created with `IF NOT EXISTS`. Rolling back the Node.js application does **not** require dropping columns or altering database structures.
- **Wallet & Ledger Integrity:** All credit balances, subscription records, and billing receipts recorded during the new deployment remain valid and immutable. No transactions should be purged or rolled back manually.

### Step 3: Webhook Buffer Verification
- Meta automatically queues and retries unacknowledged webhook deliveries for up to 24 hours with exponential backoff.
- Once the previous stable build is live, incoming queued webhooks will be acknowledged and processed through the deduplication pipeline without customer message loss.

### Step 4: Incident Retrospective
- Review structured logs via `pino-http` to identify exact failure stack traces.
- File regression report in `docs/repair/` referencing the impacted test case ID.
