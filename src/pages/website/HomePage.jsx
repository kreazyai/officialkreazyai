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

/* White monochrome social platform icons for macOS hero environment (Item 3) */
const WhatsAppIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.12c-1.48 0-2.94-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.1 8.1 0 0 1-1.25-4.35c0-4.49 3.66-8.15 8.16-8.15 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.76c0 4.49-3.66 8.16-8.16 8.16zm4.47-6.11c-.24-.12-1.45-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.24-.64.8-.78.96-.15.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.15-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.15.16-.24.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.3-.23.24-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.16 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.45-.6 1.66-1.17.2-.57.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28z"/>
  </svg>
);

const InstagramIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const MessengerIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.43 3.14 7.15.16.14.26.35.26.57l-.07 1.78c-.03.73.74 1.23 1.37.88l1.98-1.09c.17-.1.37-.13.56-.09.89.24 1.83.38 2.8.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.18 12.98l-2.61-2.78-5.1 2.78 5.61-5.96 2.67 2.78 5.04-2.78-5.61 5.96z"/>
  </svg>
);

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
      {/* =============================================================
          1. HERO SECTION: macOS-INSPIRED AUTONOMOUS AI WORKSPACE
          Apple/macOS interface aesthetics + AI automation + KREAZY AI branding
          ============================================================= */}
      <section className="hero-section">
        {/* Ambient Radial Mint Glows */}
        <div className="hero-ambient-glow-left" aria-hidden="true" />
        <div className="hero-ambient-glow-right" aria-hidden="true" />
        <div className="hero-ambient-glow-bottom" aria-hidden="true" />

        {/* Technical Dotted Grid Overlay */}
        <div className="hero-dotted-grid-overlay" aria-hidden="true" />

        {/* Decorative thin green workflow lines & automation network canvas (Item 7) */}
        <svg
          className="hero-bg-canvas"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 760"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="heroLineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#AEEBCB" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#0FA968" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#AEEBCB" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="heroLineGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0FA968" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#092A20" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Network Path 1: Left social platforms into KREAZY AI core */}
          <path
            d="M 60 220 C 220 160, 340 320, 520 280 C 620 260, 680 320, 720 380"
            stroke="url(#heroLineGrad1)"
            strokeWidth="1.5"
            strokeDasharray="5 7"
          />
          {/* Network Path 2: Cross connecting behind headline */}
          <path
            d="M -20 380 C 260 480, 480 340, 720 420 C 960 500, 1180 360, 1460 410"
            stroke="#0FA968"
            strokeWidth="1.2"
            strokeOpacity="0.22"
          />
          {/* Network Path 3: Right social platforms into KREAZY AI core */}
          <path
            d="M 1380 230 C 1220 170, 1100 310, 920 280 C 820 260, 760 320, 720 380"
            stroke="url(#heroLineGrad1)"
            strokeWidth="1.5"
            strokeDasharray="5 7"
          />
          {/* Network Path 4: Central AI core to CRM/Orders bottom outflow */}
          <path
            d="M 720 440 C 720 540, 580 580, 480 640"
            stroke="#AEEBCB"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            strokeDasharray="4 6"
          />
          <path
            d="M 720 440 C 720 540, 860 580, 960 640"
            stroke="#AEEBCB"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            strokeDasharray="4 6"
          />

          {/* Connection Nodes */}
          <circle cx="280" cy="240" r="4" fill="#0FA968" opacity="0.6" />
          <circle cx="520" cy="280" r="3" fill="#0FA968" opacity="0.7" />
          <circle cx="920" cy="280" r="3" fill="#0FA968" opacity="0.7" />
          <circle cx="1160" cy="250" r="4" fill="#0FA968" opacity="0.6" />
        </svg>

        {/* Floating macOS UI Environment (Items 2, 5, 6 - Desktop) */}
        <div className="hero-floating-stage" aria-hidden="true">
          {/* Top-Left: Response Engine Widget (⚡ 1.2s • Average reply) */}
          <div className="hero-float-widget float-top-left">
            <div className="widget-header-mini">
              <div className="mini-dots">
                <span className="mini-dot red" />
                <span className="mini-dot yellow" />
                <span className="mini-dot green" />
              </div>
              <span className="widget-tag">Response Engine</span>
            </div>
            <div className="widget-metric-row">
              <span className="widget-stat-number">⚡ 1.2s</span>
              <span className="widget-stat-pill">Average reply</span>
            </div>
            <div className="widget-micro-caption">Instant customer reply in Bangla &amp; English</div>
          </div>

          {/* Mid-Left: Instant AI Sales Glass Tile + WhatsApp Node (Items 3, 5) */}
          <div className="hero-float-tile float-mid-left">
            <div className="tile-icon-box">
              <Sparkles size={22} className="tile-svg-icon" />
            </div>
            <div className="tile-text-wrap">
              <div className="tile-title">Autonomous Sales</div>
              <div className="tile-subtitle">● Active on WhatsApp</div>
            </div>
            <div className="tile-badge-corner" title="WhatsApp Connected">
              <WhatsAppIcon size={13} />
            </div>
          </div>

          {/* Bottom-Left: Leads Qualified Micro Card (Item 6) */}
          <div className="hero-float-widget float-bottom-left">
            <div className="widget-lead-row">
              <div className="widget-icon-circle green">
                <User size={15} />
              </div>
              <div>
                <div className="widget-stat-number">+24</div>
                <div className="widget-stat-label">Leads qualified</div>
              </div>
            </div>
            <div className="widget-mini-bar">
              <div className="widget-mini-fill" style={{ width: '84%' }} />
            </div>
            <div className="widget-micro-caption">Auto-synced to CRM &amp; catalog</div>
          </div>

          {/* Top-Right: 24/7 Live Widget (Item 6) */}
          <div className="hero-float-widget float-top-right">
            <div className="widget-header-mini">
              <div className="mini-dots">
                <span className="mini-dot red" />
                <span className="mini-dot yellow" />
                <span className="mini-dot green" />
              </div>
              <div className="widget-live-status">
                <span className="live-dot" />
                <span>LIVE</span>
              </div>
            </div>
            <div className="widget-metric-row">
              <span className="widget-stat-number">24/7</span>
              <span className="widget-stat-pill">Always available</span>
            </div>
            <div className="widget-micro-caption">Zero queue delay across channels</div>
          </div>

          {/* Mid-Right: Order Created Glass Tile + Instagram Node (Items 3, 5) */}
          <div className="hero-float-tile float-mid-right">
            <div className="tile-icon-box">
              <ShoppingBag size={22} className="tile-svg-icon" />
            </div>
            <div className="tile-text-wrap">
              <div className="tile-title">Order Created</div>
              <div className="tile-subtitle">৳8,450 auto-captured</div>
            </div>
            <div className="tile-badge-corner" title="Instagram Connected">
              <InstagramIcon size={13} />
            </div>
          </div>

          {/* Bottom-Right: Human Handoff Micro Card (Item 5, 6) */}
          <div className="hero-float-widget float-bottom-right">
            <div className="widget-lead-row">
              <div className="widget-icon-circle dark">
                <Headphones size={15} />
              </div>
              <div>
                <div className="widget-stat-number">1 Click</div>
                <div className="widget-stat-label">Human agent handoff</div>
              </div>
            </div>
            <div className="widget-micro-caption">Seamless moderator transfer</div>
          </div>
        </div>

        {/* Central Main Composition (Items 1, 9, 10, 4) */}
        <div className="container" style={{ position: 'relative', zIndex: 3 }}>
          <div className="hero-content-wrap">
            {/* Main Headline: Exactly 'More conversations.' and 'Less manual work.' */}
            <h1 className="hero-title">
              <span className="title-line dark">More conversations.</span>
              <span className="title-line green">Less manual work.</span>
            </h1>

            {/* 3. Supporting Description */}
            <p className="hero-subtitle">
              KREAZY AI automates customer conversations, support, lead qualification, and order capture across WhatsApp, Instagram, Messenger, and Web — 24/7.
            </p>

            {/* 4. CTA Buttons */}
            <div className="hero-cta-group">
              {user ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="hero-pill-cta"
                  onClick={() => onNavigate('dashboard')}
                >
                  <span>Open Workspace Dashboard</span>
                  <ArrowRight size={18} className="cta-arrow-icon" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    className="hero-pill-cta"
                    onClick={() => onNavigate('book-demo')}
                  >
                    <span>Book a Demo</span>
                    <ArrowRight size={18} className="cta-arrow-icon" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="hero-glass-cta"
                    onClick={() => onNavigate('signup')}
                  >
                    <span>Start Automating</span>
                    <ArrowRight size={18} className="cta-arrow-icon" />
                  </Button>
                </>
              )}
            </div>

            {/* 5. Connected Platform Indicators (Under CTA - Item 10) */}
            <div className="hero-channels-row">
              <div className="hero-channel-item">
                <span className="hero-channel-icon-pill" title="WhatsApp Business">
                  <WhatsAppIcon size={14} />
                </span>
                <span className="hero-channel-label">WhatsApp</span>
              </div>
              <span className="hero-channel-dot">•</span>
              <div className="hero-channel-item">
                <span className="hero-channel-icon-pill" title="Instagram Direct">
                  <InstagramIcon size={14} />
                </span>
                <span className="hero-channel-label">Instagram</span>
              </div>
              <span className="hero-channel-dot">•</span>
              <div className="hero-channel-item">
                <span className="hero-channel-icon-pill" title="Facebook Messenger">
                  <MessengerIcon size={14} />
                </span>
                <span className="hero-channel-label">Messenger</span>
              </div>
              <span className="hero-channel-dot">•</span>
              <div className="hero-channel-item">
                <span className="hero-channel-icon-pill" title="Web Chat Widget">
                  <Globe size={14} />
                </span>
                <span className="hero-channel-label">Web Chat</span>
              </div>
            </div>

            {/* 6. Main AI Visual: macOS Autonomous Agent Window (Item 4) */}
            <div className="hero-macos-agent-window">
              {/* macOS Window Header */}
              <div className="hero-macos-window-header">
                <div className="hero-macos-traffic-lights">
                  <span className="traffic-dot traffic-red" />
                  <span className="traffic-dot traffic-yellow" />
                  <span className="traffic-dot traffic-green" />
                </div>
                <div className="hero-macos-window-title">
                  <span className="window-brand">KREAZY AI</span>
                  <span className="window-sep">/</span>
                  <span className="window-app">Autonomous Agent Workspace</span>
                </div>
                <div className="hero-macos-live-badge">
                  <span className="live-pulse-dot" />
                  <span>Listening</span>
                </div>
              </div>

              {/* macOS Window Body */}
              <div className="hero-macos-window-body">
                {/* Agent Identity & Latency Bar */}
                <div className="hero-macos-agent-subbar">
                  <div className="agent-identity">
                    <div className="agent-avatar-icon">
                      <Bot size={18} />
                    </div>
                    <div>
                      <div className="agent-name">Store Intelligence Agent</div>
                      <div className="agent-role">Multi-Channel Autonomous Commerce</div>
                    </div>
                  </div>
                  <div className="agent-latency-chip">
                    <Zap size={13} />
                    <span>⚡ 1.2s avg response</span>
                  </div>
                </div>

                {/* 4 Metric Counters Grid */}
                <div className="hero-macos-metrics-grid">
                  <div className="hero-macos-metric-card">
                    <div className="metric-number">12</div>
                    <div className="metric-label">conversations handled</div>
                  </div>
                  <div className="hero-macos-metric-card">
                    <div className="metric-number">3</div>
                    <div className="metric-label">leads qualified</div>
                  </div>
                  <div className="hero-macos-metric-card highlight">
                    <div className="metric-number">2</div>
                    <div className="metric-label">orders created</div>
                  </div>
                  <div className="hero-macos-metric-card">
                    <div className="metric-number">1</div>
                    <div className="metric-label">human handoff</div>
                  </div>
                </div>

                {/* Live Event Ticker */}
                <div className="hero-macos-event-ticker">
                  <span className="ticker-badge">LIVE EVENT</span>
                  <div className="ticker-text">
                    <span className="ticker-time">10:42:19</span>
                    <span className="ticker-channel">WhatsApp</span>
                    <span className="ticker-desc">Order #KZ-9824 auto-confirmed with address &amp; phone verification</span>
                    <span className="ticker-check">✓</span>
                  </div>
                </div>
              </div>
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
