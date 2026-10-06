import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';

const META_GRAPH_VERSION = 'v21.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const instagramService = {
  /**
   * Send a text message via Meta's official Instagram Messaging API.
   * @param {string} pageOrIgId 
   * @param {string} accessToken 
   * @param {string} recipientIgScopedId 
   * @param {string} text 
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
   */
  async sendTextMessage(pageOrIgId, accessToken, recipientIgScopedId, text) {
    if (!accessToken || !recipientIgScopedId) {
      logger.warn('Instagram dispatch skipped: Missing accessToken or recipientIgScopedId');
      return { success: false, error: 'Instagram credentials or recipient ID missing' };
    }

    if (!config.meta.appId || accessToken.startsWith('EAAG_mock')) {
      logger.info(`[SIMULATED INSTAGRAM OUTBOUND] Sent to @${recipientIgScopedId}: "${text}"`);
      return {
        success: true,
        messageId: `a_mid_${Date.now()}SIMULATED_IG`
      };
    }

    const url = `${META_GRAPH_BASE}/me/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          recipient: { id: recipientIgScopedId },
          message: { text }
        }),
        signal: AbortSignal.timeout(10000)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.error?.message || `HTTP ${response.status}`;
        logger.error(`Official Instagram Graph API send failed: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }

      const messageId = data?.message_id;
      logger.info(`Instagram DM successfully dispatched to ${recipientIgScopedId}`, { messageId });
      return { success: true, messageId };
    } catch (err) {
      logger.error('Network error dispatching Instagram DM:', err.message);
      return { success: false, error: err.message };
    }
  }
};
