import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, TrendingUp, Zap, BarChart3, Users } from 'lucide-react';

/**
 * HeroMetricCard
 * Replicates and elevates the authentic glassmorphic metric card from the background video,
 * bringing it upfront into a visible, high-contrast, fully responsive box.
 *
 * Features:
 * - Default currency: Bangla Taka (৳ BDT) peaking at ৳500,000 with interactive hovering
 * - Currency toggle: ৳ BDT | $ USD
 * - 3 Interactive Tabs: Revenue Growth, Sales Trend, Lead Performance
 * - Interactive Equalizer Bars: Mouse hover / touch scrub updates live taka hovering tooltip up to ৳500,000
 * - Pristine responsiveness on mobile (touch friendly, clamp typography, zero overflow) & web
 */

const EQUALIZER_DATA = [
  { time: '09:00', height: 28, bdt: 140000, usd: 1190 },
  { time: '09:20', height: 38, bdt: 190000, usd: 1615 },
  { time: '09:40', height: 45, bdt: 225000, usd: 1912 },
  { time: '10:00', height: 55, bdt: 275000, usd: 2337 },
  { time: '10:20', height: 62, bdt: 310000, usd: 2635 },
  { time: '10:40', height: 48, bdt: 240000, usd: 2040 },
  { time: '11:00', height: 70, bdt: 350000, usd: 2975 },
  { time: '11:20', height: 65, bdt: 325000, usd: 2762 },
  { time: '11:40', height: 80, bdt: 400000, usd: 3400 },
  { time: '12:00', height: 85, bdt: 425000, usd: 3612 },
  { time: '12:20', height: 72, bdt: 360000, usd: 3060 },
  { time: '12:40', height: 60, bdt: 300000, usd: 2550 },
  { time: '13:00', height: 50, bdt: 250000, usd: 2125 },
  { time: '13:20', height: 68, bdt: 340000, usd: 2890 },
  { time: '13:40', height: 78, bdt: 390000, usd: 3315 },
  { time: '14:00', height: 88, bdt: 440000, usd: 3740 },
  { time: '14:20', height: 75, bdt: 375000, usd: 3187 },
  { time: '14:40', height: 82, bdt: 410000, usd: 3485 },
  { time: '15:00', height: 92, bdt: 460000, usd: 3910 },
  { time: '15:20', height: 85, bdt: 425000, usd: 3612 },
  { time: '15:40', height: 94, bdt: 470000, usd: 3995 },
  { time: '16:00', height: 100, bdt: 500000, usd: 4250, isPeak: true },
  { time: '16:20', height: 86, bdt: 430000, usd: 3655 },
  { time: '16:40', height: 74, bdt: 370000, usd: 3145 },
  { time: '17:00', height: 66, bdt: 330000, usd: 2805 },
  { time: '17:20', height: 58, bdt: 290000, usd: 2465 },
  { time: '17:40', height: 46, bdt: 230000, usd: 1955 },
  { time: '18:00', height: 52, bdt: 260000, usd: 2210 },
  { time: '18:20', height: 40, bdt: 200000, usd: 1700 },
  { time: '18:40', height: 35, bdt: 175000, usd: 1487 }
];

const STEPPED_BARS = [
  { label: 'Chat Initiated', height: 38, bdt: '৳1,20,000', usd: '$1,020' },
  { label: 'Product Queried', height: 55, bdt: '৳2,40,000', usd: '$2,040' },
  { label: 'Cart Checkout', height: 68, bdt: '৳3,80,000', usd: '$3,230' },
  { label: 'COD Confirmed', height: 48, bdt: '৳2,10,000', usd: '$1,785' },
  { label: 'Closed Revenue', height: 92, bdt: '৳5,00,000', usd: '$4,250', isPeak: true },
  { label: 'Repeat Orders', height: 42, bdt: '৳1,80,000', usd: '$1,530' }
];

export function HeroMetricCard({ className = '', onNavigate }) {
  const [activeTab, setActiveTab] = useState(0); // 0: Revenue Growth, 1: Sales Trend, 2: Lead Performance
  const [currency, setCurrency] = useState('BDT'); // 'BDT' | 'USD'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredSteppedIndex, setHoveredSteppedIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const chartRef = useRef(null);

  // Auto-cycle tabs unless user is interacting/hovering
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 4800);
    return () => clearInterval(timer);
  }, [isPaused]);

  // Format currency numbers
  const formatTaka = (amount) => {
    return Number(amount).toLocaleString('en-IN');
  };

  // Currently active or hovered values for Tab 0 (Revenue Growth)
  const activeBar = hoveredBarIndex !== null ? EQUALIZER_DATA[hoveredBarIndex] : null;
  const displayRevenueMain = activeBar
    ? currency === 'BDT'
      ? `৳${formatTaka(activeBar.bdt)}`
      : `$${activeBar.usd.toLocaleString('en-US')}`
    : currency === 'BDT'
    ? '৳500,000'
    : '$4,250';

  const displayRevenueDecimal = '.00';

  // Handle touch scrub on mobile for equalizer bars
  const handleTouchMove = (e) => {
    if (!chartRef.current) return;
    const touch = e.touches[0];
    const rect = chartRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    if (x >= 0 && x <= width) {
      const index = Math.min(
        EQUALIZER_DATA.length - 1,
        Math.max(0, Math.floor((x / width) * EQUALIZER_DATA.length))
      );
      setHoveredBarIndex(index);
    }
  };

  return (
    <div
      className={`hero-apogee-card hero-visible-metric-card ${className}`}
      role="region"
      aria-label="Live Store Performance Metrics"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setHoveredBarIndex(null);
        setHoveredSteppedIndex(null);
      }}
    >
      {/* Top Header Bar: Currency & Tab Switchers */}
      <div className="hero-metric-header-bar" style={{ justifyContent: 'flex-end' }}>
        {/* Currency & Tab Controls */}
        <div className="hero-metric-controls" style={{ marginLeft: 'auto' }}>
          {/* Currency Toggle */}
          <div className="hero-metric-pill-switcher" role="group" aria-label="Currency selection">
            <button
              type="button"
              className={`metric-pill-btn ${currency === 'BDT' ? 'active' : ''}`}
              onClick={() => setCurrency('BDT')}
              title="Bangla Taka"
            >
              ৳ BDT
            </button>
            <button
              type="button"
              className={`metric-pill-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => setCurrency('USD')}
              title="US Dollar"
            >
              $ USD
            </button>
          </div>

          {/* Tab Switcher Dots */}
          <div className="hero-card-tab-nav" role="tablist" aria-label="Metric views">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 0}
              className={`hero-card-tab-dot ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
              title="Revenue Growth (Bangla Taka)"
              aria-label="Show Revenue Growth"
            />
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 1}
              className={`hero-card-tab-dot ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
              title="Sales Trend"
              aria-label="Show Sales Trend"
            />
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 2}
              className={`hero-card-tab-dot ${activeTab === 2 ? 'active' : ''}`}
              onClick={() => setActiveTab(2)}
              title="Lead Performance"
              aria-label="Show Lead Performance"
            />
          </div>
        </div>
      </div>

      {/* STATE 0: REVENUE GROWTH (Bangla Taka Hovering) */}
      {activeTab === 0 && (
        <div className="hero-card-content fade-in">
          <div className="hero-metric-title-row">
            <div className="hero-card-header-title">Revenue Growth</div>
            <span className="hero-metric-state-pill">
              <TrendingUp size={12} className="metric-pill-icon" />
              <span>Real-time Meta Sales</span>
            </span>
          </div>

          {/* Big Value Display with Live Hover Reactivity */}
          <div className="hero-card-big-value">
            <span className="big-val-main value-hover-highlight">{displayRevenueMain}</span>
            <span className="big-val-decimal">{displayRevenueDecimal}</span>
          </div>

          <div className="hero-card-subline">
            <span className="hero-card-pill-badge">+38.4%</span>
            <span className="hero-card-subtext">
              {currency === 'BDT'
                ? 'vs. previous period (৳3,60,000)'
                : 'vs. previous period ($3,060)'}
            </span>
          </div>

          {/* Equalizer Audio/Activity Bar Chart with Hover Scrubber */}
          <div
            className="hero-card-chart-equalizer"
            ref={chartRef}
            onTouchStart={() => setIsPaused(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => {
              setIsPaused(false);
              setHoveredBarIndex(null);
            }}
          >
            {/* Hover Tooltip Pill */}
            <div className={`metric-hover-tooltip ${activeBar ? 'visible' : ''}`}>
              {activeBar ? (
                <span>
                  <strong>{activeBar.time}</strong> •{' '}
                  {currency === 'BDT' ? `৳${formatTaka(activeBar.bdt)}` : `$${activeBar.usd}`}
                  {activeBar.isPeak ? ' (Peak Today)' : ''}
                </span>
              ) : (
                <span>Hover or drag bars to scrub hourly taka volume</span>
              )}
            </div>

            {/* 30 Equalizer Bars */}
            <div className="equalizer-bars-row">
              {EQUALIZER_DATA.map((item, idx) => {
                const isHovered = hoveredBarIndex === idx;
                const isPeak = item.isPeak;
                return (
                  <span
                    key={idx}
                    className={`eq-bar ${isPeak ? 'peak-bar' : ''} ${isHovered ? 'hovered-bar' : ''}`}
                    style={{
                      height: `${item.height}%`,
                      animationDelay: `${(idx * 0.07) % 1.2}s`
                    }}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    title={`${item.time}: ${
                      currency === 'BDT' ? `৳${formatTaka(item.bdt)}` : `$${item.usd}`
                    }`}
                  />
                );
              })}
            </div>

            {/* Timeline Hours */}
            <div className="equalizer-timeline">
              <span>10:00</span>
              <span>12:00</span>
              <span className="timeline-peak-label">16:00 (৳500K)</span>
              <span>18:00</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: SALES TREND */}
      {activeTab === 1 && (
        <div className="hero-card-content fade-in">
          <div className="hero-metric-title-row">
            <div className="hero-card-header-title">Sales Trend</div>
            <span className="hero-metric-state-pill">
              <Zap size={12} className="metric-pill-icon" />
              <span>Conversion Pipeline</span>
            </span>
          </div>

          <div className="hero-card-duo-metrics">
            <div className="duo-metric-item">
              <span className="duo-label">Active Pipeline</span>
              <span className="duo-value">
                {currency === 'BDT' ? '৳1,850,000' : '$15,700'}
              </span>
            </div>
            <div className="duo-metric-item">
              <span className="duo-label">Win Rate Prediction</span>
              <span className="duo-value highlight-green">88%</span>
            </div>
          </div>

          <div className="hero-card-divider-lines">
            <div className="divider-line" />
            <div className="divider-line active" />
          </div>

          {/* Stepped Bar Chart */}
          <div className="hero-card-stepped-chart">
            {STEPPED_BARS.map((step, idx) => {
              const isHovered = hoveredSteppedIndex === idx;
              return (
                <div
                  key={idx}
                  className={`stepped-bar-col ${step.isPeak ? 'highlighted' : ''} ${
                    isHovered ? 'hover-step' : ''
                  }`}
                  style={{ height: `${step.height}%` }}
                  onMouseEnter={() => setHoveredSteppedIndex(idx)}
                  onMouseLeave={() => setHoveredSteppedIndex(null)}
                  title={`${step.label}: ${currency === 'BDT' ? step.bdt : step.usd}`}
                >
                  <span className="stepped-bar-cap" />
                  <div
                    className={`stepped-bar-body ${step.isPeak ? 'solid-white' : ''} ${
                      isHovered ? 'solid-green' : ''
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <div className="stepped-chart-caption">
            {hoveredSteppedIndex !== null ? (
              <span>
                <strong>{STEPPED_BARS[hoveredSteppedIndex].label}:</strong>{' '}
                {currency === 'BDT'
                  ? STEPPED_BARS[hoveredSteppedIndex].bdt
                  : STEPPED_BARS[hoveredSteppedIndex].usd}
              </span>
            ) : (
              <span>Hover bars to inspect funnel conversion stages</span>
            )}
          </div>
        </div>
      )}

      {/* STATE 2: LEAD PERFORMANCE */}
      {activeTab === 2 && (
        <div className="hero-card-content fade-in">
          <div className="hero-metric-title-row">
            <div className="hero-card-header-title">Lead Performance</div>
            <span className="hero-metric-state-pill">
              <Users size={12} className="metric-pill-icon" />
              <span>AI Lead Qualifier</span>
            </span>
          </div>

          <div className="hero-card-duo-metrics">
            <div className="duo-metric-item">
              <span className="duo-label">Total Handled</span>
              <span className="duo-value">128,450</span>
            </div>
            <div className="duo-metric-item">
              <span className="duo-label">AI-Qualified (AQI)</span>
              <span className="duo-value highlight-green">96.2%</span>
            </div>
          </div>

          {/* Dot Matrix Heat Grid */}
          <div className="hero-card-dot-matrix">
            {Array.from({ length: 48 }).map((_, idx) => {
              const isLit = [3, 7, 12, 14, 19, 23, 27, 31, 35, 39, 42, 45].includes(idx);
              const isHighlight = [14, 27, 39].includes(idx);
              return (
                <span
                  key={idx}
                  className={`matrix-dot ${isLit ? 'lit' : ''} ${isHighlight ? 'glow-red' : ''}`}
                  style={{ animationDelay: `${(idx * 0.05) % 2}s` }}
                />
              );
            })}
          </div>

          <div className="dot-matrix-caption">
            <span>● High-intent buyers automatically qualified & routed into checkout</span>
          </div>
        </div>
      )}

      {/* Footer Micro Trust & Link */}
      <div className="hero-metric-footer">
        <div className="hero-metric-footer-note">
          <span>Autonomous 24/7 Sales Engine</span>
        </div>
        <button
          type="button"
          className="hero-metric-cta-link"
          onClick={() => {
            if (onNavigate) {
              onNavigate('signup');
            }
          }}
        >
          <span>Get Started Free</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
