import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * KpiCard — Compact, dense operations dashboard KPI card
 * Adheres strictly to Kreazy AI dark forest green visual hierarchy
 */
export function KpiCard({
  title,
  value,
  supportingText,
  icon: Icon,
  trend,
  status = 'default',
  onClick
}) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      className={`kpi-card ${isInteractive ? 'interactive' : ''}`}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div className="kpi-icon-wrap">
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="kpi-value-row">
        <span className="kpi-value">{value}</span>
        {trend && (
          <span className={`kpi-trend-pill ${trend.isPositive ? 'positive' : 'neutral'}`}>
            {trend.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend.value}
          </span>
        )}
      </div>

      <div className="kpi-supporting">
        <span className="kpi-supporting-text">{supportingText}</span>
      </div>
    </div>
  );
}
