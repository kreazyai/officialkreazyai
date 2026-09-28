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
  Send,
  Zap
} from 'lucide-react';
import { Badge } from '../common/Badge';

export function HeroDashboardPreview({ onExploreApp }) {
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' | 'overview' | 'orders'
  
  return (
    <div className="hero-interface-wrapper">
      {/* Top Browser Bar */}
      <div className="mockup-topbar">
        <div className="mockup-dots">
          <span className="mockup-dot" style={{ backgroundColor: '#EF4444' }}></span>
          <span className="mockup-dot" style={{ backgroundColor: '#F59E0B' }}></span>
          <span className="mockup-dot" style={{ backgroundColor: '#10B981' }}></span>
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
        padding: '0.75rem 1.25rem', 
        backgroundColor: 'rgba(14, 22, 17, 0.95)', 
        borderBottom: '1px solid var(--border-medium)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div className="hero-mockup-tabs-bar" style={{ display: 'flex', gap: '0.5rem', width: 'auto' }}>
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
            Meta WhatsApp & Instagram Live
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
      <div style={{ minHeight: '440px', backgroundColor: 'rgba(11, 16, 13, 0.92)', padding: '1.25rem' }}>
        {/* TAB 1: LIVE CHATS */}
        {activeTab === 'conversations' && (
          <div className="mockup-chat-grid" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
            {/* Conversation list */}
            <div className="mockup-chat-list" style={{ borderRight: '1px solid var(--border-medium)', backgroundColor: 'rgba(14, 22, 17, 0.9)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Active Threads</span>
                <span className="badge badge-olive">3 Active</span>
              </div>
              
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(16, 185, 129, 0.12)', borderLeft: '3px solid var(--emerald-500)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F1F5F3' }}>Marcus Vance</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Just now</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                  <Badge variant="whatsapp">WhatsApp</Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>• Order Confirmed</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  AI: Order #KZ-1049 is confirmed. Tracking...
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F1F5F3' }}>Elena Rostova</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14m ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                  <Badge variant="instagram">Instagram</Badge>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>• Product Inquiry</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Customer: Is the Matte Moss finish in stock?
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F1F5F3' }}>Julian Bennett</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1h ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '4px' }}>
                  <Badge variant="facebook">Facebook</Badge>
                  <span style={{ fontSize: '0.75rem', color: '#F59E0B' }}>• Human Handoff</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  Agent assigned to customer exchange request.
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(11, 16, 13, 0.95)' }}>
              <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(14, 22, 17, 0.8)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F1F5F3' }}>Marcus Vance (+1 555-432-8812)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Channel: WhatsApp Business • Sizing Consultation & Instant Order</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-success">AI Autonomous Mode</span>
                </div>
              </div>

              <div style={{ flexGrow: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
                {/* Customer Msg */}
                <div style={{ alignSelf: 'flex-start', maxWidth: '75%', backgroundColor: 'rgba(22, 34, 27, 0.8)', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomLeftRadius: '2px', border: '1px solid var(--border-medium)', color: '#F1F5F3' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>Customer (WhatsApp)</div>
                  Hi! Does the Artisan Linen Overshirt fit true to size? I'm 6'1", 185 lbs.
                </div>

                {/* AI Msg */}
                <div style={{ alignSelf: 'flex-end', maxWidth: '80%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.28) 100%)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#F1F5F3', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomRightRadius: '2px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--emerald-300)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Bot size={12} /> Kreazy AI Assistant • Verified Sizing Knowledge
                  </div>
                  Hello Marcus! For 6'1" and 185 lbs, Size L offers the intended relaxed European drape. Would you like me to reserve the Olive in Size L for you?
                </div>

                {/* Customer Msg */}
                <div style={{ alignSelf: 'flex-start', maxWidth: '75%', backgroundColor: 'rgba(22, 34, 27, 0.8)', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomLeftRadius: '2px', border: '1px solid var(--border-medium)', color: '#F1F5F3' }}>
                  Yes please! Can I pay directly here?
                </div>

                {/* AI Msg with order created card */}
                <div style={{ alignSelf: 'flex-end', maxWidth: '80%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.28) 100%)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#F1F5F3', padding: '0.75rem 1rem', borderRadius: '12px', borderBottomRightRadius: '2px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--emerald-300)', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Bot size={12} /> Autonomous Checkout Generated
                  </div>
                  <div style={{ backgroundColor: 'rgba(7, 11, 8, 0.65)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.65rem', borderRadius: '8px', marginBottom: '8px', fontSize: '0.825rem' }}>
                    <strong style={{ color: 'var(--emerald-300)' }}>Order #KZ-1049 Confirmed</strong><br />
                    1x Artisan Linen Overshirt (Olive / L) • $89.00 • Paid via Stripe
                  </div>
                  Payment verified. Tracking details will update automatically!
                </div>
              </div>

              {/* Chat Input Simulated */}
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-medium)', display: 'flex', gap: '0.75rem', backgroundColor: 'rgba(14, 22, 17, 0.9)' }}>
                <input 
                  type="text" 
                  readOnly 
                  value="AI is actively listening and handling this thread..." 
                  style={{ flexGrow: 1, padding: '0.55rem 0.95rem', fontSize: '0.85rem', border: '1px solid var(--border-medium)', borderRadius: '8px', backgroundColor: 'rgba(18, 28, 22, 0.7)', color: 'var(--text-secondary)' }} 
                />
                <button type="button" className="btn btn-sm btn-primary" onClick={onExploreApp}>
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
                <span className="metric-sub" style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>4,518 / 4,890 messages</span>
              </div>
              <div className="metric-card">
                <span className="metric-header">Orders via Social</span>
                <span className="metric-val">1,240</span>
                <span className="metric-sub metric-growth-pos"><TrendingUp size={14} /> +12.1% conversion</span>
              </div>
              <div className="metric-card">
                <span className="metric-header">Avg First Response</span>
                <span className="metric-val">2.4 sec</span>
                <span className="metric-sub" style={{ color: 'var(--emerald-400)', fontWeight: 600 }}><Zap size={14} /> 24/7 instantaneous</span>
              </div>
            </div>

            {/* Simulated Live Action Feed */}
            <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', backgroundColor: 'rgba(14, 22, 17, 0.85)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', color: '#F1F5F3' }}>
                Live Agentic Action Timeline
              </div>
              <div className="activity-feed">
                <div className="activity-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.95rem', backgroundColor: 'rgba(18, 28, 22, 0.75)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Badge variant="whatsapp">WhatsApp</Badge>
                      <span><strong style={{ color: '#F1F5F3' }}>AI Order Generated:</strong> Order #KZ-1049 for Marcus Vance ($89.00)</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>2 mins ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.95rem', backgroundColor: 'rgba(18, 28, 22, 0.75)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Badge variant="instagram">Instagram</Badge>
                      <span><strong style={{ color: '#F1F5F3' }}>Knowledge Answered:</strong> Dishwasher tolerance answered for Minimalist Carafe</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>14 mins ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.95rem', backgroundColor: 'rgba(18, 28, 22, 0.75)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Badge variant="facebook">Facebook</Badge>
                      <span><strong style={{ color: '#F1F5F3' }}>Safe Escalation:</strong> Customer requested exchange sizing nuance. Escalated to team.</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>48 mins ago</span>
                  </div>
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
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--emerald-300)' }}>KZ-1049</td>
                  <td style={{ color: '#F1F5F3' }}>Marcus Vance</td>
                  <td><Badge variant="whatsapp">WhatsApp</Badge></td>
                  <td>Artisan Linen Overshirt (L)</td>
                  <td style={{ fontWeight: 600, color: '#F1F5F3' }}>$89.00</td>
                  <td><Badge variant="success">Confirmed</Badge></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--emerald-400)' }}>Autonomous Payment & Stock Reserve</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--emerald-300)' }}>KZ-1048</td>
                  <td style={{ color: '#F1F5F3' }}>Elena Rostova</td>
                  <td><Badge variant="instagram">Instagram</Badge></td>
                  <td>Minimalist Stoneware Carafe</td>
                  <td style={{ fontWeight: 600, color: '#F1F5F3' }}>$128.00</td>
                  <td><Badge variant="warning">Processing</Badge></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--emerald-400)' }}>Direct DM Checkout Link</td>
                </tr>
                <tr>
                  <td className="mono" style={{ fontWeight: 700, color: 'var(--emerald-300)' }}>KZ-1047</td>
                  <td style={{ color: '#F1F5F3' }}>Tariq Mansoor</td>
                  <td><Badge variant="whatsapp">WhatsApp</Badge></td>
                  <td>Organic Botanical Perfume</td>
                  <td style={{ fontWeight: 600, color: '#F1F5F3' }}>$110.00</td>
                  <td><Badge variant="info">Shipped</Badge></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--emerald-400)' }}>Courier Tracking Synced</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
