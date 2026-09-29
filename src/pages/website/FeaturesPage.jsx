import React, { useState } from 'react';
import { 
  Bot, 
  Headphones, 
  MessageSquare, 
  Share2, 
  ShoppingBag, 
  Boxes, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  DollarSign, 
  Sliders, 
  Bell, 
  ArrowRight,
  Check,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';

const FEATURE_CATEGORIES = [
  { id: 'all', label: 'All Capabilities' },
  { id: 'sales-ai', label: 'AI Commerce & Sales' },
  { id: 'channels', label: 'Channel Integrations' },
  { id: 'operations', label: 'Operations & Orders' },
  { id: 'governance', label: 'Safety & Handoff' }
];

const FEATURES_LIST = [
  {
    id: 'f1',
    category: 'sales-ai',
    title: 'AI Sales Concierge',
    icon: Bot,
    tag: 'Autonomous Revenue',
    desc: 'Understands customer taste, sizing, and preferences to recommend matching products and drive high-conversion checkouts.',
    bullets: ['Tailored product suggestions', 'Discount approval thresholds', 'Upsell & cross-sell logic']
  },
  {
    id: 'f2',
    category: 'sales-ai',
    title: '24/7 Customer Care Agent',
    icon: Headphones,
    tag: 'Instant Resolution',
    desc: 'Instantly answers questions regarding delivery times, fabric care, dimensions, store policies, and order statuses.',
    bullets: ['Sub-3-second responses', 'Multi-turn context memory', 'Multilingual auto-translation']
  },
  {
    id: 'f3',
    category: 'channels',
    title: 'WhatsApp Business Cloud',
    icon: MessageSquare,
    tag: 'Official Meta API',
    desc: 'Automates one-on-one WhatsApp conversations, catalog shares, interactive buttons, and delivery alerts.',
    bullets: ['Rich media & image cards', 'WhatsApp Pay compatibility', 'High delivery rate']
  },
  {
    id: 'f4',
    category: 'channels',
    title: 'Instagram Direct Automation',
    icon: Share2,
    tag: 'Story & DM Sync',
    desc: 'Responds instantly to story replies, product mentions, and DM inquiries with interactive product cards.',
    bullets: ['Story mention auto-replies', 'Reel link-to-buy capture', 'Follower verification']
  },
  {
    id: 'f5',
    category: 'channels',
    title: 'Facebook Messenger Integration',
    icon: Share2,
    tag: 'Page Ingestion',
    desc: 'Synchronizes your official business Facebook page messages and ad campaign click-to-message leads.',
    bullets: ['Ad traffic conversion', 'Post comment triggers', 'Unified customer ID matching']
  },
  {
    id: 'f6',
    category: 'operations',
    title: 'Live Product Catalog Engine',
    icon: Boxes,
    tag: 'Inventory Sync',
    desc: 'Centralized product index supporting SKUs, variants, prices, inventory levels, and AI product descriptions.',
    bullets: ['Real-time stock reservation', 'Variant selector', 'Shopify / WooCommerce sync']
  },
  {
    id: 'f7',
    category: 'operations',
    title: 'Autonomous Order Management',
    icon: ShoppingBag,
    tag: 'Order Lifecycle',
    desc: 'Tracks every order from pending to delivered, with automated courier tracking updates to the customer chat.',
    bullets: ['Automatic address validation', 'Instant invoice generation', 'Payment verification']
  },
  {
    id: 'f8',
    category: 'operations',
    title: 'Omnichannel Customer CRM',
    icon: Users,
    tag: 'Customer 360',
    desc: 'Maintains a single customer profile across WhatsApp, Instagram, and Facebook with full order history and tags.',
    bullets: ['Lifetime spend tracking', 'Channel identification', 'Custom segmentation tags']
  },
  {
    id: 'f9',
    category: 'governance',
    title: 'Deterministic Guardrails',
    icon: ShieldCheck,
    tag: 'Zero Hallucinations',
    desc: 'Strict policy constraints prevent the AI from quoting unapproved discounts, inventing fake policies, or damaging brand trust.',
    bullets: ['Configurable discount caps', 'Banned phrase filters', 'Automatic sentiment escalations']
  }
];

export function FeaturesPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFeatures = selectedCategory === 'all' 
    ? FEATURES_LIST 
    : FEATURES_LIST.filter(f => f.category === selectedCategory);

  return (
    <div className="home-page-root" style={{ padding: '3.5rem 0 6rem 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header-centered" style={{ marginBottom: '3.5rem' }}>
          <div className="section-eyebrow-pill">
            <span>PLATFORM CAPABILITIES</span>
          </div>
          <h1 className="section-title-large">
            Every capability your business needs to automate
          </h1>
          <p className="section-subtitle-clean">
            Explore the comprehensive suite of autonomous agents, official channel integrations, and commerce workflows.
          </p>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            {FEATURE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`prompt-suggestion-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          {filteredFeatures.map(feat => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="winning-plan-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color="#2563EB" />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#F1F5F9', color: '#2563EB' }}>
                    {feat.tag}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.885rem', lineHeight: 1.6, color: '#475569', marginBottom: '1.25rem', minHeight: '42px' }}>
                  {feat.desc}
                </p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #F1F5F9', paddingTop: '1rem', marginTop: 'auto' }}>
                  {feat.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', color: '#334155' }}>
                      <Check size={14} color="#2563EB" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div style={{ background: '#080D1A', color: '#FFFFFF', borderRadius: '24px', padding: '3.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
            Experience the Full Platform in Action
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Book a personalized walkthrough with our team or start with a 14-day risk-free trial.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="hero-get-started-btn"
              onClick={() => onNavigate('signup')}
            >
              <span>Get started free</span>
              <ChevronRight size={18} />
            </button>
            <button 
              type="button" 
              className="final-cta-secondary-btn"
              onClick={() => onNavigate('book-demo')}
            >
              Book a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
