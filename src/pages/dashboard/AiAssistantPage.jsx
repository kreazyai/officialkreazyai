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
  Zap
} from 'lucide-react';

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
      "**Hello! 👋 I'm KreazyAI Assistant**\n\nI specialize in helping you set up and troubleshoot your integrations. Here's what I can help with:\n\n• 📱 **WhatsApp Business** — Connect & automate\n• 💬 **Facebook Messenger** — Page inbox automation\n• 📸 **Instagram Direct** — DM & story automation\n• 🛍️ **Shopify** — E-commerce messaging sync\n• 🔗 **QR Code setup** — Step-by-step guidance\n\nJust ask me anything about connecting your channels!",
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
        "**Hello! 👋 I'm KreazyAI Assistant**\n\nI specialize in helping you set up and troubleshoot your integrations. Here's what I can help with:\n\n• 📱 **WhatsApp Business** — Connect & automate\n• 💬 **Facebook Messenger** — Page inbox automation\n• 📸 **Instagram Direct** — DM & story automation\n• 🛍️ **Shopify** — E-commerce messaging sync\n• 🔗 **QR Code setup** — Step-by-step guidance\n\nJust ask me anything about connecting your channels!",
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

  const sendMessage = (text) => {
    const trimmed = text?.trim() || input.trim();
    if (!trimmed || thinking) return;

    setInput('');
    setShowSuggestions(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: trimmed, time: new Date() },
    ]);

    setThinking(true);
    setTimeout(() => {
      const reply = getReply(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: reply, time: new Date() },
      ]);
      setThinking(false);
    }, 800 + Math.random() * 600);
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
        text: "**Hello! 👋 I'm KreazyAI Assistant**\n\nI'm here to help you connect and troubleshoot your integrations. Which platform would you like help with today?",
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
        height: 'calc(100vh - 80px)',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--olive-700) 0%, var(--olive-900) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>KreazyAI Assistant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
              Online • Integration Support Specialist
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleReset}
            title="Start new conversation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
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
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--bg-subtle)',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '0.65rem',
              alignItems: 'flex-end',
            }}
          >
            {/* Bot avatar */}
            {msg.sender === 'bot' && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--olive-700) 0%, var(--olive-900) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginBottom: '18px',
                }}
              >
                <Bot size={15} color="#fff" />
              </div>
            )}

            <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background:
                    msg.sender === 'user'
                      ? 'linear-gradient(135deg, var(--olive-700) 0%, var(--olive-900) 100%)'
                      : 'var(--bg-card)',
                  color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  border: msg.sender === 'bot' ? '1px solid var(--border-light)' : 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <MiniMarkdown text={msg.text} />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {formatTime(msg.time)}
              </span>
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {thinking && (
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-end' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--olive-700) 0%, var(--olive-900) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={15} color="#fff" />
            </div>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '16px 16px 16px 4px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                gap: '4px',
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
                    background: 'var(--text-muted)',
                    animation: `bounce 1.2s ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick suggestions */}
        {showSuggestions && messages.length <= 1 && (
          <div style={{ marginTop: '0.5rem' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Quick questions:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '100px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--olive-600)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {s.icon} {s.text}
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
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-card)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
        >
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about integrations, QR codes, or connection issues..."
              className="form-input"
              style={{
                width: '100%',
                paddingRight: '3rem',
                height: '44px',
                fontSize: '0.875rem',
                borderRadius: '12px',
                boxSizing: 'border-box',
              }}
            />
            <Sparkles
              size={16}
              color="var(--text-muted)"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background:
                input.trim() && !thinking
                  ? 'linear-gradient(135deg, var(--olive-700) 0%, var(--olive-900) 100%)'
                  : 'var(--bg-subtle)',
              border: 'none',
              cursor: input.trim() && !thinking ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
          >
            <Send size={16} color={input.trim() && !thinking ? '#fff' : 'var(--text-muted)'} />
          </button>
        </form>
        <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          KreazyAI Assistant • Integration & Technical Support • Powered by AI
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
