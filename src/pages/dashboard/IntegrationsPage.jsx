import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Wifi,
  QrCode,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
  ChevronRight,
  X,
  Info
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   INTEGRATION DATA
   Each platform has a unique color palette, description, QR deep-link, and steps
───────────────────────────────────────────────────────────────────────────── */
const INTEGRATIONS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    tagline: 'Automate customer conversations on WhatsApp',
    description:
      'Connect your WhatsApp Business account to enable AI-powered customer support, automated order updates, and two-way messaging at scale.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
        <circle cx="16" cy="16" r="16" fill="#25D366" />
        <path
          d="M22.5 9.5A9 9 0 0 0 7.1 20.1L6 26l5.9-1.6a9 9 0 1 0 10.6-14.9z"
          fill="#fff"
        />
        <path
          d="M20.5 18.8c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.1-.3.2-.5 0-.2 0-.4-.1-.5l-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4C11 12.1 10 13 10 14.8c0 1.8 1.3 3.5 1.5 3.7.2.2 2.5 3.9 6.2 5.4 3.6 1.5 3.6 1 4.3.9.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8-.1-.1-.3-.2-.6-.3l.4.1z"
          fill="#25D366"
        />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    softBg: 'rgba(37,211,102,0.08)',
    borderColor: 'rgba(37,211,102,0.25)',
    accentColor: '#25D366',
    darkAccent: '#128C7E',
    category: 'Messaging',
    qrValue: 'https://wa.me/qr/KREAZY-BUSINESS-CONNECT',
    steps: [
      'Open WhatsApp on your phone',
      'Tap ⋮ (More) → Linked Devices',
      'Tap "Link a Device" and scan the QR code',
      'Your KreazyAI workspace will connect instantly',
    ],
    features: ['Automated replies', 'Order notifications', 'Catalog sharing', 'AI Copilot 24/7'],
    stats: { messages: '10K+', response: '<2s', uptime: '99.9%' },
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    tagline: 'Engage customers through Facebook Pages',
    description:
      'Integrate Messenger to handle customer inquiries from your Facebook Business Page with intelligent AI automation and human handoff.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
        <circle cx="16" cy="16" r="16" fill="#0084FF" />
        <path
          d="M16 7C11 7 7 10.7 7 15.3c0 2.8 1.4 5.3 3.7 6.9v3.3l3.2-1.8c.9.2 1.8.4 2.8.4 5 0 9-3.7 9-8.3S21 7 16 7zm.9 11.2l-2.3-2.4-4.4 2.4 4.8-5.1 2.3 2.4 4.4-2.4-4.8 5.1z"
          fill="#fff"
        />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #0084FF 0%, #0057B3 100%)',
    softBg: 'rgba(0,132,255,0.08)',
    borderColor: 'rgba(0,132,255,0.25)',
    accentColor: '#0084FF',
    darkAccent: '#0057B3',
    category: 'Social Messaging',
    qrValue: 'https://m.me/KreazyAIBusiness',
    steps: [
      'Open Facebook on your phone',
      'Go to your Facebook Business Page',
      'Navigate to Settings → Linked Accounts',
      'Scan the QR code to authorize KreazyAI',
    ],
    features: ['Page inbox automation', 'Lead capture', 'Broadcast messages', 'Comment replies'],
    stats: { messages: '8K+', response: '<3s', uptime: '99.8%' },
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    tagline: 'Automate DMs and story replies on Instagram',
    description:
      'Connect Instagram Direct Messages to let KreazyAI handle customer inquiries, product questions, and story interactions automatically.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
        <defs>
          <linearGradient id="ig-grad" x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="25%" stopColor="#FCAF45" />
            <stop offset="50%" stopColor="#F77737" />
            <stop offset="75%" stopColor="#C13584" />
            <stop offset="100%" stopColor="#833AB4" />
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#ig-grad)" />
        <rect x="9" y="9" width="14" height="14" rx="4" stroke="#fff" strokeWidth="1.5" fill="none" />
        <circle cx="16" cy="16" r="3.5" stroke="#fff" strokeWidth="1.5" fill="none" />
        <circle cx="21" cy="11" r="1" fill="#fff" />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #833AB4 0%, #C13584 50%, #F77737 100%)',
    softBg: 'rgba(193,53,132,0.08)',
    borderColor: 'rgba(193,53,132,0.25)',
    accentColor: '#C13584',
    darkAccent: '#833AB4',
    category: 'Social DMs',
    qrValue: 'https://ig.me/m/kreazy.ai',
    steps: [
      'Open Instagram on your phone',
      'Go to your Instagram Business profile',
      'Tap Settings → Creator Tools → Linked Accounts',
      'Scan the QR code to authorize KreazyAI',
    ],
    features: ['DM automation', 'Story reply bots', 'Product tag responses', 'Follower engagement'],
    stats: { messages: '6K+', response: '<4s', uptime: '99.7%' },
  },
  {
    id: 'shopify',
    name: 'Shopify Messaging',
    tagline: 'Sync your Shopify store for seamless commerce',
    description:
      'Connect Shopify to enable automated order confirmations, shipping updates, abandoned cart recovery, and product catalog sync via messaging.',
    icon: (
      <svg viewBox="0 0 32 32" fill="none" width="36" height="36">
        <circle cx="16" cy="16" r="16" fill="#96BF48" />
        <path
          d="M22.2 9.7c0 0-.1-.1-.3-.1s-2.1-.4-2.1-.4-.4-.4-.6-.6V24l5.4-1.2c0 0-2.3-12.7-2.4-13.1zM19.2 9c-.1-.3-1-2.1-2.7-2.1-0.1 0-.2 0-.3 0-.1-.1-.5-.4-1-.4-2.6 0-3.8 3.2-4.2 4.9l-2.5.8.9 12.3 8.4-1.5L19.2 9zm-3.3-.3c-.5 0-.9.1-1.3.3.3-1 .9-2.4 2-2.4.3 0 .5.1.7.3-.6.5-1.1 1.1-1.4 1.8z"
          fill="#fff"
        />
      </svg>
    ),
    gradient: 'linear-gradient(135deg, #96BF48 0%, #5E8E3E 100%)',
    softBg: 'rgba(150,191,72,0.08)',
    borderColor: 'rgba(150,191,72,0.25)',
    accentColor: '#96BF48',
    darkAccent: '#5E8E3E',
    category: 'E-Commerce',
    qrValue: 'https://apps.shopify.com/kreazy-ai-messaging',
    steps: [
      'Open Shopify on your phone or desktop',
      'Go to Apps → Browse App Store',
      'Search "KreazyAI" or scan the QR code',
      'Install and authorize KreazyAI to your store',
    ],
    features: ['Order sync', 'Cart recovery', 'Inventory alerts', 'Shipping updates'],
    stats: { messages: '15K+', response: '<1s', uptime: '99.9%' },
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   QR CODE COMPONENT  (pure SVG — no external lib needed)
   Generates a visual QR-style pattern for display; in production you'd use
   a real QR library like `qrcode.react`
───────────────────────────────────────────────────────────────────────────── */
function QRCodeDisplay({ value, accentColor, size = 180 }) {
  // Build a deterministic pattern from the value string
  const cells = 25;
  const cellSize = size / cells;

  const hash = (str) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return h;
  };

  const isBlack = (r, c) => {
    // Fixed finder patterns (top-left, top-right, bottom-left)
    const inFinder = (row, col, br, bc) =>
      row >= br && row <= br + 6 && col >= bc && col <= bc + 6;
    if (
      inFinder(r, c, 0, 0) ||
      inFinder(r, c, 0, cells - 7) ||
      inFinder(r, c, cells - 7, 0)
    ) {
      const dr0 = Math.abs(r - 0), dc0 = Math.abs(c - 0);
      const dr1 = Math.abs(r - 0), dc1 = Math.abs(c - (cells - 7));
      const dr2 = Math.abs(r - (cells - 7)), dc2 = Math.abs(c - 0);
      const inBox = (dr, dc, size) => dr <= size && dc <= size;

      for (const [dr, dc] of [[dr0, dc0], [dr1, dc1], [dr2, dc2]]) {
        if (inBox(dr, dc, 6)) {
          if (inBox(dr, dc, 0) || (inBox(dr, dc, 4) && !inBox(dr, dc, 3)) || inBox(dr, dc, 2))
            return true;
          return false;
        }
      }
    }
    // Data cells — pseudo-random based on value hash
    const seed = hash(value + r * 100 + c);
    return (seed & 1) === 1;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill="#fff" rx="8" />
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) =>
          isBlack(r, c) ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#1a1a1a"
            />
          ) : null
        )
      )}
      {/* Center brand logo area */}
      <rect x={size / 2 - 18} y={size / 2 - 18} width={36} height={36} fill="#fff" rx="4" />
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill={accentColor}
        fontFamily="system-ui, sans-serif"
      >
        KZ
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   INTEGRATION DETAIL PAGE
───────────────────────────────────────────────────────────────────────────── */
function IntegrationDetailPage({ integration, onBack }) {
  const [step, setStep] = useState(0); // 0 = overview, 1 = scanning, 2 = connected
  const [scanning, setScanning] = useState(false);

  const handleSimulateConnect = () => {
    setScanning(true);
    setStep(1);
    setTimeout(() => {
      setStep(2);
      setScanning(false);
    }, 3000);
  };

  return (
    <div className="dashboard-content" style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontWeight: 600,
          padding: '0.5rem 0',
          marginBottom: '1.5rem',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ArrowLeft size={16} /> Back to Integrations
      </button>

      {/* Header Banner */}
      <div
        style={{
          background: integration.gradient,
          borderRadius: '16px',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '50%',
          }}
        />
        <div style={{ flexShrink: 0 }}>{integration.icon}</div>
        <div style={{ flexGrow: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, letterSpacing: '0.1em', marginBottom: '4px' }}>
            {integration.category}
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800 }}>{integration.name}</h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>{integration.tagline}</p>
        </div>

        {step === 2 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '100px',
              padding: '0.5rem 1rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              backdropFilter: 'blur(8px)',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={16} /> Connected
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '100px',
              padding: '0.5rem 1rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            <Wifi size={14} /> Not Connected
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {[
          { label: 'Messages Handled', value: integration.stats.messages },
          { label: 'Avg Response Time', value: integration.stats.response },
          { label: 'Uptime SLA', value: integration.stats.uptime },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${integration.borderColor}`,
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: integration.accentColor }}>
              {s.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: QR + Steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* QR Code Panel */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: `1px solid ${integration.borderColor}`,
            borderRadius: '16px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
            <QrCode size={18} color={integration.accentColor} />
            Scan to Connect
          </div>

          {/* QR code with scanning animation */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                inset: '-8px',
                borderRadius: '16px',
                background: integration.softBg,
                border: `2px solid ${integration.borderColor}`,
              }}
            />
            <div
              style={{
                position: 'relative',
                padding: '12px',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              <QRCodeDisplay
                value={integration.qrValue}
                accentColor={integration.accentColor}
                size={170}
              />
              {scanning && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `${integration.accentColor}22`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '3px',
                      background: integration.accentColor,
                      position: 'absolute',
                      animation: 'scanLine 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              )}
              {step === 2 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.92)',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <CheckCircle2 size={40} color={integration.accentColor} />
                  <span style={{ fontWeight: 700, color: integration.darkAccent }}>Connected!</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
              Point your {integration.name} app camera at this QR code to connect instantly.
            </p>

            {step < 2 ? (
              <button
                onClick={handleSimulateConnect}
                disabled={scanning}
                style={{
                  background: integration.gradient,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: scanning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto',
                  opacity: scanning ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {scanning ? (
                  <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Scanning…</>
                ) : (
                  <><Smartphone size={14} /> Simulate Connection</>
                )}
              </button>
            ) : (
              <button
                onClick={() => setStep(0)}
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  padding: '0.6rem 1.25rem',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '0 auto',
                }}
              >
                <RefreshCw size={14} /> Reconnect
              </button>
            )}
          </div>
        </div>

        {/* Steps Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* How to connect */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: '16px',
              padding: '1.5rem',
              flexGrow: 1,
            }}
          >
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700 }}>
              How to Connect
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {integration.steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: step === 2 ? integration.softBg : i === 0 ? integration.softBg : 'var(--bg-subtle)',
                      border: `1.5px solid ${step === 2 || i === 0 ? integration.borderColor : 'var(--border-light)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: step === 2 ? integration.accentColor : i === 0 ? integration.accentColor : 'var(--text-muted)',
                    }}
                  >
                    {step === 2 ? '✓' : i + 1}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: '3px' }}>
                    {s}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div
            style={{
              background: integration.softBg,
              border: `1px solid ${integration.borderColor}`,
              borderRadius: '16px',
              padding: '1.25rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: integration.darkAccent, marginBottom: '0.75rem' }}>
              What you unlock
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {integration.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Zap size={12} color={integration.accentColor} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description + Security Note */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Info size={15} color="var(--text-muted)" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>About this Integration</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {integration.description}
          </p>
        </div>
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Shield size={15} color="#16a34a" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Security</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            All connections use OAuth 2.0 and end-to-end encryption. Tokens are stored in encrypted vaults and never exposed.
          </p>
        </div>
      </div>

      {/* Scan line animation */}
      <style>{`
        @keyframes scanLine {
          0% { top: 12px; }
          50% { top: calc(100% - 15px); }
          100% { top: 12px; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN INTEGRATIONS LIST PAGE
───────────────────────────────────────────────────────────────────────────── */
export function IntegrationsPage() {
  const [activeIntegration, setActiveIntegration] = useState(null);
  const [connectedIds, setConnectedIds] = useState(['whatsapp']);

  if (activeIntegration) {
    return (
      <IntegrationDetailPage
        integration={activeIntegration}
        onBack={() => setActiveIntegration(null)}
      />
    );
  }

  return (
    <div className="dashboard-content">
      {/* Page Header */}
      <div className="page-title-row" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Channel Integrations</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Connect your messaging platforms and e-commerce channels to KreazyAI.
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(22,163,74,0.1)',
            border: '1px solid rgba(22,163,74,0.25)',
            borderRadius: '100px',
            padding: '0.45rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#16a34a',
          }}
        >
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16a34a' }} />
          {connectedIds.length} of {INTEGRATIONS.length} Connected
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {INTEGRATIONS.map((integration) => {
          const isConnected = connectedIds.includes(integration.id);
          return (
            <div
              key={integration.id}
              onClick={() => setActiveIntegration(integration)}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isConnected ? integration.borderColor : 'var(--border-light)'}`,
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${integration.softBg}`;
                e.currentTarget.style.borderColor = integration.accentColor;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = isConnected ? integration.borderColor : 'var(--border-light)';
              }}
            >
              {/* Connected indicator strip */}
              {isConnected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: integration.gradient,
                  }}
                />
              )}

              {/* Card Top */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {integration.icon}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{integration.name}</div>
                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: integration.darkAccent,
                        background: integration.softBg,
                        borderRadius: '100px',
                        padding: '1px 8px',
                        marginTop: '2px',
                      }}
                    >
                      {integration.category}
                    </div>
                  </div>
                </div>

                {isConnected ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#16a34a',
                      background: 'rgba(22,163,74,0.1)',
                      borderRadius: '100px',
                      padding: '3px 10px',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                    Live
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-subtle)',
                      borderRadius: '100px',
                      padding: '3px 10px',
                      flexShrink: 0,
                    }}
                  >
                    Not Connected
                  </div>
                )}
              </div>

              {/* Description */}
              <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {integration.tagline}
              </p>

              {/* Features Preview */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {integration.features.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-subtle)',
                      borderRadius: '6px',
                      padding: '2px 8px',
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: integration.accentColor,
                  }}
                >
                  {isConnected ? 'Manage Connection' : 'Connect via QR Code'}
                </span>
                <ChevronRight size={16} color={integration.accentColor} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem 1.5rem',
          background: 'var(--bg-subtle)',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.83rem',
          color: 'var(--text-muted)',
        }}
      >
        <Shield size={16} />
        All integrations use OAuth 2.0 and encrypted webhook tunnels. Your business data is never stored on third-party servers.
      </div>
    </div>
  );
}
