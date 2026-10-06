import React, { useState } from 'react';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';

/**
 * OrderStatusChart — Circular Donut Visualization of Order Status
 * Completed, Processing, Pending, Cancelled with center total count.
 */
export function OrderStatusChart({
  completed = 14,
  processing = 6,
  pending = 3,
  cancelled = 1,
  onViewOrders
}) {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  const total = completed + processing + pending + cancelled;

  const segments = [
    { id: 'completed', label: 'Completed', count: completed, color: '#8FA45A' },
    { id: 'processing', label: 'Processing', count: processing, color: '#71834A' },
    { id: 'pending', label: 'Pending', count: pending, color: '#D6A85C' },
    { id: 'cancelled', label: 'Cancelled', count: cancelled, color: '#D93636' }
  ];

  // SVG Donut geometry
  const radius = 54;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Compute stroke offsets
  let accumulatedPercent = 0;
  const renderedSegments = segments.map((seg) => {
    const percent = total > 0 ? seg.count / total : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return {
      ...seg,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="card order-status-chart-card">
      <div className="card-header-flex">
        <div>
          <h3 className="card-title">Order Status</h3>
          <p className="card-subtitle">Fulfillment lifecycle distribution</p>
        </div>
        <div className="agent-badge-icon">
          <ShoppingBag size={18} color="var(--bright-olive)" />
        </div>
      </div>

      <div className="donut-content-layout">
        {/* SVG Donut */}
        <div className="donut-svg-wrap">
          <svg
            className="donut-svg"
            viewBox="0 0 140 140"
            width="130"
            height="130"
          >
            {/* Background Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="rgba(69, 88, 64, 0.25)"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {renderedSegments.map((seg) => (
              <circle
                key={seg.id}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={hoveredSegment === seg.id ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  opacity: hoveredSegment && hoveredSegment !== seg.id ? 0.45 : 1
                }}
                onMouseEnter={() => setHoveredSegment(seg.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
          </svg>

          {/* Center Text inside Donut */}
          <div className="donut-center-info">
            <span className="donut-center-number">{total}</span>
            <span className="donut-center-label">Total Orders</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="donut-legend-list">
          {renderedSegments.map((seg) => {
            const isHovered = hoveredSegment === seg.id;
            return (
              <div
                key={seg.id}
                className={`donut-legend-item ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredSegment(seg.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              >
                <div className="legend-indicator">
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: seg.color }}
                  ></span>
                  <span className="legend-name">{seg.label}</span>
                </div>
                <div className="legend-stats">
                  <strong className="legend-count">{seg.count}</strong>
                  <span className="legend-percent">{total > 0 ? `${seg.percent}%` : '0%'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer-action">
        <button
          type="button"
          className="btn-inline-action"
          onClick={onViewOrders}
        >
          <span>View All Orders</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
