import crypto from 'crypto';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { conversationController } from './conversationController.js';

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
   */
  async handleIncoming(req, res, next) {
    try {
      // Return 200 OK immediately to satisfy Meta's strict 20-second timeout policy
      res.status(200).json({ status: 'EVENT_RECEIVED' });

      // Signature Verification if App Secret is configured
      const signature = req.headers['x-hub-signature-256'];
      if (config.meta.appSecret && signature) {
        const hmac = crypto.createHmac('sha256', config.meta.appSecret);
        const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
        if (signature !== digest) {
          logger.warn('Meta webhook signature validation failed. Event dropped.');
          return;
        }
      }

      const body = req.body;
      logger.info('Received Meta Webhook event payload:', { object: body.object });

      if (body.object === 'whatsapp_business_account' || body.object === 'instagram' || body.object === 'page') {
        const entries = body.entry || [];
        for (const entry of entries) {
          const changes = entry.changes || [];
          for (const change of changes) {
            const value = change.value;
            if (value && value.messages && value.messages.length) {
              const incomingMsg = value.messages[0];
              const contact = value.contacts && value.contacts[0] ? value.contacts[0] : {};
              const senderPhone = incomingMsg.from;
              const senderName = contact.profile ? contact.profile.name : senderPhone;
              const text = incomingMsg.text ? incomingMsg.text.body : '';

              if (text) {
                // Route to flagship store by default for demo/live tests
                const targetBusinessId = 'ws-flagship-01';
                logger.info(`Processing WhatsApp message from ${senderName} (${senderPhone}): "${text}"`);

                await conversationController.receiveIncoming({
                  body: {
                    businessId: targetBusinessId,
                    customerName: senderName,
                    text,
                    channel: 'WHATSAPP',
                    phone: senderPhone
                  }
                }, {
                  status: () => ({ json: () => {} })
                }, () => {});
              }
            }
          }
        }
      }
    } catch (err) {
      logger.error('Error processing Meta webhook event:', err);
    }
  }
};
