import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { recoverySettingsService } from '../services/recovery/recoverySettingsService.js';
import { recoveryCandidateService } from '../services/recovery/recoveryCandidateService.js';
import { recoveryAttributionService } from '../services/recovery/recoveryAttributionService.js';
import { highIntentDetector } from '../services/recovery/highIntentDetector.js';
import { recoveryAiComposer } from '../services/recovery/recoveryAiComposer.js';
import { recoverySchedulerService } from '../services/recovery/recoverySchedulerService.js';

export const recoveryController = {
  /**
   * GET /api/v1/recovery/overview
   */
  async getOverview(req, res, next) {
    try {
      const tenantId = req.businessId;
      if (!tenantId) {
        return errorResponse(res, 'Tenant context missing.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      const metrics = recoveryAttributionService.getOverviewMetrics(tenantId);
      const settings = recoverySettingsService.getSettings(tenantId);

      return successResponse(res, {
        metrics,
        settingsSummary: {
          enabled: settings.enabled,
          dryRun: settings.dry_run,
          inactivityMinutes: settings.inactivity_minutes,
          quietHoursEnabled: settings.quiet_hours_enabled,
          timezone: settings.timezone
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/recovery/candidates
   */
  async getCandidates(req, res, next) {
    try {
      const tenantId = req.businessId;
      const { stage, channel, search, page = 1, limit = 20 } = req.query;

      const result = recoveryCandidateService.queryCandidates(tenantId, {
        stage,
        channel,
        search,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });

      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/recovery/candidates/:id
   */
  async getCandidateById(req, res, next) {
    try {
      const tenantId = req.businessId;
      const { id } = req.params;

      const candidate = recoveryCandidateService.getById(tenantId, id);
      if (!candidate) {
        return errorResponse(res, 'Recovery candidate not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(res, candidate);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/recovery/candidates/:id/cancel
   */
  async cancelCandidate(req, res, next) {
    try {
      const tenantId = req.businessId;
      const { id } = req.params;
      const { reason = 'MANUAL_CANCELLATION' } = req.body || {};

      const db = getDatabase();
      const candidate = db.prepare('SELECT * FROM recovery_candidates WHERE tenant_id = ? AND id = ?').get(tenantId, id);

      if (!candidate) {
        return errorResponse(res, 'Recovery candidate not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      recoveryCandidateService.cancelActiveCandidates(tenantId, candidate.conversation_id, reason);
      const updated = recoveryCandidateService.getById(tenantId, id);

      return successResponse(res, updated, 'Candidate cancelled successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/recovery/candidates/:id/retry
   */
  async retryCandidate(req, res, next) {
    try {
      const tenantId = req.businessId;
      const { id } = req.params;

      const db = getDatabase();
      const candidate = db.prepare('SELECT * FROM recovery_candidates WHERE tenant_id = ? AND id = ?').get(tenantId, id);

      if (!candidate) {
        return errorResponse(res, 'Recovery candidate not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Reset to PENDING and eligible now
      db.prepare(`
        UPDATE recovery_candidates
        SET stage = 'SCHEDULED', state = 'PENDING', eligible_at = datetime('now'), version = version + 1, updated_at = datetime('now')
        WHERE id = ?
      `).run(id);

      // Trigger immediate processing
      const refreshed = db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(id);
      const result = await recoverySchedulerService.processCandidate(refreshed);

      return successResponse(res, { candidateId: id, result }, 'Candidate retry triggered successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/recovery/settings
   */
  async getSettings(req, res, next) {
    try {
      const tenantId = req.businessId;
      const settings = recoverySettingsService.getSettings(tenantId);
      return successResponse(res, settings);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/v1/recovery/settings
   */
  async updateSettings(req, res, next) {
    try {
      const tenantId = req.businessId;
      const updates = req.body || {};

      const updated = recoverySettingsService.updateSettings(tenantId, updates);
      return successResponse(res, updated, 'Recovery settings updated successfully.');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/recovery/events
   */
  async getEvents(req, res, next) {
    try {
      const tenantId = req.businessId;
      const { candidateId, eventType, page = 1, limit = 50 } = req.query;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
      const db = getDatabase();

      const conditions = ['tenant_id = ?'];
      const params = [tenantId];

      if (candidateId) {
        conditions.push('candidate_id = ?');
        params.push(candidateId);
      }

      if (eventType && eventType !== 'ALL') {
        conditions.push('event_type = ?');
        params.push(eventType);
      }

      const whereClause = conditions.join(' AND ');

      const count = db.prepare(`SELECT COUNT(*) as total FROM recovery_events WHERE ${whereClause}`).get(...params).total;
      const rows = db.prepare(`
        SELECT * FROM recovery_events 
        WHERE ${whereClause} 
        ORDER BY event_at DESC 
        LIMIT ? OFFSET ?
      `).all(...params, parseInt(limit, 10), offset);

      return successResponse(res, {
        events: rows.map(r => ({ ...r, metadata: JSON.parse(r.metadata || '{}') })),
        total: count,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/recovery/simulate
   * Diagnostic simulation endpoint for testing lead recognition and message composition without writing DB.
   */
  async simulateIntent(req, res, next) {
    try {
      const tenantId = req.businessId;
      const { messageText } = req.body;

      if (!messageText) {
        return errorResponse(res, 'messageText is required for simulation.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST);
      }

      const db = getDatabase();
      const catalog = db.prepare('SELECT id, name, sku, price, stock FROM products WHERE business_id = ? OR tenant_id = ? LIMIT 20').all(tenantId, tenantId);
      const settings = recoverySettingsService.getSettings(tenantId);

      const classification = await highIntentDetector.classifyMessage(messageText, { catalog });

      let draftMessage = null;
      if (classification.eligibleForRecovery) {
        const dummyCandidate = {
          id: 'sim-cand',
          tenant_id: tenantId,
          intent_category: classification.intentCategory,
          product_identifiers: classification.productIdentifiers,
          detected_language: classification.language,
          last_customer_message_text: messageText
        };
        const composition = await recoveryAiComposer.composeMessage({
          tenantId,
          candidate: dummyCandidate,
          settings
        });
        draftMessage = composition.messageText;
      }

      return successResponse(res, {
        classification,
        draftMessage,
        settingsSummary: {
          minIntentScore: settings.min_intent_score,
          inactivityMinutes: settings.inactivity_minutes,
          dryRun: settings.dry_run
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/recovery/trigger-worker
   */
  async triggerWorkerTick(req, res, next) {
    try {
      const result = await recoverySchedulerService.runWorkerTick(20);
      return successResponse(res, result, 'Recovery worker tick executed successfully.');
    } catch (err) {
      next(err);
    }
  }
};
