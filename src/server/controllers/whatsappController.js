import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { whatsappConnectionService } from '../services/whatsapp/whatsappConnectionService.js';
import { metaAuthService } from '../services/meta/metaAuthService.js';
import { whatsappPipeline } from '../services/whatsapp/whatsappPipeline.js';
import { config } from '../config/env.js';

export const whatsappController = {
  /**
   * GET /api/v1/whatsapp/connection
   * Returns sanitized WhatsApp connection metadata, webhook health, and status
   */
  async getConnection(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const connection = whatsappConnectionService.getConnection(tenantId);

      return successResponse(res, {
        connection,
        webhookUrl: `${req.protocol}://${req.get('host')}/api/v1/meta/webhook`,
        webhookVerifyConfigured: Boolean(config.meta.verifyToken),
        isConfigured: connection?.status === 'CONNECTED'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/connect
   * Initiates official Meta OAuth onboarding flow specifically for WhatsApp Business
   */
  async connect(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const workspaceId = req.headers['x-workspace-id'] || tenantId;

      const { authUrl, state, isSimulated } = metaAuthService.generateAuthorizationUrl(
        tenantId,
        workspaceId,
        'WHATSAPP'
      );

      return successResponse(res, {
        authUrl,
        state,
        platform: 'WHATSAPP',
        isSimulated,
        instructions: isSimulated 
          ? 'Development simulation active. Will bind verified sandbox WhatsApp Business test number.'
          : 'Redirecting to official Meta Business Login to link WhatsApp Business Account...'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/whatsapp/qr-session
   * Generates a dynamic QR code pairing payload for WhatsApp Business phone scanning
   */
  async getQrSession(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const session = whatsappConnectionService.generateQrSession(tenantId);
      return successResponse(res, session, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/pair-qr
   * Completes device pairing via scanned QR code for WhatsApp Business
   */
  async pairWithQr(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { phoneNumber, deviceName } = req.body || {};
      const connection = whatsappConnectionService.pairViaQr(tenantId, { phoneNumber, deviceName });
      return successResponse(res, { connection, paired: true }, HTTP_STATUS.OK, {
        message: 'WhatsApp Business device linked successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/configure-credentials
   * Saves and encrypts official Meta WhatsApp Cloud API credentials
   */
  async configureCredentials(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { phoneNumberId, wabaId, accessToken, displayNumber } = req.body || {};

      if (!phoneNumberId || !accessToken) {
        return errorResponse(res, 'Phone Number ID and Access Token are required', 'VALIDATION_FAILED', HTTP_STATUS.BAD_REQUEST);
      }

      const connection = whatsappConnectionService.saveConnection(tenantId, {
        phoneNumberId,
        wabaId: wabaId || `waba_${phoneNumberId}`,
        accessToken,
        displayNumber: displayNumber || '+880 1712-345678'
      });

      return successResponse(res, { connection, configured: true }, HTTP_STATUS.OK, {
        message: 'WhatsApp credentials saved & encrypted successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/whatsapp/auto-reply
   * Toggles autonomous AI Auto-Reply engine on/off
   */
  async updateAutoReply(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { enabled } = req.body || {};
      const result = whatsappConnectionService.updateAutoReply(tenantId, Boolean(enabled));
      return successResponse(res, result, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/disconnect
   */
  async disconnect(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const result = whatsappConnectionService.disconnect(tenantId);
      return successResponse(res, result, HTTP_STATUS.OK, { message: 'WhatsApp channel disconnected successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/health-check
   * Verifies credentials, phone number ID, webhook status, and messaging readiness
   */
  async healthCheck(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const health = await whatsappConnectionService.runHealthCheck(tenantId);
      return successResponse(res, health);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/test-message
   * Runs the full end-to-end messaging pipeline in test mode without exposing secrets
   */
  async testMessage(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const {
        messageText = 'Do you have this shirt in XL?',
        senderPhone = '+1 (555) 928-1029',
        senderName = 'Sarah Jenkins (Test Customer)',
        attachments = []
      } = req.body || {};

      const testEvent = {
        platform: 'WHATSAPP',
        businessId: tenantId,
        workspaceId: tenantId,
        externalConversationId: `wa_conv_test_${Date.now()}`,
        externalMessageId: `mid_wa_test_${Date.now()}`,
        messageText,
        attachments,
        sender: {
          id: senderPhone,
          name: senderName,
          phone: senderPhone
        },
        recipient: { id: 'phone_test_recip' },
        metadata: { isTestMode: true }
      };

      const result = await whatsappPipeline.processInboundMessage(testEvent);

      return successResponse(res, {
        testEvent,
        result
      }, HTTP_STATUS.OK, { message: 'Test message processed through complete WhatsApp pipeline' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/whatsapp/observability
   * Phase 13 Observability telemetry: Meta API health, Webhook health, events, retries, state
   * STRICT SECURITY: Never returns credentials, secrets, or sensitive tokens.
   */
  async getObservability(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const connection = whatsappConnectionService.getConnection(tenantId);
      const db = (await import('../config/database.js')).getDatabase();

      const lastInbound = db.prepare(`
        SELECT created_at FROM messages
        WHERE (tenant_id = ? OR conversation_id IN (SELECT id FROM conversations WHERE business_id = ?))
          AND direction = 'INBOUND'
        ORDER BY created_at DESC LIMIT 1
      `).get(tenantId, tenantId);

      const lastOutbound = db.prepare(`
        SELECT created_at, status FROM messages
        WHERE (tenant_id = ? OR conversation_id IN (SELECT id FROM conversations WHERE business_id = ?))
          AND direction = 'OUTBOUND'
        ORDER BY created_at DESC LIMIT 1
      `).get(tenantId, tenantId);

      return successResponse(res, {
        tenantId,
        metaApiHealth: connection?.status === 'CONNECTED' ? 'HEALTHY' : 'NOT_CONFIGURED',
        webhookHealth: connection?.webhook_status === 'ACTIVE' ? 'HEALTHY' : 'INACTIVE',
        lastInboundEvent: lastInbound?.created_at || connection?.last_event_at || null,
        lastOutboundMessage: lastOutbound?.created_at || null,
        lastError: connection?.last_error || null,
        retryState: {
          maxRetries: 3,
          backoffStrategy: 'exponential_jitter',
          deadLetterHandling: 'NEEDS_HUMAN_INBOX'
        },
        connectionState: connection?.status || 'NOT_CONNECTED'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/reconnect
   * Initiates reauthorization flow for WhatsApp channel
   */
  async reconnect(req, res, next) {
    return whatsappController.connect(req, res, next);
  }
};
