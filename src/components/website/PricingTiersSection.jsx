import React, { useState } from 'react';
import { CheckCircle2, Smartphone } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TrustGuaranteeSection } from './TrustGuaranteeSection';

export function PricingTiersSection({ onNavigate, title, subtitle, eyebrow = "" }) {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState('USD'); // Default 'USD' to match screenshot ($49, $119, $299 with ৳ BDT underneath)
  const [isAnnual, setIsAnnual] = useState(false);

  const starterFeatures = [
    '1,000 autonomous AI conversations / mo',
    '1 Connected WhatsApp Business account',
    'Real-time catalog & inventory sync',
    'Basic order capture & CRM storage',
    'Standard email & community support'
  ];

  const growthFeatures = [
    '5,000 autonomous AI conversations / mo',
    'WhatsApp + Instagram + Messenger omnichannel',
    'Autonomous order placement & cart checkout',
    'AI sizing, discount & delivery advice',
    'Priority 24/7 AI Copilot support',
    'Dedicated webhook & Shopify/Woo sync'
  ];

  const scaleFeatures = [
    '25,000 autonomous AI conversations / mo',
    'Unlimited social channels & team seats',
    'Custom fine-tuned AI prompts & catalog training',
    'Dedicated SLA & 99.9% uptime guarantee',
    'Dedicated customer success manager',
    'Custom ERP & payment gateway integrations'
  ];

  const plans = [
    {
      id: 'starter',
      name: t('pricing.starter.name', 'Starter Plan'),
      bdtMonthly: 5880,
      bdtAnnual: 4700,
      usdMonthly: 49,
      usdAnnual: 39,
      eurMonthly: 45,
      eurAnnual: 36,
      teamText: t('pricing.starter.desc', 'Ideal for emerging merchants automating their first WhatsApp store channel.'),
      isPopular: false,
      badge: null,
      ctaText: t('pricing.ctaSubscribe', 'Subscribe via bKash / Nagad'),
      ctaVariant: 'secondary',
      features: Array.isArray(t('pricing.starter.features')) ? t('pricing.starter.features') : starterFeatures
    },
    {
      id: 'growth',
      name: t('pricing.growth.name', 'Growth Plan'),
      badge: t('pricing.popularBadge', 'Most Popular'),
      bdtMonthly: 14280,
      bdtAnnual: 11420,
      usdMonthly: 119,
      usdAnnual: 95,
      eurMonthly: 109,
      eurAnnual: 87,
      teamText: t('pricing.growth.desc', 'Built for scaling retail brands requiring multi-channel AI automation.'),
      isPopular: true,
      ctaText: t('pricing.ctaSubscribe', 'Subscribe via bKash / Nagad'),
      ctaVariant: 'primary',
      features: Array.isArray(t('pricing.growth.features')) ? t('pricing.growth.features') : growthFeatures
    },
    {
      id: 'scale',
      name: t('pricing.scale.name', 'Scale Plan'),
      badge: t('pricing.highVolumeBadge', 'High Volume'),
      bdtMonthly: 35880,
      bdtAnnual: 28700,
      usdMonthly: 299,
      usdAnnual: 239,
      eurMonthly: 275,
      eurAnnual: 220,
      teamText: t('pricing.scale.desc', 'Enterprise-grade speed and custom fine-tuned agents for high-volume stores.'),
      isPopular: false,
      ctaText: t('pricing.ctaSubscribe', 'Subscribe via bKash / Nagad'),
      ctaVariant: 'secondary',
      features: Array.isArray(t('pricing.scale.features')) ? t('pricing.scale.features') : scaleFeatures
    }
  ];

  const handlePlanAction = (planId) => {
    if (onNavigate) {
      onNavigate('signup');
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
          <h1 style={{ fontSize: 'clamp(2.2rem, 3.8vw, 3rem)', fontWeight: 850, color: 'var(--text-primary)', marginBottom: '0.85rem', letterSpacing: '-0.04em', lineHeight: 1.04 }}>
            {title || t('pricing.title', "Simple pricing that pays for itself in captured sales")}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
            {subtitle || t('pricing.subtitle', "Choose the plan that fits your growth. Upgrade or adjust anytime as your message volume and team scale.")}
          </p>

          {/* Currency & Billing Cycle Toggles Row */}
          <div className="pricing-controls-row">
            {/* Currency Selector: USD | BDT | EUR */}
            <div className="pricing-currency-selector" role="group" aria-label="Select currency">
              {['USD', 'BDT', 'EUR'].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`pricing-currency-btn ${currency === curr ? 'active' : ''}`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Mode Button: Monthly / Annual */}
            <div className="pricing-mode-selector" role="group" aria-label="Select billing cycle">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`pricing-mode-btn ${!isAnnual ? 'active' : ''}`}
              >
                {t('pricing.billingMonthly', 'Monthly')}
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`pricing-mode-btn ${isAnnual ? 'active' : ''}`}
              >
                <span>{t('pricing.billingAnnual', 'Annual')}</span>
                <span className="pricing-save-badge">{t('pricing.save20', 'Save 20%')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid (3 Columns) */}
        <div className="pricing-suite-grid">
          {plans.map((p) => {
            let primaryPrice = '';
            let secondaryConverted = '';
            const bdtVal = isAnnual ? p.bdtAnnual : p.bdtMonthly;
            const usdVal = isAnnual ? p.usdAnnual : p.usdMonthly;
            const eurVal = isAnnual ? p.eurAnnual : p.eurMonthly;

            if (currency === 'BDT') {
              primaryPrice = `৳${bdtVal.toLocaleString()}`;
              secondaryConverted = `$${usdVal} USD ${t('pricing.perMonth', '/ month')}`;
            } else if (currency === 'EUR') {
              primaryPrice = `€${eurVal}`;
              secondaryConverted = `৳${bdtVal.toLocaleString()} BDT ${t('pricing.perMonth', '/ month')}`;
            } else {
              primaryPrice = `$${usdVal}`;
              secondaryConverted = `৳${bdtVal.toLocaleString()} BDT ${t('pricing.perMonth', '/ month')}`;
            }
            const periodLabel = isAnnual ? t('pricing.perMonthAnnual', '/ month (billed annually)') : t('pricing.perMonth', '/ month');

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

                  <div className="pricing-suite-team-desc">
                    {p.teamText}
                  </div>

                  <div className="pricing-suite-price-row">
                    <span className="pricing-suite-price-val">{primaryPrice}</span>
                    <span className="pricing-suite-price-period">{periodLabel}</span>
                  </div>

                  {/* Converted BDT / USD price matching the dashboard screenshot */}
                  <div style={{
                    fontSize: '0.88rem', fontWeight: 750, color: 'var(--primary, #087A4A)',
                    marginTop: '2px', marginBottom: '1.25rem'
                  }}>
                    {secondaryConverted}
                  </div>

                  <div className="pricing-suite-cta-wrap">
                    <button
                      type="button"
                      className={`pricing-suite-cta-btn ${p.ctaVariant}`}
                      onClick={() => handlePlanAction(p.id)}
                    >
                      <Smartphone size={16} />
                      {p.ctaText}
                    </button>
                    <span 
                      className="pricing-suite-secondary-action"
                      onClick={handleDirectSignUp}
                      title="Create an account directly"
                    >
                      {t('pricing.orTrial', 'or Start 7-Day Free Trial →')}
                    </span>
                  </div>
                </div>

                {/* Features Divider & Section */}
                <div className="pricing-suite-features-block">
                  <div className="pricing-suite-features-heading" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('pricing.whatsIncluded', "WHAT'S INCLUDED:")}
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

        {/* Dedicated Trust & Verification Section */}
        <div className="pricing-suite-trust-strip">
          <TrustGuaranteeSection variant="card" container={false} />
        </div>
      </div>
    </section>
  );
}
