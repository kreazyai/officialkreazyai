import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';

const META_GRAPH_VERSION = 'v21.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const messengerService = {
  /**
   * Send a text message via Meta's official Facebook Pages Messenger API.
   * @param {string} pageId 
   * @param {string} pageAccessToken 
   * @param {string} recipientPsid Page-Scoped ID
   * @param {string} text 
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendTextMessage(pageId, pageAccessToken, recipientPsid, text) {
    if (!pageAccessToken || !recipientPsid) {
      logger.warn('Messenger dispatch skipped: Missing pageAccessToken or recipientPsid');
      return { success: false, error: 'Facebook Messenger credentials or PSID missing' };
    }

    if (!config.meta.appId || pageAccessToken.startsWith('EAAG_mock')) {
      logger.info(`[SIMULATED MESSENGER OUTBOUND] Sent to PSID ${recipientPsid}: "${text}"`);
      return {
        success: true,
        messageId: `m_mid_${Date.now()}SIMULATED_FB`
      };
    }

    const url = `${META_GRAPH_BASE}/me/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pageAccessToken}`
        },
        body: JSON.stringify({
          recipient: { id: recipientPsid },
          message: { text },
          messaging_type: 'RESPONSE'
        }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || `HTTP ${response.status}`;
        logger.error(`Official Facebook Messenger API send failed: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      const messageId = data?.message_id;
      logger.info(`Facebook Messenger reply successfully dispatched to ${recipientPsid}`, { messageId });
      return { success: true, messageId };
    } catch (err) {
      logger.error('Network error dispatching Facebook Messenger reply:', err.message);
      return { success: false, error: err.message };
    }
  }
};
