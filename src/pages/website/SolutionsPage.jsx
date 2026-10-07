import React, { useState } from 'react';
import {
  ShoppingBag,
  Shirt,
  Target,
  Headphones,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  Bot,
  Users
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

const SOLUTIONS = [
  {
    id: 'd2c',
    label: 'D2C Social Commerce',
    title: 'Turn Direct Messages into High-Converting Online Checkout',
    badge: 'Direct-to-Consumer',
    description: 'Transform your WhatsApp, Instagram, and Messenger inboxes from chaotic chat queues into automated, revenue-generating storefronts.',
    stats: [
      { value: '4.2x', label: 'Faster checkout completion' },
      { value: '0', label: 'Dropped inquiries in peak hours' },
      { value: '78%', label: 'Conversations resolved autonomously' }
    ],
    highlights: [
      'Automatic product catalog recommendations tailored to customer questions',
      'Real-time address, phone, and delivery area verification inside chat',
      'Instant order creation with automated invoice dispatch',
      'Zero risk of customer abandonment due to slow moderator response times'
    ]
  },
  {
    id: 'fashion',
    label: 'Fashion & Apparel Retail',
    title: 'Autonomous Sizing, Color Swatches & Live Stock Guidance',
    badge: 'Fashion & Retail',
    description: 'Provide personalized styling advice, check inventory availability across sizes (S/M/L/XL), and close orders without manual back-and-forth.',
    stats: [
      { value: '65%', label: 'Reduction in sizing inquiry time' },
      { value: '3.4x', label: 'Higher average order value via upsells' },
      { value: '94%', label: 'Stock lookup accuracy in real-time' }
    ],
    highlights: [
      'AI understands customer size and fit inquiries in Bangla and English',
      'Checks live inventory before confirming orders to prevent stockouts',
      'Suggests matching accessories and bundle discounts seamlessly',
      'Handles return policy guidance and exchange inquiries with clarity'
    ]
  },
  {
    id: 'paid-ads',
    label: 'Meta Ad Campaign Scaling',
    title: 'Convert Click-to-Message Ad Traffic into Verified Orders in Seconds',
    badge: 'Paid Ads Optimization',
    description: 'Stop burning ad budget on slow replies. Instantly engage leads clicking on Facebook and Instagram ad campaigns within 1.2 seconds.',
    stats: [
      { value: '1.2s', label: 'Average first response to ad leads' },
      { value: '62%', label: 'Higher ROAS conversion rate' },
      { value: '24/7', label: 'Continuous ad traffic capture' }
    ],
    highlights: [
      'Direct attribution from Meta Click-to-WhatsApp and Messenger ads',
      'Immediate greeting matching the specific ad creative the customer clicked',
      'Automated qualification: extracts purchase intent, address, and phone number',
      'Live customer sync directly into your store CRM or Google Sheets'
    ]
  },
  {
    id: 'support',
    label: 'Omnichannel Customer Support',
    title: '24/7 Sub-Second Answers with Intelligent Human Escalation',
    badge: 'Support Desk',
    description: 'Resolve high-frequency customer queries—delivery status, parcel tracking, store locations, and policies—without tying up human staff.',
    stats: [
      { value: '< 2s', label: 'Average answer latency' },
      { value: '88%', label: 'First-contact resolution rate' },
      { value: '1 Click', label: 'Seamless human supervisor handoff' }
    ],
    highlights: [
      'Trained strictly on your exact store policies, shipping rates, and FAQs',
      'Multi-channel unified inbox keeps customer history consolidated in one view',
      'Automatic courier tracking status retrieval for waiting buyers',
      'Sentiment analysis alerts team members when customer intervention is needed'
    ]
  },
  {
    id: 'agency',
    label: 'Multi-Brand Agencies & Groups',
    title: 'Centralized Multi-Store Control from One Scalable Platform',
    badge: 'Agencies & Enterprises',
    description: 'Manage 10+ Facebook pages, Instagram handles, and WhatsApp numbers across different retail brands from a single unified control room.',
    stats: [
      { value: '10+', label: 'Brands managed under one workspace' },
      { value: '100%', label: 'Isolated brand catalog grounding' },
      { value: '5 Min', label: 'New brand onboarding speed' }
    ],
    highlights: [
      'Role-based permissions for managers, moderators, and brand supervisors',
      'Separate knowledge bases and custom AI tones for each brand portfolio',
      'Aggregated revenue and conversation analytics across all client stores',
      'Enterprise Meta Cloud API architecture with dedicated webhooks'
    ]
  }
];

const CAPABILITY_PILLARS = [
  {
    icon: ShoppingBag,
    title: 'Autonomous In-Chat Sales',
    desc: 'Guides customers through catalog selection, sizing, and order confirmation inside WhatsApp and Instagram.'
  },
  {
    icon: Zap,
    title: 'Sub-Second Reply Latency',
    desc: 'Replies in 1.2 seconds across all Meta channels, eliminating lost sales from delayed replies.'
  },
  {
    icon: Bot,
    title: 'Native Multilingual AI',
    desc: 'Fluent in Bangla, Banglish, and English voice notes and text messages.'
  },
  {
    icon: TrendingUp,
    title: 'Couriers & Stock Sync',
    desc: 'Connects directly with Steadfast, Pathao, and RedX for immediate tracking generation.'
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Guardrails',
    desc: 'Strict price grounding and confidence thresholds prevent hallucinations and unauthorized discounts.'
  },
  {
    icon: Users,
    title: '1-Click Team Copilot',
    desc: 'Human moderators can step in anytime with complete chat history and AI draft suggestions.'
  }
];

export function SolutionsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('d2c');

  const currentSolution = SOLUTIONS.find(s => s.id === activeTab) || SOLUTIONS[0];

  return (
    <div className="solutions-page-wrapper" style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="badge badge-mint" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            TAILORED COMMERCE ARCHITECTURE
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Tailored solutions for modern social commerce
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Explore industry-specific automation built to turn customer chats into verified sales, eliminate moderator bottlenecks, and accelerate growth.
          </p>
        </div>

        {/* Industry Pill Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', overflowX: 'auto', padding: '4px' }}>
          <div className="capsule-filter-group" style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
            {SOLUTIONS.map(sol => (
              <button
                key={sol.id}
                type="button"
                onClick={() => setActiveTab(sol.id)}
                className={`capsule-filter-btn ${activeTab === sol.id ? 'active' : ''}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {sol.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Solution Showcase Card */}
        <div className="solution-showcase-box" style={{
          background: '#FFFFFF',
          border: '1.5px solid var(--border)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          boxShadow: '0 8px 30px rgba(9, 42, 32, 0.05)',
          marginBottom: '3.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span className="badge badge-mint" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
              {currentSolution.badge}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              ⚡ Configured for immediate rollout
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2 }}>
            {currentSolution.title}
          </h2>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '820px', marginBottom: '2rem' }}>
            {currentSolution.description}
          </p>

          {/* Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
            padding: '1.5rem',
            background: 'var(--mint-soft)',
            borderRadius: '16px',
            border: '1px solid rgba(15, 169, 104, 0.2)'
          }}>
            {currentSolution.stats.map((st, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                  {st.value}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          {/* Key Deliverables Grid */}
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Core Capabilities Included:
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem'
          }}>
            {currentSolution.highlights.map((h, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                background: '#FFFFFF',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 550, lineHeight: 1.5 }}>
                  {h}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="primary" size="lg" onClick={() => onNavigate('book-demo')} style={{ borderRadius: '999px' }}>
              <span>Book a Demo for {currentSolution.badge}</span>
              <ArrowRight size={17} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onNavigate('signup')} style={{ borderRadius: '999px' }}>
              <span>Start Free Trial</span>
            </Button>
          </div>
        </div>

        {/* 6 Architectural Pillars */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-mint" style={{ marginBottom: '0.5rem' }}>
            THE PLATFORM FOUNDATION
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Every solution powered by unified AI commerce
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          {CAPABILITY_PILLARS.map((col, idx) => {
            const Icon = col.icon;
            return (
              <div key={idx} style={{
                background: '#FFFFFF',
                border: '1.5px solid var(--border)',
                borderRadius: '18px',
                padding: '1.75rem',
                boxShadow: '0 4px 16px rgba(9, 42, 32, 0.04)',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--mint-soft)',
                  border: '1px solid rgba(15, 169, 104, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-dark)',
                  marginBottom: '1rem'
                }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {col.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {col.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Final CTA Banner */}
        <div style={{
          background: 'var(--primary-dark)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          textAlign: 'center',
          color: '#FFFFFF',
          border: '1.5px solid rgba(15, 169, 104, 0.3)',
          boxShadow: '0 20px 50px rgba(9, 42, 32, 0.2)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to deploy an autonomous sales solution?
          </h2>
          <p style={{ maxWidth: '580px', margin: '0 auto 1.75rem auto', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.975rem', lineHeight: 1.6 }}>
            Our solutions team will configure a personalized walkthrough using your actual store catalog and Meta channels.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('book-demo')}
              style={{ background: 'var(--green)', borderColor: 'var(--green)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>Schedule Live Demo</span>
              <ArrowRight size={17} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('contact')}
              style={{ background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.25)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>Talk to Solutions Engineer</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
