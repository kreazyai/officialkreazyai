import crypto from 'crypto';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { metaTokenService } from './metaTokenService.js';

const META_GRAPH_VERSION = 'v21.0';
const META_DIALOG_URL = `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth`;
const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

// Scopes required for each asset domain
export const META_SCOPES = {
  WHATSAPP: [
    'whatsapp_business_management',
    'whatsapp_business_messaging',
    'business_management'
  ],
  INSTAGRAM: [
    'instagram_basic',
    'instagram_manage_messages',
    'pages_show_list',
    'pages_read_engagement'
  ],
  MESSENGER: [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'pages_messaging'
  ],
  ALL: [
    'whatsapp_business_management',
    'whatsapp_business_messaging',
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_metadata',
    'pages_messaging',
    'instagram_basic',
    'instagram_manage_messages',
    'business_management'
  ]
};

export const metaAuthService = {
  /**
   * Generates a tamper-proof signed state token for Meta OAuth
   */
  generateSignedState(payload) {
    const raw = JSON.stringify({
      ...payload,
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    });

    const signature = crypto
      .createHmac('sha256', config.auth.jwtSecret)
      .update(raw)
      .digest('hex');

    return Buffer.from(JSON.stringify({ raw, sig: signature })).toString('base64url');
  },

  /**
   * Verifies and unpacks a signed state token
   */
  verifySignedState(stateString) {
    try {
      const decoded = JSON.parse(Buffer.from(stateString, 'base64url').toString('utf8'));
      const expectedSig = crypto
        .createHmac('sha256', config.auth.jwtSecret)
        .update(decoded.raw)
        .digest('hex');

      if (decoded.sig !== expectedSig) {
        throw new Error('State signature verification failed — potential CSRF');
      }

      const payload = JSON.parse(decoded.raw);
      // Ensure state is not older than 15 minutes
      if (Date.now() - payload.timestamp > 15 * 60 * 1000) {
        throw new Error('OAuth state expired — please initiate connection again');
      }

      return payload;
    } catch (err) {
      logger.warn('Failed to verify Meta OAuth state:', err.message);
      throw new Error(`Invalid OAuth state: ${err.message}`);
    }
  },

  /**
   * Generate official Meta OAuth authorization URL
   * @param {string} businessId 
   * @param {string} workspaceId 
   * @param {'WHATSAPP'|'INSTAGRAM'|'MESSENGER'|'ALL'} platform 
   * @returns {{ authUrl: string, state: string }}
   */
  generateAuthorizationUrl(businessId, workspaceId, platform = 'ALL') {
    const { appId, redirectUri } = config.meta;
    const requestedPlatform = (platform || 'ALL').toUpperCase();
    const scopesList = META_SCOPES[requestedPlatform] || META_SCOPES.ALL;
    const scopeString = scopesList.join(',');

    const state = this.generateSignedState({
      businessId,
      workspaceId,
      platform: requestedPlatform
    });

    if (!appId) {
      // In dev without Meta App ID configured, point to synthetic callback with a test code
      const fallbackUrl = `${redirectUri}?code=mock_auth_code_demo&state=${state}&simulated=true`;
      return {
        authUrl: fallbackUrl,
        state,
        isSimulated: true
      };
    }

    const url = new URL(META_DIALOG_URL);
    url.searchParams.append('client_id', appId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', scopeString);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('auth_type', 'rerequest'); // allow re-granting declined permissions

    return {
      authUrl: url.toString(),
      state,
      isSimulated: false
    };
  },

  /**
   * Exchanges authorization code for Meta User Access Token
   * @param {string} code 
   * @returns {Promise<{ accessToken: string, expiresIn: number }>}
   */
  async exchangeCodeForToken(code) {
    if (code === 'mock_auth_code_demo' || !config.meta.appId) {
      return {
        accessToken: `EAAG_mock_long_lived_token_${Date.now()}`,
        expiresIn: 5184000
      };
    }

    const { appId, appSecret, redirectUri } = config.meta;
    const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
    url.searchParams.append('client_id', appId);
    url.searchParams.append('client_secret', appSecret);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('code', code);

    const res = await fetch(url.toString(), { method: 'GET' });
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || `HTTP ${res.status} exchanging authorization code`);
    }

    // Immediately exchange the short-lived user token for a long-lived user token (60 days)
    return await metaTokenService.exchangeForLongLivedToken(data.access_token);
  }
};
