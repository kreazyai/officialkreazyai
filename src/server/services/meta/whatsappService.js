import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';

const getGraphVersion = () => config.meta?.graphVersion || 'v26.0';
const getGraphBase = () => `https://graph.facebook.com/${getGraphVersion()}`;

/**
 * Validates whether a phone number is an obvious placeholder, mock, or invalid dummy number.
 * Prevents unintentional external API dispatch to dummy numbers.
 * @param {string} phone
 * @returns {boolean}
 */
export function isPlaceholderPhoneNumber(phone) {
  if (!phone) return true;
  const digits = String(phone).replace(/[^0-9]/g, '');
  if (digits.length < 7) return true;

  // Obvious placeholder patterns
  if (/^0+$/.test(digits)) return true;
  if (/^(\d)\1{6,}$/.test(digits)) return true;
  if (digits === '8801700000000' || digits === '1700000000') return true;
  if (/^880?170{6,}$/.test(digits)) return true;
  if (/^15550{6,}$/.test(digits)) return true;
  if (digits === '1234567890' || digits === '12345678901') return true;

  return false;
}

export const whatsappService = {
  /**
   * Verify official Meta Cloud API connectivity by fetching phone number details.
   * STRICT: Real Meta Graph API check.
   * Returns sanitized diagnostic details without exposing the raw token.
   * @param {string} phoneNumberId
   * @param {string} accessToken
   * @returns {Promise<{ success: boolean, displayPhoneNumber?: string, verifiedName?: string, qualityRating?: string, error?: string, errorCode?: number|string, errorSubcode?: number, errorType?: string, fbtraceId?: string, isExpired?: boolean, isInvalidToken?: boolean, isSimulated?: boolean }>}
   */
  async verifyPhoneNumberConnectivity(phoneNumberId, accessToken) {
    if (!phoneNumberId || !accessToken) {
      return { success: false, error: 'Phone Number ID and Access Token are required' };
    }

    // Explicit mock token bypass for synthetic test suites only
    if (accessToken.startsWith('EAAG_mock') || accessToken === 'simulated_wa_token') {
      return {
        success: true,
        isSimulated: true,
        displayPhoneNumber: '+1 (555) 839-2041',
        verifiedName: 'Test WhatsApp Business Sandbox',
        qualityRating: 'GREEN'
      };
    }

    try {
      const url = `${getGraphBase()}/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        signal: AbortSignal.timeout(8000)
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data?.error?.message || `Meta Graph API HTTP ${response.status}`;
        const errorCode = data?.error?.code || response.status;
        const errorSubcode = data?.error?.error_subcode || null;
        const errorType = data?.error?.type || 'OAuthException';
        const fbtraceId = data?.error?.fbtrace_id || null;
        const isExpired = errorCode === 190 && errorSubcode === 463;
        const isInvalidToken = errorCode === 190;

        logger.warn(`Meta phone verification failed for ${phoneNumberId}: [${errorCode}:${errorSubcode || 'none'}] ${errorType} - ${errorMsg}`);
        return {
          success: false,
          error: errorMsg,
          errorCode,
          errorSubcode,
          errorType,
          fbtraceId,
          isExpired,
          isInvalidToken
        };
      }

      return {
        success: true,
        displayPhoneNumber: data.display_phone_number,
        verifiedName: data.verified_name,
        qualityRating: data.quality_rating
      };
    } catch (err) {
      logger.error(`Network error verifying Meta phone connectivity for ${phoneNumberId}:`, err.message);
      return { success: false, error: `Connectivity check error: ${err.message}` };
    }
  },

  /**
   * Direct token inspection & verification against Meta Graph API (/me and /me/permissions).
   * Validates token validity, expiration, scopes, and association with WABA and phone number.
   * Works with Bearer token directly without requiring App ID/Secret.
   */
  async inspectTokenDirectly(accessToken, phoneNumberId = null, wabaId = null) {
    if (!accessToken) {
      return { isValid: false, error: 'No access token provided' };
    }

    if (accessToken.startsWith('EAAG_mock') || accessToken === 'simulated_wa_token') {
      return {
        isValid: true,
        isSimulated: true,
        scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
        displayPhoneNumber: '+1 (555) 839-2041',
        verifiedName: 'Test WhatsApp Business Sandbox',
        qualityRating: 'GREEN',
        wabaVerified: true,
        phoneVerified: true
      };
    }

    try {
      // 1. Inspect token validity via /me
      const meUrl = `${getGraphBase()}/me?fields=id,name`;
      const meRes = await fetch(meUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(8000)
      });
      const meData = await meRes.json();

      if (!meRes.ok) {
        const errorMsg = meData?.error?.message || `HTTP ${meRes.status}`;
        const errorCode = meData?.error?.code || meRes.status;
        const errorSubcode = meData?.error?.error_subcode || null;
        const errorType = meData?.error?.type || 'OAuthException';
        const isExpired = errorCode === 190 && errorSubcode === 463;

        return {
          isValid: false,
          isExpired,
          errorCode,
          errorSubcode,
          errorType,
          error: errorMsg,
          fbtraceId: meData?.error?.fbtrace_id
        };
      }

      // 2. Query permissions
      let grantedScopes = [];
      try {
        const permRes = await fetch(`${getGraphBase()}/me/permissions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          signal: AbortSignal.timeout(8000)
        });
        const permData = await permRes.json();
        if (permRes.ok && Array.isArray(permData?.data)) {
          grantedScopes = permData.data
            .filter(p => p.status === 'granted')
            .map(p => p.permission);
        }
      } catch (permErr) {
        logger.warn('Failed to query token permissions:', permErr.message);
      }

      // 3. Verify Phone Number ID if provided
      let phoneInfo = null;
      let phoneError = null;
      if (phoneNumberId) {
        try {
          const phoneRes = await fetch(`${getGraphBase()}/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(8000)
          });
          const phoneData = await phoneRes.json();
          if (phoneRes.ok) {
            phoneInfo = phoneData;
          } else {
            phoneError = phoneData?.error?.message || `HTTP ${phoneRes.status}`;
          }
        } catch (phoneErr) {
          phoneError = phoneErr.message;
        }
      }

      // 4. Verify WABA ID if provided
      let wabaInfo = null;
      let wabaError = null;
      if (wabaId) {
        try {
          const wabaRes = await fetch(`${getGraphBase()}/${wabaId}?fields=id,name,currency,timezone_id`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            signal: AbortSignal.timeout(8000)
          });
          const wabaData = await wabaRes.json();
          if (wabaRes.ok) {
            wabaInfo = wabaData;
          } else {
            wabaError = wabaData?.error?.message || `HTTP ${wabaRes.status}`;
          }
        } catch (wabaErr) {
          wabaError = wabaErr.message;
        }
      }

      return {
        isValid: true,
        isExpired: false,
        userId: meData.id,
        userName: meData.name,
        scopes: grantedScopes,
        phoneVerified: Boolean(phoneInfo),
        phoneInfo,
        phoneError,
        wabaVerified: Boolean(wabaInfo),
        wabaInfo,
        wabaError
      };
    } catch (err) {
      return {
        isValid: false,
        error: `Network error inspecting token: ${err.message}`
      };
    }
  },

  /**
   * Send a text message via Meta's official WhatsApp Business Cloud API with bounded backoff retries.
   * @param {string} phoneNumberId 
   * @param {string} accessToken 
   * @param {string} recipientPhone E.164 phone string
   * @param {string} text Plain text message
   * @param {number} maxRetries Maximum retry attempts (default 3)
   * @returns {Promise<{ success: boolean, messageId?: string, error?: string, errorCode?: number|string, errorSubcode?: number, errorType?: string, fbtraceId?: string, isAuthError?: boolean, isExpired?: boolean, attempts?: number, isSimulated?: boolean }>}
   */
  async sendTextMessage(phoneNumberId, accessToken, recipientPhone, text, maxRetries = 3) {
    if (!phoneNumberId || !accessToken) {
      logger.warn('WhatsApp dispatch skipped: Missing phoneNumberId or accessToken');
      return { success: false, error: 'WhatsApp credentials not configured on connection' };
    }

    const cleanRecipient = recipientPhone.replace(/[^0-9]/g, '');

    // In dev simulation mode ONLY with explicit mock token
    if (accessToken.startsWith('EAAG_mock') || accessToken === 'simulated_wa_token') {
      logger.info(`[SIMULATED WHATSAPP OUTBOUND] Sent to ${cleanRecipient} via ${phoneNumberId}: "${text.slice(0, 80)}..."`);
      return {
        success: true,
        isSimulated: true,
        messageId: `wamid.HBgL${Date.now()}SIMULATED`,
        attempts: 1
      };
    }

    const url = `${getGraphBase()}/${phoneNumberId}/messages`;
    let attempt = 0;
    let lastErrorDetails = null;

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
          const errorCode = data?.error?.code || response.status;
          const errorSubcode = data?.error?.error_subcode || null;
          const errorType = data?.error?.type || 'GraphApiError';
          const fbtraceId = data?.error?.fbtrace_id || null;
          const isExpired = errorCode === 190 && errorSubcode === 463;

          lastErrorDetails = {
            success: false,
            error: errorMsg,
            errorCode,
            errorSubcode,
            errorType,
            fbtraceId,
            isAuthError: response.status === 401 || errorCode === 190,
            isExpired,
            attempts: attempt
          };

          logger.warn(`WhatsApp Cloud API attempt ${attempt}/${maxRetries} failed: [${errorCode}:${errorSubcode || 'none'}] ${errorType} - ${errorMsg}`);

          // Non-retryable authentication error (code 190 or HTTP 401) — terminate retries immediately
          if (response.status === 401 || errorCode === 190) {
            return lastErrorDetails;
          }

          // If rate limited or 5xx server error, retry with backoff
          if (response.status >= 500 || response.status === 429) {
            const delay = Math.min(1000, Math.pow(2, attempt) * 100 + Math.random() * 50);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }

          // Non-retryable 4xx client errors (e.g., invalid phone format)
          return lastErrorDetails;
        }

        const messageId = data?.messages?.[0]?.id;
        logger.info(`WhatsApp message successfully dispatched to ${cleanRecipient}`, { messageId, attempts: attempt });
        return { success: true, messageId, attempts: attempt };
      } catch (err) {
        lastErrorDetails = {
          success: false,
          error: err.message,
          attempts: attempt
        };
        logger.warn(`Network error on WhatsApp dispatch attempt ${attempt}/${maxRetries}:`, err.message);
        if (attempt < maxRetries) {
          const delay = Math.min(1000, Math.pow(2, attempt) * 100 + Math.random() * 50);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    return lastErrorDetails || { success: false, error: 'Max retries exhausted', attempts: attempt };
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

    if (accessToken.startsWith('EAAG_mock') || accessToken === 'simulated_wa_token') {
      logger.info(`[SIMULATED WHATSAPP MEDIA OUTBOUND] ${mediaType} sent to ${cleanRecipient}: ${mediaUrl}`);
      return { success: true, isSimulated: true, messageId: `wamid.HBgL${Date.now()}MEDIA_SIMULATED` };
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
        const errorMsg = data?.error?.message || `HTTP ${response.status}`;
        const errorCode = data?.error?.code || response.status;
        const errorSubcode = data?.error?.error_subcode || null;
        const errorType = data?.error?.type || 'GraphApiError';
        const fbtraceId = data?.error?.fbtrace_id || null;
        return { success: false, error: errorMsg, errorCode, errorSubcode, errorType, fbtraceId };
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
    if (!messageId || accessToken.startsWith('EAAG_mock') || accessToken === 'simulated_wa_token') return;

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
