import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DollarSign,
  Package,
  RotateCw,
  AlertCircle,
  ShoppingBag,
  Store,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  BarChart3
} from 'lucide-react';
import { revenueService } from '../../services/api';

/**
 * Authentic brand SVG icon for WhatsApp
 */
function WhatsAppIcon({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20.52 3.48A11.85 11.85 0 0 0 12.06 0C5.46 0 .09 5.37.09 11.97c0 2.11.55 4.16 1.6 5.97L0 24l6.23-1.63a11.9 11.9 0 0 0 5.83 1.51h.01c6.6 0 11.97-5.37 11.97-11.97 0-3.2-.1.25-1.25-1.25a11.83 11.83 0 0 0-3.27-7.18zM12.06 21.86h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.7.97.99-3.61-.23-.37a9.88 9.88 0 0 1-1.52-5.29c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 7 2.9a9.84 9.84 0 0 1 2.89 7c0 5.46-4.44 9.89-9.89 9.89zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"
        fill="#25D366"
      />
    </svg>
  );
}

/**
 * Authentic brand SVG icon for Facebook Messenger
 */
function MessengerIcon({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.745 6.616 4.472 8.652V24l4.086-2.242c1.08.3 2.235.464 3.442.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.192 14.963l-3.056-3.26-5.963 3.26 6.559-6.963 3.13 3.26 5.89-3.26-6.56 6.963z"
        fill="#0084FF"
      />
    </svg>
  );
}

/**
 * Authentic brand SVG icon for Instagram
 */
function InstagramIcon({ size = 22, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="revenueIgGrad" r="150%" cx="30%" cy="107%">
          <stop stopColor="#fdf497" offset="0%" />
          <stop stopColor="#fdf497" offset="5%" />
          <stop stopColor="#fd5949" offset="45%" />
          <stop stopColor="#d6249f" offset="60%" />
          <stop stopColor="#285AEB" offset="90%" />
        </radialGradient>
      </defs>
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
        fill="url(#revenueIgGrad)"
      />
    </svg>
  );
}

/**
 * MoneyDisplay — Typographically isolated currency renderer.
 * Prevents the Bengali Taka symbol (৳) from colliding with digits on Windows/WebKit.
 */
function MoneyDisplay({ amount, symbol = '৳', className = '' }) {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return (
    <span className={`currency-amount-wrap ${className}`}>
      <span className="rev-currency-sym" aria-hidden="true">{symbol}</span>
      <span className="rev-currency-val">{formatted}</span>
    </span>
  );
}

/**
 * Format currency amount with symbol (e.g. ৳ 1,500.00 or $ 0.00)
 */
function formatMoney(amount, symbol = '৳') {
  const num = Number(amount) || 0;
  return `${symbol}\u00A0${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * RevenuePage — Clean, Intuitive & High-Converting for Shop Owners
 * Contains TWO CORE SECTIONS:
 * 1. WHERE SALES CAME FROM (WhatsApp, Facebook, Instagram, Other sales amount)
 * 2. BEST SELLING PRODUCTS (Top 3 products with units sold)
 * With Hero Summary KPIs, visual distribution, and global Today | This Month | This Year date toggle.
 */
export function RevenuePage({ user, onNavigateModule }) {
  // Global Period Toggle: 'today' | 'this_month' | 'this_year' (default: today)
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const [metrics, setMetrics] = useState({
    tenantId: user?.business_id || 'ws-flagship-01',
    timezone: 'Asia/Dhaka',
    localDate: '',
    currency: 'BDT',
    currencySymbol: '৳',
    periods: {
      today: {
        channels: {
          whatsapp: { amount: 0, orderCount: 0 },
          facebook: { amount: 0, orderCount: 0 },
          instagram: { amount: 0, orderCount: 0 },
          other: { amount: 0, orderCount: 0 }
        },
        topProducts: []
      },
      this_month: {
        channels: {
          whatsapp: { amount: 0, orderCount: 0 },
          facebook: { amount: 0, orderCount: 0 },
          instagram: { amount: 0, orderCount: 0 },
          other: { amount: 0, orderCount: 0 }
        },
        topProducts: []
      },
      this_year: {
        channels: {
          whatsapp: { amount: 0, orderCount: 0 },
          facebook: { amount: 0, orderCount: 0 },
          instagram: { amount: 0, orderCount: 0 },
          other: { amount: 0, orderCount: 0 }
        },
        topProducts: []
      }
    },
    boundaries: null
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const activeLocalDateRef = useRef('');
  const midnightTimerRef = useRef(null);

  /**
   * Fetch live revenue data from the backend
   */
  const fetchMetrics = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await revenueService.getRevenueMetrics();
      const payload = res?.data || res;
      if (payload && payload.periods) {
        setMetrics(payload);
        setError(null);

        // Midnight rollover detection
        if (payload.localDate) {
          activeLocalDateRef.current = payload.localDate;
        }

        // Schedule next midnight rollover refresh in business's timezone
        if (payload.boundaries?.tomorrowStartEpoch) {
          if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
          const msToMidnight = (payload.boundaries.tomorrowStartEpoch * 1000) - Date.now() + 1000;
          if (msToMidnight > 0 && msToMidnight < 86400000 * 2) {
            midnightTimerRef.current = setTimeout(() => {
              fetchMetrics(false);
            }, msToMidnight);
          }
        }
      }
    } catch (err) {
      console.error('[REVENUE] Failed to fetch metrics:', err);
      if (!metrics.boundaries) {
        setError(err.message || 'Unable to load revenue data.');
      }
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [metrics.boundaries]);

  // Initial load, background polling every 45s (visibility-aware), and window focus listeners
  useEffect(() => {
    fetchMetrics(false);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchMetrics(false);
      }
    }, 45000);

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchMetrics(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [fetchMetrics]);

  const currencySymbol = metrics.currencySymbol || '৳';
  const currentPeriodData = metrics.periods?.[selectedPeriod] || {
    channels: {
      whatsapp: { amount: 0, orderCount: 0 },
      facebook: { amount: 0, orderCount: 0 },
      instagram: { amount: 0, orderCount: 0 },
      other: { amount: 0, orderCount: 0 }
    },
    topProducts: []
  };

  const channels = currentPeriodData.channels;
  const topProducts = currentPeriodData.topProducts || [];
  const hasOtherSales = Number(channels.other?.amount || 0) > 0;

  const periodLabelText =
    selectedPeriod === 'today'
      ? 'today'
      : selectedPeriod === 'this_month'
      ? 'this month'
      : 'this year';

  // Derived Summary Metrics
  const totalPeriodRevenue =
    (channels.whatsapp?.amount || 0) +
    (channels.facebook?.amount || 0) +
    (channels.instagram?.amount || 0) +
    (channels.other?.amount || 0);

  const totalPeriodOrders =
    (channels.whatsapp?.orderCount || 0) +
    (channels.facebook?.orderCount || 0) +
    (channels.instagram?.orderCount || 0) +
    (channels.other?.orderCount || 0);

  const averageOrderValue = totalPeriodOrders > 0
    ? totalPeriodRevenue / totalPeriodOrders
    : 0;

  // Channel share percentages
  const getChannelShare = (amt) => {
    if (totalPeriodRevenue <= 0) return 0;
    return Math.round(((amt || 0) / totalPeriodRevenue) * 100);
  };

  const waShare = getChannelShare(channels.whatsapp?.amount);
  const fbShare = getChannelShare(channels.facebook?.amount);
  const igShare = getChannelShare(channels.instagram?.amount);
  const otherShare = getChannelShare(channels.other?.amount);

  return (
    <div className="revenue-simple-page" id="revenue-page-root">
      {/* ── Top Header Row ──────────────────────────────────────────────── */}
      <div className="revenue-header-bar">
        <div>
          <h1 className="revenue-main-title">Revenue</h1>
          <div className="revenue-live-tag">
            <span className="revenue-pulse-dot" />
            <span>Live Data • {metrics.timezone || 'Asia/Dhaka'} Time</span>
            {metrics.localDate && (
              <span className="revenue-date-text">
                • {new Date(metrics.localDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="revenue-refresh-button"
          title="Refresh real-time data"
          id="btn-refresh-revenue"
        >
          <RotateCw size={15} className={refreshing ? 'revenue-spin' : ''} />
          <span>{refreshing ? 'Updating…' : 'Refresh'}</span>
        </button>
      </div>

      {/* ── Error Banner (only if offline and zero cached data) ─────────── */}
      {error && !metrics.boundaries && (
        <div className="revenue-error-box" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => fetchMetrics(true)}
            className="revenue-retry-btn"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── GLOBAL DATE TOGGLE: Today | This Month | This Year ───────────── */}
      <div className="revenue-global-toggle-bar">
        <div
          className="revenue-period-toggle"
          role="radiogroup"
          aria-label="Select Revenue Reporting Period"
        >
          <button
            type="button"
            role="radio"
            aria-checked={selectedPeriod === 'today'}
            className={`revenue-toggle-btn ${selectedPeriod === 'today' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('today')}
            id="toggle-revenue-today"
          >
            Today
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selectedPeriod === 'this_month'}
            className={`revenue-toggle-btn ${selectedPeriod === 'this_month' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('this_month')}
            id="toggle-revenue-month"
          >
            This Month
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={selectedPeriod === 'this_year'}
            className={`revenue-toggle-btn ${selectedPeriod === 'this_year' ? 'active' : ''}`}
            onClick={() => setSelectedPeriod('this_year')}
            id="toggle-revenue-year"
          >
            This Year
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          TWO CLEAN SECTIONS ONLY:
          1. WHERE SALES CAME FROM (WhatsApp, Facebook, Instagram, Other)
          2. BEST SELLING PRODUCTS (Top 3 items sold)
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="revenue-sections-stack">
        {/* ─────────────────────────────────────────────────────────────────
            SECTION 1: WHERE SALES CAME FROM
            ───────────────────────────────────────────────────────────────── */}
        <section
          className="revenue-card-clean card-sales-channel-section"
          aria-labelledby="heading-sales-channels"
          id="section-where-sales-came-from"
        >
          <div className="card-top-heading-row">
            <div className="section-title-wrap">
              <h2 id="heading-sales-channels" className="section-title-text">
                Where Sales Came From
              </h2>
              <p className="section-subtitle-text">
                Sales generated across messaging platforms {periodLabelText}
              </p>
            </div>
            <div className="section-total-badge" title={`Total revenue ${periodLabelText}`}>
              <span className="section-total-label">Total Revenue ({periodLabelText}):</span>
              <span className="section-total-value">
                {loading ? '···' : <MoneyDisplay amount={totalPeriodRevenue} symbol={currencySymbol} />}
              </span>
              {totalPeriodOrders > 0 && (
                <span className="section-total-orders">({totalPeriodOrders} order{totalPeriodOrders === 1 ? '' : 's'})</span>
              )}
            </div>
          </div>

          <div
            className={`platform-sales-grid ${hasOtherSales ? 'has-four-columns' : ''}`}
            aria-label="Sales Amount by Platform"
          >
            {/* WhatsApp */}
            <div className="platform-sales-card wa-card">
              <div className="platform-card-header">
                <div className="platform-icon-pill wa-pill">
                  <WhatsAppIcon size={22} />
                </div>
                <div className="platform-header-text">
                  <span className="platform-name">WhatsApp</span>
                </div>
                {waShare > 0 && (
                  <span className="platform-share-badge wa-share-badge">{waShare}%</span>
                )}
              </div>
              <div className="platform-amount-wrap">
                <div className="platform-amount-value" id="revenue-wa-amount">
                  {loading ? '···' : <MoneyDisplay amount={channels.whatsapp?.amount} symbol={currencySymbol} />}
                </div>
              </div>
              <div className="platform-order-caption">
                {loading
                  ? 'Loading…'
                  : channels.whatsapp?.amount > 0
                  ? `${channels.whatsapp?.orderCount} order${channels.whatsapp?.orderCount === 1 ? '' : 's'}`
                  : `0 orders recorded ${periodLabelText}`}
              </div>
            </div>

            {/* Facebook Messenger */}
            <div className="platform-sales-card fb-card">
              <div className="platform-card-header">
                <div className="platform-icon-pill fb-pill">
                  <MessengerIcon size={22} />
                </div>
                <div className="platform-header-text">
                  <span className="platform-name">Facebook</span>
                </div>
                {fbShare > 0 && (
                  <span className="platform-share-badge fb-share-badge">{fbShare}%</span>
                )}
              </div>
              <div className="platform-amount-wrap">
                <div className="platform-amount-value" id="revenue-fb-amount">
                  {loading ? '···' : <MoneyDisplay amount={channels.facebook?.amount} symbol={currencySymbol} />}
                </div>
              </div>
              <div className="platform-order-caption">
                {loading
                  ? 'Loading…'
                  : channels.facebook?.amount > 0
                  ? `${channels.facebook?.orderCount} order${channels.facebook?.orderCount === 1 ? '' : 's'}`
                  : `0 orders recorded ${periodLabelText}`}
              </div>
            </div>

            {/* Instagram */}
            <div className="platform-sales-card ig-card">
              <div className="platform-card-header">
                <div className="platform-icon-pill ig-pill">
                  <InstagramIcon size={22} />
                </div>
                <div className="platform-header-text">
                  <span className="platform-name">Instagram</span>
                </div>
                {igShare > 0 && (
                  <span className="platform-share-badge ig-share-badge">{igShare}%</span>
                )}
              </div>
              <div className="platform-amount-wrap">
                <div className="platform-amount-value" id="revenue-ig-amount">
                  {loading ? '···' : <MoneyDisplay amount={channels.instagram?.amount} symbol={currencySymbol} />}
                </div>
              </div>
              <div className="platform-order-caption">
                {loading
                  ? 'Loading…'
                  : channels.instagram?.amount > 0
                  ? `${channels.instagram?.orderCount} order${channels.instagram?.orderCount === 1 ? '' : 's'}`
                  : `0 orders recorded ${periodLabelText}`}
              </div>
            </div>

            {/* Other / Store (displayed when qualifying unclassified sales exist) */}
            {hasOtherSales && (
              <div className="platform-sales-card other-card">
                <div className="platform-card-header">
                  <div className="platform-icon-pill other-pill">
                    <Store size={22} color="#059669" />
                  </div>
                  <div className="platform-header-text">
                    <span className="platform-name">Other / Direct</span>
                  </div>
                  {otherShare > 0 && (
                    <span className="platform-share-badge other-share-badge">{otherShare}%</span>
                  )}
                </div>
                <div className="platform-amount-wrap">
                  <div className="platform-amount-value" id="revenue-other-amount">
                    {loading ? '···' : <MoneyDisplay amount={channels.other?.amount} symbol={currencySymbol} />}
                  </div>
                </div>
                <div className="platform-order-caption">
                  {loading
                    ? 'Loading…'
                    : `${channels.other?.orderCount} order${channels.other?.orderCount === 1 ? '' : 's'}`}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 2: BEST SELLING PRODUCTS
            ───────────────────────────────────────────────────────────────── */}
        <section
          className="revenue-card-clean card-best-selling-section"
          aria-labelledby="heading-best-selling"
          id="section-best-selling-products"
        >
          <div className="card-top-heading-row">
            <div className="section-title-wrap">
              <h2 id="heading-best-selling" className="section-title-text">
                Best Selling Products
              </h2>
              <p className="section-subtitle-text">
                Top three items customers bought most {periodLabelText}
              </p>
            </div>
          </div>

          {/* Numbered List for Top 3 Best-Selling Products */}
          {topProducts.length > 0 ? (
            <div className="best-selling-numbered-list" aria-label="Top 3 best selling products">
              {topProducts.map((product, idx) => {
                const rankNum = product.rank || idx + 1;
                const medal = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : '🥉';
                return (
                  <div key={product.name + idx} className={`best-selling-product-item rank-${rankNum}`}>
                    <div className={`product-rank-badge rank-badge-${rankNum}`} aria-label={`Rank ${rankNum}`}>
                      <span className="rank-medal-icon">{medal}</span>
                      <span className="rank-number-text">#{rankNum}</span>
                    </div>
                    <div className="product-details-body">
                      <span className="product-display-name">{product.name}</span>
                      <span className="product-rank-caption">Top seller #{rankNum} in conversational sales</span>
                    </div>
                    <div className="product-units-sold-pill">
                      <Package size={14} className="units-pill-icon" />
                      <span>{product.unitsSold} sold</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean, Compact, Modern Empty State */
            <div className="best-selling-empty-compact">
              <div className="empty-compact-icon-wrap">
                <ShoppingBag size={20} color="#0FA968" />
              </div>
              <div className="empty-compact-text">
                <span className="empty-compact-title">No products sold yet {periodLabelText}</span>
                <span className="empty-compact-desc">
                  Your top 3 best-selling items will appear here automatically when orders are confirmed.
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default RevenuePage;
