import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TrendingUp, Bot, AlertCircle } from 'lucide-react';
import { dashboardService } from '../../services/api';

/**
 * Currency Symbol Resolver
 */
function getCurrencySymbol(code = 'BDT') {
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
  return map[code?.toUpperCase()] || `${code?.toUpperCase()} `;
}

/**
 * Format Monetary Value (e.g. ৳1,250.00 or ৳0.00)
 */
function formatMonetaryAmount(amount, symbol = '৳') {
  const num = Number(amount) || 0;
  return `${symbol}\u00A0${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Format Message Count (e.g. 1,420 or 0)
 */
function formatMessageCount(count) {
  const num = Number(count) || 0;
  return num.toLocaleString('en-US');
}

/**
 * DashboardOverview — Clean, Compact, Premium Operations Telemetry
 * Contains ONLY two analytics sections:
 * 1. Total Sales (Today | This Month | This Year)
 * 2. AI Messages (Today | This Month | This Year)
 */
export function DashboardOverview({ user }) {
  const tenantId = user?.business_id || user?.businessId || user?.workspaceId || '';

  // Independent period selection states (Default: 'today')
  const [salesPeriod, setSalesPeriod] = useState('today'); // 'today' | 'this_month' | 'this_year'
  const [messagesPeriod, setMessagesPeriod] = useState('today'); // 'today' | 'this_month' | 'this_year'

  // Metric dataset from real-time backend / cache
  const [metrics, setMetrics] = useState(() => {
    const cached = dashboardService.getCached(tenantId);
    return cached || {
      tenantId,
      timezone: 'Asia/Dhaka',
      localDate: '',
      currency: 'BDT',
      currencySymbol: '৳',
      sales: { today: 0, this_month: 0, this_year: 0 },
      aiMessages: { today: 0, this_month: 0, this_year: 0 },
      boundaries: null,
      _isStale: false
    };
  });

  const [loading, setLoading] = useState(() => !dashboardService.getCached(tenantId)?.boundaries);
  const [error, setError] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  // References to prevent re-render triggered loops
  const activeLocalDateRef = useRef('');
  const midnightTimerRef = useRef(null);

  /**
   * Fetch current metrics from backend database.
   * Defined with empty dependencies so identity is 100% stable across renders.
   */
  const fetchMetrics = useCallback(async (force = false) => {
    try {
      const data = await dashboardService.getOverviewMetrics(force);
      if (data) {
        setMetrics(data);
        setError(null);

        if (data._cooldownSeconds && data._cooldownSeconds > 0) {
          setCooldownSeconds(data._cooldownSeconds);
        } else if (force) {
          setCooldownSeconds(0);
        }

        // Detect new-day midnight rollover in tenant timezone
        if (data.localDate) {
          activeLocalDateRef.current = data.localDate;
        }

        // Schedule next midnight refresh when boundary epoch is provided
        if (data.boundaries?.tomorrowStartEpoch) {
          if (midnightTimerRef.current) {
            clearTimeout(midnightTimerRef.current);
          }
          const msUntilMidnight = (data.boundaries.tomorrowStartEpoch * 1000) - Date.now() + 1500;
          if (msUntilMidnight > 0 && msUntilMidnight < 172800000) {
            midnightTimerRef.current = setTimeout(() => {
              fetchMetrics(true);
            }, msUntilMidnight);
          }
        }
      }
    } catch (err) {
      console.error('[OVERVIEW] Failed to retrieve metrics:', err);
      const isRateLimited = err.status === 429 || err.code === 'RATE_LIMITED';
      const retrySec = isRateLimited ? (err.retryAfter || 60) : 0;
      if (retrySec > 0) {
        setCooldownSeconds(retrySec);
      } else {
        setCooldownSeconds(0);
      }
      setError(err.message || 'Unable to update latest telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Initial load, 60s background polling, and tab visibility event listeners
  useEffect(() => {
    fetchMetrics(false);

    // 60-second periodic data refresh (only when tab is visible)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMetrics(false);
      }
    }, 60000);

    // Refresh when user returns to tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchMetrics(false);
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchMetrics]);

  // Value getters based on selected periods
  const currentSalesAmount = metrics.sales?.[salesPeriod] ?? 0;
  const currentMessagesCount = metrics.aiMessages?.[messagesPeriod] ?? 0;
  const activeCurrencySymbol = metrics.currencySymbol || getCurrencySymbol(metrics.currency);

  const hasData = Boolean(metrics.boundaries);

  return (
    <div className="overview-page-container">
      {/* Main Page Header */}
      <div className="overview-page-header">
        <h1 className="overview-page-title">Overview</h1>

        {/* Compact, non-intrusive error or rate-limit notice */}
        {error && (
          <div className="overview-inline-notice" role="alert">
            <AlertCircle size={15} className="notice-icon" />
            <span className="notice-text">
              {cooldownSeconds > 0
                ? `Rate limit reached. Retry available in ${cooldownSeconds}s.`
                : error}
            </span>
            <button
              type="button"
              onClick={() => fetchMetrics(true)}
              disabled={cooldownSeconds > 0}
              className="notice-retry-btn"
            >
              {cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : 'Retry'}
            </button>
          </div>
        )}
      </div>

      {/* ==============================================================
          THE TWO ANALYTICS SECTIONS (Desktop: 2 Columns, Mobile: Stack)
          ============================================================== */}
      <div className="overview-metric-grid">
        {/* ────────────────────────────────────────────────────────────
            CARD 1: TOTAL SALES
            ──────────────────────────────────────────────────────────── */}
        <section className="overview-metric-card" aria-labelledby="heading-total-sales">
          {/* Card Heading and Icon together at the top */}
          <div className="overview-card-header">
            <div className="overview-title-group">
              <div className="overview-icon-box sales-icon">
                <TrendingUp size={18} strokeWidth={2.4} />
              </div>
              <h2 id="heading-total-sales" className="overview-card-title">
                Total Sales
              </h2>
            </div>
          </div>

          {/* Period Toggle directly below the heading */}
          <div className="overview-period-toggle" role="tablist" aria-label="Total Sales Period">
            <button
              type="button"
              role="tab"
              aria-selected={salesPeriod === 'today'}
              className={`period-toggle-btn ${salesPeriod === 'today' ? 'active' : ''}`}
              onClick={() => setSalesPeriod('today')}
            >
              Today
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={salesPeriod === 'this_month'}
              className={`period-toggle-btn ${salesPeriod === 'this_month' ? 'active' : ''}`}
              onClick={() => setSalesPeriod('this_month')}
            >
              This Month
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={salesPeriod === 'this_year'}
              className={`period-toggle-btn ${salesPeriod === 'this_year' ? 'active' : ''}`}
              onClick={() => setSalesPeriod('this_year')}
            >
              This Year
            </button>
          </div>

          {/* Prominent Large Monetary Amount */}
          <div className="overview-metric-body">
            {loading && !hasData ? (
              <div className="overview-skeleton-stat" />
            ) : (
              <div className="overview-stat-amount">
                {formatMonetaryAmount(currentSalesAmount, activeCurrencySymbol)}
              </div>
            )}
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────
            CARD 2: AI-GENERATED MESSAGES
            ──────────────────────────────────────────────────────────── */}
        <section className="overview-metric-card" aria-labelledby="heading-ai-messages">
          {/* Card Heading and Icon together at the top */}
          <div className="overview-card-header">
            <div className="overview-title-group">
              <div className="overview-icon-box ai-icon">
                <Bot size={18} strokeWidth={2.4} />
              </div>
              <h2 id="heading-ai-messages" className="overview-card-title">
                AI Messages
              </h2>
            </div>
          </div>

          {/* Independent Period Toggle directly below the heading */}
          <div className="overview-period-toggle" role="tablist" aria-label="AI Messages Period">
            <button
              type="button"
              role="tab"
              aria-selected={messagesPeriod === 'today'}
              className={`period-toggle-btn ${messagesPeriod === 'today' ? 'active' : ''}`}
              onClick={() => setMessagesPeriod('today')}
            >
              Today
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={messagesPeriod === 'this_month'}
              className={`period-toggle-btn ${messagesPeriod === 'this_month' ? 'active' : ''}`}
              onClick={() => setMessagesPeriod('this_month')}
            >
              This Month
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={messagesPeriod === 'this_year'}
              className={`period-toggle-btn ${messagesPeriod === 'this_year' ? 'active' : ''}`}
              onClick={() => setMessagesPeriod('this_year')}
            >
              This Year
            </button>
          </div>

          {/* Prominent Large Message Count */}
          <div className="overview-metric-body">
            {loading && !hasData ? (
              <div className="overview-skeleton-stat" />
            ) : (
              <div className="overview-stat-amount">
                {formatMessageCount(currentMessagesCount)}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
