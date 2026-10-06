import React from 'react';
import { Network, ArrowUpRight, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

/**
 * ChannelHealth — Channel Ingestion & Health Card
 * Displays official Meta webhooks/connections: WhatsApp, Instagram, Facebook.
 * With connection status, daily volume, and direct setup CTA.
 */
export function ChannelHealth({
  channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      badge: 'whatsapp',
      account: '+1 (555) 839-2041',
      connected: true,
      messagesToday: 342,
      latency: '24ms'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      badge: 'instagram',
      account: '@kreazy_retail',
      connected: true,
      messagesToday: 218,
      latency: '31ms'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      badge: 'facebook',
      account: 'Kreazy Brand Official Page',
      connected: true,
      messagesToday: 89,
      latency: '45ms'
    }
  ],
  onManageChannels
}) {
  return (
    <div className="card channel-health-card">
      <div className="card-header-flex">
        <div>
          <div className="chart-title-wrap">
            <h3 className="card-title">Channel Ingestion & Health</h3>
            <span className="infrastructure-badge">Webhooks Live</span>
          </div>
          <p className="card-subtitle">
            Status of your official WhatsApp, Instagram, and Facebook connections.
          </p>
        </div>

        <div className="agent-badge-icon">
          <Network size={18} color="var(--bright-olive)" />
        </div>
      </div>

      {/* 3 Channel Rows */}
      <div className="channel-health-list">
        {channels.map((ch) => (
          <div key={ch.id} className="channel-health-row">
            <div className="channel-health-left">
              <div className="channel-identity-line">
                <Badge variant={ch.badge}>{ch.name}</Badge>
                <div className="channel-status-tag">
                  <span className={`status-dot ${ch.connected ? 'active' : ''}`}></span>
                  <span className="channel-conn-status">
                    {ch.connected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              </div>
              <div className="channel-telemetry-meta">
                <span className="channel-account-handle">{ch.account || 'Standby Endpoint'}</span>
                <span className="dot-divider">•</span>
                <span className="channel-msg-count">{ch.messagesToday} messages today</span>
              </div>
            </div>

            <div className="channel-health-right">
              <button
                type="button"
                className="btn-channel-inspect"
                onClick={onManageChannels}
              >
                {ch.connected ? 'View' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="channel-health-bottom-action">
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-center"
          onClick={onManageChannels}
          icon={Network}
        >
          Connect Official Meta Channels
        </Button>
      </div>
    </div>
  );
}
