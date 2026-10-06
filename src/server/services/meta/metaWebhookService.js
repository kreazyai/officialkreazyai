import crypto from 'crypto';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { getDatabase } from '../../config/database.js';

export const metaWebhookService = {
  /**
   * Validates the Meta Webhook HMAC-SHA256 signature
   * @param {string|Buffer} rawPayload 
   * @param {string} signatureHeader "sha256=..."
   * @returns {boolean}
   */
  verifySignature(rawPayload, signatureHeader, secretOverride = null) {
    const appSecret = secretOverride || config.meta.appSecret;
    if (!appSecret) {
      // In dev mode without app secret configured, allow bypass with warning
      return true;
    }
    if (!signatureHeader) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', appSecret);
      const payloadString = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
      const expectedDigest = 'sha256=' + hmac.update(payloadString).digest('hex');

      const sigBuf = Buffer.from(signatureHeader);
      const expBuf = Buffer.from(expectedDigest);

      if (sigBuf.length !== expBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch (err) {
      logger.error('Error validating webhook HMAC signature:', err.message);
      return false;
    }
  },

  /**
   * Deduplicate incoming webhook event.
   * If already seen, returns false. If new, stores and returns true.
   * @param {string} eventId 
   * @param {string} platform 
   * @param {string} businessId 
   * @param {object} payload 
   * @returns {boolean} True if event is fresh; False if duplicate
   */
  deduplicateEvent(eventId, platform, businessId, payload) {
    if (!eventId) return true;
    const db = getDatabase();

    try {
      const existing = db.prepare('SELECT id FROM meta_webhook_events WHERE event_id = ?').get(eventId);
      if (existing) {
        logger.info(`Duplicate Meta Webhook event dropped: ${eventId}`);
        return false;
      }

      db.prepare(`
        INSERT INTO meta_webhook_events (id, event_id, platform, business_id, payload, processed, created_at)
        VALUES (?, ?, ?, ?, ?, 1, datetime('now'))
      `).run(
        `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        eventId,
        platform,
        businessId || 'unknown',
        JSON.stringify(payload)
      );

      return true;
    } catch (err) {
      logger.warn('Deduplication check error (proceeding safely):', err.message);
      return true;
    }
  },

  /**
   * Helper check for duplicate event IDs.
   * Returns true if event is already recorded (duplicate), false if fresh.
   */
  isDuplicateEvent(eventId) {
    if (!eventId) return false;
    const db = getDatabase();
    try {
      const existing = db.prepare('SELECT id FROM meta_webhook_events WHERE event_id = ?').get(eventId);
      if (existing) {
        logger.info(`Duplicate Meta Webhook event dropped: ${eventId}`);
        return true;
      }
      db.prepare(`
        INSERT INTO meta_webhook_events (id, event_id, platform, business_id, payload, processed, created_at)
        VALUES (?, ?, 'WHATSAPP', 'ws-flagship-01', '{}', 1, datetime('now'))
      `).run(`evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, eventId);
      return false;
    } catch (err) {
      return false;
    }
  },

  /**
   * Resolves business_id and workspace_id from Meta account IDs.
   * Multi-Tenant Isolation Rule: Never guess or fallback to a default tenant.
   * If tenant mapping is missing, returns null so event can be rejected safely.
   */
  resolveTenant(platform, assetId) {
    if (!assetId) {
      logger.warn(`Tenant resolution failed: empty asset ID on platform ${platform}`);
      return null;
    }
    const db = getDatabase();

    try {
      let row = null;
      if (platform === 'WHATSAPP') {
        // Check dedicated whatsapp_connections first, then meta_connections
        try {
          row = db.prepare(`
            SELECT tenant_id AS business_id, tenant_id AS workspace_id FROM whatsapp_connections 
            WHERE (phone_number_id = ? OR WABA_id = ?) AND status = 'CONNECTED'
            LIMIT 1
          `).get(assetId, assetId);
        } catch {
          // table might not exist in mock tests
        }

        if (!row) {
          row = db.prepare(`
            SELECT business_id, workspace_id FROM meta_connections 
            WHERE (phone_number_id = ? OR whatsapp_business_account_id = ?) AND status = 'CONNECTED'
            LIMIT 1
          `).get(assetId, assetId);
        }
      } else if (platform === 'INSTAGRAM') {
        row = db.prepare(`
          SELECT business_id, workspace_id FROM meta_connections 
          WHERE (instagram_account_id = ? OR page_id = ?) AND status = 'CONNECTED'
          LIMIT 1
        `).get(assetId, assetId);
      } else if (platform === 'MESSENGER') {
        row = db.prepare(`
          SELECT business_id, workspace_id FROM meta_connections 
          WHERE page_id = ? AND status = 'CONNECTED'
          LIMIT 1
        `).get(assetId);
      }

      if (row) {
        return { businessId: row.business_id, workspaceId: row.workspace_id || row.business_id };
      }
    } catch (err) {
      logger.error('Error resolving tenant from asset ID:', err.message);
    }

    // STRICT MULTI-TENANT ISOLATION: Never guess or fall back to a default tenant
    logger.warn(`Tenant mapping missing for asset ID "${assetId}" on ${platform}. Rejecting safely.`);
    return null;
  },

  /**
   * Normalizes heterogeneous Meta webhook payloads into a unified schema
   * @param {object} body 
   * @returns {Array<NormalizedMessage>}
   */
  normalizeWebhookPayload(body) {
    if (!body || !body.entry) return [];
    const normalizedEvents = [];

    // ─────────────────────────────────────────────────────────────────
    // 1. WhatsApp Business Webhook Format
    // ─────────────────────────────────────────────────────────────────
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        const wabaId = entry.id;
        for (const change of entry.changes || []) {
          if (change.field !== 'messages') continue;
          const val = change.value || {};
          const phoneNumberId = val.metadata?.phone_number_id || wabaId;
          const tenant = this.resolveTenant('WHATSAPP', phoneNumberId);

          const contacts = val.contacts || [];
          const contactMap = {};
          contacts.forEach(c => { contactMap[c.wa_id] = c.profile?.name || c.wa_id; });

          for (const msg of val.messages || []) {
            const externalMsgId = msg.id;
            const senderPhone = msg.from;
            const senderName = contactMap[senderPhone] || senderPhone;
            let text = '';
            const attachments = [];

            if (msg.type === 'text') {
              text = msg.text?.body || '';
            } else if (msg.type === 'image') {
              text = msg.image?.caption || '';
              attachments.push({
                type: 'image',
                id: msg.image?.id,
                mimeType: msg.image?.mime_type,
                sha256: msg.image?.sha256,
                caption: msg.image?.caption || ''
              });
            } else if (msg.type === 'button') {
              text = msg.button?.text || '';
            } else if (msg.type === 'interactive') {
              text = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
            }

            normalizedEvents.push({
              platform: 'WHATSAPP',
              businessId: tenant?.businessId || null,
              workspaceId: tenant?.workspaceId || null,
              externalConversationId: `wa_conv_${senderPhone}`,
              externalMessageId: externalMsgId,
              messageText: text.trim(),
              messageType: msg.type || 'text',
              attachments,
              timestamp: msg.timestamp ? new Date(parseInt(msg.timestamp, 10) * 1000).toISOString() : new Date().toISOString(),
              sender: {
                id: senderPhone,
                name: senderName,
                phone: senderPhone
              },
              recipient: {
                id: phoneNumberId
              },
              metadata: {
                wabaId,
                phoneNumberId,
                rawType: msg.type
              }
            });
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // 2. Instagram & Facebook Messenger Webhook Format
    // ─────────────────────────────────────────────────────────────────
    else if (body.object === 'instagram' || body.object === 'page') {
      const isInstagram = body.object === 'instagram';
      const platform = isInstagram ? 'INSTAGRAM' : 'MESSENGER';

      for (const entry of body.entry) {
        const recipientPageOrIgId = entry.id;
        const tenant = this.resolveTenant(platform, recipientPageOrIgId);

        // Messaging array
        const messagingEvents = entry.messaging || [];
        for (const ev of messagingEvents) {
          if (!ev.message || ev.message.is_echo) continue;

          const externalMsgId = ev.message.mid;
          const senderId = ev.sender?.id;
          const text = ev.message.text || '';
          const attachments = (ev.message.attachments || []).map(a => ({
            type: a.type,
            url: a.payload?.url
          }));

          normalizedEvents.push({
            platform,
            businessId: tenant?.businessId || null,
            workspaceId: tenant?.workspaceId || null,
            externalConversationId: `${platform.toLowerCase()}_conv_${senderId}`,
            externalMessageId: externalMsgId,
            messageText: text.trim(),
            attachments,
            timestamp: ev.timestamp ? new Date(ev.timestamp).toISOString() : new Date().toISOString(),
            sender: {
              id: senderId,
              name: isInstagram ? `@user_${senderId.slice(-4)}` : `Customer ${senderId.slice(-4)}`,
              phone: null
            },
            recipient: {
              id: recipientPageOrIgId
            },
            metadata: {
              entryPageId: recipientPageOrIgId,
              isInstagram
            }
          });
        }
      }
    }

    return normalizedEvents;
  }
};
