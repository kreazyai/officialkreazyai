import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';

const META_GRAPH_VERSION = 'v21.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const whatsappService = {
  /**
   * Send a text message via Meta's official WhatsApp Business Cloud API with bounded backoff retries.
   * @param {string} phoneNumberId 
   * @param {string} accessToken 
   * @param {string} recipientPhone E.164 phone string
   * @param {string} text Plain text message
   * @param {number} maxRetries Maximum retry attempts (default 3)
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string, attempts?: number }>}
   */
  async sendTextMessage(phoneNumberId, accessToken, recipientPhone, text, maxRetries = 3) {
    if (!phoneNumberId || !accessToken) {
      logger.warn('WhatsApp dispatch skipped: Missing phoneNumberId or accessToken');
      return { success: false, error: 'WhatsApp credentials not configured on connection' };
    }

    const cleanRecipient = recipientPhone.replace(/[^0-9]/g, '');

    // In dev simulation mode with mock token
    if (!config.meta.appId || accessToken.startsWith('EAAG_mock')) {
      logger.info(`[SIMULATED WHATSAPP OUTBOUND] Sent to ${cleanRecipient} via ${phoneNumberId}: "${text.slice(0, 80)}..."`);
      return {
        success: true,
        messageId: `wamid.HBgL${Date.now()}SIMULATED`,
        attempts: 1
      };
    }

    const url = `${META_GRAPH_BASE}/${phoneNumberId}/messages`;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanRecipient,
            type: 'text',
            text: {
              preview_url: false,
              body: text
            }
          }),
          signal: AbortSignal.timeout(10000)
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data?.error?.message || `HTTP ${response.status}`;
          lastError = errorMsg;
          logger.warn(`WhatsApp Cloud API attempt ${attempt}/${maxRetries} failed: ${errorMsg}`);
          
          // If rate limited or 5xx server error, retry with backoff
          if (response.status >= 500 || response.status === 429) {
            const delay = Math.min(1000, Math.pow(2, attempt) * 100 + Math.random() * 50);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
          // Non-retryable 4xx client errors (e.g., invalid phone format)
          return { success: false, error: errorMsg, attempts: attempt };
        }

        const messageId = data?.messages?.[0]?.id;
        logger.info(`WhatsApp message successfully dispatched to ${cleanRecipient}`, { messageId, attempts: attempt });
        return { success: true, messageId, attempts: attempt };
      } catch (err) {
        lastError = err.message;
        logger.warn(`Network error on WhatsApp dispatch attempt ${attempt}/${maxRetries}:`, err.message);
        if (attempt < maxRetries) {
          const delay = Math.min(1000, Math.pow(2, attempt) * 100 + Math.random() * 50);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    return { success: false, error: lastError || 'Max retries exhausted', attempts: attempt };
  },

  /**
   * Helper for bounded retry execution with customizable dispatch executor for testing and custom transports.
   */
  async sendTextMessageWithRetry(phoneNumberId, recipientPhone, text, maxRetries = 3, customSender = null) {
    if (customSender && typeof customSender === 'function') {
      let attempts = 0;
      let lastErr = null;
      while (attempts < maxRetries) {
        attempts++;
        try {
          return await customSender();
        } catch (err) {
          lastErr = err;
          const delay = Math.min(200, Math.pow(2, attempts) * 50);
          await new Promise(r => setTimeout(r, delay));
        }
      }
      return { success: false, error: lastErr?.message, attempts };
    }

    return this.sendTextMessage(phoneNumberId, config.meta.whatsappAccessToken || 'token', recipientPhone, text, maxRetries);
  },

  /**
   * Send media (image/document) via Meta WhatsApp Business Cloud API
   */
  async sendMediaMessage(phoneNumberId, accessToken, recipientPhone, mediaType, mediaUrl, caption = '') {
    if (!phoneNumberId || !accessToken) {
      return { success: false, error: 'Credentials not configured' };
    }

    const cleanRecipient = recipientPhone.replace(/[^0-9]/g, '');

    if (!config.meta.appId || accessToken.startsWith('EAAG_mock')) {
      logger.info(`[SIMULATED WHATSAPP MEDIA OUTBOUND] ${mediaType} sent to ${cleanRecipient}: ${mediaUrl}`);
      return { success: true, messageId: `wamid.HBgL${Date.now()}MEDIA_SIMULATED` };
    }

    const url = `${META_GRAPH_BASE}/${phoneNumberId}/messages`;
    try {
      const body = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanRecipient,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
          caption: caption || undefined
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data?.error?.message || `HTTP ${response.status}` };
      }
      return { success: true, messageId: data?.messages?.[0]?.id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Mark an incoming message as read on WhatsApp
   */
  async markAsRead(phoneNumberId, accessToken, messageId) {
    if (!config.meta.appId || !messageId || accessToken.startsWith('EAAG_mock')) return;

    try {
      await fetch(`${META_GRAPH_BASE}/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        })
      });
    } catch {
      // safe ignore read receipt failures
    }
  }
};
