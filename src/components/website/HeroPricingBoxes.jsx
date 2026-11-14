import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function HeroPricingBoxes({ onNavigate }) {
  const { t } = useLanguage();
  const [isAnnual, setIsAnnual] = useState(false);
  const [currency, setCurrency] = useState('USD'); // 'USD' | 'BDT'
  const [animatingPrice, setAnimatingPrice] = useState(false);

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

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      badge: null,
      desc: 'Solo & emerging stores',
      usdPrice: isAnnual ? 39 : 49,
      bdtPrice: isAnnual ? '4,700' : '5,880',
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
      usdPrice: isAnnual ? 95 : 119,
      bdtPrice: isAnnual ? '11,420' : '14,280',
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
      usdPrice: isAnnual ? 239 : 299,
      bdtPrice: isAnnual ? '28,700' : '35,880',
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
      onNavigate('signup');
    }
  };

  return (
    <div className="hero-pricing-widget" role="region" aria-label="Hero Pricing Plans">
      {/* Top Header & Switchers Bar */}
      <div className="hero-pricing-top-bar">
        <div className="hero-pricing-status">
          <span className="hero-pricing-status-text">Official Meta AI Automation</span>
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
          const displayPrice = currency === 'USD' ? `$${p.usdPrice}` : `৳${p.bdtPrice}`;
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

              {/* Animated Price Amount */}
              <div className="hero-card-price-wrap">
                <div className={`hero-card-price ${animatingPrice ? 'price-pop-anim' : ''}`}>
                  <span className="price-val">{displayPrice}</span>
                  <span className="price-cycle">{periodSuffix}</span>
                </div>
                {currency === 'USD' ? (
                  <span className="price-sub-equiv">~৳{p.bdtPrice} BDT</span>
                ) : (
                  <span className="price-sub-equiv">${p.usdPrice} USD</span>
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
                <span>{p.ctaText}</span>
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
