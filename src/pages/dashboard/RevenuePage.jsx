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
      {/* Header — matching Settings layout */}
      <div className="page-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Revenue & Commercials</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Financial telemetry, gross merchandise value, and payouts across social channels.
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

      {/* 4 Financial KPI Cards — styled with Settings theme */}
      <div className="analytics-kpi-grid">
        {/* Gross Sales */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Gross Revenue
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            ${grossSales}
          </div>
          <div style={{ fontSize: '0.775rem', color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isDemo ? <><TrendingUp size={13} /> +18.4% vs last period</> : 'Awaiting first order'}
          </div>
        </div>

        {/* Average Order Value */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg. Order Value
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
              <ShoppingBag size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            ${aov}
          </div>
          <div style={{ fontSize: '0.775rem', color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)', marginTop: '0.4rem' }}>
            {isDemo ? 'Average cart basket size' : 'Calculated automatically'}
          </div>
        </div>

        {/* Conversion Rate */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Inquiry to Sale
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            {conversionRate}
          </div>
          <div style={{ fontSize: '0.775rem', color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)', marginTop: '0.4rem' }}>
            {isDemo ? 'Autonomous checkout rate' : 'Ready for live traffic'}
          </div>
        </div>

        {/* Next Payout */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Est. Next Payout
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
              <Wallet size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            ${nextPayout}
          </div>
          <div style={{ fontSize: '0.775rem', color: isDemo ? 'var(--text-secondary)' : 'var(--text-muted)', marginTop: '0.4rem' }}>
            {isDemo ? 'Scheduled in 3 business days' : 'Weekly bank transfer'}
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue by Channel & Settlement Ledger */}
      <div className="analytics-breakdown-grid">
        
        {/* Section 1: Revenue by Social Channel (Settings-card styled) */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Revenue by Channel
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Gross sales converted directly through customer conversations.
            </p>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {channels.map(ch => (
              <div key={ch.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant={ch.badge}>{ch.name}</Badge>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{ch.orders} orders</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--bright-olive)' }}>${ch.revenue}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem', marginLeft: '6px' }}>({ch.share}%)</span>
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

        {/* Section 2: Settlement & Financial Ledger (Settings-card styled) */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Settlement & Net Ledger
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Reconciliation breakdown for current billing cycle.
            </p>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-canvas-alt)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gross Converted GMV</span>
              <strong style={{ color: 'var(--text-primary)' }}>${grossSales}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-canvas-alt)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gateway Processing (2.9%)</span>
              <span style={{ color: 'var(--text-muted)' }}>
                {isDemo ? `-$${(grossSales * 0.029).toFixed(2)}` : '$0.00'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-canvas-alt)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>KreazyAI Platform Fee (0%)</span>
              <span style={{ color: 'var(--bright-olive)', fontWeight: 600 }}>$0.00 (Included in Plan)</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem 1rem',
              background: 'rgba(143, 166, 83, 0.1)',
              border: '1px solid rgba(143, 166, 83, 0.25)',
              borderRadius: '8px'
            }}>
              <div>
                <strong style={{ color: 'var(--bright-olive)' }}>Estimated Net Payout</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct Deposit to Primary Account</div>
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bright-olive)' }}>
                ${isDemo ? (grossSales * 0.971).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
