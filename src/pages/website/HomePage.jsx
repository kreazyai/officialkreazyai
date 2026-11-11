import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Bot,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageSquare,
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
  ChevronDown,
  Globe,
  Clock,
  MessageCircle,
  Repeat,
  ArrowUpRight,
  Inbox,
  Workflow,
  Play,
  X,
  Users
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PricingTiersSection } from '../../components/website/PricingTiersSection';
import { HeroMetricCard } from '../../components/website/HeroMetricCard';
import { leadService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

/* Authentic Full-Color Platform Squircles (Hero Section) */
const WhatsAppColorSquircle = ({ size = 26 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="9" fill="#25D366" />
    <path d="M18.02 7C11.94 7 7 11.95 7 18.04c0 2.08.58 4.11 1.68 5.89L7 29l5.24-1.63a10.98 10.98 0 0 0 5.78 1.62c6.08 0 11.02-4.95 11.02-11.03C29.04 11.92 24.1 7 18.02 7zm6.44 15.65c-.27.75-1.56 1.44-2.16 1.53-.56.09-1.29.13-2.09-.13-.48-.15-1.1-.35-1.89-.7-3.35-1.46-5.54-4.88-5.71-5.1-.17-.22-1.37-1.83-1.37-3.48 0-1.66.87-2.48 1.18-2.82.31-.34.68-.43.91-.43.23 0 .46 0 .66.01.21.01.49-.08.77.58.28.68.96 2.36 1.05 2.53.08.18.14.39.02.62-.11.23-.17.37-.34.57-.17.2-.36.45-.51.6-.17.18-.35.37-.15.71.2.35.89 1.48 1.92 2.39 1.32 1.18 2.43 1.54 2.77 1.71.34.17.55.15.75-.08.2-.23.86-.99 1.09-1.33.23-.34.46-.28.77-.17.31.11 1.98.94 2.32 1.11.34.17.57.25.66.39.08.15.08.85-.19 1.6z" fill="#FFFFFF" />
  </svg>
);

const InstagramColorSquircle = ({ size = 26 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="igGradHeroSquircle" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFDC80" />
        <stop offset="25%" stopColor="#F56040" />
        <stop offset="50%" stopColor="#E1306C" />
        <stop offset="75%" stopColor="#C13584" />
        <stop offset="100%" stopColor="#833AB4" />
      </linearGradient>
    </defs>
    <rect width="36" height="36" rx="9" fill="url(#igGradHeroSquircle)" />
    <rect x="9.5" y="9.5" width="17" height="17" rx="4.8" stroke="#FFFFFF" strokeWidth="2" fill="none" />
    <circle cx="18" cy="18" r="4.2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
    <circle cx="22.8" cy="13.2" r="1.1" fill="#FFFFFF" />
  </svg>
);

const FacebookColorSquircle = ({ size = 26 }) => (
  <svg viewBox="0 0 36 36" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="9" fill="#1877F2" />
    <path d="M23.5 19l.7-4.6h-4.4v-3c0-1.2.6-2.4 2.5-2.4H24V5.1s-1.6-.3-3.2-.3c-3.2 0-5.3 1.9-5.3 5.5v3.1H11.4V19h4.1v11h5.6V19h2.4z" fill="#FFFFFF" />
  </svg>
);

/* White monochrome social platform icons for macOS hero environment (Item 3) */
const WhatsAppIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.12c-1.48 0-2.94-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.1 8.1 0 0 1-1.25-4.35c0-4.49 3.66-8.15 8.16-8.15 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.76c0 4.49-3.66 8.16-8.16 8.16zm4.47-6.11c-.24-.12-1.45-.72-1.68-.8-.23-.08-.39-.12-.56.12-.17.24-.64.8-.78.96-.15.16-.29.18-.54.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.15-.24-.02-.37.1-.49.11-.11.24-.29.37-.43.12-.15.16-.24.24-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.65.3-.23.24-.87.85-.87 2.08 0 1.22.89 2.41 1.01 2.58.12.16 1.76 2.68 4.26 3.76.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.45-.6 1.66-1.17.2-.57.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28z" />
  </svg>
);

const InstagramIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MessengerIcon = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.43 3.14 7.15.16.14.26.35.26.57l-.07 1.78c-.03.73.74 1.23 1.37.88l1.98-1.09c.17-.1.37-.13.56-.09.89.24 1.83.38 2.8.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.18 12.98l-2.61-2.78-5.1 2.78 5.61-5.96 2.67 2.78 5.04-2.78-5.61 5.96z" />
  </svg>
);

export function HomePage({ onNavigate, user }) {
  const { t } = useLanguage();
  // Demo Walkthrough Modal State
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState('inbox');

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
      q: 'What is KREAZY AI?',
      a: 'A 24/7 AI sales agent for WhatsApp, Instagram, and Messenger. It answers product questions, guides sizing, and closes orders directly in chat.'
    },
    {
      q: 'Which channels are supported?',
      a: 'Official WhatsApp Business Cloud API, Instagram Direct & Stories, Facebook Messenger, and Web Live Chat.'
    },
    {
      q: 'Can it take orders without a website?',
      a: 'Yes. The AI collects items, sizing, delivery address, and payment method (COD, bKash, Card) directly in chat.'
    },
    {
      q: 'How does human handoff work?',
      a: 'Staff can step in anytime with one click. The AI provides complete chat context and drafted suggestions.'
    },
    {
      q: 'Does it understand Bangla and Banglish?',
      a: 'Yes. It natively understands Bangla, Banglish, Spanish, and English.'
    },
    {
      q: 'Does it work with Meta ads?',
      a: 'Yes. It engages Click-to-WhatsApp and Instagram ad leads in under 1.5s, sending purchase events back to Meta CAPI.'
    },
    {
      q: 'How does the free trial work?',
      a: '7-day free trial with 500 AI conversations. No credit card required. Cancel anytime.'
    },
    {
      q: 'How long does setup take?',
      a: '5 minutes with zero coding. Connect via official Meta login and upload your catalog.'
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

  // Dynamic localized data lists
  const dynamicHomeFaqs = Array.isArray(t('homeFaqs')) ? t('homeFaqs') : homeFaqs;
  const dynamicWorkflowSteps = workflowSteps.map((step, idx) => ({
    ...step,
    title: t(`workflow.step${idx + 1}Title`, step.title),
    subtitle: t(`workflow.step${idx + 1}Sub`, step.subtitle),
    desc: t(`workflow.step${idx + 1}Desc`, step.desc),
    badge: t(`workflow.step${idx + 1}Badge`, step.badge)
  }));
  const dynamicEditorialFeatures = editorialFeatures.map((feat, idx) => ({
    ...feat,
    title: t(`capabilities.f${idx + 1}Title`, feat.title),
    desc: t(`capabilities.f${idx + 1}Desc`, feat.desc),
    tag: t(`capabilities.f${idx + 1}Tag`, feat.tag)
  }));
  const dynamicChannels = channels.map((chan, idx) => ({
    ...chan,
    name: t(`channels.c${idx + 1}Name`, chan.name),
    tag: t(`channels.c${idx + 1}Tag`, chan.tag),
    desc: t(`channels.c${idx + 1}Desc`, chan.desc)
  }));

  return (
    <div className="homepage-content">
      {/* =============================================================
          1. HERO SECTION: "YOUR BUSINESS AUTOMATION" TWO-COLUMN SHOWCASE
          Matched to the high-converting SaaS visual identity:
          - Left: Brand header, bold dark+green headline, subtitle, 
                  4 benefit pills, primary & secondary CTAs, 
                  and colorful platform squircles
          - Right: 3D Laptop + Mobile device mockup showcase
          ============================================================= */}
      <section className="hero-section">
        {/* Ambient Cinematic Video Background */}
        <div className="hero-video-container" aria-hidden="true">
          <video
            className="hero-video-bg"
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-apogee-poster.jpg"
          >
            <source src="/hero-apogee.mp4" type="video/mp4" />
          </video>
          <div className="hero-video-overlay" />
        </div>

        <div className="container">
          <div className="hero-split-grid">
            {/* Left Column: Headline, Value Proposition & Actions */}
            <div className="hero-col-left">
              {/* AI Bootcamp Free Career Masterclass Pill */}
              <div
                onClick={() => onNavigate('aibootcampwithsadat')}
                className="bootcamp-hero-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.45rem 1.1rem 0.45rem 0.65rem',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16) 0%, rgba(255, 51, 75, 0.16) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  marginBottom: '1.25rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.15)',
                  transition: 'all 0.2s ease',
                  alignSelf: 'flex-start'
                }}
              >
                <span style={{
                  background: 'linear-gradient(135deg, #FF334B 0%, #D91D34 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}>
                  FREE MASTERCLASS
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 650, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  AI Career Bootcamp with Sadat Sakib
                  <ArrowRight size={14} color="#F59E0B" />
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="hero-headline">
                <span className="hero-headline-black">{t('hero.headlineBlack', 'Your Business')}</span>
                <span className="hero-headline-green">{t('hero.headlineGreen', 'Automation')}</span>
              </h1>

              {/* Subtitle / Value Proposition */}
              <div className="hero-tagline-block">
                <div className="hero-tagline-bold">
                  {t('hero.taglineBold', 'Connect. Automate. Engage. Grow.')}
                </div>
                <div className="hero-tagline-sub">
                  {t('hero.taglineSub', 'All from a single, powerful dashboard.')}
                </div>
              </div>

              {/* 4 Benefit / Feature Pills */}
              <div className="hero-feature-pills">
                <div className="hero-feature-pill pill-support">
                  <span className="feature-pill-icon">
                    <MessageSquare size={17} />
                  </span>
                  <span className="feature-pill-label">{t('hero.pillSupport', 'Customer Support')}</span>
                </div>

                <div className="hero-feature-pill pill-leads">
                  <span className="feature-pill-icon">
                    <Users size={17} />
                  </span>
                  <span className="feature-pill-label">{t('hero.pillLeads', 'More Leads')}</span>
                </div>

                <div className="hero-feature-pill pill-sales">
                  <span className="feature-pill-icon">
                    <BarChart3 size={17} />
                  </span>
                  <span className="feature-pill-label">{t('hero.pillSales', 'Higher Sales')}</span>
                </div>

                <div className="hero-feature-pill pill-time">
                  <span className="feature-pill-icon">
                    <Clock size={17} />
                  </span>
                  <span className="feature-pill-label">{t('hero.pillTime', 'Save Time')}</span>
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="hero-action-buttons">
                <button
                  type="button"
                  className="hero-btn-dark"
                  onClick={() => onNavigate(user ? 'dashboard' : 'signup')}
                >
                  <span>{t('hero.ctaPrimary', 'Get Started')}</span>
                  <ArrowRight size={17} className="btn-arrow" />
                </button>

                <button
                  type="button"
                  className="hero-btn-outline"
                  onClick={() => onNavigate('book-demo')}
                >
                  <span>{t('hero.ctaBookDemo', 'Book a Demo')}</span>
                  <Calendar size={17} className="btn-calendar" />
                </button>
              </div>

              {/* Social Channels Proof */}
              <div className="hero-social-strip">
                <div className="hero-social-icons">
                  <div
                    className="social-squircle-btn"
                    title="WhatsApp Business API"
                    onClick={() => onNavigate('integrations')}
                  >
                    <WhatsAppColorSquircle size={26} />
                  </div>
                  <div
                    className="social-squircle-btn"
                    title="Instagram Direct Automation"
                    onClick={() => onNavigate('integrations')}
                  >
                    <InstagramColorSquircle size={26} />
                  </div>
                  <div
                    className="social-squircle-btn"
                    title="Facebook Messenger Automation"
                    onClick={() => onNavigate('integrations')}
                  >
                    <FacebookColorSquircle size={26} />
                  </div>
                </div>
                <span className="hero-social-text">
                  {t('hero.socialStripText', 'All Your Conversations in One Dashboard')}
                </span>
              </div>
            </div>

            {/* Right Column: Floating Performance Metric Card (Apogee Style) */}
            <div className="hero-col-right">
              <HeroMetricCard />
            </div>
          </div>
        </div>

        {/* Interactive "Watch Demo" Product Tour Modal */}
        {showDemoModal && (
          <div
            className="hero-modal-backdrop"
            onClick={() => setShowDemoModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="hero-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="hero-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="hero-play-circle" style={{ color: '#00A859' }}>Play</div>
                  <h3 className="hero-modal-title">{t('hero.modalTitle', 'KreazyAI Live Platform Demo')}</h3>
                </div>
                <button
                  type="button"
                  className="hero-modal-close-btn"
                  onClick={() => setShowDemoModal(false)}
                  aria-label="Close demo modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="hero-modal-body">
                {/* Demo Feature Tabs */}
                <div className="hero-demo-tabs">
                  <button
                    type="button"
                    className={`hero-demo-tab-btn ${activeDemoTab === 'inbox' ? 'active' : ''}`}
                    onClick={() => setActiveDemoTab('inbox')}
                  >
                    {t('hero.tabInbox', 'Omnichannel Inbox')}
                  </button>
                  <button
                    type="button"
                    className={`hero-demo-tab-btn ${activeDemoTab === 'commerce' ? 'active' : ''}`}
                    onClick={() => setActiveDemoTab('commerce')}
                  >
                    {t('hero.tabCommerce', 'AI Commerce Agent')}
                  </button>
                  <button
                    type="button"
                    className={`hero-demo-tab-btn ${activeDemoTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveDemoTab('analytics')}
                  >
                    {t('hero.tabAnalytics', 'Live Telemetry & Growth')}
                  </button>
                </div>

                {activeDemoTab === 'inbox' && (
                  <div className="hero-demo-card">
                    <h3>{t('hero.inboxTitle', 'One Unified Inbox Across All Social Channels')}</h3>
                    <p>
                      {t('hero.inboxDesc', 'Receive incoming messages instantly from WhatsApp Business, Instagram DMs, Story Mentions, and Facebook Messenger. Your AI sales agent replies in under 1.2 seconds, answers sizing and stock questions, and qualifies buyer intent.')}
                    </p>
                    <div className="hero-demo-features-list">
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>Meta Cloud API official verified routing</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>Bangla &amp; English bilingual natural NLP</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>1-Click seamless human agent takeover</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>Zero message loss during peak traffic</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'commerce' && (
                  <div className="hero-demo-card">
                    <h3>{t('hero.commerceTitle', 'Direct In-Chat Checkout & Order Capture')}</h3>
                    <p>
                      {t('hero.commerceDesc', 'Never send buyers away to a clunky external link. Kreazy AI collects customer name, phone number, delivery address, verifies Cash on Delivery eligibility, and generates an order with courier-ready tracking.')}
                    </p>
                    <div className="hero-demo-features-list">
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>Live inventory &amp; variant lookups</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>Automated address &amp; phone verification</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>Syncs to Shopify, WooCommerce &amp; Sheets</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>+28% conversion lift on abandoned carts</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'analytics' && (
                  <div className="hero-demo-card">
                    <h3>{t('hero.analyticsTitle', 'Actionable Telemetry & Business Intelligence')}</h3>
                    <p>
                      {t('hero.analyticsDesc', 'Monitor live conversations handled, conversion rates, channel ROI, and top-performing automated replies all from a single executive dashboard.')}
                    </p>
                    <div className="hero-demo-features-list">
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>12,580+ conversations tracked in real-time</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>+62% average sales growth lift</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>Sub-second response latency benchmarks</span>
                      </div>
                      <div className="hero-demo-feature-item">
                        <CheckCircle2 size={16} />
                        <span>Executive export &amp; courier webhook sync</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="hero-modal-footer">
                <span className="hero-modal-footer-text">
                  {t('hero.modalWalkthrough', 'Want a tailored 1-on-1 walkthrough for your store?')}
                </span>
                <div className="hero-modal-actions">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setShowDemoModal(false);
                      onNavigate('book-demo');
                    }}
                  >
                    <span>{t('hero.modalBookBtn', 'Book Founder Demo')}</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setShowDemoModal(false);
                      onNavigate('signup');
                    }}
                  >
                    <span>{t('hero.modalTrialBtn', 'Start Free Trial')}</span>
                    <ArrowRight size={15} style={{ marginLeft: 6 }} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =============================================================
          SHOWCASE SECTION 1: STORE OVERVIEW & AUTOMATION
          ============================================================= */}
      <section className="showcase-section">
        <div className="container">
          <div className="showcase-header">
            <span className="badge badge-mint" style={{ marginBottom: '0.65rem' }}>
              {t('showcase.overviewEyebrow', 'CENTRALIZED INTELLIGENCE')}
            </span>
            <h2 className="showcase-title">{t('showcase.overviewTitle', 'Store Overview & Automation')}</h2>
          </div>

          <div className="showcase-frame">
            <img
              src="/assets/store-overview-automation.png"
              alt="Store Overview & Automation Dashboard"
              className="showcase-img"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* =============================================================
          SHOWCASE SECTION 2: OMNICHANNEL MOBILE AI CHAT
          ============================================================= */}
      <section className="showcase-section showcase-section-alt">
        <div className="container">
          <div className="showcase-header">
            <span className="badge badge-mint" style={{ marginBottom: '0.65rem' }}>
              {t('showcase.omniEyebrow', 'CONVERSATIONAL COMMERCE')}
            </span>
            <h2 className="showcase-title">{t('showcase.omniTitle', 'Seamless Omnichannel Conversations')}</h2>
          </div>

          <div className="showcase-frame">
            <img
              src="/assets/omnichannel-mobile-chat.png"
              alt="Omnichannel WhatsApp and Social Commerce AI Chatbot"
              className="showcase-img"
              loading="lazy"
            />
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
              <h3 className="benefit-title">{t('benefits.b1Title', 'Help customers faster')}</h3>
              <p className="benefit-desc">
                {t('benefits.b1Desc', 'Provide instant answers automatically.')}
              </p>
            </div>

            {/* Column 2 */}
            <div className="benefit-col">
              <div className="benefit-icon-box">
                <Repeat size={24} strokeWidth={1.75} />
              </div>
              <h3 className="benefit-title">{t('benefits.b2Title', 'Spend less time repeating yourself')}</h3>
              <p className="benefit-desc">
                {t('benefits.b2Desc', 'Let AI answer repetitive questions.')}
              </p>
            </div>

            {/* Column 3 */}
            <div className="benefit-col">
              <div className="benefit-icon-box">
                <TrendingUp size={24} strokeWidth={1.75} />
              </div>
              <h3 className="benefit-title">{t('benefits.b3Title', 'Focus on growing your business')}</h3>
              <p className="benefit-desc">
                {t('benefits.b3Desc', 'Automate conversations while your team focuses on growth.')}
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
              {t('workflow.eyebrow', 'SEAMLESS CONVERSATION PIPELINE')}
            </span>
            <h2 className="section-title">
              {t('workflow.title', 'From message to action. Automatically.')}
            </h2>
          </div>

          {/* Interactive Horizontal Workflow Bar */}
          <div className="interactive-flow-bar" style={{ marginBottom: 'var(--space-12)' }}>
            {dynamicWorkflowSteps.map((step, idx) => {
              const isActive = activeWorkflowStep === idx + 1;
              return (
                <div
                  key={step.num}
                  className={`flow-step-card ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveWorkflowStep(idx + 1)}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="flow-step-num" style={{ marginBottom: '0.65rem' }}>
                      {step.num}
                    </div>
                    <div className="flow-step-name">{step.title}</div>
                  </div>
                  <p className="flow-step-desc" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                    {step.desc}
                  </p>
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
          <div className="section-header-centered" style={{ marginBottom: '2.5rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              {t('channels.title', 'One AI agent. Every conversation.')}
            </h2>
          </div>

          <div className="channels-grid">
            {dynamicChannels.map((chan, idx) => {
              const Icon = chan.icon;
              return (
                <div key={idx} className="channel-card" style={{ paddingBottom: '1.75rem', justifyContent: 'flex-start' }}>
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
                    <p className="channel-card-desc" style={{ marginBottom: 0 }}>{chan.desc}</p>
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
              {t('capabilities.eyebrow', 'CORE AUTOMATION CAPABILITIES')}
            </span>
            <h2 className="section-title">
              {t('capabilities.title', 'Designed for High-Volume Commerce')}
            </h2>
          </div>

          <div className="features-editorial-grid">
            {dynamicEditorialFeatures.map((feat) => (
              <div
                key={feat.title}
                className={`editorial-card ${feat.isMint ? 'mint-bg' : 'white-bg'}`}
              >
                <h3 className="editorial-card-title">{feat.title}</h3>
                <p className="editorial-card-desc">{feat.desc}</p>
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
            <span className="badge badge-mint">{t('metrics.eyebrow', 'MEASURABLE BUSINESS IMPACT')}</span>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 850, color: 'var(--primary-dark)', marginTop: '0.5rem', letterSpacing: '-0.035em', lineHeight: 1.1 }}>
              {t('metrics.title', 'Why Growing Merchants Trust KREAZY AI')}
            </h2>
          </div>

          <div className="proof-metrics-grid">
            <div className="proof-metric-item">
              <div className="proof-val olive">{t('metrics.m1Val', '< 1.5s')}</div>
              <div className="proof-label">{t('metrics.m1Label', 'Instant First Reply')}</div>
              <div className="proof-desc">{t('metrics.m1Desc', 'Respond to potential buyers while their purchase impulse is highest.')}</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val">{t('metrics.m2Val', '24/7/365')}</div>
              <div className="proof-label">{t('metrics.m2Label', 'Zero Lost Midnight Sales')}</div>
              <div className="proof-desc">{t('metrics.m2Desc', 'Close late-night orders automatically while your human staff sleeps.')}</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val olive">{t('metrics.m3Val', '100%')}</div>
              <div className="proof-label">{t('metrics.m3Label', 'Catalog Accuracy')}</div>
              <div className="proof-desc">{t('metrics.m3Desc', 'Answers strictly grounded in your verified products, sizes, and pricing.')}</div>
            </div>
            <div className="proof-metric-item">
              <div className="proof-val">{t('metrics.m4Val', 'Official')}</div>
              <div className="proof-label">{t('metrics.m4Label', 'Meta Cloud Connection')}</div>
              <div className="proof-desc">{t('metrics.m4Desc', 'Official Meta Cloud APIs with zero risk of account blocks or bans.')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* =============================================================
          7. PRICING SECTION (BDT ৳1,990 & USD $19 TIERS)
          ============================================================= */}
      <PricingTiersSection
        onNavigate={onNavigate}
      />

      {/* =============================================================
          8. FREQUENTLY ASKED QUESTIONS (ACCORDION)
          ============================================================= */}
      <section className="home-faq-section" style={{ padding: 'var(--space-20) 0' }}>
        <div className="container">
          <div className="section-header-centered">
            <span className="badge badge-mint" style={{ marginBottom: '0.75rem' }}>
              {t('faq.eyebrow', 'FREQUENTLY ASKED QUESTIONS')}
            </span>
            <h2 className="section-title">
              {t('faq.title', 'Everything You Need to Know')}
            </h2>
            <p className="section-subtitle">
              {t('faq.subtitle', 'Common questions from business owners switching from manual typing to automated social sales.')}
            </p>
          </div>

          <div className="home-faq-grid">
            {dynamicHomeFaqs.map((faq, idx) => {
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
                {t('founderMeeting.eyebrow', 'DIRECT FOUNDER CONSULTATION')}
              </span>
              <h2>{t('founderMeeting.title', 'Want a Custom Strategy for Your Store?')}</h2>
              <p>
                {t('founderMeeting.subtitle', 'Talk directly with the KREAZY AI product engineering team about how to automate your specific product catalog, Meta ad funnels, and customer volume.')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-dark)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--green)" />
                  <span>{t('founderMeeting.bullet1', 'Review your actual customer conversation bottlenecks')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-dark)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--green)" />
                  <span>{t('founderMeeting.bullet2', 'Live demonstration on your specific product catalog')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-dark)', fontSize: '0.925rem' }}>
                  <CheckCircle2 size={18} color="var(--green)" />
                  <span>{t('founderMeeting.bullet3', 'Setup and onboarding guidance before launch')}</span>
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
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-dark)', marginBottom: 'var(--space-2)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                    {t('founderMeeting.scheduledTitle', 'Meeting Scheduled')}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                    {t('founderMeeting.scheduledDesc', `Thank you, ${founderForm.name}. A calendar invitation has been prepared for ${founderForm.company}. We will connect via Google Meet at your preferred time.`)}
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setFounderSubmitted(false)}>
                    {t('founderMeeting.scheduleAnotherBtn', 'Schedule Another Session')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFounderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '2px', fontFamily: 'var(--font-heading)' }}>
                    {t('founderMeeting.formTitle', 'Book a Founder Strategy Call')}
                  </div>

                  {founderError && (
                    <div style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', border: '1px solid #FCA5A5' }}>
                      {founderError}
                    </div>
                  )}

                  <div className="founder-form-row-2">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>{t('founderMeeting.fullName', 'Your Name *')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('founderMeeting.fullNamePlaceholder', 'Sakib Ahmed')}
                        className="form-input"
                        value={founderForm.name}
                        onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>{t('founderMeeting.email', 'Work Email *')}</label>
                      <input
                        type="email"
                        required
                        placeholder={t('founderMeeting.emailPlaceholder', 'sakib@brand.com')}
                        className="form-input"
                        value={founderForm.email}
                        onChange={(e) => setFounderForm({ ...founderForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="founder-form-row-2">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>{t('founderMeeting.phone', 'Phone / WhatsApp')}</label>
                      <input
                        type="tel"
                        placeholder={t('founderMeeting.phonePlaceholder', '+880 1700-000000')}
                        className="form-input"
                        value={founderForm.phone}
                        onChange={(e) => setFounderForm({ ...founderForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.775rem' }}>{t('founderMeeting.company', 'Company / Page Name *')}</label>
                      <input
                        type="text"
                        required
                        placeholder={t('founderMeeting.companyPlaceholder', 'Artisan Wear')}
                        className="form-input"
                        value={founderForm.company}
                        onChange={(e) => setFounderForm({ ...founderForm, company: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.775rem' }}>{t('founderMeeting.message', 'Current Automation Bottlenecks')}</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      placeholder={t('founderMeeting.messagePlaceholder', 'What is your biggest pain point with customer inquiries right now?')}
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
                    {founderLoading ? t('founderMeeting.submittingBtn', 'Booking Session...') : t('founderMeeting.submitBtn', 'Confirm Founder Strategy Call')}
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
              {t('finalCta.title', 'Ready for fewer repetitive conversations?')}
            </h2>
            <p className="final-cta-desc">
              {t('finalCta.subtitle', 'Let KREAZY AI handle the repetitive work while your team focuses on customers and growth.')}
            </p>
            <div className="final-cta-btn-wrap">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('signup')}
                iconRight={ArrowRight}
              >
                {t('finalCta.startBtn', 'Start with KREAZY AI')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('book-demo')}
              >
                {t('finalCta.demoBtn', 'Book a 1-on-1 Demo')}
              </Button>
            </div>
            <div style={{ marginTop: '1.25rem', fontSize: '0.825rem', color: 'var(--text-secondary)', position: 'relative', zIndex: 1 }}>
              {t('finalCta.guarantee', 'Connects in 5 minutes • No credit card required • Cancel anytime')}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
