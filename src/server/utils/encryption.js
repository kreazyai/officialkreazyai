import crypto from 'crypto';
import { config } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for AES-GCM

/**
 * Derive a consistent 32-byte key from dedicated encryption configuration.
 * SECURITY: Never fall back to JWT_SECRET. Enforce strict key separation (CWE-320).
 */
function getMasterKey() {
  const secret = config.meta?.encryptionKey || (!config.isProduction ? 'kreazy_dev_aes_256_secret_key_32b_2026' : null);
  if (!secret) {
    throw new Error('[SECURITY CONFIG ERROR] Dedicated META_ENCRYPTION_KEY is required in production for Meta token encryption at rest. JWT secret fallback is strictly disallowed.');
  }
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Validates that token encryption at rest is safely configured with strict key separation.
 * @param {object} [targetConfig=config]
 * @param {object} [targetEnv=process.env]
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEncryptionConfig(targetConfig = config, targetEnv = process.env) {
  const isProd = Boolean(targetConfig?.isProduction || targetEnv?.NODE_ENV === 'production');
  const metaKey = String(targetConfig?.meta?.encryptionKey || targetEnv?.META_ENCRYPTION_KEY || targetEnv?.ENCRYPTION_KEY || '').trim();
  const jwtSecret = String(targetConfig?.auth?.jwtSecret || targetEnv?.JWT_SECRET || '').trim();

  if (isProd) {
    if (!metaKey) {
      return { valid: false, error: 'META_ENCRYPTION_KEY missing in production' };
    }
    if (metaKey.length < 32) {
      return { valid: false, error: `META_ENCRYPTION_KEY must be at least 32 characters in production (currently ${metaKey.length})` };
    }
    if (metaKey.includes('dev-') || metaKey.includes('placeholder') || metaKey === 'kreazy_dev_aes_256_secret_key_32b_2026') {
      return { valid: false, error: 'META_ENCRYPTION_KEY cannot be a default or placeholder secret in production' };
    }
    if (jwtSecret && metaKey === jwtSecret) {
      return { valid: false, error: 'Cryptographic key reuse detected: META_ENCRYPTION_KEY must be distinct from JWT_SECRET' };
    }
  }
  return { valid: true };
}

/**
 * Encrypt a sensitive token string using AES-256-GCM.
 * @param {string} text - Plaintext token
 * @returns {{ encrypted: string, iv: string, tag: string }}
 */
export function encryptToken(text) {
  if (!text) return { encrypted: null, iv: null, tag: null };
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);
  
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag
  };
}

/**
 * Decrypt an AES-256-GCM encrypted token.
 * @param {string} encryptedHex 
 * @param {string} ivHex 
 * @param {string} tagHex 
 * @returns {string|null} Plaintext token
 */
export function decryptToken(encryptedHex, ivHex, tagHex) {
  if (!encryptedHex || !ivHex || !tagHex) return null;
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getMasterKey(),
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return null;
  }
}

/**
 * Sanitize a meta_connections record before returning to frontend.
 * Guarantees tokens and crypto metadata NEVER leak to clients.
 */
export function sanitizeConnection(conn) {
  if (!conn) return null;
  const {
    encrypted_access_token,
    token_iv,
    token_tag,
    decryptedAccessToken,
    pageAccessToken,
    accessToken,
    token,
    ...safeRecord
  } = conn;

  // Parse JSON fields if string
  let scopes = [];
  try {
    scopes = typeof safeRecord.scopes === 'string' ? JSON.parse(safeRecord.scopes) : safeRecord.scopes;
  } catch {
    scopes = [];
  }

  let diagnostics = {};
  try {
    diagnostics = typeof safeRecord.diagnostics === 'string' ? JSON.parse(safeRecord.diagnostics) : safeRecord.diagnostics;
  } catch {
    diagnostics = {};
  }

  const hasToken = Boolean(encrypted_access_token || conn.hasToken || conn.has_token || conn.isEnvConfigured);

  return {
    ...safeRecord,
    scopes,
    diagnostics,
    hasToken,
    has_token: hasToken
  };
}
