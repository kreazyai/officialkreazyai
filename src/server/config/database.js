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

/**
 * Resolves SQLite database path handling URLs, absolute paths (e.g. /var/data/kreazy.db), and :memory:.
 * @param {string} rawPath
 * @returns {string}
 */
export function resolveDbPath(rawPath) {
  if (!rawPath || rawPath === ':memory:') {
    return ':memory:';
  }

  let clean = String(rawPath).trim();
  // Strip url schemes if present (e.g. sqlite:///var/data/kreazy.db, sqlite:/var/data/kreazy.db, file:///var/data/kreazy.db)
  if (clean.startsWith('sqlite://')) {
    clean = clean.replace(/^sqlite:\/\//, '');
  } else if (clean.startsWith('sqlite:')) {
    clean = clean.replace(/^sqlite:/, '');
  } else if (clean.startsWith('file://')) {
    clean = clean.replace(/^file:\/\//, '');
  }

  // Strip query parameters (e.g. ?mode=rwc)
  if (clean.includes('?')) {
    clean = clean.split('?')[0];
  }

  if (clean === ':memory:') {
    return ':memory:';
  }

  // If path is absolute (POSIX /var/data/kreazy.db or Windows C:\var\data\kreazy.db)
  if (path.isAbsolute(clean)) {
    return path.resolve(clean);
  }

  // If path starts with / or \ on Windows (e.g. /var/data/kreazy.db)
  if (clean.startsWith('/') || clean.startsWith('\\')) {
    return path.resolve(clean);
  }

  // Relative path - resolve relative to project root
  return path.resolve(__dirname, '../../../', clean);
}

import { 
  getPostgresPool, 
  closePostgresPool, 
  PostgresDatabaseAdapter, 
  runPostgresMigrations, 
  ensurePostgresSuperAdmin, 
  POSTGRES_TABLES_ORDERED, 
  POSTGRES_SCHEMA_SQL, 
  translateSqlForPostgres, 
  normalizeParams 
} from '../db/postgres.js';

export { 
  getPostgresPool, 
  closePostgresPool, 
  PostgresDatabaseAdapter, 
  runPostgresMigrations, 
  ensurePostgresSuperAdmin, 
  POSTGRES_TABLES_ORDERED, 
  POSTGRES_SCHEMA_SQL, 
  translateSqlForPostgres 
};

export function getDatabase(dbPath = null) {
  if (dbInstance) return dbInstance;

  const targetPath = dbPath || config.database.url;
  const postgresUrl = (process.env.POSTGRES_URL || config.database?.postgresUrl || '').trim();

  // If POSTGRES_URL is configured and caller did not explicitly request in-memory SQLite (e.g. fast unit tests)
  if (dbPath !== ':memory:' && postgresUrl) {
    logger.info('Initializing PostgreSQL connection adapter via POSTGRES_URL...');
    const pool = getPostgresPool(postgresUrl);
    const adapter = new PostgresDatabaseAdapter(pool);
    runPostgresMigrations(adapter).catch(err => {
      logger.error('PostgreSQL background migration error:', err.message);
    });
    ensurePostgresSuperAdmin(adapter).catch(err => {
      logger.warn('PostgreSQL super admin check warning:', err.message);
    });
    dbInstance = adapter;
    return dbInstance;
  }

  const resolvedDbPath = resolveDbPath(targetPath);

  if (resolvedDbPath !== ':memory:') {
    const dir = path.dirname(resolvedDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  logger.info(`Initializing SQLite database connection at: ${resolvedDbPath}`);
  const db = new Database(resolvedDbPath);

  // Performance & Integrity Pragmas
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // Unified Query Helper Methods
  db.isPostgres = false;
  db.query = async (sql, params = []) => {
    const norm = normalizeParams(params);
    const rows = db.prepare(sql).all(...norm);
    return { rows, rowCount: rows.length };
  };
  db.queryOne = async (sql, params = []) => {
    const norm = normalizeParams(params);
    const row = db.prepare(sql).get(...norm);
    return row !== undefined ? row : null;
  };
  db.queryAll = async (sql, params = []) => {
    const norm = normalizeParams(params);
    return db.prepare(sql).all(...norm);
  };
  db.execute = async (sql, params = []) => {
    const norm = normalizeParams(params);
    const res = db.prepare(sql).run(...norm);
    return { changes: res.changes, rowCount: res.changes };
  };

  db.transaction = (fn) => {
    const syncRunner = (...args) => {
      db.exec('BEGIN');
      try {
        const res = fn(...args);
        if (res && typeof res.then === 'function') {
          return res.then(
            (val) => {
              db.exec('COMMIT');
              return val;
            },
            (err) => {
              try { db.exec('ROLLBACK'); } catch {}
              throw err;
            }
          );
        }
        db.exec('COMMIT');
        return res;
      } catch (err) {
        try { db.exec('ROLLBACK'); } catch {}
        throw err;
      }
    };

    syncRunner.then = (onFulfilled, onRejected) => {
      return Promise.resolve().then(() => syncRunner()).then(onFulfilled, onRejected);
    };
    syncRunner.catch = (onRejected) => {
      return syncRunner.then(null, onRejected);
    };
    return syncRunner;
  };

  runMigrations(db);
  seedInitialData(db);
  ensureSuperAdmin(db);

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
      ai_credits_used INTEGER DEFAULT 0,
      ai_credits_limit INTEGER DEFAULT 1000,
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

    -- 11b. AI Career Bootcamp Registrations (Sadat Sakib Free Masterclass)
    CREATE TABLE IF NOT EXISTS bootcamp_registrations (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      current_role TEXT,
      experience_level TEXT,
      primary_goal TEXT,
      preferred_slot TEXT,
      linkedin_or_portfolio TEXT,
      questions TEXT,
      status TEXT DEFAULT 'CONFIRMED',
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
  `);

  try {
    const tableInfo = db.prepare("PRAGMA table_info(businesses)").all();
    const hasAiCreditsUsed = tableInfo.some(col => col.name === 'ai_credits_used');
    const hasAiCreditsLimit = tableInfo.some(col => col.name === 'ai_credits_limit');
    if (!hasAiCreditsUsed) {
      db.exec("ALTER TABLE businesses ADD COLUMN ai_credits_used INTEGER DEFAULT 0");
    }
    if (!hasAiCreditsLimit) {
      db.exec("ALTER TABLE businesses ADD COLUMN ai_credits_limit INTEGER DEFAULT 1000");
    }
  } catch (migErr) {
    logger.warn('Migration check for businesses credit columns:', migErr.message);
  }

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

    -- 24. Real Login Sessions & Active Devices
    CREATE TABLE IF NOT EXISTS login_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      user_name TEXT,
      business_name TEXT,
      ip_address TEXT,
      country TEXT DEFAULT 'United States',
      device_type TEXT DEFAULT 'Desktop',
      os TEXT DEFAULT 'Windows',
      browser TEXT DEFAULT 'Chrome',
      user_agent TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      last_active_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_login_sessions_user ON login_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_sessions_email ON login_sessions(email);

    -- 25. 6-Digit Verification OTPs
    CREATE TABLE IF NOT EXISTS verification_otps (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      store_name TEXT,
      purpose TEXT DEFAULT 'SIGNUP',
      expires_at TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      attempts INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_verification_otps_email ON verification_otps(email);
    CREATE INDEX IF NOT EXISTS idx_verification_otps_code ON verification_otps(email, otp_code);

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

    -- ── Phase 4 Migrations: Meta Embedded Signup, 7-Day Trial Wallet & Immutable Ledger ──
    -- 24. WhatsApp Onboarding Sessions
    CREATE TABLE IF NOT EXISTS whatsapp_onboarding_sessions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      state_token TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'INITIATED',
      waba_id TEXT,
      phone_number_id TEXT,
      error_message TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 25. AI Credit Wallets (7-Day Trial & Paid Allowances)
    CREATE TABLE IF NOT EXISTS ai_credit_wallets (
      tenant_id TEXT PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
      trial_started_at TEXT NOT NULL,
      trial_expires_at TEXT NOT NULL,
      trial_credits_granted INTEGER DEFAULT 125,
      credits_balance INTEGER DEFAULT 125,
      credits_reserved INTEGER DEFAULT 0,
      credits_used INTEGER DEFAULT 0,
      successful_replies_count INTEGER DEFAULT 0,
      subscription_tier TEXT DEFAULT 'FREE_TRIAL',
      subscription_status TEXT DEFAULT 'TRIAL_ACTIVE',
      monthly_credit_allowance INTEGER DEFAULT 0,
      subscription_renews_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 26. Immutable Credit Transactions Ledger
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      balance_after INTEGER NOT NULL,
      reference_id TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 27. Subscriptions (Pricing Plans)
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      plan_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      credits_allowance INTEGER NOT NULL,
      billing_cycle TEXT DEFAULT 'MONTHLY',
      currency TEXT DEFAULT 'USD',
      amount REAL DEFAULT 0.0,
      current_period_start TEXT NOT NULL,
      current_period_end TEXT NOT NULL,
      cancel_at_period_end INTEGER DEFAULT 0,
      payment_provider TEXT DEFAULT 'INTERNAL',
      external_subscription_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 28. Payment Events (Idempotent Webhook Processing)
    CREATE TABLE IF NOT EXISTS payment_events (
      id TEXT PRIMARY KEY,
      event_id TEXT UNIQUE NOT NULL,
      provider TEXT NOT NULL,
      event_type TEXT NOT NULL,
      tenant_id TEXT,
      payload TEXT NOT NULL,
      processed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 29. Billing Invoices & Receipts Ledger
    CREATE TABLE IF NOT EXISTS billing_invoices (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      invoice_number TEXT UNIQUE NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      amount_formatted TEXT,
      status TEXT NOT NULL DEFAULT 'Confirmed',
      payment_method TEXT NOT NULL,
      payment_provider TEXT NOT NULL DEFAULT 'bKash',
      sender_number TEXT,
      trx_id TEXT,
      screenshot_url TEXT,
      cleared_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_state ON whatsapp_onboarding_sessions(state_token);
    CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_tenant ON whatsapp_onboarding_sessions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_credit_wallets_tenant ON ai_credit_wallets(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_credit_tx_tenant ON credit_transactions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_credit_tx_ref ON credit_transactions(reference_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_payment_events_id ON payment_events(event_id);
    CREATE INDEX IF NOT EXISTS idx_billing_invoices_tenant ON billing_invoices(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_billing_invoices_num ON billing_invoices(invoice_number);

    -- Enforce absolute database uniqueness for active WhatsApp phone numbers across tenants (prevent TOCTOU race conditions)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_whatsapp_phone 
    ON whatsapp_connections(phone_number_id) 
    WHERE status = 'CONNECTED' AND phone_number_id IS NOT NULL;
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

  // ── Phase 5 Migrations: Smart Sales Recovery Agent Architecture ─────────────
  db.exec(`
    -- 29. Recovery Settings (Per-Tenant Configuration)
    CREATE TABLE IF NOT EXISTS recovery_settings (
      id TEXT PRIMARY KEY,
      tenant_id TEXT UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      enabled INTEGER DEFAULT 0,
      dry_run INTEGER DEFAULT 1,
      channels TEXT DEFAULT '{"whatsapp":true,"messenger":false,"instagram":false}',
      min_intent_score REAL DEFAULT 0.70,
      inactivity_minutes INTEGER DEFAULT 30,
      quiet_hours_enabled INTEGER DEFAULT 1,
      quiet_hours_start TEXT DEFAULT '22:00',
      quiet_hours_end TEXT DEFAULT '08:00',
      timezone TEXT DEFAULT 'Asia/Dhaka',
      max_daily_attempts_per_lead INTEGER DEFAULT 2,
      max_daily_tenant_attempts INTEGER DEFAULT 100,
      consent_policy TEXT DEFAULT 'EXPLICIT_OR_24H',
      model_provider TEXT DEFAULT 'local_ollama',
      model_name TEXT DEFAULT 'qwen3:1.7b',
      max_tokens INTEGER DEFAULT 150,
      temperature REAL DEFAULT 0.3,
      discount_offer_percent REAL DEFAULT 0.0,
      control_group_ratio REAL DEFAULT 0.1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 30. Recovery Candidates (High-Intent Detected Leads)
    CREATE TABLE IF NOT EXISTS recovery_candidates (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      channel TEXT DEFAULT 'WHATSAPP',
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      intent_score REAL NOT NULL,
      intent_category TEXT NOT NULL,
      intent_reason TEXT,
      buying_signals TEXT DEFAULT '[]',
      product_identifiers TEXT DEFAULT '[]',
      detected_language TEXT DEFAULT 'en',
      last_customer_message_text TEXT,
      last_customer_message_at TEXT NOT NULL,
      eligible_at TEXT NOT NULL,
      stage TEXT DEFAULT 'IDENTIFIED',
      state TEXT DEFAULT 'PENDING',
      version INTEGER DEFAULT 1,
      is_control_group INTEGER DEFAULT 0,
      cancel_reason TEXT,
      deduplication_key TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 31. Recovery Attempts (Historical Records of Execution & Delivery)
    CREATE TABLE IF NOT EXISTS recovery_attempts (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      candidate_id TEXT NOT NULL REFERENCES recovery_candidates(id) ON DELETE CASCADE,
      channel TEXT NOT NULL,
      scheduled_at TEXT NOT NULL,
      attempted_at TEXT,
      message_id TEXT,
      outcome TEXT DEFAULT 'PENDING',
      failure_reason TEXT,
      policy_check_result TEXT DEFAULT '{}',
      template_id TEXT,
      generation_model TEXT,
      prompt_tokens INTEGER DEFAULT 0,
      completion_tokens INTEGER DEFAULT 0,
      latency_ms INTEGER DEFAULT 0,
      cost_estimate REAL DEFAULT 0.0,
      message_text TEXT,
      message_hash TEXT,
      provider_response_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 32. Recovery Events (Audit & Lifecycle Trail)
    CREATE TABLE IF NOT EXISTS recovery_events (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      candidate_id TEXT REFERENCES recovery_candidates(id) ON DELETE CASCADE,
      attempt_id TEXT REFERENCES recovery_attempts(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      event_at TEXT DEFAULT (datetime('now')),
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- 33. Recovery Attributions (Verified Order Value Linking)
    CREATE TABLE IF NOT EXISTS recovery_attributions (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      candidate_id TEXT NOT NULL REFERENCES recovery_candidates(id) ON DELETE CASCADE,
      attempt_id TEXT REFERENCES recovery_attempts(id) ON DELETE SET NULL,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      order_value REAL NOT NULL,
      currency TEXT DEFAULT 'USD',
      attributed_at TEXT DEFAULT (datetime('now')),
      attribution_method TEXT DEFAULT 'LAST_TOUCH',
      is_control_group INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(tenant_id, order_id)
    );

    -- 34. Recovery Outbox (Durable Asynchronous Dispatch & Safe Retries)
    CREATE TABLE IF NOT EXISTS recovery_outbox (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
      candidate_id TEXT NOT NULL REFERENCES recovery_candidates(id) ON DELETE CASCADE,
      attempt_id TEXT REFERENCES recovery_attempts(id) ON DELETE CASCADE,
      channel TEXT NOT NULL,
      recipient TEXT NOT NULL,
      status TEXT DEFAULT 'QUEUED',
      idempotency_key TEXT UNIQUE NOT NULL,
      payload TEXT NOT NULL,
      retries INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      last_error TEXT,
      next_retry_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Recovery Indexes for Rapid Execution, Strict Isolation, & Optimistic Concurrency
    CREATE INDEX IF NOT EXISTS idx_recovery_settings_tenant ON recovery_settings(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_candidates_tenant ON recovery_candidates(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_candidates_conv ON recovery_candidates(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_candidates_eligible ON recovery_candidates(eligible_at, stage, state);
    CREATE INDEX IF NOT EXISTS idx_recovery_candidates_customer ON recovery_candidates(customer_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_attempts_candidate ON recovery_attempts(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_attempts_tenant ON recovery_attempts(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_events_candidate ON recovery_events(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_events_tenant ON recovery_events(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_attributions_tenant ON recovery_attributions(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_attributions_candidate ON recovery_attributions(candidate_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_attributions_order ON recovery_attributions(order_id);
    CREATE INDEX IF NOT EXISTS idx_recovery_outbox_status ON recovery_outbox(status, next_retry_at);
    CREATE INDEX IF NOT EXISTS idx_recovery_outbox_idempotency ON recovery_outbox(idempotency_key);
  `);

  logger.info('Database schema and performance indexes verified successfully.');
}

export function seedInitialData(db) {
  // In production, NEVER seed demo tenant, demo users, sample products, fake WhatsApp connections, or sample billing data.
  if (config.isProduction) {
    logger.info('Production mode: skipping demo tenant, demo users, sample data, and fake WhatsApp connections.');
    return;
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  logger.info('Seeding initial baseline development businesses and super-admin credentials...');

  const nowDateObj = new Date();
  const now = nowDateObj.toISOString();

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

  // 2. Hash Passwords with Bcrypt for Dev Environment
  const devSuperAdminPassword = config.auth.superAdminPassword || '12kreazyai12@';
  const superAdminPassHash = bcrypt.hashSync(devSuperAdminPassword, 10);
  const demoUserPassHash = bcrypt.hashSync('demo', 10);

  // 3. Seed Super Admin (Fixed secure server hash)
  db.prepare(`
    INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'usr-superadmin',
    null,
    config.auth.superAdminEmail || 'kreazyai@gmail.com',
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

  // 12. Seed flagship WhatsApp connection & Meta channel (Development only)
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

  // Initialize secondary tenant user & empty connection records
  db.prepare(`
    INSERT OR IGNORE INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'OWNER', 0, ?, ?)
  `).run('usr-artisan', artisanId, 'artisan@copenhagenbotanicals.com', demoUserPassHash, 'Artisan Botanicals Owner', now, now);
  ensureWhatsAppConnection(db, artisanId);
  ensureMetaConnections(db, artisanId, artisanId);

  // Initialize 7-Day Free Trial Wallets (125 credits each)
  ensureCreditWallet(db, flagshipId, now);
  ensureCreditWallet(db, artisanId, now);

  // Initialize baseline Growth Plan subscription and invoice for flagship workspace (Development only)
  ensureBillingData(db, flagshipId, nowDateObj);

  logger.info('Database seeded with baseline development multi-tenant structure, WhatsApp connections, FAQs, and policies.');
}

/**
 * Ensures baseline billing subscription and invoice records exist for a tenant workspace.
 */
export async function ensureBillingData(db, tenantId, now = new Date()) {
  // Only seed baseline billing data for flagship development demo, NEVER for real merchant sign-ups
  if (config.isProduction || tenantId !== 'ws-flagship-01') {
    return;
  }
  try {
    const existingSub = await db.prepare('SELECT * FROM subscriptions WHERE tenant_id = ?').get(tenantId);
    const existingInvoice = await db.prepare('SELECT * FROM billing_invoices WHERE tenant_id = ?').get(tenantId);

    const nowDate = now instanceof Date ? now : new Date(now || Date.now());
    const nowIso = nowDate.toISOString();
    const nextMonth = new Date(nowDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const periodEndIso = nextMonth.toISOString();

    if (!existingSub) {
      await db.prepare(`
        INSERT INTO subscriptions (
          id, tenant_id, plan_id, status, credits_allowance, billing_cycle,
          currency, amount, current_period_start, current_period_end,
          cancel_at_period_end, payment_provider, external_subscription_id,
          created_at, updated_at
        ) VALUES (?, ?, 'growth', 'ACTIVE', 25000, 'MONTHLY', 'USD', 119.00, ?, ?, 0, 'bKash', ?, ?, ?)
        ON CONFLICT(tenant_id) DO NOTHING
      `).run(`sub-${tenantId}`, tenantId, nowIso, periodEndIso, `sub_ext_${Date.now()}`, nowIso, nowIso);
    }

    if (!existingInvoice) {
      const invNum = tenantId === 'ws-flagship-01' ? 'INV-2026-001' : `INV-${nowDate.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.prepare(`
        INSERT INTO billing_invoices (
          id, tenant_id, invoice_number, plan_id, plan_name, amount, currency,
          amount_formatted, status, payment_method, payment_provider, sender_number,
          trx_id, cleared_at, created_at, updated_at
        ) VALUES (?, ?, ?, 'growth', 'Growth Plan', 119.00, 'USD', '$119.00 (৳14,280 BDT)', 'Confirmed', 'bKash 01643792804 (Send money)', 'bKash', '01643792804', 'BL98XJ28K9', ?, ?, ?)
        ON CONFLICT(id) DO NOTHING
      `).run(`inv-${tenantId}-${Date.now()}`, tenantId, invNum, nowIso, nowIso, nowIso);
    }
  } catch (err) {
    logger.warn(`Failed to initialize billing data for tenant ${tenantId}:`, err.message);
  }
}

/**
 * Ensures dedicated WhatsApp connection record exists for a tenant workspace.
 */
export async function ensureWhatsAppConnection(db, tenantId) {
  const id = `waconn-${tenantId}`;
  const nowIso = new Date().toISOString();
  try {
    await db.prepare(`
      INSERT INTO whatsapp_connections (
        id, tenant_id, status, webhook_status, diagnostics, created_at, updated_at
      ) VALUES (?, ?, 'NOT_CONNECTED', 'INACTIVE', '{}', ?, ?)
      ON CONFLICT(tenant_id) DO NOTHING
    `).run(id, tenantId, nowIso, nowIso);
  } catch {
    // safe fallback
  }
}

/**
 * Ensures a 7-Day Free Trial AI Credit Wallet exists for a tenant.
 * Grants 125 trial credits with a 7-day expiration from account creation.
 */
export async function ensureCreditWallet(db, tenantId, createdAt = null) {
  if (!tenantId) return null;
  const existing = await db.prepare('SELECT * FROM ai_credit_wallets WHERE tenant_id = ?').get(tenantId);
  if (existing) return existing;

  const now = new Date();
  const startTime = createdAt ? new Date(createdAt) : now;
  const expiresTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nowIso = now.toISOString();
  const startIso = startTime.toISOString();
  const expiresIso = expiresTime.toISOString();
  const isExpired = now.getTime() > expiresTime.getTime();
  const status = isExpired ? 'TRIAL_EXPIRED' : 'TRIAL_ACTIVE';

  try {
    await db.prepare(`
      INSERT INTO ai_credit_wallets (
        tenant_id, trial_started_at, trial_expires_at, trial_credits_granted,
        credits_balance, credits_reserved, credits_used, successful_replies_count,
        subscription_tier, subscription_status, monthly_credit_allowance,
        created_at, updated_at
      ) VALUES (?, ?, ?, 125, 125, 0, 0, 0, 'FREE_TRIAL', ?, 0, ?, ?)
      ON CONFLICT(tenant_id) DO NOTHING
    `).run(tenantId, startIso, expiresIso, status, nowIso, nowIso);

    // Initial trial grant entry in transaction ledger
    await db.prepare(`
      INSERT INTO credit_transactions (
        id, tenant_id, amount, type, balance_after, reference_id, description, created_at
      ) VALUES (?, ?, 125, 'TRIAL_GRANT', 125, 'TRIAL_INITIAL', 'Welcome 7-Day Free Trial: 125 AI Credits (25 replies max)', ?)
      ON CONFLICT(id) DO NOTHING
    `).run(`ctx-grant-${tenantId}-${Date.now()}`, tenantId, nowIso);

    return await db.prepare('SELECT * FROM ai_credit_wallets WHERE tenant_id = ?').get(tenantId);
  } catch (err) {
    logger.warn(`Failed to initialize credit wallet for tenant ${tenantId}:`, err.message);
    return null;
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

export function ensureSuperAdmin(db) {
  try {
    const now = new Date().toISOString();

    if (config.isProduction) {
      // ── PRODUCTION SECURITY PATH ──
      // In production, NEVER use hardcoded administrator passwords or default accounts.
      const adminEmail = (config.auth?.superAdminEmail || '').trim().toLowerCase();
      const adminPassword = config.auth?.superAdminPassword || '';

      // Check if ANY super admin already exists in the database
      const existingSuperAdmin = db.prepare(`
        SELECT id, email, password_hash, role, is_super_admin 
        FROM users 
        WHERE role = 'SUPER_ADMIN' OR is_super_admin = 1
        LIMIT 1
      `).get();

      if (adminEmail) {
        const existingByEmail = db.prepare(`
          SELECT id, password_hash, role, is_super_admin 
          FROM users 
          WHERE LOWER(email) = ?
        `).get(adminEmail);

        if (existingByEmail) {
          // CRITICAL: NEVER overwrite existing admin passwords on startup!
          if (existingByEmail.role !== 'SUPER_ADMIN' || !existingByEmail.is_super_admin) {
            db.prepare(`
              UPDATE users 
              SET role = 'SUPER_ADMIN', is_super_admin = 1, updated_at = ?
              WHERE id = ?
            `).run(now, existingByEmail.id);
            logger.info(`Promoted existing user ${adminEmail} to SUPER_ADMIN without modifying password.`);
          } else {
            logger.info(`Verified existing production super-admin account: ${adminEmail} (credentials unchanged).`);
          }
          return;
        }

        // Admin email does not exist in DB yet -> Initial bootstrap
        if (!adminPassword) {
          logger.warn(`SUPER_ADMIN_EMAIL is set (${adminEmail}), but SUPER_ADMIN_PASSWORD is empty. Skipping initial admin seeding.`);
          return;
        }

        if (adminPassword.length < 12) {
          logger.error('SUPER_ADMIN_PASSWORD must be at least 12 characters in production. Skipping initial admin seeding.');
          return;
        }

        const hash = bcrypt.hashSync(adminPassword, 12);
        const adminId = `usr-admin-${Date.now()}`;
        db.prepare(`
          INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
          VALUES (?, null, ?, ?, 'Kreazy Super Administrator', 'SUPER_ADMIN', 1, ?, ?)
        `).run(adminId, adminEmail, hash, now, now);
        logger.info(`Successfully bootstrapped initial production super-admin: ${adminEmail}`);
      } else if (!existingSuperAdmin) {
        logger.warn('No SUPER_ADMIN user exists in production database and SUPER_ADMIN_EMAIL is not set in environment.');
      }
      return;
    }

    // ── DEVELOPMENT & TEST PATH ──
    // Preserves existing development and test behavior
    const envAdminEmail = (config.auth?.superAdminEmail || '').trim().toLowerCase();
    const envAdminPassword = config.auth?.superAdminPassword || '';

    const targetAdmins = [];

    if (config.isTest) {
      targetAdmins.push({
        id: 'usr-superadmin',
        email: 'kreazyai@gmail.com',
        name: 'Kreazy Platform Administrator',
        password: envAdminPassword || '12kreazyai12@'
      });
    } else {
      targetAdmins.push({
        id: 'usr-dev-superadmin',
        email: 'admin@kreazyai.com',
        name: 'Kreazy Super Administrator',
        password: envAdminPassword || 'KreazyAI_Admin_2026!'
      });
      targetAdmins.push({
        id: 'usr-superadmin',
        email: 'kreazyai@gmail.com',
        name: 'Kreazy Platform Administrator',
        password: envAdminPassword || '12kreazyai12@'
      });
    }

    if (envAdminEmail && !targetAdmins.some(a => a.email.toLowerCase() === envAdminEmail)) {
      targetAdmins.push({
        id: 'usr-env-superadmin',
        email: envAdminEmail,
        name: 'Kreazy System Administrator',
        password: envAdminPassword || 'KreazyAI_Admin_2026!'
      });
    }

    for (const target of targetAdmins) {
      const existing = db.prepare('SELECT id, password_hash, role, is_super_admin FROM users WHERE LOWER(email) = ?').get(target.email.toLowerCase());

      if (!existing) {
        // Only seed password when creating a new account in dev/test!
        const hash = bcrypt.hashSync(target.password, 10);
        const idCollision = db.prepare('SELECT id FROM users WHERE id = ?').get(target.id);
        const finalId = idCollision ? `${target.id}-${Date.now()}` : target.id;
        db.prepare(`
          INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
          VALUES (?, null, ?, ?, ?, 'SUPER_ADMIN', 1, ?, ?)
        `).run(finalId, target.email.toLowerCase(), hash, target.name, now, now);
        logger.info(`Seeded development super-admin account: ${target.email}`);
      } else {
        // User already exists! CRITICAL: NEVER OVERWRITE PASSWORD HASH!
        if (existing.role !== 'SUPER_ADMIN' || !existing.is_super_admin) {
          db.prepare(`
            UPDATE users 
            SET role = 'SUPER_ADMIN', is_super_admin = 1, updated_at = ?
            WHERE id = ?
          `).run(now, existing.id);
          logger.info(`Synchronized super-admin role for ${target.email} (password preserved).`);
        }
      }
    }
  } catch (err) {
    logger.warn('Failed to ensure super admin account:', err.message);
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


