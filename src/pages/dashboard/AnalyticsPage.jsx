import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  MessageSquare, 
  ShoppingBag, 
  Bot, 
  Users,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30d'); // 7d | 30d | 90d
  const [channelFilter, setChannelFilter] = useState('all');

  // Channel revenue breakdown
  const channelData = [
    { channel: 'WhatsApp Cloud API', revenue: '$26,410.00', orders: 670, share: '54%', badge: 'whatsapp' },
    { channel: 'Instagram Direct', revenue: '$16,130.00', orders: 412, share: '33%', badge: 'instagram' },
    { channel: 'Facebook Messenger', revenue: '$6,380.00', orders: 158, share: '13%', badge: 'facebook' }
  ];

  const handleExportCSV = () => {
    alert("Exporting analytics telemetry to CSV (orders_and_conversations_telemetry.csv)...");
  };

  return (
    <div className="dashboard-content">
      <div className="page-title-row">
        <div>
          <h2>Analytics & Commercial Performance</h2>
          <p style={{ fontSize: '0.9rem' }}>Comprehensive metrics on automated revenue, conversational conversion, and team time saved.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--bg-subtle)', padding: '2px', borderRadius: 'var(--radius-md)' }}>
            {['7d', '30d', '90d'].map(t => (
              <button
                key={t}
                type="button"
                className={`btn btn-sm ${timeframe === t ? 'btn-primary' : 'btn-ghost'}`}
                style={{ height: '30px', padding: '0 0.65rem', fontSize: '0.75rem' }}
                onClick={() => setTimeframe(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" onClick={handleExportCSV} icon={Download}>
            Export Telemetry
          </Button>
        </div>
      </div>

      {/* Top Telemetry KPI Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-header">Automated Revenue</span>
          <span className="metric-val">$48,920.00</span>
          <span className="metric-sub metric-growth-pos"><TrendingUp size={14} /> +18.4% this period</span>
        </div>

        <div className="metric-card">
          <span className="metric-header">Autonomous Resolution</span>
          <span className="metric-val">92.4%</span>
          <span className="metric-sub" style={{ color: 'var(--olive-700)', fontWeight: 600 }}>4,518 resolved with zero human touch</span>
        </div>

        <div className="metric-card">
          <span className="metric-header">Human Handoff Escalations</span>
          <span className="metric-val">7.6%</span>
          <span className="metric-sub" style={{ color: 'var(--text-muted)' }}>372 conversations escalated</span>
        </div>

        <div className="metric-card">
          <span className="metric-header">Hours of Staff Time Saved</span>
          <span className="metric-val">284 hrs</span>
          <span className="metric-sub metric-growth-pos">Equivalent to 1.8 full-time reps</span>
        </div>
      </div>

      {/* Visual Revenue Bars by Channel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        
        {/* Channel Revenue Comparison */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Revenue Breakdown by Channel</h3>
          <p style={{ fontSize: '0.825rem', marginBottom: '1.5rem' }}>Comparison of gross converted sales across social commerce endpoints.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {channelData.map(ch => (
              <div key={ch.channel}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant={ch.badge}>{ch.channel}</Badge>
                    <span style={{ fontWeight: 600 }}>{ch.orders} orders</span>
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--olive-950)' }}>{ch.revenue}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>({ch.share})</span>
                  </div>
                </div>

                {/* Clean CSS Bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: ch.share, 
                      height: '100%', 
                      backgroundColor: ch.badge === 'whatsapp' ? 'var(--olive-700)' : ch.badge === 'instagram' ? 'var(--olive-500)' : 'var(--olive-400)',
                      borderRadius: '4px'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Conversational Funnel Efficiency</h3>
          <p style={{ fontSize: '0.825rem', marginBottom: '1.25rem' }}>Conversion progression from initial DM to verified payment.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span>1. Total Inquiries Initiated</span>
              <strong>4,890 threads (100%)</strong>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span>2. Product Sizing / Catalog Views</span>
              <strong>3,410 interactions (69.7%)</strong>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span>3. Checkout Links Generated</span>
              <strong>1,580 links (32.3%)</strong>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--olive-50)', border: '1px solid var(--olive-100)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', color: 'var(--olive-950)' }}>
              <strong>4. Confirmed & Paid Orders</strong>
              <strong>1,240 orders (25.3% final conv.)</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
