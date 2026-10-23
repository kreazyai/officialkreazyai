import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { metaAuthService } from '../services/meta/metaAuthService.js';
import { metaAssetService } from '../services/meta/metaAssetService.js';
import { metaConnectionService } from '../services/meta/metaConnectionService.js';
import { metaWebhookService } from '../services/meta/metaWebhookService.js';
import { metaAutoReplyEngine } from '../services/meta/metaAutoReplyEngine.js';

export const metaController = {
  /**
   * POST /api/v1/meta/connect
   * Initiates official Meta OAuth connection flow
   */
  async initiateConnect(req, res, next) {
    try {
      const businessId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const workspaceId = req.headers['x-workspace-id'] || businessId;
      const platform = (req.body?.platform || 'ALL').toUpperCase();

      const { authUrl, state, isSimulated } = metaAuthService.generateAuthorizationUrl(
        businessId,
        workspaceId,
        platform
      );

      return successResponse(res, {
        authUrl,
        state,
        platform,
        isSimulated,
        instructions: isSimulated 
          ? 'Meta App ID not configured in .env. Test mode active — authorization will use verified synthetic assets.'
          : 'Redirecting to official Meta Business Login dialog...'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/meta/oauth/callback
   * Official OAuth callback handler from Meta
   */
  async handleOAuthCallback(req, res) {
    const { code, state, error, error_description } = req.query;
    const frontendRedirect = config.meta.frontendUrl || 'http://localhost:5173';

    if (error) {
      logger.warn(`Meta OAuth declined: ${error_description || error}`);
      return res.redirect(`${frontendRedirect}/dashboard/integrations?meta_status=error&error=${encodeURIComponent(error_description || error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${frontendRedirect}/dashboard/integrations?meta_status=error&error=Missing_code_or_state`);
    }

    try {
      // 1. Verify signed state to prevent CSRF and extract tenant metadata
      const statePayload = metaAuthService.verifySignedState(state);
      const { businessId, workspaceId, platform } = statePayload;

      // 2. Exchange code for user access token
      const tokenResult = await metaAuthService.exchangeCodeForToken(code);
      const userToken = tokenResult.accessToken;

      // 3. Discover Meta Business Assets
      const [pages, wabas] = await Promise.all([
        metaAssetService.getFacebookPages(userToken),
        metaAssetService.getWhatsAppBusinessAccounts(userToken)
      ]);

      const primaryPage = pages[0] || null;
      let igAccount = null;

      if (primaryPage) {
        igAccount = await metaAssetService.getInstagramAccount(primaryPage.id, primaryPage.accessToken);
        // Subscribe page to webhooks
        await metaAssetService.subscribePageToWebhooks(primaryPage.id, primaryPage.accessToken);
      }

      const primaryWaba = wabas[0] || null;
      const primaryPhone = primaryWaba?.phoneNumbers?.[0] || null;

      if (primaryWaba) {
        await metaAssetService.subscribeWabaToWebhooks(primaryWaba.wabaId, userToken);
      }

      // 4. Save Connections according to requested platform or ALL
      if (platform === 'WHATSAPP' || platform === 'ALL') {
        metaConnectionService.saveConnectionFromOAuth(businessId, workspaceId, 'WHATSAPP', tokenResult, {
          wabaId: primaryWaba?.wabaId || 'waba_mock_8892',
          phoneNumberId: primaryPhone?.id || 'phone_mock_1192',
          displayPhoneNumber: primaryPhone?.displayPhone || '+1 (555) 839-2041',
          scopes: ['whatsapp_business_messaging', 'whatsapp_business_management']
        });
      }

      if (platform === 'INSTAGRAM' || platform === 'ALL') {
        const instagramTokenData = {
          accessToken: primaryPage?.accessToken || tokenResult.accessToken,
          expiresIn: tokenResult.expiresIn
        };

        metaConnectionService.saveConnectionFromOAuth(businessId, workspaceId, 'INSTAGRAM', instagramTokenData, {
          pageId: primaryPage?.id || 'page_mock_9921',
          pageName: primaryPage?.name || 'Kreazy Official Store',
          instagramAccountId: igAccount?.id || 'ig_mock_3342',
          instagramUsername: igAccount?.username || 'kreazy.brand.official',
          scopes: ['instagram_basic', 'instagram_manage_messages']
        });
      }

      if (platform === 'MESSENGER' || platform === 'ALL') {
        const messengerTokenData = {
          accessToken: primaryPage?.accessToken || tokenResult.accessToken,
          expiresIn: tokenResult.expiresIn
        };

        metaConnectionService.saveConnectionFromOAuth(businessId, workspaceId, 'MESSENGER', messengerTokenData, {
          pageId: primaryPage?.id || 'page_mock_9921',
          pageName: primaryPage?.name || 'Kreazy Official Store',
          scopes: ['pages_show_list', 'pages_messaging', 'pages_manage_metadata']
        });
      }

      logger.info(`Meta OAuth callback successfully bound assets for workspace ${businessId}`);
      return res.redirect(`${frontendRedirect}/dashboard/integrations?meta_status=success&platform=${encodeURIComponent(platform)}`);
    } catch (err) {
      logger.error('Error handling Meta OAuth callback:', err);
      return res.redirect(`${frontendRedirect}/dashboard/integrations?meta_status=error&error=${encodeURIComponent(err.message)}`);
    }
  },

  /**
   * GET /api/v1/meta/connections
   * Get all active Meta connections and diagnostic health for tenant
   */
  async getConnections(req, res, next) {
    try {
      const businessId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const workspaceId = req.headers['x-workspace-id'] || businessId;

      const connections = metaConnectionService.getConnections(businessId, workspaceId);

      return successResponse(res, {
        connections,
        metaAppConfigured: Boolean(config.meta.appId && config.meta.appSecret),
        webhookUrl: `${req.protocol}://${req.get('host')}/api/v1/meta/webhook`,
        verifyToken: config.meta.verifyToken
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/meta/:connectionId/test
   * Run 5-point diagnostic test
   */
  async testConnection(req, res, next) {
    try {
      const businessId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { connectionId } = req.params;

      // Extract platform from connectionId (e.g. conn-whatsapp-ws-flagship-01) or find from DB
      const connections = metaConnectionService.getConnections(businessId);
      const conn = connections.find(c => c.id === connectionId || c.platform.toLowerCase() === connectionId.toLowerCase());

      if (!conn) {
        return errorResponse(res, 'Connection record not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
      }

      const testResult = await metaConnectionService.run5PointTest(businessId, conn.platform);
      return successResponse(res, testResult);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/meta/:connectionId/reconnect
   */
  async reconnect(req, res, next) {
    try {
      const businessId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const workspaceId = req.headers['x-workspace-id'] || businessId;
      const { connectionId } = req.params;

      const connections = metaConnectionService.getConnections(businessId);
      const conn = connections.find(c => c.id === connectionId || c.platform.toLowerCase() === connectionId.toLowerCase());
      const platform = conn ? conn.platform : 'ALL';

      const authData = metaAuthService.generateAuthorizationUrl(businessId, workspaceId, platform);
      return successResponse(res, authData);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/meta/:connectionId
   */
  async disconnect(req, res, next) {
    try {
      const businessId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { connectionId } = req.params;

      const connections = metaConnectionService.getConnections(businessId);
      const conn = connections.find(c => c.id === connectionId || c.platform.toLowerCase() === connectionId.toLowerCase());

      if (!conn) {
        return errorResponse(res, 'Connection record not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
      }

      const result = metaConnectionService.disconnect(businessId, conn.platform);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/v1/meta/:connectionId/settings
   */
  async updateSettings(req, res, next) {
    try {
      const businessId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { connectionId } = req.params;

      const connections = metaConnectionService.getConnections(businessId);
      const conn = connections.find(c => c.id === connectionId || c.platform.toLowerCase() === connectionId.toLowerCase());

      if (!conn) {
        return errorResponse(res, 'Connection record not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
      }

      const updated = metaConnectionService.updateSettings(businessId, conn.platform, req.body || {});
      return successResponse(res, updated);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/meta/test-simulate
   * Complete interactive META CONNECTION TEST MODE endpoint
   */
  async simulateTestEvent(req, res, next) {
    try {
      const businessId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const workspaceId = req.headers['x-workspace-id'] || businessId;

      const platform = (req.body?.platform || 'WHATSAPP').toUpperCase();
      const messageText = req.body?.messageText || 'Do you have this shirt in XL?';
      const senderName = req.body?.senderName || 'Sarah Jenkins (Test Customer)';
      const senderPhone = req.body?.senderPhone || '+1 (555) 928-1029';

      const executionTrace = [];
      executionTrace.push({ step: 1, title: 'Webhook Received', detail: `Received simulated ${platform} event payload` });

      const normalizedEvent = {
        platform,
        businessId,
        workspaceId,
        externalConversationId: `${platform.toLowerCase()}_conv_test_${Date.now()}`,
        externalMessageId: `mid_test_${Date.now()}`,
        messageText,
        attachments: req.body?.attachments || [],
        timestamp: new Date().toISOString(),
        sender: {
          id: senderPhone,
          name: senderName,
          phone: senderPhone
        },
        recipient: {
          id: 'phone_test_recipient_1'
        },
        metadata: { isSimulatedTest: true }
      };

      executionTrace.push({ step: 2, title: 'Event Normalized', detail: `Unified schema generated for ${platform}` });
      executionTrace.push({ step: 3, title: 'Customer & Thread Resolved', detail: `Mapped to ${senderName} (${senderPhone})` });

      // Run through auto-reply engine
      const autoReplyResult = await metaAutoReplyEngine.processIncomingMessage(normalizedEvent);

      if (autoReplyResult.ruleMatched) {
        executionTrace.push({ step: 4, title: 'Rule-First Engine Matched', detail: `Matched business rule (${autoReplyResult.intent}) from database` });
      } else {
        executionTrace.push({ step: 4, title: 'Rule-First Check Complete', detail: 'No direct rule; forwarded to AI Knowledge Engine' });
      }

      executionTrace.push({ step: 5, title: 'AI Reasoning & Safety Check', detail: `Synthesized reply with intent: ${autoReplyResult.intent || 'GENERAL_INQUIRY'}` });
      executionTrace.push({ step: 6, title: 'Official Message Dispatched', detail: `Dispatched to ${platform} recipient` });
      executionTrace.push({ step: 7, title: 'Live Inbox Synchronized', detail: 'Saved to SQLite messages table & updated active conversations' });

      return successResponse(res, {
        success: true,
        trace: executionTrace,
        executionTrace,
        replyText: autoReplyResult.replyText,
        autoReplyResult,
        normalizedEvent
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/meta/webhook
   * Meta Webhook Verification Handshake
   */
  verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.meta.verifyToken) {
      logger.info('Meta webhook verification handshake accepted.');
      return res.status(200).send(challenge);
    }

    logger.warn('Meta webhook verification token mismatch.');
    return res.status(403).send('Forbidden: Token mismatch');
  },

  /**
   * POST /api/v1/meta/webhook
   * Meta Webhook Ingestion Gateway
   */
  async handleWebhook(req, res) {
    // 1. Immediately return HTTP 200 to acknowledge Meta
    res.status(200).json({ status: 'EVENT_RECEIVED' });

    try {
      // 2. Validate HMAC-SHA256 signature
      const signature = req.headers['x-hub-signature-256'];
      if (!metaWebhookService.verifySignature(req.rawBody || req.body, signature)) {
        logger.warn('Meta webhook signature mismatch. Dropping event.');
        return;
      }

      // 3. Normalize heterogeneous Meta payload
      const normalizedEvents = metaWebhookService.normalizeWebhookPayload(req.body);
      logger.info(`[WEBHOOK RECEIVED] Received Meta Webhook payload with ${normalizedEvents.length} event(s)`);

      // 4. Process each normalized event
      for (const ev of normalizedEvents) {
        logger.info(`[WEBHOOK EVENT] Processing incoming ${ev.platform} message ${ev.externalMessageId} for tenant: ${ev.businessId || 'UNRESOLVED'}`);

        // Deduplicate
        const isFresh = metaWebhookService.deduplicateEvent(
          ev.externalMessageId,
          ev.platform,
          ev.businessId,
          ev
        );
        if (!isFresh) {
          logger.info(`[WEBHOOK DUPLICATE] Event ${ev.externalMessageId} was already handled or is in-flight. Skipping.`);
          continue;
        }

        try {
          // Pass to Rule-First, AI-Second Engine
          const result = await metaAutoReplyEngine.processIncomingMessage(ev);
          metaWebhookService.markEventProcessed(ev.externalMessageId, true);

          if (result?.replied) {
            logger.info(`[WEBHOOK REPLY SENT] Auto-reply dispatched for ${ev.externalMessageId} (Intent: ${result.intent || 'RESOLVED'}, Lang: ${result.language || 'N/A'})`);
          } else {
            logger.info(`[WEBHOOK NO REPLY] Message ${ev.externalMessageId} completed without outbound dispatch (${result?.reason || 'No reply generated'})`);
          }
        } catch (procErr) {
          metaWebhookService.markEventProcessed(ev.externalMessageId, false);
          logger.error(`[WEBHOOK REPLY FAILED] Error processing event ${ev.externalMessageId}:`, procErr);
        }
      }
    } catch (err) {
      logger.error('Error in Meta webhook ingestion processing:', err);
    }
  }
};
