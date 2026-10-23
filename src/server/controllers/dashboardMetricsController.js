import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { getTenantId } from '../middleware/auth.js';

/**
 * Normalizes and validates an IANA timezone string.
 * Defaults to Asia/Dhaka if unspecified or invalid.
 */
function getSafeTimezone(tz) {
  if (!tz || typeof tz !== 'string') return 'Asia/Dhaka';
  const trimmed = tz.trim();
  try {
    Intl.DateTimeFormat(undefined, { timeZone: trimmed });
    return trimmed;
  } catch {
    return 'Asia/Dhaka';
  }
}

/**
 * Computes exact UTC epoch seconds corresponding to:
 * - todayMidnight (12:00:00 AM of current day in target timezone)
 * - monthStartMidnight (1st day of current month 00:00:00 in target timezone)
 * - yearStartMidnight (Jan 1 of current year 00:00:00 in target timezone)
 * - tomorrowMidnight (12:00:00 AM of next day in target timezone for rollover timer)
 */
export function getTimezoneBoundaryEpochs(timeZone = 'Asia/Dhaka', refDate = new Date()) {
  const safeTz = getSafeTimezone(timeZone);
  const pad = (n) => String(n).padStart(2, '0');

  // Format current time in target timezone
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz,
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });

  const parts = dtf.formatToParts(refDate);
  const m = {};
  for (const p of parts) m[p.type] = p.value;

  const y = parseInt(m.year, 10);
  const mon = parseInt(m.month, 10);
  const d = parseInt(m.day, 10);

  function getLocalMidnightUtc(year, month, day) {
    const dStr = `${year}-${pad(month)}-${pad(day)}T00:00:00`;
    const guess = new Date(dStr + 'Z');
    const p2 = dtf.formatToParts(guess);
    const m2 = {};
    for (const p of p2) m2[p.type] = p.value;
    const localInTz = new Date(
      `${m2.year}-${pad(m2.month)}-${pad(m2.day)}T${pad(m2.hour === '24' ? '00' : m2.hour)}:${pad(m2.minute)}:${pad(m2.second)}Z`
    );
    const diff = guess.getTime() - localInTz.getTime();
    return new Date(guess.getTime() + diff);
  }

  const todayMidnight = getLocalMidnightUtc(y, mon, d);
  const monthStart = getLocalMidnightUtc(y, mon, 1);
  const yearStart = getLocalMidnightUtc(y, 1, 1);

  // Next day midnight
  const nextDay = new Date(refDate.getTime() + 86400000);
  const nextParts = dtf.formatToParts(nextDay);
  const nextM = {};
  for (const p of nextParts) nextM[p.type] = p.value;
  const tomorrowMidnight = getLocalMidnightUtc(
    parseInt(nextM.year, 10),
    parseInt(nextM.month, 10),
    parseInt(nextM.day, 10)
  );

  return {
    timeZone: safeTz,
    localDate: `${y}-${pad(mon)}-${pad(d)}`,
    todayEpoch: Math.floor(todayMidnight.getTime() / 1000),
    monthEpoch: Math.floor(monthStart.getTime() / 1000),
    yearEpoch: Math.floor(yearStart.getTime() / 1000),
    tomorrowEpoch: Math.floor(tomorrowMidnight.getTime() / 1000),
    todayStartIso: todayMidnight.toISOString(),
    monthStartIso: monthStart.toISOString(),
    yearStartIso: yearStart.toISOString(),
    nowEpoch: Math.floor(refDate.getTime() / 1000)
  };
}

/**
 * Returns currency symbol based on currency code
 */
function getCurrencySymbol(code = 'USD') {
  const map = {
    BDT: '৳',
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    CAD: 'CA$',
    AUD: 'AU$',
    AED: 'AED '
  };
  return map[code.toUpperCase()] || `${code.toUpperCase()} `;
}

export const dashboardMetricsController = {
  /**
   * GET /api/v1/dashboard/overview-metrics
   * Calculates Total Sales and AI-Generated Messages for:
   * - Today (12:00 AM local date to now)
   * - This Month (1st day of month 00:00 local to now)
   * - This Year (Jan 1 of year 00:00 local to now)
   */
  async getOverviewMetrics(req, res, next) {
    try {
      const db = getDatabase();
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      // Retrieve configured timezone and currency from business profile
      const profile = db.prepare(`
        SELECT base_currency, timezone 
        FROM business_profiles 
        WHERE business_id = ?
      `).get(tenantId);

      const configuredTimezone = profile?.timezone || 'Asia/Dhaka';
      const configuredCurrency = (profile?.base_currency || 'BDT').toUpperCase();
      const currencySymbol = getCurrencySymbol(configuredCurrency);

      const bounds = getTimezoneBoundaryEpochs(configuredTimezone);

      // ─────────────────────────────────────────────────────────────────
      // 1. TOTAL SALES CALCULATION
      // - Qualifying sales: status NOT IN ('CANCELLED', 'REFUNDED')
      // - Strict tenant isolation: business_id = tenantId
      // - Dynamically aggregated by date boundary (no historical data deleted)
      // ─────────────────────────────────────────────────────────────────
      const salesQuery = db.prepare(`
        SELECT COALESCE(SUM(total), 0) as total, COUNT(id) as count
        FROM orders
        WHERE business_id = ?
          AND UPPER(status) NOT IN ('CANCELLED', 'REFUNDED')
          AND CAST(strftime('%s', created_at) AS INTEGER) >= ?
      `);

      const salesToday = salesQuery.get(tenantId, bounds.todayEpoch);
      const salesMonth = salesQuery.get(tenantId, bounds.monthEpoch);
      const salesYear = salesQuery.get(tenantId, bounds.yearEpoch);

      // ─────────────────────────────────────────────────────────────────
      // 2. AI-GENERATED MESSAGES CALCULATION
      // - Must be AI generated: is_ai = 1
      // - Must be outbound reply to customer: direction IS NULL OR direction = 'OUTBOUND'
      // - Must be successfully sent: status IS NULL OR status NOT IN ('FAILED', 'PENDING', 'DRAFT')
      // - Strict tenant isolation: c.business_id = tenantId OR m.tenant_id = tenantId
      // - De-duplicated: COUNT(DISTINCT COALESCE(m.external_message_id, m.id))
      // ─────────────────────────────────────────────────────────────────
      const aiQuery = db.prepare(`
        SELECT COUNT(DISTINCT COALESCE(m.external_message_id, m.id)) as count
        FROM messages m
        JOIN conversations c ON m.conversation_id = c.id
        WHERE (c.business_id = ? OR m.tenant_id = ?)
          AND m.is_ai = 1
          AND (m.direction IS NULL OR UPPER(m.direction) = 'OUTBOUND')
          AND (m.status IS NULL OR UPPER(m.status) NOT IN ('FAILED', 'PENDING', 'DRAFT'))
          AND CAST(strftime('%s', m.created_at) AS INTEGER) >= ?
      `);

      const aiToday = aiQuery.get(tenantId, tenantId, bounds.todayEpoch);
      const aiMonth = aiQuery.get(tenantId, tenantId, bounds.monthEpoch);
      const aiYear = aiQuery.get(tenantId, tenantId, bounds.yearEpoch);

      const responsePayload = {
        tenantId,
        timezone: bounds.timeZone,
        localDate: bounds.localDate,
        currency: configuredCurrency,
        currencySymbol,
        sales: {
          today: Number(salesToday?.total || 0),
          this_month: Number(salesMonth?.total || 0),
          this_year: Number(salesYear?.total || 0),
          orderCounts: {
            today: Number(salesToday?.count || 0),
            this_month: Number(salesMonth?.count || 0),
            this_year: Number(salesYear?.count || 0)
          }
        },
        aiMessages: {
          today: Number(aiToday?.count || 0),
          this_month: Number(aiMonth?.count || 0),
          this_year: Number(aiYear?.count || 0)
        },
        boundaries: {
          todayStart: bounds.todayStartIso,
          monthStart: bounds.monthStartIso,
          yearStart: bounds.yearStartIso,
          tomorrowStartEpoch: bounds.tomorrowEpoch,
          serverNowEpoch: bounds.nowEpoch
        }
      };

      return successResponse(res, responsePayload);
    } catch (err) {
      logger.error('[DASHBOARD METRICS] Failed to calculate overview metrics:', err);
      next(err);
    }
  },

  /**
   * GET /api/v1/analytics/metrics
   * Calculates simplified metrics for Analytics Page:
   * 1. Customers (Today | 7 Days | 30 Days) with channel breakdown (WhatsApp, Facebook, Instagram)
   * 2. Need Your Help (Count of customers waiting for human attention + top 3 customers)
   */
  async getAnalyticsMetrics(req, res, next) {
    try {
      const db = getDatabase();
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      const profile = db.prepare(`
        SELECT timezone FROM business_profiles WHERE business_id = ?
      `).get(tenantId);

      const configuredTimezone = profile?.timezone || 'Asia/Dhaka';
      const bounds = getTimezoneBoundaryEpochs(configuredTimezone);

      const periodEpochs = {
        today: bounds.todayEpoch,
        '7_days': bounds.todayEpoch - (6 * 86400),
        '30_days': bounds.todayEpoch - (29 * 86400)
      };

      // ─────────────────────────────────────────────────────────────
      // SECTION 1: CUSTOMERS (Unique customers who contacted)
      // ─────────────────────────────────────────────────────────────
      const customersData = {};

      for (const [periodKey, startEpoch] of Object.entries(periodEpochs)) {
        // Overall unique customer total (deduplicates verified linked identities, channel-scoped for unlinked)
        const totalUnique = db.prepare(`
          SELECT COUNT(DISTINCT COALESCE(NULLIF(c.customer_id, ''), c.channel || ':' || COALESCE(c.customer_name, c.id))) as count
          FROM conversations c
          WHERE c.business_id = ?
            AND (
              CAST(strftime('%s', COALESCE(c.last_message_time, c.updated_at, c.created_at)) AS INTEGER) >= ?
              OR EXISTS (
                SELECT 1 FROM messages m
                WHERE m.conversation_id = c.id
                  AND (m.sender = 'customer' OR m.is_ai = 0 OR m.direction = 'INBOUND')
                  AND CAST(strftime('%s', m.created_at) AS INTEGER) >= ?
              )
            )
        `).get(tenantId, startEpoch, startEpoch)?.count || 0;

        // WhatsApp unique customers
        const whatsappUnique = db.prepare(`
          SELECT COUNT(DISTINCT COALESCE(NULLIF(c.customer_id, ''), c.customer_name)) as count
          FROM conversations c
          WHERE c.business_id = ?
            AND UPPER(c.channel) = 'WHATSAPP'
            AND (
              CAST(strftime('%s', COALESCE(c.last_message_time, c.updated_at, c.created_at)) AS INTEGER) >= ?
              OR EXISTS (
                SELECT 1 FROM messages m
                WHERE m.conversation_id = c.id
                  AND (m.sender = 'customer' OR m.is_ai = 0 OR m.direction = 'INBOUND')
                  AND CAST(strftime('%s', m.created_at) AS INTEGER) >= ?
              )
            )
        `).get(tenantId, startEpoch, startEpoch)?.count || 0;

        // Facebook Messenger unique customers
        const facebookUnique = db.prepare(`
          SELECT COUNT(DISTINCT COALESCE(NULLIF(c.customer_id, ''), c.customer_name)) as count
          FROM conversations c
          WHERE c.business_id = ?
            AND UPPER(c.channel) IN ('FACEBOOK', 'MESSENGER', 'FB')
            AND (
              CAST(strftime('%s', COALESCE(c.last_message_time, c.updated_at, c.created_at)) AS INTEGER) >= ?
              OR EXISTS (
                SELECT 1 FROM messages m
                WHERE m.conversation_id = c.id
                  AND (m.sender = 'customer' OR m.is_ai = 0 OR m.direction = 'INBOUND')
                  AND CAST(strftime('%s', m.created_at) AS INTEGER) >= ?
              )
            )
        `).get(tenantId, startEpoch, startEpoch)?.count || 0;

        // Instagram unique customers
        const instagramUnique = db.prepare(`
          SELECT COUNT(DISTINCT COALESCE(NULLIF(c.customer_id, ''), c.customer_name)) as count
          FROM conversations c
          WHERE c.business_id = ?
            AND UPPER(c.channel) IN ('INSTAGRAM', 'IG')
            AND (
              CAST(strftime('%s', COALESCE(c.last_message_time, c.updated_at, c.created_at)) AS INTEGER) >= ?
              OR EXISTS (
                SELECT 1 FROM messages m
                WHERE m.conversation_id = c.id
                  AND (m.sender = 'customer' OR m.is_ai = 0 OR m.direction = 'INBOUND')
                  AND CAST(strftime('%s', m.created_at) AS INTEGER) >= ?
              )
            )
        `).get(tenantId, startEpoch, startEpoch)?.count || 0;

        customersData[periodKey] = {
          total: totalUnique,
          whatsapp: whatsappUnique,
          facebook: facebookUnique,
          instagram: instagramUnique
        };
      }

      // ─────────────────────────────────────────────────────────────
      // SECTION 2: NEED YOUR HELP (Active outstanding human attention)
      // ─────────────────────────────────────────────────────────────
      const waitingRows = db.prepare(`
        SELECT c.id, c.customer_name, c.channel, c.status, c.updated_at,
               (SELECT m.text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1) as last_msg_text,
               (SELECT m.text FROM messages m WHERE m.conversation_id = c.id AND (m.sender = 'customer' OR m.is_ai = 0 OR m.direction = 'INBOUND') ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1) as last_customer_msg,
               (SELECT m.sender FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1) as last_sender,
               (SELECT m.is_ai FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1) as last_is_ai,
               (SELECT CAST(strftime('%s', m.created_at) AS INTEGER) FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1) as last_msg_epoch
        FROM conversations c
        WHERE c.business_id = ?
          AND UPPER(c.status) NOT IN ('RESOLVED', 'CLOSED')
          AND (
            UPPER(c.status) IN ('NEEDS_HUMAN', 'WAITING')
            OR (
              (
                SELECT (CASE WHEN m.is_ai = 1 OR UPPER(m.sender) IN ('AI', 'BOT', 'AGENT') OR UPPER(m.direction) = 'OUTBOUND' THEN 1 ELSE 0 END)
                FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1
              ) = 0
              AND (
                strftime('%s', 'now') - (
                  SELECT CAST(strftime('%s', m.created_at) AS INTEGER)
                  FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1
                )
              ) > 30
            )
          )
        ORDER BY c.updated_at DESC
      `).all(tenantId);

      const topWaiting = waitingRows.slice(0, 3).map(r => ({
        id: r.id,
        name: r.customer_name || 'Customer',
        channel: (r.channel || 'WHATSAPP').toUpperCase(),
        status: r.status,
        lastMessage: r.last_customer_msg || r.last_msg_text || 'Waiting for reply',
        updatedAt: r.updated_at
      }));

      const payload = {
        tenantId,
        timezone: bounds.timeZone,
        localDate: bounds.localDate,
        customers: customersData,
        needHelp: {
          count: waitingRows.length,
          waitingCustomers: topWaiting
        },
        boundaries: {
          todayStart: bounds.todayStartIso,
          tomorrowStartEpoch: bounds.tomorrowEpoch,
          serverNowEpoch: bounds.nowEpoch
        }
      };

      return successResponse(res, payload);
    } catch (err) {
      logger.error('[ANALYTICS METRICS] Failed to calculate analytics metrics:', err);
      next(err);
    }
  },

  /**
   * GET /api/v1/revenue/metrics
   * Calculates simplified metrics for Revenue Page:
   * 1. Where Sales Came From (WhatsApp, Facebook, Instagram, Other sales amount)
   * 2. Best Selling Products (Top 3 products with units sold)
   * Handled for periods: Today, This Month, This Year
   * Strict tenant isolation, business currency, accurate timezone calculation.
   */
  async getRevenueMetrics(req, res, next) {
    try {
      const db = getDatabase();
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      const profile = db.prepare(`
        SELECT base_currency, timezone 
        FROM business_profiles 
        WHERE business_id = ?
      `).get(tenantId);

      const configuredTimezone = profile?.timezone || 'Asia/Dhaka';
      const configuredCurrency = (profile?.base_currency || 'BDT').toUpperCase();
      const currencySymbol = getCurrencySymbol(configuredCurrency);

      const bounds = getTimezoneBoundaryEpochs(configuredTimezone);

      const periodEpochs = {
        today: bounds.todayEpoch,
        this_month: bounds.monthEpoch,
        this_year: bounds.yearEpoch
      };

      const periodsData = {};

      for (const [periodKey, startEpoch] of Object.entries(periodEpochs)) {
        // ─────────────────────────────────────────────────────────────
        // SECTION 1: WHERE SALES CAME FROM (By platform)
        // Qualifying sales: UPPER(status) NOT IN ('CANCELLED', 'REFUNDED')
        // Strict tenant isolation: business_id = ?
        // ─────────────────────────────────────────────────────────────
        const channelRows = db.prepare(`
          SELECT
            CASE
              WHEN UPPER(COALESCE(channel, '')) = 'WHATSAPP' THEN 'whatsapp'
              WHEN UPPER(COALESCE(channel, '')) IN ('FACEBOOK', 'MESSENGER', 'FB') THEN 'facebook'
              WHEN UPPER(COALESCE(channel, '')) IN ('INSTAGRAM', 'IG') THEN 'instagram'
              ELSE 'other'
            END as channel_key,
            COALESCE(SUM(total), 0) as total_amount,
            COUNT(id) as order_count
          FROM orders
          WHERE business_id = ?
            AND UPPER(status) NOT IN ('CANCELLED', 'REFUNDED')
            AND CAST(strftime('%s', created_at) AS INTEGER) >= ?
          GROUP BY channel_key
        `).all(tenantId, startEpoch);

        const channelsMap = {
          whatsapp: { amount: 0, orderCount: 0 },
          facebook: { amount: 0, orderCount: 0 },
          instagram: { amount: 0, orderCount: 0 },
          other: { amount: 0, orderCount: 0 }
        };

        for (const row of channelRows) {
          if (channelsMap[row.channel_key]) {
            channelsMap[row.channel_key] = {
              amount: Number(row.total_amount) || 0,
              orderCount: Number(row.order_count) || 0
            };
          }
        }

        // ─────────────────────────────────────────────────────────────
        // SECTION 2: BEST SELLING PRODUCTS (Top 3 with units sold)
        // Qualifying sales: UPPER(o.status) NOT IN ('CANCELLED', 'REFUNDED')
        // Preserves historical snapshot: COALESCE(NULLIF(oi.product_name, ''), p.name, 'Product')
        // ─────────────────────────────────────────────────────────────
        const topProductsRows = db.prepare(`
          SELECT
            COALESCE(NULLIF(oi.product_name, ''), p.name, 'Product') as name,
            COALESCE(SUM(oi.quantity), 0) as units_sold
          FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE o.business_id = ?
            AND UPPER(o.status) NOT IN ('CANCELLED', 'REFUNDED')
            AND CAST(strftime('%s', o.created_at) AS INTEGER) >= ?
          GROUP BY COALESCE(NULLIF(oi.product_name, ''), p.name)
          ORDER BY units_sold DESC
          LIMIT 3
        `).all(tenantId, startEpoch);

        const topProducts = topProductsRows.map((r, index) => ({
          rank: index + 1,
          name: r.name,
          unitsSold: Number(r.units_sold) || 0
        }));

        periodsData[periodKey] = {
          channels: channelsMap,
          topProducts
        };
      }

      const payload = {
        tenantId,
        timezone: bounds.timeZone,
        localDate: bounds.localDate,
        currency: configuredCurrency,
        currencySymbol,
        periods: periodsData,
        boundaries: {
          todayStart: bounds.todayStartIso,
          monthStart: bounds.monthStartIso,
          yearStart: bounds.yearStartIso,
          tomorrowStartEpoch: bounds.tomorrowEpoch,
          serverNowEpoch: bounds.nowEpoch
        }
      };

      return successResponse(res, payload);
    } catch (err) {
      logger.error('[REVENUE METRICS] Failed to calculate revenue metrics:', err);
      next(err);
    }
  }
};

