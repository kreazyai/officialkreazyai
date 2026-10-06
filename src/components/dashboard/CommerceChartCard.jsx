import React, { useState, useMemo, useRef } from 'react';
import { TrendingUp, ShoppingBag, MessageSquare, DollarSign, Calendar } from 'lucide-react';

/**
 * CommerceChartCard — Large analytics card with professional SVG area/line chart
 * Supports metric switching, timeframe toggles (7D, 30D, 90D, 12M),
 * interactive hover crosshair & tooltips, and graceful zero/empty state.
 */
export function CommerceChartCard({ isZeroState = false }) {
  const [timeframe, setTimeframe] = useState('30D');
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'orders' | 'conversations'
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);

  // Timeframe multipliers & date labels
  const dataSeries = useMemo(() => {
    if (isZeroState) {
      const emptyLabels = {
        '7D': ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
        '30D': ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        '90D': ['Month 1', 'Month 2', 'Month 3'],
        '12M': ['Q1', 'Q2', 'Q3', 'Q4']
      }[timeframe] || ['W1', 'W2', 'W3', 'W4'];

      return {
        labels: emptyLabels,
        revenue: emptyLabels.map(() => 0),
        orders: emptyLabels.map(() => 0),
        conversations: emptyLabels.map(() => 0),
        summary: {
          revenue: '$0.00',
          orders: '0',
          conversations: '0',
          trend: 'Standby for traffic'
        }
      };
    }

    // Realistic operational telemetry data inspired by prompt
    switch (timeframe) {
      case '7D':
        return {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          revenue: [180, 320, 490, 680, 840, 1120, 1450],
          orders: [2, 3, 5, 6, 8, 10, 14],
          conversations: [8, 14, 21, 26, 32, 44, 58],
          summary: {
            revenue: '$1,450.00',
            orders: '14',
            conversations: '58',
            trend: '+12.4% vs prev week'
          }
        };
      case '90D':
        return {
          labels: ['Jul', 'Aug', 'Sep'],
          revenue: [3200, 6400, 9850],
          orders: [28, 54, 82],
          conversations: [110, 220, 345],
          summary: {
            revenue: '$9,850.00',
            orders: '82',
            conversations: '345',
            trend: '+28.1% vs prev quarter'
          }
        };
      case '12M':
        return {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          revenue: [4500, 11200, 19800, 31400],
          orders: [38, 92, 168, 264],
          conversations: [180, 420, 780, 1290],
          summary: {
            revenue: '$31,400.00',
            orders: '264',
            conversations: '1,290',
            trend: '+44.6% year-to-date'
          }
        };
      case '30D':
      default:
        return {
          labels: ['Oct 1', 'Oct 6', 'Oct 11', 'Oct 16', 'Oct 21', 'Oct 26', 'Oct 31'],
          revenue: [0, 420, 850, 1300, 2100, 2800, 3600],
          orders: [0, 4, 8, 12, 18, 22, 24],
          conversations: [0, 12, 24, 38, 52, 64, 71],
          summary: {
            revenue: '$3,600.00',
            orders: '24',
            conversations: '71',
            trend: '+19.2% vs previous 30 days'
          }
        };
    }
  }, [timeframe, isZeroState]);

  const activeValues = dataSeries[activeMetric];
  const maxVal = Math.max(...activeValues, isZeroState ? 100 : 1);
  const minVal = 0;

  // Chart SVG bounds
  const svgWidth = 720;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 28;
  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingY * 2;

  // Compute points
  const points = activeValues.map((val, idx) => {
    const x = paddingX + (idx / (activeValues.length - 1 || 1)) * innerWidth;
    const norm = maxVal === minVal ? 0 : (val - minVal) / (maxVal - minVal);
    const y = svgHeight - paddingY - norm * innerHeight;
    return { x, y, val, label: dataSeries.labels[idx] };
  });

  // Generate smooth path
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (!linePath || points.length === 0) return '';
    const last = points[points.length - 1];
    const first = points[0];
    const baseY = svgHeight - paddingY;
    return `${linePath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
  }, [linePath, points, svgHeight, paddingY]);

  // Handle mouse move for tooltips
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (clientX - paddingX) / innerWidth));
    const closestIdx = Math.round(ratio * (points.length - 1));
    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const formatMetricVal = (val, metric) => {
    if (metric === 'revenue') return `$${Number(val).toLocaleString()}`;
    return Number(val).toLocaleString();
  };

  return (
    <div className="card commerce-chart-card" ref={containerRef}>
      {/* Header with Title and Time Selector */}
      <div className="chart-header-row">
        <div>
          <div className="chart-title-wrap">
            <h3 className="chart-title">Commerce Performance</h3>
            <span className="live-telemetry-badge">
              <span className="telemetry-dot"></span>
              {isZeroState ? 'Initial Telemetry' : 'Live Stream'}
            </span>
          </div>
          <p className="chart-subtitle">Revenue, orders and customer activity</p>
        </div>

        {/* Time Selector */}
        <div className="chart-controls-right">
          <div className="timeframe-selector" role="group" aria-label="Timeframe">
            {['7D', '30D', '90D', '12M'].map((t) => (
              <button
                key={t}
                type="button"
                className={`timeframe-btn ${timeframe === t ? 'active' : ''}`}
                onClick={() => setTimeframe(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Quick-Pills / Metric Selection Tabs */}
      <div className="metric-tabs-row">
        <button
          type="button"
          className={`metric-tab-pill ${activeMetric === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveMetric('revenue')}
        >
          <div className="metric-tab-icon">
            <DollarSign size={14} />
          </div>
          <div className="metric-tab-info">
            <span className="metric-tab-label">Revenue</span>
            <span className="metric-tab-val">{dataSeries.summary.revenue}</span>
          </div>
        </button>

        <button
          type="button"
          className={`metric-tab-pill ${activeMetric === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveMetric('orders')}
        >
          <div className="metric-tab-icon">
            <ShoppingBag size={14} />
          </div>
          <div className="metric-tab-info">
            <span className="metric-tab-label">Orders</span>
            <span className="metric-tab-val">{dataSeries.summary.orders}</span>
          </div>
        </button>

        <button
          type="button"
          className={`metric-tab-pill ${activeMetric === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveMetric('conversations')}
        >
          <div className="metric-tab-icon">
            <MessageSquare size={14} />
          </div>
          <div className="metric-tab-info">
            <span className="metric-tab-label">Conversations</span>
            <span className="metric-tab-val">{dataSeries.summary.conversations}</span>
          </div>
        </button>

        <div className="metric-trend-summary">
          <TrendingUp size={14} color="var(--bright-olive)" />
          <span>{dataSeries.summary.trend}</span>
        </div>
      </div>

      {/* SVG Line / Area Graph */}
      <div
        className="chart-svg-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="chart-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="kreazyGreenAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8FA45A" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#71834A" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#172319" stopOpacity="0.0" />
            </linearGradient>
            <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#8FA45A" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + ratio * innerHeight;
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="rgba(69, 88, 64, 0.25)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#kreazyGreenAreaGrad)" />

          {/* Main Stroke Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--bright-olive, #8FA45A)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#subtleGlow)"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 3.5}
                  fill={isHovered ? '#FFFFFF' : 'var(--bright-olive, #8FA45A)'}
                  stroke="#172319"
                  strokeWidth="2"
                  style={{ transition: 'all 0.15s ease' }}
                />
              </g>
            );
          })}

          {/* Hover Crosshair */}
          {hoverIndex !== null && points[hoverIndex] && (
            <g>
              <line
                x1={points[hoverIndex].x}
                y1={paddingY}
                x2={points[hoverIndex].x}
                y2={svgHeight - paddingY}
                stroke="rgba(143, 164, 90, 0.55)"
                strokeDasharray="2 2"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Box */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            className="chart-floating-tooltip"
            style={{
              left: `${(points[hoverIndex].x / svgWidth) * 100}%`,
              top: `${(points[hoverIndex].y / svgHeight) * 100}%`
            }}
          >
            <div className="tooltip-date">{points[hoverIndex].label}</div>
            <div className="tooltip-value">
              <span className="tooltip-metric-name">
                {activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}:
              </span>
              <strong className="tooltip-metric-num">
                {formatMetricVal(points[hoverIndex].val, activeMetric)}
              </strong>
            </div>
            <div className="tooltip-sub">
              <span>Orders: {dataSeries.orders[hoverIndex]}</span>
              <span>Chats: {dataSeries.conversations[hoverIndex]}</span>
            </div>
          </div>
        )}

        {/* X-Axis Labels */}
        <div className="chart-x-axis">
          {dataSeries.labels.map((lbl, idx) => (
            <span
              key={idx}
              className={`x-axis-label ${hoverIndex === idx ? 'active' : ''}`}
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Empty State Banner if completely zero */}
      {isZeroState && (
        <div className="chart-empty-state-notice">
          <Calendar size={14} color="var(--text-muted)" />
          <span>No historical traffic recorded yet. Connect Meta channels to begin streaming telemetry.</span>
        </div>
      )}
    </div>
  );
}
