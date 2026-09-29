import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export function PricingWinningSection({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingCycle === 'monthly' ? '$0' : '$0',
      period: '/ month',
      description: 'Kickstart your product research in your business at no cost.',
      buttonText: 'Current Plan',
      buttonVariant: 'ghost',
      isFeatured: false,
      badge: null,
      features: [
        '25 users',
        'Email and live chat support',
        'AI power-ups'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? '$12' : '$10',
      period: '/ month',
      description: 'Fuel your product workflow with more advanced research.',
      buttonText: 'Upgrade Now',
      buttonVariant: 'primary',
      isFeatured: true,
      badge: 'BEST VALUE',
      features: [
        'Unlimited workspace',
        'Advanced admin permissions and apps',
        'Dedicated AI agent support'
      ]
    },
    {
      id: 'scale',
      name: 'Scale & Growth',
      price: billingCycle === 'monthly' ? '$49' : '$39',
      period: '/ month',
      description: 'Full-scale automated omnichannel commerce for high-velocity retailers.',
      buttonText: 'Get Started',
      buttonVariant: 'secondary',
      isFeatured: false,
      badge: null,
      features: [
        'Meta WhatsApp Cloud API Included',
        'Autonomous Order Checkout & Sync',
        '99.9% Uptime SLA & Dedicated Rep'
      ]
    }
  ];

  return (
    <section className="pricing-winning-section" id="pricing-plans">
      <div className="container">
        {/* Header */}
        <div className="section-header-centered">
          <h2 className="winning-title">
            Get used to winning
          </h2>

          {/* Toggle pill matching Image 1 */}
          <div className="billing-pill-toggle-container">
            <button
              type="button"
              className={`billing-toggle-pill ${billingCycle === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`billing-toggle-pill ${billingCycle === 'annual' ? 'active' : ''}`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual <span className="discount-tag">10% OFF</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="winning-cards-grid">
          {plans.map((p) => (
            <div 
              key={p.id} 
              className={`winning-plan-card ${p.isFeatured ? 'featured' : ''}`}
            >
              {p.badge && (
                <div className="winning-card-top-ribbon">
                  <span>{p.badge}</span>
                </div>
              )}

              <div className="winning-card-header">
                <h3 className="plan-name">{p.name}</h3>
                
                <div className="plan-price-row">
                  <span className="price-num">{p.price}</span>
                  <span className="price-period">{p.period}</span>
                </div>

                <p className="plan-desc">{p.description}</p>
              </div>

              <div className="winning-card-cta">
                <button
                  type="button"
                  className={`winning-plan-btn ${p.buttonVariant}`}
                  onClick={() => onSelectPlan && onSelectPlan(p.id)}
                >
                  {p.buttonText}
                </button>
              </div>

              <div className="winning-card-features">
                <ul className="winning-checklist">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="winning-check-item">
                      <span className="check-icon-box">
                        <Check size={14} color={p.isFeatured ? '#2563EB' : '#64748B'} />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
