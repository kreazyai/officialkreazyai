import React, { useState } from 'react';
import { CheckCircle2, Sparkles, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

export function PricingTiersSection({ onNavigate, title, subtitle, eyebrow = "" }) {
  const [currency, setCurrency] = useState('BDT'); // 'BDT' | 'USD'
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'trial',
      name: 'Trial plan',
      bdtMonthly: 4999,
      bdtAnnual: 3999,
      usdMonthly: 49,
      usdAnnual: 39,
      teamText: 'Growing teams up to 03 users.',
      isPopular: false,
      ctaText: 'Chat to sales',
      ctaVariant: 'secondary',
      features: [
        '6,600 AI message credits included',
        'Facebook, Instagram & WhatsApp connected',
        'Auto-reply to post comments & send private DMs',
        'Live chat widget for your website or store',
        'AI understands customer photos & product screenshots',
        'Voice note understanding in Bangla & English',
        'Unified shared inbox for all customer chats',
        'Bangla, Banglish & English conversational replies',
        'Automatic customer lead capture & contact saving',
        'In-chat order placement with address & phone check',
        'Team member handoff & moderator controls (up to 3 users)',
        'Clear sales & message campaign performance reports',
        'Promotional broadcast messaging to customers'
      ]
    },
    {
      id: 'standard',
      name: 'Standard plan',
      badge: 'Popular',
      bdtMonthly: 12500,
      bdtAnnual: 9990,
      usdMonthly: 119,
      usdAnnual: 95,
      teamText: 'Growing teams up to 05 users.',
      isPopular: true,
      ctaText: 'Chat to sales',
      ctaVariant: 'primary',
      features: [
        '18,000 AI message credits included',
        'Facebook, Instagram & WhatsApp connected',
        'Auto-reply to post comments & send private DMs',
        'Live webchat & full website store integration',
        'Advanced product photo & receipt recognition',
        'Voice note understanding in Bangla & English',
        'Unified shared inbox with smart customer tagging',
        'Bangla, Banglish & English conversational replies',
        'Automatic customer lead capture & CRM synchronization',
        'In-chat order placement with live stock & catalog lookup',
        'Advanced team handoff & moderator permissions (up to 5 users)',
        'Real-time sales conversion & campaign analytics reports',
        'Targeted promotional broadcast messaging campaigns'
      ]
    },
    {
      id: 'pro',
      name: 'Pro plan',
      bdtMonthly: 26000,
      bdtAnnual: 20800,
      usdMonthly: 249,
      usdAnnual: 199,
      teamText: 'Growing teams up to 10 users.',
      isPopular: false,
      ctaText: 'Chat to sales',
      ctaVariant: 'secondary',
      features: [
        '40,000 AI message credits included',
        'Facebook, Instagram & WhatsApp connected',
        'Priority auto-reply to comments & viral post spikes',
        'Full website, online store & custom API integration',
        'Enterprise photo, document & catalog recognition',
        'High-accuracy voice message transcription & instant answers',
        'High-capacity omnichannel inbox with automated routing',
        'Full multilingual understanding with custom brand tone',
        'Comprehensive lead management & automated follow-ups',
        'High-volume in-chat order processing & batch export',
        'Full team role permissions & audit logs (up to 10 users)',
        'In-depth campaign performance & revenue ROI reports',
        'High-speed priority broadcast messaging with VIP delivery'
      ]
    }
  ];

  const handlePlanAction = (planId) => {
    if (onNavigate) {
      onNavigate('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDirectSignUp = (e) => {
    e.stopPropagation();
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
          <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', fontWeight: 850, color: 'var(--text-primary)', marginBottom: '0.85rem', letterSpacing: '-0.04em', lineHeight: 1.04 }}>
            {title || "Simple pricing that pays for itself in captured sales"}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
            {subtitle || "Choose the plan that fits your growth. Upgrade or adjust anytime as your message volume and team scale."}
          </p>

          {/* Currency & Billing Cycle Toggles Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {/* Currency Pill Switcher */}
            <div style={{
              display: 'inline-flex',
              background: 'var(--mint-soft)',
              border: '1px solid var(--border)',
              padding: '3px',
              borderRadius: '999px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <button
                type="button"
                onClick={() => setCurrency('BDT')}
                style={{
                  background: currency === 'BDT' ? 'var(--primary-dark)' : 'transparent',
                  color: currency === 'BDT' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 16px',
                  fontSize: '0.825rem',
                  fontWeight: 750,
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
                  background: currency === 'USD' ? 'var(--primary-dark)' : 'transparent',
                  color: currency === 'USD' ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '6px 16px',
                  fontSize: '0.825rem',
                  fontWeight: 750,
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
            const priceFormatted = isBdt 
              ? `৳${priceVal.toLocaleString()}` 
              : `$${priceVal}`;
            const periodLabel = isAnnual ? 'per month (billed annually)' : 'per month';

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

                  <div className="pricing-suite-team-desc">
                    {p.teamText}
                  </div>

                  <div className="pricing-suite-cta-wrap">
                    <button
                      type="button"
                      className={`pricing-suite-cta-btn ${p.ctaVariant}`}
                      onClick={() => handlePlanAction(p.id)}
                    >
                      <MessageSquare size={16} />
                      {p.ctaText}
                    </button>
                    <span 
                      className="pricing-suite-secondary-action"
                      onClick={handleDirectSignUp}
                      title="Create an account directly"
                    >
                      or Start Free Trial &rarr;
                    </span>
                  </div>
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
