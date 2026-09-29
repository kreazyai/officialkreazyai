import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

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

    CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_business_profiles_business ON business_profiles(business_id);
    CREATE INDEX IF NOT EXISTS idx_kyc_profiles_business ON kyc_profiles(business_id);
    CREATE INDEX IF NOT EXISTS idx_kyc_documents_business ON kyc_documents(business_id);
    CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_business ON api_keys(business_id);
    CREATE INDEX IF NOT EXISTS idx_team_members_business ON team_members(business_id);
  `);

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

  logger.info('Database seeded with baseline multi-tenant structure and hashed administrator credentials.');
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

