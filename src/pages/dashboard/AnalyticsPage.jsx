import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Clock,
  Zap,
  CheckCircle2,
  TrendingUp,
  Download,
  Users,
  Smile,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export function AnalyticsPage({ user }) {
  const isDemo = Boolean(user?.isDemo);
  const [timeframe, setTimeframe] = useState('30d');

  const mult = timeframe === '7d' ? 0.25 : timeframe === '90d' ? 2.8 : 1;

  const totalConversations = isDemo ? Math.round(4890 * mult).toLocaleString() : '0';
  const resolvedAuto = isDemo ? '94.8%' : '100%';
  const avgResponseTime = isDemo ? '1.2s' : '< 2s';
  const satisfactionRate = isDemo ? '98.4%' : 'N/A';

  const channels = isDemo ? [
    { name: 'WhatsApp Cloud API', threads: Math.round(2740 * mult), share: 56, badge: 'whatsapp' },
    { name: 'Instagram Direct', threads: Math.round(1560 * mult), share: 32, badge: 'instagram' },
    { name: 'Facebook Messenger', threads: Math.round(590 * mult), share: 12, badge: 'facebook' }
  ] : [
    { name: 'WhatsApp Cloud API', threads: 0, share: 0, badge: 'whatsapp' },
    { name: 'Instagram Direct', threads: 0, share: 0, badge: 'instagram' },
    { name: 'Facebook Messenger', threads: 0, share: 0, badge: 'facebook' }
  ];

  const handleExport = () => {
    alert(`Exporting conversation telemetry report (${timeframe}) to CSV...`);
  };

  return (
    <div className="dashboard-content">
      {/* Header — matching Settings layout */}
      <div className="page-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Analytics & Intelligence</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time conversational volume, autonomous resolution rates, and response speed.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            display: 'flex',
            gap: '2px',
            backgroundColor: 'var(--bg-canvas-alt)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            {['7d', '30d', '90d'].map(t => (
              <button
                key={t}
                type="button"
                className={`btn btn-sm ${timeframe === t ? 'btn-primary' : 'btn-ghost'}`}
                style={{ height: '30px', padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}
                onClick={() => setTimeframe(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={handleExport} icon={Download}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* 4 Conversational Intelligence KPI Cards — styled with Settings theme */}
      <div className="analytics-kpi-grid">
        {/* Total Conversations */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Conversations
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
              <MessageSquare size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {totalConversations}
          </div>
          <div style={{ fontSize: '0.775rem', color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isDemo ? <><TrendingUp size={13} /> +14.2% inbound volume</> : 'Awaiting first message'}
          </div>
        </div>

        {/* Autonomous Resolution Rate */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI Resolution
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
              <Bot size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {resolvedAuto}
          </div>
          <div style={{ fontSize: '0.775rem', color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)', marginTop: '0.4rem' }}>
            {isDemo ? 'Resolved with zero human touch' : 'AI Copilot standby'}
          </div>
        </div>

        {/* Average AI Response Speed */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg. Response Time
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
              <Zap size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {avgResponseTime}
          </div>
          <div style={{ fontSize: '0.775rem', color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)', marginTop: '0.4rem' }}>
            {isDemo ? 'Instant autonomous replies' : 'Sub-second webhook response'}
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CSAT Rating
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
              <Smile size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {satisfactionRate}
          </div>
          <div style={{ fontSize: '0.775rem', color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)', marginTop: '0.4rem' }}>
            {isDemo ? 'Positive customer sentiment' : 'Based on sentiment analysis'}
          </div>
        </div>
      </div>

      {/* Main Grid: Channel Activity & AI Resolution Breakdown */}
      <div className="analytics-breakdown-grid">
        
        {/* Section 1: Inbound Volume by Channel (Settings-card styled) */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Inbound Traffic by Channel
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Message distribution and customer threads across Meta platforms.
            </p>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {channels.map(ch => (
              <div key={ch.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant={ch.badge}>{ch.name}</Badge>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ch.threads} threads</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--bright-olive)' }}>{ch.share}%</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-canvas-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${ch.share}%`,
                      height: '100%',
                      backgroundColor: 'var(--bright-olive)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AI Automation Breakdown (Settings-card styled) */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Autonomous Capability Breakdown
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              How customer inquiries are classified and handled by AI Copilot.
            </p>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-canvas-alt)', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Product & Catalog Questions</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pricing, sizing, availability</div>
              </div>
              <strong style={{ color: 'var(--bright-olive)' }}>{isDemo ? '58.2%' : '0%'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-canvas-alt)', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Order Status & Tracking</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Courier updates, delivery ETA</div>
              </div>
              <strong style={{ color: 'var(--bright-olive)' }}>{isDemo ? '24.6%' : '0%'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-canvas-alt)', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Automated Checkout Links</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct pay in chat</div>
              </div>
              <strong style={{ color: 'var(--bright-olive)' }}>{isDemo ? '12.0%' : '0%'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-canvas-alt)', borderRadius: '8px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Human Escalations</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complex edge-cases passed to staff</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{isDemo ? '5.2%' : '0%'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
