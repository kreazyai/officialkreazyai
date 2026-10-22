import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { recoverySettingsService } from './recoverySettingsService.js';

export const CANDIDATE_STAGES = {
  IDENTIFIED: 'IDENTIFIED',
  SCHEDULED: 'SCHEDULED',
  EVALUATING: 'EVALUATING',
  DISPATCHED: 'DISPATCHED',
  REPLIED: 'REPLIED',
  CONVERTED: 'CONVERTED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

export const CANDIDATE_STATES = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

export const recoveryCandidateService = {
  /**
   * Process a classified message and create or update a recovery candidate.
   * @param {object} params
   * @returns {object|null} Candidate record or null if not eligible
   */
  registerIntent({
    tenantId,
    conversationId,
    channel = 'WHATSAPP',
    customerId = null,
    classification,
    messageText,
    messageTime = new Date().toISOString()
  }) {
    if (!tenantId || !conversationId) {
      throw new Error('Tenant ID and Conversation ID are required.');
    }

    const settings = recoverySettingsService.getSettings(tenantId);
    if (!classification || !classification.eligibleForRecovery || classification.intentScore < settings.min_intent_score) {
      return null;
    }

    const db = getDatabase();

    // Check if channel is enabled in tenant settings
    const channelsConfig = typeof settings.channels === 'string' ? JSON.parse(settings.channels || '{}') : settings.channels;
    const channelKey = (channel || 'whatsapp').toLowerCase();
    if (channelsConfig[channelKey] === false) {
      logger.info(`[CANDIDATE SKIPPED] Channel ${channel} is disabled in tenant ${tenantId} recovery settings.`);
      return null;
    }

    const inactivityMinutes = settings.inactivity_minutes || 30;
    const eligibleAt = new Date(new Date(messageTime).getTime() + inactivityMinutes * 60 * 1000).toISOString();
    const deduplicationKey = `${tenantId}_${conversationId}_${messageTime}`;

    // Holdout control group assignment
    const isControlGroup = Math.random() < (settings.control_group_ratio || 0.10) ? 1 : 0;

    const candidateId = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const candidate = db.transaction(() => {
      // Check if an active candidate already exists for this conversation
      const existing = db.prepare(`
        SELECT * FROM recovery_candidates 
        WHERE tenant_id = ? AND conversation_id = ? AND stage IN ('IDENTIFIED', 'SCHEDULED', 'EVALUATING')
        LIMIT 1
      `).get(tenantId, conversationId);

      if (existing) {
        // Update existing candidate with newer message and refresh inactivity delay
        db.prepare(`
          UPDATE recovery_candidates
          SET intent_score = MAX(intent_score, ?),
              intent_category = ?,
              intent_reason = ?,
              buying_signals = ?,
              product_identifiers = ?,
              detected_language = ?,
              last_customer_message_text = ?,
              last_customer_message_at = ?,
              eligible_at = ?,
              stage = 'SCHEDULED',
              state = 'PENDING',
              version = version + 1,
              updated_at = datetime('now')
          WHERE id = ?
        `).run(
          classification.intentScore,
          classification.intentCategory,
          classification.explanation,
          JSON.stringify(classification.buyingSignals || []),
          JSON.stringify(classification.productIdentifiers || []),
          classification.language || 'en',
          messageText,
          messageTime,
          eligibleAt,
          existing.id
        );

        // Record reschedule event
        const eventId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        db.prepare(`
          INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
          VALUES (?, ?, ?, 'RESCHEDULED', ?, datetime('now'))
        `).run(
          eventId,
          tenantId,
          existing.id,
          JSON.stringify({
            inactivityMinutes,
            eligibleAt,
            intentScore: classification.intentScore,
            intentCategory: classification.intentCategory
          })
        );

        return db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(existing.id);
      }

      // Insert fresh candidate
      db.prepare(`
        INSERT INTO recovery_candidates (
          id, tenant_id, conversation_id, channel, customer_id,
          intent_score, intent_category, intent_reason, buying_signals,
          product_identifiers, detected_language, last_customer_message_text,
          last_customer_message_at, eligible_at, stage, state, version,
          is_control_group, deduplication_key, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, 'SCHEDULED', 'PENDING', 1,
          ?, ?, datetime('now'), datetime('now')
        )
      `).run(
        candidateId,
        tenantId,
        conversationId,
        channel,
        customerId,
        classification.intentScore,
        classification.intentCategory,
        classification.explanation,
        JSON.stringify(classification.buyingSignals || []),
        JSON.stringify(classification.productIdentifiers || []),
        classification.language || 'en',
        messageText,
        messageTime,
        eligibleAt,
        isControlGroup,
        deduplicationKey
      );

      // Record INTENT_DETECTED and SCHEDULED events
      const ev1 = `ev-${Date.now()}-1`;
      db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, 'INTENT_DETECTED', ?, datetime('now'))
      `).run(
        ev1,
        tenantId,
        candidateId,
        JSON.stringify({
          intentScore: classification.intentScore,
          intentCategory: classification.intentCategory,
          buyingSignals: classification.buyingSignals,
          isControlGroup: Boolean(isControlGroup)
        })
      );

      const ev2 = `ev-${Date.now()}-2`;
      db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, 'SCHEDULED', ?, datetime('now'))
      `).run(
        ev2,
        tenantId,
        candidateId,
        JSON.stringify({
          eligibleAt,
          inactivityMinutes
        })
      );

      return db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(candidateId);
    })();

    logger.info(`[RECOVERY CANDIDATE] Lead ${candidate.id} registered for conv ${conversationId} (Eligible: ${eligibleAt}, Control: ${Boolean(isControlGroup)})`);
    return candidate;
  },

  /**
   * Cancel candidate if customer replies, purchases, escalates, or opts out.
   * @param {string} tenantId
   * @param {string} conversationId
   * @param {string} reason
   * @returns {number} number of candidates cancelled
   */
  cancelActiveCandidates(tenantId, conversationId, reason = 'CUSTOMER_REPLIED') {
    const db = getDatabase();

    const activeList = db.prepare(`
      SELECT id, stage FROM recovery_candidates
      WHERE tenant_id = ? AND conversation_id = ? AND stage IN ('IDENTIFIED', 'SCHEDULED', 'EVALUATING')
    `).all(tenantId, conversationId);

    if (activeList.length === 0) return 0;

    db.transaction(() => {
      for (const cand of activeList) {
        db.prepare(`
          UPDATE recovery_candidates
          SET stage = 'CANCELLED',
              state = 'COMPLETED',
              cancel_reason = ?,
              version = version + 1,
              updated_at = datetime('now')
          WHERE id = ?
        `).run(reason, cand.id);

        // Cancel any pending outbox items
        db.prepare(`
          UPDATE recovery_outbox
          SET status = 'CANCELLED', updated_at = datetime('now')
          WHERE candidate_id = ? AND status = 'QUEUED'
        `).run(cand.id);

        // Record CANCELLED event
        const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        db.prepare(`
          INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
          VALUES (?, ?, ?, 'CANCELLED', ?, datetime('now'))
        `).run(evId, tenantId, cand.id, JSON.stringify({ reason }));
      }
    })();

    logger.info(`[RECOVERY CANCELLED] Cancelled ${activeList.length} candidate(s) for conv ${conversationId} due to: ${reason}`);
    return activeList.length;
  },

  /**
   * Mark candidate as replied when customer sends a message following a recovery send.
   */
  markReplied(tenantId, conversationId) {
    const db = getDatabase();
    const candidate = db.prepare(`
      SELECT id FROM recovery_candidates
      WHERE tenant_id = ? AND conversation_id = ? AND stage = 'DISPATCHED'
      ORDER BY updated_at DESC LIMIT 1
    `).get(tenantId, conversationId);

    if (!candidate) return false;

    db.transaction(() => {
      db.prepare(`
        UPDATE recovery_candidates
        SET stage = 'REPLIED',
            version = version + 1,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(candidate.id);

      const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, 'CUSTOMER_REPLIED', '{}', datetime('now'))
      `).run(evId, tenantId, candidate.id);
    })();

    logger.info(`[RECOVERY REPLIED] Candidate ${candidate.id} marked as REPLIED.`);
    return true;
  },

  /**
   * Query candidate by ID with associated attempts and events.
   */
  getById(tenantId, candidateId) {
    const db = getDatabase();
    const candidate = db.prepare(`
      SELECT c.*, cust.full_name as customer_name, cust.phone as customer_phone, cust.email as customer_email
      FROM recovery_candidates c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      WHERE c.tenant_id = ? AND c.id = ?
    `).get(tenantId, candidateId);

    if (!candidate) return null;

    const attempts = db.prepare('SELECT * FROM recovery_attempts WHERE candidate_id = ? ORDER BY created_at DESC').all(candidateId);
    const events = db.prepare('SELECT * FROM recovery_events WHERE candidate_id = ? ORDER BY event_at DESC').all(candidateId);
    const attributions = db.prepare('SELECT * FROM recovery_attributions WHERE candidate_id = ?').all(candidateId);

    return {
      ...candidate,
      buying_signals: JSON.parse(candidate.buying_signals || '[]'),
      product_identifiers: JSON.parse(candidate.product_identifiers || '[]'),
      is_control_group: Boolean(candidate.is_control_group),
      attempts: attempts.map(a => ({
        ...a,
        policy_check_result: JSON.parse(a.policy_check_result || '{}')
      })),
      events: events.map(e => ({
        ...e,
        metadata: JSON.parse(e.metadata || '{}')
      })),
      attributions
    };
  },

  /**
   * Query list of candidates with server-side pagination and filters.
   */
  queryCandidates(tenantId, { stage, channel, search, page = 1, limit = 20 } = {}) {
    const db = getDatabase();
    const offset = (Math.max(1, page) - 1) * limit;

    const conditions = ['c.tenant_id = ?'];
    const params = [tenantId];

    if (stage && stage !== 'ALL') {
      conditions.push('c.stage = ?');
      params.push(stage);
    }

    if (channel && channel !== 'ALL') {
      conditions.push('c.channel = ?');
      params.push(channel);
    }

    if (search) {
      conditions.push('(c.intent_category LIKE ? OR c.last_customer_message_text LIKE ? OR cust.full_name LIKE ? OR cust.phone LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const whereClause = conditions.join(' AND ');

    const countRow = db.prepare(`
      SELECT COUNT(*) as total 
      FROM recovery_candidates c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      WHERE ${whereClause}
    `).get(...params);

    const rows = db.prepare(`
      SELECT c.*, cust.full_name as customer_name, cust.phone as customer_phone
      FROM recovery_candidates c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      WHERE ${whereClause}
      ORDER BY c.eligible_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return {
      candidates: rows.map(r => ({
        ...r,
        buying_signals: JSON.parse(r.buying_signals || '[]'),
        product_identifiers: JSON.parse(r.product_identifiers || '[]'),
        is_control_group: Boolean(r.is_control_group)
      })),
      total: countRow.total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRow.total / limit)
    };
  }
};
