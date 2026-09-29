# KREAZYAI API & ENDPOINT CONTRACT AUDIT REPORT
**Document ID:** `KREAZYAI_API_AUDIT.md`  
**Classification:** API Architecture, REST Contracts & Protocol Audit  
**Phase:** Discovery & Non-Destructive Audit Only (Steps 7, 22)  

---

## 1. CURRENT API ARCHITECTURE REALITY

The current application has an API client module at `src/api/client.js` that establishes standardized envelopes:

### Standardized Success Envelope (`successResponse`):
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-09-29T23:50:00.000Z"
  }
}
```

### Standardized Error Envelope (`errorResponse`):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid SKU provided",
    "details": {},
    "timestamp": "2026-09-29T23:50:00.000Z"
  }
}
```

### Critical Architectural Finding:
**There are ZERO actual HTTP REST network endpoints.**
The existing `ApiClient` does not perform `fetch()` or `axios.get/post()` over HTTP. Instead, service modules (`authService`, `productService`, `orderService`, `customerCrmService`, `adminService`) directly return values from local memory arrays or `localStorage`.

---

## 2. AUDIT OF CURRENT PSEUDO-APIS (IN-MEMORY SERVICES)

| Domain Service | Invoked Methods | Persistence | Network Status | Classification |
| :--- | :--- | :--- | :--- | :--- |
| `authService` | `getCurrentUser()`, `login()`, `registerWorkspace()`, `logout()` | `kreazy_auth_user`, `kreazy_workspaces` | In-memory synchronous | **MOCKED** |
| `productService` | `getAll()`, `getById()`, `create()`, `update()`, `delete()` | `kreazy_products` | In-memory asynchronous | **MOCKED** |
| `orderService` | `getAll()`, `getById()`, `create()`, `updateStatus()` | `kreazy_orders` | In-memory asynchronous | **MOCKED** |
| `customerCrmService` | `getAll()`, `getById()`, `search()`, `addNote()` | `kreazy_customers_crm` | In-memory asynchronous | **MOCKED** |
| `conversationService`| `getAll()`, `sendMessage()`, `receiveIncomingMessage()` | `kreazy_conversations` | In-memory asynchronous | **MOCKED** |
| `leadCaptureService` | `bookDemo()`, `requestFounderCall()` | `kreazy_demo_requests` | In-memory asynchronous | **MOCKED** |
| `adminService` | `getSystemStats()`, `getAllWorkspaces()`, `getAuditLogs()` | `kreazy_admin_audit_logs` | In-memory asynchronous | **MOCKED** |
| `aiConfigService` | `getConfig()`, `updateConfig()`, `trainAssistant()` | `kreazy_ai_config` | In-memory asynchronous | **MOCKED** |

---

## 3. REQUIRED PRODUCTION REST API SPECIFICATION

To transition to production, the backend must implement real HTTP endpoints conforming to standard REST conventions:

### A. Authentication & Workspace Domain (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Creates business tenant and owner account. Returns JWT.
- `POST /api/v1/auth/login`: Validates email & bcrypt password hash. Returns JWT.
- `GET /api/v1/auth/me`: Authenticated user profile and active workspace context.
- `POST /api/v1/auth/logout`: Invalidates session/refresh token.

### B. Catalog Domain (`/api/v1/products`)
- `GET /api/v1/products`: Tenant-scoped product list (pagination: `?page=1&limit=20`).
- `POST /api/v1/products`: Creates product with server-side validation (SKU, price, stock).
- `GET /api/v1/products/:id`: Retrieves single product details.
- `PUT /api/v1/products/:id`: Updates product fields and refreshes AI knowledge index.
- `DELETE /api/v1/products/:id`: Soft deletes product (`deleted_at`).

### C. Commerce & Orders Domain (`/api/v1/orders`)
- `GET /api/v1/orders`: Lists orders with status, customer, and date filters.
- `POST /api/v1/orders`: Creates order with transactional stock decrement.
- `GET /api/v1/orders/:id`: Full order breakdown with items and timeline.
- `PATCH /api/v1/orders/:id/status`: Transitions order state (`CONFIRMED`, `SHIPPED`, etc.).

### D. CRM & Customers Domain (`/api/v1/customers`)
- `GET /api/v1/customers`: Searchable customer list with metrics (`total_spent`).
- `GET /api/v1/customers/:id`: Full profile with purchase history and notes.
- `POST /api/v1/customers/:id/notes`: Adds merchant note to customer history.

### E. AI & Knowledge Domain (`/api/v1/ai`)
- `POST /api/v1/ai/chat`: Live multi-turn conversation with LLM adapter.
- `GET /api/v1/ai/config`: Fetches active assistant rules, guardrails, and return days.
- `PUT /api/v1/ai/config`: Saves updated AI tone, policies, and discount limits.

### F. Leads & Public Intake Domain (`/api/v1/public`)
- `POST /api/v1/public/book-demo`: Persists demo lead into platform database.
- `POST /api/v1/public/founder-meeting`: Persists founder strategy request.
- `POST /api/v1/public/contact`: Persists contact form message.

### G. Meta Webhooks Domain (`/api/v1/webhooks/meta`)
- `GET /api/v1/webhooks/meta`: Webhook verification challenge (`hub.mode`, `hub.challenge`).
- `POST /api/v1/webhooks/meta`: Incoming message ingestion with `X-Hub-Signature-256` validation.

### H. Platform Admin Gateway (`/api/v1/admin`)
- `POST /api/v1/admin/login`: Super-admin login with secure credentials.
- `GET /api/v1/admin/metrics`: Platform-wide aggregation (businesses, total orders, AI volume).
- `GET /api/v1/admin/workspaces`: Manage all registered merchant stores.
- `GET /api/v1/admin/leads`: Review all demo bookings and founder meetings.

---
**API Audit Complete. No code modified.**
