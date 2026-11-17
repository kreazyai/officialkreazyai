import React, { useState, useEffect } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function HeroPricingBoxes({ onNavigate }) {
  const { t } = useLanguage();
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'BDT'
  const [animatingPrice, setAnimatingPrice] = useState(false);
  const [isPromoActive, setIsPromoActive] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(10);

  // Sync with promotional offer events
  useEffect(() => {
    try {
      const isClaimed = sessionStorage.getItem('kreazy_offer_claimed') === 'true';
      const storedPct = sessionStorage.getItem('kreazy_discount_percent');
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlClaim = urlParams?.get('claim') === 'true';
      const urlPromo = urlParams?.get('promo');

      if (isClaimed || urlClaim || (urlPromo && urlPromo.toLowerCase() !== 'false')) {
        setIsPromoActive(true);
        if (storedPct) setPromoDiscount(Number(storedPct));
      } else {
        setIsPromoActive(false);
      }
    } catch {
      setIsPromoActive(false);
    }

    const handleDiscountApplied = (e) => {
      const pct = Number(e.detail?.discountPercent) || 10;
      setPromoDiscount(pct);
      setAnimatingPrice(true);
      setIsPromoActive(true);
      setTimeout(() => setAnimatingPrice(false), 380);
    };

    const handleDiscountRemoved = () => {
      setAnimatingPrice(true);
      setIsPromoActive(false);
      setTimeout(() => setAnimatingPrice(false), 380);
    };

    window.addEventListener('kreazy:apply-discount', handleDiscountApplied);
    window.addEventListener('kreazy:remove-discount', handleDiscountRemoved);
    return () => {
      window.removeEventListener('kreazy:apply-discount', handleDiscountApplied);
      window.removeEventListener('kreazy:remove-discount', handleDiscountRemoved);
    };
  }, []);

  const toggleBilling = (annual) => {
    if (annual !== isAnnual) {
      setAnimatingPrice(true);
      setIsAnnual(annual);
      setTimeout(() => setAnimatingPrice(false), 380);
    }
  };

  const toggleCurrency = (curr) => {
    if (curr !== currency) {
      setAnimatingPrice(true);
      setCurrency(curr);
      setTimeout(() => setAnimatingPrice(false), 380);
    }
  };

  const applyDiscount = (val) => {
    if (!isPromoActive) return val;
    return Math.round(val * (1 - promoDiscount / 100));
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      badge: null,
      desc: 'Solo & emerging stores',
      rawUsd: isAnnual ? 39 : 49,
      rawBdt: isAnnual ? 4700 : 5880,
      features: [
        '1,000 automated chats/mo',
        '1 WhatsApp Business line',
        'Catalog & inventory sync',
        'Standard auto-replies'
      ],
      isPopular: false,
      ctaText: 'Get Starter'
    },
    {
      id: 'growth',
      name: 'Growth',
      badge: 'MOST POPULAR',
      desc: 'Scaling retail brands',
      rawUsd: isAnnual ? 95 : 119,
      rawBdt: isAnnual ? 11420 : 14280,
      features: [
        '5,000 automated chats/mo',
        'WhatsApp + IG + Messenger',
        'In-chat COD & cart checkout',
        'Priority 24/7 AI response'
      ],
      isPopular: true,
      ctaText: 'Start Free Trial'
    },
    {
      id: 'scale',
      name: 'Scale',
      badge: null,
      desc: 'Enterprise multi-store',
      rawUsd: isAnnual ? 239 : 299,
      rawBdt: isAnnual ? 28700 : 35880,
      features: [
        '25,000 automated chats/mo',
        'Unlimited social channels',
        'Custom fine-tuned AI prompts',
        'Dedicated SLA & manager'
      ],
      isPopular: false,
      ctaText: 'Get Scale'
    }
  ];

  const handleSelectPlan = (planId) => {
    if (onNavigate) {
      onNavigate(isPromoActive ? 'signup?promo=KREAZY10' : 'signup');
    }
  };

  return (
    <div className="hero-pricing-widget" role="region" aria-label="Hero Pricing Plans">
      {/* Top Header & Switchers Bar */}
      <div className="hero-pricing-top-bar">
        <div className="hero-pricing-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="hero-pricing-status-text">Official Meta AI Automation</span>
          {isPromoActive && (
            <span style={{
              background: 'rgba(15, 169, 104, 0.16)',
              border: '1px solid rgba(15, 169, 104, 0.4)',
              color: '#34D399',
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '2px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              {promoDiscount}% OFF CLAIMED
            </span>
          )}
        </div>

        {/* Currency & Billing Controls */}
        <div className="hero-pricing-controls">
          {/* Currency Toggle */}
          <div className="hero-pricing-pill-toggle">
            <button
              type="button"
              className={`pill-toggle-btn ${currency === 'USD' ? 'active' : ''}`}
              onClick={() => toggleCurrency('USD')}
            >
              $ USD
            </button>
            <button
              type="button"
              className={`pill-toggle-btn ${currency === 'BDT' ? 'active' : ''}`}
              onClick={() => toggleCurrency('BDT')}
            >
              ৳ BDT
            </button>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="hero-pricing-pill-toggle">
            <button
              type="button"
              className={`pill-toggle-btn ${!isAnnual ? 'active' : ''}`}
              onClick={() => toggleBilling(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`pill-toggle-btn ${isAnnual ? 'active' : ''}`}
              onClick={() => toggleBilling(true)}
            >
              Annual
              <span className="annual-save-badge">20% OFF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Little Boxes Grid */}
      <div className="hero-pricing-boxes-grid">
        {plans.map((p) => {
          const finalUsd = applyDiscount(p.rawUsd);
          const finalBdt = applyDiscount(p.rawBdt);
          const periodSuffix = '/mo';

          return (
            <div
              key={p.id}
              className={`hero-pricing-card ${p.isPopular ? 'is-popular' : ''}`}
              onClick={() => handleSelectPlan(p.id)}
            >
              {/* Popular Shimmer Badge */}
              {p.badge && (
                <div className="hero-card-pop-badge">
                  <Sparkles size={11} className="badge-sparkle-icon" />
                  <span>{p.badge}</span>
                </div>
              )}

              {/* Plan Title & Audience */}
              <div className="hero-pricing-card-header">
                <div className="hero-card-title-row">
                  <h3 className="hero-card-name">{p.name}</h3>
                </div>
                <p className="hero-card-desc">{p.desc}</p>
              </div>

              {/* Animated Price Amount (Shows original strikethrough only when offer claimed) */}
              <div className="hero-card-price-wrap">
                <div className={`hero-card-price ${animatingPrice ? 'price-pop-anim' : ''}`}>
                  {isPromoActive && (
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 650,
                      color: '#64748B',
                      textDecoration: 'line-through',
                      marginRight: '3px',
                      alignSelf: 'baseline'
                    }}>
                      {currency === 'USD' ? `$${p.rawUsd}` : `৳${p.rawBdt.toLocaleString()}`}
                    </span>
                  )}
                  <span className="price-val">
                    {currency === 'USD' ? `$${finalUsd}` : `৳${finalBdt.toLocaleString()}`}
                  </span>
                  <span className="price-cycle">{periodSuffix}</span>
                  {isPromoActive && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      color: '#34D399',
                      background: 'rgba(15, 169, 104, 0.16)',
                      border: '1px solid rgba(15, 169, 104, 0.35)',
                      padding: '1px 5px',
                      borderRadius: '2px',
                      marginLeft: '4px',
                      alignSelf: 'center',
                      letterSpacing: '0.02em'
                    }}>
                      -{promoDiscount}%
                    </span>
                  )}
                </div>
                {currency === 'USD' ? (
                  <span className="price-sub-equiv">
                    {isPromoActive && (
                      <span style={{ textDecoration: 'line-through', opacity: 0.65, marginRight: '4px' }}>
                        ~৳{p.rawBdt.toLocaleString()}
                      </span>
                    )}
                    ~৳{finalBdt.toLocaleString()} BDT
                  </span>
                ) : (
                  <span className="price-sub-equiv">
                    {isPromoActive && (
                      <span style={{ textDecoration: 'line-through', opacity: 0.65, marginRight: '4px' }}>
                        ${p.rawUsd}
                      </span>
                    )}
                    ${finalUsd} USD
                  </span>
                )}
              </div>

              {/* Feature Checklist */}
              <ul className="hero-card-features">
                {p.features.map((feat, idx) => (
                  <li key={idx} className="hero-card-feature-item">
                    <Check size={13} className="hero-check-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Action Button */}
              <button
                type="button"
                className={`hero-card-btn ${p.isPopular ? 'btn-popular' : 'btn-standard'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPlan(p.id);
                }}
              >
                <span>{isPromoActive ? `Claim -${promoDiscount}% • ${p.name}` : p.ctaText}</span>
                <ArrowRight size={13} className="card-btn-arrow" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Micro Trust & Feature Footnote */}
      <div className="hero-pricing-footer">
        <div className="hero-pricing-guarantee">
          <span>14-day free trial • Cancel anytime • Zero credit card required</span>
        </div>
        <button
          type="button"
          className="hero-pricing-compare-link"
          onClick={() => {
            if (onNavigate) {
              onNavigate('pricing');
            }
          }}
        >
          <span>Compare full features</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
