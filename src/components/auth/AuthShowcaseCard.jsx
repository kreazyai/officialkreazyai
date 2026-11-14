import React, { useState, useEffect } from 'react';
import { MessageSquare, ShoppingBag, Truck, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

const SHOWCASE_SLIDES = [
  {
    badge: 'Omnichannel AI Commerce',
    title: 'Turn conversations into instant revenue',
    subtitle: 'Autonomous sales agents on WhatsApp, Messenger & Instagram closing deals 24/7.',
    mockup: {
      channel: 'WhatsApp & Instagram Live',
      time: 'Just now',
      userMessage: 'Hey! Do you have the Crimson Jacket in Large?',
      aiMessage: 'Yes! 2 remaining in stock for immediate dispatch. Here is your express checkout link:',
      actionLabel: '1-Click Express Checkout',
      actionIcon: Zap
    }
  },
  {
    badge: 'Smart Sales Recovery',
    title: 'Recover lost shoppers automatically',
    subtitle: 'Reclaim up to 34% of abandoned carts with human-like conversational outreach.',
    mockup: {
      channel: 'Abandoned Cart Recovery',
      time: '2 min ago',
      userMessage: 'Cart abandoned: Obsidian Hoodie ($84.00)',
      aiMessage: 'Hi Sarah! Your items are reserved for the next 15 mins. Complete now for free priority express shipping!',
      actionLabel: 'Resume Saved Checkout',
      actionIcon: ShoppingBag
    }
  },
  {
    badge: 'Automated Logistics',
    title: 'Zero-touch fulfillment & tracking',
    subtitle: 'Real-time courier sync with Steadfast, Pathao & RedX for instant parcel updates.',
    mockup: {
      channel: 'Courier Dispatch Desk',
      time: 'Live Sync',
      userMessage: 'Customer: "Where is my parcel #KZ-88219?"',
      aiMessage: 'Steadfast Courier: In transit to Dhanmondi Hub. Estimated delivery tomorrow by 2:00 PM.',
      actionLabel: 'Live Parcel Tracking',
      actionIcon: Truck
    }
  }
];

export function AuthShowcaseCard({ onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SHOWCASE_SLIDES[activeSlide];
  const ActionIcon = slide.mockup.actionIcon;

  return (
    <div
      className="auth-showcase-panel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background canvas effects */}
      <div className="auth-showcase-canvas" aria-hidden="true">
        <div className="auth-showcase-glow-crimson" />
        <div className="auth-showcase-glow-ocean" />
        <div className="auth-showcase-stars" />
      </div>

      <div className="auth-showcase-content">
        {/* Top: Brand emblem & Status badge */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem',
              cursor: onNavigate ? 'pointer' : 'default'
            }}
            onClick={() => onNavigate && onNavigate('home')}
            title="KreazyAI"
          >
            <img
              src="/logo-mark.png"
              alt="KreazyAI Emblem"
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            />
            <img
              src="/logo-white.svg"
              alt="KreazyAI"
              style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div>
            <div className="auth-showcase-badge">
              <span className="auth-showcase-pulse-dot" />
              <span>{slide.badge}</span>
            </div>
          </div>
        </div>

        {/* Middle: Feature Mockup Card */}
        <div className="auth-showcase-mockup">
          <div className="auth-mockup-header">
            <div className="auth-mockup-channel">
              <MessageSquare size={14} style={{ color: '#FF334B' }} />
              <span>{slide.mockup.channel}</span>
            </div>
            <span className="auth-mockup-time">{slide.mockup.time}</span>
          </div>

          <div className="auth-mockup-bubble-user">
            {slide.mockup.userMessage}
          </div>

          <div className="auth-mockup-bubble-ai">
            <div>{slide.mockup.aiMessage}</div>
            <div className="auth-mockup-action-pill">
              <ActionIcon size={12} />
              <span>{slide.mockup.actionLabel}</span>
            </div>
          </div>
        </div>

        {/* Bottom info + Carousel Indicators */}
        <div>
          <div className="auth-showcase-info">
            <h3>{slide.title}</h3>
            <p>{slide.subtitle}</p>
          </div>

          {/* 3 Indicators Pill Buttons (matching the reference image) */}
          <div className="auth-carousel-dots" role="tablist" aria-label="Feature slides">
            {SHOWCASE_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={activeSlide === idx}
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setActiveSlide(idx)}
                className={`auth-carousel-dot ${
                  activeSlide === idx ? 'auth-carousel-dot-active' : 'auth-carousel-dot-inactive'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
