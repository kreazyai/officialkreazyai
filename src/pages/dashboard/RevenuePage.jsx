import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Download,
  CreditCard,
  ArrowUpRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Wallet
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export function RevenuePage({ user }) {
  const isDemo = Boolean(user?.isDemo);
  const [timeframe, setTimeframe] = useState('30d');

  // Multiplier for timeframes
  const mult = timeframe === '7d' ? 0.25 : timeframe === '90d' ? 2.8 : 1;

  const grossSales = isDemo ? (48920 * mult).toFixed(2) : '0.00';
  const aov = isDemo ? '78.50' : '0.00';
  const conversionRate = isDemo ? '24.8%' : '0.0%';
  const nextPayout = isDemo ? (12450 * mult).toFixed(2) : '0.00';

  const channels = isDemo ? [
    {
      name: 'WhatsApp Cloud API',
      revenue: (26410 * mult).toFixed(2),
      orders: Math.round(670 * mult),
      share: 54,
      badge: 'whatsapp'
    },
    {
      name: 'Instagram Direct',
      revenue: (16130 * mult).toFixed(2),
      orders: Math.round(412 * mult),
      share: 33,
      badge: 'instagram'
    },
    {
      name: 'Facebook Messenger',
      revenue: (6380 * mult).toFixed(2),
      orders: Math.round(158 * mult),
      share: 13,
      badge: 'facebook'
    }
  ] : [
    { name: 'WhatsApp Cloud API', revenue: '0.00', orders: 0, share: 0, badge: 'whatsapp' },
    { name: 'Instagram Direct', revenue: '0.00', orders: 0, share: 0, badge: 'instagram' },
    { name: 'Facebook Messenger', revenue: '0.00', orders: 0, share: 0, badge: 'facebook' }
  ];

  const handleExport = () => {
    alert(`Exporting revenue & financial report (${timeframe}) to CSV...`);
  };

  return (
    <div className="dashboard-content">
      {/* Header — matching reference title & capsule filter controls */}
      <div className="page-title-row" style={{ marginBottom: '1.75rem', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Revenue & Commercials
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Financial telemetry, gross merchandise value, and payouts across social channels.
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

      {/* 4 Financial KPI Cards — styled with reference glass theme */}
      <div className="analytics-kpi-grid">
        {/* Gross Sales */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Gross Revenue
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(189, 213, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-lime)' }}>
              <DollarSign size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            ${grossSales}
          </div>
          <div style={{ fontSize: '0.78rem', color: isDemo ? 'var(--color-accent-lime)' : 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>
            {isDemo ? <><TrendingUp size={13} /> +18.4% vs last period</> : 'Awaiting first order'}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg. Order Value
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(189, 213, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-lime)' }}>
              <ShoppingBag size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            ${aov}
          </div>
          <div style={{ fontSize: '0.78rem', color: isDemo ? 'var(--color-accent-lime)' : 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isDemo ? 'Average cart basket size' : 'Calculated automatically'}
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Inquiry to Sale
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(189, 213, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-lime)' }}>
              <Sparkles size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            {conversionRate}
          </div>
          <div style={{ fontSize: '0.78rem', color: isDemo ? 'var(--color-accent-lime)' : 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isDemo ? 'Autonomous checkout rate' : 'Ready for live traffic'}
          </div>
        </div>

        {/* Next Payout */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Est. Next Payout
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(189, 213, 148, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-lime)' }}>
              <Wallet size={17} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            ${nextPayout}
          </div>
          <div style={{ fontSize: '0.78rem', color: isDemo ? 'var(--text-secondary)' : 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isDemo ? 'Scheduled in 3 business days' : 'Weekly bank transfer'}
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue by Channel & Settlement Ledger */}
      <div className="analytics-breakdown-grid" style={{ marginTop: '1.5rem' }}>
        
        {/* Section 1: Revenue by Social Channel */}
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.35rem 1.75rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(214, 229, 215, 0.04)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Revenue by Channel
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Gross sales converted directly through customer conversations.
            </p>
          </div>

          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            {channels.map(ch => (
              <div key={ch.name} className="card-nested" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Badge variant={ch.badge}>{ch.name}</Badge>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums' }}>
                      {ch.orders} orders
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-accent-lime)', fontVariantNumeric: 'tabular-nums' }}>${ch.revenue}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.775rem', marginLeft: '6px', fontVariantNumeric: 'tabular-nums' }}>({ch.share}%)</span>
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

        {/* Section 2: Settlement & Financial Ledger */}
        <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '1.35rem 1.75rem', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(214, 229, 215, 0.04)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Settlement & Net Ledger
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              Reconciliation breakdown for current billing cycle.
            </p>
          </div>

          <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
            <div className="card-nested" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gross Converted GMV</span>
              <strong style={{ color: 'var(--text-primary)', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>${grossSales}</strong>
            </div>

            <div className="card-nested" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gateway Processing (2.9%)</span>
              <span style={{ color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {isDemo ? `-$${(grossSales * 0.029).toFixed(2)}` : '$0.00'}
              </span>
            </div>

            <div className="card-nested" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>KreazyAI Platform Fee (0%)</span>
              <span style={{ color: 'var(--color-accent-lime)', fontWeight: 600 }}>$0.00 (Included in Plan)</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.1rem 1.35rem',
              background: 'rgba(189, 213, 148, 0.12)',
              border: '1px solid rgba(189, 213, 148, 0.28)',
              borderRadius: 'var(--radius-lg)',
              marginTop: '0.25rem',
            }}>
              <div>
                <strong style={{ color: 'var(--color-accent-lime)', fontSize: '0.95rem' }}>Estimated Net Payout</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Direct Deposit to Primary Account</div>
              </div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent-lime)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                ${isDemo ? (grossSales * 0.971).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
