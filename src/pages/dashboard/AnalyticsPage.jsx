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
      {/* Header — matching reference title & capsule filter controls */}
      <div className="page-title-row" style={{ marginBottom: '1.75rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Analytics & Intelligence
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Real-time conversational volume, autonomous resolution rates, and response speed.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="capsule-filter-group" style={{ margin: 0 }}>
            {['7d', '30d', '90d'].map(t => (
              <button
                key={t}
                type="button"
                className={`capsule-filter-btn ${timeframe === t ? 'active' : ''}`}
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

      {/* 4 Conversational Intelligence KPI Cards — styled with reference glass theme */}
      <div className="analytics-kpi-grid">
        {/* Total Conversations */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Conversations
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(189, 213, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-lime)' }}>
              <MessageSquare size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {totalConversations}
          </div>
          <div style={{ fontSize: '0.78rem', color: isDemo ? 'var(--color-accent-lime)' : 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>
            {isDemo ? <><TrendingUp size={13} /> +14.2% inbound volume</> : 'Awaiting first message'}
          </div>
        </div>

        {/* Autonomous Resolution Rate */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              AI Resolution
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(189, 213, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-lime)' }}>
              <Bot size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {resolvedAuto}
          </div>
          <div style={{ fontSize: '0.78rem', color: isDemo ? 'var(--color-accent-lime)' : 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isDemo ? 'Resolved with zero human touch' : 'AI Copilot standby'}
          </div>
        </div>

        {/* Average AI Response Speed */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg. Response Time
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(189, 213, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-lime)' }}>
              <Zap size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {avgResponseTime}
          </div>
          <div style={{ fontSize: '0.78rem', color: isDemo ? 'var(--color-accent-lime)' : 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isDemo ? 'Instant autonomous replies' : 'Sub-second webhook response'}
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CSAT Rating
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(189, 213, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-lime)' }}>
              <Smile size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {satisfactionRate}
          </div>
          <div style={{ fontSize: '0.78rem', color: isDemo ? 'var(--color-accent-lime)' : 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isDemo ? 'Positive customer sentiment' : 'Based on sentiment analysis'}
          </div>
        </div>
      </div>

      {/* Main Grid: Channel Activity & AI Resolution Breakdown */}
      <div className="analytics-breakdown-grid" style={{ marginTop: '1.5rem' }}>
        
        {/* Section 1: Inbound Volume by Channel */}
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.35rem 1.75rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(214, 229, 215, 0.04)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Inbound Traffic by Channel
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Message distribution and customer threads across Meta platforms.
            </p>
          </div>

          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            {channels.map(ch => (
              <div key={ch.name} className="card-nested" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Badge variant={ch.badge}>{ch.name}</Badge>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>
                      {ch.threads} threads
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-accent-lime)', fontVariantNumeric: 'tabular-nums' }}>{ch.share}%</strong>
                  </div>
                </div>

                {/* Capsule progress bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(214, 229, 215, 0.1)', borderRadius: 'var(--radius-capsule)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${ch.share}%`,
                      height: '100%',
                      backgroundColor: 'var(--color-accent-lime)',
                      borderRadius: 'var(--radius-capsule)',
                      transition: 'width 0.5s ease',
                      boxShadow: '0 0 10px rgba(189, 213, 148, 0.4)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AI Automation Breakdown */}
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.35rem 1.75rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(214, 229, 215, 0.04)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Autonomous Capability Breakdown
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              How customer inquiries are classified and handled by AI Copilot.
            </p>
          </div>

          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div className="card-nested" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Product & Catalog Questions</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Pricing, sizing, availability</div>
              </div>
              <strong style={{ color: 'var(--color-accent-lime)', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>{isDemo ? '58.2%' : '0%'}</strong>
            </div>

            <div className="card-nested" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Order Status & Tracking</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Courier updates, delivery ETA</div>
              </div>
              <strong style={{ color: 'var(--color-accent-lime)', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>{isDemo ? '24.6%' : '0%'}</strong>
            </div>

            <div className="card-nested" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Automated Checkout Links</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Direct pay in chat</div>
              </div>
              <strong style={{ color: 'var(--color-accent-lime)', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>{isDemo ? '12.0%' : '0%'}</strong>
            </div>

            <div className="card-nested" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Human Escalations</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Complex edge-cases passed to staff</div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>{isDemo ? '5.2%' : '0%'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
