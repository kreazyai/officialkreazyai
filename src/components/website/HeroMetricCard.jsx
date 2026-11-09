import React, { useState, useEffect } from 'react';

/**
 * HeroMetricCard
 * Replicates the exact glassmorphic metric card from the reference video,
 * featuring auto-cycling and clickable states:
 * 1. Revenue Growth (Equalizer bars & live metrics)
 * 2. Sales Trend (Pipeline & Stepped Bar Chart)
 * 3. Lead Performance (AQI Qualified & Dot Matrix)
 */
export function HeroMetricCard({ className = '' }) {
  const [activeTab, setActiveTab] = useState(0); // 0: Revenue, 1: Sales, 2: Leads

  // Auto-cycle through the 3 states every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`hero-apogee-card ${className}`} role="region" aria-label="Live Performance Metrics">
      {/* Subtle Card Glow Header / Tab Switcher */}
      <div className="hero-card-tab-nav">
        <button
          type="button"
          className={`hero-card-tab-dot ${activeTab === 0 ? 'active' : ''}`}
          onClick={() => setActiveTab(0)}
          title="Revenue Growth"
          aria-label="Show Revenue Growth"
        />
        <button
          type="button"
          className={`hero-card-tab-dot ${activeTab === 1 ? 'active' : ''}`}
          onClick={() => setActiveTab(1)}
          title="Sales Trend"
          aria-label="Show Sales Trend"
        />
        <button
          type="button"
          className={`hero-card-tab-dot ${activeTab === 2 ? 'active' : ''}`}
          onClick={() => setActiveTab(2)}
          title="Lead Performance"
          aria-label="Show Lead Performance"
        />
      </div>

      {/* STATE 0: REVENUE GROWTH */}
      {activeTab === 0 && (
        <div className="hero-card-content fade-in">
          <div className="hero-card-header-title">Revenue Growth</div>
          <div className="hero-card-big-value">
            <span className="big-val-main">$14,205,890</span>
            <span className="big-val-decimal">.00</span>
          </div>

          <div className="hero-card-subline">
            <span className="hero-card-pill-badge">+32.4%</span>
            <span className="hero-card-subtext">vs. previous period ($10.7M)</span>
          </div>

          {/* Equalizer Audio/Activity Bar Chart */}
          <div className="hero-card-chart-equalizer">
            <div className="equalizer-bars-row">
              {[
                25, 45, 60, 35, 75, 90, 40, 55, 80, 100, 65, 45, 85, 30, 70, 95, 50, 40, 60, 85,
                30, 20, 25, 30, 22, 28, 20, 18, 24, 20
              ].map((h, i) => (
                <span
                  key={i}
                  className="eq-bar"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${(i * 0.08) % 1.2}s`
                  }}
                />
              ))}
            </div>
            <div className="equalizer-timeline">
              <span>10:00</span>
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00</span>
              <span>18:00</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: SALES TREND */}
      {activeTab === 1 && (
        <div className="hero-card-content fade-in">
          <div className="hero-card-header-title">Sales Trend</div>
          
          <div className="hero-card-duo-metrics">
            <div className="duo-metric-item">
              <span className="duo-label">Active Pipeline</span>
              <span className="duo-value">$4.8M</span>
            </div>
            <div className="duo-metric-item">
              <span className="duo-label">Win Rate Prediction</span>
              <span className="duo-value">85%</span>
            </div>
          </div>

          <div className="hero-card-divider-lines">
            <div className="divider-line" />
            <div className="divider-line active" />
          </div>

          {/* Stepped Bar Chart with Solid White Highlight */}
          <div className="hero-card-stepped-chart">
            <div className="stepped-bar-col" style={{ height: '35%' }}>
              <span className="stepped-bar-cap" />
              <div className="stepped-bar-body" />
            </div>
            <div className="stepped-bar-col" style={{ height: '55%' }}>
              <span className="stepped-bar-cap" />
              <div className="stepped-bar-body" />
            </div>
            <div className="stepped-bar-col" style={{ height: '65%' }}>
              <span className="stepped-bar-cap" />
              <div className="stepped-bar-body" />
            </div>
            <div className="stepped-bar-col" style={{ height: '45%' }}>
              <span className="stepped-bar-cap" />
              <div className="stepped-bar-body" />
            </div>
            {/* Highlighted 5th Bar */}
            <div className="stepped-bar-col highlighted" style={{ height: '90%' }}>
              <div className="stepped-bar-body solid-white" />
            </div>
            <div className="stepped-bar-col" style={{ height: '38%' }}>
              <span className="stepped-bar-cap" />
              <div className="stepped-bar-body" />
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: LEAD PERFORMANCE */}
      {activeTab === 2 && (
        <div className="hero-card-content fade-in">
          <div className="hero-card-header-title">Lead Performance</div>
          
          <div className="hero-card-duo-metrics">
            <div className="duo-metric-item">
              <span className="duo-label">Total Generated</span>
              <span className="duo-value">84,592</span>
            </div>
            <div className="duo-metric-item">
              <span className="duo-label">AI-Qualified (AQI)</span>
              <span className="duo-value">94.2%</span>
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
        </div>
      )}
    </div>
  );
}
