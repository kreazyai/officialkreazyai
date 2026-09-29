# KREAZYAI DATABASE & PERSISTENCE AUDIT REPORT
**Document ID:** `KREAZYAI_DATABASE_AUDIT.md`  
**Classification:** Database Architecture, Entity Integrity & Persistence Audit  
**Phase:** Discovery & Non-Destructive Audit Only (Steps 9, 10)  

---

## 1. CURRENT DATABASE STATUS

| Aspect | Current Reality | Production Standard | Status |
| :--- | :--- | :--- | :--- |
| **Database Engine** | None. Pure `window.localStorage` | PostgreSQL 16 (or SQLite 3 for local) | **MISSING** |
| **Driver / Connection Pool** | None. In-memory synchronous I/O | `pg` connection pool with retry logic | **MISSING** |
| **Schema Definition** | Ad-hoc JavaScript object literals | Formal SQL DDL with migrations | **MISSING** |
| **Foreign Key Constraints** | None. Unguaranteed string references | Relational FK constraints (`ON DELETE CASCADE`) | **MISSING** |
| **Indexes** | None | B-Tree indexes on `workspace_id`, `email`, `created_at` | **MISSING** |
| **Transactions (ACID)** | None. Partial writes corrupt state | Atomic transactions (`BEGIN ... COMMIT`) | **MISSING** |
| **Soft Deletion** | Inconsistent array slicing | `deleted_at TIMESTAMP NULL` | **MISSING** |
| **Tenant Isolation** | Shared keys across tenants in localStorage | Scoped queries filtering `workspace_id` | **CRITICAL** |

---

## 2. AUDIT OF CURRENT IN-MEMORY ENTITIES

The following entities exist only as JSON object shapes stored in `src/services/api.js` and `src/services/mockData.js`:

### 1. `Workspace` (`kreazy_workspaces`)
- **Fields:** `id`, `name`, `owner_name`, `owner_email`, `plan`, `status`, `channels_connected`, `total_customers`, `total_orders`, `total_revenue`, `created_at`, `last_activity`.
- **Usage:** Seeded with 4 mock businesses (`ws-flagship-01`, `ws-boutique-02`, `ws-urban-03`, `ws-lumina-04`).
- **Defects:** Aggregated counts (`total_customers`, `total_orders`) are hardcoded strings rather than live relational counts.

### 2. `User` (`kreazy_auth_user`)
- **Fields:** `id`, `name`, `email`, `storeName`, `workspaceId`, `role` (`SUPER_ADMIN`, `OWNER`), `is_super_admin`, `isDemo`, `isNewUser`, `isLoggedIn`.
- **Defects:** No `password_hash`, `salt`, `created_at`, or `updated_at`. Stored directly in cleartext in localStorage.

### 3. `Product` (`kreazy_products`)
- **Fields:** `id`, `name`, `category`, `price`, `stock`, `status`, `sku`, `variants`, `image`, `aiKnowledge`, `createdAt`.
- **Defects:** No relational link to `workspace_id` on the item itself. When a new merchant signs up, `authService.registerWorkspace` literally wipes the entire array (`setStored(STORAGE_KEYS.PRODUCTS, [])`), wiping all other merchants' products!

### 4. `Order` & `OrderItem` (`kreazy_orders`)
- **Fields:** `id`, `customer`, `email`, `phone`, `date`, `total`, `status` (`CONFIRMED`, `PENDING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), `channel`, `items` (embedded array of `{ name, qty, price }`), `shippingAddress`.
- **Defects:** Embedded items have no independent primary key. No foreign keys to `customers` or `products`. No atomic decrement of product inventory when orders are placed.

### 5. `Customer` (`kreazy_customers_crm`)
- **Fields:** `id`, `workspace_id`, `first_name`, `last_name`, `full_name`, `email`, `phone`, `customer_status`, `customer_type`, `source`, `total_orders`, `total_spent`, `contacts` (embedded array), `addresses` (embedded array), `social_accounts` (embedded array), `tags`, `notes`, `activities`.
- **Defects:** Stored as deeply nested document structures inside an unindexed array. Inbound webhook simulation pushes duplicate customer records if casing or formatting differs.

### 6. `Conversation` & `Message` (`kreazy_conversations`)
- **Fields:** `id`, `customerId`, `customerName`, `customerAvatar`, `channel` (`WHATSAPP`, `INSTAGRAM`, `MESSENGER`), `unread`, `status`, `lastMessageTime`, `messages` (embedded array of `{ id, sender, text, time, isAi }`).
- **Defects:** Thread messages are bounded inside a single array. High-volume conversations will exceed localStorage limits (5MB browser quota).

### 7. `DemoBooking` (`kreazy_demo_requests`)
- **Fields:** `id`, `fullName`, `workEmail`, `phone`, `companyName`, `companySize`, `primaryUseCase`, `channels`, `preferredDate`, `preferredTime`, `notes`, `submittedAt`, `status`.
- **Defects:** Stored exclusively on the visitor's device. No server database receives this lead.

### 8. `FounderMeeting` (`kreazy_founder_meetings` / local state)
- **Fields:** `id`, `fullName`, `email`, `company`, `role`, `stage`, `monthlyRevenue`, `automationNeed`, `preferredSlot`, `createdAt`.
- **Defects:** Same as DemoBooking: completely isolated to local browser storage.

### 9. `AuditLog` (`kreazy_admin_audit_logs`)
- **Fields:** `id`, `action`, `workspace_id`, `details`, `timestamp`.
- **Defects:** Client-generated; can be edited or deleted by users in DevTools.

---

## 3. DATA FLOW AUDIT (WHERE WORKFLOWS BREAK)

### Workflow 1: Public Demo Booking
```text
Visitor Fills Form
       │
       ▼
BookDemoPage.jsx (handleSubmit)
       │
       ▼
leadCaptureService.bookDemo()
       │
       ▼
localStorage.setItem('kreazy_demo_requests', ...)
       │
       ▼ ───[ BREAK: Data never leaves visitor's laptop. Platform Admin on another PC sees 0 bookings ]
```

### Workflow 2: Merchant Catalog Ingestion & In-Chat Checkout
```text
Merchant adds Product
       │
       ▼
productService.create()
       │
       ▼
localStorage.setItem('kreazy_products', ...)
       │
       ▼
Customer triggers AI chat in MessagesPage
       │
       ▼
AiKnowledgeEngine.processMessage() reads local products array
       │
       ▼
Drafts Order & calls orderService.create()
       │
       ▼
localStorage.setItem('kreazy_orders', ...)
       │
       ▼ ───[ BREAK: Order total calculated client-side with no inventory decrement or payment authorization ]
```

---

## 4. TARGET RELATIONAL DATABASE SCHEMA (REQUIRED FOR PRODUCTION)

To transform KreazyAI into a scalable SaaS product, the following relational schema must be established:

```sql
-- 1. Businesses / Tenants
CREATE TABLE businesses (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(64) NOT NULL DEFAULT 'Growth',
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Authentication
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) REFERENCES businesses(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'OWNER',
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products
CREATE TABLE products (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  sku VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(128),
  price DECIMAL(12, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  variants JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  ai_knowledge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id, sku)
);

-- 4. Customers
CREATE TABLE customers (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  first_name VARCHAR(128),
  last_name VARCHAR(128),
  email VARCHAR(255),
  phone VARCHAR(64),
  status VARCHAR(32) DEFAULT 'ACTIVE',
  total_spent DECIMAL(12, 2) DEFAULT 0.00,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders & Line Items
CREATE TABLE orders (
  id VARCHAR(64) PRIMARY KEY,
  business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  channel VARCHAR(32) NOT NULL DEFAULT 'DIRECT',
  subtotal DECIMAL(12, 2) NOT NULL,
  discount DECIMAL(12, 2) DEFAULT 0.00,
  total DECIMAL(12, 2) NOT NULL,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL
);

-- 6. Demo Bookings & Founder Meetings (Platform Wide)
CREATE TABLE demo_bookings (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  work_email VARCHAR(255) NOT NULL,
  phone VARCHAR(64),
  company_name VARCHAR(255) NOT NULL,
  company_size VARCHAR(64),
  primary_use_case TEXT,
  preferred_date VARCHAR(64),
  preferred_time VARCHAR(64),
  status VARCHAR(32) DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE founder_meetings (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(128),
  stage VARCHAR(64),
  monthly_revenue VARCHAR(64),
  preferred_slot VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---
**Database Audit Complete. No code modified.**
