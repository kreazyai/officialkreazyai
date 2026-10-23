import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const INSECURE_DEFAULT_SECRETS = Object.freeze([
  'kreazy_production_fallback_jwt_secret_min32char_2026',
  'kreazy_ai_production_jwt_secret_key_32_bytes_min_2026!',
  'kreazy_meta_aes_256_secret_key_32b_2026',
  'kreazy_meta_webhook_verification_token_2026',
  'kreazy_production_fallback_aes_key_32b_2026',
  'kreazy_dev_jwt_secret_min32char_key_2026',
  'kreazy_dev_aes_256_secret_key_32b_2026',
  '12kreazyai12@',
  'KreazyAI_Admin_2026!',
  'password',
  'admin',
  'secret',
  'changeme',
  '123456',
  '12345678'
]);

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDev = nodeEnv === 'development';
const isTest = nodeEnv === 'test';

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv,
  isDev,
  isProduction,
  isTest,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map(o => o.trim()),

  database: {
    url: process.env.DATABASE_URL || './data/kreazy.db'
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || (isProduction ? '' : 'kreazy_dev_jwt_secret_min32char_key_2026'),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL || (isProduction ? '' : 'admin@kreazyai.com'),
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || (isProduction ? '' : (isTest ? '12kreazyai12@' : 'KreazyAI_Admin_2026!'))
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'heuristic',
    geminiKey: process.env.GEMINI_API_KEY || '',
    openAiKey: process.env.OPENAI_API_KEY || '',
    modelName: process.env.AI_MODEL_NAME || 'gemini-2.0-flash',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'qwen3:1.7b',
    ollamaTimeoutMs: parseInt(process.env.OLLAMA_TIMEOUT_MS || '120000', 10)
  },

  meta: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || (isProduction ? '' : 'kreazy_meta_webhook_verification_token_2026'),
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
    wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || '',
    redirectUri: process.env.META_REDIRECT_URI || 'http://localhost:5000/api/v1/meta/oauth/callback',
    apiBaseUrl: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v21.0',
    encryptionKey: process.env.META_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || (isProduction ? '' : 'kreazy_dev_aes_256_secret_key_32b_2026'),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  whatsapp: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || (isProduction ? '' : 'kreazy_meta_webhook_verification_token_2026'),
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
    wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || '',
    apiBaseUrl: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v21.0',
    redirectUri: process.env.META_REDIRECT_URI || 'http://localhost:5000/api/v1/meta/oauth/callback'
  },

  messenger: {
    pageId: process.env.MESSENGER_PAGE_ID || '',
    pageAccessToken: process.env.MESSENGER_PAGE_ACCESS_TOKEN || '',
    tenantId: process.env.MESSENGER_TENANT_ID || ''
  }
};

/**
 * Validates the WhatsApp configuration without exposing secrets
 * @returns {{ isConfigured: boolean, hasAppId: boolean, hasAppSecret: boolean, hasAccessToken: boolean, hasPhoneNumberId: boolean, hasWabaId: boolean, hasVerifyToken: boolean }}
 */
export function validateWhatsAppConfig() {
  const meta = config.meta;
  const hasAppId = Boolean(meta.appId);
  const hasAppSecret = Boolean(meta.appSecret);
  const hasAccessToken = Boolean(meta.accessToken);
  const hasPhoneNumberId = Boolean(meta.phoneNumberId);
  const hasWabaId = Boolean(meta.wabaId);
  const hasVerifyToken = Boolean(meta.verifyToken);

  return {
    isConfigured: hasAccessToken && hasPhoneNumberId,
    hasAppId,
    hasAppSecret,
    hasAccessToken,
    hasPhoneNumberId,
    hasWabaId,
    hasVerifyToken
  };
}

/**
 * Validates the optional Messenger test integration configuration.
 * @param {object} [env=process.env]
 * @param {{ db?: any }} [options={}]
 * @returns {{ isConfigured: boolean, hasPageId: boolean, hasPageAccessToken: boolean, hasTenantId: boolean, isValid: boolean, errors: string[] }}
 */
export function validateMessengerConfig(env = process.env, options = {}) {
  const errors = [];
  const targetEnv = env || {};
  const pageId = (targetEnv.MESSENGER_PAGE_ID || '').trim();
  const pageAccessToken = (targetEnv.MESSENGER_PAGE_ACCESS_TOKEN || '').trim();
  const tenantId = (targetEnv.MESSENGER_TENANT_ID || '').trim();

  const hasPageId = Boolean(pageId);
  const hasPageAccessToken = Boolean(pageAccessToken);
  const hasTenantId = Boolean(tenantId);
  const isConfigured = hasPageId && hasPageAccessToken && hasTenantId;
  const isPartiallyConfigured = (hasPageId || hasPageAccessToken || hasTenantId) && !isConfigured;

  if (isPartiallyConfigured) {
    const missing = [];
    if (!hasPageId) missing.push('MESSENGER_PAGE_ID');
    if (!hasPageAccessToken) missing.push('MESSENGER_PAGE_ACCESS_TOKEN');
    if (!hasTenantId) missing.push('MESSENGER_TENANT_ID');
    errors.push(`Incomplete Messenger test configuration: ${missing.join(', ')} must be provided.`);
  }

  if (hasPageAccessToken && INSECURE_DEFAULT_SECRETS.includes(pageAccessToken)) {
    errors.push('MESSENGER_PAGE_ACCESS_TOKEN cannot be a known insecure default secret.');
  }

  if (options.db && isConfigured) {
    try {
      const tenant = options.db.prepare('SELECT id FROM businesses WHERE id = ?').get(tenantId);
      if (!tenant) {
        errors.push(`MESSENGER_TENANT_ID "${tenantId}" does not exist in businesses table.`);
      }
    } catch {
      // Table may not exist yet
    }
  }

  return {
    isConfigured,
    hasPageId,
    hasPageAccessToken,
    hasTenantId,
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates production environment variables and security constraints.
 * @param {object} [env=process.env]
 * @param {{ db?: any, throwOnError?: boolean, force?: boolean }} [options={}]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProductionEnv(env = process.env, options = {}) {
  const errors = [];
  const targetEnv = env || {};
  const currentMode = targetEnv.NODE_ENV || config.nodeEnv;

  if (currentMode !== 'production' && !options.force) {
    return { valid: true, errors: [] };
  }

  // 1. JWT_SECRET
  const jwtSecret = targetEnv.JWT_SECRET || '';
  if (!jwtSecret) {
    errors.push('JWT_SECRET is required in production environment.');
  } else if (INSECURE_DEFAULT_SECRETS.includes(jwtSecret)) {
    errors.push('JWT_SECRET is set to an insecure default value. Provide a cryptographically random secret.');
  } else if (jwtSecret.length < 32) {
    errors.push(`JWT_SECRET must be at least 32 characters in production (currently ${jwtSecret.length}).`);
  }

  // 2. META_ENCRYPTION_KEY / ENCRYPTION_KEY
  const encKey = targetEnv.META_ENCRYPTION_KEY || targetEnv.ENCRYPTION_KEY || '';
  if (!encKey) {
    errors.push('META_ENCRYPTION_KEY (or ENCRYPTION_KEY) is required in production.');
  } else if (INSECURE_DEFAULT_SECRETS.includes(encKey)) {
    errors.push('META_ENCRYPTION_KEY is using an insecure default secret.');
  } else if (encKey.length < 32) {
    errors.push(`META_ENCRYPTION_KEY must be at least 32 characters in production (currently ${encKey.length}).`);
  }

  // 3. WHATSAPP_WEBHOOK_VERIFY_TOKEN
  const verifyToken = targetEnv.WHATSAPP_WEBHOOK_VERIFY_TOKEN || targetEnv.WEBHOOK_VERIFY_TOKEN || targetEnv.META_VERIFY_TOKEN || '';
  if (verifyToken && INSECURE_DEFAULT_SECRETS.includes(verifyToken)) {
    errors.push('Webhook verify token is set to an insecure default value.');
  }

  // 4. SUPER_ADMIN_PASSWORD
  const adminPassword = targetEnv.SUPER_ADMIN_PASSWORD || '';
  const adminEmail = (targetEnv.SUPER_ADMIN_EMAIL || '').trim();

  if (adminPassword) {
    if (adminPassword.length < 12) {
      errors.push(`SUPER_ADMIN_PASSWORD must be at least 12 characters in production (currently ${adminPassword.length}).`);
    }
    if (INSECURE_DEFAULT_SECRETS.includes(adminPassword)) {
      errors.push('SUPER_ADMIN_PASSWORD cannot be a known default or trivial password.');
    }
  }

  // Check if DB is provided and has existing admin
  if (options.db) {
    try {
      const existingAdmin = options.db.prepare(`
        SELECT COUNT(*) as count FROM users WHERE role = 'SUPER_ADMIN' OR is_super_admin = 1
      `).get();
      if ((!existingAdmin || existingAdmin.count === 0) && (!adminEmail || !adminPassword)) {
        errors.push('Initial production setup requires SUPER_ADMIN_EMAIL and secure SUPER_ADMIN_PASSWORD since no administrator exists.');
      }
    } catch {
      // Table may not exist yet before migrations
    }
  }

  // 5. MESSENGER Test Integration (Optional, but if any var is set, must be valid and complete)
  const messengerValidation = validateMessengerConfig(targetEnv, options);
  if (!messengerValidation.isValid) {
    errors.push(...messengerValidation.errors);
  }

  const valid = errors.length === 0;

  if (!valid && options.throwOnError) {
    const errorMsg = `Production security validation failed:\n  - ${errors.join('\n  - ')}`;
    throw new Error(errorMsg);
  }

  return { valid, errors };
}

/**
 * Asserts that the production environment is securely configured, throwing an error if invalid.
 * @param {object} [env=process.env]
 * @param {{ db?: any, force?: boolean }} [options={}]
 */
export function assertProductionEnv(env = process.env, options = {}) {
  return validateProductionEnv(env, { ...options, throwOnError: true, force: true });
}
