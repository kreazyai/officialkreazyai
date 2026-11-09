import crypto from 'crypto';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { metaTokenService } from './metaTokenService.js';

const getGraphVersion = () => config.meta?.graphVersion || 'v26.0';
const getDialogUrl = () => `https://www.facebook.com/${getGraphVersion()}/dialog/oauth`;
const getGraphBase = () => `https://graph.facebook.com/${getGraphVersion()}`;

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
   * Verifies and unpacks a signed state token with strict cryptographic validation.
   * Prevents timing attacks, malformed base64, signature length manipulation, and future timestamps.
   * @param {string} stateString 
   * @returns {object} Unpacked and verified payload
   */
  verifySignedState(stateString) {
    if (!stateString || typeof stateString !== 'string' || stateString.trim().length === 0) {
      throw new Error('OAuth state token is missing or malformed');
    }

    let decoded;
    try {
      const jsonStr = Buffer.from(stateString, 'base64url').toString('utf8');
      decoded = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Malformed base64url or JSON in OAuth state: ${e.message}`);
    }

    if (!decoded || typeof decoded !== 'object' || typeof decoded.raw !== 'string' || typeof decoded.sig !== 'string') {
      throw new Error('OAuth state structure invalid — expected { raw, sig } object');
    }

    const { raw, sig } = decoded;

    // Validate signature length and hex format before timingSafeEqual (SHA-256 hex is exactly 64 chars)
    if (sig.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(sig)) {
      throw new Error('OAuth state signature format invalid');
    }

    const expectedSig = crypto
      .createHmac('sha256', config.auth.jwtSecret)
      .update(raw)
      .digest('hex');

    // Constant-time comparison to prevent side-channel timing attacks (CWE-208)
    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      throw new Error('State signature verification failed — cryptographic HMAC tampering detected');
    }

    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      throw new Error(`OAuth state raw payload is not valid JSON: ${e.message}`);
    }

    if (!payload || typeof payload !== 'object' || typeof payload.timestamp !== 'number') {
      throw new Error('OAuth state payload missing mandatory timestamp');
    }

    const now = Date.now();

    // Prevent future-timestamp bypass attacks (allow max 60s clock skew)
    if (payload.timestamp > now + 60 * 1000) {
      throw new Error('OAuth state timestamp is in the future — clock anomaly or forged token');
    }

    // Enforce 15-minute expiration TTL
    if (now - payload.timestamp > 15 * 60 * 1000) {
      throw new Error('OAuth state has expired (>15 min) — please initiate connection again');
    }

    return payload;
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

    const url = new URL(getDialogUrl());
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
    const url = new URL(`${getGraphBase()}/oauth/access_token`);
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
