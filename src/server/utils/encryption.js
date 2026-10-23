import crypto from 'crypto';
import { config } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for AES-GCM

/**
 * Derive a consistent 32-byte key from configuration
 */
function getMasterKey() {
  const secret = config.meta?.encryptionKey || config.auth?.jwtSecret || (!config.isProduction ? 'kreazy_dev_fallback_aes_key_32b_2026' : null);
  if (!secret) {
    throw new Error('Encryption key is required in production. Please set META_ENCRYPTION_KEY or JWT_SECRET.');
  }
  return crypto.createHash('sha256').update(String(secret)).digest();
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
