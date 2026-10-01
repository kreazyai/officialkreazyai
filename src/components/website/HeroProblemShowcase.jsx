import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  Check,
  Bot
} from 'lucide-react';

export function HeroProblemShowcase({ onExploreApp, onBookDemo }) {
  return (
    <div className="hero-problem-container">
      {/* SOLUTION VIEW: KREAZYAI AUTOPILOT */}
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
    </div>
  );
}
