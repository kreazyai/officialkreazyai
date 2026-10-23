import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { aiService } from '../services/aiService.js';
import { config } from '../config/env.js';
import { getTenantId } from '../middleware/auth.js';

export const aiController = {
  async chat(req, res, next) {
    try {
      const { message, context = {} } = req.body;
      const businessId = getTenantId(req);

      if (!businessId) {
        return errorResponse(res, 'Authentication required: business workspace context not found.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      if (!message || !message.trim()) {
        return errorResponse(res, 'Message text is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const result = await aiService.processMessage(businessId, message.trim(), context);
      return successResponse(res, result);
    } catch (err) {
      if (config.ai.provider === 'ollama') {
        return errorResponse(
          res,
          err.message || 'Ollama AI generation failed.',
          API_ERROR_CODES.INTERNAL_ERROR,
          HTTP_STATUS.BAD_GATEWAY,
          { provider: 'ollama', error: err.message }
        );
      }
      next(err);
    }
  },

  async getConfig(req, res, next) {
    try {
      const db = getDatabase();
      const businessId = req.businessId;

      let config = db.prepare('SELECT * FROM ai_configs WHERE business_id = ?').get(businessId);

      if (!config) {
        const id = `aiconfig-${Date.now()}`;
        const now = new Date().toISOString();
        db.prepare(`
          INSERT INTO ai_configs (id, business_id, assistant_name, brand_voice, return_days, return_policy, shipping_info, max_discount, auto_reply_enabled, created_at, updated_at)
          VALUES (?, ?, 'Kreazy AI Assistant', 'Professional, concise, courteous', '14', 'Returns accepted within 14 days of receipt on unused items with tags attached.', 'Standard shipping 2-4 business days. Free delivery over $75.', 10.0, 1, ?, ?)
        `).run(id, businessId, now, now);

        config = db.prepare('SELECT * FROM ai_configs WHERE business_id = ?').get(businessId);
      }

      return successResponse(res, {
        general: {
          assistantName: config.assistant_name,
          brandVoice: config.brand_voice,
          autoReply: Boolean(config.auto_reply_enabled)
        },
        knowledge: {
          returnDays: config.return_days,
          returnPolicy: config.return_policy,
          shippingInfo: config.shipping_info
        },
        safety: {
          maxDiscount: config.max_discount.toString()
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async updateConfig(req, res, next) {
    try {
      const { general, knowledge, safety } = req.body;
      const businessId = req.businessId;
      const db = getDatabase();

      const assistantName = general?.assistantName?.trim() || 'Kreazy AI Assistant';
      const brandVoice = general?.brandVoice?.trim() || 'Professional, courteous';
      const autoReply = general?.autoReply ? 1 : 0;
      const returnDays = knowledge?.returnDays?.trim() || '14';
      const returnPolicy = knowledge?.returnPolicy?.trim() || '';
      const shippingInfo = knowledge?.shippingInfo?.trim() || '';
      const maxDiscount = parseFloat(safety?.maxDiscount || 10.0);
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO ai_configs (id, business_id, assistant_name, brand_voice, return_days, return_policy, shipping_info, max_discount, auto_reply_enabled, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(business_id) DO UPDATE SET
          assistant_name = excluded.assistant_name,
          brand_voice = excluded.brand_voice,
          return_days = excluded.return_days,
          return_policy = excluded.return_policy,
          shipping_info = excluded.shipping_info,
          max_discount = excluded.max_discount,
          auto_reply_enabled = excluded.auto_reply_enabled,
          updated_at = excluded.updated_at
      `).run(
        `aiconfig-${Date.now()}`,
        businessId,
        assistantName,
        brandVoice,
        returnDays,
        returnPolicy,
        shippingInfo,
        maxDiscount,
        autoReply,
        now,
        now
      );

      return successResponse(res, {
        general: { assistantName, brandVoice, autoReply: Boolean(autoReply) },
        knowledge: { returnDays, returnPolicy, shippingInfo },
        safety: { maxDiscount: maxDiscount.toString() }
      });
    } catch (err) {
      next(err);
    }
  }
};
