# KreazyAI Production API Contract Specification
**Document ID:** DOC-API-05  
**Classification:** Technical Documentation / API Reference  
**Version:** 2.4.0  
**Authors:** Senior Backend & Node.js API Engineers  

---

## 1. Global Standards & Conventions

All endpoints under `/api/v1` adhere strictly to standard REST conventions, JSON serialization, and uniform envelope wrapping:
- **Base URL:** `/api/v1`
- **Envelope Format:**
  - Success: `{ "success": true, "data": <Payload>, "meta": { "timestamp": <ISO> } }`
  - Error: `{ "success": false, "error": { "code": "<STRING>", "message": "<STRING>", "details": {} } }`
- **Authentication:** `Authorization: Bearer <JWT>` header required on all protected routes.
- **Tenant Context:** Evaluated server-side from JWT claims; arbitrary `x-workspace-id` headers cannot override verified sessions.

---

## 2. API Endpoints by Domain

### 2.1 Public Sites & Lead Intake
| Method | Path | Auth | Request Body | Success Response | Expected Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/public/contact` | None | `{ name, email, phone?, message }` | `{ success: true, data: { id, status: 'RECEIVED' } }` | 200, 422 |
| `POST` | `/api/v1/public/book-demo` | None | `{ name, email, company, teamSize }` | `{ success: true, data: { bookingId, status: 'CONFIRMED' } }` | 200, 422 |
| `POST` | `/api/v1/public/founder-meeting` | None | `{ name, email, phone, notes }` | `{ success: true, data: { meetingId, status: 'SCHEDULED' } }` | 200, 422 |

### 2.2 Authentication & User Security
| Method | Path | Auth | Request Body | Success Response | Expected Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | None | `{ email, password, name, storeName }` | `{ success: true, data: { user, token, business } }` | 201, 409, 422 |
| `POST` | `/api/v1/auth/login` | None | `{ email, password }` | `{ success: true, data: { user, token, business } }` | 200, 401, 403 |
| `POST` | `/api/v1/auth/admin-login` | None | `{ identifier, password }` | `{ success: true, data: { user, token } }` | 200, 401, 403 |
| `POST` | `/api/v1/auth/forgot-password` | None | `{ email }` | `{ success: true, data: { message: 'Reset token dispatched' } }` | 200, 422 |
| `POST` | `/api/v1/auth/reset-password` | None | `{ token, newPassword }` | `{ success: true, data: { message: 'Password updated' } }` | 200, 400 |
| `GET` | `/api/v1/auth/me` | Bearer | None | `{ success: true, data: { user, business } }` | 200, 401 |
| `GET` | `/api/v1/auth/google/config` | None | None | `{ success: true, data: { clientId } }` | 200 |

### 2.3 Dashboard Metrics & Analytics
| Method | Path | Auth | Query / Body | Success Response | Expected Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/overview-metrics` | Optional/Bearer | None | `{ success: true, data: { sales: { today, this_month, this_year }, aiMessages: { today } } }` | 200 |
| `GET` | `/api/v1/analytics/summary` | Optional/Bearer | None | `{ success: true, data: { totalRevenue, totalOrders, recoveryRate } }` | 200 |
| `GET` | `/api/v1/revenue/summary` | Optional/Bearer | None | `{ success: true, data: { grossRevenue, netRevenue, monthlyTrend } }` | 200 |

### 2.4 AI Credits & Subscription Billing
| Method | Path | Auth | Request Body | Success Response | Expected Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/whatsapp/wallet` | Bearer | None | `{ success: true, data: { creditsBalance, isTrialExpired, trialDaysRemaining } }` | 200, 401 |
| `GET` | `/api/v1/billing/details` | Bearer | None | `{ success: true, data: { plan, conversations, paymentMethod, invoices: [] } }` | 200, 401 |
| `POST` | `/api/v1/billing/pay` | Bearer | `{ planId, method/provider, senderNumber, trxId/transactionId }` | `{ success: true, data: { invoiceId, status: 'Pending', planActivated: false } }` | 200, 409, 422 |
| `POST` | `/api/v1/billing/cancel` | Bearer | None | `{ success: true, data: { success: true } }` | 200, 401 |
| `POST` | `/api/v1/whatsapp/upgrade-plan` | Bearer | `{ planId, billingCycle }` | `{ success: true, data: { subscription, wallet } }` | 200, 400 |

### 2.5 Catalog, CRM & Commerce
| Method | Path | Auth | Request Body | Success Response | Expected Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | Bearer | None | `{ success: true, data: [ { id, sku, name, price, stock } ] }` | 200, 401 |
| `POST` | `/api/v1/products` | Bearer | `{ name, sku, price, stock, category }` | `{ success: true, data: { id, sku, name } }` | 201, 409, 422 |
| `GET` | `/api/v1/products/:id` | Bearer | None | `{ success: true, data: { id, name, price } }` | 200, 403, 404 |
| `POST` | `/api/v1/orders` | Bearer | `{ customerName, customerPhone, items: [] }` | `{ success: true, data: { id, total, status: 'CONFIRMED' } }` | 201, 400, 409 |
| `PATCH` | `/api/v1/orders/:id/status` | Bearer | `{ status }` | `{ success: true, data: { id, status } }` | 200, 404 |
| `GET` | `/api/v1/customers` | Bearer | None | `{ success: true, data: [ { id, full_name, email, phone } ] }` | 200, 401 |
| `POST` | `/api/v1/customers/:id/notes` | Bearer | `{ content }` | `{ success: true, data: [ { id, content, created_at } ] }` | 201, 404, 422 |
| `GET` | `/api/v1/conversations` | Bearer | None | `{ success: true, data: [ { id, customer_name, channel, messages: [] } ] }` | 200, 401 |
| `POST` | `/api/v1/conversations/:id/messages` | Bearer | `{ text, sender }` | `{ success: true, data: { conversationId, messages: [] } }` | 201, 404, 422 |
| `POST` | `/api/v1/conversations/:id/ai-suggest` | Bearer | `{ userMessage }` | `{ success: true, data: { suggestion, confidence } }` | 200, 404 |

### 2.6 Meta Suite & Smart Sales Recovery
| Method | Path | Auth | Headers / Query / Body | Success Response | Expected Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/whatsapp/connection` | Bearer | None | `{ success: true, data: { isConfigured: true, status: 'CONNECTED' } }` | 200, 401 |
| `POST` | `/api/v1/whatsapp/disconnect` | Bearer | None | `{ success: true, data: { status: 'NOT_CONNECTED' } }` | 200, 401 |
| `GET` | `/api/v1/meta/oauth/callback` | None | `?code=...&state=...` | HTTP 302 Redirect to `/dashboard/integrations` | 302, 400, 403 |
| `POST` | `/api/v1/meta/webhook` | None | `x-hub-signature-256`, Raw JSON | HTTP 200 OK | 200, 401 |
| `GET` | `/api/v1/recovery/candidates` | Bearer | None | `{ success: true, data: [ { id, intent_score, stage } ] }` | 200, 401 |
| `GET` | `/api/v1/recovery/settings` | Bearer | None | `{ success: true, data: { enabled, quiet_hours_enabled, timezone } }` | 200, 401 |

### 2.7 Settings & Platform Administration
| Method | Path | Auth | Request Body | Success Response | Expected Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PUT/PATCH` | `/api/v1/settings/profile` | Bearer | `{ name, phone }` | `{ success: true, data: { user } }` | 200, 401 |
| `PUT/PATCH` | `/api/v1/settings/notifications`| Bearer | `{ emailAlerts, orderAlerts }` | `{ success: true, data: { preferences } }` | 200, 401 |
| `POST` | `/api/v1/settings/api-keys` | Bearer | `{ label / name }` | `{ success: true, data: { id, label, rawKey, maskedKey } }` | 201, 422 |
| `GET` | `/api/v1/admin/metrics` | SuperAdmin | None | `{ success: true, data: { totalUsers: 3, totalBusinesses: 3, totalOrders: 1 } }` | 200, 403 |
| `GET` | `/api/v1/admin/businesses` | SuperAdmin | None | `{ success: true, data: [ { id, name, plan, status } ] }` | 200, 403 |
| `PATCH` | `/api/v1/admin/invoices/:id/verify`| SuperAdmin | `{ action / status, notes }` | `{ success: true, data: { status: 'Confirmed', invoice: {} } }` | 200, 403, 404 |
| `GET` | `/api/health/db` | None | None | `{ status: 'CONNECTED', database: 'ready' }` | 200, 503 |
