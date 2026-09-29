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
  Sparkles,
  ShoppingBag,
  MessageSquare,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { OrchestrationFlowPreview } from '../../components/website/OrchestrationFlowPreview';

export function HowItWorksPage({ onNavigate }) {
  const steps = [
    {
      num: '01',
      title: 'Multi-Channel Ingestion',
      subtitle: 'Official Meta Graph v20.0 Webhooks',
      desc: 'Connects directly to WhatsApp Cloud API, Instagram DM, and Messenger. Zero fragile scraping or risky unauthorized wrappers.',
      badge: 'Sub-second Latency'
    },
    {
      num: '02',
      title: 'Intent & Customer Understanding',
      subtitle: 'Natural Language Commercial Parsing',
      desc: 'Parses customer inquiries in Bengali, English, or Romanized text. Identifies product inquiries, sizing dilemmas, and order checks.',
      badge: 'Multilingual AI'
    },
    {
      num: '03',
      title: 'Vector Knowledge Retrieval',
      subtitle: 'Grounded Store Intelligence',
      desc: 'Retrieves return policies, store locations, fabric details, and delivery timelines directly from your indexed knowledge base.',
      badge: 'Zero Hallucinations'
    },
    {
      num: '04',
      title: 'Real-Time Inventory Verification',
      subtitle: 'Live SKU & Variant Checks',
      desc: 'Before recommending any item or confirming an order, the agent validates live stock numbers to prevent overselling.',
      badge: 'Real-Time Stock'
    },
    {
      num: '05',
      title: 'Autonomous Order Capture & Checkout',
      subtitle: 'In-Chat Payment Links & Invoicing',
      desc: 'Generates instant checkout summaries, validates customer phone numbers, delivery addresses, and payment methods.',
      badge: 'Instant Checkout'
    },
    {
      num: '06',
      title: 'Commerce & Courier Sync',
      subtitle: 'Shopify, WooCommerce & Logistics API',
      desc: 'Pushes confirmed orders into your store database and triggers automated courier pickup slips without manual data entry.',
      badge: 'Automated Dispatch'
    },
    {
      num: '07',
      title: 'Smart Human Handoff Guardrails',
      subtitle: 'Seamless Team Escalation',
      desc: 'When sentiment dips or high-value edge cases arise, the thread smoothly transfers to your human support queue with full context.',
      badge: 'Deterministic Safety'
    }
  ];

  return (
    <div className="home-page-root" style={{ padding: '3.5rem 0 6rem 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header-centered" style={{ marginBottom: '3.5rem' }}>
          <div className="section-eyebrow-pill">
            <span>ARCHITECTURE & WORKFLOW</span>
          </div>
          <h1 className="section-title-large">
            How KreazyAI transforms your social commerce
          </h1>
          <p className="section-subtitle-clean">
            An end-to-end overview of how casual customer conversations become confirmed orders, synced inventory, and lifelong brand loyalty.
          </p>
        </div>

        {/* 7-Step Vertical Process Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '860px', margin: '0 auto 5rem auto' }}>
          {steps.map((s, idx) => (
            <div 
              key={s.num} 
              className="winning-plan-card" 
              style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.75rem 2rem' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.15rem', flexShrink: 0 }}>
                {s.num}
              </div>

              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{s.title}</h3>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#F1F5F9', color: '#2563EB', border: '1px solid #E2E8F0' }}>
                    {s.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem' }}>
                  {s.subtitle}
                </div>
                <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: '#475569' }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Visual Node Orchestration Component */}
        <div style={{ marginBottom: '5rem' }}>
          <OrchestrationFlowPreview />
        </div>

        {/* CTA Strip */}
        <div style={{ background: '#080D1A', color: '#FFFFFF', borderRadius: '24px', padding: '3.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
            Ready to Connect Your Store Within 48 Hours?
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Book a personalized onboarding walkthrough to test real WhatsApp and Instagram message flows on your catalog.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="hero-get-started-btn"
              onClick={() => onNavigate('book-demo')}
            >
              <span>Book a Live Demo</span>
              <ChevronRight size={18} />
            </button>
            <button 
              type="button" 
              className="final-cta-secondary-btn"
              onClick={() => onNavigate('pricing')}
            >
              View Transparent Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
