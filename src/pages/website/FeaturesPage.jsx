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
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

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
    title: 'AI Sales Agent',
    icon: Bot,
    tag: 'Autonomous Revenue',
    desc: 'Understands customer taste, sizing, and preferences to recommend matching products and drive high-conversion checkouts.',
    bullets: ['Tailored product suggestions', 'Discount approval thresholds', 'Upsell & cross-sell logic']
  },
  {
    id: 'f2',
    category: 'sales-ai',
    title: 'AI Customer Support',
    icon: Headphones,
    tag: '24/7 Concierge',
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
    title: 'Live Product Management',
    icon: Boxes,
    tag: 'Catalog Engine',
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
    title: 'Human Handoff & Copilot',
    icon: Users,
    tag: 'Team Workflow',
    desc: 'Seamlessly transfers complex inquiries to human agents with AI draft suggestions and full context summary.',
    bullets: ['One-click takeover', 'Agent assignment', 'Sentiment escalation alerts']
  },
  {
    id: 'f10',
    category: 'governance',
    title: 'AI Knowledge Base Studio',
    icon: Sliders,
    tag: 'Custom Grounding',
    desc: 'Train your assistant on your exact store policies, shipping guidelines, FAQs, and brand tone without coding.',
    bullets: ['Easy policy editor', 'Document & link indexing', 'Instant sandbox preview']
  },
  {
    id: 'f11',
    category: 'operations',
    title: 'Revenue & Speed Analytics',
    icon: DollarSign,
    tag: 'ROI Tracking',
    desc: 'Quantify automated revenue, time saved, resolution rates, and top-converting social channels in real time.',
    bullets: ['Channel breakdown', 'Resolution percentage', 'CSV / Excel exports']
  },
  {
    id: 'f12',
    category: 'governance',
    title: 'Safety Guardrails & Approvals',
    icon: ShieldCheck,
    tag: 'Brand Protection',
    desc: 'Enforce confidence thresholds, banned phrases, and mandatory supervisor approval for refunds or high discounts.',
    bullets: ['Confidence score filters', 'Refund thresholds', 'Full audit trail']
  }
];

export function FeaturesPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFeatures = selectedCategory === 'all'
    ? FEATURES_LIST
    : FEATURES_LIST.filter(f => f.category === selectedCategory);

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="eyebrow">Platform Capabilities</span>
          <h1>Comprehensive tools for automated commerce</h1>
          <p>
            Explore every component engineered to automate conversations, drive retail sales,
            and streamline operations across your digital channels.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="features-category-filters">
          {FEATURE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {filteredFeatures.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <div className="feature-icon-box">
                    <Icon size={20} />
                  </div>
                  <Badge variant="olive">{item.tag}</Badge>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {item.desc}
                </p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                  {item.bullets.map((b, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <Check size={15} color="var(--bright-olive)" style={{ flexShrink: 0 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <div className="features-cta-card">
          <h3 style={{ marginBottom: '0.5rem' }}>Need custom enterprise channel orchestration?</h3>
          <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto', fontSize: '0.925rem' }}>
            We support high-volume retailers with custom ERP connectors, dedicated WhatsApp numbers, and enterprise SLAs.
          </p>
          <div className="features-cta-actions">
            <Button variant="primary" onClick={() => onNavigate('book-demo')}>
              Request Custom Demo
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('contact')}>
              Contact Solutions Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
