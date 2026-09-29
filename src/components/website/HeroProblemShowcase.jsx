import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  XCircle, 
  Zap, 
  ArrowRight,
  ShieldAlert,
  Smartphone,
  Check,
  Bot
} from 'lucide-react';

export function HeroProblemShowcase({ onExploreApp, onBookDemo }) {
  const [activeView, setActiveView] = useState('problem'); // 'problem' | 'solution'

  return (
    <div className="hero-problem-container">
      {/* Mode Switcher Tabs */}
      <div className="hero-problem-toggle-bar">
        <button
          type="button"
          onClick={() => setActiveView('problem')}
          className={`problem-toggle-btn ${activeView === 'problem' ? 'active-problem' : ''}`}
        >
          <AlertTriangle size={16} className="text-red" />
          <span>The Real Problem: Manual Phone Overload</span>
          <span className="problem-pill-count">999+ DMs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('solution')}
          className={`problem-toggle-btn ${activeView === 'solution' ? 'active-solution' : ''}`}
        >
          <Sparkles size={16} className="text-emerald" />
          <span>The KreazyAI Fix: 24/7 Autonomous Autopilot</span>
          <span className="solution-pill-live">AI Live</span>
        </button>
      </div>

      {/* Main Card View */}
      {activeView === 'problem' ? (
        <div className="problem-showcase-card">
          <div className="problem-image-wrapper">
            <img 
              src="/images/problem-manual-messaging.jpg" 
              alt="Real business owners overwhelmed handling customer messages on phones" 
              className="problem-hero-img"
              loading="eager"
            />
            
            {/* Cinematic Gradient Vignette */}
            <div className="problem-image-overlay"></div>

            {/* Floating Problem Callout Badges */}
            <div className="floating-problem-badge top-left">
              <div className="badge-icon-wrap red-pulse">
                <Smartphone size={16} />
              </div>
              <div>
                <div className="badge-title">WhatsApp Business • 999+ Unread</div>
                <div className="badge-subtitle">"Is Size L available in Olive? Replying manually..."</div>
                <div className="badge-metric red">⏳ 48m Average Response Lag</div>
              </div>
            </div>

            <div className="floating-problem-badge bottom-left">
              <div className="badge-icon-wrap amber-pulse">
                <Clock size={16} />
              </div>
              <div>
                <div className="badge-title">2:14 AM • After Hours Drop-off</div>
                <div className="badge-subtitle">Customer leaves because team is offline</div>
                <div className="badge-metric amber">⚠️ 68% Buy from Competitor</div>
              </div>
            </div>

            <div className="floating-problem-badge top-right">
              <div className="badge-icon-wrap red-pulse">
                <ShieldAlert size={16} />
              </div>
              <div>
                <div className="badge-title">Staff Exhaustion & Burnout</div>
                <div className="badge-subtitle">Copy-pasting tracking & prices across 3 phones</div>
                <div className="badge-metric red">💸 6+ Hours Wasted Daily</div>
              </div>
            </div>
          </div>

          {/* Problem Impact Footer Strip */}
          <div className="problem-breakdown-grid">
            <div className="problem-stat-box">
              <div className="stat-header">
                <XCircle size={18} className="text-red" />
                <span className="stat-label">Slow Manual Replies</span>
              </div>
              <div className="stat-value text-red">45+ Mins</div>
              <p className="stat-desc">
                73% of customers buy from the first merchant who answers. Manual typing costs you sales.
              </p>
            </div>

            <div className="problem-stat-box">
              <div className="stat-header">
                <XCircle size={18} className="text-red" />
                <span className="stat-label">Missed Night Queries</span>
              </div>
              <div className="stat-value text-amber">40% Traffic</div>
              <p className="stat-desc">
                High-intent shoppers browse late at night while store staff sleep, leading to abandoned carts.
              </p>
            </div>

            <div className="problem-stat-box">
              <div className="stat-header">
                <XCircle size={18} className="text-red" />
                <span className="stat-label">Multiple Phone Chaos</span>
              </div>
              <div className="stat-value text-red">3-5 Devices</div>
              <p className="stat-desc">
                Passing physical smartphones between team members causes lost chats and order mistakes.
              </p>
            </div>

            <div className="problem-cta-box">
              <div className="cta-heading">Ready to Stop the Manual Grind?</div>
              <p className="cta-sub">Turn every WhatsApp & Instagram message into instant revenue.</p>
              <button 
                type="button" 
                onClick={() => setActiveView('solution')}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>See KreazyAI in Action</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SOLUTION VIEW: KREAZYAI AUTOPILOT */
        <div className="solution-showcase-card">
          <div className="solution-top-bar">
            <div className="solution-status-indicator">
              <span className="live-dot-pulse"></span>
              <span>KreazyAI Autonomous Engine: Active on WhatsApp, Instagram & Messenger</span>
            </div>
            <div className="solution-stats-quick">
              <span className="quick-stat">⚡ 1.2s Avg Reply</span>
              <span className="quick-stat">🎯 87% Autonomous Resolution</span>
            </div>
          </div>

          <div className="solution-content-grid">
            {/* Left: Chat Simulator */}
            <div className="solution-chat-pane">
              <div className="simulator-header">
                <div className="sim-avatar">MV</div>
                <div>
                  <div className="sim-name">Marcus Vance</div>
                  <div className="sim-channel">WhatsApp Business • Active Customer</div>
                </div>
                <span className="sim-badge">AI Copilot</span>
              </div>

              <div className="sim-messages-body">
                <div className="sim-bubble incoming">
                  <div className="sim-text">Hi! Does the Artisan Linen Overshirt fit true to size? I'm 6'1", 185 lbs.</div>
                  <span className="sim-time">10:14 AM</span>
                </div>

                <div className="sim-bubble outgoing">
                  <div className="sim-text">
                    Hello Marcus! For 6'1" and 185 lbs, Size L offers the intended relaxed drape. Would you like me to reserve the Olive in Size L for you?
                  </div>
                  <div className="sim-bot-tag">
                    <Bot size={11} /> Answered in 1.4s by KreazyAI
                  </div>
                </div>

                <div className="sim-bubble incoming">
                  <div className="sim-text">Yes please! Can I pay directly here?</div>
                  <span className="sim-time">10:15 AM</span>
                </div>

                <div className="sim-bubble outgoing">
                  <div className="sim-text">
                    Done! I've reserved your item and created your order:
                    <div className="sim-order-card">
                      <div className="order-head">
                        <strong>Artisan Linen Overshirt</strong>
                        <span>$89.00</span>
                      </div>
                      <div className="order-meta">Color: Olive • Size: L • Paid via Stripe</div>
                      <div className="order-badge">
                        <Check size={12} /> Order #KZ-1049 Confirmed
                      </div>
                    </div>
                  </div>
                  <div className="sim-bot-tag">
                    <Bot size={11} /> Auto Checkout & Shopify Sync
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Autopilot Highlights */}
            <div className="solution-highlights-pane">
              <div className="highlight-pill-header">
                <Zap size={18} className="text-emerald" />
                <h3>Zero Manual Effort. 100% In-Control.</h3>
              </div>

              <div className="solution-features-list">
                <div className="sol-feature-item">
                  <div className="sol-icon-box">
                    <CheckCircle2 size={18} className="text-emerald" />
                  </div>
                  <div>
                    <h4>Sub-Second Replies (24/7/365)</h4>
                    <p>Never lose a customer to late responses. AI answers sizing, stock, and pricing in 1.2 seconds even at 3 AM.</p>
                  </div>
                </div>

                <div className="sol-feature-item">
                  <div className="sol-icon-box">
                    <TrendingUp size={18} className="text-emerald" />
                  </div>
                  <div>
                    <h4>In-Chat Sales & Instant Checkout</h4>
                    <p>Direct integration with Shopify and Stripe lets buyers complete orders right inside WhatsApp or Instagram DMs.</p>
                  </div>
                </div>

                <div className="sol-feature-item">
                  <div className="sol-icon-box">
                    <Bot size={18} className="text-emerald" />
                  </div>
                  <div>
                    <h4>Human-in-the-Loop Safeguards</h4>
                    <p>Set custom rules to hand over complex VIP inquiries to your human team instantly with one click.</p>
                  </div>
                </div>
              </div>

              <div className="solution-cta-row">
                <button 
                  type="button" 
                  onClick={onExploreApp} 
                  className="btn btn-primary"
                >
                  <span>Explore Interactive Studio</span>
                  <ArrowRight size={16} />
                </button>
                <button 
                  type="button" 
                  onClick={onBookDemo} 
                  className="btn btn-secondary"
                >
                  Book Live Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
