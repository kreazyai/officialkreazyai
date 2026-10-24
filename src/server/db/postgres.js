import pg from 'pg';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// ── Type Parser Configuration ────────────────────────────────────────────────
// Return timestamps, dates, and numbers in identical formats to SQLite for 100% frontend compatibility
pg.types.setTypeParser(1114, str => str); // timestamp without time zone -> ISO string
pg.types.setTypeParser(1184, str => str); // timestamp with time zone -> ISO string
pg.types.setTypeParser(1082, str => str); // date -> ISO date string
pg.types.setTypeParser(1700, str => (str === null ? null : parseFloat(str))); // numeric / decimal -> float
pg.types.setTypeParser(20, str => (str === null ? null : parseInt(str, 10))); // int8 / bigint -> integer

let pgPoolInstance = null;

/**
 * Returns or initializes the PostgreSQL connection pool using POSTGRES_URL.
 * Configured with connection pooling, keep-alive, and Neon-compatible SSL.
 * @param {string} [connectionString=null]
 * @returns {import('pg').Pool}
 */
export function getPostgresPool(connectionString = null) {
  if (pgPoolInstance) return pgPoolInstance;

  const connStr = (connectionString || process.env.POSTGRES_URL || config.database?.postgresUrl || '').trim();
  if (!connStr) {
    throw new Error('POSTGRES_URL environment variable is required to initialize PostgreSQL connection pool.');
  }

  // Neon connections require SSL. If url has sslmode=require or points to neon.tech or is production:
  const isNeon = connStr.includes('neon.tech') || connStr.includes('sslmode=require');
  const useSsl = isNeon || config.isProduction || process.env.PGSSLMODE === 'require';

  const sslConfig = useSsl ? { rejectUnauthorized: false } : false;

  logger.info(`Initializing Neon-compatible PostgreSQL connection pool (SSL: ${Boolean(sslConfig)})...`);

  pgPoolInstance = new Pool({
    connectionString: connStr,
    ssl: sslConfig,
    max: parseInt(process.env.PG_POOL_MAX || '20', 10),
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT_MS || '10000', 10)
  });

  pgPoolInstance.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL pool client:', err.message);
  });

  return pgPoolInstance;
}

/**
 * Closes the PostgreSQL connection pool gracefully.
 */
export async function closePostgresPool() {
  if (pgPoolInstance) {
    try {
      await pgPoolInstance.end();
      logger.info('PostgreSQL connection pool closed.');
    } catch (err) {
      logger.warn('Error closing PostgreSQL pool:', err.message);
    }
    pgPoolInstance = null;
  }
}

/**
 * Translates SQLite dialect SQL into PostgreSQL dialect SQL:
 * - Translates ? parameter placeholders to $1, $2, $3... (respecting string literals)
 * - Translates datetime('now') -> NOW()
 * - Translates datetime('now', '-X days') -> (NOW() - INTERVAL 'X days')
 * - Translates json_object(...) -> json_build_object(...)
 * - Translates INSERT OR IGNORE INTO -> INSERT INTO ... ON CONFLICT DO NOTHING
 * @param {string} sql
 * @returns {string}
 */
export function translateSqlForPostgres(sql) {
  if (!sql || typeof sql !== 'string') return sql;

  let translated = sql.trim();

  // 1. Handle INSERT OR IGNORE
  const hadIgnore = /INSERT\s+OR\s+IGNORE\s+INTO/i.test(translated);
  if (hadIgnore) {
    translated = translated.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
  }

  // 2. Handle SQLite relative date calculations & strftime
  translated = translated.replace(/datetime\('now',\s*'-(\d+)\s+days?'\)/gi, "(NOW() - INTERVAL '$1 days')");
  translated = translated.replace(/datetime\('now'\)/gi, 'NOW()');
  translated = translated.replace(/\(datetime\('now'\)\)/gi, 'NOW()');
  translated = translated.replace(/date\('now'\)/gi, 'CURRENT_DATE');
  translated = translated.replace(/strftime\('%s',\s*'now'\)/gi, 'EXTRACT(EPOCH FROM NOW())::bigint');
  translated = translated.replace(/CAST\s*\(\s*strftime\('%s',\s*([^)]+)\)\s*AS\s+INTEGER\s*\)/gi, 'CAST(EXTRACT(EPOCH FROM ($1)::timestamptz) AS INTEGER)');
  translated = translated.replace(/strftime\('%s',\s*([^)]+)\)/gi, 'EXTRACT(EPOCH FROM ($1)::timestamptz)');

  // 3. Handle json_object -> json_build_object and rowid -> id
  translated = translated.replace(/\bjson_object\(/gi, 'json_build_object(');
  translated = translated.replace(/\.rowid\b/gi, '.id');

  // 4. Parameter substitution: Replace ? with $1, $2, ... while ignoring quotes
  let paramIdx = 1;
  let inString = false;
  let quoteChar = '';
  let result = '';

  for (let i = 0; i < translated.length; i++) {
    const char = translated[i];
    if (!inString && (char === "'" || char === '"')) {
      inString = true;
      quoteChar = char;
      result += char;
    } else if (inString && char === quoteChar) {
      if (translated[i + 1] === quoteChar) {
        result += char + quoteChar;
        i++;
      } else {
        inString = false;
        result += char;
      }
    } else if (!inString && char === '?') {
      result += `$${paramIdx++}`;
    } else {
      result += char;
    }
  }

  // 5. If query had INSERT OR IGNORE and does not yet contain ON CONFLICT, append ON CONFLICT DO NOTHING
  if (hadIgnore && !/ON\s+CONFLICT/i.test(result)) {
    result += ' ON CONFLICT DO NOTHING';
  }

  return result;
}

/**
 * Normalizes query parameters into a flat array.
 * @param {any[]} params
 * @returns {any[]}
 */
export function normalizeParams(params) {
  if (!params || params.length === 0) return [];
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0];
  }
  return params;
}

/**
 * PostgreSQL Statement Wrapper mimicking better-sqlite3 API while using pg.Pool.
 * Enables drop-in compatibility for existing backend queries.
 */
export class PostgresPreparedStatement {
  constructor(pool, rawSql) {
    this.pool = pool;
    this.rawSql = rawSql;
    this.translatedSql = translateSqlForPostgres(rawSql);
  }

  /**
   * Executes query and returns single row or undefined.
   * @param  {...any} args
   * @returns {Promise<any|undefined>}
   */
  async get(...args) {
    const params = normalizeParams(args);
    const result = await this.pool.query(this.translatedSql, params);
    return result.rows && result.rows.length > 0 ? result.rows[0] : undefined;
  }

  /**
   * Executes query and returns all matching rows as an array.
   * @param  {...any} args
   * @returns {Promise<any[]>}
   */
  async all(...args) {
    const params = normalizeParams(args);
    const result = await this.pool.query(this.translatedSql, params);
    return result.rows || [];
  }

  /**
   * Executes INSERT/UPDATE/DELETE query and returns changes / rowCount.
   * @param  {...any} args
   * @returns {Promise<{ changes: number, rowCount: number }>}
   */
  async run(...args) {
    const params = normalizeParams(args);
    const result = await this.pool.query(this.translatedSql, params);
    const changes = result.rowCount !== null && result.rowCount !== undefined ? result.rowCount : 0;
    return { changes, rowCount: changes };
  }
}

/**
 * PostgreSQL Database Adapter implementing unified interface.
 */
export class PostgresDatabaseAdapter {
  constructor(pool) {
    this.pool = pool;
    this.isPostgres = true;
  }

  /**
   * Creates a prepared statement for execution.
   * @param {string} sql
   * @returns {PostgresPreparedStatement}
   */
  prepare(sql) {
    return new PostgresPreparedStatement(this.pool, sql);
  }

  /**
   * Direct query execution returning full pg Result.
   * @param {string} sql
   * @param {any[]} [params=[]]
   */
  async query(sql, params = []) {
    const translated = translateSqlForPostgres(sql);
    return await this.pool.query(translated, normalizeParams(params));
  }

  /**
   * Executes query and returns single row or null.
   * @param {string} sql
   * @param {any[]} [params=[]]
   */
  async queryOne(sql, params = []) {
    const res = await this.query(sql, params);
    return res.rows && res.rows.length > 0 ? res.rows[0] : null;
  }

  /**
   * Executes query and returns array of rows.
   * @param {string} sql
   * @param {any[]} [params=[]]
   */
  async queryAll(sql, params = []) {
    const res = await this.query(sql, params);
    return res.rows || [];
  }

  /**
   * Executes command and returns rowCount.
   * @param {string} sql
   * @param {any[]} [params=[]]
   */
  async execute(sql, params = []) {
    const res = await this.query(sql, params);
    return { changes: res.rowCount || 0, rowCount: res.rowCount || 0 };
  }

  /**
   * Executes multiple SQL statements sequentially (DDL scripts).
   * @param {string} sql
   */
  async exec(sql) {
    return await this.pool.query(sql);
  }

  /**
   * Executes callback within a PostgreSQL transaction (BEGIN ... COMMIT/ROLLBACK).
   * Supports both `await db.transaction(fn)` and `const tx = db.transaction(fn); await tx();`
   * @param {function(PostgresDatabaseAdapter): Promise<any>} callback
   */
  transaction(callback) {
    const runner = async (...args) => {
      const client = await this.pool.connect();
      const trxAdapter = new PostgresDatabaseAdapter(client);
      try {
        await client.query('BEGIN');
        const result = await callback(trxAdapter, ...args);
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    };

    runner.then = (onFulfilled, onRejected) => {
      return runner().then(onFulfilled, onRejected);
    };
    runner.catch = (onRejected) => {
      return runner().catch(onRejected);
    };
    return runner;
  }

  /**
   * Closes the connection pool.
   */
  async close() {
    await closePostgresPool();
  }
}

// ── Complete PostgreSQL Schema Definition ────────────────────────────────────

export const POSTGRES_TABLES_ORDERED = Object.freeze([
  'businesses',
  'users',
  'user_profiles',
  'business_profiles',
  'kyc_profiles',
  'kyc_documents',
  'kyc_submissions',
  'notification_preferences',
  'api_keys',
  'team_members',
  'ai_configs',
  'ai_settings',
  'audit_logs',
  'demo_bookings',
  'founder_meetings',
  'contact_inquiries',
  'meta_connections',
  'meta_webhook_events',
  'whatsapp_connections',
  'integration_health',
  'whatsapp_onboarding_sessions',
  'ai_credit_wallets',
  'credit_transactions',
  'subscriptions',
  'payment_events',
  'billing_invoices',
  'products',
  'product_media',
  'faqs',
  'policies',
  'knowledge_items',
  'customers',
  'orders',
  'order_items',
  'conversations',
  'messages',
  'recovery_settings',
  'recovery_candidates',
  'recovery_attempts',
  'recovery_events',
  'recovery_attributions',
  'recovery_outbox'
]);

export const POSTGRES_SCHEMA_SQL = `
-- 1. Businesses / Multi-Tenant Workspaces
CREATE TABLE IF NOT EXISTS businesses (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'Growth',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  channels_connected TEXT DEFAULT '[]',
  total_revenue NUMERIC(12, 2) DEFAULT 0.0,
  ai_credits_used INTEGER DEFAULT 0,
  ai_credits_limit INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users (Bcrypt Passwords & Server RBAC)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) REFERENCES businesses(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'OWNER',
  is_super_admin INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255),
  sku VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  stock INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'IN_STOCK',
  variants TEXT DEFAULT '[]',
  attributes TEXT DEFAULT '{}',
  image_url TEXT,
  ai_knowledge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, sku)
);

-- 4. Customers (CRM)
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  external_customer_id VARCHAR(255),
  customer_status VARCHAR(50) DEFAULT 'ACTIVE',
  customer_type VARCHAR(50) DEFAULT 'REGULAR',
  source VARCHAR(50) DEFAULT 'DIRECT',
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(12, 2) DEFAULT 0.0,
  contacts TEXT DEFAULT '[]',
  addresses TEXT DEFAULT '[]',
  social_accounts TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  notes TEXT DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id VARCHAR(255) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'CONFIRMED',
  channel VARCHAR(50) DEFAULT 'DIRECT',
  subtotal NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(12, 2) DEFAULT 0.0,
  total NUMERIC(12, 2) NOT NULL,
  shipping_address TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL
);

-- 7. Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255),
  customer_id VARCHAR(255) REFERENCES customers(id) ON DELETE SET NULL,
  external_conversation_id VARCHAR(255),
  customer_name VARCHAR(255) NOT NULL,
  customer_avatar TEXT,
  channel VARCHAR(50) DEFAULT 'WHATSAPP',
  unread INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  last_message_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Messages
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  tenant_id VARCHAR(255),
  sender VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  text TEXT NOT NULL,
  is_ai INTEGER DEFAULT 0,
  channel VARCHAR(50) DEFAULT 'WHATSAPP',
  direction VARCHAR(50) DEFAULT 'INBOUND',
  message_type VARCHAR(50) DEFAULT 'text',
  media_reference TEXT,
  external_message_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'DELIVERED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Public Demo Bookings
CREATE TABLE IF NOT EXISTS demo_bookings (
  id VARCHAR(255) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  work_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(255) NOT NULL,
  company_size VARCHAR(100),
  primary_use_case TEXT,
  preferred_date VARCHAR(50),
  preferred_time VARCHAR(50),
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Public Founder Meetings
CREATE TABLE IF NOT EXISTS founder_meetings (
  id VARCHAR(255) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  stage VARCHAR(100),
  monthly_revenue VARCHAR(100),
  automation_need TEXT,
  preferred_slot VARCHAR(100),
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Contact Inquiries
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Configurations
CREATE TABLE IF NOT EXISTS ai_configs (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  assistant_name VARCHAR(255) DEFAULT 'Kreazy AI Assistant',
  brand_voice TEXT DEFAULT 'Professional, concise, courteous',
  return_days VARCHAR(50) DEFAULT '14',
  return_policy TEXT DEFAULT 'Exchanges within 14 days of receipt on unused items with tags attached.',
  shipping_info TEXT DEFAULT 'Standard shipping 2-4 business days. Free over $75.',
  max_discount NUMERIC(5, 2) DEFAULT 10.0,
  auto_reply_enabled INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255),
  actor_email VARCHAR(255),
  actor_role VARCHAR(50),
  action VARCHAR(255) NOT NULL,
  resource VARCHAR(255),
  resource_id VARCHAR(255),
  details TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth VARCHAR(50),
  gender VARCHAR(50),
  avatar_path TEXT,
  avatar_url TEXT,
  email_verified INTEGER DEFAULT 0,
  phone_verified INTEGER DEFAULT 0,
  last_password_changed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Business Profiles
CREATE TABLE IF NOT EXISTS business_profiles (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  legal_name VARCHAR(255),
  business_type VARCHAR(100),
  business_category VARCHAR(100),
  business_description TEXT,
  website VARCHAR(255),
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  postal_code VARCHAR(50),
  base_currency VARCHAR(10) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'UTC',
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  trade_license VARCHAR(100),
  vat_number VARCHAR(100),
  date_of_incorporation VARCHAR(50),
  country_of_registration VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. KYC Profiles
CREATE TABLE IF NOT EXISTS kyc_profiles (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'NOT_STARTED',
  full_legal_name VARCHAR(255),
  date_of_birth VARCHAR(50),
  nationality VARCHAR(100),
  country_of_residence VARCHAR(100),
  residential_address TEXT,
  phone VARCHAR(50),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  step_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. KYC Documents
CREATE TABLE IF NOT EXISTS kyc_documents (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  doc_type VARCHAR(100) NOT NULL,
  original_name VARCHAR(255),
  stored_name VARCHAR(255) NOT NULL,
  stored_path TEXT NOT NULL,
  mime_type VARCHAR(100),
  file_size INTEGER,
  status VARCHAR(50) DEFAULT 'UPLOADED',
  review_status VARCHAR(50) DEFAULT 'PENDING',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. KYC Submissions
CREATE TABLE IF NOT EXISTS kyc_submissions (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'UNDER_REVIEW',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

-- 19. Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_notifications INTEGER DEFAULT 1,
  ai_notifications INTEGER DEFAULT 1,
  automation_failures INTEGER DEFAULT 1,
  integration_alerts INTEGER DEFAULT 1,
  security_alerts INTEGER DEFAULT 1,
  marketing_emails INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(50) NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at TIMESTAMPTZ,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

-- 21. Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'MEMBER',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ
);

-- 22. Meta Connections
CREATE TABLE IF NOT EXISTS meta_connections (
  id VARCHAR(255) PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  workspace_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'NOT_CONNECTED',
  meta_user_id VARCHAR(255),
  business_account_id VARCHAR(255),
  page_id VARCHAR(255),
  page_name VARCHAR(255),
  instagram_account_id VARCHAR(255),
  instagram_username VARCHAR(255),
  whatsapp_business_account_id VARCHAR(255),
  phone_number_id VARCHAR(255),
  display_phone_number VARCHAR(100),
  encrypted_access_token TEXT,
  token_iv VARCHAR(100),
  token_tag VARCHAR(100),
  token_expires_at TIMESTAMPTZ,
  scopes TEXT DEFAULT '[]',
  webhook_status VARCHAR(50) DEFAULT 'INACTIVE',
  last_webhook_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  diagnostics TEXT DEFAULT '{}',
  auto_reply_enabled INTEGER DEFAULT 1,
  ai_confidence_threshold NUMERIC(5, 2) DEFAULT 0.75,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, platform)
);

-- 23. Meta Webhook Events
CREATE TABLE IF NOT EXISTS meta_webhook_events (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(50) NOT NULL,
  business_id VARCHAR(255),
  payload TEXT NOT NULL,
  processed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. WhatsApp Connections
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  waba_id VARCHAR(255),
  phone_number_id VARCHAR(255),
  display_number VARCHAR(100),
  display_phone VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'NOT_CONNECTED',
  credential_reference VARCHAR(255),
  webhook_status VARCHAR(50) DEFAULT 'INACTIVE',
  last_event_at TIMESTAMPTZ,
  last_webhook_event TEXT,
  last_api_check TIMESTAMPTZ,
  last_error TEXT,
  diagnostics TEXT DEFAULT '{}',
  auto_reply_enabled INTEGER DEFAULT 1,
  ai_confidence_threshold NUMERIC(5, 2) DEFAULT 0.75,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- 25. Integration Health
CREATE TABLE IF NOT EXISTS integration_health (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL DEFAULT 'WHATSAPP',
  status VARCHAR(50) NOT NULL,
  diagnostics TEXT DEFAULT '{}',
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. Product Media
CREATE TABLE IF NOT EXISTS product_media (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(50) DEFAULT 'image',
  metadata TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'General',
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. Policies
CREATE TABLE IF NOT EXISTS policies (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  policy_type VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 29. Knowledge Items
CREATE TABLE IF NOT EXISTS knowledge_items (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  source_type VARCHAR(100) NOT NULL,
  source_id VARCHAR(255),
  chunk_reference TEXT NOT NULL,
  embedding_reference TEXT,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. AI Settings
CREATE TABLE IF NOT EXISTS ai_settings (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  system_instructions TEXT,
  tone VARCHAR(50) DEFAULT 'professional',
  language_settings TEXT DEFAULT '["bn","en","banglish"]',
  confidence_threshold NUMERIC(5, 2) DEFAULT 0.75,
  handoff_rules TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 31. WhatsApp Onboarding Sessions
CREATE TABLE IF NOT EXISTS whatsapp_onboarding_sessions (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  state_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'INITIATED',
  waba_id VARCHAR(255),
  phone_number_id VARCHAR(255),
  error_message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 32. AI Credit Wallets
CREATE TABLE IF NOT EXISTS ai_credit_wallets (
  tenant_id VARCHAR(255) PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  trial_started_at TIMESTAMPTZ NOT NULL,
  trial_expires_at TIMESTAMPTZ NOT NULL,
  trial_credits_granted INTEGER DEFAULT 125,
  credits_balance INTEGER DEFAULT 125,
  credits_reserved INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  successful_replies_count INTEGER DEFAULT 0,
  subscription_tier VARCHAR(50) DEFAULT 'FREE_TRIAL',
  subscription_status VARCHAR(50) DEFAULT 'TRIAL_ACTIVE',
  monthly_credit_allowance INTEGER DEFAULT 0,
  subscription_renews_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 33. Credit Transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL,
  balance_after INTEGER NOT NULL,
  reference_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 34. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  credits_allowance INTEGER NOT NULL,
  billing_cycle VARCHAR(50) DEFAULT 'MONTHLY',
  currency VARCHAR(10) DEFAULT 'USD',
  amount NUMERIC(12, 2) DEFAULT 0.0,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end INTEGER DEFAULT 0,
  payment_provider VARCHAR(50) DEFAULT 'INTERNAL',
  external_subscription_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 35. Payment Events
CREATE TABLE IF NOT EXISTS payment_events (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  tenant_id VARCHAR(255),
  payload TEXT NOT NULL,
  processed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 36. Billing Invoices
CREATE TABLE IF NOT EXISTS billing_invoices (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  amount_formatted VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
  payment_method VARCHAR(100) NOT NULL,
  payment_provider VARCHAR(50) NOT NULL DEFAULT 'bKash',
  sender_number VARCHAR(50),
  trx_id VARCHAR(100),
  screenshot_url TEXT,
  cleared_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 37. Recovery Settings
CREATE TABLE IF NOT EXISTS recovery_settings (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) UNIQUE NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  enabled INTEGER DEFAULT 0,
  dry_run INTEGER DEFAULT 1,
  channels TEXT DEFAULT '{"whatsapp":true,"messenger":false,"instagram":false}',
  min_intent_score NUMERIC(5, 2) DEFAULT 0.70,
  inactivity_minutes INTEGER DEFAULT 30,
  quiet_hours_enabled INTEGER DEFAULT 1,
  quiet_hours_start VARCHAR(10) DEFAULT '22:00',
  quiet_hours_end VARCHAR(10) DEFAULT '08:00',
  timezone VARCHAR(50) DEFAULT 'Asia/Dhaka',
  max_daily_attempts_per_lead INTEGER DEFAULT 2,
  max_daily_tenant_attempts INTEGER DEFAULT 100,
  consent_policy VARCHAR(50) DEFAULT 'EXPLICIT_OR_24H',
  model_provider VARCHAR(50) DEFAULT 'local_ollama',
  model_name VARCHAR(100) DEFAULT 'qwen3:1.7b',
  max_tokens INTEGER DEFAULT 150,
  temperature NUMERIC(5, 2) DEFAULT 0.3,
  discount_offer_percent NUMERIC(5, 2) DEFAULT 0.0,
  control_group_ratio NUMERIC(5, 2) DEFAULT 0.1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 38. Recovery Candidates
CREATE TABLE IF NOT EXISTS recovery_candidates (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  channel VARCHAR(50) DEFAULT 'WHATSAPP',
  customer_id VARCHAR(255) REFERENCES customers(id) ON DELETE SET NULL,
  intent_score NUMERIC(5, 2) NOT NULL,
  intent_category VARCHAR(100) NOT NULL,
  intent_reason TEXT,
  buying_signals TEXT DEFAULT '[]',
  product_identifiers TEXT DEFAULT '[]',
  detected_language VARCHAR(20) DEFAULT 'en',
  last_customer_message_text TEXT,
  last_customer_message_at TIMESTAMPTZ NOT NULL,
  eligible_at TIMESTAMPTZ NOT NULL,
  stage VARCHAR(50) DEFAULT 'IDENTIFIED',
  state VARCHAR(50) DEFAULT 'PENDING',
  version INTEGER DEFAULT 1,
  is_control_group INTEGER DEFAULT 0,
  cancel_reason TEXT,
  deduplication_key VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 39. Recovery Attempts
CREATE TABLE IF NOT EXISTS recovery_attempts (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  candidate_id VARCHAR(255) NOT NULL REFERENCES recovery_candidates(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  attempted_at TIMESTAMPTZ,
  message_id VARCHAR(255),
  outcome VARCHAR(50) DEFAULT 'PENDING',
  failure_reason TEXT,
  policy_check_result TEXT DEFAULT '{}',
  template_id VARCHAR(100),
  generation_model VARCHAR(100),
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  cost_estimate NUMERIC(10, 4) DEFAULT 0.0,
  message_text TEXT,
  message_hash VARCHAR(255),
  provider_response_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 40. Recovery Events
CREATE TABLE IF NOT EXISTS recovery_events (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  candidate_id VARCHAR(255) REFERENCES recovery_candidates(id) ON DELETE CASCADE,
  attempt_id VARCHAR(255) REFERENCES recovery_attempts(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_at TIMESTAMPTZ DEFAULT NOW(),
  metadata TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 41. Recovery Attributions
CREATE TABLE IF NOT EXISTS recovery_attributions (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  candidate_id VARCHAR(255) NOT NULL REFERENCES recovery_candidates(id) ON DELETE CASCADE,
  attempt_id VARCHAR(255) REFERENCES recovery_attempts(id) ON DELETE SET NULL,
  order_id VARCHAR(255) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_value NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  attributed_at TIMESTAMPTZ DEFAULT NOW(),
  attribution_method VARCHAR(50) DEFAULT 'LAST_TOUCH',
  is_control_group INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, order_id)
);

-- 42. Recovery Outbox
CREATE TABLE IF NOT EXISTS recovery_outbox (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  candidate_id VARCHAR(255) NOT NULL REFERENCES recovery_candidates(id) ON DELETE CASCADE,
  attempt_id VARCHAR(255) REFERENCES recovery_attempts(id) ON DELETE CASCADE,
  channel VARCHAR(50) NOT NULL,
  recipient VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'QUEUED',
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  payload TEXT NOT NULL,
  retries INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multi-Tenant & Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_business ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_business ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_business ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_biz ON users(business_id);
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
CREATE INDEX IF NOT EXISTS idx_wa_conn_tenant ON whatsapp_connections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wa_conn_phone ON whatsapp_connections(phone_number_id);
CREATE INDEX IF NOT EXISTS idx_product_media_tenant ON product_media(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_media_prod ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_faqs_tenant ON faqs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policies_tenant ON policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_tenant ON knowledge_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_settings_tenant ON ai_settings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_state ON whatsapp_onboarding_sessions(state_token);
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_tenant ON whatsapp_onboarding_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_wallets_tenant ON ai_credit_wallets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_tenant ON credit_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_ref ON credit_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_id ON payment_events(event_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_tenant ON billing_invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_num ON billing_invoices(invoice_number);
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

-- Multi-Tenant View Contracts
CREATE OR REPLACE VIEW tenants AS
SELECT 
  id, 
  name AS business_name, 
  status, 
  'UTC' AS timezone, 
  json_build_object('channels', channels_connected, 'plan', plan) AS settings,
  created_at,
  updated_at
FROM businesses;

CREATE OR REPLACE VIEW webhook_events AS
SELECT 
  id, 
  event_id, 
  platform, 
  business_id AS tenant_id, 
  payload, 
  processed, 
  created_at 
FROM meta_webhook_events;
`;

/**
 * Executes complete PostgreSQL schema migrations.
 * @param {import('pg').Pool|PostgresDatabaseAdapter} poolOrAdapter
 */
export async function runPostgresMigrations(poolOrAdapter) {
  logger.info('Verifying and executing PostgreSQL schema migrations...');
  const pool = poolOrAdapter.pool || poolOrAdapter;
  await pool.query(POSTGRES_SCHEMA_SQL);
  logger.info('PostgreSQL schema, indexes, and views verified successfully.');
}

/**
 * Ensures Super Admin account exists in PostgreSQL without overwriting credentials.
 * @param {import('pg').Pool|PostgresDatabaseAdapter} poolOrAdapter
 */
export async function ensurePostgresSuperAdmin(poolOrAdapter) {
  const pool = poolOrAdapter.pool || poolOrAdapter;
  try {
    const now = new Date().toISOString();
    const adminEmail = (config.auth?.superAdminEmail || '').trim().toLowerCase();
    const adminPassword = config.auth?.superAdminPassword || '';

    const existingRes = await pool.query(
      "SELECT id, email, password_hash, role, is_super_admin FROM users WHERE role = 'SUPER_ADMIN' OR is_super_admin = 1 LIMIT 1"
    );
    const existingSuperAdmin = existingRes.rows[0];

    if (config.isProduction) {
      if (adminEmail) {
        const userByEmailRes = await pool.query("SELECT id, role, is_super_admin FROM users WHERE LOWER(email) = $1", [adminEmail]);
        const existingByEmail = userByEmailRes.rows[0];

        if (existingByEmail) {
          if (existingByEmail.role !== 'SUPER_ADMIN' || !existingByEmail.is_super_admin) {
            await pool.query(
              "UPDATE users SET role = 'SUPER_ADMIN', is_super_admin = 1, updated_at = $1 WHERE id = $2",
              [now, existingByEmail.id]
            );
            logger.info(`Promoted existing user ${adminEmail} to SUPER_ADMIN in PostgreSQL.`);
          }
          return;
        }

        if (!adminPassword || adminPassword.length < 12) {
          logger.warn('Skipping initial admin seeding in PostgreSQL: invalid or missing password.');
          return;
        }

        const hash = bcrypt.hashSync(adminPassword, 12);
        const adminId = `usr-admin-${Date.now()}`;
        await pool.query(
          `INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
           VALUES ($1, NULL, $2, $3, 'Kreazy Super Administrator', 'SUPER_ADMIN', 1, $4, $5)
           ON CONFLICT (email) DO NOTHING`,
          [adminId, adminEmail, hash, now, now]
        );
        logger.info(`Successfully bootstrapped initial production super-admin in PostgreSQL: ${adminEmail}`);
      }
      return;
    }

    // Dev/Test Super Admin
    const targetEmail = adminEmail || 'admin@kreazyai.com';
    const targetPass = adminPassword || 'KreazyAI_Admin_2026!';
    const userRes = await pool.query("SELECT id FROM users WHERE LOWER(email) = $1", [targetEmail]);

    if (!userRes.rows || userRes.rows.length === 0) {
      const hash = bcrypt.hashSync(targetPass, 10);
      const adminId = `usr-dev-superadmin-${Date.now()}`;
      await pool.query(
        `INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
         VALUES ($1, NULL, $2, $3, 'Kreazy Super Administrator', 'SUPER_ADMIN', 1, $4, $5)
         ON CONFLICT (email) DO NOTHING`,
        [adminId, targetEmail, hash, now, now]
      );
      logger.info(`Seeded development super-admin in PostgreSQL: ${targetEmail}`);
    }
  } catch (err) {
    logger.warn('Failed to ensure super admin in PostgreSQL:', err.message);
  }
}
