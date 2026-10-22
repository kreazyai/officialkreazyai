import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { recoverySettingsService } from './recoverySettingsService.js';
import { recoveryAiComposer } from './recoveryAiComposer.js';
import { recoveryDeliveryService } from './recoveryDeliveryService.js';
import { recoveryCandidateService } from './recoveryCandidateService.js';

export const recoverySchedulerService = {
  /**
   * Process a single eligible recovery candidate with atomic locking and full suppression checks.
   * @param {object} candidate
   * @returns {Promise<object>}
   */
  async processCandidate(candidate) {
    const db = getDatabase();
    const tenantId = candidate.tenant_id;
    const settings = recoverySettingsService.getSettings(tenantId);

    // 1. Atomic Locking: claim candidate
    const lockResult = db.prepare(`
      UPDATE recovery_candidates
      SET state = 'PROCESSING', version = version + 1, updated_at = datetime('now')
      WHERE id = ? AND version = ? AND state = 'PENDING'
    `).run(candidate.id, candidate.version);

    if (lockResult.changes === 0) {
      logger.info(`[RECOVERY SCHEDULER] Candidate ${candidate.id} already claimed by another worker.`);
      return { skipped: true, reason: 'CONCURRENT_WORKER_CLAIM' };
    }

    // Refresh candidate record
    const claimedCandidate = db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(candidate.id);

    try {
      // 2. Check if Tenant Recovery Feature is Enabled (or in Dry-Run mode)
      if (!settings.enabled && !settings.dry_run) {
        db.prepare(`
          UPDATE recovery_candidates SET state = 'PENDING', updated_at = datetime('now') WHERE id = ?
        `).run(claimedCandidate.id);
        logger.info(`[RECOVERY SCHEDULER] Recovery automation disabled for tenant ${tenantId}. Candidate postponed.`);
        return { skipped: true, reason: 'FEATURE_DISABLED' };
      }

      // 3. Quiet Hours Check
      if (recoverySettingsService.isQuietHour(settings)) {
        // Calculate postponement to end of quiet hours
        const [endH, endM] = (settings.quiet_hours_end || '08:00').split(':').map(Number);
        const postponedDate = new Date();
        postponedDate.setHours(endH, endM, 0, 0);
        if (postponedDate.getTime() <= Date.now()) {
          postponedDate.setDate(postponedDate.getDate() + 1);
        }
        const newEligibleAt = postponedDate.toISOString();

        db.transaction(() => {
          db.prepare(`
            UPDATE recovery_candidates 
            SET eligible_at = ?, state = 'PENDING', version = version + 1, updated_at = datetime('now')
            WHERE id = ?
          `).run(newEligibleAt, claimedCandidate.id);

          const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          db.prepare(`
            INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
            VALUES (?, ?, ?, 'RESCHEDULED', ?, datetime('now'))
          `).run(evId, tenantId, claimedCandidate.id, JSON.stringify({ reason: 'QUIET_HOURS', newEligibleAt }));
        })();

        logger.info(`[RECOVERY SCHEDULER] Quiet hours active for tenant ${tenantId}. Candidate ${claimedCandidate.id} rescheduled to ${newEligibleAt}`);
        return { postponed: true, reason: 'QUIET_HOURS', newEligibleAt };
      }

      // 4. Suppression Rule Checks
      // 4A: Check if customer replied after candidate was created
      const newerInbound = db.prepare(`
        SELECT id, created_at, text FROM messages 
        WHERE conversation_id = ? AND sender != 'ai' AND direction = 'INBOUND' AND created_at > ?
        LIMIT 1
      `).get(claimedCandidate.conversation_id, claimedCandidate.last_customer_message_at);

      if (newerInbound) {
        recoveryCandidateService.cancelActiveCandidates(tenantId, claimedCandidate.conversation_id, 'NEWER_CUSTOMER_MESSAGE');
        return { cancelled: true, reason: 'NEWER_CUSTOMER_MESSAGE' };
      }

      // 4B: Check Conversation Status (Human Handoff or Closed)
      const conv = db.prepare('SELECT status FROM conversations WHERE id = ?').get(claimedCandidate.conversation_id);
      if (conv && (conv.status === 'NEEDS_HUMAN' || conv.status === 'CLOSED')) {
        recoveryCandidateService.cancelActiveCandidates(tenantId, claimedCandidate.conversation_id, `CONVERSATION_${conv.status}`);
        return { cancelled: true, reason: `CONVERSATION_${conv.status}` };
      }

      // 4C: Check if Customer has placed an order since candidate creation
      if (claimedCandidate.customer_id) {
        const orderPlaced = db.prepare(`
          SELECT id FROM orders 
          WHERE (business_id = ? OR tenant_id = ?) AND customer_id = ? AND created_at >= ?
          LIMIT 1
        `).get(tenantId, tenantId, claimedCandidate.customer_id, claimedCandidate.created_at);

        if (orderPlaced) {
          recoveryCandidateService.cancelActiveCandidates(tenantId, claimedCandidate.conversation_id, 'ORDER_ALREADY_PLACED');
          return { cancelled: true, reason: 'ORDER_ALREADY_PLACED' };
        }
      }

      // 4D: Daily limits check
      const todayStart = new Date().toISOString().slice(0, 10);
      const attemptsCount = db.prepare(`
        SELECT COUNT(*) as count FROM recovery_attempts 
        WHERE candidate_id = ? AND created_at >= ?
      `).get(claimedCandidate.id, todayStart).count;

      if (attemptsCount >= (settings.max_daily_attempts_per_lead || 2)) {
        db.prepare(`
          UPDATE recovery_candidates SET stage = 'EXPIRED', state = 'COMPLETED', updated_at = datetime('now') WHERE id = ?
        `).run(claimedCandidate.id);
        return { cancelled: true, reason: 'MAX_DAILY_ATTEMPTS_EXCEEDED' };
      }

      // 5. Holdout Control Group Check
      if (claimedCandidate.is_control_group) {
        logger.info(`[RECOVERY CONTROL GROUP] Candidate ${claimedCandidate.id} held out in control group. Message NOT sent.`);
        db.transaction(() => {
          db.prepare(`
            UPDATE recovery_candidates
            SET stage = 'DISPATCHED', state = 'COMPLETED', version = version + 1, updated_at = datetime('now')
            WHERE id = ?
          `).run(claimedCandidate.id);

          const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          db.prepare(`
            INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
            VALUES (?, ?, ?, 'MESSAGE_DISPATCHED', ?, datetime('now'))
          `).run(evId, tenantId, claimedCandidate.id, JSON.stringify({ isControlGroup: true, note: 'Observed control holdout' }));
        })();

        return { success: true, controlGroup: true };
      }

      // 6. Generate Message via AI Composer
      const composition = await recoveryAiComposer.composeMessage({
        tenantId,
        candidate: claimedCandidate,
        settings
      });

      // 7. Dispatch via Delivery Service
      const result = await recoveryDeliveryService.dispatch({
        tenantId,
        candidate: claimedCandidate,
        messageText: composition.messageText,
        composition
      });

      return result;
    } catch (procErr) {
      logger.error(`[RECOVERY SCHEDULER ERROR] Failed to process candidate ${claimedCandidate.id}:`, procErr.message);
      db.prepare(`
        UPDATE recovery_candidates SET state = 'FAILED', updated_at = datetime('now') WHERE id = ?
      `).run(claimedCandidate.id);
      throw procErr;
    }
  },

  /**
   * Worker tick: queries all eligible pending candidates and executes them safely.
   * @param {number} [limit=10]
   * @returns {Promise<{ processed: number, successes: number, errors: number }>}
   */
  async runWorkerTick(limit = 10) {
    const db = getDatabase();
    const now = new Date().toISOString();

    const candidates = db.prepare(`
      SELECT * FROM recovery_candidates
      WHERE stage = 'SCHEDULED' 
        AND state = 'PENDING'
        AND eligible_at <= ?
      ORDER BY eligible_at ASC
      LIMIT ?
    `).all(now, limit);

    let processed = 0;
    let successes = 0;
    let errors = 0;

    for (const cand of candidates) {
      try {
        const res = await this.processCandidate(cand);
        processed++;
        if (res.success || res.simulated) successes++;
      } catch (err) {
        errors++;
      }
    }

    if (processed > 0) {
      logger.info(`[RECOVERY WORKER TICK] Executed ${processed} candidates (${successes} ok, ${errors} err).`);
    }

    return { processed, successes, errors };
  }
};
