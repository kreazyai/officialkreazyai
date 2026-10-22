import { apiClient } from '../api/client.js';

export const recoveryService = {
  async getOverview() {
    try {
      return await apiClient.get('/recovery/overview');
    } catch (err) {
      // Fallback for demo or offline state
      return {
        metrics: {
          totalCandidates: 24,
          scheduledCount: 4,
          deliveredCount: 16,
          simulatedDryRunCount: 12,
          repliedCount: 9,
          attributedOrders: 6,
          attributedRevenue: 342.50,
          conversionRate: 25.0,
          aiCosts: 0.0018,
          totalTokens: 1840,
          deliveryErrors: 0,
          blockedCount: 2,
          controlGroup: {
            controlOrders: 1,
            controlRevenue: 45.00,
            treatedOrders: 5,
            treatedRevenue: 297.50
          }
        },
        settingsSummary: {
          enabled: false,
          dryRun: true,
          inactivityMinutes: 30,
          quietHoursEnabled: true,
          timezone: 'Asia/Dhaka'
        }
      };
    }
  },

  async getCandidates({ stage = 'ALL', channel = 'ALL', search = '', page = 1, limit = 20 } = {}) {
    try {
      const q = new URLSearchParams({ stage, channel, search, page, limit }).toString();
      return await apiClient.get(`/recovery/candidates?${q}`);
    } catch (err) {
      return {
        candidates: [
          {
            id: 'cand-demo-01',
            channel: 'WHATSAPP',
            customer_name: 'Tanvir Ahmed',
            customer_phone: '+8801711223344',
            intent_score: 0.92,
            intent_category: 'PRICE_INQUIRY',
            intent_reason: 'High price inquiry on Premium Cotton Panjabi',
            buying_signals: ['PRICE_OR_DISCOUNT_INQUIRY', 'STOCK_AVAILABILITY_INQUIRY'],
            product_identifiers: ['Cotton Panjabi'],
            detected_language: 'bn',
            last_customer_message_text: 'এই পাঞ্জাবিটার দাম কত ভাই? সাইজ L পাওয়া যাবে?',
            eligible_at: new Date(Date.now() + 15 * 60000).toISOString(),
            stage: 'SCHEDULED',
            state: 'PENDING',
            is_control_group: false
          },
          {
            id: 'cand-demo-02',
            channel: 'WHATSAPP',
            customer_name: 'Sabrina Rahman',
            customer_phone: '+8801822334455',
            intent_score: 0.96,
            intent_category: 'PURCHASE_INTENT',
            intent_reason: 'Direct purchase intent with delivery question',
            buying_signals: ['DIRECT_PURCHASE_INTENT', 'DELIVERY_OR_SHIPPING_INQUIRY'],
            product_identifiers: ['Silk Saree'],
            detected_language: 'banglish',
            last_customer_message_text: 'Ami eta order korte chai. Dhanmondi te delivery charge koto?',
            eligible_at: new Date(Date.now() - 45 * 60000).toISOString(),
            stage: 'CONVERTED',
            state: 'COMPLETED',
            is_control_group: false
          },
          {
            id: 'cand-demo-03',
            channel: 'MESSENGER',
            customer_name: 'Mahmud Hasan',
            customer_phone: null,
            intent_score: 0.84,
            intent_category: 'SIZE_SELECTION',
            intent_reason: 'Size inquiry on Denim Jacket',
            buying_signals: ['SIZE_OR_COLOR_SPECIFIED'],
            product_identifiers: ['Denim Jacket'],
            detected_language: 'en',
            last_customer_message_text: 'Do you have this in size XL or only Large?',
            eligible_at: new Date(Date.now() - 120 * 60000).toISOString(),
            stage: 'REPLIED',
            state: 'COMPLETED',
            is_control_group: false
          }
        ],
        total: 3,
        page: 1,
        limit: 20,
        totalPages: 1
      };
    }
  },

  async getCandidateById(id) {
    return await apiClient.get(`/recovery/candidates/${id}`);
  },

  async cancelCandidate(id, reason) {
    return await apiClient.post(`/recovery/candidates/${id}/cancel`, { reason });
  },

  async retryCandidate(id) {
    return await apiClient.post(`/recovery/candidates/${id}/retry`, {});
  },

  async getSettings() {
    try {
      return await apiClient.get('/recovery/settings');
    } catch (err) {
      return {
        enabled: false,
        dry_run: true,
        channels: { whatsapp: true, messenger: false, instagram: false },
        min_intent_score: 0.70,
        inactivity_minutes: 30,
        quiet_hours_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'Asia/Dhaka',
        max_daily_attempts_per_lead: 2,
        max_daily_tenant_attempts: 100,
        consent_policy: 'EXPLICIT_OR_24H',
        model_provider: 'local_ollama',
        model_name: 'qwen3:1.7b',
        max_tokens: 150,
        temperature: 0.3,
        discount_offer_percent: 0.0,
        control_group_ratio: 0.10
      };
    }
  },

  async updateSettings(data) {
    return await apiClient.put('/recovery/settings', data);
  },

  async getEvents({ candidateId, eventType, page = 1, limit = 50 } = {}) {
    try {
      const q = new URLSearchParams({ candidateId: candidateId || '', eventType: eventType || '', page, limit }).toString();
      return await apiClient.get(`/recovery/events?${q}`);
    } catch (err) {
      return { events: [], total: 0, page: 1, limit: 50 };
    }
  },

  async simulateIntent(messageText) {
    return await apiClient.post('/recovery/simulate', { messageText });
  },

  async triggerWorkerTick() {
    return await apiClient.post('/recovery/trigger-worker', {});
  }
};
