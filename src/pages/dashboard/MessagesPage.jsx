import React, {
  useState, useEffect, useRef, useCallback, useMemo
} from 'react';
import {
  Search, Send, Bot, Sparkles, Check, CheckCheck,
  ArrowLeft, X, MoreVertical, Phone, Mail, ShoppingBag,
  MessageSquare, RefreshCw, ChevronDown, Loader2, AlertCircle,
  UserCheck, UserX, CheckCircle2, Circle, RotateCcw, Trash2,
  Paperclip, Smile, Zap, Info, User, Clock, Hash, Tag,
  ChevronRight, Wifi, WifiOff, Filter, Plus,
} from 'lucide-react';
import { conversationService } from '../../services/api';

// ── Channel config ────────────────────────────────────────────────────────────
const CHANNELS = {
  whatsapp: { label: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.12)', icon: 'WA' },
  instagram: { label: 'Instagram', color: '#E1306C', bg: 'rgba(225,48,108,0.12)', icon: 'IG' },
  facebook: { label: 'Facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.12)', icon: 'FB' },
  WHATSAPP: { label: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.12)', icon: 'WA' },
  INSTAGRAM: { label: 'Instagram', color: '#E1306C', bg: 'rgba(225,48,108,0.12)', icon: 'IG' },
  FACEBOOK: { label: 'Facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.12)', icon: 'FB' },
  website: { label: 'Website', color: '#7C3AED', bg: 'rgba(124,58,237,0.12)', icon: 'WEB' },
};

const getChannel = (ch) => CHANNELS[ch] || { label: ch, color: 'var(--text-muted)', bg: 'var(--bg-subtle)', icon: 'MSG' };

const STATUS_MAP = {
  ACTIVE: { label: 'Active', color: '#22c55e' },
  RESOLVED: { label: 'Resolved', color: 'var(--text-muted)' },
  NEEDS_HUMAN: { label: 'Needs Human', color: '#f59e0b' },
  WAITING: { label: 'Waiting', color: '#3b82f6' },
};

// Format relative time
function relTime(ts) {
  if (!ts) return '';
  if (typeof ts === 'string' && !ts.match(/^\d{4}/)) return ts;
  try {
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ts; }
}

// Customer initials
function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

// Avatar component
function Avatar({ name = '', size = 40, src, online }) {
  const letters = initials(name);
  const hue = letters.charCodeAt(0) * 3 % 360;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: src ? 'transparent' : `hsl(${hue},40%,28%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: size * 0.35, color: `hsl(${hue},80%,88%)`,
        overflow: 'hidden', border: '1.5px solid var(--border-light)',
      }}>
        {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : letters}
      </div>
      {online !== undefined && (
        <span style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: online ? '#22c55e' : 'var(--border-medium)',
          border: `2px solid var(--bg-card)`,
        }} />
      )}
    </div>
  );
}

// Channel badge
function ChannelBadge({ channel, compact = false }) {
  const ch = getChannel(channel);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      background: ch.bg, color: ch.color,
      borderRadius: '100px', padding: compact ? '2px 6px' : '3px 8px',
      fontSize: compact ? '0.68rem' : '0.72rem', fontWeight: 700,
      border: `1px solid ${ch.color}22`,
    }}>
      {ch.icon} {!compact && ch.label}
    </span>
  );
}

// Unread badge
function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span style={{
      minWidth: '18px', height: '18px', borderRadius: '100px',
      background: 'var(--olive-700)', color: '#fff',
      fontSize: '0.68rem', fontWeight: 800,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 5px', flexShrink: 0,
    }}>{count > 99 ? '99+' : count}</span>
  );
}

// Toast
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const c = type === 'error' ? '#dc2626' : type === 'info' ? '#3b82f6' : '#16a34a';
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      background: 'var(--bg-card)', border: `1px solid ${c}44`,
      borderLeft: `4px solid ${c}`, borderRadius: '10px',
      padding: '0.75rem 1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      maxWidth: '360px', display: 'flex', alignItems: 'center', gap: '0.6rem',
      animation: 'slideInRight 0.25s ease',
    }}>
      <span style={{ color: c, flexShrink: 0 }}><AlertCircle size={15} /></span>
      <span style={{ fontSize: '0.82rem', flexGrow: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}><X size={13} /></button>
    </div>
  );
}

// AI Suggest Panel
function AiSuggestPanel({ convId, lastCustomerMessage, onApply, onDismiss }) {
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSuggestion = useCallback(async () => {
    if (!convId) return;
    setLoading(true);
    setError('');
    try {
      const res = await conversationService.aiSuggest(convId, lastCustomerMessage);
      setSuggestion(res?.suggestion || 'No suggestion available.');
    } catch (err) {
      setError(err.message || 'AI suggestion failed.');
    } finally {
      setLoading(false);
    }
  }, [convId, lastCustomerMessage]);

  useEffect(() => { fetchSuggestion(); }, [fetchSuggestion]);

  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: '0', right: '0',
      background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
      borderBottom: 'none', borderRadius: '12px 12px 0 0',
      padding: '1rem 1.25rem', zIndex: 10,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', fontWeight: 700 }}>
          <Sparkles size={14} color="var(--olive-700)" />
          <span>AI Suggested Reply</span>
          {loading && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite', color: 'var(--olive-700)' }} />}
        </div>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
          <X size={15} />
        </button>
      </div>

      {error ? (
        <p style={{ fontSize: '0.8rem', color: '#dc2626', margin: '0 0 0.75rem' }}>{error}</p>
      ) : loading ? (
        <div style={{ height: '40px', background: 'var(--bg-subtle)', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ) : (
        <p style={{
          fontSize: '0.875rem', lineHeight: 1.55,
          margin: '0 0 0.75rem', color: 'var(--text-primary)',
          padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)',
          borderRadius: '8px', border: '1px solid var(--border-light)',
        }}>{suggestion}</p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onApply(suggestion)}
          disabled={loading || !suggestion}
          style={{
            background: 'linear-gradient(135deg, var(--olive-700), var(--olive-900))',
            color: '#fff', border: 'none', borderRadius: '7px',
            padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
          }}
        >Use This Reply</button>
        <button
          onClick={fetchSuggestion}
          disabled={loading}
          style={{
            background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)',
            borderRadius: '7px', padding: '0.4rem 0.75rem', fontSize: '0.8rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}
        >
          <RefreshCw size={12} /> Regenerate
        </button>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

// Conversation List Item
function ConvItem({ conv, isActive, onClick }) {
  const lastMsg = conv.messages?.[conv.messages.length - 1];
  const preview = lastMsg?.text || 'No messages yet';
  const isUnread = Number(conv.unread) > 0;
  const ch = getChannel(conv.channel);

  const customerName = conv.customer_name || conv.customer?.name || 'Unknown Customer';
  const ts = conv.updated_at || conv.lastActivity || '';

  return (
    <div
      className="conv-list-item"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.85rem 1rem', cursor: 'pointer',
        borderBottom: '1px solid var(--border-light)',
        background: isActive ? 'var(--bg-subtle)' : 'transparent',
        borderLeft: `3px solid ${isActive ? 'var(--olive-700)' : 'transparent'}`,
        transition: 'all 0.12s',
      }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={customerName} size={42} />
        <span style={{
          position: 'absolute', bottom: '-2px', right: '-2px',
          width: '18px', height: '18px', borderRadius: '50%',
          background: 'var(--bg-card)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '10px', border: '1px solid var(--border-light)',
        }}>{ch.icon}</span>
      </div>

      <div style={{ minWidth: 0, flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <span style={{
            fontWeight: isUnread ? 800 : 600, fontSize: '0.875rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)',
            maxWidth: '145px',
          }}>{customerName}</span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '4px' }}>
            {relTime(ts)}
          </span>
        </div>
        <div style={{
          fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', color: 'var(--text-muted)',
          fontWeight: isUnread ? 600 : 400,
        }}>
          {lastMsg?.sender === 'customer' ? '' : lastMsg?.is_ai || lastMsg?.isAi ? '' : ''}
          {preview}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
        <UnreadBadge count={conv.unread} />
        {(conv.status === 'NEEDS_HUMAN' || conv.needsHuman) && (
          <span style={{ fontSize: '0.62rem', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '100px', padding: '1px 5px', fontWeight: 700 }}>
            Human
          </span>
        )}
      </div>
    </div>
  );
}

// Message Bubble
function MessageBubble({ msg, customerName }) {
  const isCustomer = msg.sender === 'customer';
  const isAi = msg.is_ai || msg.isAi || msg.sender === 'ai' || msg.sender === 'assistant';
  const isSystem = msg.sender === 'system';

  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', padding: '0.25rem 1rem' }}>
        <span style={{
          fontSize: '0.72rem', color: 'var(--text-muted)',
          background: 'var(--bg-subtle)', padding: '2px 10px',
          borderRadius: '100px', display: 'inline-block',
        }}>{msg.text}</span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: isCustomer ? 'row' : 'row-reverse',
      alignItems: 'flex-end', gap: '0.5rem',
      maxWidth: '78%', alignSelf: isCustomer ? 'flex-start' : 'flex-end',
    }}>
      {isCustomer && <Avatar name={customerName} size={28} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '100%' }}>
        {/* Sender label (only for non-customer) */}
        {!isCustomer && (
          <div style={{
            fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600,
            textAlign: 'right', marginRight: '4px',
            display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end',
          }}>
            {isAi && <Bot size={11} />}
            {isAi ? 'KreazyAI' : (msg.sender_name || 'Agent')}
          </div>
        )}

        {/* Bubble */}
        <div style={{
          padding: '0.6rem 0.9rem',
          borderRadius: isCustomer ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
          background: isCustomer
            ? 'var(--bg-subtle)'
            : isAi
              ? 'linear-gradient(135deg, rgba(42, 65, 30, 0.95), rgba(28, 48, 22, 0.95))'
              : 'var(--bg-card)',
          color: isCustomer
            ? 'var(--text-primary)'
            : isAi ? '#F3F5EE' : 'var(--text-primary)',
          border: isCustomer
            ? '1px solid var(--border-medium)'
            : isAi
              ? '1px solid rgba(189, 211, 148, 0.35)'
              : '1px solid var(--border-medium)',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          wordBreak: 'break-word',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        }}>
          {msg.text}

          {/* Product attachment */}
          {msg.productAttachment && (
            <div style={{
              marginTop: '0.5rem', padding: '0.5rem 0.65rem',
              background: 'rgba(0,0,0,0.15)', borderRadius: '8px',
              fontSize: '0.8rem',
            }}>
              <div style={{ fontWeight: 700 }}>{msg.productAttachment.name}</div>
              <div style={{ opacity: 0.8 }}>SKU: {msg.productAttachment.sku} · ${msg.productAttachment.price?.toFixed(2)}</div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div style={{
          fontSize: '0.65rem', color: 'var(--text-muted)',
          textAlign: isCustomer ? 'left' : 'right',
          display: 'flex', alignItems: 'center', gap: '3px',
          justifyContent: isCustomer ? 'flex-start' : 'flex-end',
          marginLeft: isCustomer ? '4px' : 0, marginRight: isCustomer ? 0 : '4px',
        }}>
          <span>{msg.time || msg.timestamp || relTime(msg.created_at)}</span>
          {!isCustomer && (
            <CheckCheck size={11} color={isAi ? 'var(--primary-accent)' : 'var(--text-muted)'} />
          )}
        </div>
      </div>
    </div>
  );
}

// Customer Info Panel
function CustomerPanel({ conv, onClose }) {
  if (!conv) return null;
  const name = conv.customer_name || conv.customer?.name || 'Unknown';
  const email = conv.customer?.email || '';
  const phone = conv.customer?.phone || conv.customer?.handle || '';
  const ordersCount = conv.customer?.ordersCount || 0;
  const totalSpent = conv.customer?.totalSpent || 0;
  const tags = conv.customer?.tags || [];

  return (
    <div style={{
      width: '280px', flexShrink: 0,
      borderLeft: '1px solid var(--border-light)',
      background: 'var(--bg-card)', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Customer Details</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
          <X size={15} />
        </button>
      </div>

      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Identity */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
            <Avatar name={name} size={56} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name}</div>
          <ChannelBadge channel={conv.channel} compact />
        </div>

        {/* Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Mail size={13} color="var(--text-muted)" /> {email}
            </div>
          )}
          {phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <Phone size={13} color="var(--text-muted)" /> {phone}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div style={{ padding: '0.6rem', background: 'var(--bg-subtle)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Orders</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{ordersCount}</div>
          </div>
          <div style={{ padding: '0.6rem', background: 'var(--bg-subtle)', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Spent</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>${(totalSpent || 0).toFixed(0)}</div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>Tags</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {tags.map(t => (
                <span key={t} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)', borderRadius: '100px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 600 }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Confidence */}
        {conv.aiConfidence && (
          <div style={{ padding: '0.75rem', background: 'rgba(74,90,40,0.08)', borderRadius: '8px', border: '1px solid rgba(74,90,40,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.35rem' }}>
              <Bot size={13} color="var(--olive-700)" /> AI Status
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Confidence: <strong>{conv.aiConfidence}%</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// MAIN COMPONENT
export function MessagesPage({ user, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);

  // ── State ──────────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(() => {
    try {
      const stored = sessionStorage.getItem('kreazy_selected_conv_id');
      if (stored) {
        sessionStorage.removeItem('kreazy_selected_conv_id');
        return stored;
      }
      const urlParam = new URLSearchParams(window.location.search).get('convId') || new URLSearchParams(window.location.search).get('conversation');
      if (urlParam) return urlParam;
    } catch {}
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterStatus, setFilterStatus] = useState(() => {
    try {
      const stored = sessionStorage.getItem('kreazy_messages_filter');
      if (stored) {
        sessionStorage.removeItem('kreazy_messages_filter');
        return stored;
      }
      const urlParam = new URLSearchParams(window.location.search).get('filter');
      if (urlParam) return urlParam;
    } catch {}
    return 'all';
  });
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileCustomerOpen, setMobileCustomerOpen] = useState(false);
  const [pollInterval, setPollInterval] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const actionMenuRef = useRef(null);

  const activeConv = useMemo(
    () => conversations.find(c => c.id === activeId) || null,
    [conversations, activeId]
  );

  // ── Load conversations ─────────────────────────────────────────────────────
  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await conversationService.getAll();
      setConversations(Array.isArray(data) ? data : []);
      // Auto-select first conversation on initial load
      if (!activeId && data?.length > 0) {
        setActiveId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    loadConversations();
    // Poll every 8 seconds for new messages
    const timer = setInterval(() => loadConversations(true), 8000);
    setPollInterval(timer);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom on messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages?.length]);

  // Close action menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Filtered conversations ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter(c => {
      const name = (c.customer_name || c.customer?.name || '').toLowerCase();
      const phone = (c.customer?.phone || '').toLowerCase();
      const email = (c.customer?.email || '').toLowerCase();
      const lastMsg = c.messages?.[c.messages.length - 1]?.text?.toLowerCase() || '';

      const matchSearch = !q || name.includes(q) || phone.includes(q) || email.includes(q) || lastMsg.includes(q);

      const ch = (c.channel || '').toLowerCase();
      const matchChannel = filterChannel === 'all' || ch === filterChannel;

      const st = c.status || '';
      const needsHuman = c.needsHuman || c.status === 'NEEDS_HUMAN' || c.status === 'WAITING';
      let matchStatus = true;
      if (filterStatus === 'unread') matchStatus = Number(c.unread) > 0;
      else if (filterStatus === 'ai') matchStatus = !needsHuman && st !== 'RESOLVED';
      else if (filterStatus === 'human') matchStatus = needsHuman;
      else if (filterStatus === 'resolved') matchStatus = st === 'RESOLVED';
      else if (filterStatus === 'open') matchStatus = st !== 'RESOLVED';

      return matchSearch && matchChannel && matchStatus;
    });
  }, [conversations, searchQuery, filterChannel, filterStatus]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    const text = replyText.trim();
    if (!text || !activeConv || sending) return;

    setSending(true);
    setSendError(null);
    const optimisticMsg = {
      id: `m-opt-${Date.now()}`,
      sender: 'agent',
      sender_name: user?.name || 'Agent',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      is_ai: false,
    };

    // Optimistic update
    setConversations(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...(c.messages || []), optimisticMsg], lastActivity: 'Just now' }
        : c
    ));
    setReplyText('');
    setShowAiPanel(false);

    try {
      const result = await conversationService.sendMessage(activeId, text, 'agent');
      // Replace with real messages from server
      if (result?.messages) {
        setConversations(prev => prev.map(c =>
          c.id === activeId ? { ...c, messages: result.messages, lastActivity: 'Just now' } : c
        ));
      }
    } catch (err) {
      setSendError(err.message || 'Failed to send. Tap to retry.');
      // Remove optimistic message
      setConversations(prev => prev.map(c =>
        c.id === activeId
          ? { ...c, messages: (c.messages || []).filter(m => m.id !== optimisticMsg.id) }
          : c
      ));
      setReplyText(text); // restore text so user can retry
    } finally {
      setSending(false);
    }
  };

  // Keyboard handler
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Apply AI suggestion ────────────────────────────────────────────────────
  const handleApplyAi = (suggestion) => {
    setReplyText(suggestion);
    setShowAiPanel(false);
    inputRef.current?.focus();
  };

  // ── Select conversation ────────────────────────────────────────────────────
  const handleSelectConv = async (id) => {
    setActiveId(id);
    setMobileChatOpen(true);
    setSendError(null);
    setShowAiPanel(false);

    // Mark as read
    const conv = conversations.find(c => c.id === id);
    if (conv && Number(conv.unread) > 0) {
      try {
        await conversationService.updateStatus(id, { unread: false });
        setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
      } catch { /* silent */ }
    }
  };

  // ── Resolve / Reopen ───────────────────────────────────────────────────────
  const handleResolve = async () => {
    if (!activeConv) return;
    const isResolved = activeConv.status === 'RESOLVED';
    const newStatus = isResolved ? 'ACTIVE' : 'RESOLVED';
    try {
      await conversationService.updateStatus(activeId, { status: newStatus });
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, status: newStatus } : c));
      setToast({ message: isResolved ? 'Conversation reopened.' : 'Conversation resolved.', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
    setActionMenuOpen(false);
  };

  // ── Toggle human handoff ───────────────────────────────────────────────────
  const handleToggleHandoff = async () => {
    if (!activeConv) return;
    try {
      const updated = await conversationService.toggleHandoff(activeId);
      if (updated) {
        setConversations(prev => prev.map(c => c.id === activeId ? { ...c, ...updated } : c));
      } else {
        await loadConversations(true);
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
    setActionMenuOpen(false);
  };

  const handleTakeOver = async () => {
    if (!activeConv) return;
    try {
      await conversationService.updateStatus(activeId, { status: 'NEEDS_HUMAN' });
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, status: 'NEEDS_HUMAN', needsHuman: true } : c));
      setToast({ message: 'You took over this conversation. AI Auto-Reply paused.', type: 'info' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
    setActionMenuOpen(false);
  };

  const handleHandBackToAi = async () => {
    if (!activeConv) return;
    try {
      await conversationService.updateStatus(activeId, { status: 'ACTIVE' });
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, status: 'ACTIVE', needsHuman: false, autoReplyBlocked: false } : c));
      setToast({ message: 'Handed back to AI. Autonomous auto-replies resumed.', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
    setActionMenuOpen(false);
  };

  const handleBlockAutoReply = () => {
    if (!activeConv) return;
    const isBlocked = activeConv.autoReplyBlocked;
    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, autoReplyBlocked: !isBlocked } : c));
    setToast({
      message: !isBlocked ? 'AI Auto-Reply blocked for this customer thread.' : 'AI Auto-Reply unblocked.',
      type: 'info'
    });
    setActionMenuOpen(false);
  };

  // ── Last customer message (for AI context) ─────────────────────────────────
  const lastCustomerMessage = useMemo(() => {
    if (!activeConv?.messages) return '';
    const msgs = [...activeConv.messages].reverse();
    const found = msgs.find(m => m.sender === 'customer');
    return found?.text || '';
  }, [activeConv]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 70px)',
      overflow: 'hidden',
      background: 'var(--bg-canvas)',
    }}>

      {/* ══ CONVERSATION LIST PANEL ══════════════════════════════════════════ */}
      <div style={{
        width: '340px',
        flexShrink: 0,
        borderRight: '1px solid var(--border-light)',
        display: mobileChatOpen ? 'none' : 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card)',
        // On desktop always show
      }}
        className="conv-list-panel" data-open={mobileChatOpen}
      >
        {/* List Header */}
        <div style={{
          padding: '1rem 1rem 0.75rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex', flexDirection: 'column', gap: '0.6rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Messages</h2>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                paddingLeft: '30px', paddingRight: '10px',
                height: '34px', fontSize: '0.8rem',
                background: 'var(--bg-subtle)', border: '1px solid var(--border-light)',
                borderRadius: '100px', outline: 'none', color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Channel filters */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'whatsapp', label: 'WA' },
              { key: 'instagram', label: 'IG' },
              { key: 'facebook', label: 'FB' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterChannel(f.key)}
                style={{
                  padding: '3px 8px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 600,
                  border: filterChannel === f.key ? '1px solid var(--olive-700)' : '1px solid var(--border-light)',
                  background: filterChannel === f.key ? 'rgba(74,90,40,0.12)' : 'transparent',
                  color: filterChannel === f.key ? 'var(--olive-600)' : 'var(--text-muted)',
                  cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >{f.label}</button>
            ))}
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', alignItems: 'center' }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'unread', label: 'Unread' },
              ...(filterStatus === 'human' ? [{ key: 'human', label: 'Needs Attention' }] : [])
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilterStatus(f.key)}
                style={{
                  padding: '2px 7px', borderRadius: '100px', fontSize: '0.68rem', fontWeight: 600,
                  border: filterStatus === f.key ? '1px solid var(--border-medium)' : '1px solid transparent',
                  background: filterStatus === f.key ? (f.key === 'human' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-subtle)') : 'transparent',
                  color: filterStatus === f.key ? (f.key === 'human' ? '#f59e0b' : 'var(--text-primary)') : 'var(--text-muted)',
                  cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >{f.label}</button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.8rem', margin: 0 }}>Loading conversations…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={28} style={{ opacity: 0.4, marginBottom: '0.6rem' }} />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>
                {searchQuery ? 'No conversations match your search.' : 'No conversations yet.'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', lineHeight: 1.4 }}>
                {searchQuery ? 'Try a different search term.' : 'Customer conversations will appear here.'}
              </p>
            </div>
          ) : (
            filtered.map(conv => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeId}
                onClick={() => handleSelectConv(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ══ CHAT AREA ════════════════════════════════════════════════════════ */}
      <div style={{
        flexGrow: 1, display: 'flex', flexDirection: 'column',
        minWidth: 0, overflow: 'hidden',
        // On mobile, show only when a chat is open
        ...(mobileChatOpen === false && { display: 'none' }),
      }}
        className="chat-area" data-open={mobileChatOpen}
      >
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '0 1.25rem',
              height: '60px',
              flexShrink: 0,
              borderBottom: '1px solid var(--border-light)',
              background: 'var(--bg-card)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                {/* Mobile back */}
                <button
                  onClick={() => setMobileChatOpen(false)}
                  className="mobile-back-btn"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', flexShrink: 0 }}
                >
                  <ArrowLeft size={20} />
                </button>

                <Avatar name={activeConv.customer_name || activeConv.customer?.name} size={36} online />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.925rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeConv.customer_name || activeConv.customer?.name || 'Customer'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ChannelBadge channel={activeConv.channel} compact />
                    {(activeConv.needsHuman || activeConv.status === 'NEEDS_HUMAN') && (
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>· Needs Human</span>
                    )}
                    {activeConv.status === 'RESOLVED' && (
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>· Resolved</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                {/* Header Actions (Section 11 Controls) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  {/* Quick Action Button: Take Over or Hand Back */}
                  {(activeConv.needsHuman || activeConv.status === 'NEEDS_HUMAN') ? (
                    <button
                      onClick={handleHandBackToAi}
                      title="Resume autonomous AI replies"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 800,
                        background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.35)',
                        color: '#4ade80', cursor: 'pointer',
                      }}
                    >
                      <Bot size={13} /> HAND BACK TO AI
                    </button>
                  ) : (
                    <button
                      onClick={handleTakeOver}
                      title="Pause AI and take over as human agent"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.72rem', fontWeight: 800,
                        background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.35)',
                        color: '#f59e0b', cursor: 'pointer',
                      }}
                    >
                      <UserCheck size={13} /> TAKE OVER
                    </button>
                  )}

                  {/* Customer info toggle */}
                  <button
                    onClick={() => { setShowCustomerPanel(s => !s); setMobileCustomerOpen(s => !s); }}
                    title="Customer details"
                    style={{
                      background: showCustomerPanel ? 'var(--bg-subtle)' : 'none',
                      border: '1px solid var(--border-light)', borderRadius: '8px',
                      padding: '0.3rem 0.5rem', cursor: 'pointer', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem',
                    }}
                  >
                    <User size={13} /> Info
                  </button>

                  {/* Action menu */}
                  <div style={{ position: 'relative' }} ref={actionMenuRef}>
                    <button
                      onClick={() => setActionMenuOpen(s => !s)}
                      style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.3rem 0.4rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
                    >
                      <MoreVertical size={15} />
                    </button>

                    {actionMenuOpen && (
                      <div style={{
                        position: 'absolute', top: '100%', right: 0, zIndex: 100, marginTop: '4px',
                        background: 'var(--bg-card)', border: '1px solid var(--border-medium)',
                        borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        minWidth: '200px', overflow: 'hidden',
                      }}>
                        {[
                          {
                            icon: <Bot size={14} color="#4ade80" />,
                            label: 'AI ON (Autonomous)',
                            action: handleHandBackToAi,
                          },
                          {
                            icon: <UserCheck size={14} color="#f59e0b" />,
                            label: 'AI OFF (Human Mode)',
                            action: handleTakeOver,
                          },
                          {
                            icon: <UserCheck size={14} color="#f59e0b" />,
                            label: 'TAKE OVER',
                            action: handleTakeOver,
                          },
                          {
                            icon: <Bot size={14} color="#4ade80" />,
                            label: 'HAND BACK TO AI',
                            action: handleHandBackToAi,
                          },
                          {
                            icon: <UserX size={14} color="#f87171" />,
                            label: activeConv.autoReplyBlocked ? 'UNBLOCK AUTO REPLY' : 'BLOCK AUTO REPLY',
                            action: handleBlockAutoReply,
                          },
                          {
                            icon: activeConv.status === 'RESOLVED' ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />,
                            label: activeConv.status === 'RESOLVED' ? 'Reopen Conversation' : 'Mark Resolved',
                            action: handleResolve,
                          },
                        ].map((item, i) => (
                          <button
                            key={i}
                            onClick={item.action}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                              padding: '0.65rem 1rem', background: 'none', border: 'none',
                              fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-primary)',
                              borderBottom: i < 5 ? '1px solid var(--border-light)' : 'none',
                              textAlign: 'left',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            {item.icon} {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Thread */}
            <div style={{
              flexGrow: 1, overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: '0.65rem',
              background: 'var(--bg-canvas)',
            }}>
              {(!activeConv.messages || activeConv.messages.length === 0) ? (
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <MessageSquare size={32} style={{ opacity: 0.25 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>No messages yet.</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.7 }}>Start the conversation below.</p>
                </div>
              ) : (
                activeConv.messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    customerName={activeConv.customer_name || activeConv.customer?.name || 'Customer'}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Error Banner */}
            {sendError && (
              <div style={{
                padding: '0.5rem 1.25rem',
                background: 'rgba(220,38,38,0.08)', borderTop: '1px solid rgba(220,38,38,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '0.78rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertCircle size={13} /> {sendError}
                </span>
                <button onClick={() => { setSendError(null); handleSend(); }}
                  style={{ fontSize: '0.75rem', color: '#dc2626', background: 'none', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer' }}>
                  Retry
                </button>
              </div>
            )}

            {/* Composer */}
            <div style={{
              borderTop: '1px solid var(--border-light)',
              background: 'var(--bg-card)',
              position: 'relative', flexShrink: 0,
            }}>
              {/* AI Suggest Panel */}
              {showAiPanel && (
                <AiSuggestPanel
                  convId={activeId}
                  lastCustomerMessage={lastCustomerMessage}
                  onApply={handleApplyAi}
                  onDismiss={() => setShowAiPanel(false)}
                />
              )}

              <form onSubmit={handleSend} style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                {/* AI Button */}
                <button
                  type="button"
                  onClick={() => setShowAiPanel(s => !s)}
                  title="AI Assist"
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: showAiPanel ? 'rgba(74,90,40,0.15)' : 'var(--bg-subtle)',
                    border: `1px solid ${showAiPanel ? 'var(--olive-600)' : 'var(--border-medium)'}`,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: showAiPanel ? 'var(--olive-600)' : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  <Sparkles size={16} />
                </button>

                {/* Text input */}
                <div style={{ flexGrow: 1, position: 'relative' }}>
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={replyText}
                    onChange={e => {
                      setReplyText(e.target.value);
                      // Auto-resize
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      activeConv.status === 'RESOLVED'
                        ? 'Conversation resolved — reopen to reply…'
                        : 'Type a message…'
                    }
                    disabled={activeConv.status === 'RESOLVED' || sending}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '0.55rem 0.85rem',
                      background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)',
                      borderRadius: '20px', outline: 'none',
                      fontSize: '0.875rem', lineHeight: 1.45,
                      color: 'var(--text-primary)', resize: 'none', overflowY: 'auto',
                      maxHeight: '120px', display: 'block',
                      opacity: (activeConv.status === 'RESOLVED' || sending) ? 0.6 : 1,
                    }}
                  />
                </div>

                {/* Send */}
                <button
                  type="submit"
                  disabled={!replyText.trim() || sending || activeConv.status === 'RESOLVED'}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: replyText.trim() && !sending && activeConv.status !== 'RESOLVED'
                      ? 'linear-gradient(135deg, var(--olive-700), var(--olive-900))'
                      : 'var(--bg-subtle)',
                    border: '1px solid var(--border-medium)',
                    cursor: replyText.trim() && !sending ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: replyText.trim() && !sending ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.15s', opacity: sending ? 0.6 : 1,
                  }}
                >
                  {sending
                    ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    : <Send size={15} />}
                </button>
              </form>

              {/* Keyboard hint */}
              <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Enter to send · Shift + Enter for new line
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div style={{
            flexGrow: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', textAlign: 'center', padding: '2rem',
          }}>
            <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Select a conversation
            </p>
          </div>
        )}
      </div>

      {/* ══ CUSTOMER PANEL ═══════════════════════════════════════════════════ */}
      {activeConv && showCustomerPanel && (
        <div className="customer-panel-desktop">
          <CustomerPanel
            conv={activeConv}
            onClose={() => setShowCustomerPanel(false)}
          />
        </div>
      )}

      {/* Mobile Customer Drawer */}
      {mobileCustomerOpen && activeConv && (
        <>
          <div
            onClick={() => setMobileCustomerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: '300px', zIndex: 201, background: 'var(--bg-card)',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.2s ease',
          }}>
            <CustomerPanel conv={activeConv} onClose={() => setMobileCustomerOpen(false)} />
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .customer-panel-desktop { display: flex; }

        @media (max-width: 1100px) {
          .customer-panel-desktop { display: none !important; }
        }

        @media (max-width: 768px) {
          .conv-list-panel {
            width: 100% !important;
            flex-grow: 1 !important;
            height: 100% !important;
          }
          .chat-area {
            width: 100% !important;
            flex-grow: 1 !important;
            height: 100% !important;
            background: #0B0F19 !important;
          }
          .chat-area[data-open="false"] {
            display: none !important;
          }
          .chat-area[data-open="true"] {
            display: flex !important;
          }
          .conv-list-panel[data-open="true"] {
            display: none !important;
          }
          .conv-list-panel[data-open="false"] {
            display: flex !important;
          }
          .mobile-back-btn {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .conv-list-panel { display: flex !important; width: 340px !important; }
          .chat-area { display: flex !important; position: static !important; }
          .mobile-back-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}
