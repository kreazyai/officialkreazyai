import React, { useState } from 'react';
import { 
  Bot, 
  MessageSquare, 
  ShoppingBag, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  ArrowUpRight, 
  ShieldAlert, 
  Send,
  Zap,
  Activity
} from 'lucide-react';
import { Badge } from '../common/Badge';

export function HeroDashboardPreview({ onExploreApp }) {
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' | 'overview' | 'orders' | 'ai-studio'
  
  return (
    <div className="hero-interface-wrapper">
      {/* Top Browser Bar */}
      <div className="mockup-topbar">
        <div className="mockup-dots">
          <span className="mockup-dot" style={{ backgroundColor: '#ff5f56' }}></span>
          <span className="mockup-dot" style={{ backgroundColor: '#ffbd2e' }}></span>
          <span className="mockup-dot" style={{ backgroundColor: '#27c93f' }}></span>
        </div>

        <div className="mockup-url-bar">
          <span>https://app.kreazy.ai/workspace/kreazy-flagship</span>
        </div>

        <div className="mockup-status">
          <span className="status-dot active"></span>
          <span>AI Engine: Autonomous 24/7</span>
        </div>
      </div>

      {/* Internal Navigation Sub-header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0.65rem 1.25rem', 
        backgroundColor: '#fafbf9', 
        borderBottom: '1px solid var(--border-medium)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div className="hero-mockup-tabs-bar" style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
          <button 
            type="button"
            onClick={() => setActiveTab('conversations')}
            className={`btn btn-sm ${activeTab === 'conversations' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <MessageSquare size={14} />
            <span>Live Customer Chats</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <TrendingUp size={14} />
            <span>Metrics & Revenue</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShoppingBag size={14} />
            <span>Autonomous Orders</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="olive" icon={Sparkles}>
            Meta WhatsApp & Instagram Connected
          </Badge>
          <button 
            type="button" 
            onClick={onExploreApp}
            className="btn btn-sm btn-subtle" 
            style={{ fontSize: '0.78rem' }}
          >
            Launch Full Studio <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* Main Tab View Canvas */}
      <div style={{ minHeight: '440px', backgroundColor: '#ffffff', padding: '1.25rem' }}>
        {/* TAB 1: LIVE CHATS */}
        {activeTab === 'conversations' && (
          <div className="mockup-chat-grid">
            {/* Conversation list */}
            <div className="mockup-chat-list" style={{ borderRight: '1px solid var(--border-medium)', backgroundColor: '#fafbf9', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.85rem', color: 'var(--olive-900)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Active Threads</span>
                <span className="badge badge-olive">3 Active</span>
              </div>
              
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--olive-50)', borderLeft: '3px solid var(--olive-700)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Marcus Vance</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Just now</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                  <Badge variant="whatsapp">WhatsApp</Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--status-success-text)', fontWeight: 600 }}>• Order Confirmed</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  AI: Order #KZ-1049 is confirmed. Tracking...
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Elena Rostova</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14m ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                  <Badge variant="instagram">Instagram</Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--olive-700)' }}>• Product Inquiry</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Customer: Is the Matte Moss finish in stock?
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Julian Bennett</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1h ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                  <Badge variant="facebook">Facebook</Badge>
                  <span style={{ fontSize: '0.75rem', color: '#b45309' }}>• Human Handoff</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Agent assigned to customer exchange request.
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--olive-950)' }}>Marcus Vance (+1 555-432-8812)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Channel: WhatsApp Business • Sizing Consultation & Instant Order</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-success">AI Autonomous Mode</span>
                </div>
              </div>

              <div style={{ flexGrow: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                {/* Customer Msg */}
                <div style={{ alignSelf: 'flex-start', maxWidth: '75%', backgroundColor: '#f5f6f3', padding: '0.65rem 0.85rem', borderRadius: '12px', borderBottomLeftRadius: '2px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer (WhatsApp)</div>
                  Hi! Does the Artisan Linen Overshirt fit true to size? I'm 6'1", 185 lbs.
                </div>

                {/* AI Msg */}
                <div style={{ alignSelf: 'flex-end', maxWidth: '80%', backgroundColor: 'var(--olive-850)', color: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '12px', borderBottomRightRadius: '2px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--olive-200)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Bot size={12} /> Kreazy AI Assistant • Verified Sizing Knowledge
                  </div>
                  Hello Marcus! For 6'1" and 185 lbs, Size L offers the intended relaxed European drape. Would you like me to reserve the Olive in Size L for you?
                </div>

                {/* Customer Msg */}
                <div style={{ alignSelf: 'flex-start', maxWidth: '75%', backgroundColor: '#f5f6f3', padding: '0.65rem 0.85rem', borderRadius: '12px', borderBottomLeftRadius: '2px', border: '1px solid var(--border-subtle)' }}>
                  Yes please! Can I pay directly here?
                </div>

                {/* AI Msg with order created card */}
                <div style={{ alignSelf: 'flex-end', maxWidth: '80%', backgroundColor: 'var(--olive-850)', color: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '12px', borderBottomRightRadius: '2px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--olive-200)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Bot size={12} /> Autonomous Checkout Generated
                  </div>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: '0.5rem', borderRadius: '8px', marginBottom: '6px', fontSize: '0.8rem' }}>
                    <strong>Order #KZ-1049 Confirmed</strong><br />
                    1x Artisan Linen Overshirt (Olive / L) • $89.00 • Paid via Stripe
                  </div>
                  Payment verified. Tracking details will update automatically!
                </div>
              </div>

              {/* Chat Input Simulated */}
              <div style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', backgroundColor: '#fafbf9' }}>
                <input 
                  type="text" 
                  readOnly 
                  value="AI is actively listening and handling this thread..." 
                  style={{ flexGrow: 1, padding: '0.45rem 0.75rem', fontSize: '0.825rem', border: '1px solid var(--border-medium)', borderRadius: '6px', backgroundColor: '#ffffff', color: 'var(--text-muted)' }} 
                />
                <button type="button" className="btn btn-sm btn-subtle" onClick={onExploreApp}>
                  Take Over Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="metric-card">
                <span className="metric-header">Monthly Revenue</span>
                <span className="metric-val">$48,920.00</span>
                <span className="metric-sub metric-growth-pos"><TrendingUp size={14} /> +18.4% from last month</span>
              </div>
              <div className="metric-card">
                <span className="metric-header">Autonomous Resolution</span>
                <span className="metric-val">92.4%</span>
                <span className="metric-sub" style={{ color: 'var(--olive-700)', fontWeight: 600 }}>4,518 / 4,890 messages</span>
              </div>
              <div className="metric-card">
                <span className="metric-header">Orders via Social</span>
                <span className="metric-val">1,240</span>
                <span className="metric-sub metric-growth-pos"><TrendingUp size={14} /> +12.1% conversion</span>
              </div>
              <div className="metric-card">
                <span className="metric-header">Avg First Response</span>
                <span className="metric-val">2.4 sec</span>
                <span className="metric-sub" style={{ color: 'var(--olive-700)', fontWeight: 600 }}><Zap size={14} /> 24/7 instantaneous</span>
              </div>
            </div>

            {/* Simulated Live Action Feed */}
            <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '1rem', backgroundColor: '#fafbf9' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--olive-900)' }}>
                Live Agentic Action Timeline
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant="whatsapp">WhatsApp</Badge>
                    <span><strong>AI Order Generated:</strong> Order #KZ-1049 for Marcus Vance ($89.00)</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>2 mins ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant="instagram">Instagram</Badge>
                    <span><strong>Knowledge Answered:</strong> Dishwasher tolerance answered for Minimalist Carafe</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>14 mins ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.825rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant="facebook">Facebook</Badge>
                    <span><strong>Safe Escalation:</strong> Customer requested exchange sizing nuance. Escalated to team.</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>48 mins ago</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Channel</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>AI Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mono" style={{ fontWeight: 700 }}>KZ-1049</td>
                  <td>Marcus Vance</td>
                  <td><Badge variant="whatsapp">WhatsApp</Badge></td>
                  <td>Artisan Linen Overshirt (L)</td>
                  <td style={{ fontWeight: 600 }}>$89.00</td>
                  <td><Badge variant="success">Confirmed</Badge></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--olive-700)' }}>Autonomous Payment & Stock Reserve</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontWeight: 700 }}>KZ-1048</td>
                  <td>Elena Rostova</td>
                  <td><Badge variant="instagram">Instagram</Badge></td>
                  <td>Minimalist Stoneware Carafe</td>
                  <td style={{ fontWeight: 600 }}>$128.00</td>
                  <td><Badge variant="warning">Processing</Badge></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--olive-700)' }}>Direct DM Checkout Link</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontWeight: 700 }}>KZ-1047</td>
                  <td>Tariq Mansoor</td>
                  <td><Badge variant="whatsapp">WhatsApp</Badge></td>
                  <td>Organic Botanical Perfume</td>
                  <td style={{ fontWeight: 600 }}>$110.00</td>
                  <td><Badge variant="info">Shipped</Badge></td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--olive-700)' }}>Courier Tracking Synced</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
