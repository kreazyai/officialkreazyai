import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  MessageCircle,
  ShoppingBag,
  Camera,
  Users,
  HelpCircle,
  Zap,
  AlertCircle
} from 'lucide-react';
import { aiConfigService } from '../../services/api.js';

/* ─────────────────────────────────────────────────────────────────────────────
   KNOWLEDGE BASE — canned smart replies for integration-related topics
───────────────────────────────────────────────────────────────────────────── */
const KB = [
  {
    patterns: ['whatsapp', 'wa ', 'waba', 'business api'],
    reply:
      "**WhatsApp Business Integration**\n\nTo connect WhatsApp Business to KreazyAI:\n1. Go to **Integrations** in the sidebar\n2. Click the **WhatsApp Business** card\n3. Scan the QR code with your WhatsApp app\n\nYour AI agent will then handle customer messages 24/7 automatically. Need help with a specific step?",
  },
  {
    patterns: ['instagram', 'ig ', 'instagram dm', 'direct message'],
    reply:
      "**Instagram Direct Integration**\n\nTo connect Instagram DMs:\n1. Navigate to **Integrations → Instagram Direct**\n2. Scan the QR code with your Instagram Business account\n3. Grant the required permissions\n\nKreazyAI will then auto-reply to DMs, story mentions, and comments. Is there a specific feature you need help with?",
  },
  {
    patterns: ['facebook', 'messenger', 'fb ', 'page'],
    reply:
      "**Facebook Messenger Integration**\n\nTo connect Messenger to your Facebook Business Page:\n1. Open **Integrations → Facebook Messenger**\n2. Scan the QR code with your Facebook app\n3. Select your Business Page to authorize\n\nAll page inbox messages will then flow through KreazyAI for AI-powered responses. Would you like to know more?",
  },
  {
    patterns: ['shopify', 'shop ', 'ecommerce', 'e-commerce', 'store', 'cart', 'order'],
    reply:
      "**Shopify Integration**\n\nTo connect your Shopify store:\n1. Open **Integrations → Shopify Messaging**\n2. Scan the QR code with your Shopify Mobile app\n3. Authorize KreazyAI under Apps & Sales Channels\n\nThis enables automated order confirmations, shipping alerts, and cart recovery messages. Anything specific you'd like to set up?",
  },
  {
    patterns: ['qr', 'qr code', 'scan', 'connect'],
    reply:
      "**QR Code Connection**\n\nEach integration has a unique QR code for quick connection. Here's how:\n1. Go to **Integrations** in the sidebar\n2. Select the platform you want to connect\n3. Open that platform's app on your phone\n4. Use the app's camera/link device feature to scan the QR\n\nConnections are instant and secured with OAuth 2.0. Which platform are you trying to connect?",
  },
  {
    patterns: ['disconnect', 'unlink', 'remove', 'delete'],
    reply:
      "**Disconnecting an Integration**\n\nTo disconnect a channel:\n1. Go to **Integrations**\n2. Click on the connected channel card\n3. Scroll to the bottom and tap **Reconnect** to reset, or contact support to fully revoke access\n\nNote: Disconnecting stops all automated messages from that channel. Existing conversation history is preserved.",
  },
  {
    patterns: ['not working', 'broken', 'error', 'fail', 'issue', 'problem'],
    reply:
      "**Troubleshooting Integration Issues**\n\nCommon fixes:\n- **QR expired**: QR codes expire after 60 seconds — refresh and try again\n- **Permission denied**: Make sure you have Admin access to the Business account\n- **Already linked**: One account can only be linked to one KreazyAI workspace at a time\n\nIf the issue persists, try disconnecting and reconnecting the channel. Still stuck? I can escalate this to our support team.",
  },
  {
    patterns: ['hello', 'hi ', 'hey ', 'help', 'start', 'begin'],
    reply:
      "**Hello! I'm KreazyAI Assistant**\n\nI specialize in helping you set up and troubleshoot your integrations. Here's what I can help with:\n\n• **WhatsApp Business** — Connect & automate\n• **Facebook Messenger** — Page inbox automation\n• **Instagram Direct** — DM & story automation\n• **Shopify** — E-commerce messaging sync\n• **QR Code setup** — Step-by-step guidance\n\nJust ask me anything about connecting your channels!",
  },
  {
    patterns: ['price', 'cost', 'plan', 'billing', 'subscription'],
    reply:
      "**Pricing & Plans**\n\nAll integrations are included in your KreazyAI plan. There are no per-channel fees.\n\nFor detailed pricing information, visit the **Billing** section in Settings or check our Pricing page at kreazy.ai/pricing.\n\nWould you like help setting up an integration instead?",
  },
];

const SUGGESTIONS = [
  { icon: <MessageCircle size={14} />, text: 'How do I connect WhatsApp?' },
  { icon: <Camera size={14} />, text: 'Set up Instagram DMs' },
  { icon: <Users size={14} />, text: 'Facebook Messenger setup' },
  { icon: <ShoppingBag size={14} />, text: 'Connect my Shopify store' },
  { icon: <HelpCircle size={14} />, text: 'QR code not scanning' },
  { icon: <Zap size={14} />, text: 'Troubleshoot an integration' },
];

function getReply(input) {
  const lower = input.toLowerCase();
  for (const entry of KB) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      return entry.reply;
    }
  }
  return "I'm specialized in KreazyAI integration support. I can help you connect **WhatsApp Business**, **Facebook Messenger**, **Instagram Direct**, or **Shopify** to your workspace.\n\nCould you clarify which integration you need help with? Or try one of the quick questions below.";
}

/* ─────────────────────────────────────────────────────────────────────────────
   MARKDOWN-LITE RENDERER — bold + newlines only
───────────────────────────────────────────────────────────────────────────── */
function MiniMarkdown({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part === '\n') return <br key={i} />;
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   AI ASSISTANT PAGE — focused chatbot for integration support
───────────────────────────────────────────────────────────────────────────── */
export function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text:
        "**Hello! I'm KreazyAI Assistant**\n\nI specialize in helping you set up and troubleshoot your integrations. Here's what I can help with:\n\n• **WhatsApp Business** — Connect & automate\n• **Facebook Messenger** — Page inbox automation\n• **Instagram Direct** — DM & story automation\n• **Shopify** — E-commerce messaging sync\n• **QR Code setup** — Step-by-step guidance\n\nJust ask me anything about connecting your channels!",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const sendMessage = async (text) => {
    const trimmed = text?.trim() || input.trim();
    if (!trimmed || thinking) return;

    setInput('');
    setShowSuggestions(false);
    const userMsg = { id: Date.now(), sender: 'user', text: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    try {
      const history = messages
        .filter((m) => !m.isError)
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await aiConfigService.chat(trimmed, { history });
      const replyText = res?.reply || res?.data?.reply || res?.suggestion || 'No response received.';
      const provider = res?.provider || res?.data?.provider || '';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: replyText,
          time: new Date(),
          provider,
        },
      ]);
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errMsg = err?.message || 'Failed to communicate with AI service.';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          isError: true,
          text: `Error: **Error:** ${errMsg}`,
          time: new Date(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleReset = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "**Hello! I'm KreazyAI Assistant**\n\nI'm here to help you connect and troubleshoot your integrations. Which platform would you like help with today?",
        time: new Date(),
      },
    ]);
    setInput('');
    setShowSuggestions(true);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="dashboard-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 90px)',
        padding: 0,
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-2xl)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(214, 229, 215, 0.04)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(189, 213, 148, 0.15)',
              border: '1px solid rgba(189, 213, 148, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--color-accent-lime)',
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>KreazyAI Assistant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-accent-lime)', fontWeight: 600 }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-accent-lime)', boxShadow: '0 0 8px var(--color-accent-lime)' }} />
              Online • Retail & Channel Automation Specialist
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleReset}
            title="Start new conversation"
            className="capsule-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(214, 229, 215, 0.08)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-capsule)',
              padding: '0.5rem 1.1rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.15s ease',
            }}
          >
            <RefreshCw size={13} /> New Chat
          </button>
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          background: 'transparent',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '0.75rem',
              alignItems: 'flex-end',
            }}
          >
            {/* Bot avatar */}
            {msg.sender === 'bot' && (
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: msg.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(189, 213, 148, 0.15)',
                  border: msg.isError ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(189, 213, 148, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginBottom: '18px',
                  color: msg.isError ? '#f87171' : 'var(--color-accent-lime)',
                }}
              >
                {msg.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
              </div>
            )}

            <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  padding: '0.9rem 1.25rem',
                  borderRadius: msg.sender === 'user' ? '22px 22px 4px 22px' : '22px 22px 22px 4px',
                  background:
                    msg.isError
                      ? 'rgba(239, 68, 68, 0.12)'
                      : msg.sender === 'user'
                      ? 'rgba(189, 213, 148, 0.18)'
                      : 'rgba(214, 229, 215, 0.08)',
                  color: msg.isError ? '#fca5a5' : 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  border:
                    msg.isError
                      ? '1px solid rgba(239, 68, 68, 0.35)'
                      : msg.sender === 'user'
                      ? '1px solid rgba(189, 213, 148, 0.35)'
                      : '1px solid var(--border-subtle)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                }}
              >
                <MiniMarkdown text={msg.text} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px' }}>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatTime(msg.time)}
                </span>
                {msg.provider && (
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(255, 255, 255, 0.06)', padding: '1px 5px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                    {msg.provider}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {thinking && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(189, 213, 148, 0.15)',
                border: '1px solid rgba(189, 213, 148, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--color-accent-lime)',
              }}
            >
              <Bot size={16} />
            </div>
            <div
              style={{
                padding: '0.85rem 1.25rem',
                borderRadius: '22px 22px 22px 4px',
                background: 'rgba(214, 229, 215, 0.08)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '5px',
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--color-accent-lime)',
                    animation: `bounce 1.2s ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick suggestions */}
        {showSuggestions && messages.length <= 1 && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Quick prompts:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'rgba(214, 229, 215, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-capsule)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.825rem',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(189, 213, 148, 0.4)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'rgba(214, 229, 215, 0.12)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'rgba(214, 229, 215, 0.06)';
                  }}
                >
                  <span style={{ color: 'var(--color-accent-lime)' }}>{s.icon}</span> {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT BAR ── */}
      <div
        style={{
          flexShrink: 0,
          padding: '1.25rem 1.75rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'rgba(214, 229, 215, 0.04)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}
        >
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about integrations, WhatsApp QR pairing, or automation rules..."
              className="form-input"
              style={{
                width: '100%',
                paddingRight: '3.25rem',
                height: '48px',
                fontSize: '0.9rem',
                borderRadius: 'var(--radius-capsule)',
                background: 'rgba(214, 229, 215, 0.07)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                boxSizing: 'border-box',
              }}
            />
            <Sparkles
              size={17}
              color="var(--color-accent-lime)"
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                opacity: 0.8,
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background:
                input.trim() && !thinking
                  ? 'var(--color-accent-lime)'
                  : 'rgba(214, 229, 215, 0.08)',
              border: 'none',
              cursor: input.trim() && !thinking ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              boxShadow: input.trim() && !thinking ? '0 0 16px rgba(189, 213, 148, 0.35)' : 'none',
            }}
          >
            <Send size={18} color={input.trim() && !thinking ? '#142018' : 'var(--text-muted)'} />
          </button>
        </form>
        <p style={{ margin: '8px 0 0', fontSize: '0.725rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          KreazyAI Copilot • Multi-channel Grounded Automation • Official Meta Cloud API
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
