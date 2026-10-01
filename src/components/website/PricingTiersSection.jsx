import React, { useState } from 'react';
import { CheckCircle2, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export function PricingTiersSection({ onNavigate, title, subtitle, eyebrow = "PRICING PLANS" }) {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'trial',
      name: 'Trial plan',
      monthlyPrice: 49,
      annualPrice: 39,
      teamText: 'Growing teams up to 03 users.',
      isPopular: false,
      ctaVariant: 'secondary',
      features: [
        '6,600 Credits',
        'Facebook, Instagram & WhatsApp Integration',
        'Comment Automation',
        'Webchat Integration',
        'Image Understanding & Replies',
        'Voice Message Understanding',
        'Omnichannel inbox',
        'Multilingual Support',
        'Lead Management',
        'Order Management',
        'Agent & Moderator Management',
        'Message Campaign Performance Reports',
        'Broadcast Messaging'
      ]
    },
    {
      id: 'standard',
      name: 'Standard plan',
      monthlyPrice: 99,
      annualPrice: 79,
      teamText: 'Growing teams up to 05 users.',
      isPopular: true,
      badge: 'Popular',
      ctaVariant: 'primary',
      features: [
        '18,000 Credits',
        'Facebook, Instagram & WhatsApp Integration',
        'Comment Automation',
        'Webchat Integration',
        'Website Integration',
        'Image Understanding & Replies',
        'Voice Message Understanding',
        'Omnichannel inbox',
        'Multilingual Support',
        'Lead Management',
        'Order Management',
        'Agent & Moderator Management',
        'Message Campaign Performance Reports',
        'Broadcast Messaging'
      ]
    },
    {
      id: 'pro',
      name: 'Pro plan',
      monthlyPrice: 199,
      annualPrice: 159,
      teamText: 'Growing teams up to 10 users.',
      isPopular: false,
      ctaVariant: 'secondary',
      features: [
        '40,000 Credits',
        'Facebook, Instagram & WhatsApp Integration',
        'Comment Automation',
        'Webchat Integration',
        'Website Integration',
        'Image Understanding & Replies',
        'Voice Message Understanding',
        'Omnichannel Inbox',
        'Multilingual Support',
        'Lead Management',
        'Order Management',
        'Agent & Moderator Management',
        'Message Campaign Performance Reports',
        'Broadcast Messaging'
      ]
    }
  ];

  const handleChatToSales = (planName) => {
    // Dispatch event to trigger the live chat widget instantly
    window.dispatchEvent(new CustomEvent('kreazy-open-chat'));
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

          {/* Billing Cycle Toggle */}
          <div className="pricing-billing-switch-wrap">
            <span 
              className={`billing-switch-label ${!isAnnual ? 'active' : ''}`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly Billing
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
              Annual Billing
              <span className="billing-discount-badge">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid (3 Columns) */}
        <div className="pricing-suite-grid">
          {plans.map((p) => {
            const price = isAnnual ? p.annualPrice : p.monthlyPrice;
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
                    <span className="pricing-suite-price-val">${price}</span>
                    <span className="pricing-suite-price-period">per month</span>
                  </div>

                  <div className="pricing-suite-team-desc">
                    {p.teamText}
                  </div>

                  <button
                    type="button"
                    className={`pricing-suite-cta-btn ${p.ctaVariant}`}
                    onClick={() => handleChatToSales(p.name)}
                  >
                    Chat to sales
                  </button>
                </div>

                {/* Features Divider & Section */}
                <div className="pricing-suite-features-block">
                  <div className="pricing-suite-features-heading">
                    FEATURES
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
