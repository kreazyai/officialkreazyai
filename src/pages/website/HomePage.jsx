import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Bot,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Layers,
  BarChart3,
  Calendar,
  Send,
  Sliders,
  Check,
  Building,
  Mail,
  User,
  Phone
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { HeroProblemShowcase } from '../../components/website/HeroProblemShowcase';
import { IphoneIntegrationShowcase } from '../../components/website/IphoneIntegrationShowcase';
import { PricingTiersSection } from '../../components/website/PricingTiersSection';
import { leadService } from '../../services/api';

export function HomePage({ onNavigate, user }) {
  // Founder Meeting Form State
  const [founderForm, setFounderForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    businessType: 'Retail & E-commerce',
    preferredDate: '',
    preferredTime: 'Morning (10:00 AM - 1:00 PM)',
    message: ''
  });
  const [founderSubmitted, setFounderSubmitted] = useState(false);
  const [founderLoading, setFounderLoading] = useState(false);
  const [founderError, setFounderError] = useState('');

  const handleFounderSubmit = async (e) => {
    e.preventDefault();
    setFounderError('');

    if (!founderForm.name || !founderForm.email || !founderForm.company) {
      setFounderError('Please provide your name, business email, and company name.');
      return;
    }

    setFounderLoading(true);
    try {
      await leadService.submitFounderMeeting(founderForm);
      setFounderLoading(false);
      setFounderSubmitted(true);
    } catch {
      setFounderLoading(false);
      setFounderError('Unable to schedule meeting right now. Please try again or email founder@kreazyai.com.');
    }
  };

  const services = [
    {
      id: 'support',
      title: 'AI Customer Support',
      desc: 'Instant, human-grade customer care 24/7 that resolves inquiries, answers shipping FAQs, and manages exchanges across all channels.',
      icon: MessageSquare,
      badge: '2.4s Response Time'
    },
    {
      id: 'sales',
      title: 'AI Sales Assistant',
      desc: 'Recommends products, checks inventory stock in real time, guides size selection, and recovers abandoned carts directly in chat.',
      icon: TrendingUp,
      badge: '3.2x Higher Sales'
    },
    {
      id: 'orders',
      title: 'Order Automation',
      desc: 'Converts conversation intent directly into verified orders with automated invoice generation, payment links, and dispatch updates.',
      icon: ShoppingBag,
      badge: 'Instant Checkout'
    },
    {
      id: 'products',
      title: 'Product Management',
      desc: 'Seamlessly syncs your product catalog, variants, and pricing across Shopify, WooCommerce, and Meta Commerce catalogs.',
      icon: Layers,
      badge: 'Real-time Stock'
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Automation',
      desc: 'Official WhatsApp Business Cloud API integration for automated order confirmations, broadcasts, delivery tracking, and VIP care.',
      icon: Bot,
      badge: 'Meta Cloud Certified'
    },
    {
      id: 'messenger',
      title: 'Facebook Messenger Automation',
      desc: 'Turns comment inquiries and page messages into direct sales opportunities with context-aware natural language understanding.',
      icon: Send,
      badge: 'Omnichannel Sync'
    },
    {
      id: 'instagram',
      title: 'Instagram Automation',
      desc: 'Handles high-volume Direct Messages and story mentions autonomously with branded voice alignment and instant human escalation.',
      icon: Sparkles,
      badge: 'Story & DM Assist'
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      desc: 'Actionable executive telemetry on customer satisfaction, resolution rates, revenue per channel, and AI agent performance.',
      icon: BarChart3,
      badge: 'Real-time ROI'
    }
  ];

  const steps = [
    {
      step: 'STEP 01',
      title: 'Connect Your Business',
      desc: 'Link your existing store, inventory databases, or upload policy documents with one-click verification.'
    },
    {
      step: 'STEP 02',
      title: 'Connect Your Channels',
      desc: 'Securely link official WhatsApp Business API, Instagram DM, and Facebook Messenger accounts.'
    },
    {
      step: 'STEP 03',
      title: 'Train Your AI',
      desc: 'Ground the AI on your brand voice, return policies, sizing charts, and product nuances within minutes.'
    },
    {
      step: 'STEP 04',
      title: 'Activate Automation',
      desc: 'Enable autonomous mode with custom guardrails, human handoff triggers, and instant order generation.'
    },
    {
      step: 'STEP 05',
      title: 'Monitor Results',
      desc: 'Review live customer threads, autonomous conversion metrics, and revenue generated 24/7.'
    }
  ];

  return (
    <div>
      {/* -------------------------------------------------------------
          1. HERO SECTION
          ------------------------------------------------------------- */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">
            Turn Your Business Into an <span className="highlight">AI-Powered Operation</span>.
          </h1>

          <p className="hero-subtitle">
            Automate customer conversations, sales workflows, product operations and repetitive business tasks with KreazyAI.
          </p>

          <div className="hero-cta-group">
            {user ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('dashboard')}
                iconRight={ArrowRight}
              >
                Open Workspace Dashboard
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('book-demo')}
              >
                Book a Demo
              </Button>
            )}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                const el = document.getElementById('product-showcase');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigate('features');
              }}
            >
              Explore KreazyAI
            </Button>
          </div>

          {/* Interactive Hero Product Interface Preview - Problem vs Solution */}
          <div id="product-showcase">
            <HeroProblemShowcase 
              onExploreApp={() => onNavigate('dashboard')} 
              onBookDemo={() => onNavigate('book-demo')}
            />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. TRUST & CHANNELS STRIP + NATIVE IPHONE INTEGRATION SHOWCASE
          ------------------------------------------------------------- */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-title">
            BUILT FOR ENTERPRISE INTEGRATIONS & OFFICIAL META CLOUD APIS
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
              <span>Shopify & Catalog Sync</span>
            </div>
          </div>

          {/* Ultra-Premium iPhone Omnichannel Integration Showcase */}
          <IphoneIntegrationShowcase onNavigate={onNavigate} />
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. SERVICES SECTION: EVERYTHING YOUR BUSINESS NEEDS TO AUTOMATE
          ------------------------------------------------------------- */}
      <section className="services-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto var(--space-12) auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              Everything Your Business Needs To Automate.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Engineered for direct-to-consumer retailers, multi-brand merchants, and operational teams managing thousands of customer touchpoints monthly.
            </p>
          </div>

          <div className="services-grid-4">
            {services.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="service-card">
                  <div className="service-icon-wrap">
                    <Icon size={20} />
                  </div>
                  <h3 className="service-title">{item.title}</h3>
                  <p className="service-desc">{item.desc}</p>
                  <div className="service-status-pill">
                    <span className="status-dot active"></span>
                    <span>{item.badge}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. HOW KREAZYAI WORKS (5-STEP VISUAL WORKFLOW)
          ------------------------------------------------------------- */}
      <section className="workflow-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto var(--space-12) auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              How KreazyAI Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              From initial catalog connection to fully autonomous customer operations in five structured steps.
            </p>
          </div>

          <div className="workflow-steps-grid">
            {steps.map((item, index) => (
              <div key={index} className="workflow-step-card">
                <div className="step-num-badge">{item.step}</div>
                <h3 className="step-title">{item.title}</h3>
                <p className="step-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. META INTEGRATION ARCHITECTURE
          ------------------------------------------------------------- */}
      <section className="meta-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              Connected Channels. Zero Disconnected Silos.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Every customer message across WhatsApp, Instagram, and Messenger is routed through a single intelligent automation engine directly into your business database.
            </p>
          </div>

          <div className="meta-pipeline-box">
            <div className="pipeline-diagram">
              <div className="pipeline-node">
                <div className="node-title">Customer</div>
                <div className="node-sub">Inquiry & Purchase Intent</div>
              </div>
              <div className="pipeline-arrow">→</div>
              <div className="pipeline-node">
                <div className="node-title">WhatsApp / Instagram / Messenger</div>
                <div className="node-sub">Official Meta Cloud Webhook</div>
              </div>
              <div className="pipeline-arrow">→</div>
              <div className="pipeline-node core-ai">
                <div className="node-title" style={{ color: 'var(--bright-olive)' }}>KreazyAI AI Engine</div>
                <div className="node-sub">Sizing, Catalog & Policy Knowledge</div>
              </div>
              <div className="pipeline-arrow">→</div>
              <div className="pipeline-node">
                <div className="node-title">Business Operations</div>
                <div className="node-sub">OMS, Inventory, CRM Sync</div>
              </div>
              <div className="pipeline-arrow">→</div>
              <div className="pipeline-node">
                <div className="node-title">Order / Lead Confirmed</div>
                <div className="node-sub">Instant Revenue Realization</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. SOCIAL PROOF / BUSINESS RESULTS METRICS
          ------------------------------------------------------------- */}
      <section className="proof-section">
        <div className="container">
          <div className="proof-metrics-grid">
            <div className="proof-metric-item">
              <div className="proof-val olive">2.4s</div>
              <div className="proof-label">Average Response Time</div>
              <div className="proof-desc">Instant replies across all active Meta channels 24/7.</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val">78%</div>
              <div className="proof-label">Autonomous Resolution</div>
              <div className="proof-desc">Inquiries, sizing advice, and orders handled with zero human intervention.</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val olive">3.2x</div>
              <div className="proof-label">Conversation Conversion</div>
              <div className="proof-desc">Higher checkout completion compared to static website link clicks.</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val">100%</div>
              <div className="proof-label">Operational Reliability</div>
              <div className="proof-desc">Continuous multi-tenant uptime with zero missed customer inquiries.</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          7. PRICING SECTION
          ------------------------------------------------------------- */}
      <section className="pricing-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto var(--space-12) auto' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              Predictable Pricing Built for Scaling Brands
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              No hidden fees. Scale your AI customer operations as your conversation and order volume grows.
            </p>
          </div>

          <div className="pricing-grid">
            {/* Starter */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Starter</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>For emerging retailers automating social customer queries.</p>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <span className="price-val">$49</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 'var(--space-8)', flexGrow: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Up to 1,000 monthly messages
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> WhatsApp & Instagram integration
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Basic catalog sync (100 products)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> 1 Agent Workspace Seat
                </li>
              </ul>
              <Button variant="secondary" size="md" onClick={() => onNavigate('book-demo')} style={{ width: '100%', justifyContent: 'center' }}>
                Get Started
              </Button>
            </div>

            {/* Growth (Featured) */}
            <div className="pricing-card featured">
              <span className="featured-pill">RECOMMENDED</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Growth</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>For established merchants scaling automated sales & care.</p>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <span className="price-val">$149</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 'var(--space-8)', flexGrow: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Up to 5,000 monthly messages
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Full Meta suite (WhatsApp, IG, Messenger)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Autonomous Order Creation & Invoices
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Shopify & WooCommerce live inventory
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Priority Human Escalation Routing
                </li>
              </ul>
              <Button variant="primary" size="md" onClick={() => onNavigate('book-demo')} style={{ width: '100%', justifyContent: 'center' }}>
                Book a Growth Demo
              </Button>
            </div>

            {/* Scale / Enterprise */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>Scale / Enterprise</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>For high-volume retail brands with custom workflows.</p>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <span className="price-val">$399</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / month</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: 'var(--space-8)', flexGrow: 1 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Unlimited conversation volume
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Custom AI fine-tuning & policy rules
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Dedicated Solution Engineer & SLA
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <Check size={16} color="var(--bright-olive)" /> Custom ERP & Courier Integrations
                </li>
              </ul>
              <Button variant="secondary" size="md" onClick={() => onNavigate('book-demo')} style={{ width: '100%', justifyContent: 'center' }}>
                Contact Enterprise
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          8. FOUNDER MEETING SECTION
          ------------------------------------------------------------- */}
      <section className="founder-section" id="founder-meeting">
        <div className="container">
          <div className="founder-card">
            <div className="founder-info">
              <h2>Want to Build a More Automated Business?</h2>
              <p>
                Talk directly with the KreazyAI team about how AI automation can fit your business operations,
                catalog complexity, and revenue targets.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--bright-olive)" />
                  <span>Review your actual customer conversation bottlenecks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--bright-olive)" />
                  <span>Live demonstration on your specific product catalog</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--bright-olive)" />
                  <span>Clear architecture plan before any deployment</span>
                </div>
              </div>
            </div>

            {/* Founder Meeting Booking Interface */}
            <div className="founder-booking-form">
              {founderSubmitted ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--bright-olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4) auto', color: 'var(--bright-olive)' }}>
                    <Check size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>Meeting Scheduled</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Thank you, {founderForm.name}. A calendar invitation has been prepared for {founderForm.company}. We will connect via Google Meet at your preferred time.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setFounderSubmitted(false)}>
                    Schedule Another Session
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFounderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    Book a Founder Meeting
                  </div>

                  {founderError && (
                    <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', border: '1px solid var(--status-error-border)' }}>
                      {founderError}
                    </div>
                  )}

                  <div className="founder-form-row-2">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>Your Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Sarah Jenkins"
                        className="form-input"
                        value={founderForm.name}
                        onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>Work Email *</label>
                      <input
                        type="email"
                        required
                        placeholder="sarah@brand.com"
                        className="form-input"
                        value={founderForm.email}
                        onChange={(e) => setFounderForm({ ...founderForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="founder-form-row-2">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>Phone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="form-input"
                        value={founderForm.phone}
                        onChange={(e) => setFounderForm({ ...founderForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>Company Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Acme Retail"
                        className="form-input"
                        value={founderForm.company}
                        onChange={(e) => setFounderForm({ ...founderForm, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="founder-form-row-2">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>Preferred Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={founderForm.preferredDate}
                        onChange={(e) => setFounderForm({ ...founderForm, preferredDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>Preferred Time</label>
                      <select
                        className="form-select"
                        value={founderForm.preferredTime}
                        onChange={(e) => setFounderForm({ ...founderForm, preferredTime: e.target.value })}
                      >
                        <option>Morning (10:00 AM - 1:00 PM EST)</option>
                        <option>Afternoon (1:00 PM - 5:00 PM EST)</option>
                        <option>Evening (5:00 PM - 8:00 PM EST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.775rem' }}>Current Automation Goals</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="What is your biggest bottleneck across WhatsApp or Instagram sales?"
                      value={founderForm.message}
                      onChange={(e) => setFounderForm({ ...founderForm, message: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={founderLoading}
                    style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
                  >
                    Confirm Founder Meeting
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          9. PRICING TIERS (USD)
          ------------------------------------------------------------- */}
      <PricingTiersSection onNavigate={onNavigate} />

      {/* -------------------------------------------------------------
          10. ABOUT THE FOUNDATION
          ------------------------------------------------------------- */}
      <section className="about-section">
        <div className="container">
          <div className="about-box">
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              Why We Built KreazyAI
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
              Online retail has moved into messaging channels. Today, modern customers in high-growth markets expect immediate sizing recommendations, instant stock lookups, and personalized order checkout directly within WhatsApp and Instagram.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Most AI platforms offer generic, hallucination-prone chatbots that damage customer trust. KreazyAI was created to deliver strict, grounded, deterministic commercial intelligence that respects business policies, safeguards margins, and closes real orders around the clock.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          10. FINAL CONVERSION CTA BANNER
          ------------------------------------------------------------- */}
      <section style={{ padding: 'var(--space-12) 0 var(--space-16) 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12) var(--space-8)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              Ready to Automate Your Business Conversations?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto var(--space-8) auto' }}>
              Connect with our team to see how KreazyAI can integrate with your product catalog and Meta channels within 48 hours.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => onNavigate('book-demo')}>
                Book a Demo
              </Button>
              <Button variant="secondary" size="lg" onClick={() => {
                const el = document.getElementById('founder-meeting');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                Book a Founder Meeting
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
