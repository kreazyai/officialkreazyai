import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  AlertCircle, 
  Tag, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  ArrowRight,
  ArrowLeft,
  Info,
  X
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { conversationService } from '../../services/api';

export function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [filterChannel, setFilterChannel] = useState('all'); // all | whatsapp | instagram | facebook | needs-human
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isCopilotMode, setIsCopilotMode] = useState(false); // false = AI auto | true = Human takeover
  const [loading, setLoading] = useState(true);

  // Mobile Master-Detail States
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileCustomerInfoOpen, setMobileCustomerInfoOpen] = useState(false);

  // Load conversations from service
  const loadConversations = async () => {
    try {
      const data = await conversationService.getAll();
      setConversations(data);
      if (data.length > 0 && !selectedConvId) {
        setSelectedConvId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const activeConversation = conversations.find(c => c.id === selectedConvId) || conversations[0];

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;

    const sender = isCopilotMode ? 'agent' : 'assistant';
    const textToSend = replyText;
    setReplyText('');

    await conversationService.sendMessage(activeConversation.id, textToSend, sender);
    loadConversations();
  };

  // Toggle Human Handoff
  const handleToggleHandoff = async () => {
    if (!activeConversation) return;
    await conversationService.toggleHandoff(activeConversation.id);
    loadConversations();
  };

  // Insert AI suggestion into input
  const handleApplyAiSuggestion = (suggestion) => {
    setReplyText(suggestion);
    setIsCopilotMode(true);
  };

  // Select conversation on mobile
  const handleSelectConversation = (id) => {
    setSelectedConvId(id);
    setMobileChatOpen(true);
  };

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
    const matchesChannel = 
      filterChannel === 'all' ? true :
      filterChannel === 'needs-human' ? c.needsHuman :
      c.channel === filterChannel;
    
    const matchesSearch = 
      c.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer.phone.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesChannel && matchesSearch;
  });

  return (
    <div className="dashboard-content" style={{ paddingBottom: '0' }}>
      <div className="page-title-row" style={{ marginBottom: '1rem' }}>
        <div>
          <h2>Omnichannel Messages & AI Inbox</h2>
          <p style={{ fontSize: '0.9rem' }}>Real-time conversations across WhatsApp Cloud, Instagram Graph, and Facebook Messenger.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="olive">
            <span className="status-dot active"></span> 3 Channels Synchronized
          </Badge>
          <Button variant="secondary" size="sm" onClick={loadConversations} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {/* 3-Column Inbox Interface with Mobile Master-Detail Adaptivity */}
      <div className={`inbox-layout ${mobileChatOpen ? 'mobile-show-chat' : 'mobile-show-list'}`}>
        
        {/* LEFT COLUMN: CONVERSATION LIST */}
        <div className="inbox-conversations-col">
          <div className="conversations-filter-bar">
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '8px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '1.75rem', height: '34px', fontSize: '0.8rem' }}
                placeholder="Filter by customer name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Channel Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
              {['all', 'whatsapp', 'instagram', 'facebook', 'needs-human'].map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setFilterChannel(ch)}
                  className={`btn btn-sm ${filterChannel === ch ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', height: '24px', flexShrink: 0 }}
                >
                  {ch === 'needs-human' ? '⚠️ Needs Human' : ch.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* List items */}
          <div className="conversations-list">
            {filteredConversations.map(c => {
              const isSelected = c.id === activeConversation?.id;
              const lastMsg = c.messages[c.messages.length - 1];

              return (
                <div
                  key={c.id}
                  className={`conversation-item ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(c.id)}
                >
                  <div className="convo-avatar-wrap">
                    <div className="convo-avatar">
                      {c.customer.avatar}
                    </div>
                    <div className="convo-channel-dot">
                      <span className="status-dot active" style={{ width: '6px', height: '6px' }}></span>
                    </div>
                  </div>

                  <div className="convo-content">
                    <div className="convo-topline">
                      <span className="convo-name">{c.customer.name}</span>
                      <span className="convo-time">{c.lastActivity}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '3px' }}>
                      <Badge variant={c.channel === 'whatsapp' ? 'whatsapp' : c.channel === 'instagram' ? 'instagram' : 'facebook'}>
                        {c.channel}
                      </Badge>
                      {c.needsHuman ? (
                        <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Handoff</span>
                      ) : (
                        <span className="badge badge-olive" style={{ fontSize: '0.65rem' }}>AI Auto</span>
                      )}
                    </div>

                    <div className="convo-snippet">
                      {lastMsg ? lastMsg.text : 'No messages'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN: CURRENT CONVERSATION & CHAT */}
        {activeConversation ? (
          <div className="inbox-chat-col">
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-user">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  className="btn btn-icon btn-ghost mobile-back-btn"
                  onClick={() => setMobileChatOpen(false)}
                  style={{ display: 'none', marginRight: '4px' }}
                  title="Back to conversation list"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="convo-avatar" style={{ flexShrink: 0 }}>
                  {activeConversation.customer.avatar}
                </div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {activeConversation.customer.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{activeConversation.customer.phone}</span>
                    <span>•</span>
                    <Badge variant={activeConversation.channel === 'whatsapp' ? 'whatsapp' : activeConversation.channel === 'instagram' ? 'instagram' : 'facebook'}>
                      {activeConversation.channel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Autonomy Mode Switch & Mobile Info Drawer Trigger */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="chat-mode-control">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}>
                    <Bot size={13} color={activeConversation.needsHuman ? 'var(--text-muted)' : 'var(--olive-700)'} />
                    <span style={{ fontWeight: 600 }} className="desktop-mode-label">
                      {activeConversation.needsHuman ? 'Human Takeover' : 'AI Autonomous'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${activeConversation.needsHuman ? 'btn-primary' : 'btn-subtle'}`}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                    onClick={handleToggleHandoff}
                  >
                    {activeConversation.needsHuman ? 'Resume' : 'Take Over'}
                  </button>
                </div>

                {/* Mobile Customer Info Button */}
                <button
                  type="button"
                  className="btn btn-icon btn-secondary mobile-info-btn"
                  onClick={() => setMobileCustomerInfoOpen(!mobileCustomerInfoOpen)}
                  style={{ display: 'none' }}
                  title="View customer profile"
                >
                  <Info size={16} />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="chat-messages-container">
              {activeConversation.messages.map((m) => {
                const isCustomer = m.sender === 'customer';
                const isAi = m.sender === 'assistant';

                return (
                  <div 
                    key={m.id} 
                    className={`chat-bubble-wrap ${isCustomer ? 'customer' : isAi ? 'assistant' : 'agent'}`}
                  >
                    <div className="chat-bubble">
                      {isAi && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--olive-200)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <Bot size={12} /> Kreazy AI Copilot
                        </div>
                      )}

                      {!isCustomer && !isAi && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--olive-200)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                          <User size={12} /> Human Support Specialist
                        </div>
                      )}

                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>

                      {/* Product attachment if generated by AI */}
                      {m.productAttachment && (
                        <div style={{ marginTop: '0.65rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.8rem' }}>
                            <ShoppingBag size={14} /> {m.productAttachment.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                            ${m.productAttachment.price.toFixed(2)} • SKU: {m.productAttachment.sku}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="chat-bubble-meta">
                      <span>{m.timestamp}</span>
                      {m.aiAction && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--olive-700)', fontWeight: 600 }}>{m.aiAction}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input & AI Copilot Suggestion Bar */}
            <div className="chat-input-area">
              {/* Quick AI Suggestions Bar */}
              <div className="ai-copilot-suggestion-bar" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                <Sparkles size={14} color="var(--olive-700)" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: '0.72rem', flexShrink: 0 }}>AI Quick:</span>
                <button
                  type="button"
                  className="btn btn-sm btn-subtle"
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', flexShrink: 0 }}
                  onClick={() => handleApplyAiSuggestion("We have that in stock right now and can dispatch it today!")}
                >
                  "In stock & ready"
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-subtle"
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', flexShrink: 0 }}
                  onClick={() => handleApplyAiSuggestion("Here is an exclusive 10% welcome coupon code: KREAZY10")}
                >
                  "10% Coupon"
                </button>
              </div>

              {/* Chat Input Row */}
              <form onSubmit={handleSendMessage} className="chat-input-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder={activeConversation.needsHuman ? "Type manual message as human agent..." : "Type reply or let AI respond..."}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                />

                <Button type="submit" variant="primary" size="md" icon={Send} style={{ flexShrink: 0 }}>
                  <span className="desktop-send-label">Send</span>
                </Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="state-box" style={{ margin: 'auto' }}>
            <h4>No Conversation Selected</h4>
            <p>Select a thread from the list to view messages.</p>
          </div>
        )}

        {/* RIGHT COLUMN: CUSTOMER CONTEXT & ORDER HISTORY */}
        {activeConversation && (
          <>
            {mobileCustomerInfoOpen && (
              <div 
                onClick={() => setMobileCustomerInfoOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(20, 28, 21, 0.45)',
                  backdropFilter: 'blur(2px)',
                  zIndex: 1150
                }}
                aria-hidden="true"
              />
            )}
            <div className={`inbox-customer-col ${mobileCustomerInfoOpen ? 'mobile-open' : ''}`}>
              {/* Mobile Close Button for Drawer */}
              <div style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }} className="mobile-customer-header">
                <strong>Customer Profile</strong>
                <Button variant="ghost" size="icon" onClick={() => setMobileCustomerInfoOpen(false)}>
                  <X size={18} />
                </Button>
              </div>

            <div className="desktop-customer-title">
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Customer Profile</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Aggregated cross-channel shopper data</p>
            </div>

            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto', fontWeight: 800, fontSize: '1.15rem' }}>
                {activeConversation.customer.avatar}
              </div>
              <strong style={{ fontSize: '0.95rem' }}>{activeConversation.customer.name}</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{activeConversation.customer.email}</div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Spend</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--olive-950)' }}>
                  ${activeConversation.customer.totalSpent.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Orders</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--olive-950)' }}>
                  {activeConversation.customer.ordersCount}
                </div>
              </div>
            </div>

            {/* Customer Tags */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Segments & Tags
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {activeConversation.customer.tags.map(t => (
                  <Badge key={t} variant="olive">{t}</Badge>
                ))}
              </div>
            </div>

            {/* AI Diagnostics */}
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--olive-950)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="var(--olive-700)" /> AI Telemetry
              </div>
              <div>Confidence Score: <strong>{activeConversation.aiConfidence}%</strong></div>
              <div>Grounding: <strong>Verified Catalog Index</strong></div>
              <div>Status: <strong>{activeConversation.needsHuman ? 'Human Intervention' : 'Autonomous'}</strong></div>
            </div>
          </div>
          </>
        )}

      </div>
    </div>
  );
}
