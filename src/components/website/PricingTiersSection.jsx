import React, { useState, useEffect } from 'react';
import { Check, Smartphone, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { TrustGuaranteeSection } from './TrustGuaranteeSection';

export function PricingTiersSection({ onNavigate, title, subtitle, eyebrow = "" }) {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState('USD');
  const [isAnnual, setIsAnnual] = useState(false);
  const [promoCode, setPromoCode] = useState('KREAZY10');
  const [promoDiscount, setPromoDiscount] = useState(10);
  const [isPromoActive, setIsPromoActive] = useState(false);

  // Initialize and listen for promotional events (e.g. from header discount banner)
  useEffect(() => {
    // Check initial state from sessionStorage or URL query
    try {
      const storedPromo = sessionStorage.getItem('kreazy_active_promo');
      const storedPct = sessionStorage.getItem('kreazy_discount_percent');
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlPromo = urlParams?.get('promo');

      if (storedPromo || urlPromo) {
        setPromoCode(urlPromo || storedPromo || 'KREAZY10');
        setPromoDiscount(Number(storedPct) || 10);
        setIsPromoActive(true);
      }
    } catch {}

    const handleDiscountApplied = (e) => {
      const code = e.detail?.promoCode || 'KREAZY10';
      const percent = Number(e.detail?.discountPercent) || 10;
      setPromoCode(code);
      setPromoDiscount(percent);
      setIsPromoActive(true);
    };

    window.addEventListener('kreazy:apply-discount', handleDiscountApplied);
    return () => {
      window.removeEventListener('kreazy:apply-discount', handleDiscountApplied);
    };
  }, []);

  const handleRemovePromo = (e) => {
    if (e) e.stopPropagation();
    setIsPromoActive(false);
    try {
      sessionStorage.removeItem('kreazy_active_promo');
      sessionStorage.removeItem('kreazy_discount_percent');
    } catch {}
  };

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
      const target = isPromoActive ? `signup?promo=${promoCode}` : 'signup';
      onNavigate(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDirectSignUp = (e) => {
    e.stopPropagation();
    if (onNavigate) {
      const target = isPromoActive ? `signup?promo=${promoCode}` : 'signup';
      onNavigate(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Helper to compute discount
  const applyDiscount = (val) => {
    if (!isPromoActive) return val;
    return Math.round(val * (1 - promoDiscount / 100));
  };

  return (
    <section className="pricing-suite-section" id="pricing">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-centered" style={{ textAlign: 'center' }}>
          <div className="pricing-eyebrow-pill">
            <span className="pricing-eyebrow-dot" />
            <span>{eyebrow || 'TRANSPARENT VALUE • NO HIDDEN FEES'}</span>
          </div>

          <h1 className="pricing-main-title">
            {title || t('pricing.title', "Simple pricing that pays for itself in captured sales")}
          </h1>

          <p className="pricing-sub-desc">
            {subtitle || t('pricing.subtitle', "Choose the plan that fits your growth. Upgrade or adjust anytime as your message volume and team scale.")}
          </p>

          {/* Claimed Promo Notification Banner (Apple-style frosted pill banner) */}
          {isPromoActive && (
            <div className="pricing-claimed-banner" role="status" aria-live="polite">
              <div className="pricing-claimed-left">
                <div className="pricing-claimed-icon-wrap">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="pricing-claimed-title">
                    <span>{promoDiscount}% Limited-Time Offer Applied!</span>
                    <span className="pricing-discount-pill-tag">CODE: {promoCode}</span>
                  </div>
                  <div className="pricing-claimed-sub">
                    {promoDiscount}% discount is active across all plans. Stacks with 20% annual savings for maximum value!
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="pricing-claimed-remove-btn"
                onClick={handleRemovePromo}
                title="Remove applied discount"
                aria-label="Remove promo code"
              >
                Remove Offer
              </button>
            </div>
          )}

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

        {/* Pricing Cards Grid (3 Columns Desktop, 1 Column Stack Mobile) */}
        <div className="pricing-suite-grid" id="pricing-cards">
          {plans.map((p) => {
            const rawBdt = isAnnual ? p.bdtAnnual : p.bdtMonthly;
            const rawUsd = isAnnual ? p.usdAnnual : p.usdMonthly;
            const rawEur = isAnnual ? p.eurAnnual : p.eurMonthly;

            const finalBdt = applyDiscount(rawBdt);
            const finalUsd = applyDiscount(rawUsd);
            const finalEur = applyDiscount(rawEur);

            let primaryDisplay = '';
            let originalDisplay = null;
            let secondaryConverted = '';

            if (currency === 'BDT') {
              primaryDisplay = `৳${finalBdt.toLocaleString()}`;
              if (isPromoActive) originalDisplay = `৳${rawBdt.toLocaleString()}`;
              secondaryConverted = `$${finalUsd} USD ${t('pricing.perMonth', '/ month')}`;
            } else if (currency === 'EUR') {
              primaryDisplay = `€${finalEur}`;
              if (isPromoActive) originalDisplay = `€${rawEur}`;
              secondaryConverted = `৳${finalBdt.toLocaleString()} BDT ${t('pricing.perMonth', '/ month')}`;
            } else {
              primaryDisplay = `$${finalUsd}`;
              if (isPromoActive) originalDisplay = `$${rawUsd}`;
              secondaryConverted = `৳${finalBdt.toLocaleString()} BDT ${t('pricing.perMonth', '/ month')}`;
            }

            const periodLabel = isAnnual
              ? t('pricing.perMonthAnnual', '/ month (billed annually)')
              : t('pricing.perMonth', '/ month');

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

                  {/* Price Row */}
                  <div className="pricing-suite-price-row">
                    {originalDisplay && (
                      <span className="pricing-strike-original">{originalDisplay}</span>
                    )}
                    <span className="pricing-suite-price-val">{primaryDisplay}</span>
                    <span className="pricing-suite-price-period">{periodLabel}</span>
                    {isPromoActive && (
                      <span className="pricing-discount-pill-tag">-{promoDiscount}% OFF</span>
                    )}
                  </div>

                  {/* Converted Currency Row */}
                  <div className="pricing-converted-row">
                    <span>{secondaryConverted}</span>
                  </div>

                  {/* CTA Actions */}
                  <div className="pricing-suite-cta-wrap">
                    <button
                      type="button"
                      className={`pricing-suite-cta-btn ${p.ctaVariant}`}
                      onClick={() => handlePlanAction(p.id)}
                    >
                      <Smartphone size={16} />
                      {isPromoActive
                        ? `Claim ${promoDiscount}% OFF • Subscribe`
                        : p.ctaText}
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

                {/* Features Section */}
                <div className="pricing-suite-features-block">
                  <div className="pricing-suite-features-heading">
                    {t('pricing.whatsIncluded', "WHAT'S INCLUDED:")}
                  </div>

                  <ul className="pricing-suite-features-list">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="pricing-suite-feature-item">
                        <div className="pricing-check-icon-wrap" aria-hidden="true">
                          <Check size={12} strokeWidth={3} />
                        </div>
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
