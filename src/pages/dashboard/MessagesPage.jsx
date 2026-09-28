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
  X,
  MessageSquare,
  Network,
  CheckCheck,
  Paperclip
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { conversationService } from '../../services/api';

export function MessagesPage({ user, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [filterChannel, setFilterChannel] = useState('all'); // all | whatsapp | instagram | facebook | needs-human
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isCopilotMode, setIsCopilotMode] = useState(false); // false = AI auto | true = Human takeover
  const [loading, setLoading] = useState(false);
  const [previewingDemo, setPreviewingDemo] = useState(isDemo);

  // Mobile Master-Detail States
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileCustomerInfoOpen, setMobileCustomerInfoOpen] = useState(false);

  // Load conversations from service
  const loadConversations = async (forceDemo = false) => {
    setLoading(true);
    try {
      const data = await conversationService.getAll(forceDemo || previewingDemo);
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
  }, [isDemo, previewingDemo]);

  const handleLoadDemoPreview = () => {
    setPreviewingDemo(true);
    loadConversations(true);
  };

  const handleSimulateInbound = async () => {
    await conversationService.receiveIncomingMessage({
      customerName: "Sophia Chen",
      channel: "whatsapp",
      text: "Hi Kreazy! Do you have linen overshirts in stock? Looking to order size M.",
      phone: "+1 (555) 782-9912",
      email: "sophiachen@gmail.com"
    });
    await loadConversations(false);
  };

  const activeConversation = conversations.find(c => c.id === selectedConvId) || (conversations.length > 0 ? conversations[0] : null);

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversation) return;

    const sender = isCopilotMode ? 'agent' : 'assistant';
    const textToSend = replyText;
    setReplyText('');

    await conversationService.sendMessage(activeConversation.id, textToSend, sender);
    loadConversations(true);
  };

  // Toggle Human Handoff
  const handleToggleHandoff = async () => {
    if (!activeConversation) return;
    await conversationService.toggleHandoff(activeConversation.id);
    loadConversations(true);
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
          <p style={{ fontSize: '0.9rem' }}>
            {conversations.length > 0 
              ? 'Real-time conversations across WhatsApp Cloud, Instagram Graph, and Facebook Messenger.'
              : 'Clean omnichannel customer inbox. Connect your channels to begin receiving live customer messages.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {previewingDemo && !isDemo && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setPreviewingDemo(false)}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
            >
              Exit Demo Preview
            </button>
          )}

          <Badge variant={conversations.length > 0 ? 'olive' : 'subtle'}>
            <span className={`status-dot ${conversations.length > 0 ? 'active' : ''}`}></span>{' '}
            {conversations.length > 0 ? 'Channels Synchronized' : 'Channels Standby (0/3)'}
          </Badge>

          <Button variant="primary" size="sm" onClick={handleSimulateInbound} icon={MessageSquare}>
            ⚡ Receive Inbound Message
          </Button>

          {conversations.length > 0 ? (
            <Button variant="secondary" size="sm" onClick={() => loadConversations(true)} icon={RefreshCw}>
              Refresh
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={handleLoadDemoPreview} icon={Sparkles}>
              Preview Demo Threads
            </Button>
          )}
        </div>
      </div>

      {/* 3-Column Inbox Interface with Mobile Master-Detail Adaptivity */}
      <div className={`inbox-layout ${mobileChatOpen ? 'mobile-show-chat' : 'mobile-show-list'}`}>
        
        {/* LEFT COLUMN: CONVERSATION LIST */}
        <div className="inbox-conversations-col">
          <div className="conversations-filter-bar">
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem', borderRadius: '18px' }}
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Channel Filter Pills */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', marginTop: '0.5rem' }}>
              {['all', 'whatsapp', 'instagram', 'facebook'].map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setFilterChannel(ch)}
                  className={`btn btn-sm ${filterChannel === ch ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', height: '24px', flexShrink: 0, borderRadius: '12px' }}
                >
                  {ch.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* List items or Clean Empty State */}
          <div className="conversations-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(c => {
                const isSelected = c.id === activeConversation?.id;
                const lastMsg = c.messages[c.messages.length - 1];

                return (
                  <div
                    key={c.id}
                    className={`conversation-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectConversation(c.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'rgba(163, 230, 53, 0.08)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--bright-olive)' : '3px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#2D3E30',
                        color: '#F1F5F3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {c.customer.avatar}
                      </div>
                      <span style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        border: '2px solid var(--bg-card)'
                      }}></span>
                    </div>

                    <div style={{ minWidth: 0, flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                        <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: '0.875rem', color: '#F1F5F3', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {c.customer.name}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.lastActivity}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '2px' }}>
                        <Badge variant={c.channel === 'whatsapp' ? 'whatsapp' : c.channel === 'instagram' ? 'instagram' : 'facebook'}>
                          {c.channel}
                        </Badge>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {lastMsg ? lastMsg.text : 'No messages'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Clean Empty State for Customer Messages List */
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(163, 230, 53, 0.08)',
                  color: 'var(--bright-olive)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem'
                }}>
                  <MessageSquare size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  No customer messages yet
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 1rem 0' }}>
                  When customers send inquiries on WhatsApp, Instagram, or Facebook, their threads will stream here in real time.
                </p>
                <Button variant="subtle" size="xs" onClick={handleLoadDemoPreview}>
                  ⚡ Preview Sample Threads
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: CURRENT CONVERSATION & CHAT */}
        {activeConversation ? (
          <div className="inbox-chat-col" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
            {/* Messenger Chat Header */}
            <div className="chat-header" style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
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

                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#2D3E30',
                    color: '#F1F5F3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {activeConversation.customer.avatar}
                  </div>
                  <span style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    border: '2px solid var(--bg-card)'
                  }}></span>
                </div>

                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {activeConversation.customer.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--bright-olive)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ textTransform: 'capitalize' }}>{activeConversation.channel}</span>
                    <span>•</span>
                    <span>Active now</span>
                  </div>
                </div>
              </div>

              {/* Autonomy Mode Switch & Mobile Info Drawer Trigger */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${activeConversation.needsHuman ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    fontSize: '0.75rem',
                    borderRadius: '20px',
                    padding: '0.3rem 0.75rem',
                    border: activeConversation.needsHuman ? 'none' : '1px solid var(--border-medium)',
                    color: activeConversation.needsHuman ? '#ffffff' : 'var(--bright-olive)'
                  }}
                  onClick={handleToggleHandoff}
                >
                  {activeConversation.needsHuman ? '⚠️ Human Mode' : '🟢 AI Copilot Active'}
                </button>

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

            {/* Messenger Conversation Messages Container */}
            <div className="chat-messages-container" style={{ flexGrow: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeConversation.messages.map((m) => {
                const isCustomer = m.sender === 'customer';
                const isAi = m.sender === 'assistant';

                return (
                  <div 
                    key={m.id} 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isCustomer ? 'flex-start' : 'flex-end',
                      width: '100%'
                    }}
                  >
                    {/* Message Bubble + Left Avatar if Customer */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '0.5rem',
                      maxWidth: '75%',
                      flexDirection: isCustomer ? 'row' : 'row-reverse'
                    }}>
                      {isCustomer && (
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: '#2D3E30',
                          color: '#F1F5F3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {activeConversation.customer.avatar}
                        </div>
                      )}

                      <div>
                        {/* The Bubble */}
                        <div style={{
                          padding: '0.7rem 1rem',
                          borderRadius: isCustomer ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                          backgroundColor: isCustomer 
                            ? 'rgba(255, 255, 255, 0.08)' 
                            : isAi 
                              ? '#15803D' 
                              : '#1F2937',
                          color: '#FFFFFF',
                          border: isCustomer ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(74, 222, 128, 0.25)',
                          fontSize: '0.875rem',
                          lineHeight: 1.45,
                          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.15)'
                        }}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>

                          {/* Product / Order Attachment inside Messenger Card */}
                          {m.productAttachment && (
                            <div style={{
                              marginTop: '0.65rem',
                              padding: '0.65rem',
                              backgroundColor: 'rgba(0, 0, 0, 0.25)',
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <strong style={{ fontSize: '0.825rem' }}>{m.productAttachment.name}</strong>
                                <span style={{ color: 'var(--bright-olive)', fontWeight: 700 }}>${m.productAttachment.price.toFixed(2)}</span>
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                                SKU: {m.productAttachment.sku} • Verified Catalog Stock
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Timestamp & Meta Subtext */}
                        <div style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          marginTop: '3px',
                          marginLeft: isCustomer ? '6px' : '0',
                          marginRight: isCustomer ? '0' : '6px',
                          textAlign: isCustomer ? 'left' : 'right',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isCustomer ? 'flex-start' : 'flex-end',
                          gap: '4px'
                        }}>
                          <span>{m.timestamp}</span>
                          {!isCustomer && (
                            <>
                              <span>•</span>
                              <span style={{ color: 'var(--bright-olive)' }}>
                                {isAi ? 'AI Copilot ✓✓' : 'Human Specialist ✓✓'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modern Messenger Input Bar */}
            <div className="chat-input-area" style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-card)' }}>
              {/* Quick AI Suggestions Bar */}
              <div className="ai-copilot-suggestion-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', overflowX: 'auto', flexWrap: 'nowrap' }}>
                <Sparkles size={13} color="var(--bright-olive)" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: '0.72rem', flexShrink: 0, color: 'var(--text-secondary)' }}>AI Smart Reply:</span>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', flexShrink: 0, backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)' }}
                  onClick={() => handleApplyAiSuggestion("We have that in stock right now and can dispatch it today!")}
                >
                  "In stock & ready to ship"
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', flexShrink: 0, backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)' }}
                  onClick={() => handleApplyAiSuggestion("Here is an exclusive 10% welcome coupon code: KREAZY10")}
                >
                  "10% Welcome Discount"
                </button>
              </div>

              {/* Chat Input Row */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '24px', padding: '0.4rem 1rem', border: '1px solid var(--border-medium)' }}>
                  <input
                    type="text"
                    placeholder={activeConversation.needsHuman ? "Type manual message as human agent..." : "Type reply or let AI respond automatically..."}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{ flexGrow: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  size="md" 
                  icon={Send} 
                  style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  title="Send message"
                />
              </form>
            </div>
          </div>
        ) : (
          /* Clean Empty Inbox Screen for New Users */
          <div style={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-canvas)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(163, 230, 53, 0.1)',
              color: 'var(--bright-olive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <MessageSquare size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Your Omnichannel Customer Inbox is Empty
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '460px', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Your store has zero incoming messages. As soon as a customer writes to your connected WhatsApp Business, Instagram DM, or Facebook Messenger, their live conversation thread will appear here.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button 
                variant="primary" 
                size="md" 
                onClick={() => onNavigateModule ? onNavigateModule('integrations') : null} 
                icon={Network}
              >
                Connect Channels
              </Button>
              <Button 
                variant="secondary" 
                size="md" 
                onClick={handleLoadDemoPreview} 
                icon={Sparkles}
              >
                Load Interactive Demo Threads
              </Button>
            </div>
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
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Shopper details</p>
            </div>

            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#2D3E30', color: '#F1F5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem auto', fontWeight: 800, fontSize: '1.15rem' }}>
                {activeConversation.customer.avatar}
              </div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{activeConversation.customer.name}</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{activeConversation.customer.email}</div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Spend</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  ${activeConversation.customer.totalSpent.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Orders</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
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
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={14} color="var(--bright-olive)" /> AI Telemetry
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
