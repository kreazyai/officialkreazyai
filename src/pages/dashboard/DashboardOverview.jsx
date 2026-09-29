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
  Sparkles,
  PlusCircle,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { initialAiActivityTimeline } from '../../services/mockData';

export function DashboardOverview({ user, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);

  return (
    <div className="dashboard-content">
      {/* Demo Mode Notice Banner if viewing demo */}
      {isDemo && (
        <div style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(163, 230, 53, 0.08)',
          border: '1px solid rgba(163, 230, 53, 0.25)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Sparkles size={16} color="var(--bright-olive)" />
            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              <strong>Demo Studio Mode:</strong> You are exploring simulated sales and active customer activity. Real sign-ups start with a clean, empty workspace.
            </span>
          </div>
          <Badge variant="olive">Interactive Preview</Badge>
        </div>
      )}

      {/* Page Title & Quick Actions */}
      <div className="page-title-row">
        <div>
          <h2>Store Overview & Automation</h2>
          <p style={{ fontSize: '0.9rem' }}>
            {isDemo 
              ? 'Real-time telemetry across connected Meta channels, AI agents, and order volume.'
              : 'Real-time telemetry across your merchant workspace, connected channels, and AI agents.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={() => onNavigateModule('ai-assistant')} icon={Bot}>
            Configure AI Agent
          </Button>
          <Button variant="primary" size="sm" onClick={() => onNavigateModule('messages')} icon={MessageSquare}>
            {isDemo ? 'Open Live Inbox (3)' : 'Open Live Inbox (0)'}
          </Button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Automated Revenue</span>
            <TrendingUp size={16} color="var(--bright-olive)" />
          </div>
          <div className="metric-val">{isDemo ? '$48,920.00' : '$0.00'}</div>
          <div className="metric-sub" style={{ color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)' }}>
            {isDemo ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} /> +18.4% vs previous 30 days
              </span>
            ) : (
              'Awaiting first automated order'
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Conversations Handled</span>
            <MessageSquare size={16} color="var(--bright-olive)" />
          </div>
          <div className="metric-val">{isDemo ? '4,890' : '0'}</div>
          <div className="metric-sub" style={{ color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)' }}>
            {isDemo ? '92.4% resolved autonomously' : '0 active customer conversations'}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Orders via Social</span>
            <ShoppingBag size={16} color="var(--bright-olive)" />
          </div>
          <div className="metric-val">{isDemo ? '1,240' : '0'}</div>
          <div className="metric-sub" style={{ color: isDemo ? 'var(--bright-olive)' : 'var(--text-muted)' }}>
            {isDemo ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} /> $39.45 avg. order value
              </span>
            ) : (
              'No social orders recorded yet'
            )}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Avg Response Speed</span>
            <Zap size={16} color="var(--bright-olive)" />
          </div>
          <div className="metric-val">{isDemo ? '2.4 sec' : 'Ready'}</div>
          <div className="metric-sub" style={{ color: 'var(--text-muted)' }}>
            {isDemo ? '24/7 instantaneous answering' : 'Standby for incoming messages'}
          </div>
        </div>
      </div>

      {/* Two Column Section: Live Activity Feed & Channel Breakdown */}
      <div className="dashboard-split-grid">
        
        {/* Left: AI Autonomous Activity Timeline */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Live AI Agent Activity Timeline</h3>
              <p style={{ fontSize: '0.825rem' }}>
                {isDemo 
                  ? 'Real-time audit log of decisions made by KreazyAI across your channels.'
                  : 'Live audit log of autonomous decisions, inquiries, and customer orders.'}
              </p>
            </div>
            <Badge variant={isDemo ? 'olive' : 'subtle'}>
              <span className={`status-dot ${isDemo ? 'active' : ''}`}></span> {isDemo ? 'Live Feed' : 'Standby'}
            </Badge>
          </div>

          {isDemo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {initialAiActivityTimeline.map((act) => (
                <div 
                  key={act.id} 
                  style={{
                    padding: '0.85rem 1rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-canvas-alt)',
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
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
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

              <button 
                type="button" 
                className="btn btn-sm btn-ghost" 
                onClick={() => onNavigateModule('messages')}
                style={{ width: '100%', marginTop: '1rem', color: 'var(--bright-olive)' }}
              >
                View All Live Threads <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
            /* Clean Empty State for New Users */
            <div style={{
              padding: '2.5rem 1.5rem',
              border: '1px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-canvas-alt)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '280px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(143, 166, 83, 0.15)',
                color: 'var(--bright-olive)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Sparkles size={24} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                No customer activity recorded yet
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Your AI sales agent is standing by. Once you connect your channels and publish products, real-time customer chats, autonomous payments, and order logs will stream here.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button variant="primary" size="sm" onClick={() => onNavigateModule('integrations')} icon={Network}>
                  1. Connect Channels
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onNavigateModule('products')} icon={Boxes}>
                  2. Add Products
                </Button>
                <Button variant="subtle" size="sm" onClick={() => onNavigateModule('ai-assistant')} icon={Bot}>
                  3. Configure AI
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Channel Breakdown & Health */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>Channel Ingestion & Health</h3>
          <p style={{ fontSize: '0.825rem', marginBottom: '1.25rem' }}>
            {isDemo 
              ? 'Status of connected official Meta webhooks.' 
              : 'Status of your official WhatsApp, Instagram, and Facebook connections.'}
          </p>

          {isDemo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
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

              <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
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

              <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
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

              <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Need to add a channel?</span>
                <Button variant="subtle" size="sm" onClick={() => onNavigateModule('integrations')}>
                  Manage Connections
                </Button>
              </div>
            </div>
          ) : (
            /* Clean Empty Channels for New Users */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant="whatsapp">WhatsApp</Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not connected</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    0 messages today
                  </div>
                </div>
                <Button variant="secondary" size="xs" onClick={() => onNavigateModule('integrations')}>
                  Connect
                </Button>
              </div>

              <div style={{ padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant="instagram">Instagram</Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not connected</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    0 messages today
                  </div>
                </div>
                <Button variant="secondary" size="xs" onClick={() => onNavigateModule('integrations')}>
                  Connect
                </Button>
              </div>

              <div style={{ padding: '0.85rem 1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant="facebook">Facebook</Badge>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Not connected</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    0 messages today
                  </div>
                </div>
                <Button variant="secondary" size="xs" onClick={() => onNavigateModule('integrations')}>
                  Connect
                </Button>
              </div>

              <div style={{ marginTop: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                <Button 
                  variant="primary" 
                  size="sm" 
                  style={{ width: '100%', justifyContent: 'center' }} 
                  onClick={() => onNavigateModule('integrations')}
                  icon={Network}
                >
                  Connect Official Meta Channels
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
