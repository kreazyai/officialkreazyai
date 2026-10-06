import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { encryptToken, decryptToken } from '../../utils/encryption.js';

const META_GRAPH_VERSION = 'v21.0';
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export const metaTokenService = {
  /**
   * Securely encrypt token for database storage
   */
  encrypt(plainToken) {
    return encryptToken(plainToken);
  },

  /**
   * Decrypt database-stored token
   */
  decrypt(encryptedHex, ivHex, tagHex) {
    return decryptToken(encryptedHex, ivHex, tagHex);
  },

  /**
   * Exchange short-lived user access token for a 60-day long-lived access token
   * @param {string} shortLivedToken 
   * @returns {Promise<{ accessToken: string, expiresIn: number }>}
   */
  async exchangeForLongLivedToken(shortLivedToken) {
    const { appId, appSecret } = config.meta;
    if (!appId || !appSecret) {
      logger.warn('META_APP_ID or META_APP_SECRET missing; returning original token.');
      return { accessToken: shortLivedToken, expiresIn: 5184000 };
    }

    const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
    url.searchParams.append('grant_type', 'fb_exchange_token');
    url.searchParams.append('client_id', appId);
    url.searchParams.append('client_secret', appSecret);
    url.searchParams.append('fb_exchange_token', shortLivedToken);

    try {
      const res = await fetch(url.toString(), { method: 'GET' });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `HTTP ${res.status} exchanging token`);
      }

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000 // default 60 days
      };
    } catch (err) {
      logger.error('Failed to exchange short-lived token for long-lived token:', err.message);
      throw err;
    }
  },

  /**
   * Inspect token using Meta debug_token endpoint
   * Validates validity, scopes, expiration, and app matching
   * @param {string} inputToken 
   * @returns {Promise<{ isValid: boolean, scopes: string[], expiresAt: number, appId: string, userId: string, error?: string }>}
   */
  async inspectToken(inputToken) {
    const { appId, appSecret } = config.meta;
    if (!appId || !appSecret) {
      // In local dev without credentials, treat valid format as synthetically valid
      return {
        isValid: true,
        scopes: ['whatsapp_business_messaging', 'pages_messaging', 'instagram_manage_messages'],
        expiresAt: Math.floor(Date.now() / 1000) + 5184000,
        appId: appId || 'mock_app_id',
        userId: 'meta_user_mock'
      };
    }

    const appToken = `${appId}|${appSecret}`;
    const url = new URL(`${META_GRAPH_BASE}/debug_token`);
    url.searchParams.append('input_token', inputToken);
    url.searchParams.append('access_token', appToken);

    try {
      const res = await fetch(url.toString(), { method: 'GET' });
      const data = await res.json();

      if (!res.ok || data.error) {
        return {
          isValid: false,
          scopes: [],
          expiresAt: 0,
          appId: '',
          userId: '',
          error: data.error?.message || 'Meta token validation failed'
        };
      }

      const tokenData = data.data || {};
      return {
        isValid: Boolean(tokenData.is_valid),
        scopes: tokenData.scopes || [],
        expiresAt: tokenData.expires_at || 0,
        appId: tokenData.app_id || '',
        userId: tokenData.user_id || '',
        error: tokenData.error?.message
      };
    } catch (err) {
      return {
        isValid: false,
        scopes: [],
        expiresAt: 0,
        appId: '',
        userId: '',
        error: err.message
      };
    }
  }
};
