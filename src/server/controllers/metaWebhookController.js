import crypto from 'crypto';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { conversationController } from './conversationController.js';

// ─────────────────────────────────────────────────────────────────────────────
// META GRAPH API OUTBOUND DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────

const META_GRAPH_VERSION = 'v20.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

/**
 * Send a text message via WhatsApp Business Cloud API.
 * @param {string} phoneNumberId - Meta WhatsApp Phone Number ID
 * @param {string} accessToken   - Meta permanent / long-lived access token
 * @param {string} recipientPhone - Destination phone number (E.164 format)
 * @param {string} text           - Message text body
 */
async function sendWhatsAppTextMessage(phoneNumberId, accessToken, recipientPhone, text) {
  const url = `${META_GRAPH_BASE}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone,
      type: 'text',
      text: { preview_url: false, body: text }
    }),
    signal: AbortSignal.timeout(10000)
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data?.error?.message || `HTTP ${response.status}`;
    throw new Error(`Meta Graph API error: ${errMsg}`);
  }

  logger.info(`WhatsApp message dispatched to ${recipientPhone} via phone_number_id ${phoneNumberId}`, {
    messageId: data?.messages?.[0]?.id
  });

  return data;
}

/**
 * Lookup which tenant business owns a given Meta phone_number_id
 * so inbound webhooks can be routed to the correct workspace.
 * Falls back to the flagship demo workspace if no mapping exists yet.
 */
function resolveBusinessIdFromPhoneNumberId(phoneNumberId) {
  // In a production multi-tenant scenario, query the DB:
  // const row = db.prepare('SELECT business_id FROM integrations WHERE meta_phone_number_id = ?').get(phoneNumberId);
  // return row?.business_id || 'ws-flagship-01';
  //
  // For now: return a deterministic fallback so webhook routing works out of the box.
  if (!phoneNumberId) return 'ws-flagship-01';
  return `ws-${phoneNumberId}`.slice(0, 32) || 'ws-flagship-01';
}

// ─────────────────────────────────────────────────────────────────────────────
// META WEBHOOK CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

export const metaWebhookController = {
  /**
   * Meta Webhook Verification Handshake
   * GET /api/v1/webhooks/meta?hub.mode=subscribe&hub.challenge=...&hub.verify_token=...
   */
  verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.meta.verifyToken) {
      logger.info('Meta webhook verification challenge accepted successfully.');
      return res.status(200).send(challenge);
    }

    logger.warn('Meta webhook verification token mismatch or invalid mode.');
    return res.status(403).send('Forbidden: Token mismatch');
  },

  /**
   * Meta Incoming Webhook Ingestion (WhatsApp / Instagram / Messenger)
   * POST /api/v1/webhooks/meta
   *
   * Flow:
   *   1. Return 200 immediately (Meta drops events after 20 s)
   *   2. Verify HMAC-SHA256 signature
   *   3. Parse & route messages to conversationController.receiveIncoming
   *   4. Dispatch AI reply back via Meta Graph API
   */
  async handleIncoming(req, res) {
    // Step 1: ACK immediately — Meta requires HTTP 200 within 20 seconds
    res.status(200).json({ status: 'EVENT_RECEIVED' });

    try {
      // Step 2: Signature Verification
      const signature = req.headers['x-hub-signature-256'];
      if (config.meta.appSecret && signature) {
        const hmac = crypto.createHmac('sha256', config.meta.appSecret);
        const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
        if (signature !== digest) {
          logger.warn('Meta webhook HMAC-SHA256 signature validation FAILED. Event dropped.');
          return;
        }
      }

      const body = req.body;
      logger.info('Received Meta Webhook event', { object: body.object });

      const isSupportedObject =
        body.object === 'whatsapp_business_account' ||
        body.object === 'instagram' ||
        body.object === 'page';

      if (!isSupportedObject) return;

      const entries = body.entry || [];

      for (const entry of entries) {
        const changes = entry.changes || [];

        for (const change of changes) {
          const value = change.value;
          if (!value?.messages?.length) continue;

          const incomingMsg = value.messages[0];
          const contact = value.contacts?.[0] || {};
          const senderPhone = incomingMsg.from;
          const senderName = contact.profile?.name || senderPhone;
          const text = incomingMsg.text?.body || '';
          const phoneNumberId = value.metadata?.phone_number_id || config.meta.phoneNumberId;
          const channel = body.object === 'instagram' ? 'INSTAGRAM' : 'WHATSAPP';

          if (!text) continue;

          // Step 3: Route to tenant via phone_number_id → business_id mapping
          const targetBusinessId = resolveBusinessIdFromPhoneNumberId(phoneNumberId);
          logger.info(`Processing ${channel} message from "${senderName}" (${senderPhone})`, {
            businessId: targetBusinessId,
            phoneNumberId
          });

          let aiReply = null;

          try {
            // Deliver to conversation engine (creates customer + conversation + AI suggest)
            const result = await conversationController.receiveIncoming(
              {
                body: {
                  businessId: targetBusinessId,
                  customerName: senderName,
                  text,
                  channel,
                  phone: senderPhone
                }
              },
              {
                // Dummy response object — we already sent HTTP 200 above
                status: () => ({ json: () => {} })
              },
              () => {}
            );

            // Extract AI reply from the result if available
            aiReply = result?.aiReply || result?.data?.aiReply || null;
          } catch (err) {
            logger.error('Error routing inbound message to conversationController:', err);
          }

          // Step 4: Dispatch outbound AI reply via Meta Graph API
          const accessToken = config.meta.accessToken;
          const outboundPhoneNumberId = phoneNumberId || config.meta.phoneNumberId;

          if (aiReply && accessToken && outboundPhoneNumberId && channel === 'WHATSAPP') {
            try {
              await sendWhatsAppTextMessage(outboundPhoneNumberId, accessToken, senderPhone, aiReply);
            } catch (dispatchErr) {
              logger.warn(`Failed to dispatch WhatsApp reply to ${senderPhone}: ${dispatchErr.message}`);
            }
          } else if (aiReply && channel === 'WHATSAPP') {
            logger.warn(
              'WhatsApp outbound reply skipped: META_ACCESS_TOKEN or META_WHATSAPP_PHONE_NUMBER_ID not configured in .env'
            );
          }
        }
      }
    } catch (err) {
      logger.error('Unhandled error processing Meta webhook event:', err);
    }
  }
};
