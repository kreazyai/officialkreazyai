import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { recoveryCandidateService } from './recoveryCandidateService.js';

export const recoveryAttributionService = {
  /**
   * Attribute a confirmed order to a recovery attempt within the attribution window.
   * Compatible with both sync SQLite and async PostgreSQL.
   */
  attributeOrder(params) {
    const {
      tenantId,
      orderId,
      orderValue,
      currency = 'USD',
      customerId = null,
      customerPhone = null,
      windowHours = 72
    } = params;

    if (!tenantId || !orderId) {
      throw new Error('Tenant ID and Order ID are required for order attribution.');
    }

    const db = getDatabase();

    const existingRaw = db.prepare('SELECT * FROM recovery_attributions WHERE tenant_id = ? AND order_id = ?').get(tenantId, orderId);

    if (existingRaw instanceof Promise) {
      return (async () => {
        const existing = await existingRaw;
        if (existing) {
          logger.info(`[RECOVERY ATTRIBUTION] Order ${orderId} already attributed. Skipping duplicate.`);
          return existing;
        }
        return this._executeAttributeOrderAsync(db, params);
      })();
    }

    if (existingRaw) {
      logger.info(`[RECOVERY ATTRIBUTION] Order ${orderId} already attributed. Skipping duplicate.`);
      return existingRaw;
    }

    return this._executeAttributeOrderSync(db, params);
  },

  async _executeAttributeOrderAsync(db, { tenantId, orderId, orderValue, currency, customerId, customerPhone, windowHours = 72 }) {
    const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

    let candidate = null;
    if (customerId) {
      candidate = await db.prepare(`
        SELECT * FROM recovery_candidates
        WHERE tenant_id = ? 
          AND customer_id = ?
          AND updated_at >= ?
          AND stage IN ('SCHEDULED', 'DISPATCHED', 'REPLIED')
        ORDER BY updated_at DESC LIMIT 1
      `).get(tenantId, customerId, windowStart);
    }

    if (!candidate && customerPhone) {
      const cleanPhone = String(customerPhone).replace(/[^0-9]/g, '');
      candidate = await db.prepare(`
        SELECT c.* FROM recovery_candidates c
        JOIN customers cust ON c.customer_id = cust.id
        WHERE c.tenant_id = ?
          AND cust.phone = ?
          AND c.updated_at >= ?
          AND c.stage IN ('SCHEDULED', 'DISPATCHED', 'REPLIED')
        ORDER BY c.updated_at DESC LIMIT 1
      `).get(tenantId, cleanPhone, windowStart);
    }

    if (!candidate) {
      logger.info(`[RECOVERY ATTRIBUTION] No active recovery candidate found for order ${orderId} in 72h window.`);
      return null;
    }

    const latestAttempt = await db.prepare(`
      SELECT * FROM recovery_attempts 
      WHERE candidate_id = ? 
      ORDER BY attempted_at DESC LIMIT 1
    `).get(candidate.id);

    const attrId = `attr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const isControl = candidate.is_control_group ? 1 : 0;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO recovery_attributions (
        id, tenant_id, candidate_id, attempt_id, order_id, order_value,
        currency, attributed_at, attribution_method, is_control_group, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, 'LAST_TOUCH', ?, ?
      )
    `).run(
      attrId, tenantId, candidate.id, latestAttempt ? latestAttempt.id : null,
      orderId, orderValue, currency, now, isControl, now
    );

    await db.prepare(`
      UPDATE recovery_candidates SET stage = 'CONVERTED', version = version + 1, updated_at = ? WHERE id = ?
    `).run(now, candidate.id);

    const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await db.prepare(`
      INSERT INTO recovery_events (id, tenant_id, candidate_id, attempt_id, event_type, metadata, created_at)
      VALUES (?, ?, ?, ?, 'ORDER_ATTRIBUTED', ?, ?)
    `).run(
      evId, tenantId, candidate.id, latestAttempt ? latestAttempt.id : null,
      JSON.stringify({ orderId, orderValue, currency, isControlGroup: Boolean(isControl) }), now
    );

    await recoveryCandidateService.cancelActiveCandidates(tenantId, candidate.conversation_id, 'ORDER_CONFIRMED');

    const attribution = await db.prepare('SELECT * FROM recovery_attributions WHERE id = ?').get(attrId);
    logger.info(`[RECOVERY ATTRIBUTED] Order ${orderId} ($${orderValue}) attributed to candidate ${candidate.id}`);
    return attribution;
  },

  _executeAttributeOrderSync(db, { tenantId, orderId, orderValue, currency, customerId, customerPhone, windowHours = 72 }) {
    const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

    let candidate = null;
    if (customerId) {
      candidate = db.prepare(`
        SELECT * FROM recovery_candidates
        WHERE tenant_id = ? 
          AND customer_id = ?
          AND updated_at >= ?
          AND stage IN ('SCHEDULED', 'DISPATCHED', 'REPLIED')
        ORDER BY updated_at DESC LIMIT 1
      `).get(tenantId, customerId, windowStart);
    }

    if (!candidate && customerPhone) {
      const cleanPhone = String(customerPhone).replace(/[^0-9]/g, '');
      candidate = db.prepare(`
        SELECT c.* FROM recovery_candidates c
        JOIN customers cust ON c.customer_id = cust.id
        WHERE c.tenant_id = ?
          AND cust.phone = ?
          AND c.updated_at >= ?
          AND c.stage IN ('SCHEDULED', 'DISPATCHED', 'REPLIED')
        ORDER BY c.updated_at DESC LIMIT 1
      `).get(tenantId, cleanPhone, windowStart);
    }

    if (!candidate) {
      logger.info(`[RECOVERY ATTRIBUTION] No active recovery candidate found for order ${orderId} in 72h window.`);
      return null;
    }

    const latestAttempt = db.prepare(`
      SELECT * FROM recovery_attempts 
      WHERE candidate_id = ? 
      ORDER BY attempted_at DESC LIMIT 1
    `).get(candidate.id);

    const attrId = `attr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const isControl = candidate.is_control_group ? 1 : 0;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO recovery_attributions (
        id, tenant_id, candidate_id, attempt_id, order_id, order_value,
        currency, attributed_at, attribution_method, is_control_group, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, 'LAST_TOUCH', ?, ?
      )
    `).run(
      attrId, tenantId, candidate.id, latestAttempt ? latestAttempt.id : null,
      orderId, orderValue, currency, now, isControl, now
    );

    db.prepare(`
      UPDATE recovery_candidates SET stage = 'CONVERTED', version = version + 1, updated_at = ? WHERE id = ?
    `).run(now, candidate.id);

    const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    db.prepare(`
      INSERT INTO recovery_events (id, tenant_id, candidate_id, attempt_id, event_type, metadata, created_at)
      VALUES (?, ?, ?, ?, 'ORDER_ATTRIBUTED', ?, ?)
    `).run(
      evId, tenantId, candidate.id, latestAttempt ? latestAttempt.id : null,
      JSON.stringify({ orderId, orderValue, currency, isControlGroup: Boolean(isControl) }), now
    );

    recoveryCandidateService.cancelActiveCandidates(tenantId, candidate.conversation_id, 'ORDER_CONFIRMED');

    const attribution = db.prepare('SELECT * FROM recovery_attributions WHERE id = ?').get(attrId);
    logger.info(`[RECOVERY ATTRIBUTED] Order ${orderId} ($${orderValue}) attributed to candidate ${candidate.id}`);
    return attribution;
  },

  /**
   * Get overview recovery metrics for a tenant.
   * Compatible with both sync SQLite and async PostgreSQL.
   */
  getOverviewMetrics(tenantId) {
    const db = getDatabase();

    const countsRaw = db.prepare(`
      SELECT 
        COUNT(*) as totalCandidates,
        SUM(CASE WHEN stage = 'SCHEDULED' THEN 1 ELSE 0 END) as scheduledCount,
        SUM(CASE WHEN stage = 'DISPATCHED' OR stage = 'REPLIED' OR stage = 'CONVERTED' THEN 1 ELSE 0 END) as sentCount,
        SUM(CASE WHEN stage = 'REPLIED' OR stage = 'CONVERTED' THEN 1 ELSE 0 END) as repliedCount,
        SUM(CASE WHEN stage = 'CONVERTED' THEN 1 ELSE 0 END) as convertedCount,
        SUM(CASE WHEN stage = 'CANCELLED' THEN 1 ELSE 0 END) as cancelledCount
      FROM recovery_candidates
      WHERE tenant_id = ?
    `).get(tenantId);

    if (countsRaw instanceof Promise) {
      return (async () => {
        const counts = await countsRaw;
        const attributions = await db.prepare(`
          SELECT 
            COUNT(*) as totalOrders,
            COALESCE(SUM(order_value), 0) as totalRevenue,
            SUM(CASE WHEN is_control_group = 1 THEN 1 ELSE 0 END) as controlOrders,
            COALESCE(SUM(CASE WHEN is_control_group = 1 THEN order_value ELSE 0 END), 0) as controlRevenue
          FROM recovery_attributions
          WHERE tenant_id = ?
        `).get(tenantId);

        const attemptsStats = await db.prepare(`
          SELECT 
            COUNT(*) as totalAttempts,
            SUM(CASE WHEN outcome = 'DELIVERED' THEN 1 ELSE 0 END) as deliveredCount,
            SUM(CASE WHEN outcome = 'SIMULATED_DRY_RUN' THEN 1 ELSE 0 END) as simulatedCount,
            SUM(CASE WHEN outcome = 'BLOCKED' THEN 1 ELSE 0 END) as blockedCount,
            SUM(CASE WHEN outcome = 'FAILED' THEN 1 ELSE 0 END) as failedCount,
            COALESCE(SUM(cost_estimate), 0) as totalAiCost,
            COALESCE(SUM(prompt_tokens + completion_tokens), 0) as totalTokens
          FROM recovery_attempts
          WHERE tenant_id = ?
        `).get(tenantId);

        return this._formatMetrics(counts, attributions, attemptsStats);
      })();
    }

    const counts = countsRaw;
    const attributions = db.prepare(`
      SELECT 
        COUNT(*) as totalOrders,
        COALESCE(SUM(order_value), 0) as totalRevenue,
        SUM(CASE WHEN is_control_group = 1 THEN 1 ELSE 0 END) as controlOrders,
        COALESCE(SUM(CASE WHEN is_control_group = 1 THEN order_value ELSE 0 END), 0) as controlRevenue
      FROM recovery_attributions
      WHERE tenant_id = ?
    `).get(tenantId);

    const attemptsStats = db.prepare(`
      SELECT 
        COUNT(*) as totalAttempts,
        SUM(CASE WHEN outcome = 'DELIVERED' THEN 1 ELSE 0 END) as deliveredCount,
        SUM(CASE WHEN outcome = 'SIMULATED_DRY_RUN' THEN 1 ELSE 0 END) as simulatedCount,
        SUM(CASE WHEN outcome = 'BLOCKED' THEN 1 ELSE 0 END) as blockedCount,
        SUM(CASE WHEN outcome = 'FAILED' THEN 1 ELSE 0 END) as failedCount,
        COALESCE(SUM(cost_estimate), 0) as totalAiCost,
        COALESCE(SUM(prompt_tokens + completion_tokens), 0) as totalTokens
      FROM recovery_attempts
      WHERE tenant_id = ?
    `).get(tenantId);

    return this._formatMetrics(counts, attributions, attemptsStats);
  },

  _formatMetrics(counts, attributions, attemptsStats) {
    const totalCandidates = Number(counts?.totalCandidates || 0);
    const scheduledCount = Number(counts?.scheduledCount || 0);
    const repliedCount = Number(counts?.repliedCount || 0);

    const totalOrders = Number(attributions?.totalOrders || 0);
    const totalRevenue = Number(attributions?.totalRevenue || 0);
    const controlOrders = Number(attributions?.controlOrders || 0);
    const controlRevenue = Number(attributions?.controlRevenue || 0);

    const deliveredCount = Number(attemptsStats?.deliveredCount || 0) + Number(attemptsStats?.simulatedCount || 0);
    const simulatedDryRunCount = Number(attemptsStats?.simulatedCount || 0);
    const failedCount = Number(attemptsStats?.failedCount || 0);
    const blockedCount = Number(attemptsStats?.blockedCount || 0);
    const totalAiCost = Number(attemptsStats?.totalAiCost || 0);
    const totalTokens = Number(attemptsStats?.totalTokens || 0);

    const treatedTotal = totalCandidates;
    const treatedOrders = totalOrders - controlOrders;
    const treatedRevenue = totalRevenue - controlRevenue;
    const conversionRate = treatedTotal > 0 ? (treatedOrders / treatedTotal) * 100 : 0;

    return {
      totalCandidates,
      scheduledCount,
      deliveredCount,
      simulatedDryRunCount,
      repliedCount,
      attributedOrders: totalOrders,
      attributedRevenue: parseFloat(totalRevenue.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      aiCosts: parseFloat(totalAiCost.toFixed(4)),
      totalTokens,
      deliveryErrors: failedCount,
      blockedCount,
      controlGroup: {
        controlOrders,
        controlRevenue: parseFloat(controlRevenue.toFixed(2)),
        treatedOrders,
        treatedRevenue: parseFloat(treatedRevenue.toFixed(2))
      }
    };
  }
};
