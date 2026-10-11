import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { whatsappConnectionService } from '../services/whatsapp/whatsappConnectionService.js';
import { metaAuthService } from '../services/meta/metaAuthService.js';
import { whatsappPipeline } from '../services/whatsapp/whatsappPipeline.js';
import { whatsappService } from '../services/meta/whatsappService.js';
import { whatsappAiService } from '../services/whatsapp/whatsappAiService.js';
import { metaConnectionService } from '../services/meta/metaConnectionService.js';
import { metaEmbeddedSignupService } from '../services/meta/metaEmbeddedSignupService.js';
import { creditWalletService } from '../services/billing/creditWalletService.js';
import { config } from '../config/env.js';

export const whatsappController = {
  /**
   * GET /api/v1/whatsapp/connection
   * Returns sanitized WhatsApp connection metadata, webhook health, Ollama AI model status, and credit wallet
   */
  async getConnection(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const connection = whatsappConnectionService.getConnection(tenantId);
      const aiHealth = await whatsappAiService.checkHealth();
      const wallet = creditWalletService.getWallet(tenantId);

      return successResponse(res, {
        connection,
        aiHealth,
        wallet,
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
        return errorResponse(res, 'Phone Number ID and Permanent Access Token are required', 'VALIDATION_FAILED', HTTP_STATUS.BAD_REQUEST);
      }

      // Live verification check against Meta Graph API
      const liveCheck = await whatsappService.verifyPhoneNumberConnectivity(phoneNumberId, accessToken);
      if (!liveCheck.success) {
        return errorResponse(res, `Meta Cloud API verification failed: ${liveCheck.error}`, liveCheck.isExpired ? 'TOKEN_EXPIRED' : 'VERIFICATION_FAILED', HTTP_STATUS.BAD_REQUEST, {
          errorCode: liveCheck.errorCode,
          errorSubcode: liveCheck.errorSubcode,
          errorType: liveCheck.errorType,
          fbtraceId: liveCheck.fbtraceId,
          isExpired: liveCheck.isExpired
        });
      }

      const verifiedDisplayNumber = liveCheck.displayPhoneNumber || displayNumber || '+880 1712-345678';
      const connection = whatsappConnectionService.saveConnection(tenantId, {
        phoneNumberId,
        wabaId: wabaId || `waba_${phoneNumberId}`,
        accessToken,
        displayNumber: verifiedDisplayNumber
      });

      return successResponse(res, { connection, configured: true, verifiedName: liveCheck.verifiedName }, HTTP_STATUS.OK, {
        message: 'WhatsApp Cloud API verified & credentials stored securely'
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
   * Runs the full end-to-end messaging pipeline with Ollama Qwen3, with optional live dispatch.
   * Separates dashboard AI simulation from real Meta Cloud API live delivery.
   */
  async testMessage(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const {
        messageText = 'Do you have this shirt in XL?',
        senderPhone = '+1 (555) 928-1029',
        senderName = 'Test Customer',
        attachments = [],
        sendLiveToPhone = false,
        recipientPhone = null
      } = req.body || {};

      // If live delivery requested, strictly validate real non-placeholder phone number
      if (sendLiveToPhone) {
        if (!recipientPhone) {
          return errorResponse(res, 'Recipient phone number is required for live WhatsApp message delivery', 'MISSING_RECIPIENT', HTTP_STATUS.BAD_REQUEST);
        }

        const { isPlaceholderPhoneNumber } = await import('../services/meta/whatsappService.js');
        if (isPlaceholderPhoneNumber(recipientPhone)) {
          return errorResponse(res, 'Cannot send live WhatsApp message to placeholder phone number. Please enter an authorized real recipient phone number in E.164 format (e.g. +8801712345678).', 'PLACEHOLDER_RECIPIENT_REJECTED', HTTP_STATUS.BAD_REQUEST);
        }

        const conn = whatsappConnectionService.getConnectionWithToken(tenantId);
        if (!conn || !conn.decryptedAccessToken || !conn.phone_number_id) {
          return errorResponse(res, 'WhatsApp channel credentials not configured. Please link your Meta account first.', 'NOT_CONFIGURED', HTTP_STATUS.BAD_REQUEST);
        }

        if (conn.status === 'REAUTH_REQUIRED') {
          return errorResponse(res, `WhatsApp channel requires reauthorization: ${conn.last_error || 'Token expired (Code 190 / Subcode 463)'}.`, 'REAUTH_REQUIRED', HTTP_STATUS.UNAUTHORIZED);
        }

        if (conn.decryptedAccessToken.startsWith('EAAG_mock') || conn.decryptedAccessToken === 'simulated_wa_token') {
          return errorResponse(
            res,
            'To receive messages directly on your phone, please enter your real Meta WhatsApp Cloud API Access Token and Phone Number ID using the "Configure Credentials" button above. Simulated tokens cannot dispatch to physical devices.',
            'MOCK_TOKEN_CANNOT_DELIVER_LIVE',
            HTTP_STATUS.BAD_REQUEST,
            { isMockToken: true, phoneNumberId: conn.phone_number_id, wabaId: conn.whatsapp_business_account_id }
          );
        }

        // Live send flow
        const cleanRecipient = recipientPhone.replace(/[^0-9]/g, '');
        let textToSend = messageText;
        let aiMetadata = null;

        // If sendAiReply is requested (default true for test message), synthesize reply through Ollama first
        if (req.body.sendAiReply !== false) {
          try {
            const simEvent = {
              platform: 'WHATSAPP',
              businessId: tenantId,
              workspaceId: tenantId,
              externalConversationId: `wa_conv_live_${Date.now()}`,
              externalMessageId: `mid_wa_live_${Date.now()}`,
              messageText,
              attachments,
              isSimulated: true,
              sender: { id: cleanRecipient, name: senderName, phone: cleanRecipient },
              recipient: { id: conn.phone_number_id },
              metadata: { isTestMode: true, isSimulatedTest: true }
            };

            const aiResult = await whatsappPipeline.processInboundEvent(simEvent);
            if (aiResult?.replyText) {
              textToSend = aiResult.replyText;
              aiMetadata = {
                model: aiResult.aiModel || 'qwen3:1.7b',
                intent: aiResult.intent,
                executionTimeMs: aiResult.executionTimeMs
              };
            }
          } catch (aiErr) {
            logger.warn(`[TEST MESSAGE] AI synthesis fallback: ${aiErr.message}`);
          }
        }

        const liveDispatchResult = await whatsappService.sendTextMessage(
          conn.phone_number_id,
          conn.decryptedAccessToken,
          cleanRecipient,
          textToSend
        );

        if (!liveDispatchResult.success) {
          return errorResponse(res, `Live WhatsApp delivery failed: ${liveDispatchResult.error}`, 'DELIVERY_FAILED', HTTP_STATUS.BAD_REQUEST, {
            errorCode: liveDispatchResult.errorCode,
            errorSubcode: liveDispatchResult.errorSubcode,
            errorType: liveDispatchResult.errorType,
            fbtraceId: liveDispatchResult.fbtraceId,
            textAttempted: textToSend
          });
        }

        return successResponse(res, {
          liveDelivery: true,
          recipientPhone: cleanRecipient,
          messageId: liveDispatchResult.messageId,
          textSent: textToSend,
          aiMetadata,
          attempts: liveDispatchResult.attempts
        }, HTTP_STATUS.OK, {
          message: `Live WhatsApp message dispatched successfully via Meta Cloud API (Message ID: ${liveDispatchResult.messageId})`
        });
      }

      // Default: Dashboard AI Simulation Mode (runs local Ollama AI reasoning without outbound dispatch or credit deduction)
      const testEvent = {
        platform: 'WHATSAPP',
        businessId: tenantId,
        workspaceId: tenantId,
        externalConversationId: `wa_conv_sim_${Date.now()}`,
        externalMessageId: `mid_wa_sim_${Date.now()}`,
        messageText,
        attachments,
        isSimulated: true,
        sender: {
          id: senderPhone,
          name: senderName,
          phone: senderPhone
        },
        recipient: { id: 'phone_test_recip' },
        metadata: { isTestMode: true, isSimulatedTest: true }
      };

      const result = await whatsappPipeline.processInboundMessage(testEvent);

      return successResponse(res, {
        testEvent,
        result: {
          ...result,
          isSimulation: true
        }
      }, HTTP_STATUS.OK, {
        message: 'AI reply preview synthesized via local Ollama knowledge pipeline (Simulation Mode)'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/whatsapp/ai-health
   * Live health check for local Ollama AI runtime
   */
  async getAiHealth(req, res, next) {
    try {
      const aiHealth = await whatsappAiService.checkHealth();
      return successResponse(res, aiHealth);
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
  },

  /**
   * POST /api/v1/whatsapp/embedded-signup/session
   * Initiates official Meta Embedded Signup onboarding session with CSRF state token
   */
  async initiateEmbeddedSignup(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const session = metaEmbeddedSignupService.initiateSession(tenantId);
      return successResponse(res, session, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/embedded-signup/callback
   * Exchanges authorization code, subscribes WABA, verifies connectivity, and completes onboarding
   */
  async completeEmbeddedSignup(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { code, stateToken, sessionInfo, isCancelled } = req.body || {};

      const result = await metaEmbeddedSignupService.completeOnboarding(tenantId, {
        code,
        stateToken,
        sessionInfo,
        isCancelled: Boolean(isCancelled)
      });

      if (!result.success) {
        return errorResponse(res, result.message || 'Onboarding incomplete', 'ONBOARDING_CANCELLED', HTTP_STATUS.BAD_REQUEST, {
          reason: result.reason
        });
      }

      return successResponse(res, result, HTTP_STATUS.OK, {
        message: 'WhatsApp Business account successfully linked via Meta Embedded Signup'
      });
    } catch (err) {
      if (err.statusCode === 409) {
        return errorResponse(res, err.message, err.code || 'PHONE_NUMBER_OWNERSHIP_CONFLICT', HTTP_STATUS.CONFLICT);
      }
      next(err);
    }
  },

  /**
   * GET /api/v1/whatsapp/wallet
   * Returns current AI credit wallet, trial status, and usage statistics
   */
  async getWallet(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const wallet = creditWalletService.getWallet(tenantId);
      return successResponse(res, wallet, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/whatsapp/upgrade-plan
   * Upgrades tenant to an existing paid plan (trial, standard, pro) and activates credits
   */
  async upgradePlan(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { planId, billingCycle = 'MONTHLY', provider = 'INTERNAL' } = req.body || {};

      if (!planId) {
        return errorResponse(res, 'planId is required (trial, standard, or pro)', 'VALIDATION_FAILED', HTTP_STATUS.BAD_REQUEST);
      }

      const result = creditWalletService.upgradeSubscription(tenantId, planId, billingCycle, provider);
      return successResponse(res, result, HTTP_STATUS.OK, {
        message: `Plan successfully upgraded to ${result.plan}`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/whatsapp/transactions
   * Returns immutable credit transaction ledger for audit and billing transparency
   */
  async getTransactions(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const limit = parseInt(req.query.limit || '50', 10);
      const transactions = creditWalletService.getTransactions(tenantId, limit);
      return successResponse(res, { transactions }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }
};
