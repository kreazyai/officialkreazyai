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
      configId: process.env.META_CONFIG_ID || '',
      graphVersion: 'v21.0',
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
      throw new Error('Missing state token — CSRF protection failure');
    }

    const payload = metaAuthService.verifySignedState(stateToken);
    if (payload.tenantId !== tenantId) {
      logger.error(`[EMBEDDED SIGNUP SECURITY] State tenant mismatch: expected ${tenantId}, found ${payload.tenantId}`);
      throw new Error('Tenant authorization mismatch — cross-tenant session binding violation');
    }

    const session = db.prepare(`
      SELECT * FROM whatsapp_onboarding_sessions 
      WHERE state_token = ? AND tenant_id = ?
    `).get(stateToken, tenantId);

    if (!session) {
      throw new Error('Onboarding session not found or belongs to another tenant');
    }

    if (new Date() > new Date(session.expires_at)) {
      db.prepare("UPDATE whatsapp_onboarding_sessions SET status = 'EXPIRED' WHERE id = ?").run(session.id);
      throw new Error('Onboarding session has expired. Please launch Connect WhatsApp again.');
    }

    // 3. Server-Side Authorization Code Exchange
    logger.info(`[EMBEDDED SIGNUP] Exchanging authorization code for tenant ${tenantId}...`);
    const tokenResult = await metaAuthService.exchangeCodeForToken(code);
    const accessToken = tokenResult.accessToken;
    const expiresIn = tokenResult.expiresIn;

    // 4. Identify Authorized WABA ID & Phone Number ID
    let wabaId = sessionInfo?.waba_id || sessionInfo?.wabaId;
    let phoneNumberId = sessionInfo?.phone_number_id || sessionInfo?.phoneNumberId;
    let displayPhone = sessionInfo?.display_phone_number || sessionInfo?.displayPhone;

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
      const errorMsg = 'Could not detect an authorized WhatsApp Business Account and Phone Number ID from Meta.';
      db.prepare(`
        UPDATE whatsapp_onboarding_sessions 
        SET status = 'FAILED', error_message = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(errorMsg, session.id);
      throw new Error(errorMsg);
    }

    // 5. Strict Prevention of Unauthorized Duplicate Phone-Number Ownership
    // If another active tenant is already connected with this exact phone number, reject with 409
    const existingOwnership = db.prepare(`
      SELECT tenant_id, status FROM whatsapp_connections 
      WHERE phone_number_id = ? AND status = 'CONNECTED' AND tenant_id != ?
    `).get(phoneNumberId, tenantId);

    if (existingOwnership) {
      const conflictMsg = `This WhatsApp Phone Number ID (${phoneNumberId}) is already connected to another KreazyAI business. Disconnect it from that workspace before linking here.`;
      logger.warn(`[EMBEDDED SIGNUP CONFLICT] Duplicate phone ownership rejected for tenant ${tenantId}: ${conflictMsg}`);
      db.prepare(`
        UPDATE whatsapp_onboarding_sessions 
        SET status = 'FAILED', error_message = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(conflictMsg, session.id);
      const err = new Error(conflictMsg);
      err.statusCode = 409;
      err.code = 'PHONE_NUMBER_OWNERSHIP_CONFLICT';
      throw err;
    }

    // 6. Subscribe the Authorized WABA to Webhook Events
    logger.info(`[EMBEDDED SIGNUP] Subscribing WABA ${wabaId} to KreazyAI webhooks...`);
    const subResult = await metaAssetService.subscribeWabaToWebhooks(wabaId, accessToken);
    if (!subResult.success) {
      logger.warn(`[EMBEDDED SIGNUP] Webhook subscription warning for WABA ${wabaId}: ${subResult.error}`);
    }

    // 7. Verify Phone Number Connectivity with Meta Cloud API
    const connCheck = await whatsappService.verifyPhoneNumberConnectivity(phoneNumberId, accessToken);
    if (connCheck.displayPhoneNumber) {
      displayPhone = connCheck.displayPhoneNumber;
    }

    // 8. Save and Encrypt Connection for Tenant
    const connection = whatsappConnectionService.saveConnection(tenantId, {
      wabaId,
      phoneNumberId,
      displayNumber: displayPhone || '+1 (555) 839-2041',
      accessToken,
      expiresIn
    });

    // 9. Mark Onboarding Session Completed
    db.prepare(`
      UPDATE whatsapp_onboarding_sessions 
      SET status = 'COMPLETED', waba_id = ?, phone_number_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(wabaId, phoneNumberId, session.id);

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
