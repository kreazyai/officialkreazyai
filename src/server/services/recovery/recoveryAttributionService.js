import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { recoveryCandidateService } from './recoveryCandidateService.js';

export const recoveryAttributionService = {
  /**
   * Attribute a confirmed order to a recovery attempt within the attribution window.
   * @param {object} params
   * @param {string} params.tenantId
   * @param {string} params.orderId
   * @param {number} params.orderValue
   * @param {string} [params.currency='USD']
   * @param {string} [params.customerId]
   * @param {string} [params.customerPhone]
   * @param {number} [params.windowHours=72] Default 72 hours
   * @returns {object|null} Attribution record or null if no eligible candidate found
   */
  attributeOrder({
    tenantId,
    orderId,
    orderValue,
    currency = 'USD',
    customerId = null,
    customerPhone = null,
    windowHours = 72
  }) {
    if (!tenantId || !orderId) {
      throw new Error('Tenant ID and Order ID are required for order attribution.');
    }

    const db = getDatabase();

    // Check if order was already attributed (idempotency & avoid double attribution)
    const existing = db.prepare('SELECT * FROM recovery_attributions WHERE tenant_id = ? AND order_id = ?').get(tenantId, orderId);
    if (existing) {
      logger.info(`[RECOVERY ATTRIBUTION] Order ${orderId} already attributed. Skipping duplicate.`);
      return existing;
    }

    const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

    // Find candidate by customer_id or phone matching dispatched/scheduled candidate
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

    // Find latest attempt for this candidate
    const latestAttempt = db.prepare(`
      SELECT * FROM recovery_attempts 
      WHERE candidate_id = ? 
      ORDER BY attempted_at DESC LIMIT 1
    `).get(candidate.id);

    const attrId = `attr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const isControl = candidate.is_control_group ? 1 : 0;

    const attribution = db.transaction(() => {
      db.prepare(`
        INSERT INTO recovery_attributions (
          id, tenant_id, candidate_id, attempt_id, order_id, order_value,
          currency, attributed_at, attribution_method, is_control_group, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, datetime('now'), 'LAST_TOUCH', ?, datetime('now')
        )
      `).run(
        attrId,
        tenantId,
        candidate.id,
        latestAttempt ? latestAttempt.id : null,
        orderId,
        orderValue,
        currency,
        isControl
      );

      // Transition candidate to CONVERTED
      db.prepare(`
        UPDATE recovery_candidates
        SET stage = 'CONVERTED', version = version + 1, updated_at = datetime('now')
        WHERE id = ?
      `).run(candidate.id);

      // Record ORDER_ATTRIBUTED event
      const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, attempt_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, ?, 'ORDER_ATTRIBUTED', ?, datetime('now'))
      `).run(
        evId,
        tenantId,
        candidate.id,
        latestAttempt ? latestAttempt.id : null,
        JSON.stringify({ orderId, orderValue, currency, isControlGroup: Boolean(isControl) })
      );

      // Cancel any remaining active candidates for this customer/conversation
      recoveryCandidateService.cancelActiveCandidates(tenantId, candidate.conversation_id, 'ORDER_CONFIRMED');

      return db.prepare('SELECT * FROM recovery_attributions WHERE id = ?').get(attrId);
    })();

    logger.info(`[RECOVERY ATTRIBUTED] Order ${orderId} ($${orderValue}) attributed to candidate ${candidate.id} (Control: ${Boolean(isControl)})`);
    return attribution;
  },

  /**
   * Get overview recovery metrics for a tenant.
   * @param {string} tenantId
   * @returns {object}
   */
  getOverviewMetrics(tenantId) {
    const db = getDatabase();

    const counts = db.prepare(`
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

    // Incrementality analysis
    const treatedTotal = (counts.totalCandidates || 0);
    const treatedOrders = (attributions.totalOrders || 0) - (attributions.controlOrders || 0);
    const treatedRevenue = (attributions.totalRevenue || 0) - (attributions.controlRevenue || 0);

    const conversionRate = treatedTotal > 0 ? (treatedOrders / treatedTotal) * 100 : 0;

    return {
      totalCandidates: counts.totalCandidates || 0,
      scheduledCount: counts.scheduledCount || 0,
      deliveredCount: (attemptsStats.deliveredCount || 0) + (attemptsStats.simulatedCount || 0),
      simulatedDryRunCount: attemptsStats.simulatedCount || 0,
      repliedCount: counts.repliedCount || 0,
      attributedOrders: attributions.totalOrders || 0,
      attributedRevenue: parseFloat(attributions.totalRevenue.toFixed(2)),
      conversionRate: parseFloat(conversionRate.toFixed(1)),
      aiCosts: parseFloat(attemptsStats.totalAiCost.toFixed(4)),
      totalTokens: attemptsStats.totalTokens || 0,
      deliveryErrors: attemptsStats.failedCount || 0,
      blockedCount: attemptsStats.blockedCount || 0,
      controlGroup: {
        controlOrders: attributions.controlOrders || 0,
        controlRevenue: parseFloat(attributions.controlRevenue.toFixed(2)),
        treatedOrders,
        treatedRevenue: parseFloat(treatedRevenue.toFixed(2))
      }
    };
  }
};
