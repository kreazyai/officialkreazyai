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
  Phone,
  Headphones,
  ChevronDown,
  Globe,
  Clock,
  Smartphone,
  Flame,
  ArrowUpRight,
  Lock,
  MessageCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConversationOrderDemo } from '../../components/website/ConversationOrderDemo';
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

  // Homepage FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(prev => (prev === idx ? -1 : idx));
  };

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
      setFounderError('Unable to schedule meeting right now. Please try again or email hello@kreazy.ai.');
    }
  };

  // 4 Simple How-It-Works Steps
  const howItWorksSteps = [
    {
      step: '01',
      title: 'Connect Your Channels',
      desc: 'Link your Facebook Messenger, Instagram DMs, and WhatsApp Business in 1 click via official Meta Cloud APIs.',
      badge: 'Takes 3 Minutes'
    },
    {
      step: '02',
      title: 'Train Your AI Agent',
      desc: 'Upload your product catalog, prices, sizing guides, return policies, and delivery charges. No coding required.',
      badge: 'Catalog & FAQs'
    },
    {
      step: '03',
      title: 'Let AI Handle Conversations 24/7',
      desc: 'Customers receive instant, human-grade replies in under 1.5 seconds—recommending products and answering stock questions.',
      badge: 'Day & Night Replies'
    },
    {
      step: '04',
      title: 'Close More Orders Automatically',
      desc: 'KreazyAI captures delivery addresses, creates confirmed orders, and transfers the chat to your team when human touch is needed.',
      badge: 'Direct Orders'
    }
  ];

  // Outcome-Focused Core Capabilities
  const coreFeatures = [
    {
      id: 'sales-agent',
      title: 'AI Sales Agent',
      desc: 'Never lose a buyer to a late reply. AI answers questions about size, price, and availability in 1.2s, day or night.',
      icon: TrendingUp,
      outcome: '< 1.5s Response'
    },
    {
      id: 'order-automation',
      title: 'Automatic Order Capture',
      desc: 'Collects customer name, phone, shipping address, and payment method directly in chat and writes confirmed orders to your dashboard.',
      icon: ShoppingBag,
      outcome: 'Zero Lost Orders'
    },
    {
      id: 'unified-inbox',
      title: 'Unified Social Inbox',
      desc: 'Manage all customer messages from WhatsApp, Instagram, and Messenger inside one clean, shared team inbox.',
      icon: MessageSquare,
      outcome: 'All Meta Channels'
    },
    {
      id: 'product-recommendations',
      title: 'Smart Product Recommendations',
      desc: 'Recommends matching items, alternative sizes, and in-stock variants when a customer’s first choice is unavailable.',
      icon: Sparkles,
      outcome: 'Higher Cart Value'
    },
    {
      id: 'human-handoff',
      title: 'Instant Human Team Handoff',
      desc: 'Your team can jump into any conversation with one click. AI provides drafted suggestions so your staff responds in seconds.',
      icon: Headphones,
      outcome: '1-Click Takeover'
    },
    {
      id: 'meta-capi',
      title: 'Track Sales Back to Meta Ads',
      desc: 'Integrated Meta Conversions API (CAPI) sends confirmed purchase events back to your ad campaigns to optimize your ad spend.',
      icon: BarChart3,
      outcome: 'Higher Ad ROAS'
    }
  ];

  // Top 8 Buyer Objections FAQs
  const homeFaqs = [
    {
      q: 'What exactly is KreazyAI and how does it help my business?',
      a: 'KreazyAI is a 24/7 AI sales agent built specifically for businesses selling on Facebook Messenger, Instagram, and WhatsApp. It automatically replies to customer messages, answers questions about products and pricing, guides sizing, collects delivery details, and creates orders directly in chat so you never lose a customer to slow response times.'
    },
    {
      q: 'Which channels does KreazyAI support?',
      a: 'KreazyAI natively supports WhatsApp Business (via official Meta Cloud API), Instagram Direct Messages & Story Mentions, and Facebook Messenger. All customer messages and orders are synced into one central dashboard.'
    },
    {
      q: 'Can KreazyAI take customer orders automatically without a website?',
      a: 'Yes! Many social commerce sellers take orders directly in chat without forcing customers onto an external website. KreazyAI collects the customer\'s name, phone number, delivery address, item variant, and payment preference (Cash on Delivery, bKash, or card), confirms the order, and syncs it to your KreazyAI dashboard.'
    },
    {
      q: 'What happens when a customer asks to speak with a human agent?',
      a: 'Whenever a customer requests a real person, asks for custom adjustments, or when the AI detects an edge case, KreazyAI triggers an instant human handoff. The conversation is highlighted in your inbox with full context and an AI-drafted reply, allowing your human staff to take over seamlessly with a single click.'
    },
    {
      q: 'Can KreazyAI understand Bengali and mixed Banglish messages?',
      a: 'Yes. KreazyAI natively understands Bangla script, English, and Romanized Banglish (e.g., "Ei shirt er L size hobe? Delivery charge koto?"). It responds in natural, polite conversational Bangla or English to match your customer\'s tone.'
    },
    {
      q: 'Does KreazyAI work with Facebook and Instagram ads?',
      a: 'Yes. When you run Meta "Click-to-WhatsApp" or "Click-to-Instagram Direct" ads, KreazyAI greets leads in under 1.5 seconds before they lose interest. Furthermore, our integrated Meta Conversions API (CAPI) sends confirmed purchase events back to Meta Ads to optimize your targeting and ROAS.'
    },
    {
      q: 'How does the 7-day free trial and ৳1,990/month pricing work?',
      a: 'You can test KreazyAI completely free for 7 days with 500 AI conversations on any channel—no credit card required. After the trial, the Pro plan is ৳1,990/month (or $19/month) for 5,000 conversations across all 3 Meta channels. There are no contracts and you can cancel anytime.'
    },
    {
      q: 'How long does setup take and do I need coding experience?',
      a: 'Zero coding is required. Connecting your Meta channels takes approximately 5 minutes using official Meta OAuth login. You can upload your product catalog, size guides, and delivery policies directly, and your AI sales agent is ready to start responding immediately.'
    }
  ];

  return (
    <div className="homepage-content">
      {/* -------------------------------------------------------------
          1. HERO SECTION: CONVERSION-OPTIMIZED HEADLINE & VALUE PROP
          ------------------------------------------------------------- */}
      <section className="hero-section" style={{ paddingBottom: 'var(--space-12)' }}>
        <div className="container">
          {/* Eyebrow Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(114, 176, 52, 0.15)', border: '1px solid rgba(114, 176, 52, 0.35)', padding: '5px 14px', borderRadius: '9999px', marginBottom: '1.25rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80', letterSpacing: '0.02em' }}>
              24/7 AI SALES AGENT FOR SOCIAL COMMERCE
            </span>
          </div>

          {/* Primary High-Converting Headline */}
          <h1 className="hero-title" style={{ maxWidth: '960px', margin: '0 auto 1.25rem auto', fontSize: 'clamp(2.35rem, 5vw, 3.85rem)', lineHeight: 1.12, letterSpacing: '-0.025em' }}>
            Turn Facebook, Instagram &amp; WhatsApp Messages Into Orders — <span className="highlight" style={{ background: 'linear-gradient(135deg, #a3cb58 0%, #5ce182 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Automatically</span>.
          </h1>

          {/* Supporting Copy Focused on Customer Outcomes */}
          <p className="hero-subtitle" style={{ maxWidth: '780px', margin: '0 auto 2rem auto', fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            KreazyAI replies to customers in <strong>1.2 seconds</strong>, answers product and sizing questions, recommends in-stock items, collects delivery addresses, and creates confirmed orders 24/7. When a customer needs personal attention, it hands off smoothly to your team.
          </p>

          {/* Hero CTAs */}
          <div className="hero-cta-group" style={{ marginBottom: '1.75rem', display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate('signup')}
                  iconRight={ArrowRight}
                  style={{ fontWeight: 800, padding: '0.85rem 1.85rem' }}
                >
                  Start 7-Day Free Trial
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('live-demo');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See Live Demo
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => onNavigate('book-demo')}
                  style={{ color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Book 1-on-1 Demo
                </Button>
              </>
            )}
          </div>

          {/* Trust Indicators Strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={15} color="var(--bright-olive)" />
              <span>No credit card required</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Zap size={15} color="var(--bright-olive)" />
              <span>Connects in 5 minutes</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={15} color="var(--bright-olive)" />
              <span>Official Meta Cloud APIs</span>
            </div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Globe size={15} color="var(--bright-olive)" />
              <span>Bangla, Banglish &amp; English</span>
            </div>
          </div>

          {/* -----------------------------------------------------------
              2. INTERACTIVE CONVERSATION-TO-ORDER LIVE SIMULATOR
              ----------------------------------------------------------- */}
          <div id="live-demo" style={{ paddingTop: '2.5rem' }}>
            <ConversationOrderDemo onNavigate={onNavigate} />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          3. HOW IT WORKS: 4 SIMPLE STEPS
          ------------------------------------------------------------- */}
      <section className="workflow-section" style={{ padding: 'var(--space-16) 0', backgroundColor: 'rgba(14, 20, 16, 0.75)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-12) auto' }}>
            <span className="eyebrow" style={{ color: 'var(--bright-olive)', display: 'inline-block', marginBottom: '0.5rem' }}>
              SIMPLE 4-STEP WORKFLOW
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
              How KreazyAI Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              From initial catalog connection to fully automated social sales in four straightforward steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {howItWorksSteps.map((item, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--bg-card, #1C2820)',
                  border: '1px solid var(--border-medium, rgba(62, 88, 56, 0.55))',
                  borderRadius: '16px',
                  padding: '1.75rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--bright-olive)', fontFamily: 'var(--font-mono, monospace)' }}>
                      {item.step}
                    </span>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#4ade80', background: 'rgba(114, 176, 52, 0.15)', border: '1px solid rgba(114, 176, 52, 0.3)', padding: '2px 8px', borderRadius: '6px' }}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. SUPPORTED CHANNELS: UNIFIED SOCIAL COMMERCE
          ------------------------------------------------------------- */}
      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto var(--space-12) auto' }}>
            <span className="eyebrow" style={{ color: 'var(--bright-olive)', display: 'inline-block', marginBottom: '0.5rem' }}>
              OFFICIAL META PLATFORMS
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              Sell Across Every Major Messaging App
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Connect your official accounts once. KreazyAI coordinates conversations and orders across all channels without disconnected silos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem' }}>
            {/* WhatsApp Card */}
            <div style={{ background: 'rgba(28, 40, 32, 0.75)', border: '1px solid rgba(34, 197, 94, 0.35)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>WhatsApp Business</h3>
                    <span style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 700 }}>Meta Cloud API Certified</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  Instant replies to click-to-WhatsApp ads, automated catalog sharing, cash on delivery order confirmation, and automated courier tracking updates.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#86efac', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={14} />
                <span>Zero disconnected QR codes • 24/7 Server Uptime</span>
              </div>
            </div>

            {/* Instagram Card */}
            <div style={{ background: 'rgba(28, 40, 32, 0.75)', border: '1px solid rgba(236, 72, 153, 0.35)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Instagram Direct</h3>
                    <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 700 }}>DMs, Story Replies &amp; Comments</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  Automate replies to story mentions, high-volume direct messages, and comment questions (e.g., "Price please?") directly into purchase links.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#f472b6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={14} />
                <span>Auto Comment-to-DM Sales Triggers</span>
              </div>
            </div>

            {/* Messenger Card */}
            <div style={{ background: 'rgba(28, 40, 32, 0.75)', border: '1px solid rgba(59, 130, 246, 0.35)', borderRadius: '20px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <Send size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Facebook Messenger</h3>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>Facebook Page &amp; Meta Ads</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  Turn Facebook Page visitors and click-to-Messenger ad traffic into completed orders. Understands natural Banglish queries effortlessly.
                </p>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Zap size={14} />
                <span>Instant Lead Qualification &amp; Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          5. CORE CAPABILITIES (BUSINESS OUTCOMES OVER TECHNICAL JARGON)
          ------------------------------------------------------------- */}
      <section className="services-section" style={{ padding: 'var(--space-16) 0', backgroundColor: 'rgba(16, 22, 18, 0.95)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto var(--space-12) auto' }}>
            <span className="eyebrow" style={{ color: 'var(--bright-olive)', display: 'inline-block', marginBottom: '0.5rem' }}>
              BUILT FOR MODERN COMMERCE
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              Everything You Need to Scale Social Sales
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Designed for retail brands, apparel merchants, and direct-to-consumer businesses that receive hundreds of customer inquiries every day.
            </p>
          </div>

          <div className="services-grid-4">
            {coreFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="service-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="service-icon-wrap" style={{ width: '42px', height: '42px', borderRadius: '10px' }}>
                      <Icon size={20} />
                    </div>
                    <h3 className="service-title" style={{ fontSize: '1.1rem', marginBottom: '0.45rem' }}>{item.title}</h3>
                    <p className="service-desc" style={{ fontSize: '0.875rem', lineHeight: 1.55 }}>{item.desc}</p>
                  </div>
                  <div className="service-status-pill" style={{ marginTop: '1rem', width: 'fit-content' }}>
                    <span className="status-dot active"></span>
                    <span>{item.outcome}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. SPOTLIGHT: AI + INSTANT HUMAN TEAM HANDOFF
          ------------------------------------------------------------- */}
      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(28, 40, 32, 0.9) 0%, rgba(18, 25, 20, 0.9) 100%)',
            border: '1px solid rgba(80, 115, 60, 0.45)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 4vw, 3.5rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center'
          }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--bright-olive)', display: 'inline-block', marginBottom: '0.5rem' }}>
                PERFECT HARMONY
              </span>
              <h2 style={{ fontSize: 'clamp(1.85rem, 3vw, 2.45rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2 }}>
                AI Handles the High Volume. <br />
                Your Team Steps In for VIPs.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                80% of customer questions are repetitive: <em>"Do you have size M?", "How much is delivery to Sylhet?", "Can I see real pictures?"</em> KreazyAI resolves these automatically. When a customer has a complex request or asks for a real person, your team takes over with one click.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--bright-olive)" />
                  <span>Full customer context and chat history preserved</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--bright-olive)" />
                  <span>AI drafts replies in the background for faster moderator typing</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--bright-olive)" />
                  <span>Zero customer repetition: your staff knows exactly what was said</span>
                </div>
              </div>

              <Button variant="primary" size="md" onClick={() => onNavigate('signup')}>
                Try Human Handoff Free
              </Button>
            </div>

            {/* Visual Card Demonstrating Handoff */}
            <div style={{
              background: 'rgba(12, 17, 13, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 20px 45px rgba(0,0,0,0.5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Headphones size={18} color="#60a5fa" />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>Unified Team Inbox</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#4ade80', background: 'rgba(34, 197, 94, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Live Session
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.65rem 0.85rem', borderRadius: '10px', alignSelf: 'flex-start', maxWidth: '85%' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Customer (Instagram DM)</div>
                  <div>Can I get this custom embroidered with my initials?</div>
                </div>

                <div style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '0.65rem 0.85rem', borderRadius: '10px', color: '#93c5fd' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.75rem', marginBottom: '3px' }}>
                    <Bot size={13} />
                    <span>AI Detected Customization Request → Handing off to human team</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#bfdbfe' }}>
                    Draft for staff: "Yes, we do custom embroidery! It takes 1 extra business day. Which initials would you like?"
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
                    Send AI Draft
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }}>
                    Type Custom Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          7. VERIFIABLE OPERATIONAL OUTCOMES
          ------------------------------------------------------------- */}
      <section className="proof-section" style={{ padding: 'var(--space-12) 0', backgroundColor: 'rgba(14, 20, 16, 0.8)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="eyebrow" style={{ color: 'var(--bright-olive)' }}>MEASURABLE BUSINESS IMPACT</span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
              Why Social Commerce Stores Choose KreazyAI
            </h2>
          </div>

          <div className="proof-metrics-grid">
            <div className="proof-metric-item">
              <div className="proof-val olive">&lt; 1.5s</div>
              <div className="proof-label">Instant First Reply</div>
              <div className="proof-desc">Respond to potential buyers while their purchase impulse is highest.</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val">24/7/365</div>
              <div className="proof-label">Zero Lost Midnight Sales</div>
              <div className="proof-desc">Close late-night orders automatically while your human staff is asleep.</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val olive">100%</div>
              <div className="proof-label">Catalog Accuracy</div>
              <div className="proof-desc">Answers strictly grounded in your verified products, sizes, and pricing.</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val">Official</div>
              <div className="proof-label">Meta Cloud Connection</div>
              <div className="proof-desc">Strictly official Meta Cloud APIs with zero risk of account blocks or bans.</div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          8. PRICING SECTION (BDT ৳1,990 & USD $19 TIERS)
          ------------------------------------------------------------- */}
      <PricingTiersSection
        onNavigate={onNavigate}
        eyebrow="TRANSPARENT PLANS"
        title="Predictable Pricing That Pays For Itself"
        subtitle="Choose the plan that fits your current sales volume. Start with our 7-day free trial—no credit card required."
      />

      {/* -------------------------------------------------------------
          9. FREQUENTLY ASKED QUESTIONS (TOP 8 BUYER OBJECTIONS)
          ------------------------------------------------------------- */}
      <section style={{ padding: 'var(--space-16) 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-12) auto' }}>
            <span className="eyebrow" style={{ color: 'var(--bright-olive)', display: 'inline-block', marginBottom: '0.5rem' }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>
              Everything You Need to Know
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Common questions from business owners switching from manual typing to automated social sales.
            </p>
          </div>

          <div className="home-faq-grid">
            {homeFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`home-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="home-faq-trigger"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div className="home-faq-content">
                      <p style={{ margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          10. FOUNDER MEETING & CUSTOM STRATEGY SESSION
          ------------------------------------------------------------- */}
      <section className="founder-section" id="founder-meeting">
        <div className="container">
          <div className="founder-card">
            <div className="founder-info">
              <span className="eyebrow" style={{ color: 'var(--bright-olive)', display: 'inline-block', marginBottom: '0.5rem' }}>
                DIRECT FOUNDER CONSULTATION
              </span>
              <h2>Want a Custom Strategy for Your Social Commerce Store?</h2>
              <p>
                Talk directly with the KreazyAI product team about how to automate your specific product catalog, Meta ad funnels, and customer volume.
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
                  <span>Setup and onboarding guidance before launch</span>
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
                    Book a Founder Strategy Call
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
                        placeholder="Sakib Ahmed"
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
                        placeholder="sakib@brand.com"
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
                        placeholder="+880 1700-000000"
                        className="form-input"
                        value={founderForm.phone}
                        onChange={(e) => setFounderForm({ ...founderForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>Company / Page Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Artisan Wear"
                        className="form-input"
                        value={founderForm.company}
                        onChange={(e) => setFounderForm({ ...founderForm, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.775rem' }}>Current Automation Bottlenecks</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      placeholder="What is your biggest pain point with customer inquiries right now?"
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
                    Confirm Founder Strategy Call
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          11. FINAL HIGH-CONVERSION CTA BANNER
          ------------------------------------------------------------- */}
      <section style={{ padding: 'var(--space-12) 0 var(--space-16) 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(34, 48, 28, 0.95) 0%, rgba(18, 26, 20, 0.95) 100%)',
            border: '1px solid rgba(114, 176, 52, 0.45)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-12) var(--space-8)',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
              Stop Losing Orders to Slow Replies.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto var(--space-8) auto', lineHeight: 1.6 }}>
              Connect your Facebook, Instagram, and WhatsApp channels in 5 minutes and let your AI sales agent start closing orders 24/7.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('signup')}
                iconRight={ArrowRight}
                style={{ fontWeight: 800, padding: '0.85rem 2rem' }}
              >
                Start 7-Day Free Trial
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('book-demo')}
              >
                Book a 1-on-1 Demo
              </Button>
            </div>
            <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              No credit card required • Instant setup • Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
