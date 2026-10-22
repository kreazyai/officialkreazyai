import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export const POLICY_VERSION = '2026.1';

export const recoveryPolicyService = {
  /**
   * Evaluates channel-specific messaging compliance and permission.
   * @param {object} params
   * @param {string} params.tenantId
   * @param {string} params.channel WHATSAPP | MESSENGER | INSTAGRAM
   * @param {string} params.recipient phone or platform user ID
   * @param {string} params.lastCustomerMessageAt ISO string timestamp of customer's last message
   * @param {object} params.settings tenant recovery settings
   * @param {object} [params.customer] optional customer record
   * @returns {{ allowed: boolean, channel: string, reason: string, messageMode: 'FREE_FORM' | 'TEMPLATE' | 'BLOCKED', templateRequirement: object|null, policyVersion: string }}
   */
  evaluate({
    tenantId,
    channel = 'WHATSAPP',
    recipient,
    lastCustomerMessageAt,
    settings,
    customer = null
  }) {
    const ch = (channel || 'WHATSAPP').toUpperCase();

    // 1. Validate Recipient
    if (!recipient) {
      return {
        allowed: false,
        channel: ch,
        reason: 'MISSING_RECIPIENT_IDENTIFIER',
        messageMode: 'BLOCKED',
        templateRequirement: null,
        policyVersion: POLICY_VERSION
      };
    }

    // 2. Check Customer Opt-Out Status
    if (customer && customer.tags) {
      const tags = Array.isArray(customer.tags) ? customer.tags : JSON.parse(customer.tags || '[]');
      if (tags.some(t => ['optout', 'unsubscribed', 'do_not_disturb', 'blocked'].includes(String(t).toLowerCase()))) {
        return {
          allowed: false,
          channel: ch,
          reason: 'RECIPIENT_OPTED_OUT',
          messageMode: 'BLOCKED',
          templateRequirement: null,
          policyVersion: POLICY_VERSION
        };
      }
    }

    // 3. Calculate 24-Hour Service Window Elapsed Time
    const lastMsgTime = lastCustomerMessageAt ? new Date(lastCustomerMessageAt).getTime() : 0;
    const now = Date.now();
    const hoursElapsed = (now - lastMsgTime) / (1000 * 60 * 60);
    const isWithin24Hours = hoursElapsed >= 0 && hoursElapsed <= 24;

    // ─────────────────────────────────────────────────────────────────
    // A. WHATSAPP BUSINESS PLATFORM POLICY
    // ─────────────────────────────────────────────────────────────────
    if (ch === 'WHATSAPP') {
      if (isWithin24Hours) {
        // Free-form customer-service conversation allowed inside 24h
        return {
          allowed: true,
          channel: 'WHATSAPP',
          reason: 'WITHIN_24H_SERVICE_WINDOW',
          messageMode: 'FREE_FORM',
          templateRequirement: null,
          policyVersion: POLICY_VERSION
        };
      } else {
        // Outside 24h window: Meta Business Platform mandates an approved template (Marketing Category)
        const consentPolicy = settings?.consent_policy || 'EXPLICIT_OR_24H';
        
        // If policy is strictly 24H only, reject outside 24h
        if (consentPolicy === 'STRICT_24H_ONLY') {
          return {
            allowed: false,
            channel: 'WHATSAPP',
            reason: 'EXPIRED_24H_WINDOW_STRICT_POLICY',
            messageMode: 'BLOCKED',
            templateRequirement: null,
            policyVersion: POLICY_VERSION
          };
        }

        // Check if recipient has valid marketing opt-in
        const hasOptIn = customer?.opt_in_marketing || (customer?.source === 'WHATSAPP');
        if (!hasOptIn && consentPolicy === 'EXPLICIT_ONLY') {
          return {
            allowed: false,
            channel: 'WHATSAPP',
            reason: 'MISSING_EXPLICIT_MARKETING_OPT_IN',
            messageMode: 'BLOCKED',
            templateRequirement: null,
            policyVersion: POLICY_VERSION
          };
        }

        // Require applicable approved template
        return {
          allowed: true,
          channel: 'WHATSAPP',
          reason: 'OUTSIDE_24H_WINDOW_REQUIRES_APPROVED_TEMPLATE',
          messageMode: 'TEMPLATE',
          templateRequirement: {
            category: 'MARKETING',
            name: 'sales_recovery_followup',
            language: 'en_US'
          },
          policyVersion: POLICY_VERSION
        };
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // B. FACEBOOK MESSENGER POLICY
    // ─────────────────────────────────────────────────────────────────
    if (ch === 'MESSENGER') {
      if (isWithin24Hours) {
        // Standard Messaging 24h window applies
        return {
          allowed: true,
          channel: 'MESSENGER',
          reason: 'WITHIN_24H_MESSAGING_WINDOW',
          messageMode: 'FREE_FORM',
          templateRequirement: null,
          policyVersion: POLICY_VERSION
        };
      } else {
        // Meta prohibits proactive promotional messages outside 24h.
        // Message Tags (e.g. HUMAN_AGENT, CONFIRMED_EVENT_UPDATE) expressly forbid sales/marketing follow-ups.
        return {
          allowed: false,
          channel: 'MESSENGER',
          reason: 'OUTSIDE_24H_MESSAGING_WINDOW_PROACTIVE_MARKETING_RESTRICTED',
          messageMode: 'BLOCKED',
          templateRequirement: null,
          policyVersion: POLICY_VERSION
        };
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // C. INSTAGRAM DIRECT MESSAGE POLICY
    // ─────────────────────────────────────────────────────────────────
    if (ch === 'INSTAGRAM') {
      if (isWithin24Hours) {
        return {
          allowed: true,
          channel: 'INSTAGRAM',
          reason: 'WITHIN_24H_MESSAGING_WINDOW',
          messageMode: 'FREE_FORM',
          templateRequirement: null,
          policyVersion: POLICY_VERSION
        };
      } else {
        // Meta does not permit proactive marketing DMs outside 24h on Instagram.
        return {
          allowed: false,
          channel: 'INSTAGRAM',
          reason: 'OUTSIDE_24H_MESSAGING_WINDOW_PROACTIVE_MARKETING_RESTRICTED',
          messageMode: 'BLOCKED',
          templateRequirement: null,
          policyVersion: POLICY_VERSION
        };
      }
    }

    // Fallback for unknown channels
    return {
      allowed: false,
      channel: ch,
      reason: 'UNSUPPORTED_CHANNEL_POLICY',
      messageMode: 'BLOCKED',
      templateRequirement: null,
      policyVersion: POLICY_VERSION
    };
  }
};
