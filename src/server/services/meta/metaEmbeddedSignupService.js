import crypto from 'crypto';
import { getDatabase } from '../../config/database.js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { metaAuthService } from './metaAuthService.js';
import { metaTokenService } from './metaTokenService.js';
import { metaAssetService } from './metaAssetService.js';
import { whatsappService } from './whatsappService.js';
import { whatsappConnectionService } from '../whatsapp/whatsappConnectionService.js';

export const metaEmbeddedSignupService = {
  /**
   * Initializes a new Meta Embedded Signup onboarding session with CSRF state token.
   * State is cryptographically bound to the authenticated tenant.
   * @param {string} tenantId 
   */
  initiateSession(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required to initiate onboarding session');
    const db = getDatabase();

    const sessionId = `wases-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min TTL

    const stateToken = metaAuthService.generateSignedState({
      sessionId,
      tenantId,
      platform: 'WHATSAPP',
      feature: 'EMBEDDED_SIGNUP'
    });

    db.prepare(`
      INSERT INTO whatsapp_onboarding_sessions (
        id, tenant_id, state_token, status, expires_at, created_at, updated_at
      ) VALUES (?, ?, ?, 'INITIATED', ?, datetime('now'), datetime('now'))
    `).run(sessionId, tenantId, stateToken, expiresAt);

    logger.info(`[EMBEDDED SIGNUP] Session initialized for tenant ${tenantId} (ID: ${sessionId})`);

    return {
      sessionId,
      stateToken,
      appId: config.meta.appId,
      configId: config.meta.configId || process.env.META_CONFIG_ID || '',
      graphVersion: config.meta.graphVersion || 'v26.0',
      isSimulated: !config.meta.appId
    };
  },

  /**
   * Completes the Embedded Signup flow by exchanging the authorization code,
   * verifying WABA/Phone ownership, preventing cross-tenant duplicates,
   * subscribing the WABA to webhooks, and securely saving encrypted credentials.
   * @param {string} tenantId 
   * @param {object} params
   * @param {string} params.code Authorization code from Meta FB.login popup
   * @param {string} params.stateToken Signed CSRF token from initiateSession
   * @param {object} params.sessionInfo Message event data from Meta JS SDK listener
   * @param {boolean} params.isCancelled True if user dismissed or cancelled the popup
   */
  async completeOnboarding(tenantId, { code, stateToken, sessionInfo = {}, isCancelled = false }) {
    if (!tenantId) throw new Error('Tenant ID required');
    const db = getDatabase();

    // 1. Handle User Cancellation
    if (isCancelled || !code) {
      if (stateToken) {
        db.prepare(`
          UPDATE whatsapp_onboarding_sessions 
          SET status = 'CANCELLED', updated_at = datetime('now')
          WHERE state_token = ? AND tenant_id = ?
        `).run(stateToken, tenantId);
      }
      logger.info(`[EMBEDDED SIGNUP] Onboarding cancelled by user for tenant ${tenantId}`);
      return { success: false, reason: 'ONBOARDING_CANCELLED', message: 'WhatsApp onboarding was cancelled.' };
    }

    // 2. Validate CSRF State Token and Session Binding
    if (!stateToken) {
      const err = new Error('Missing state token — CSRF protection failure');
      err.statusCode = 400;
      err.code = 'CSRF_VALIDATION_FAILED';
      throw err;
    }

    let payload;
    try {
      payload = metaAuthService.verifySignedState(stateToken);
    } catch (e) {
      const err = new Error(`Invalid or tampered CSRF state token: ${e.message}`);
      err.statusCode = 400;
      err.code = 'INVALID_STATE_TOKEN';
      throw err;
    }

    if (!payload || payload.tenantId !== tenantId) {
      logger.error(`[EMBEDDED SIGNUP SECURITY] State tenant mismatch: expected ${tenantId}, found ${payload?.tenantId}`);
      const err = new Error('Tenant authorization mismatch — cross-tenant session binding violation');
      err.statusCode = 403;
      err.code = 'TENANT_MISMATCH';
      throw err;
    }

    const session = db.prepare(`
      SELECT * FROM whatsapp_onboarding_sessions 
      WHERE state_token = ? AND tenant_id = ?
    `).get(stateToken, tenantId);

    if (!session) {
      const err = new Error('Onboarding session not found or belongs to another tenant');
      err.statusCode = 404;
      err.code = 'SESSION_NOT_FOUND';
      throw err;
    }

    // Replay resistance: Ensure session has not already been consumed or in-flight
    if (session.status === 'COMPLETED') {
      const err = new Error('This onboarding session has already been completed and cannot be reused (replay prevented).');
      err.statusCode = 409;
      err.code = 'SESSION_ALREADY_CONSUMED';
      throw err;
    }

    if (session.status === 'PROCESSING') {
      const err = new Error('This onboarding session is already being processed by a concurrent callback request.');
      err.statusCode = 409;
      err.code = 'SESSION_ALREADY_PROCESSING';
      throw err;
    }

    if (session.status !== 'INITIATED') {
      const err = new Error(`Onboarding session is no longer active (status: ${session.status}). Please launch a fresh session.`);
      err.statusCode = 400;
      err.code = 'SESSION_INVALID_STATE';
      throw err;
    }

    if (new Date() > new Date(session.expires_at)) {
      db.prepare("UPDATE whatsapp_onboarding_sessions SET status = 'EXPIRED', updated_at = datetime('now') WHERE id = ?").run(session.id);
      const err = new Error('Onboarding session has expired. Please launch Connect WhatsApp again.');
      err.statusCode = 400;
      err.code = 'SESSION_EXPIRED';
      throw err;
    }

    // 2. Atomic, conditional INITIATED -> PROCESSING claim
    // Guarantees exactly one concurrent callback wins the claim before external network calls
    const claimResult = db.prepare(`
      UPDATE whatsapp_onboarding_sessions 
      SET status = 'PROCESSING', updated_at = datetime('now')
      WHERE id = ? AND tenant_id = ? AND status = 'INITIATED'
    `).run(session.id, tenantId);

    const rowsClaimed = claimResult?.changes ?? claimResult?.rowCount ?? 0;
    if (rowsClaimed === 0) {
      const current = db.prepare(`SELECT status FROM whatsapp_onboarding_sessions WHERE id = ?`).get(session.id);
      if (current?.status === 'PROCESSING') {
        const err = new Error('Onboarding session is currently being processed by another concurrent request.');
        err.statusCode = 409;
        err.code = 'SESSION_ALREADY_PROCESSING';
        throw err;
      }
      if (current?.status === 'COMPLETED') {
        const err = new Error('This onboarding session has already been completed and cannot be reused (replay prevented).');
        err.statusCode = 409;
        err.code = 'SESSION_ALREADY_CONSUMED';
        throw err;
      }
      const err = new Error(`Onboarding session transition rejected (current status: ${current?.status || 'UNKNOWN'}).`);
      err.statusCode = 400;
      err.code = 'SESSION_INVALID_STATE';
      throw err;
    }

    let tokenResult;
    let accessToken;
    let expiresIn;
    let wabaId = sessionInfo?.waba_id || sessionInfo?.wabaId;
    let phoneNumberId = sessionInfo?.phone_number_id || sessionInfo?.phoneNumberId;
    let displayPhone = sessionInfo?.display_phone_number || sessionInfo?.displayPhone;
    let subResult = { success: false };
    let connCheck = { qualityRating: 'GREEN' };

    try {
      // 3. Server-Side Authorization Code Exchange
      logger.info(`[EMBEDDED SIGNUP] Exchanging authorization code for tenant ${tenantId}...`);
      tokenResult = await metaAuthService.exchangeCodeForToken(code);
      accessToken = tokenResult.accessToken;
      expiresIn = tokenResult.expiresIn;

      // 4. Identify Authorized WABA ID & Phone Number ID
      // If not passed in sessionInfo from frontend SDK message event, resolve from Meta Graph API
      if (!wabaId || !phoneNumberId) {
        logger.info(`[EMBEDDED SIGNUP] Querying Meta Graph API for client WABAs...`);
        const wabas = await metaAssetService.getWhatsAppBusinessAccounts(accessToken);
        if (wabas.length > 0) {
          wabaId = wabas[0].wabaId;
          if (wabas[0].phoneNumbers?.length > 0) {
            phoneNumberId = wabas[0].phoneNumbers[0].id;
            displayPhone = wabas[0].phoneNumbers[0].displayPhone;
          }
        }
      }

      // Fallback sandbox values only in simulation/mock mode
      if ((!wabaId || !phoneNumberId) && (code.includes('mock') || !config.meta.appId)) {
        wabaId = `waba_sim_${Date.now()}`;
        phoneNumberId = `phone_sim_${Date.now()}`;
        displayPhone = '+1 (555) 839-2041';
      }

      if (!wabaId || !phoneNumberId) {
        throw new Error('Could not detect an authorized WhatsApp Business Account and Phone Number ID from Meta.');
      }

      // 5. Strict Prevention of Unauthorized Duplicate Phone-Number Ownership
      const existingOwnership = db.prepare(`
        SELECT tenant_id, status FROM whatsapp_connections 
        WHERE phone_number_id = ? AND status = 'CONNECTED' AND tenant_id != ?
      `).get(phoneNumberId, tenantId);

      if (existingOwnership) {
        const conflictMsg = `This WhatsApp Phone Number ID (${phoneNumberId}) is already connected to another KreazyAI business. Disconnect it from that workspace before linking here.`;
        logger.warn(`[EMBEDDED SIGNUP CONFLICT] Duplicate phone ownership rejected for tenant ${tenantId}: ${conflictMsg}`);
        const err = new Error(conflictMsg);
        err.statusCode = 409;
        err.code = 'PHONE_NUMBER_OWNERSHIP_CONFLICT';
        throw err;
      }

      // 6. Subscribe Authorized WABA to Webhooks
      logger.info(`[EMBEDDED SIGNUP] Subscribing WABA ${wabaId} to KreazyAI webhooks...`);
      subResult = await metaAssetService.subscribeWabaToWebhooks(wabaId, accessToken);
      if (!subResult.success) {
        logger.warn(`[EMBEDDED SIGNUP] Webhook subscription warning for WABA ${wabaId}: ${subResult.error}`);
      }

      // 7. Verify Phone Number Connectivity with Meta Cloud API
      connCheck = await whatsappService.verifyPhoneNumberConnectivity(phoneNumberId, accessToken);
      if (connCheck.displayPhoneNumber) {
        displayPhone = connCheck.displayPhoneNumber;
      }
    } catch (exchangeErr) {
      // Mark session FAILED upon token exchange failure, timeout, or Meta API rejection
      try {
        db.prepare(`
          UPDATE whatsapp_onboarding_sessions 
          SET status = 'FAILED', error_message = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(exchangeErr.message || 'Onboarding token exchange failed', session.id);
      } catch (logErr) {
        logger.error(`[EMBEDDED SIGNUP] Failed to record FAILED status for session ${session.id}:`, logErr.message);
      }

      logger.warn(`[EMBEDDED SIGNUP FAILED] Tenant ${tenantId} session ${session.id} marked FAILED: ${exchangeErr.message}`);
      throw exchangeErr;
    }

    // 8. Transactional Connection Persistence & Session Consumption
    // Atomically saves connection, encrypts credentials via AES-256-GCM, and marks session COMPLETED
    let connection;
    try {
      const persistTx = db.transaction(() => {
        // Re-check conflict inside transaction lock
        const activeOtherTenant = db.prepare(`
          SELECT tenant_id FROM whatsapp_connections 
          WHERE phone_number_id = ? AND status = 'CONNECTED' AND tenant_id != ?
        `).get(phoneNumberId, tenantId);

        if (activeOtherTenant) {
          const err = new Error(`This WhatsApp Phone Number ID (${phoneNumberId}) is already connected to another KreazyAI business.`);
          err.statusCode = 409;
          err.code = 'PHONE_NUMBER_OWNERSHIP_CONFLICT';
          throw err;
        }

        const conn = whatsappConnectionService.saveConnection(tenantId, {
          wabaId,
          phoneNumberId,
          displayNumber: displayPhone || '+1 (555) 839-2041',
          accessToken,
          expiresIn
        });

        db.prepare(`
          UPDATE whatsapp_onboarding_sessions 
          SET status = 'COMPLETED', waba_id = ?, phone_number_id = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(wabaId, phoneNumberId, session.id);

        return conn;
      });

      connection = persistTx();
    } catch (txErr) {
      if (txErr.code === 'PHONE_NUMBER_OWNERSHIP_CONFLICT' || txErr.statusCode === 409) {
        throw txErr;
      }
      // Dual-engine unique constraint violation handling (SQLite: SQLITE_CONSTRAINT, PostgreSQL: 23505)
      const isUniqueViolation = 
        txErr.code === 'SQLITE_CONSTRAINT' || 
        txErr.code === '23505' ||
        txErr.message?.includes('UNIQUE constraint failed') ||
        txErr.message?.includes('duplicate key value') ||
        txErr.message?.includes('idx_unique_active_whatsapp_phone');

      if (isUniqueViolation) {
        const conflictErr = new Error(`This WhatsApp Phone Number ID (${phoneNumberId}) is already connected to another KreazyAI business (concurrency conflict).`);
        conflictErr.statusCode = 409;
        conflictErr.code = 'PHONE_NUMBER_OWNERSHIP_CONFLICT';
        throw conflictErr;
      }

      // Mark session FAILED on unexpected transaction error
      try {
        db.prepare(`
          UPDATE whatsapp_onboarding_sessions 
          SET status = 'FAILED', error_message = ?, updated_at = datetime('now')
          WHERE id = ?
        `).run(txErr.message || 'Transaction persistence error', session.id);
      } catch {}

      throw txErr;
    }

    logger.info(`[EMBEDDED SIGNUP SUCCESS] WhatsApp successfully connected for tenant ${tenantId} (WABA: ${wabaId}, Phone: ${phoneNumberId})`);

    return {
      success: true,
      connection,
      wabaId,
      phoneNumberId,
      displayPhone: displayPhone || connection.display_number,
      webhookSubscribed: subResult.success,
      qualityRating: connCheck.qualityRating || 'GREEN'
    };
  }
};
