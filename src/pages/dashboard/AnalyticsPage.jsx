import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users,
  AlertCircle,
  Clock,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { analyticsService } from '../../services/api';

/**
 * Authentic brand SVG icon for WhatsApp
 */
function WhatsAppIcon({ size = 18, className = '' }) {
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
function MessengerIcon({ size = 18, className = '' }) {
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
function InstagramIcon({ size = 18, className = '' }) {
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
        <radialGradient id="igGradAnalytics" r="150%" cx="30%" cy="107%">
          <stop stopColor="#fdf497" offset="0%" />
          <stop stopColor="#fdf497" offset="5%" />
          <stop stopColor="#fd5949" offset="45%" />
          <stop stopColor="#d6249f" offset="60%" />
          <stop stopColor="#285AEB" offset="90%" />
        </radialGradient>
      </defs>
      <path
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
        fill="url(#igGradAnalytics)"
      />
    </svg>
  );
}

/**
 * Avatar for waiting customer with fallback initials
 */
function CustomerInitialsAvatar({ name = 'Customer', size = 38 }) {
  const letters = name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
  const hue = Math.abs(letters.charCodeAt(0) * 37) % 360;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: `hsl(${hue}, 40%, 25%)`,
        color: `hsl(${hue}, 85%, 90%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.36,
        flexShrink: 0,
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}
      aria-hidden="true"
    >
      {letters}
    </div>
  );
}

/**
 * Channel Icon Helper
 */
function ChannelIcon({ channel = 'WHATSAPP', size = 14 }) {
  const norm = (channel || '').toUpperCase();
  if (norm.includes('FB') || norm.includes('MESSENGER') || norm.includes('FACEBOOK')) {
    return <MessengerIcon size={size} />;
  }
  if (norm.includes('IG') || norm.includes('INSTA')) {
    return <InstagramIcon size={size} />;
  }
  return <WhatsAppIcon size={size} />;
}

/**
 * Format relative time (e.g. "Just now", "10m ago", "2h ago")
 */
function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 60000) return 'Just now';
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

/**
 * AnalyticsPage — Clean, 2-Section Operations Telemetry for Business Owners.
 * Contains ONLY TWO SIMPLE SECTIONS:
 * 1. CUSTOMERS — Unique customer count with Today | 7 Days | 30 Days toggle and channel breakdown.
 * 2. NEED YOUR HELP — Customers waiting for human reply, top 3 list, and "View Messages" action.
 */
export function AnalyticsPage({ user, onNavigateModule }) {
  const tenantId = user?.business_id || 'ws-flagship-01';

  // Toggle: 'today' | '7_days' | '30_days' (default: 'today')
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Initial state hydrated from local/memory cache if available
  const [metrics, setMetrics] = useState(() => {
    const cached = analyticsService.getCached(tenantId);
    return cached || {
      tenantId,
      timezone: 'Asia/Dhaka',
      localDate: '',
      customers: {
        today: { total: 0, whatsapp: 0, facebook: 0, instagram: 0 },
        '7_days': { total: 0, whatsapp: 0, facebook: 0, instagram: 0 },
        '30_days': { total: 0, whatsapp: 0, facebook: 0, instagram: 0 }
      },
      needHelp: {
        count: 0,
        waitingCustomers: []
      },
      boundaries: null,
      _isStale: false
    };
  });

  const [loading, setLoading] = useState(() => !analyticsService.getCached(tenantId)?.boundaries);
  const [error, setError] = useState(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const activeLocalDateRef = useRef('');
  const midnightTimerRef = useRef(null);

  /**
   * Fetch live analytics data from the backend.
   * Empty dependency array ensures 100% stable identity across all re-renders.
   */
  const fetchMetrics = useCallback(async (force = false) => {
    try {
      const data = await analyticsService.getAnalyticsMetrics(force);
      if (data && data.customers) {
        setMetrics(data);
        setError(null);

        if (data._cooldownSeconds && data._cooldownSeconds > 0) {
          setCooldownSeconds(data._cooldownSeconds);
        } else if (force) {
          setCooldownSeconds(0);
        }

        // Midnight rollover detection
        if (data.localDate) {
          activeLocalDateRef.current = data.localDate;
        }

        // Schedule next midnight rollover refresh in business's timezone
        if (data.boundaries?.tomorrowStartEpoch) {
          if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
          const msToMidnight = (data.boundaries.tomorrowStartEpoch * 1000) - Date.now() + 1500;
          if (msToMidnight > 0 && msToMidnight < 172800000) {
            midnightTimerRef.current = setTimeout(() => {
              fetchMetrics(true);
            }, msToMidnight);
          }
        }
      }
    } catch (err) {
      console.error('[ANALYTICS] Failed to fetch metrics:', err);
      const retrySec = err.retryAfter || (err.status === 429 ? 60 : 0);
      if (retrySec > 0) {
        setCooldownSeconds(retrySec);
      }
      setError(err.message || 'Unable to update latest analytics telemetry.');
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

  /**
   * Navigate to Messages with the human attention filter active
   */
  const handleViewMessages = (convId = null) => {
    try {
      sessionStorage.setItem('kreazy_messages_filter', 'human');
      if (convId) {
        sessionStorage.setItem('kreazy_selected_conv_id', convId);
      }
    } catch (e) {
      console.warn('sessionStorage error:', e);
    }

    if (onNavigateModule) {
      onNavigateModule('messages');
    } else {
      const url = convId
        ? `/dashboard/messages?filter=human&convId=${convId}`
        : '/dashboard/messages?filter=human';
      window.location.href = url;
    }
  };

  // Current period values
  const currentCustomerData = metrics.customers?.[selectedPeriod] || {
    total: 0,
    whatsapp: 0,
    facebook: 0,
    instagram: 0
  };

  const periodLabelText =
    selectedPeriod === 'today'
      ? 'customers contacted you today'
      : selectedPeriod === '7_days'
      ? 'unique customers in the last 7 days'
      : 'unique customers in the last 30 days';

  const needHelpCount = Number(metrics.needHelp?.count) || 0;
  const waitingList = metrics.needHelp?.waitingCustomers || [];
  const hasData = Boolean(metrics.boundaries);

  return (
    <div className="analytics-simple-page" id="analytics-page-root">
      {/* ── Top Header Bar: Clean single "Analytics" title ────────────────── */}
      <div className="analytics-header-bar">
        <h1 className="analytics-main-title">Analytics</h1>

        {/* Compact, non-intrusive rate limit or temporary error banner */}
        {error && (
          <div className="analytics-inline-notice" role="alert">
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

      {/* ═════════════════════════════════════════════════════════════════════
          THE TWO ANALYTICS SECTIONS (Desktop: 2 Columns, Mobile: Stack)
          1. CUSTOMERS
          2. NEED YOUR HELP
          ═════════════════════════════════════════════════════════════════════ */}
      <div className="analytics-sections-stack">
        {/* ─────────────────────────────────────────────────────────────────
            SECTION 1: CUSTOMERS
            ───────────────────────────────────────────────────────────────── */}
        <section
          className="analytics-card-clean card-customers-section"
          aria-labelledby="heading-customers"
          id="section-customers"
        >
          {/* Card Top Row: Title + Period Toggle */}
          <div className="card-header-flex">
            <div className="card-header-left">
              <div className="section-icon-badge green-badge">
                <Users size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h2 id="heading-customers" className="section-title-text">
                  Customers
                </h2>
                <p className="section-subtitle-text">
                  People who contacted your business
                </p>
              </div>
            </div>

            {/* Simple Period Toggle: Today | 7 Days | 30 Days */}
            <div
              className="analytics-period-toggle"
              role="radiogroup"
              aria-label="Select Customer Period"
            >
              <button
                type="button"
                role="radio"
                aria-checked={selectedPeriod === 'today'}
                className={`toggle-option-btn ${selectedPeriod === 'today' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('today')}
                id="toggle-period-today"
              >
                Today
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedPeriod === '7_days'}
                className={`toggle-option-btn ${selectedPeriod === '7_days' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('7_days')}
                id="toggle-period-7d"
              >
                7 Days
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedPeriod === '30_days'}
                className={`toggle-option-btn ${selectedPeriod === '30_days' ? 'active' : ''}`}
                onClick={() => setSelectedPeriod('30_days')}
                id="toggle-period-30d"
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Hero Customer Metric */}
          <div className="hero-metric-display">
            {loading && !hasData ? (
              <div className="analytics-skeleton-stat" />
            ) : (
              <div className="hero-giant-number" id="customers-hero-count">
                {currentCustomerData.total.toLocaleString()}
              </div>
            )}
            <div className="hero-caption-note">
              {loading && !hasData ? 'Calculating unique customers…' : periodLabelText}
            </div>
          </div>

          {/* Channel Breakdown Row Underneath */}
          <div className="channels-breakdown-row" aria-label="Channel Breakdown">
            {/* WhatsApp */}
            <div className="channel-breakdown-card wa-channel">
              <div className="channel-card-top">
                <div className="channel-icon-circle wa-bg">
                  <WhatsAppIcon size={18} />
                </div>
                <span className="channel-name-label">WhatsApp</span>
              </div>
              <div className="channel-count-number" id="count-wa-customers">
                {loading && !hasData ? '·' : currentCustomerData.whatsapp.toLocaleString()}
              </div>
            </div>

            {/* Facebook Messenger */}
            <div className="channel-breakdown-card fb-channel">
              <div className="channel-card-top">
                <div className="channel-icon-circle fb-bg">
                  <MessengerIcon size={18} />
                </div>
                <span className="channel-name-label">Facebook</span>
              </div>
              <div className="channel-count-number" id="count-fb-customers">
                {loading && !hasData ? '·' : currentCustomerData.facebook.toLocaleString()}
              </div>
            </div>

            {/* Instagram */}
            <div className="channel-breakdown-card ig-channel">
              <div className="channel-card-top">
                <div className="channel-icon-circle ig-bg">
                  <InstagramIcon size={18} />
                </div>
                <span className="channel-name-label">Instagram</span>
              </div>
              <div className="channel-count-number" id="count-ig-customers">
                {loading && !hasData ? '·' : currentCustomerData.instagram.toLocaleString()}
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────────
            SECTION 2: NEED YOUR HELP
            ───────────────────────────────────────────────────────────────── */}
        <section
          className="analytics-card-clean card-need-help-section"
          aria-labelledby="heading-need-help"
          id="section-need-help"
        >
          {/* Card Top Row: Title + Status Pill */}
          <div className="card-header-flex">
            <div className="card-header-left">
              <div className={`section-icon-badge ${needHelpCount > 0 ? 'amber-badge' : 'green-badge'}`}>
                {needHelpCount > 0 ? (
                  <AlertCircle size={20} strokeWidth={2.4} />
                ) : (
                  <CheckCircle2 size={20} strokeWidth={2.4} />
                )}
              </div>
              <div>
                <h2 id="heading-need-help" className="section-title-text">
                  Need Your Help
                </h2>
                <p className="section-subtitle-text">
                  Customers waiting for human reply
                </p>
              </div>
            </div>

            {/* Status indicator pill */}
            <div className="need-help-status-indicator">
              {needHelpCount > 0 ? (
                <span className="status-pill-attention">
                  <span className="pill-dot amber" />
                  Requires Attention
                </span>
              ) : (
                <span className="status-pill-clear">
                  <span className="pill-dot green" />
                  All Caught Up
                </span>
              )}
            </div>
          </div>

          {/* Large Number: Outstanding Work Count */}
          <div className="hero-metric-display">
            {loading && !hasData ? (
              <div className="analytics-skeleton-stat" />
            ) : (
              <div
                className={`hero-giant-number ${needHelpCount > 0 ? 'attention-glow' : ''}`}
                id="need-help-hero-count"
              >
                {needHelpCount}
              </div>
            )}
            <div className="hero-caption-note">
              {loading && !hasData
                ? 'Checking conversations…'
                : needHelpCount === 0
                ? 'All customer questions answered'
                : needHelpCount === 1
                ? '1 customer conversation waiting for your reply'
                : `${needHelpCount} customer conversations waiting for your reply`}
            </div>
          </div>

          {/* Up to 3 Waiting Customers List */}
          {needHelpCount > 0 && waitingList.length > 0 && (
            <div className="waiting-customers-list" aria-label="Customers requiring attention">
              {waitingList.map((customer) => (
                <div
                  key={customer.id}
                  className="waiting-customer-row"
                  onClick={() => handleViewMessages(customer.id)}
                  title={`Open conversation with ${customer.name}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleViewMessages(customer.id);
                    }
                  }}
                >
                  <CustomerInitialsAvatar name={customer.name} size={38} />

                  <div className="waiting-customer-info">
                    <div className="waiting-customer-top-line">
                      <span className="waiting-customer-name">{customer.name}</span>
                      <div className="waiting-customer-meta">
                        <span className="channel-mini-pill">
                          <ChannelIcon channel={customer.channel} size={12} />
                          <span>{customer.channel === 'WHATSAPP' ? 'WhatsApp' : customer.channel}</span>
                        </span>
                        {customer.updatedAt && (
                          <span className="waiting-time-text">
                            <Clock size={11} />
                            {formatTimeAgo(customer.updatedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="waiting-customer-snippet">
                      {customer.lastMessage || 'Waiting for reply'}
                    </p>
                  </div>

                  <div className="waiting-customer-action-arrow">
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zero-data friendly state when no customers are waiting */}
          {!loading && needHelpCount === 0 && (
            <div className="all-clear-state-box">
              <div className="all-clear-icon-circle">
                <CheckCircle2 size={22} color="#087A4A" />
              </div>
              <div>
                <p className="all-clear-title">Great job! No customers are waiting.</p>
                <p className="all-clear-desc">
                  Your AI assistant is answering inquiries automatically. New requests requiring your attention will appear here.
                </p>
              </div>
            </div>
          )}

          {/* Action Button: View Messages */}
          <div className="card-action-footer">
            <button
              type="button"
              className="btn-view-messages"
              onClick={() => handleViewMessages()}
              id="btn-view-messages"
            >
              <MessageSquare size={17} />
              <span>View Messages</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AnalyticsPage;
