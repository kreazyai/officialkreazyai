import React, { useState } from 'react';
import { Check, HelpCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export function PricingPage({ onNavigate }) {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Ideal for emerging boutique stores establishing automated customer service.',
      monthlyPrice: 59,
      annualPrice: 47,
      badge: null,
      channels: 'WhatsApp or Instagram (1 Channel)',
      limits: {
        conversations: '1,000 AI conversations / mo',
        products: 'Up to 50 active products',
        teamSeats: '2 operator seats'
      },
      features: [
        'AI Sales & Sizing Concierge',
        'Official Meta API Connectivity',
        'Standard Business Hours AI',
        'Product & FAQ Knowledge Base',
        'Manual Human Handoff Queue',
        'Email Support (24h response)'
      ],
      ctaText: 'Start 14-Day Free Trial',
      ctaVariant: 'secondary'
    },
    {
      id: 'growth',
      name: 'Growth',
      description: 'For scaling multichannel retailers looking to automate sales and order capturing.',
      monthlyPrice: 149,
      annualPrice: 119,
      badge: 'Most Popular',
      featured: true,
      channels: 'WhatsApp + Instagram + Facebook (All 3 Channels)',
      limits: {
        conversations: '5,000 AI conversations / mo',
        products: 'Up to 500 active products',
        teamSeats: '5 operator seats'
      },
      features: [
        'Everything in Starter, plus:',
        '24/7 Autonomous Sales & Support',
        'In-Chat Direct Checkout & Payments',
        'Shopify & WooCommerce Real-Time Sync',
        'Custom Discount & Escalation Rules',
        'Advanced Revenue & Conversion Analytics',
        'Priority Slack & Chat Support'
      ],
      ctaText: 'Start 14-Day Free Trial',
      ctaVariant: 'primary'
    },
    {
      id: 'enterprise',
      name: 'Scale & Enterprise',
      description: 'High-volume commerce brands requiring custom ERP, high message velocity, and SLA guarantees.',
      monthlyPrice: 349,
      annualPrice: 279,
      badge: 'High Volume',
      channels: 'Unlimited Channels + Custom Endpoints',
      limits: {
        conversations: '25,000+ AI conversations / mo',
        products: 'Unlimited products & variants',
        teamSeats: 'Unlimited operator seats'
      },
      features: [
        'Everything in Growth, plus:',
        'Dedicated Enterprise AI Agent Cluster',
        'Custom Webhooks & ERP API Connectors',
        'Enterprise Security & Role-Based Access',
        'Custom AI Safety & Policy Audit',
        '99.9% Uptime SLA Guarantee',
        'Dedicated Technical Account Manager'
      ],
      ctaText: 'Talk to Sales',
      ctaVariant: 'secondary'
    }
  ];

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="eyebrow">Clear & Predictable Plans</span>
          <h1>Simple pricing that pays for itself in captured sales</h1>
          <p>
            Start with our risk-free 14-day trial. Upgrade or adjust your plan anytime as your message volume grows.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="billing-toggle-wrap" style={{ marginTop: '2rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: !isAnnual ? 700 : 500, color: !isAnnual ? 'var(--olive-900)' : 'var(--text-muted)' }}>
              Monthly Billing
            </span>

            <label className="switch" aria-label="Toggle annual billing">
              <input 
                type="checkbox" 
                checked={isAnnual} 
                onChange={(e) => setIsAnnual(e.target.checked)} 
              />
              <span className="slider"></span>
            </label>

            <span style={{ fontSize: '0.9rem', fontWeight: isAnnual ? 700 : 500, color: isAnnual ? 'var(--olive-900)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Annual Billing
              <span className="badge badge-success">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-grid">
          {plans.map((p) => {
            const price = isAnnual ? p.annualPrice : p.monthlyPrice;
            return (
              <div key={p.id} className={`pricing-card ${p.featured ? 'featured' : ''}`}>
                {p.badge && <div className="featured-pill">{p.badge}</div>}

                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.35rem' }}>{p.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '44px' }}>
                    {p.description}
                  </p>
                </div>

                <div className="price-display">
                  <span className="price-val">${price}</span>
                  <span className="price-period">/ month {isAnnual ? '(billed annually)' : ''}</span>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', margin: '1rem 0', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div><strong>Channels:</strong> {p.channels}</div>
                  <div><strong>AI Volume:</strong> {p.limits.conversations}</div>
                  <div><strong>Catalog:</strong> {p.limits.products}</div>
                </div>

                <Button
                  variant={p.ctaVariant}
                  size="md"
                  onClick={() => p.id === 'enterprise' ? onNavigate('contact') : onNavigate('signup')}
                  style={{ width: '100%', marginBottom: '1.5rem' }}
                >
                  {p.ctaText}
                </Button>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Included Capabilities:
                </div>

                <ul className="pricing-features-list">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="pricing-feature-item">
                      <Check size={16} color="var(--olive-700)" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Value Guarantee Note */}
        <div style={{ marginTop: 'var(--space-12)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="var(--olive-700)" /> 14-day free trial on all plans
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Check size={16} color="var(--olive-700)" /> No credit card required to start
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={16} color="var(--olive-700)" /> Cancel or change plan anytime
          </span>
        </div>
      </div>
    </div>
  );
}
