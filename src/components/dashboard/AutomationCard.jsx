import React from 'react';
import { Bot, CheckCircle2, Cpu, Zap, ArrowUpRight, ShieldCheck } from 'lucide-react';

/**
 * AutomationCard — AI Automation Performance Card
 * Real-time operational metrics: Inquiries handled, Orders processed,
 * Automated responses, and AI conversion rate with status indicators.
 */
export function AutomationCard({
  inquiriesHandled = 0,
  ordersProcessed = 0,
  automatedResponses = 0,
  conversionRate = '0%',
  status = 'READY',
  onConfigureAi
}) {
  const isReady = status === 'READY' || status === 'ACTIVE';

  return (
    <div className="card automation-metric-card">
      <div className="card-header-flex">
        <div>
          <div className="chart-title-wrap">
            <h3 className="card-title">AI Automation</h3>
            <span className="status-pill ready">
              <span className="telemetry-dot"></span>
              STATUS: {status}
            </span>
          </div>
          <p className="card-subtitle">Autonomous customer inquiry resolution & order automation</p>
        </div>

        <div className="agent-badge-icon">
          <Cpu size={18} color="var(--bright-olive)" />
        </div>
      </div>

      {/* 2x2 Metric Grid */}
      <div className="automation-grid-2x2">
        <div className="automation-cell">
          <span className="auto-cell-label">Customer inquiries handled</span>
          <strong className="auto-cell-val">{inquiriesHandled}</strong>
        </div>

        <div className="automation-cell">
          <span className="auto-cell-label">Orders processed</span>
          <strong className="auto-cell-val">{ordersProcessed}</strong>
        </div>

        <div className="automation-cell">
          <span className="auto-cell-label">Automated responses</span>
          <strong className="auto-cell-val">{automatedResponses}</strong>
        </div>

        <div className="automation-cell">
          <span className="auto-cell-label">AI conversion rate</span>
          <strong className="auto-cell-val highlight">{conversionRate}</strong>
        </div>
      </div>

      {/* Progress Bars / Health Telemetry */}
      <div className="automation-progress-section">
        <div className="auto-progress-row">
          <div className="progress-labels">
            <span>Autonomous Confidence</span>
            <strong className="text-olive">{inquiriesHandled > 0 ? '98.4%' : 'Standby'}</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: inquiriesHandled > 0 ? '98.4%' : '0%' }}></div>
          </div>
        </div>

        <div className="auto-progress-row">
          <div className="progress-labels">
            <span>Catalog Matching Precision</span>
            <strong className="text-olive">{inquiriesHandled > 0 ? '96.8%' : 'Standby'}</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: inquiriesHandled > 0 ? '96.8%' : '0%' }}></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer-action">
        <button
          type="button"
          className="btn-inline-action"
          onClick={onConfigureAi}
        >
          <span>Configure AI Agent Parameters</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
