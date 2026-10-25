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
   * Compatible with both sync SQLite and async PostgreSQL.
   */
  registerIntent(params) {
    const { tenantId } = params;
    if (!tenantId || !params.conversationId) {
      throw new Error('Tenant ID and Conversation ID are required.');
    }

    const settingsRes = recoverySettingsService.getSettings(tenantId);
    if (settingsRes instanceof Promise) {
      return (async () => {
        const settings = await settingsRes;
        return this._executeRegisterIntent(params, settings);
      })();
    }

    return this._executeRegisterIntent(params, settingsRes);
  },

  async _executeRegisterIntentAsync(params, settings) {
    const {
      tenantId,
      conversationId,
      channel = 'WHATSAPP',
      customerId = null,
      classification,
      messageText,
      messageTime = new Date().toISOString()
    } = params;

    if (!classification || !classification.eligibleForRecovery || classification.intentScore < settings.min_intent_score) {
      return null;
    }

    const db = getDatabase();
    const channelsConfig = typeof settings.channels === 'string' ? JSON.parse(settings.channels || '{}') : settings.channels;
    const channelKey = (channel || 'whatsapp').toLowerCase();
    if (channelsConfig[channelKey] === false) {
      logger.info(`[CANDIDATE SKIPPED] Channel ${channel} is disabled in tenant ${tenantId} recovery settings.`);
      return null;
    }

    const inactivityMinutes = settings.inactivity_minutes || 30;
    const eligibleAt = new Date(new Date(messageTime).getTime() + inactivityMinutes * 60 * 1000).toISOString();
    const deduplicationKey = `${tenantId}_${conversationId}_${messageTime}`;
    const isControlGroup = Math.random() < (settings.control_group_ratio || 0.10) ? 1 : 0;
    const candidateId = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const existing = await db.prepare(`
      SELECT * FROM recovery_candidates 
      WHERE tenant_id = ? AND conversation_id = ? AND stage IN ('IDENTIFIED', 'SCHEDULED', 'EVALUATING')
      LIMIT 1
    `).get(tenantId, conversationId);

    if (existing) {
      await db.prepare(`
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
            updated_at = ?
        WHERE id = ?
      `).run(
        classification.intentScore, classification.intentCategory, classification.explanation,
        JSON.stringify(classification.buyingSignals || []), JSON.stringify(classification.productIdentifiers || []),
        classification.language || 'en', messageText, messageTime, eligibleAt, now, existing.id
      );

      const eventId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, 'RESCHEDULED', ?, ?)
      `).run(
        eventId, tenantId, existing.id,
        JSON.stringify({ inactivityMinutes, eligibleAt, intentScore: classification.intentScore, intentCategory: classification.intentCategory }),
        now
      );

      return await db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(existing.id);
    }

    await db.prepare(`
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
        ?, ?, ?, ?
      )
    `).run(
      candidateId, tenantId, conversationId, channel, customerId,
      classification.intentScore, classification.intentCategory, classification.explanation,
      JSON.stringify(classification.buyingSignals || []), JSON.stringify(classification.productIdentifiers || []),
      classification.language || 'en', messageText, messageTime, eligibleAt, isControlGroup, deduplicationKey,
      now, now
    );

    const ev1 = `ev-${Date.now()}-1`;
    await db.prepare(`
      INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
      VALUES (?, ?, ?, 'INTENT_DETECTED', ?, ?)
    `).run(
      ev1, tenantId, candidateId,
      JSON.stringify({ intentScore: classification.intentScore, intentCategory: classification.intentCategory, buyingSignals: classification.buyingSignals, isControlGroup: Boolean(isControlGroup) }),
      now
    );

    const ev2 = `ev-${Date.now()}-2`;
    await db.prepare(`
      INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
      VALUES (?, ?, ?, 'SCHEDULED', ?, ?)
    `).run(
      ev2, tenantId, candidateId,
      JSON.stringify({ eligibleAt, inactivityMinutes }),
      now
    );

    return await db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(candidateId);
  },

  _executeRegisterIntent(params, settings) {
    const db = getDatabase();
    if (db.isPostgres) {
      return this._executeRegisterIntentAsync(params, settings);
    }

    const {
      tenantId,
      conversationId,
      channel = 'WHATSAPP',
      customerId = null,
      classification,
      messageText,
      messageTime = new Date().toISOString()
    } = params;

    if (!classification || !classification.eligibleForRecovery || classification.intentScore < settings.min_intent_score) {
      return null;
    }

    const channelsConfig = typeof settings.channels === 'string' ? JSON.parse(settings.channels || '{}') : settings.channels;
    const channelKey = (channel || 'whatsapp').toLowerCase();
    if (channelsConfig[channelKey] === false) {
      logger.info(`[CANDIDATE SKIPPED] Channel ${channel} is disabled in tenant ${tenantId} recovery settings.`);
      return null;
    }

    const inactivityMinutes = settings.inactivity_minutes || 30;
    const eligibleAt = new Date(new Date(messageTime).getTime() + inactivityMinutes * 60 * 1000).toISOString();
    const deduplicationKey = `${tenantId}_${conversationId}_${messageTime}`;
    const isControlGroup = Math.random() < (settings.control_group_ratio || 0.10) ? 1 : 0;
    const candidateId = `cand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const existing = db.prepare(`
      SELECT * FROM recovery_candidates 
      WHERE tenant_id = ? AND conversation_id = ? AND stage IN ('IDENTIFIED', 'SCHEDULED', 'EVALUATING')
      LIMIT 1
    `).get(tenantId, conversationId);

    if (existing) {
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
            updated_at = ?
        WHERE id = ?
      `).run(
        classification.intentScore, classification.intentCategory, classification.explanation,
        JSON.stringify(classification.buyingSignals || []), JSON.stringify(classification.productIdentifiers || []),
        classification.language || 'en', messageText, messageTime, eligibleAt, now, existing.id
      );

      const eventId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, 'RESCHEDULED', ?, ?)
      `).run(
        eventId, tenantId, existing.id,
        JSON.stringify({ inactivityMinutes, eligibleAt, intentScore: classification.intentScore, intentCategory: classification.intentCategory }),
        now
      );

      return db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(existing.id);
    }

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
        ?, ?, ?, ?
      )
    `).run(
      candidateId, tenantId, conversationId, channel, customerId,
      classification.intentScore, classification.intentCategory, classification.explanation,
      JSON.stringify(classification.buyingSignals || []), JSON.stringify(classification.productIdentifiers || []),
      classification.language || 'en', messageText, messageTime, eligibleAt, isControlGroup, deduplicationKey,
      now, now
    );

    const ev1 = `ev-${Date.now()}-1`;
    db.prepare(`
      INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
      VALUES (?, ?, ?, 'INTENT_DETECTED', ?, ?)
    `).run(
      ev1, tenantId, candidateId,
      JSON.stringify({ intentScore: classification.intentScore, intentCategory: classification.intentCategory, buyingSignals: classification.buyingSignals, isControlGroup: Boolean(isControlGroup) }),
      now
    );

    const ev2 = `ev-${Date.now()}-2`;
    db.prepare(`
      INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
      VALUES (?, ?, ?, 'SCHEDULED', ?, ?)
    `).run(
      ev2, tenantId, candidateId,
      JSON.stringify({ eligibleAt, inactivityMinutes }),
      now
    );

    return db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(candidateId);
  },

  /**
   * Cancel candidate if customer replies, purchases, escalates, or opts out.
   */
  cancelActiveCandidates(tenantId, conversationId, reason = 'CUSTOMER_REPLIED') {
    const db = getDatabase();

    const activeListRaw = db.prepare(`
      SELECT id, stage FROM recovery_candidates
      WHERE tenant_id = ? AND conversation_id = ? AND stage IN ('IDENTIFIED', 'SCHEDULED', 'EVALUATING')
    `).all(tenantId, conversationId);

    if (activeListRaw instanceof Promise) {
      return (async () => {
        const activeList = await activeListRaw;
        const candidates = Array.isArray(activeList) ? activeList : [];
        if (candidates.length === 0) return 0;

        const now = new Date().toISOString();
        for (const cand of candidates) {
          await db.prepare(`
            UPDATE recovery_candidates
            SET stage = 'CANCELLED', state = 'COMPLETED', cancel_reason = ?, version = version + 1, updated_at = ?
            WHERE id = ?
          `).run(reason, now, cand.id);

          await db.prepare(`
            UPDATE recovery_outbox SET status = 'CANCELLED', updated_at = ? WHERE candidate_id = ? AND status = 'QUEUED'
          `).run(now, cand.id);

          const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          await db.prepare(`
            INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
            VALUES (?, ?, ?, 'CANCELLED', ?, ?)
          `).run(evId, tenantId, cand.id, JSON.stringify({ reason }), now);
        }
        return candidates.length;
      })();
    }

    const candidates = Array.isArray(activeListRaw) ? activeListRaw : [];
    if (candidates.length === 0) return 0;

    const now = new Date().toISOString();
    for (const cand of candidates) {
      db.prepare(`
        UPDATE recovery_candidates
        SET stage = 'CANCELLED', state = 'COMPLETED', cancel_reason = ?, version = version + 1, updated_at = ?
        WHERE id = ?
      `).run(reason, now, cand.id);

      db.prepare(`
        UPDATE recovery_outbox SET status = 'CANCELLED', updated_at = ? WHERE candidate_id = ? AND status = 'QUEUED'
      `).run(now, cand.id);

      const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, 'CANCELLED', ?, ?)
      `).run(evId, tenantId, cand.id, JSON.stringify({ reason }), now);
    }
    return candidates.length;
  },

  /**
   * Mark candidate as replied when customer sends a message following a recovery send.
   */
  markReplied(tenantId, conversationId) {
    const db = getDatabase();
    const candidateRaw = db.prepare(`
      SELECT id FROM recovery_candidates
      WHERE tenant_id = ? AND conversation_id = ? AND stage = 'DISPATCHED'
      ORDER BY updated_at DESC LIMIT 1
    `).get(tenantId, conversationId);

    if (candidateRaw instanceof Promise) {
      return (async () => {
        const candidate = await candidateRaw;
        if (!candidate) return false;
        const now = new Date().toISOString();
        await db.prepare(`
          UPDATE recovery_candidates SET stage = 'REPLIED', version = version + 1, updated_at = ? WHERE id = ?
        `).run(now, candidate.id);
        const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        await db.prepare(`
          INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
          VALUES (?, ?, ?, 'CUSTOMER_REPLIED', '{}', ?)
        `).run(evId, tenantId, candidate.id, now);
        return true;
      })();
    }

    if (!candidateRaw) return false;
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE recovery_candidates SET stage = 'REPLIED', version = version + 1, updated_at = ? WHERE id = ?
    `).run(now, candidateRaw.id);
    const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    db.prepare(`
      INSERT INTO recovery_events (id, tenant_id, candidate_id, event_type, metadata, created_at)
      VALUES (?, ?, ?, 'CUSTOMER_REPLIED', '{}', ?)
    `).run(evId, tenantId, candidateRaw.id, now);
    return true;
  },

  /**
   * Query candidate by ID with associated attempts and events.
   */
  getById(tenantId, candidateId) {
    const db = getDatabase();
    const candidateRaw = db.prepare(`
      SELECT c.*, cust.full_name as customer_name, cust.phone as customer_phone, cust.email as customer_email
      FROM recovery_candidates c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      WHERE c.tenant_id = ? AND c.id = ?
    `).get(tenantId, candidateId);

    if (candidateRaw instanceof Promise) {
      return (async () => {
        const candidate = await candidateRaw;
        if (!candidate) return null;
        const attempts = (await db.prepare('SELECT * FROM recovery_attempts WHERE candidate_id = ? ORDER BY created_at DESC').all(candidateId)) || [];
        const events = (await db.prepare('SELECT * FROM recovery_events WHERE candidate_id = ? ORDER BY created_at DESC').all(candidateId)) || [];
        const attributions = (await db.prepare('SELECT * FROM recovery_attributions WHERE candidate_id = ?').all(candidateId)) || [];
        return {
          ...candidate,
          buying_signals: JSON.parse(candidate.buying_signals || '[]'),
          product_identifiers: JSON.parse(candidate.product_identifiers || '[]'),
          is_control_group: Boolean(candidate.is_control_group),
          attempts: attempts.map(a => ({ ...a, policy_check_result: JSON.parse(a.policy_check_result || '{}') })),
          events: events.map(e => ({ ...e, metadata: JSON.parse(e.metadata || '{}') })),
          attributions
        };
      })();
    }

    if (!candidateRaw) return null;
    const attempts = db.prepare('SELECT * FROM recovery_attempts WHERE candidate_id = ? ORDER BY created_at DESC').all(candidateId) || [];
    const events = db.prepare('SELECT * FROM recovery_events WHERE candidate_id = ? ORDER BY created_at DESC').all(candidateId) || [];
    const attributions = db.prepare('SELECT * FROM recovery_attributions WHERE candidate_id = ?').all(candidateId) || [];

    return {
      ...candidateRaw,
      buying_signals: JSON.parse(candidateRaw.buying_signals || '[]'),
      product_identifiers: JSON.parse(candidateRaw.product_identifiers || '[]'),
      is_control_group: Boolean(candidateRaw.is_control_group),
      attempts: attempts.map(a => ({ ...a, policy_check_result: JSON.parse(a.policy_check_result || '{}') })),
      events: events.map(e => ({ ...e, metadata: JSON.parse(e.metadata || '{}') })),
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

    const countRaw = db.prepare(`
      SELECT COUNT(*) as total 
      FROM recovery_candidates c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      WHERE ${whereClause}
    `).get(...params);

    if (countRaw instanceof Promise) {
      return (async () => {
        const countRow = await countRaw;
        const rows = (await db.prepare(`
          SELECT c.*, cust.full_name as customer_name, cust.phone as customer_phone
          FROM recovery_candidates c
          LEFT JOIN customers cust ON c.customer_id = cust.id
          WHERE ${whereClause}
          ORDER BY c.eligible_at DESC
          LIMIT ? OFFSET ?
        `).all(...params, limit, offset)) || [];

        const total = Number(countRow?.total || 0);
        return {
          candidates: rows.map(r => ({
            ...r,
            buying_signals: JSON.parse(r.buying_signals || '[]'),
            product_identifiers: JSON.parse(r.product_identifiers || '[]'),
            is_control_group: Boolean(r.is_control_group)
          })),
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / limit)
        };
      })();
    }

    const countRow = countRaw;
    const rows = db.prepare(`
      SELECT c.*, cust.full_name as customer_name, cust.phone as customer_phone
      FROM recovery_candidates c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      WHERE ${whereClause}
      ORDER BY c.eligible_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset) || [];

    const total = Number(countRow?.total || 0);
    return {
      candidates: rows.map(r => ({
        ...r,
        buying_signals: JSON.parse(r.buying_signals || '[]'),
        product_identifiers: JSON.parse(r.product_identifiers || '[]'),
        is_control_group: Boolean(r.is_control_group)
      })),
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }
};
