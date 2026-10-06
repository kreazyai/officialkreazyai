import React from 'react';
import { Network, ArrowUpRight, BarChart2 } from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * ChannelPerformance — Commerce Infrastructure Channel Performance
 * WhatsApp, Instagram, Facebook metrics: Messages, Orders, Conversion.
 * Designed to look like enterprise commerce infrastructure.
 */
export function ChannelPerformance({
  channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      badge: 'whatsapp',
      messages: 128,
      orders: 12,
      conversion: '9.4%',
      ratio: 94
    },
    {
      id: 'instagram',
      name: 'Instagram',
      badge: 'instagram',
      messages: 94,
      orders: 8,
      conversion: '8.5%',
      ratio: 85
    },
    {
      id: 'facebook',
      name: 'Facebook',
      badge: 'facebook',
      messages: 62,
      orders: 5,
      conversion: '8.1%',
      ratio: 81
    }
  ],
  onManageChannels
}) {
  return (
    <div className="card channel-performance-card">
      <div className="card-header-flex">
        <div>
          <div className="chart-title-wrap">
            <h3 className="card-title">Channel Performance</h3>
            <span className="infrastructure-badge">Commerce Telemetry</span>
          </div>
          <p className="card-subtitle">Social commerce throughput & conversion by channel</p>
        </div>

        <div className="agent-badge-icon">
          <BarChart2 size={18} color="var(--bright-olive)" />
        </div>
      </div>

      {/* Channel Rows */}
      <div className="channel-perf-list">
        {channels.map((ch) => (
          <div key={ch.id} className="channel-perf-row">
            <div className="channel-perf-header">
              <div className="channel-perf-identity">
                <Badge variant={ch.badge}>{ch.name}</Badge>
                <span className="channel-stat-count">{ch.messages} messages</span>
              </div>
              <div className="channel-perf-metrics">
                <span className="channel-orders-text">
                  <strong>{ch.orders}</strong> orders
                </span>
                <span className="channel-conv-pill">
                  {ch.conversion}
                </span>
              </div>
            </div>

            {/* Infrastructure Progress Bar */}
            <div className="infra-progress-wrap">
              <div className="infra-progress-track">
                <div
                  className={`infra-progress-fill ${ch.id}`}
                  style={{ width: `${Math.min(100, ch.ratio || 70)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="card-footer-action">
        <button
          type="button"
          className="btn-inline-action"
          onClick={onManageChannels}
        >
          <span>Manage Channel Endpoints</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
