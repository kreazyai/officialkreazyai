import React from 'react';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  MessageSquare,
  Bot,
  Zap,
  CheckCircle2,
  Headphones,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export function HowItWorksPage({ onNavigate }) {
  return (
    <div style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0 clamp(4rem, 8vw, 6rem) 0' }}>
      <div className="container">
        {/* Header — "Architecture & Workflow" eyebrow badge removed as requested */}
        <div style={{ maxWidth: '820px', margin: '0 auto clamp(2.5rem, 5vw, 4rem) auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.08, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
            How KreazyAI transforms your social commerce
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            An end-to-end overview of how customer inquiries become confirmed orders, synced inventory,
            and brand loyalty without manual bottlenecking.
          </p>
        </div>

        {/* Detailed 5-Step Deep Dive in Modular Elevated Boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 3vw, 2.5rem)' }}>

          {/* STEP 1 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">01</span>
                <span className="badge badge-mint">Multi-Channel Ingestion</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                Direct official Meta Cloud API connectivity
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                KreazyAI connects directly to Meta's enterprise graph endpoints for WhatsApp Business, Instagram Direct, and Facebook Pages.
                Incoming inquiries, comment queries, and ad-click messages stream into the system with sub-second latency.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Official Meta verified webhook handshake
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> No risky browser extensions or third-party wrappers
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Multi-agent queue with zero message dropping
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <span style={{ fontWeight: 650, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>WhatsApp Business Cloud</span>
                    <Badge variant="whatsapp">Connected • Active</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <span style={{ fontWeight: 650, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Instagram Professional Graph</span>
                    <Badge variant="instagram">Connected • Active</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <span style={{ fontWeight: 650, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Facebook Messenger Pages</span>
                    <Badge variant="facebook">Connected • Active</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">02</span>
                <span className="badge badge-mint">Catalog Grounding</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                Live store catalog &amp; warehouse synchronization
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                The AI does not guess inventory. It indexes your exact products, sizes, prices, variants, and stock counts.
                When a customer asks if an item is available, the agent checks real-time numbers before answering.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Real-time out-of-stock prevention
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Support for complex size &amp; color variant combinations
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Automatic image &amp; specification card previews
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Synchronized Store Knowledge</span>
                  <Badge variant="success">Auto-Sync On</Badge>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ padding: '0.65rem 0.85rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 550 }}>
                    <span>📦</span> 48 Products active in AI Knowledge Base
                  </div>
                  <div style={{ padding: '0.65rem 0.85rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 550 }}>
                    <span>📐</span> Sizing charts, dimensions &amp; materials indexed
                  </div>
                  <div style={{ padding: '0.65rem 0.85rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 550 }}>
                    <span>🚚</span> Shipping rates &amp; return policies loaded
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">03</span>
                <span className="badge badge-mint">Deterministic Decision Making</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                Commercial guardrails &amp; consultative sales
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                KreazyAI is not an unrestricted chatbot. It is a commercial agent governed by your policies.
                You define allowed discount percentages, refund limits, and escalation rules.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Never promises non-existent discounts or freebies
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Strict 85%+ semantic confidence thresholds
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Instant escalation when customer asks for a person
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} /> Safety Engine In Action
                </div>
                <div style={{ backgroundColor: '#092A20', border: '1px solid #144636', padding: '1.15rem', borderRadius: '10px', fontSize: '0.825rem', lineHeight: 1.7, color: '#E8F5EE', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#A5F052' }}>IF</span> customer_intent == <span style={{ color: '#DDF7E9' }}>"request_discount"</span> <span style={{ color: '#A5F052' }}>AND</span> hesitating:<br />
                  &nbsp;&nbsp;<span style={{ color: '#6EE7B7' }}>OFFER</span> max_discount(10%)<br />
                  <span style={{ color: '#A5F052' }}>ELSE IF</span> sentiment == <span style={{ color: '#DDF7E9' }}>"frustrated"</span>:<br />
                  &nbsp;&nbsp;<span style={{ color: '#6EE7B7' }}>ESCALATE_TO_HUMAN</span>(queue=<span style={{ color: '#DDF7E9' }}>"VIP_Support"</span>)
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">04</span>
                <span className="badge badge-mint">In-Chat Order Capture</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                Frictionless in-chat checkout &amp; address collection
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Stop losing customers to drop-offs on external websites. KreazyAI collects recipient names, phone numbers, delivery addresses, and payment preferences directly inside the chat window.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Full support for Cash on Delivery (COD) &amp; mobile payments
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Instant order recap &amp; confirmation slips sent in chat
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Meta Conversions API (CAPI) purchase event firing
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Live Order Receipt</span>
                  <Badge variant="success">Confirmed #KZ-8291</Badge>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Customer</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>Sadat Sakib</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Phone</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>+880 1712-345678</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Delivery Location</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>Dhanmondi, Dhaka</strong>
                  </div>
                  <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--green)' }}>
                    <span>Total (COD)</span>
                    <span>৳1,490</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">05</span>
                <span className="badge badge-mint">Unified Team Control</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                Real-time dashboard telemetry &amp; 1-click takeover
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every conversation, captured lead, and confirmed sale syncs instantly to your merchant portal. Staff can monitor chats live, inspect AI draft replies, and step in anytime with a single click.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Unified omnichannel inbox (WhatsApp, IG, Messenger)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> Real-time courier dispatch webhook triggers
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> 1-click human agent takeover preserves full chat history
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Operator Console</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: 'var(--mint-soft)', padding: '2px 8px', borderRadius: '4px' }}>Live Sync</span>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Active Social Channels</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>3 Connected</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Average Reply Latency</span>
                    <strong style={{ color: 'var(--green)' }}>1.2s</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Human Escalation Queue</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>0 Pending (Clean)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CTA Box */}
        <div style={{
          background: 'linear-gradient(135deg, #092A20 0%, #103B2E 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
          textAlign: 'center',
          color: '#FFFFFF',
          marginTop: 'clamp(3rem, 6vw, 5rem)',
          boxShadow: '0 24px 60px rgba(9, 42, 32, 0.25)',
          border: '1px solid rgba(165, 240, 82, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 850, letterSpacing: '-0.035em', marginBottom: '0.85rem', color: '#FFFFFF' }}>
            Ready to automate your social commerce?
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.75rem auto', color: 'rgba(255, 255, 255, 0.85)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.6 }}>
            Start your 7-day free trial now. Connect WhatsApp, Instagram, and Messenger in under 5 minutes.
          </p>
          <Button variant="primary" size="lg" onClick={() => onNavigate('signup')} iconRight={ArrowRight}>
            Experience The Workflow Free
          </Button>
        </div>

      </div>
    </div>
  );
}
