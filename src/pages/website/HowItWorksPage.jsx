import React from 'react';
import { 
  Network, 
  Database, 
  Sliders, 
  Cpu, 
  BarChart3, 
  ArrowRight, 
  Check, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export function HowItWorksPage({ onNavigate }) {
  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="eyebrow">Architecture & Workflow</span>
          <h1>How KreazyAI transforms your social commerce</h1>
          <p>
            An end-to-end overview of how customer inquiries become confirmed orders, synced inventory, 
            and brand loyalty without manual bottlenecking.
          </p>
        </div>

        {/* Detailed 5-Step Deep Dive */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)', marginTop: 'var(--space-12)' }}>
          
          {/* STEP 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>01</span>
                <span className="badge badge-olive">Multi-Channel Ingestion</span>
              </div>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '1rem' }}>Direct official Meta Cloud API connectivity</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>
                KreazyAI connects directly to Meta's enterprise graph endpoints for WhatsApp Business, Instagram Direct, and Facebook Pages. 
                Incoming inquiries, comment queries, and ad-click messages stream into the system with sub-second latency.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--olive-700)" /> Official Meta verified webhook handshake
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--olive-700)" /> No risky browser extensions or third-party wrappers
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--olive-700)" /> Multi-agent queue with zero message dropping
                </li>
              </ul>
            </div>
            <div className="card" style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-8)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 600 }}>WhatsApp Business Cloud</span>
                  <Badge variant="whatsapp">Connected • Active</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 600 }}>Instagram Professional Graph</span>
                  <Badge variant="instagram">Connected • Active</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontWeight: 600 }}>Facebook Messenger Pages</span>
                  <Badge variant="facebook">Connected • Active</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
            <div className="card" style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-8)', order: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>02</span>
                <span className="badge badge-olive">Catalog Grounding</span>
              </div>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '1rem' }}>Live store catalog & warehouse synchronization</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>
                The AI does not guess inventory. It indexes your exact products, sizes, prices, variants, and stock counts. 
                When a customer asks if an item is available, the agent checks real-time numbers before answering.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--bright-olive)" /> Real-time out-of-stock prevention
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--bright-olive)" /> Support for complex size/color variant combinations
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--bright-olive)" /> Automatic image & specification previews
                </li>
              </ul>
            </div>
            <div style={{ order: 1 }}>
              <div style={{ backgroundColor: 'var(--bg-canvas-alt)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Synchronized Store Knowledge</span>
                  <Badge variant="success">Auto-Sync On</Badge>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                    📦 48 Products active in AI Knowledge Base
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                    📐 Sizing charts & materials indexed
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-medium)' }}>
                    🚚 Shipping & return policies loaded
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-12)', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>03</span>
                <span className="badge badge-olive">Deterministic Decision Making</span>
              </div>
              <h2 style={{ fontSize: '1.85rem', marginBottom: '1rem' }}>Commercial guardrails & consultative sales</h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>
                KreazyAI is not an unrestricted chatbot. It is a commercial agent governed by your policies. 
                You define allowed discount percentages, refund limits, and escalation rules.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--olive-700)" /> Never promises non-existent discounts
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--olive-700)" /> Strict 85%+ confidence thresholds
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <Check size={16} color="var(--olive-700)" /> Instant escalation when customer asks for a person
                </li>
              </ul>
            </div>
            <div className="card" style={{ backgroundColor: 'var(--olive-900)', color: '#ffffff', padding: 'var(--space-8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--olive-200)' }}>
                <ShieldCheck size={18} /> Safety Engine In Action
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <code>
                  IF customer_intent == "request_discount" AND hesitating == true:<br />
                  &nbsp;&nbsp;OFFER max_discount(10%)<br />
                  ELSE IF inquiry_sentiment == "frustrated":<br />
                  &nbsp;&nbsp;ESCALATE_TO_HUMAN(queue="VIP_Support")
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 'var(--space-16)' }}>
          <Button variant="primary" size="lg" onClick={() => onNavigate('signup')} iconRight={ArrowRight}>
            Experience The Workflow Free
          </Button>
        </div>
      </div>
    </div>
  );
}
