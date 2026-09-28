import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  MessageSquare, 
  Bot, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Boxes, 
  Network,
  Zap,
  Sparkles
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { initialAiActivityTimeline } from '../../services/mockData';

export function DashboardOverview({ onNavigateModule }) {
  return (
    <div className="dashboard-content">
      {/* Page Title & Quick Actions */}
      <div className="page-title-row">
        <div>
          <h2>Store Overview & Automation</h2>
          <p style={{ fontSize: '0.9rem' }}>Real-time telemetry across connected Meta channels, AI agents, and order volume.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={() => onNavigateModule('ai-assistant')} icon={Bot}>
            Configure AI Agent
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigateModule('messages')} icon={MessageSquare}>
            Open Live Inbox (3)
          </Button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Automated Revenue</span>
            <TrendingUp size={16} color="var(--olive-700)" />
          </div>
          <div className="metric-val">$48,920.00</div>
          <div className="metric-sub metric-growth-pos">
            <TrendingUp size={14} /> +18.4% vs previous 30 days
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Conversations Handled</span>
            <MessageSquare size={16} color="var(--olive-700)" />
          </div>
          <div className="metric-val">4,890</div>
          <div className="metric-sub" style={{ color: 'var(--olive-700)', fontWeight: 600 }}>
            92.4% resolved autonomously
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Orders via Social</span>
            <ShoppingBag size={16} color="var(--olive-700)" />
          </div>
          <div className="metric-val">1,240</div>
          <div className="metric-sub metric-growth-pos">
            <TrendingUp size={14} /> $39.45 avg. order value
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Avg Response Speed</span>
            <Zap size={16} color="var(--olive-700)" />
          </div>
          <div className="metric-val">2.4 sec</div>
          <div className="metric-sub" style={{ color: 'var(--text-muted)' }}>
            24/7 instantaneous answering
          </div>
        </div>
      </div>

      {/* Two Column Section: Live Activity Feed & Channel Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        
        {/* Left: AI Autonomous Activity Timeline */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Live AI Agent Activity Timeline</h3>
              <p style={{ fontSize: '0.825rem' }}>Real-time audit log of decisions made by KreazyAI across your channels.</p>
            </div>
            <Badge variant="olive">
              <span className="status-dot active"></span> Live Feed
            </Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {initialAiActivityTimeline.map((act) => (
              <div 
                key={act.id} 
                style={{
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Badge variant={act.channel === 'whatsapp' ? 'whatsapp' : act.channel === 'instagram' ? 'instagram' : act.channel === 'facebook' ? 'facebook' : 'olive'}>
                    {act.channel.toUpperCase()}
                  </Badge>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--olive-950)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {act.description}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {act.time}
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button" 
            className="btn btn-sm btn-ghost" 
            onClick={() => onNavigateModule('messages')}
            style={{ width: '100%', marginTop: '1rem', color: 'var(--olive-800)' }}
          >
            View All Live Threads <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Right: Channel Breakdown & Health */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Channel Ingestion & Health</h3>
          <p style={{ fontSize: '0.825rem', marginBottom: '1.25rem' }}>Status of connected official Meta webhooks.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant="whatsapp">WhatsApp</Badge>
                  <strong style={{ fontSize: '0.875rem' }}>+1 (555) 839-2041</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  342 messages today • 94% autonomous
                </div>
              </div>
              <span className="status-dot active" title="Active"></span>
            </div>

            <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant="instagram">Instagram</Badge>
                  <strong style={{ fontSize: '0.875rem' }}>@kreazy_retail</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  218 messages today • 91% autonomous
                </div>
              </div>
              <span className="status-dot active" title="Active"></span>
            </div>

            <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant="facebook">Facebook</Badge>
                  <strong style={{ fontSize: '0.875rem' }}>Kreazy Brand Page</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  89 messages today • 89% autonomous
                </div>
              </div>
              <span className="status-dot active" title="Active"></span>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Need to add a channel?</span>
            <Button variant="subtle" size="sm" onClick={() => onNavigateModule('integrations')}>
              Manage Connections
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
