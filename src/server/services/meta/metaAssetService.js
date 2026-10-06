import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';

const META_GRAPH_VERSION = 'v21.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const metaAssetService = {
  /**
   * Fetch all Facebook Pages managed by the authorized user
   * @param {string} userAccessToken 
   * @returns {Promise<Array<{ id: string, name: string, accessToken: string, category: string }>>}
   */
  async getFacebookPages(userAccessToken) {
    if (!config.meta.appId || userAccessToken.startsWith('EAAG_mock')) {
      return [
        {
          id: 'page_1092837465',
          name: 'Kreazy Flagship Store Official',
          accessToken: userAccessToken,
          category: 'Retail & E-commerce'
        }
      ];
    }

    const url = new URL(`${META_GRAPH_BASE}/me/accounts`);
    url.searchParams.append('fields', 'id,name,access_token,category,tasks');
    url.searchParams.append('access_token', userAccessToken);

    try {
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `Failed to fetch Facebook Pages: ${res.status}`);
      }
      return (data.data || []).map(p => ({
        id: p.id,
        name: p.name,
        accessToken: p.access_token,
        category: p.category
      }));
    } catch (err) {
      logger.error('Error fetching Facebook Pages:', err.message);
      return [];
    }
  },

  /**
   * Fetch connected Instagram Professional account for a given Facebook Page
   * @param {string} pageId 
   * @param {string} pageAccessToken 
   * @returns {Promise<{ id: string, username: string, name: string }|null>}
   */
  async getInstagramAccount(pageId, pageAccessToken) {
    if (!config.meta.appId || pageAccessToken.startsWith('EAAG_mock')) {
      return {
        id: 'ig_99281726354',
        username: 'kreazy.brand.official',
        name: 'Kreazy Brand'
      };
    }

    const url = new URL(`${META_GRAPH_BASE}/${pageId}`);
    url.searchParams.append('fields', 'instagram_business_account{id,username,name,profile_picture_url}');
    url.searchParams.append('access_token', pageAccessToken);

    try {
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok || data.error) {
        logger.warn(`Could not fetch Instagram account for Page ${pageId}:`, data.error?.message);
        return null;
      }
      const ig = data.instagram_business_account;
      if (!ig) return null;
      return {
        id: ig.id,
        username: ig.username,
        name: ig.name
      };
    } catch (err) {
      logger.error(`Error querying Instagram business account for Page ${pageId}:`, err.message);
      return null;
    }
  },

  /**
   * Fetch WhatsApp Business Accounts and verified phone numbers
   * @param {string} userAccessToken 
   * @returns {Promise<Array<{ wabaId: string, name: string, phoneNumbers: Array<{ id: string, displayPhone: string, verifiedName: string }> }>>}
   */
  async getWhatsAppBusinessAccounts(userAccessToken) {
    if (!config.meta.appId || userAccessToken.startsWith('EAAG_mock')) {
      return [
        {
          wabaId: 'waba_88291029384',
          name: 'Kreazy Studio WhatsApp Business',
          phoneNumbers: [
            {
              id: 'phone_77281928374',
              displayPhone: '+1 (555) 839-2041',
              verifiedName: 'Kreazy AI Official'
            }
          ]
        }
      ];
    }

    const url = new URL(`${META_GRAPH_BASE}/me/businesses`);
    url.searchParams.append('fields', 'id,name,client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name}}');
    url.searchParams.append('access_token', userAccessToken);

    try {
      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok || data.error) {
        logger.warn('Could not fetch WABAs from /me/businesses:', data.error?.message);
        return [];
      }

      const results = [];
      const businesses = data.data || [];
      for (const b of businesses) {
        const wabas = b.client_whatsapp_business_accounts?.data || [];
        for (const w of wabas) {
          results.push({
            wabaId: w.id,
            name: w.name,
            phoneNumbers: (w.phone_numbers?.data || []).map(p => ({
              id: p.id,
              displayPhone: p.display_phone_number,
              verifiedName: p.verified_name
            }))
          });
        }
      }
      return results;
    } catch (err) {
      logger.error('Error fetching WhatsApp Business Accounts:', err.message);
      return [];
    }
  },

  /**
   * Automatically subscribe a Facebook Page to KreazyAI Webhook events
   * @param {string} pageId 
   * @param {string} pageAccessToken 
   */
  async subscribePageToWebhooks(pageId, pageAccessToken) {
    if (!config.meta.appId || pageAccessToken.startsWith('EAAG_mock')) {
      return { success: true, subscribed: true };
    }

    const url = `${META_GRAPH_BASE}/${pageId}/subscribed_apps`;
    const fields = 'messages,messaging_postbacks,message_reactions,message_deliveries,message_reads,messaging_handovers';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: pageAccessToken,
          subscribed_fields: fields
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        logger.warn(`Failed to subscribe Page ${pageId} to webhooks:`, data.error?.message);
        return { success: false, error: data.error?.message };
      }
      return { success: true, subscribed: Boolean(data.success) };
    } catch (err) {
      logger.error(`Error subscribing Page ${pageId} to webhooks:`, err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Automatically subscribe a WhatsApp Business Account to KreazyAI Webhook events
   * @param {string} wabaId 
   * @param {string} accessToken 
   */
  async subscribeWabaToWebhooks(wabaId, accessToken) {
    if (!config.meta.appId || accessToken.startsWith('EAAG_mock')) {
      return { success: true, subscribed: true };
    }

    const url = `${META_GRAPH_BASE}/${wabaId}/subscribed_apps`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        logger.warn(`Failed to subscribe WABA ${wabaId} to webhooks:`, data.error?.message);
        return { success: false, error: data.error?.message };
      }
      return { success: true, subscribed: Boolean(data.success) };
    } catch (err) {
      logger.error(`Error subscribing WABA ${wabaId} to webhooks:`, err.message);
      return { success: false, error: err.message };
    }
  }
};
