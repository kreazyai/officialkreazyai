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
    verifyToken: process.env.META_VERIFY_TOKEN || 'kreazy_meta_webhook_verification_token_2026',
    phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.META_ACCESS_TOKEN || ''
  }
};
