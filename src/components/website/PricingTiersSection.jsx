import React, { useState } from 'react';
import { CheckCircle2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function PricingTiersSection({ onNavigate, title, subtitle, eyebrow = "PRICING PLANS" }) {
  const [currency, setCurrency] = useState('BDT'); // 'BDT' | 'USD'
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'trial',
      name: 'Free Trial',
      bdtMonthly: 0,
      bdtAnnual: 0,
      usdMonthly: 0,
      usdAnnual: 0,
      periodText: '7 days free • no card needed',
      teamText: 'Ideal for testing on 1 social channel.',
      isPopular: false,
      ctaText: 'Start 7-Day Free Trial',
      ctaVariant: 'secondary',
      limits: '500 AI conversations included',
      features: [
        '1 Connected Channel (WhatsApp, IG or Messenger)',
        'Instant AI Replies (< 1.5s response)',
        'Product & Sizing Q&A from Your Catalog',
        'Order Details Collection in Chat',
        'One-Click Human Team Handoff',
        'Bangla, Banglish & English Understanding',
        'Unified Web Inbox (1 Team Seat)'
      ]
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      bdtMonthly: 1990,
      bdtAnnual: 1590,
      usdMonthly: 19,
      usdAnnual: 15,
      periodText: 'per month • billed monthly',
      teamText: 'Everything needed to turn messages into sales.',
      isPopular: true,
      badge: 'Most Popular',
      ctaText: 'Start Pro Free Trial',
      ctaVariant: 'primary',
      limits: '5,000 AI conversations / month',
      features: [
        'Facebook, Instagram & WhatsApp (All 3 Connected)',
        '24/7 Autonomous AI Sales Agent',
        'Real-time Product Catalog & Stock Lookup',
        'Automatic Order Creation & Address Verification',
        'Instant Human Handoff with AI Draft Suggestions',
        'Bangla, Banglish & English Comprehension',
        'Track Sales Back to Meta Ads (Meta CAPI)',
        'Comment-to-DM Sales Triggers',
        'Up to 3 Team Moderator Seats'
      ]
    },
    {
      id: 'scale',
      name: 'Scale & Growth',
      bdtMonthly: 4990,
      bdtAnnual: 3990,
      usdMonthly: 49,
      usdAnnual: 39,
      periodText: 'per month • billed monthly',
      teamText: 'For high-volume merchants with active ad spend.',
      isPopular: false,
      ctaText: 'Start Scale Free Trial',
      ctaVariant: 'secondary',
      limits: '20,000 AI conversations / month',
      features: [
        'Everything in Pro with Unlimited Channels',
        'Multi-Page & Multi-Account Management',
        'Shopify & Catalog Real-time Sync',
        'High-Velocity Order Batch Export',
        'Custom Brand Tone & Safe Commercial Guardrails',
        'Meta Ads Campaign Conversion Optimization',
        'Up to 10 Team Moderator Seats',
        'Dedicated VIP Onboarding & Support'
      ]
    }
  ];

  const handlePlanSelect = (planId) => {
    if (onNavigate) {
      onNavigate('signup');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="pricing-suite-section" id="pricing">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-centered" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          {eyebrow && (
            <span className="eyebrow" style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
              {eyebrow}
            </span>
          )}
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
            {title || "Simple, Transparent Pricing"}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
            {subtitle || "Everything you need to automate conversations, capture orders, and scale multichannel customer care."}
          </p>

          {/* Currency & Billing Cycle Toggles Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {/* Currency Pill Switcher */}
            <div style={{
              display: 'inline-flex',
              background: 'rgba(28, 40, 32, 0.85)',
              border: '1px solid rgba(114, 176, 52, 0.4)',
              padding: '3px',
              borderRadius: '9999px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
              <button
                type="button"
                onClick={() => setCurrency('BDT')}
                style={{
                  background: currency === 'BDT' ? 'var(--bright-olive)' : 'transparent',
                  color: currency === 'BDT' ? '#0C1410' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '5px 14px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                🇧🇩 BDT (৳)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                style={{
                  background: currency === 'USD' ? 'var(--bright-olive)' : 'transparent',
                  color: currency === 'USD' ? '#0C1410' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '5px 14px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                🌐 USD ($)
              </button>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="pricing-billing-switch-wrap">
              <span
                className={`billing-switch-label ${!isAnnual ? 'active' : ''}`}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </span>

              <label className="switch" aria-label="Toggle annual billing discount">
                <input
                  type="checkbox"
                  checked={isAnnual}
                  onChange={(e) => setIsAnnual(e.target.checked)}
                />
                <span className="slider"></span>
              </label>

              <span
                className={`billing-switch-label ${isAnnual ? 'active' : ''}`}
                onClick={() => setIsAnnual(true)}
              >
                Annual
                <span className="billing-discount-badge">Save 20%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid (3 Columns) */}
        <div className="pricing-suite-grid">
          {plans.map((p) => {
            const isBdt = currency === 'BDT';
            const priceVal = isBdt
              ? (isAnnual ? p.bdtAnnual : p.bdtMonthly)
              : (isAnnual ? p.usdAnnual : p.usdMonthly);
            const priceFormatted = priceVal === 0 
              ? (isBdt ? '৳0' : '$0') 
              : (isBdt ? `৳${priceVal.toLocaleString()}` : `$${priceVal}`);
            const periodLabel = p.id === 'trial' ? '7 days free' : (isAnnual ? 'per month (billed annually)' : 'per month');

            return (
              <div
                key={p.id}
                className={`pricing-suite-card ${p.isPopular ? 'popular' : ''}`}
              >
                {/* Top Header */}
                <div className="pricing-suite-top">
                  <div className="pricing-suite-name-row">
                    <span className="pricing-suite-plan-name">{p.name}</span>
                    {p.badge && (
                      <span className="pricing-suite-popular-badge">{p.badge}</span>
                    )}
                  </div>

                  <div className="pricing-suite-price-row">
                    <span className="pricing-suite-price-val">{priceFormatted}</span>
                    <span className="pricing-suite-price-period">{periodLabel}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#72B034', fontWeight: 600, marginTop: '2px', marginBottom: '4px' }}>
                    {p.limits}
                  </div>

                  <div className="pricing-suite-team-desc">
                    {p.teamText}
                  </div>

                  <button
                    type="button"
                    className={`pricing-suite-cta-btn ${p.ctaVariant}`}
                    onClick={() => handlePlanSelect(p.id)}
                  >
                    {p.ctaText}
                  </button>
                </div>

                {/* Features Divider & Section */}
                <div className="pricing-suite-features-block">
                  <div className="pricing-suite-features-heading">
                    WHAT'S INCLUDED
                  </div>

                  <ul className="pricing-suite-features-list">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="pricing-suite-feature-item">
                        <CheckCircle2
                          size={18}
                          className="pricing-suite-check-icon"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust & Guarantee Strip */}
        <div className="pricing-suite-trust-strip">
          <div className="pricing-suite-trust-item">
            <ShieldCheck size={18} color="var(--bright-olive)" />
            <span>Official Meta Cloud API Verified</span>
          </div>
          <div className="pricing-suite-trust-item">
            <Zap size={18} color="var(--bright-olive)" />
            <span>Instant Setup in under 5 minutes</span>
          </div>
          <div className="pricing-suite-trust-item">
            <Sparkles size={18} color="var(--bright-olive)" />
            <span>Cancel or switch plans anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}
