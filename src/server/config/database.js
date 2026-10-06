import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { config } from './env.js';
import { logger } from '../utils/logger.js';
import { encryptToken } from '../utils/encryption.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

export function getDatabase(dbPath = null) {
  if (dbInstance) return dbInstance;

  const targetPath = dbPath || config.database.url;

  if (targetPath !== ':memory:') {
    const dir = path.dirname(path.resolve(__dirname, '../../../', targetPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const resolvedDbPath = targetPath === ':memory:' 
    ? ':memory:' 
    : path.resolve(__dirname, '../../../', targetPath);

  logger.info(`Initializing SQLite database connection at: ${resolvedDbPath}`);
  const db = new Database(resolvedDbPath);

  // Performance & Integrity Pragmas
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  runMigrations(db);
  seedInitialData(db);

  dbInstance = db;
  return dbInstance;
}

export function runMigrations(db) {
  logger.info('Verifying and executing database migrations...');

  db.exec(`
    -- 1. Businesses / Multi-Tenant Workspaces
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      owner_name TEXT,
      owner_email TEXT,
      plan TEXT DEFAULT 'Growth',
      status TEXT DEFAULT 'ACTIVE',
      channels_connected TEXT DEFAULT '[]',
      total_revenue REAL DEFAULT 0.0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 2. Users (Bcrypt Passwords & Server RBAC)
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'OWNER',
      is_super_admin INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 3. Products
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'IN_STOCK',
      variants TEXT DEFAULT '[]',
      image_url TEXT,
      ai_knowledge TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(business_id, sku)
    );

    -- 4. Customers (CRM)
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      first_name TEXT,
      last_name TEXT,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      customer_status TEXT DEFAULT 'ACTIVE',
      customer_type TEXT DEFAULT 'REGULAR',
      source TEXT DEFAULT 'DIRECT',
      total_orders INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0.0,
      contacts TEXT DEFAULT '[]',
      addresses TEXT DEFAULT '[]',
      social_accounts TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      notes TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 5. Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT,
      status TEXT DEFAULT 'CONFIRMED',
      channel TEXT DEFAULT 'DIRECT',
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0.0,
      total REAL NOT NULL,
      shipping_address TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 6. Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
      product_name TEXT NOT NULL,
      product_sku TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    );

    -- 7. Conversations
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_avatar TEXT,
      channel TEXT DEFAULT 'WHATSAPP',
      unread INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ACTIVE',
      last_message_time TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 8. Messages
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender TEXT NOT NULL,
      sender_name TEXT,
      text TEXT NOT NULL,
      is_ai INTEGER DEFAULT 0,
      channel TEXT DEFAULT 'WHATSAPP',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 9. Public Demo Bookings
    CREATE TABLE IF NOT EXISTS demo_bookings (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      work_email TEXT NOT NULL,
      phone TEXT,
      company_name TEXT NOT NULL,
      company_size TEXT,
      primary_use_case TEXT,
      preferred_date TEXT,
      preferred_time TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 10. Public Founder Meetings
    CREATE TABLE IF NOT EXISTS founder_meetings (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT,
      stage TEXT,
      monthly_revenue TEXT,
      automation_need TEXT,
      preferred_slot TEXT,
      status TEXT DEFAULT 'PENDING',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 11. Contact Inquiries
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'NEW',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 12. AI Configurations & Knowledge Parameters
    CREATE TABLE IF NOT EXISTS ai_configs (
      id TEXT PRIMARY KEY,
      business_id TEXT UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      assistant_name TEXT DEFAULT 'Kreazy AI Assistant',
      brand_voice TEXT DEFAULT 'Professional, concise, courteous',
      return_days TEXT DEFAULT '14',
      return_policy TEXT DEFAULT 'Exchanges within 14 days of receipt on unused items with tags attached.',
      shipping_info TEXT DEFAULT 'Standard shipping 2-4 business days. Free over $75.',
      max_discount REAL DEFAULT 10.0,
      auto_reply_enabled INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 13. Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      business_id TEXT,
      actor_email TEXT,
      actor_role TEXT,
      action TEXT NOT NULL,
      resource TEXT,
      resource_id TEXT,
      details TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes for Tenant Isolation & Fast Query Execution
    CREATE INDEX IF NOT EXISTS idx_products_business ON products(business_id);
    CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
    CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_business ON conversations(business_id);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_audit_business ON audit_logs(business_id);
  `);

  // ── Phase 2 Migrations: Settings, KYC, Profile tables ──────────────────────
  db.exec(`
    -- 14. Extended User Profiles
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      display_name TEXT,
      phone TEXT,
      date_of_birth TEXT,
      gender TEXT,
      avatar_path TEXT,
      avatar_url TEXT,
      email_verified INTEGER DEFAULT 0,
      phone_verified INTEGER DEFAULT 0,
      last_password_changed TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 15. Extended Business Profiles
    CREATE TABLE IF NOT EXISTS business_profiles (
      id TEXT PRIMARY KEY,
      business_id TEXT UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      legal_name TEXT,
      business_type TEXT,
      business_category TEXT,
      business_description TEXT,
      website TEXT,
      business_email TEXT,
      business_phone TEXT,
      country TEXT,
      state TEXT,
      city TEXT,
      address TEXT,
      postal_code TEXT,
      base_currency TEXT DEFAULT 'USD',
      timezone TEXT DEFAULT 'UTC',
      registration_number TEXT,
      tax_id TEXT,
      trade_license TEXT,
      vat_number TEXT,
      date_of_incorporation TEXT,
      country_of_registration TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 16. KYC Profiles (Individual Identity)
    CREATE TABLE IF NOT EXISTS kyc_profiles (
      id TEXT PRIMARY KEY,
      business_id TEXT UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'NOT_STARTED',
      full_legal_name TEXT,
      date_of_birth TEXT,
      nationality TEXT,
      country_of_residence TEXT,
      residential_address TEXT,
      phone TEXT,
      submitted_at TEXT,
      reviewed_at TEXT,
      rejection_reason TEXT,
      step_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 17. KYC Documents
    CREATE TABLE IF NOT EXISTS kyc_documents (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      doc_type TEXT NOT NULL,
      original_name TEXT,
      stored_name TEXT NOT NULL,
      stored_path TEXT NOT NULL,
      mime_type TEXT,
      file_size INTEGER,
      status TEXT DEFAULT 'UPLOADED',
      review_status TEXT DEFAULT 'PENDING',
      uploaded_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 18. KYC Submissions (track submission events)
    CREATE TABLE IF NOT EXISTS kyc_submissions (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'UNDER_REVIEW',
      submitted_at TEXT DEFAULT (datetime('now')),
      reviewed_at TEXT,
      reviewer_notes TEXT
    );

    -- 19. Notification Preferences
    CREATE TABLE IF NOT EXISTS notification_preferences (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      order_notifications INTEGER DEFAULT 1,
      ai_notifications INTEGER DEFAULT 1,
      automation_failures INTEGER DEFAULT 1,
      integration_alerts INTEGER DEFAULT 1,
      security_alerts INTEGER DEFAULT 1,
      marketing_emails INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 20. API Keys
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL,
      last_used_at TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      revoked_at TEXT
    );

    -- 21. Team Members (workspace users)
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT DEFAULT 'MEMBER',
      status TEXT DEFAULT 'ACTIVE',
      invited_at TEXT DEFAULT (datetime('now')),
      last_active_at TEXT
    );

    -- 22. Meta Platform Connections (Official OAuth & Multi-Tenant Isolated)
    CREATE TABLE IF NOT EXISTS meta_connections (
      id TEXT PRIMARY KEY,
      business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      workspace_id TEXT NOT NULL,
      platform TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
      meta_user_id TEXT,
      business_account_id TEXT,
      page_id TEXT,
      page_name TEXT,
      instagram_account_id TEXT,
      instagram_username TEXT,
      whatsapp_business_account_id TEXT,
      phone_number_id TEXT,
      display_phone_number TEXT,
      encrypted_access_token TEXT,
      token_iv TEXT,
      token_tag TEXT,
      token_expires_at TEXT,
      scopes TEXT DEFAULT '[]',
      webhook_status TEXT DEFAULT 'INACTIVE',
      last_webhook_at TEXT,
      last_sync_at TEXT,
      last_error TEXT,
      diagnostics TEXT DEFAULT '{}',
      auto_reply_enabled INTEGER DEFAULT 1,
      ai_confidence_threshold REAL DEFAULT 0.75,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(business_id, platform)
    );

    -- 23. Meta Webhook Raw Ingestion & Deduplication
    CREATE TABLE IF NOT EXISTS meta_webhook_events (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE NOT NULL,
      platform TEXT NOT NULL,
      business_id TEXT,
      payload TEXT NOT NULL,
      processed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_business_profiles_business ON business_profiles(business_id);
    CREATE INDEX IF NOT EXISTS idx_kyc_profiles_business ON kyc_profiles(business_id);
    CREATE INDEX IF NOT EXISTS idx_kyc_documents_business ON kyc_documents(business_id);
    CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_business ON api_keys(business_id);
    CREATE INDEX IF NOT EXISTS idx_team_members_business ON team_members(business_id);
    CREATE INDEX IF NOT EXISTS idx_meta_conn_biz ON meta_connections(business_id);
    CREATE INDEX IF NOT EXISTS idx_meta_conn_platform ON meta_connections(platform);
    CREATE INDEX IF NOT EXISTS idx_meta_conn_phone ON meta_connections(phone_number_id);
    CREATE INDEX IF NOT EXISTS idx_meta_conn_page ON meta_connections(page_id);
    CREATE INDEX IF NOT EXISTS idx_meta_conn_ig ON meta_connections(instagram_account_id);
    CREATE INDEX IF NOT EXISTS idx_meta_events_event ON meta_webhook_events(event_id);
  `);

  // ── Phase 3 Migrations: WhatsApp Production Architecture & Knowledge Engine ──
  db.exec(`
    -- Multi-tenant alias view for tenants contract
    CREATE VIEW IF NOT EXISTS tenants AS
    SELECT 
      id, 
      name AS business_name, 
      status, 
      'UTC' AS timezone, 
      json_object('channels', channels_connected, 'plan', plan) AS settings,
      created_at,
      updated_at
    FROM businesses;

    -- Dedicated WhatsApp Connections Contract
    CREATE TABLE IF NOT EXISTS whatsapp_connections (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      WABA_id TEXT,
      phone_number_id TEXT,
      display_number TEXT,
      display_phone TEXT,
      status TEXT NOT NULL DEFAULT 'NOT_CONNECTED',
      credential_reference TEXT,
      webhook_status TEXT DEFAULT 'INACTIVE',
      last_event_at TEXT,
      last_webhook_event TEXT,
      last_api_check TEXT,
      last_error TEXT,
      diagnostics TEXT DEFAULT '{}',
      auto_reply_enabled INTEGER DEFAULT 1,
      ai_confidence_threshold REAL DEFAULT 0.75,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(tenant_id)
    );

    -- Integration Health & Diagnostics Record
    CREATE TABLE IF NOT EXISTS integration_health (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      platform TEXT NOT NULL DEFAULT 'WHATSAPP',
      status TEXT NOT NULL,
      diagnostics TEXT DEFAULT '{}',
      checked_at TEXT DEFAULT (datetime('now'))
    );

    -- Webhook Events view for idempotency contract
    CREATE VIEW IF NOT EXISTS webhook_events AS
    SELECT 
      id, 
      event_id, 
      platform, 
      business_id AS tenant_id, 
      payload, 
      processed, 
      created_at 
    FROM meta_webhook_events;

    -- Product Media for Multimodal Catalog Search
    CREATE TABLE IF NOT EXISTS product_media (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      media_url TEXT NOT NULL,
      media_type TEXT DEFAULT 'image',
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Tenant-scoped FAQs
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Tenant-scoped Business Policies
    CREATE TABLE IF NOT EXISTS policies (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      policy_type TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Tenant Knowledge Items & Embeddings Index
    CREATE TABLE IF NOT EXISTS knowledge_items (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      source_type TEXT NOT NULL,
      source_id TEXT,
      chunk_reference TEXT NOT NULL,
      embedding_reference TEXT,
      version INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Tenant-scoped AI Settings & Guardrails
    CREATE TABLE IF NOT EXISTS ai_settings (
      id TEXT PRIMARY KEY,
      tenant_id TEXT UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      system_instructions TEXT,
      tone TEXT DEFAULT 'professional',
      language_settings TEXT DEFAULT '["bn","en","banglish"]',
      confidence_threshold REAL DEFAULT 0.75,
      handoff_rules TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes for WhatsApp Multi-Tenant Security & Fast Retrieval
    CREATE INDEX IF NOT EXISTS idx_wa_conn_tenant ON whatsapp_connections(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_wa_conn_phone ON whatsapp_connections(phone_number_id);
    CREATE INDEX IF NOT EXISTS idx_product_media_tenant ON product_media(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_product_media_prod ON product_media(product_id);
    CREATE INDEX IF NOT EXISTS idx_faqs_tenant ON faqs(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_policies_tenant ON policies(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_knowledge_items_tenant ON knowledge_items(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_ai_settings_tenant ON ai_settings(tenant_id);
  `);

  // Dynamically backfill/alter columns on existing tables for strict specification compliance
  try {
    const productCols = db.prepare("PRAGMA table_info(products)").all().map(c => c.name);
    if (!productCols.includes('tenant_id')) {
      db.exec("ALTER TABLE products ADD COLUMN tenant_id TEXT;");
      db.exec("UPDATE products SET tenant_id = business_id WHERE tenant_id IS NULL;");
    }
    if (!productCols.includes('description')) {
      db.exec("ALTER TABLE products ADD COLUMN description TEXT;");
    }
    if (!productCols.includes('currency')) {
      db.exec("ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'USD';");
    }
    if (!productCols.includes('attributes')) {
      db.exec("ALTER TABLE products ADD COLUMN attributes TEXT DEFAULT '{}';");
    }

    const customerCols = db.prepare("PRAGMA table_info(customers)").all().map(c => c.name);
    if (!customerCols.includes('tenant_id')) {
      db.exec("ALTER TABLE customers ADD COLUMN tenant_id TEXT;");
      db.exec("UPDATE customers SET tenant_id = business_id WHERE tenant_id IS NULL;");
    }
    if (!customerCols.includes('external_customer_id')) {
      db.exec("ALTER TABLE customers ADD COLUMN external_customer_id TEXT;");
    }

    const convCols = db.prepare("PRAGMA table_info(conversations)").all().map(c => c.name);
    if (!convCols.includes('tenant_id')) {
      db.exec("ALTER TABLE conversations ADD COLUMN tenant_id TEXT;");
      db.exec("UPDATE conversations SET tenant_id = business_id WHERE tenant_id IS NULL;");
    }
    if (!convCols.includes('external_conversation_id')) {
      db.exec("ALTER TABLE conversations ADD COLUMN external_conversation_id TEXT;");
    }

    const msgCols = db.prepare("PRAGMA table_info(messages)").all().map(c => c.name);
    if (!msgCols.includes('tenant_id')) {
      db.exec("ALTER TABLE messages ADD COLUMN tenant_id TEXT;");
    }
    if (!msgCols.includes('direction')) {
      db.exec("ALTER TABLE messages ADD COLUMN direction TEXT DEFAULT 'INBOUND';");
    }
    if (!msgCols.includes('message_type')) {
      db.exec("ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text';");
    }
    if (!msgCols.includes('media_reference')) {
      db.exec("ALTER TABLE messages ADD COLUMN media_reference TEXT;");
    }
    if (!msgCols.includes('external_message_id')) {
      db.exec("ALTER TABLE messages ADD COLUMN external_message_id TEXT;");
    }
    if (!msgCols.includes('status')) {
      db.exec("ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'DELIVERED';");
    }

    const waCols = db.prepare("PRAGMA table_info(whatsapp_connections)").all().map(c => c.name);
    if (!waCols.includes('display_phone')) {
      db.exec("ALTER TABLE whatsapp_connections ADD COLUMN display_phone TEXT;");
      db.exec("UPDATE whatsapp_connections SET display_phone = display_number WHERE display_phone IS NULL;");
    }
    if (!waCols.includes('last_webhook_event')) {
      db.exec("ALTER TABLE whatsapp_connections ADD COLUMN last_webhook_event TEXT;");
    }
    if (!waCols.includes('last_api_check')) {
      db.exec("ALTER TABLE whatsapp_connections ADD COLUMN last_api_check TEXT;");
    }
  } catch (alterErr) {
    logger.warn('Non-critical schema extension warning:', alterErr.message);
  }

  logger.info('Database schema and performance indexes verified successfully.');
}

export function seedInitialData(db) {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  logger.info('Seeding initial baseline businesses and super-admin credentials...');

  const now = new Date().toISOString();

  // 1. Create Default Flagship Workspace
  const flagshipId = 'ws-flagship-01';
  db.prepare(`
    INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, channels_connected, total_revenue, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    flagshipId,
    'Kreazy Flagship Studio',
    'kreazy-flagship',
    'Store Founder',
    'founder@kreazybrand.com',
    'Enterprise Growth',
    'ACTIVE',
    JSON.stringify(['WHATSAPP', 'INSTAGRAM', 'SHOPIFY']),
    12840.50,
    now,
    now
  );

  // 1b. Create Secondary Isolated Tenant Workspace (Multi-Tenant Isolation Validation)
  const artisanId = 'ws-artisan-02';
  db.prepare(`
    INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, channels_connected, total_revenue, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    artisanId,
    'Copenhagen Botanicals',
    'copenhagen-botanicals',
    'Freja Lind',
    'freja@cphbotanicals.dk',
    'Starter',
    'ACTIVE',
    JSON.stringify(['INSTAGRAM', 'WHATSAPP']),
    4250.00,
    now,
    now
  );

  // 2. Hash Passwords with Bcrypt
  const superAdminPassHash = bcrypt.hashSync(config.auth.superAdminPassword, 10);
  const demoUserPassHash = bcrypt.hashSync('demo', 10);

  // 3. Seed Super Admin (Fixed secure server hash)
  db.prepare(`
    INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'usr-superadmin',
    null,
    config.auth.superAdminEmail,
    superAdminPassHash,
    'Kreazy Super Administrator',
    'SUPER_ADMIN',
    1,
    now,
    now
  );

  // 4. Seed Demo Merchant User
  db.prepare(`
    INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'usr-founder',
    flagshipId,
    'founder@kreazybrand.com',
    demoUserPassHash,
    'Kreazy Studio Founder',
    'OWNER',
    0,
    now,
    now
  );

  // 5. Seed Flagship AI Config
  db.prepare(`
    INSERT INTO ai_configs (id, business_id, assistant_name, brand_voice, return_days, return_policy, shipping_info, max_discount, auto_reply_enabled, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'aiconfig-flagship',
    flagshipId,
    'Kreazy Studio AI Concierge',
    'Premium, courteous, efficient, helpful',
    '14',
    'Complimentary returns & exchanges on unused items within 14 days.',
    'Express delivery within 2-4 business days. Free shipping over $75.',
    10.0,
    1,
    now,
    now
  );

  // 6. Seed Sample Baseline Products for Flagship Studio
  const sampleProducts = [
    { id: 'prod-1', sku: 'LINEN-01', name: 'Artisan Linen Overshirt', category: 'Apparel', price: 89.00, stock: 24, variants: ['S', 'M', 'L', 'XL'], aiKnowledge: 'Relaxed fit, pure organic European flax.' },
    { id: 'prod-2', sku: 'PANT-02', name: 'Tactical Pleated Trousers', category: 'Apparel', price: 115.00, stock: 18, variants: ['30', '32', '34'], aiKnowledge: 'DWR water-repellent finish, concealed zip pockets.' },
    { id: 'prod-3', sku: 'KNIT-03', name: 'Merino Wool Mockneck', category: 'Apparel', price: 95.00, stock: 15, variants: ['M', 'L'], aiKnowledge: '100% Australian extrafine merino wool, odor-resistant.' },
    { id: 'prod-4', sku: 'BAG-04', name: 'Saddle Leather Crossbody', category: 'Accessories', price: 160.00, stock: 8, variants: ['Black', 'Chestnut'], aiKnowledge: 'Full-grain vegetable tanned Italian leather.' }
  ];

  const insertProd = db.prepare(`
    INSERT INTO products (id, business_id, sku, name, category, price, stock, variants, ai_knowledge, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of sampleProducts) {
    insertProd.run(p.id, flagshipId, p.sku, p.name, p.category, p.price, p.stock, JSON.stringify(p.variants), p.aiKnowledge, now, now);
  }

  // 7. Seed Sample Lead & Booking so Admin Portal immediately reflects initial records
  db.prepare(`
    INSERT INTO demo_bookings (id, full_name, work_email, phone, company_name, company_size, primary_use_case, preferred_date, preferred_time, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'demo-101',
    'Alexander Wright',
    'alex@wrightretail.com',
    '+1 (555) 234-8899',
    'Wright Retail Group',
    '11-50 employees',
    'Omnichannel WhatsApp & Instagram AI Sales',
    '2026-10-05',
    '14:00 EST',
    'CONFIRMED',
    now
  );

  // 8. Seed Default Meta Connections & Dedicated WhatsApp Connection for Flagship Workspace
  ensureMetaConnections(db, flagshipId, flagshipId);
  ensureWhatsAppConnection(db, flagshipId);

  // 9. Seed Multi-Tenant AI Settings
  db.prepare(`
    INSERT OR IGNORE INTO ai_settings (
      id, tenant_id, system_instructions, tone, language_settings, confidence_threshold, handoff_rules, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `aisett-${flagshipId}`,
    flagshipId,
    'You are Kreazy AI Concierge, assisting shoppers professionally in English, Bangla, and Banglish. Verify live product inventory and store policies before answering.',
    'professional, courteous, helpful',
    JSON.stringify(['bn', 'en', 'banglish']),
    0.75,
    JSON.stringify({ escalateKeywords: ['agent', 'human', 'manager', 'complaint'], lowConfidenceFallback: 'ESCALATE_TO_HUMAN' }),
    now,
    now
  );

  // 10. Seed Tenant-scoped FAQs
  const defaultFaqs = [
    { q: 'What is your return policy?', a: 'Complimentary exchanges and returns within 14 days of delivery on unused items with tags attached.', cat: 'Policies' },
    { q: 'How long does shipping take and what is the fee?', a: 'Standard shipping takes 2-4 business days ($5 fee, free over $75). Express delivery available.', cat: 'Shipping' },
    { q: 'What payment methods do you accept?', a: 'We accept Visa, MasterCard, American Express, Apple Pay, bKash, and Cash on Delivery (COD).', cat: 'Payment' },
    { q: 'How can I track my order?', a: 'Provide your order ID (e.g. order-101) in this chat and our AI will retrieve your real-time fulfillment status.', cat: 'Orders' }
  ];

  const insertFaq = db.prepare(`
    INSERT INTO faqs (id, tenant_id, question, answer, category, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
  `);
  defaultFaqs.forEach((f, idx) => {
    insertFaq.run(`faq-${flagshipId}-${idx + 1}`, flagshipId, f.q, f.a, f.cat, now, now);
  });

  // 11. Seed Tenant-scoped Policies
  const defaultPolicies = [
    { type: 'RETURN_POLICY', content: 'Items in original unworn condition with tags may be returned or exchanged within 14 days of receipt.' },
    { type: 'SHIPPING_POLICY', content: 'Standard nationwide courier takes 2 to 4 business days. Free shipping applies automatically to orders over $75.' },
    { type: 'DATA_ISOLATION_POLICY', content: 'All customer conversations, orders, and credentials are strictly multi-tenant isolated and encrypted.' }
  ];

  const insertPolicy = db.prepare(`
    INSERT INTO policies (id, tenant_id, policy_type, content, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)
  `);
  defaultPolicies.forEach((p, idx) => {
    insertPolicy.run(`pol-${flagshipId}-${idx + 1}`, flagshipId, p.type, p.content, now, now);
  });

  // 12. Seed flagship WhatsApp connection & Meta channel
  db.prepare(`
    INSERT OR REPLACE INTO whatsapp_connections (
      id, tenant_id, WABA_id, phone_number_id, display_number, status, credential_reference, webhook_status, diagnostics, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'CONNECTED', 'meta_conn_vault_flagship', 'ACTIVE', '{"verified":true}', ?, ?)
  `).run(`waconn-${flagshipId}`, flagshipId, '2983710492817', '109283741', '+1 (555) 839-2041', now, now);

  const seedToken = encryptToken(config.meta.whatsappAccessToken || 'EAAG_mock_seed_token_123');
  db.prepare(`
    INSERT OR REPLACE INTO meta_connections (
      id, business_id, workspace_id, platform, status, phone_number_id, whatsapp_business_account_id, display_phone_number, encrypted_access_token, token_iv, token_tag, auto_reply_enabled, ai_confidence_threshold, diagnostics, created_at, updated_at
    ) VALUES (?, ?, ?, 'WHATSAPP', 'CONNECTED', '109283741', '2983710492817', '+1 (555) 839-2041', ?, ?, ?, 1, 0.75, '{"verified":true}', ?, ?)
  `).run(`conn-wa-${flagshipId}`, flagshipId, flagshipId, seedToken.encrypted, seedToken.iv, seedToken.tag, now, now);

  // Initialize secondary tenant empty connection records
  ensureWhatsAppConnection(db, artisanId);
  ensureMetaConnections(db, artisanId, artisanId);

  logger.info('Database seeded with baseline multi-tenant structure, WhatsApp connections, FAQs, and policies.');
}

/**
 * Ensures dedicated WhatsApp connection record exists for a tenant workspace.
 */
export function ensureWhatsAppConnection(db, tenantId) {
  const id = `waconn-${tenantId}`;
  try {
    db.prepare(`
      INSERT OR IGNORE INTO whatsapp_connections (
        id, tenant_id, status, webhook_status, diagnostics, created_at, updated_at
      ) VALUES (?, ?, 'NOT_CONNECTED', 'INACTIVE', '{}', datetime('now'), datetime('now'))
    `).run(id, tenantId);
  } catch {
    // safe fallback
  }
}

/**
 * Ensures baseline connection records exist for a workspace for all 3 Meta channels.
 */
export function ensureMetaConnections(db, businessId, workspaceId) {
  const platforms = ['WHATSAPP', 'INSTAGRAM', 'MESSENGER'];
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO meta_connections (
      id, business_id, workspace_id, platform, status,
      auto_reply_enabled, ai_confidence_threshold, diagnostics, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'NOT_CONNECTED', 1, 0.75, '{}', datetime('now'), datetime('now'))
  `);

  for (const plat of platforms) {
    const id = `conn-${plat.toLowerCase()}-${businessId}`;
    try {
      insertStmt.run(id, businessId, workspaceId || businessId, plat);
    } catch {
      // Safe fallback if business does not exist
    }
  }
}

export function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {
      // safe
    }
    dbInstance = null;
  }
}

