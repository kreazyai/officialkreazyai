import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { knowledgeService } from '../services/whatsapp/knowledgeService.js';
import { logger } from '../utils/logger.js';

export const aiSettingsController = {
  /**
   * GET /api/v1/ai/settings
   * Retrieves tenant AI Settings with platform guardrails
   */
  async getSettings(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const settings = knowledgeService.getTenantAiSettings(tenantId);
      return successResponse(res, settings);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/v1/ai/settings
   * Updates tenant AI Settings while enforcing non-overrideable platform security rules
   */
  async updateSettings(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const {
        system_instructions,
        tone,
        language_settings,
        confidence_threshold,
        handoff_rules
      } = req.body || {};

      // Guardrail Check: Block instruction injection attempts or bypassing safety
      if (system_instructions && /(bypass security|ignore platform rules|reveal tokens|disregard safety|allow unlimited discount)/i.test(system_instructions)) {
        logger.warn(`Rejected hazardous system instruction update for tenant ${tenantId}`);
        return errorResponse(res, 'System instructions cannot override platform safety constraints.', HTTP_STATUS.BAD_REQUEST, 'SECURITY_VIOLATION');
      }

      // Enforce confidence threshold range (0.50 to 0.95)
      let validatedThreshold = confidence_threshold !== undefined
        ? Math.min(0.95, Math.max(0.50, Number(confidence_threshold)))
        : 0.75;

      const db = getDatabase();
      const id = `aisett-${tenantId}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO ai_settings (
          id, tenant_id, system_instructions, tone, language_settings,
          confidence_threshold, handoff_rules, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(tenant_id) DO UPDATE SET
          system_instructions = COALESCE(?, ai_settings.system_instructions),
          tone = COALESCE(?, ai_settings.tone),
          language_settings = COALESCE(?, ai_settings.language_settings),
          confidence_threshold = COALESCE(?, ai_settings.confidence_threshold),
          handoff_rules = COALESCE(?, ai_settings.handoff_rules),
          updated_at = excluded.updated_at
      `).run(
        id,
        tenantId,
        system_instructions || 'Assist shoppers professionally with store products and policies.',
        tone || 'professional, courteous',
        JSON.stringify(language_settings || ['bn', 'en', 'banglish']),
        validatedThreshold,
        JSON.stringify(handoff_rules || {}),
        now,
        now,
        system_instructions,
        tone,
        language_settings ? JSON.stringify(language_settings) : null,
        validatedThreshold,
        handoff_rules ? JSON.stringify(handoff_rules) : null
      );

      knowledgeService.invalidateTenantCache(tenantId);
      const updated = knowledgeService.getTenantAiSettings(tenantId);

      return successResponse(res, updated, 'AI settings updated successfully');
    } catch (err) {
      next(err);
    }
  }
};
