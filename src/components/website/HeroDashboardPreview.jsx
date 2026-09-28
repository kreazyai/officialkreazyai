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
        {/* TAB 1: LIVE CHATS - SLEEK MESSENGER STYLE */}
        {activeTab === 'conversations' && (
          <div className="mockup-chat-grid" style={{ display: 'grid', gridTemplateColumns: '270px 1fr', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-medium)', minHeight: '440px' }}>
            {/* Conversation list */}
            <div className="mockup-chat-list" style={{ borderRight: '1px solid var(--border-medium)', backgroundColor: 'rgba(14, 22, 17, 0.95)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, fontSize: '0.85rem', color: '#F1F5F3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Messages</span>
                <span className="badge badge-olive" style={{ fontSize: '0.7rem' }}>3 Active</span>
              </div>
              
              {/* Thread 1 - Selected */}
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'rgba(163, 230, 53, 0.08)', borderLeft: '3px solid var(--bright-olive)', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#2D3E30', color: '#F1F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', border: '1px solid var(--border-medium)' }}>
                    MV
                  </div>
                  <span style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #0e1611' }}></span>
                </div>
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#F1F5F3' }}>Marcus Vance</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Just now</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Order #KZ-1049 confirmed!
                  </div>
                </div>
              </div>

              {/* Thread 2 */}
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#202E23', color: '#A1B2A5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    ER
                  </div>
                  <span style={{ position: 'absolute', bottom: '0', right: '0', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #0e1611' }}></span>
                </div>
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F1F5F3' }}>Elena Rostova</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>14m</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Is the Matte Moss finish in stock?
                  </div>
                </div>
              </div>

              {/* Thread 3 */}
              <div style={{ padding: '0.85rem 1rem', cursor: 'pointer', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#202E23', color: '#A1B2A5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    JB
                  </div>
                </div>
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#F1F5F3' }}>Julian Bennett</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>1h</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Thanks for the fast size exchange!
                  </div>
                </div>
              </div>
            </div>

            {/* Messenger Chat Box */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(11, 16, 13, 0.98)' }}>
              {/* Header */}
              <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16, 25, 19, 0.9)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2D3E30', color: '#F1F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                      MV
                    </div>
                    <span style={{ position: 'absolute', bottom: '0', right: '0', width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #101913' }}></span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F1F5F3' }}>Marcus Vance</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--bright-olive)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>WhatsApp Business</span> • <span>Active now</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '20px', backgroundColor: 'rgba(163, 230, 53, 0.12)', color: 'var(--bright-olive)', fontWeight: 600, border: '1px solid rgba(163, 230, 53, 0.25)' }}>
                    <span className="status-dot active" style={{ width: '6px', height: '6px' }}></span> AI Copilot Live
                  </span>
                </div>
              </div>

              {/* Message Bubbles - Clean Messenger Flow */}
              <div style={{ flexGrow: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                
                {/* 1. Customer Incoming Bubble */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', maxWidth: '75%', alignSelf: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2D3E30', color: '#F1F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                    MV
                  </div>
                  <div>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#F1F5F3', padding: '0.7rem 0.95rem', borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255, 255, 255, 0.08)', lineHeight: 1.4 }}>
                      Hi! Does the Artisan Linen Overshirt fit true to size? I'm 6'1", 185 lbs.
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', marginLeft: '6px' }}>10:14 AM</div>
                  </div>
                </div>

                {/* 2. AI Outgoing Bubble */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '75%', alignSelf: 'flex-end' }}>
                  <div style={{ background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)', color: '#FFFFFF', padding: '0.7rem 1rem', borderRadius: '18px 18px 4px 18px', border: '1px solid rgba(74, 222, 128, 0.25)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', lineHeight: 1.45 }}>
                    Hello Marcus! For 6'1" and 185 lbs, Size L offers the intended relaxed European drape. Would you like me to reserve the Olive in Size L for you?
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--bright-olive)', marginTop: '3px', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Bot size={11} /> 10:14 AM • AI Copilot
                  </div>
                </div>

                {/* 3. Customer Incoming Bubble */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', maxWidth: '75%', alignSelf: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2D3E30', color: '#F1F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
                    MV
                  </div>
                  <div>
                    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#F1F5F3', padding: '0.7rem 0.95rem', borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255, 255, 255, 0.08)', lineHeight: 1.4 }}>
                      Yes please! Can I pay directly here?
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', marginLeft: '6px' }}>10:15 AM</div>
                  </div>
                </div>

                {/* 4. AI Outgoing Bubble with Messenger Checkout Card */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', maxWidth: '80%', alignSelf: 'flex-end' }}>
                  <div style={{ background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)', color: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '18px 18px 4px 18px', border: '1px solid rgba(74, 222, 128, 0.25)', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', width: '100%' }}>
                    <div>Done! I've reserved your item and processed your checkout:</div>
                    
                    {/* Messenger Rich Order Card */}
                    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '0.75rem', marginTop: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#F1F5F3' }}>Artisan Linen Overshirt</span>
                        <span style={{ fontWeight: 700, color: 'var(--bright-olive)' }}>$89.00</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '6px' }}>
                        Color: Olive • Size: L • Paid via Stripe
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', backgroundColor: 'rgba(74, 222, 128, 0.2)', color: '#86efac', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600 }}>
                        ✓ Order #KZ-1049 Confirmed
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                      Tracking details will update automatically!
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--bright-olive)', marginTop: '3px', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Bot size={11} /> 10:15 AM • AI Copilot ✓✓
                  </div>
                </div>

              </div>

              {/* Chat Input Simulated - Modern Messenger Style */}
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-medium)', display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(16, 25, 19, 0.95)' }}>
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '24px', padding: '0.35rem 1rem', border: '1px solid var(--border-subtle)' }}>
                  <input 
                    type="text" 
                    readOnly 
                    value="AI Copilot is handling conversation..." 
                    style={{ flexGrow: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--text-secondary)' }} 
                  />
                </div>
                <button 
                  type="button" 
                  className="btn btn-sm btn-primary" 
                  onClick={onExploreApp}
                  style={{ borderRadius: '20px', padding: '0.45rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
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
