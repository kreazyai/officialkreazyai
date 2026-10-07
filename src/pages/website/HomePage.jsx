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
  Check,
  Building,
  Mail,
  User,
  Phone,
  Headphones,
  ChevronDown,
  Globe,
  Clock,
  MessageCircle,
  Repeat,
  ArrowUpRight,
  Share2,
  Inbox,
  Workflow,
  Database,
  FileText
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
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

  // Active step state for the interactive horizontal workflow
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);

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

  // Top 8 Buyer Objections FAQs
  const homeFaqs = [
    {
      q: 'What exactly is KREAZY AI and how does it help my business?',
      a: 'KREAZY AI is a 24/7 AI sales and automation agent built for businesses communicating on WhatsApp, Instagram, Messenger, and Web. It automatically replies to customer messages, answers product and pricing questions, guides sizing, collects delivery details, and creates confirmed orders directly in chat so you never lose a customer to slow response times.'
    },
    {
      q: 'Which channels does KREAZY AI support?',
      a: 'KREAZY AI natively supports WhatsApp Business (via official Meta Cloud API), Instagram Direct Messages & Story Mentions, Facebook Messenger, and Website Live Chat. All customer messages and orders are synced into one central workspace.'
    },
    {
      q: 'Can KREAZY AI take customer orders automatically without a website?',
      a: 'Yes! Many social commerce sellers take orders directly in chat without forcing customers onto an external website. KREAZY AI collects the customer\'s name, phone number, delivery address, item variant, and payment preference (Cash on Delivery, bKash, or card), confirms the order, and syncs it to your dashboard.'
    },
    {
      q: 'What happens when a customer asks to speak with a human agent?',
      a: 'Whenever a customer requests a real person, asks for custom adjustments, or when the AI detects an edge case, KREAZY AI triggers an instant human handoff. The conversation is highlighted in your inbox with full context and an AI-drafted reply, allowing your human staff to take over seamlessly with a single click.'
    },
    {
      q: 'Can KREAZY AI understand Bengali and mixed Banglish messages?',
      a: 'Yes. KREAZY AI natively understands Bangla script, English, and Romanized Banglish (e.g., "Ei shirt er L size hobe? Delivery charge koto?"). It responds in natural, polite conversational tone matching your customer\'s language.'
    },
    {
      q: 'Does KREAZY AI work with Facebook and Instagram ads?',
      a: 'Yes. When you run Meta "Click-to-WhatsApp" or "Click-to-Instagram Direct" ads, KREAZY AI greets leads in under 1.5 seconds before they lose interest. Furthermore, our integrated Meta Conversions API (CAPI) sends confirmed purchase events back to Meta Ads to optimize your targeting and ROAS.'
    },
    {
      q: 'How does the 7-day free trial and pricing work?',
      a: 'You can test KREAZY AI completely free for 7 days with 500 AI conversations on any channel—no credit card required. After the trial, the Standard plan starts at ৳1,990/month (or $19/month). There are no contracts and you can cancel anytime.'
    },
    {
      q: 'How long does setup take and do I need coding experience?',
      a: 'Zero coding is required. Connecting your Meta channels takes approximately 5 minutes using official Meta OAuth login. You can upload your product catalog, size guides, and delivery policies directly, and your AI sales agent is ready to start responding immediately.'
    }
  ];

  // Horizontal workflow steps (PDF Page 6)
  const workflowSteps = [
    {
      num: '01',
      title: 'Customer Message',
      subtitle: 'Omnichannel Ingestion',
      desc: 'Buyer sends inquiry from WhatsApp, Instagram DM, Story reply, or Messenger ad.',
      badge: 'Sub-second'
    },
    {
      num: '02',
      title: 'AI Agent',
      subtitle: 'Grounded Catalog Check',
      desc: 'KREAZY AI inspects live inventory, sizes, variants, pricing, and store policies.',
      badge: 'Zero Hallucination'
    },
    {
      num: '03',
      title: 'Understand Intent',
      subtitle: 'Natural NLP Engine',
      desc: 'Deciphers Banglish, English, voice queries, sizing questions, or purchase impulses.',
      badge: 'Multilingual'
    },
    {
      num: '04',
      title: 'Take Action',
      subtitle: 'Automated Checkout',
      desc: 'Answers question, recommends in-stock items, and collects delivery address directly in chat.',
      badge: '< 1.5s Response'
    },
    {
      num: '05',
      title: 'CRM / Human',
      subtitle: 'Seamless Handoff',
      desc: 'Creates confirmed order in dashboard, notifies couriers, or alerts staff if VIP help is requested.',
      badge: '1-Click Takeover'
    }
  ];

  // Editorial feature cards data (PDF Page 7)
  const editorialFeatures = [
    {
      num: '01',
      title: '24/7 AI Customer Support',
      desc: 'Never leave buyers waiting on seen. KREAZY AI answers product availability, sizing guides, delivery charges, and return policies instantly day and night.',
      tag: 'Always Active',
      isMint: true
    },
    {
      num: '02',
      title: 'Lead Qualification',
      desc: 'Automatically filters tire-kickers and extracts serious purchase intent, contact phone numbers, and delivery locations before passing to sales.',
      tag: 'High Intent',
      isMint: false
    },
    {
      num: '03',
      title: 'Appointment & Consultation Booking',
      desc: 'Allows customers to reserve tailored shopping slots, consultation calls, or boutique fitting sessions directly inside the chat window.',
      tag: 'Calendar Synced',
      isMint: false
    },
    {
      num: '04',
      title: 'Automated Follow-Ups',
      desc: 'Re-engages abandoned carts and hesitant buyers with polite, context-aware reminders on WhatsApp or Instagram, lifting conversions up to 28%.',
      tag: '+28% Re-engagement',
      isMint: true
    },
    {
      num: '05',
      title: 'Human Team Handoff',
      desc: 'Staff can monitor chats live. If a VIP customer needs personal attention or custom work, a human operator takes over with one click and full context.',
      tag: 'Context Preserved',
      isMint: false
    },
    {
      num: '06',
      title: 'CRM & Order Integration',
      desc: 'Synchronizes confirmed orders, delivery slips, and customer profiles into Shopify, WooCommerce, or your custom spreadsheet and courier APIs.',
      tag: 'Instant Sync',
      isMint: false
    }
  ];

  // Channels integration cards (PDF Page 7)
  const channels = [
    {
      name: 'WhatsApp Business',
      tag: 'Meta Cloud API',
      desc: 'Automate direct messaging, catalog showcases, Cash on Delivery confirmations, and automated parcel tracking.',
      icon: MessageCircle,
      iconColor: '#22c55e',
      iconBg: '#EFFBF5'
    },
    {
      name: 'Instagram Direct',
      tag: 'DMs & Story Mentions',
      desc: 'Turn story replies, influencer tags, and comments ("Price please?") into automated checkout conversations.',
      icon: Sparkles,
      iconColor: '#ec4899',
      iconBg: '#FDF2F8'
    },
    {
      name: 'Facebook Messenger',
      tag: 'Page & Ad Traffic',
      desc: 'Respond to Click-to-Messenger ad leads instantly and guide buyers through sizing and delivery address collection.',
      icon: Send,
      iconColor: '#3b82f6',
      iconBg: '#EFF6FF'
    },
    {
      name: 'Website Chat',
      tag: 'Live Web Widget',
      desc: 'Embed a lightweight, branded chat assistant on your storefront to greet visitors and resolve pre-purchase objections.',
      icon: Globe,
      iconColor: '#0FA968',
      iconBg: '#EFFBF5'
    },
    {
      name: 'CRM & Webhooks',
      tag: 'Real-Time Sync',
      desc: 'Push customer data, conversational transcripts, and confirmed orders into HubSpot, Shopify, or custom backends.',
      icon: Layers,
      iconColor: '#087A4A',
      iconBg: '#EFFBF5'
    },
    {
      name: 'Email Automation',
      tag: 'Inbound & Outbound',
      desc: 'Draft customer responses, handle return requests, and dispatch order confirmations straight from one unified inbox.',
      icon: Mail,
      iconColor: '#092A20',
      iconBg: '#EFFBF5'
    }
  ];

  return (
    <div className="homepage-content">
      {/* =============================================================
          1. HERO SECTION (PDF Page 4 & 5)
          - Large white/light background (#F8FAF9)
          - Soft mint-green organic abstract shapes toward edges
          - Thin flowing green lines inspired by automation connections
          - Small outlined graphics (chat bubbles, nodes, arrows, etc.)
          - Eyebrow: AI-Powered Business Automation
          - Headline: More conversations. Less manual work.
          - Supporting text & Pill CTAs
          - Under CTA: WhatsApp • Instagram • Messenger • Web
          - Hero Visual: 5 rounded floating workflow cards with green curved lines
          ============================================================= */}
      <section className="hero-section">
        {/* Soft mint-green organic abstract shapes toward edges */}
        <div className="hero-abstract-blob-left" aria-hidden="true" />
        <div className="hero-abstract-blob-right" aria-hidden="true" />

        {/* Decorative thin green workflow lines & outlined icons canvas */}
        <svg
          className="hero-bg-canvas"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 680"
          fill="none"
          aria-hidden="true"
        >
          {/* Subtle curved connection lines */}
          <path
            d="M -40 220 Q 260 120, 480 260 T 960 210 T 1480 320"
            stroke="#D9E9E1"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <path
            d="M 60 480 C 280 430, 420 540, 720 460 C 1020 380, 1220 520, 1500 440"
            stroke="#AEEBCB"
            strokeWidth="1.2"
            opacity="0.75"
          />
          <path
            d="M 120 160 Q 320 280, 540 180"
            stroke="#0FA968"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.45"
          />

          {/* Outlined Graphic Nodes (PDF Page 4) */}
          {/* Node 1: Chat bubble outline (left) */}
          <g transform="translate(140, 140)" stroke="#087A4A" strokeWidth="1.5" fill="none" opacity="0.6">
            <rect x="0" y="0" width="38" height="26" rx="8" />
            <path d="M 10 26 L 6 32 L 18 26 Z" fill="#DDF7E9" />
            <circle cx="12" cy="13" r="1.5" fill="#087A4A" />
            <circle cx="19" cy="13" r="1.5" fill="#087A4A" />
            <circle cx="26" cy="13" r="1.5" fill="#087A4A" />
          </g>

          {/* Node 2: Connection node circle (left middle) */}
          <circle cx="280" cy="380" r="14" fill="#EFFBF5" stroke="#0FA968" strokeWidth="1.5" opacity="0.7" />
          <circle cx="280" cy="380" r="5" fill="#0FA968" opacity="0.8" />

          {/* Node 3: AI Sparkle (top right) */}
          <g transform="translate(1260, 130)" stroke="#0FA968" strokeWidth="1.5" fill="none" opacity="0.7">
            <path d="M 16 0 L 19 12 L 31 15 L 19 18 L 16 30 L 13 18 L 1 15 L 13 12 Z" fill="#DDF7E9" />
          </g>

          {/* Node 4: Chat bubble outline (right) */}
          <g transform="translate(1220, 360)" stroke="#087A4A" strokeWidth="1.5" fill="none" opacity="0.6">
            <rect x="0" y="0" width="36" height="24" rx="7" />
            <path d="M 24 24 L 28 30 L 16 24 Z" fill="#DDF7E9" />
            <line x1="8" y1="9" x2="28" y2="9" strokeWidth="1.5" />
            <line x1="8" y1="15" x2="22" y2="15" strokeWidth="1.5" />
          </g>

          {/* Node 5: Automation Connection Circle (right top) */}
          <circle cx="1120" cy="220" r="18" fill="#EFFBF5" stroke="#AEEBCB" strokeWidth="1.5" opacity="0.8" />
          <circle cx="1120" cy="220" r="6" fill="#087A4A" />

          {/* Node 6: Workflow Arrow (left bottom) */}
          <g transform="translate(180, 480)" stroke="#0FA968" strokeWidth="1.5" fill="none" opacity="0.6">
            <circle cx="15" cy="15" r="15" fill="#EFFBF5" />
            <path d="M 10 15 L 20 15 M 16 11 L 20 15 L 16 19" />
          </g>
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-content-wrap">
            {/* Small Eyebrow Badge (PDF Page 4) */}
            <div className="hero-badge-wrap">
              <span className="badge badge-mint" style={{ padding: '0.4rem 1rem', fontSize: '0.825rem', letterSpacing: '0.01em' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--green)', display: 'inline-block' }} />
                AI-Powered Business Automation
              </span>
            </div>

            {/* Main Headline (PDF Page 4: Short, conversational, 800-900 weight, compact) */}
            <h1 className="hero-title">
              <span className="title-line">More conversations.</span>
              <span className="title-line" style={{ color: 'var(--primary)' }}>Less manual work.</span>
            </h1>

            {/* Supporting Text (PDF Page 4) */}
            <p className="hero-subtitle">
              KREAZY AI helps businesses automate customer conversations, support, lead qualification and repetitive tasks — 24/7.
            </p>

            {/* CTA Buttons (PDF Page 5: Pill / rounded 999px) */}
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
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => onNavigate('signup')}
                    iconRight={ArrowRight}
                  >
                    Start Automating
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      const el = document.getElementById('how-it-works-workflow');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    See How It Works →
                  </Button>
                </>
              )}
            </div>

            {/* Under the CTA (PDF Page 5) */}
            <div className="hero-channels-caption">
              <span>WhatsApp</span>
              <span>•</span>
              <span>Instagram</span>
              <span>•</span>
              <span>Messenger</span>
              <span>•</span>
              <span>Web</span>
            </div>
          </div>

        </div>
      </section>

      {/* =============================================================
          SHOWCASE SECTION 1: STORE OVERVIEW & AUTOMATION (PICTURE 2)
          Connected channels, real-time telemetry, and AI-driven operations
          ============================================================= */}
      <section className="showcase-section">
        <div className="container">
          <div className="showcase-header">
            <span className="badge badge-mint" style={{ marginBottom: '0.65rem' }}>
              CENTRALIZED INTELLIGENCE
            </span>
            <h2 className="showcase-title">Store Overview &amp; Automation</h2>
            <p className="showcase-subtitle">
              Connected channels, real-time telemetry, and AI-driven commerce operations.
            </p>
          </div>

          <div className="showcase-frame">
            <img
              src="/assets/store-overview-automation.png"
              alt="Store Overview & Automation Dashboard"
              className="showcase-img"
              loading="eager"
            />
          </div>

          {/* 4 Feature Pillars Grid (High readability on desktop, stacked cleanly on mobile) */}
          <div className="showcase-features-grid">
            <div className="showcase-feature-card">
              <div className="showcase-feature-icon">
                <ShoppingBag size={20} />
              </div>
              <div className="showcase-feature-title">Autonomous Commerce</div>
              <p className="showcase-feature-desc">
                Manage orders, products, customers, and automation from one unified workspace.
              </p>
            </div>

            <div className="showcase-feature-card">
              <div className="showcase-feature-icon">
                <BarChart3 size={20} />
              </div>
              <div className="showcase-feature-title">Real-Time Analytics</div>
              <p className="showcase-feature-desc">
                Track revenue, conversations, and customer activity as it happens.
              </p>
            </div>

            <div className="showcase-feature-card">
              <div className="showcase-feature-icon">
                <Bot size={20} />
              </div>
              <div className="showcase-feature-title">Live AI Agent Activity</div>
              <p className="showcase-feature-desc">
                Monitor your AI agents, response status, and connected channels in real time.
              </p>
            </div>

            <div className="showcase-feature-card">
              <div className="showcase-feature-icon">
                <Share2 size={20} />
              </div>
              <div className="showcase-feature-title">Channel &amp; Order Management</div>
              <p className="showcase-feature-desc">
                Keep WhatsApp, Instagram, Messenger, catalog sync, and human handoff organized.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          SHOWCASE SECTION 2: OMNICHANNEL MOBILE AI CHAT (PICTURE 3)
          WhatsApp & Social conversations converting directly into orders
          ============================================================= */}
      <section className="showcase-section showcase-section-alt">
        <div className="container">
          <div className="showcase-header">
            <span className="badge badge-mint" style={{ marginBottom: '0.65rem' }}>
              CONVERSATIONAL COMMERCE
            </span>
            <h2 className="showcase-title">Seamless Omnichannel Conversations</h2>
            <p className="showcase-subtitle">
              Turn WhatsApp, Instagram, and Messenger chats into confirmed sales automatically with sub-second AI agents.
            </p>
          </div>

          <div className="showcase-frame">
            <img
              src="/assets/omnichannel-mobile-chat.png"
              alt="Omnichannel WhatsApp and Social Commerce AI Chatbot"
              className="showcase-img"
              loading="lazy"
            />
          </div>

          {/* 4 Feature Pillars Grid (High readability on desktop, stacked cleanly on mobile) */}
          <div className="showcase-features-grid">
            <div className="showcase-feature-card">
              <div className="showcase-feature-icon">
                <Database size={20} />
              </div>
              <div className="showcase-feature-title">Build Your Own AI Chatbots</div>
              <p className="showcase-feature-desc">
                Train AI agents on your own business data to deliver accurate, helpful responses instantly.
              </p>
            </div>

            <div className="showcase-feature-card">
              <div className="showcase-feature-icon">
                <FileText size={20} />
              </div>
              <div className="showcase-feature-title">Instant Answers from Diverse Sources</div>
              <p className="showcase-feature-desc">
                Connect files, FAQs, product data, and public links so your AI can answer repetitive questions fast.
              </p>
            </div>

            <div className="showcase-feature-card">
              <div className="showcase-feature-icon">
                <MessageSquare size={20} />
              </div>
              <div className="showcase-feature-title">Seamless Omnichannel Conversations</div>
              <p className="showcase-feature-desc">
                Keep conversations flowing across WhatsApp, Instagram, Messenger, and your website.
              </p>
            </div>

            <div className="showcase-feature-card">
              <div className="showcase-feature-icon">
                <Headphones size={20} />
              </div>
              <div className="showcase-feature-title">Human Support Available as Needed</div>
              <p className="showcase-feature-desc">
                When a customer needs a real person, smoothly hand off the conversation with context intact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          2. THREE BENEFIT SECTION (PDF Page 6 — From Facebook Cover)
          Three columns:
          1. Help customers faster — Provide instant answers automatically.
          2. Spend less time repeating yourself — Let AI answer repetitive questions.
          3. Focus on growing your business — Automate conversations while your team focuses on growth.
          Thin-line icons, subtle vertical divider lines between columns.
          ============================================================= */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-grid">
            {/* Column 1 */}
            <div className="benefit-col">
              <div className="benefit-icon-box">
                <Clock size={24} strokeWidth={1.75} />
              </div>
              <h3 className="benefit-title">Help customers faster</h3>
              <p className="benefit-desc">
                Provide instant answers automatically.
              </p>
            </div>

            {/* Column 2 */}
            <div className="benefit-col">
              <div className="benefit-icon-box">
                <Repeat size={24} strokeWidth={1.75} />
              </div>
              <h3 className="benefit-title">Spend less time repeating yourself</h3>
              <p className="benefit-desc">
                Let AI answer repetitive questions.
              </p>
            </div>

            {/* Column 3 */}
            <div className="benefit-col">
              <div className="benefit-icon-box">
                <TrendingUp size={24} strokeWidth={1.75} />
              </div>
              <h3 className="benefit-title">Focus on growing your business</h3>
              <p className="benefit-desc">
                Automate conversations while your team focuses on growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          3. AUTOMATION / WORKFLOW SECTION (PDF Page 6)
          Heading: From message to action. Automatically.
          Interactive horizontal workflow:
          Customer Message → AI Agent → Understand Intent → Take Action → CRM / Human
          Elegant white rounded cards connected with green lines & animated circles.
          Includes the live interactive conversation order simulator!
          ============================================================= */}
      <section className="workflow-section" id="how-it-works-workflow">
        <div className="container">
          <div className="section-header-centered">
            <span className="badge badge-mint" style={{ marginBottom: '0.75rem' }}>
              SEAMLESS CONVERSATION PIPELINE
            </span>
            <h2 className="section-title">
              From message to action. Automatically.
            </h2>
            <p className="section-subtitle">
              Every message flows through an intelligent pipeline designed to resolve inquiries,
              confirm orders, and update your business systems in real time.
            </p>
          </div>

          {/* Interactive Horizontal Workflow Bar */}
          <div className="interactive-flow-bar" style={{ marginBottom: 'var(--space-12)' }}>
            {workflowSteps.map((step, idx) => {
              const isActive = activeWorkflowStep === idx + 1;
              return (
                <div
                  key={step.num}
                  className={`flow-step-card ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveWorkflowStep(idx + 1)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="flow-step-num">{step.num}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--mint-soft)', padding: '2px 6px', borderRadius: '4px' }}>
                        {step.badge}
                      </span>
                    </div>
                    <div className="flow-step-name">{step.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.35rem' }}>
                      {step.subtitle}
                    </div>
                  </div>
                  <p className="flow-step-desc">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =============================================================
          4. CHANNELS SECTION (PDF Page 7)
          Heading: One AI agent. Every conversation.
          Clean integration cards for:
          • WhatsApp • Instagram • Facebook Messenger • Website Chat • CRM • Email
          Mostly white cards with subtle KREAZY green accents.
          ============================================================= */}
      <section className="channels-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="badge badge-mint" style={{ marginBottom: '0.75rem' }}>
              UNIFIED OMNICHANNEL SUITE
            </span>
            <h2 className="section-title">
              One AI agent. Every conversation.
            </h2>
            <p className="section-subtitle">
              Connect your official communication channels in minutes. KREAZY AI unifies customer
              touchpoints into a single continuous intelligence engine.
            </p>
          </div>

          <div className="channels-grid">
            {channels.map((chan, idx) => {
              const Icon = chan.icon;
              return (
                <div key={idx} className="channel-card">
                  <div>
                    <div className="channel-card-top">
                      <div
                        className="channel-icon-wrap"
                        style={{ backgroundColor: chan.iconBg, color: chan.iconColor }}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <div className="channel-card-name">{chan.name}</div>
                        <span className="badge badge-mint" style={{ fontSize: '0.7rem', padding: '1px 7px' }}>
                          {chan.tag}
                        </span>
                      </div>
                    </div>
                    <p className="channel-card-desc">{chan.desc}</p>
                  </div>
                  <div className="channel-card-footer">
                    <CheckCircle2 size={15} color="var(--green)" />
                    <span>Official API integration • Live Sync</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =============================================================
          5. FEATURE CARDS (PDF Page 7)
          Editorial-style cards with numbers 01-06:
          • 24/7 AI Customer Support • Lead Qualification
          • Appointment Booking • Automated Follow-Ups
          • Human Handoff • CRM Integration
          Mix of white & soft mint backgrounds, large numbers, bold typography.
          ============================================================= */}
      <section className="features-editorial-section">
        <div className="container">
          <div className="section-header-centered">
            <span className="badge badge-mint" style={{ marginBottom: '0.75rem' }}>
              CORE AUTOMATION CAPABILITIES
            </span>
            <h2 className="section-title">
              Designed for High-Volume Commerce
            </h2>
            <p className="section-subtitle">
              Everything required to eliminate manual typing bottlenecks, scale customer satisfaction,
              and capture confirmed orders around the clock.
            </p>
          </div>

          <div className="features-editorial-grid">
            {editorialFeatures.map((feat) => (
              <div
                key={feat.num}
                className={`editorial-card ${feat.isMint ? 'mint-bg' : 'white-bg'}`}
              >
                <div>
                  <div className="editorial-card-num">{feat.num}</div>
                  <h3 className="editorial-card-title">{feat.title}</h3>
                  <p className="editorial-card-desc">{feat.desc}</p>
                </div>
                <div>
                  <span className="editorial-card-tag">
                    <Check size={14} color="var(--green)" />
                    <span>{feat.tag}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================================================
          6. MEASURABLE BUSINESS OUTCOMES / PROOF METRICS
          ============================================================= */}
      <section className="proof-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="badge badge-mint">MEASURABLE BUSINESS IMPACT</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 850, color: 'var(--primary-dark)', marginTop: '0.5rem', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
              Why Growing Merchants Trust KREAZY AI
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
              <div className="proof-desc">Close late-night orders automatically while your human staff sleeps.</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val olive">100%</div>
              <div className="proof-label">Catalog Accuracy</div>
              <div className="proof-desc">Answers strictly grounded in your verified products, sizes, and pricing.</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val">Official</div>
              <div className="proof-label">Meta Cloud Connection</div>
              <div className="proof-desc">Official Meta Cloud APIs with zero risk of account blocks or bans.</div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          7. PRICING SECTION (BDT ৳1,990 & USD $19 TIERS)
          ============================================================= */}
      <PricingTiersSection
        onNavigate={onNavigate}
        title="Predictable Pricing That Pays For Itself"
        subtitle="Choose the plan that fits your current sales volume. Start with our 7-day free trial—no credit card required."
      />

      {/* =============================================================
          8. FREQUENTLY ASKED QUESTIONS (ACCORDION)
          ============================================================= */}
      <section style={{ padding: 'var(--space-20) 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="section-header-centered">
            <span className="badge badge-mint" style={{ marginBottom: '0.75rem' }}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="section-title">
              Everything You Need to Know
            </h2>
            <p className="section-subtitle">
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

      {/* =============================================================
          9. FOUNDER STRATEGY SESSION & CONSULTATION
          ============================================================= */}
      <section className="founder-section" id="founder-meeting">
        <div className="container">
          <div className="founder-card">
            <div className="founder-info">
              <span className="badge badge-mint" style={{ alignSelf: 'flex-start' }}>
                DIRECT FOUNDER CONSULTATION
              </span>
              <h2>Want a Custom Strategy for Your Store?</h2>
              <p>
                Talk directly with the KREAZY AI product engineering team about how to automate your specific product catalog, Meta ad funnels, and customer volume.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-dark)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--green)" />
                  <span>Review your actual customer conversation bottlenecks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-dark)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--green)" />
                  <span>Live demonstration on your specific product catalog</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-dark)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--green)" />
                  <span>Setup and onboarding guidance before launch</span>
                </div>
              </div>
            </div>

            {/* Founder Meeting Booking Interface */}
            <div className="founder-booking-form">
              {founderSubmitted ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4) auto', color: 'var(--green)' }}>
                    <Check size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Meeting Scheduled</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    Thank you, {founderForm.name}. A calendar invitation has been prepared for {founderForm.company}. We will connect via Google Meet at your preferred time.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setFounderSubmitted(false)}>
                    Schedule Another Session
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFounderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '2px', fontFamily: 'var(--font-heading)' }}>
                    Book a Founder Strategy Call
                  </div>

                  {founderError && (
                    <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', border: '1px solid #FCA5A5' }}>
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

      {/* =============================================================
          10. FINAL CTA SECTION (PDF Page 8)
          Soft mint background with abstract green shapes around edges.
          Main text: Ready for fewer repetitive conversations?
          Supporting: Let KREAZY AI handle the repetitive work while your team focuses on customers and growth.
          Button: Start with KREAZY AI
          ============================================================= */}
      <section className="final-cta-section">
        <div className="container">
          <div className="final-cta-card">
            <h2 className="final-cta-title">
              Ready for fewer repetitive conversations?
            </h2>
            <p className="final-cta-desc">
              Let KREAZY AI handle the repetitive work while your team focuses on customers and growth.
            </p>
            <div className="final-cta-btn-wrap">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('signup')}
                iconRight={ArrowRight}
              >
                Start with KREAZY AI
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('book-demo')}
              >
                Book a 1-on-1 Demo
              </Button>
            </div>
            <div style={{ marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>
              ⚡ Connects in 5 minutes • No credit card required • Cancel anytime
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
