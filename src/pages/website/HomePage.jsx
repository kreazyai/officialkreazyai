import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  MessageSquare, 
  ShoppingBag, 
  Bot, 
  Layers, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  RefreshCw,
  Users
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { HeroDashboardPreview } from '../../components/website/HeroDashboardPreview';

export function HomePage({ onNavigate }) {
  return (
    <div>
      {/* -------------------------------------------------------------
          1. HERO SECTION
          ------------------------------------------------------------- */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-badge-wrap">
            <span className="eyebrow">
              <Sparkles size={14} /> AI-Powered Commerce Automation for Retailers
            </span>
          </div>

          <h1 className="hero-title">
            AI-powered automation for <span className="highlight">modern businesses</span>.
          </h1>

          <p className="hero-subtitle">
            KreazyAI turns social channels into high-converting storefronts. Automate customer conversations, 
            instant catalog sales, order tracking, and day-to-day operations across WhatsApp, Instagram, and Facebook.
          </p>

          <div className="hero-cta-group">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => onNavigate('book-demo')}
            >
              Book a Demo
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => onNavigate('signup')}
              iconRight={ArrowRight}
            >
              Get Started Free
            </Button>
          </div>

          {/* Interactive Hero Product Interface Preview */}
          <HeroDashboardPreview onExploreApp={() => onNavigate('dashboard')} />
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. SOCIAL PROOF / TRUST STRIP
          ------------------------------------------------------------- */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-title">
            Engineered for modern commerce across official Meta Cloud APIs & platforms
          </div>

          <div className="channels-strip">
            <div className="channel-pill">
              <span className="status-dot active"></span>
              <span>WhatsApp Cloud API</span>
            </div>
            <div className="channel-pill">
              <span className="status-dot active"></span>
              <span>Instagram Direct Messaging</span>
            </div>
            <div className="channel-pill">
              <span className="status-dot active"></span>
              <span>Facebook Messenger</span>
            </div>
            <div className="channel-pill">
              <span className="status-dot active"></span>
              <span>Shopify & WooCommerce Catalog Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. PROBLEM → SOLUTION SECTION
          ------------------------------------------------------------- */}
      <section className="problem-solution-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">The Commerce Reality</span>
            <h2>Why manual social commerce breaks at scale</h2>
            <p>
              Growing retail brands receive hundreds of inquiries every week across multiple apps. 
              Traditional support teams struggle to respond in real-time, resulting in lost revenue.
            </p>
          </div>

          <div className="ps-grid">
            {/* Common Business Problems */}
            <div className="ps-column pain-points">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <span className="badge badge-error">The Problem</span>
                <h3 style={{ fontSize: '1.25rem' }}>Fragmented Manual Operations</h3>
              </div>

              <div className="ps-card-item">
                <div className="ps-icon-wrap" style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)' }}>
                  <XCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Slow Response Times & Midnight Drop-offs</h4>
                  <p style={{ fontSize: '0.875rem' }}>Customers message when ready to buy. Waiting 45 minutes for human replies kills purchase intent.</p>
                </div>
              </div>

              <div className="ps-card-item">
                <div className="ps-icon-wrap" style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)' }}>
                  <XCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Repetitive Sizing & Stock Questions</h4>
                  <p style={{ fontSize: '0.875rem' }}>Staff spend 70% of their workday answering the same questions about dimensions, availability, and return policies.</p>
                </div>
              </div>

              <div className="ps-card-item">
                <div className="ps-icon-wrap" style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)' }}>
                  <XCircle size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Manual Order Entry & Human Errors</h4>
                  <p style={{ fontSize: '0.875rem' }}>Manually copying delivery addresses and generating payment links introduces shipping delays and costly inventory mistakes.</p>
                </div>
              </div>
            </div>

            {/* KreazyAI Solution */}
            <div className="ps-column kreazy-solution">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                <span className="badge badge-olive">The KreazyAI Solution</span>
                <h3 style={{ fontSize: '1.25rem' }}>Autonomous Business Engine</h3>
              </div>

              <div className="ps-card-item">
                <div className="ps-icon-wrap" style={{ backgroundColor: 'var(--olive-50)', color: 'var(--olive-700)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Instant 2.4-Second Intelligent Responses</h4>
                  <p style={{ fontSize: '0.875rem' }}>Every customer on WhatsApp or Instagram receives accurate, brand-aligned answers 24/7 in their native language.</p>
                </div>
              </div>

              <div className="ps-card-item">
                <div className="ps-icon-wrap" style={{ backgroundColor: 'var(--olive-50)', color: 'var(--olive-700)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>In-Chat Catalog Checkout & Stock Reservation</h4>
                  <p style={{ fontSize: '0.875rem' }}>AI recommends items, checks live warehouse inventory, and generates secure direct payment links right inside the conversation.</p>
                </div>
              </div>

              <div className="ps-card-item">
                <div className="ps-icon-wrap" style={{ backgroundColor: 'var(--olive-50)', color: 'var(--olive-700)' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Guardrails & Seamless Human Handoff</h4>
                  <p style={{ fontSize: '0.875rem' }}>You retain full control. When a VIP customer asks for a human agent or custom dispute, the system notifies your team instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. HOW KREAZYAI WORKS (5-STEP WORKFLOW)
          ------------------------------------------------------------- */}
      <section className="workflow-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Implementation Workflow</span>
            <h2>How KreazyAI operates in your business</h2>
            <p>From initial channel connection to continuous sales automation in five structured steps.</p>
          </div>

          <div className="workflow-steps-grid">
            <div className="workflow-card">
              <span className="step-number">1</span>
              <h4 style={{ marginBottom: '8px' }}>Connect Your Channels</h4>
              <p style={{ fontSize: '0.85rem' }}>Authenticate your official WhatsApp Business, Instagram Professional account, and Facebook Pages in minutes.</p>
            </div>

            <div className="workflow-card">
              <span className="step-number">2</span>
              <h4 style={{ marginBottom: '8px' }}>Sync Product Catalog</h4>
              <p style={{ fontSize: '0.85rem' }}>Connect your Shopify/WooCommerce store or upload product SKUs, variants, prices, and high-res imagery.</p>
            </div>

            <div className="workflow-card">
              <span className="step-number">3</span>
              <h4 style={{ marginBottom: '8px' }}>Configure AI Rules</h4>
              <p style={{ fontSize: '0.85rem' }}>Define your brand tone, discount boundaries, return policies, FAQs, and human handoff escalation thresholds.</p>
            </div>

            <div className="workflow-card">
              <span className="step-number">4</span>
              <h4 style={{ marginBottom: '8px' }}>Autonomous Execution</h4>
              <p style={{ fontSize: '0.85rem' }}>KreazyAI handles inquiries, recommends products, processes transactions, and syncs order status around the clock.</p>
            </div>

            <div className="workflow-card">
              <span className="step-number">5</span>
              <h4 style={{ marginBottom: '8px' }}>Monitor & Optimize</h4>
              <p style={{ fontSize: '0.85rem' }}>Track revenue per channel, response velocity, customer satisfaction, and intervene whenever needed from one dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. CORE SAAS CAPABILITIES
          ------------------------------------------------------------- */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Enterprise Features</span>
            <h2>Built for reliability, speed, and real revenue</h2>
            <p>Everything your brand requires to automate omnichannel operations without losing customer trust.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Bot size={22} />
              </div>
              <h4>AI Sales Agent</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Consultative selling that understands customer intent, recommends complementary items, and closes purchases directly within WhatsApp or DMs.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <MessageSquare size={22} />
              </div>
              <h4>Unified Omni-Inbox</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Consolidate conversations from WhatsApp, Instagram, and Facebook into a single clean workspace with live customer profiles and history.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShoppingBag size={22} />
              </div>
              <h4>Autonomous Order Capture</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Automatically verify stock availability, collect delivery addresses, generate payment links, and write confirmed orders to your backend.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <ShieldCheck size={22} />
              </div>
              <h4>Guardrails & Safety Control</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Strict confidence thresholds and rule-based constraints ensure the AI never invents unsupported discounts, policies, or claims.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <TrendingUp size={22} />
              </div>
              <h4>Channel Revenue Analytics</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Detailed visibility into automated sales volume, conversation conversion rates, resolution times, and team workload savings.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Users size={22} />
              </div>
              <h4>Human-in-the-Loop Handoff</h4>
              <p style={{ fontSize: '0.875rem' }}>
                Seamless escalation mechanism allowing human operators to take over any conversation with full conversation context and AI draft assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. PRICING TEASER
          ------------------------------------------------------------- */}
      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--bg-subtle)', borderTop: '1px solid var(--border-medium)', borderBottom: '1px solid var(--border-medium)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ marginBottom: '1rem' }}>Transparent Investment</span>
          <h2 style={{ marginBottom: '1rem' }}>Predictable pricing built to scale with your volume</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Choose a plan tailored to your monthly order volume and channels. No surprise per-seat penalties.
          </p>

          <Button 
            variant="primary" 
            size="lg"
            onClick={() => onNavigate('pricing')}
            iconRight={ArrowRight}
          >
            Explore Plans & Pricing
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------------
          7. BOTTOM BANNER CTA
          ------------------------------------------------------------- */}
      <section style={{ padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div style={{ backgroundColor: 'var(--olive-900)', borderRadius: 'var(--radius-2xl)', padding: 'var(--space-16) var(--space-8)', textAlign: 'center', color: '#ffffff' }}>
            <h2 style={{ color: '#ffffff', marginBottom: '1rem', fontSize: '2.4rem' }}>
              Ready to automate your social commerce?
            </h2>
            <p style={{ color: 'var(--olive-200)', maxWidth: '640px', margin: '0 auto 2rem auto', fontSize: '1.15rem' }}>
              Join retailers scaling customer conversations and sales autonomously across WhatsApp, Instagram, and Facebook.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="subtle" 
                size="lg"
                onClick={() => onNavigate('book-demo')}
              >
                Schedule Live Product Demo
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => onNavigate('signup')}
              >
                Start Free 14-Day Trial
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
