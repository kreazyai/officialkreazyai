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
    const settings = await recoverySettingsService.getSettings(tenantId);
    const now = new Date().toISOString();

    // 1. Atomic Locking: claim candidate
    const lockResult = await db.prepare(`
      UPDATE recovery_candidates
      SET state = 'PROCESSING', version = version + 1, updated_at = ?
      WHERE id = ? AND version = ? AND state = 'PENDING'
    `).run(now, candidate.id, candidate.version);

    if (lockResult.changes === 0) {
      logger.info(`[RECOVERY SCHEDULER] Candidate ${candidate.id} already claimed by another worker.`);
      return { skipped: true, reason: 'CONCURRENT_WORKER_CLAIM' };
    }

    // Refresh candidate record
    const claimedCandidate = await db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(candidate.id);

    try {
      // 2. Check if Tenant Recovery Feature is Enabled (or in Dry-Run mode)
      if (!settings.enabled && !settings.dry_run) {
        await db.prepare(`
          UPDATE recovery_candidates SET state = 'PENDING', updated_at = ? WHERE id = ?
        `).run(new Date().toISOString(), claimedCandidate.id);
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
        const postNow = new Date().toISOString();

        await db.prepare(`
          UPDATE recovery_candidates 
          SET eligible_at = ?, state = 'PENDING', version = version + 1, updated_at = ?
          WHERE id = ?
        `).run(newEligibleAt, postNow, claimedCandidate.id);

        const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await db.prepare(`
          INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
          VALUES (?, ?, ?, 'RESCHEDULED', ?, ?)
        `).run(evId, tenantId, claimedCandidate.id, JSON.stringify({ reason: 'QUIET_HOURS', newEligibleAt }), postNow);

        logger.info(`[RECOVERY SCHEDULER] Quiet hours active for tenant ${tenantId}. Candidate ${claimedCandidate.id} rescheduled to ${newEligibleAt}`);
        return { postponed: true, reason: 'QUIET_HOURS', newEligibleAt };
      }

      // 4. Suppression Rule Checks
      // 4A: Check if customer replied after candidate was created
      const newerInbound = await db.prepare(`
        SELECT id, created_at, text FROM messages 
        WHERE conversation_id = ? AND sender != 'ai' AND direction = 'INBOUND' AND created_at > ?
        LIMIT 1
      `).get(claimedCandidate.conversation_id, claimedCandidate.last_customer_message_at);

      if (newerInbound) {
        await recoveryCandidateService.cancelActiveCandidates(tenantId, claimedCandidate.conversation_id, 'NEWER_CUSTOMER_MESSAGE');
        return { cancelled: true, reason: 'NEWER_CUSTOMER_MESSAGE' };
      }

      // 4B: Check Conversation Status (Human Handoff or Closed)
      const conv = await db.prepare('SELECT status FROM conversations WHERE id = ?').get(claimedCandidate.conversation_id);
      if (conv && (conv.status === 'NEEDS_HUMAN' || conv.status === 'CLOSED')) {
        await recoveryCandidateService.cancelActiveCandidates(tenantId, claimedCandidate.conversation_id, `CONVERSATION_${conv.status}`);
        return { cancelled: true, reason: `CONVERSATION_${conv.status}` };
      }

      // 4C: Check if Customer has placed an order since candidate creation
      if (claimedCandidate.customer_id) {
        const orderPlaced = await db.prepare(`
          SELECT id FROM orders 
          WHERE (business_id = ? OR tenant_id = ?) AND customer_id = ? AND created_at >= ?
          LIMIT 1
        `).get(tenantId, tenantId, claimedCandidate.customer_id, claimedCandidate.created_at);

        if (orderPlaced) {
          await recoveryCandidateService.cancelActiveCandidates(tenantId, claimedCandidate.conversation_id, 'ORDER_ALREADY_PLACED');
          return { cancelled: true, reason: 'ORDER_ALREADY_PLACED' };
        }
      }

      // 4D: Daily limits check
      const todayStart = new Date().toISOString().slice(0, 10);
      const attemptsRow = await db.prepare(`
        SELECT COUNT(*) as count FROM recovery_attempts 
        WHERE candidate_id = ? AND created_at >= ?
      `).get(claimedCandidate.id, todayStart);
      const attemptsCount = Number(attemptsRow?.count || 0);

      if (attemptsCount >= (settings.max_daily_attempts_per_lead || 2)) {
        await db.prepare(`
          UPDATE recovery_candidates SET stage = 'EXPIRED', state = 'COMPLETED', updated_at = ? WHERE id = ?
        `).run(new Date().toISOString(), claimedCandidate.id);
        return { cancelled: true, reason: 'MAX_DAILY_ATTEMPTS_EXCEEDED' };
      }

      // 5. Holdout Control Group Check
      if (claimedCandidate.is_control_group) {
        logger.info(`[RECOVERY CONTROL GROUP] Candidate ${claimedCandidate.id} held out in control group. Message NOT sent.`);
        const holdNow = new Date().toISOString();
        await db.prepare(`
          UPDATE recovery_candidates
          SET stage = 'DISPATCHED', state = 'COMPLETED', version = version + 1, updated_at = ?
          WHERE id = ?
        `).run(holdNow, claimedCandidate.id);

        const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await db.prepare(`
          INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
          VALUES (?, ?, ?, 'MESSAGE_DISPATCHED', ?, ?)
        `).run(evId, tenantId, claimedCandidate.id, JSON.stringify({ isControlGroup: true, note: 'Observed control holdout' }), holdNow);

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
      logger.error(`[RECOVERY SCHEDULER ERROR] Failed to process candidate ${claimedCandidate?.id}:`, procErr.message);
      if (claimedCandidate?.id) {
        await db.prepare(`
          UPDATE recovery_candidates SET state = 'FAILED', updated_at = ? WHERE id = ?
        `).run(new Date().toISOString(), claimedCandidate.id);
      }
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

    const candidates = await db.prepare(`
      SELECT * FROM recovery_candidates
      WHERE stage = 'SCHEDULED' 
        AND state = 'PENDING'
        AND eligible_at <= ?
      ORDER BY eligible_at ASC
      LIMIT ?
    `).all(now, limit);

    const candList = Array.isArray(candidates) ? candidates : [];

    let processed = 0;
    let successes = 0;
    let errors = 0;

    for (const cand of candList) {
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
