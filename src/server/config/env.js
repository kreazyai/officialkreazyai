import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map(o => o.trim()),

  database: {
    url: process.env.DATABASE_URL || './data/kreazy.db'
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'kreazy_production_fallback_jwt_secret_min32char_2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    superAdminEmail: process.env.SUPER_ADMIN_EMAIL || 'kreazyai@gmail.com',
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || '12kreazyai12@'
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'heuristic',
    geminiKey: process.env.GEMINI_API_KEY || '',
    openAiKey: process.env.OPENAI_API_KEY || '',
    modelName: process.env.AI_MODEL_NAME || 'gemini-2.0-flash'
  },

  meta: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || 'kreazy_meta_webhook_verification_token_2026',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
    wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || '',
    redirectUri: process.env.META_REDIRECT_URI || 'http://localhost:5000/api/v1/meta/oauth/callback',
    apiBaseUrl: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v21.0',
    encryptionKey: process.env.META_ENCRYPTION_KEY || 'kreazy_meta_aes_256_secret_key_32b_2026',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  whatsapp: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    verifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || 'kreazy_meta_webhook_verification_token_2026',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
    wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || '',
    apiBaseUrl: process.env.WHATSAPP_API_BASE_URL || 'https://graph.facebook.com/v21.0',
    redirectUri: process.env.META_REDIRECT_URI || 'http://localhost:5000/api/v1/meta/oauth/callback'
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
