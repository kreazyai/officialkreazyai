import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Bot, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Layers,
  BarChart3,
  Calendar,
  Send,
  Sliders,
  Check,
  Building,
  Mail,
  User,
  Phone,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { HeroPlatformVisual } from '../../components/website/HeroPlatformVisual';
import { TrustedBrandsBar } from '../../components/website/TrustedBrandsBar';
import { ToolkitChatbotPreview } from '../../components/website/ToolkitChatbotPreview';
import { DarkEnterpriseSection } from '../../components/website/DarkEnterpriseSection';
import { OrchestrationFlowPreview } from '../../components/website/OrchestrationFlowPreview';
import { PricingWinningSection } from '../../components/website/PricingWinningSection';
import { leadService } from '../../services/api';

export function HomePage({ onNavigate }) {
  // Founder Meeting Form State
  const [founderForm, setFounderForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    businessType: 'Retail & E-commerce',
    preferredDate: '',
    preferredTime: 'Morning (10:00 AM - 1:00 PM)',
    message: ''
  });
  const [founderSubmitted, setFounderSubmitted] = useState(false);
  const [founderLoading, setFounderLoading] = useState(false);
  const [founderError, setFounderError] = useState('');

  const handleFounderSubmit = async (e) => {
    e.preventDefault();
    setFounderError('');

    if (!founderForm.name || !founderForm.email || !founderForm.company) {
      setFounderError('Please provide your name, business email, and company name.');
      return;
    }

    setFounderLoading(true);
    try {
      await leadService.submitFounderMeeting(founderForm);
      setFounderLoading(false);
      setFounderSubmitted(true);
    } catch {
      setFounderLoading(false);
      setFounderError('Unable to schedule meeting right now. Please try again or email founder@kreazyai.com.');
    }
  };

  const faqs = [
    {
      q: 'How does KreazyAI integrate with my existing store and messaging channels?',
      a: 'KreazyAI connects directly to official Meta Cloud APIs for WhatsApp, Instagram DM, and Facebook Messenger, as well as Shopify and custom commerce backends. Setup takes under 15 minutes with zero technical overhead.'
    },
    {
      q: 'Can the AI capture real orders and sync stock in real time?',
      a: 'Yes. KreazyAI features an autonomous order engine that checks real-time SKU inventory, calculates shipping and discounts, creates confirmed orders, and generates payment links directly in chat.'
    },
    {
      q: 'What happens when a customer asks a complex or sensitive question?',
      a: 'You define strict human-handoff guardrails. When sentiment dips, high-value inquiries arise, or complex edge cases occur, the conversation transitions smoothly to your human support team with full context.'
    },
    {
      q: 'Is customer data kept private and compliant?',
      a: 'Absolutely. KreazyAI adheres to SOC 3 and GDPR compliance standards, isolates customer tenant data, and uses encrypted official API webhooks with zero unauthorized training on your proprietary data.'
    }
  ];

  return (
    <div className="home-page-root">
      {/* -------------------------------------------------------------
          1. HERO SECTION (Matching Image 1 Mobile & Image 2 Desktop)
          ------------------------------------------------------------- */}
      <section className="hero-moniveo-section">
        <div className="container hero-moniveo-container">
          {/* LEFT / TOP: Hero Copy & Value Proposition */}
          <div className="hero-copy-column">
            {/* Pill Eyebrow Badge (Matching Image 1 & 2) */}
            <div className="hero-solution-pill">
              <Sparkles size={14} className="pill-sparkle-icon" />
              <span>AI SOLUTION</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-moniveo-headline">
              Turn workflow into{' '}
              <span className="hero-blue-highlight">AI agent</span>{' '}
              automations.
            </h1>

            {/* Subtitle */}
            <p className="hero-moniveo-subhead">
              Powerful and production-ready, our cloud platform has the solutions you need to succeed.
            </p>

            {/* CTAs */}
            <div className="hero-actions-row">
              <button 
                type="button"
                className="hero-get-started-btn"
                onClick={() => onNavigate('signup')}
              >
                <span>Get started</span>
                <ChevronRight size={18} />
              </button>

              <button 
                type="button"
                className="hero-secondary-btn"
                onClick={() => onNavigate('book-demo')}
              >
                Book a Demo
              </button>
            </div>
          </div>

          {/* RIGHT / BELOW: 3D Isometric Platform Graphic & Interactive Prompt Bar */}
          <div className="hero-visual-column">
            <HeroPlatformVisual onGetStarted={() => onNavigate('signup')} />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          2. TRUSTED BY 100+ BRANDS STRIP (Matching Image 2)
          ------------------------------------------------------------- */}
      <TrustedBrandsBar />

      {/* -------------------------------------------------------------
          3. COMPLETE TOOLKIT FOR AI AUTOMATION (Matching Image 2)
          ------------------------------------------------------------- */}
      <section className="toolkit-section-wrapper" id="toolkit-section">
        <div className="container">
          <ToolkitChatbotPreview />
        </div>
      </section>

      {/* -------------------------------------------------------------
          4. DARK HIGH-CONTRAST SHOWCASE (Matching Image 1 & 2)
             "Enterprise-ready automation in seconds"
          ------------------------------------------------------------- */}
      <DarkEnterpriseSection onExplore={() => onNavigate('signup')} />

      {/* -------------------------------------------------------------
          5. CONNECTED AI ORCHESTRATION PLATFORM (Matching Image 2)
          ------------------------------------------------------------- */}
      <section className="orchestration-section-wrapper" id="orchestration-platform">
        <div className="container">
          <OrchestrationFlowPreview />
        </div>
      </section>

      {/* -------------------------------------------------------------
          6. PRICING: "GET USED TO WINNING" (Matching Image 1 & 2)
          ------------------------------------------------------------- */}
      <PricingWinningSection onSelectPlan={(planId) => onNavigate('signup')} />

      {/* -------------------------------------------------------------
          7. FOUNDER MEETING & DEMO RESERVATION
          ------------------------------------------------------------- */}
      <section className="founder-section" id="founder-meeting">
        <div className="container">
          <div className="founder-card-grid">
            <div className="founder-copy-side">
              <div className="section-eyebrow-pill">
                <span>STRATEGIC ENGAGEMENT</span>
              </div>
              <h2 className="founder-heading">
                Schedule a 1-on-1 Founder & Architecture Session
              </h2>
              <p className="founder-desc">
                Meet directly with our founding engineering team to review your messaging volume, CRM architecture, product catalog ingestion, and custom guardrails.
              </p>

              <div className="founder-perks-list">
                <div className="founder-perk-item">
                  <CheckCircle2 size={18} color="#2563EB" />
                  <div>
                    <strong>Full Technical Feasibility:</strong> Meta API throughput, webhooks, and rate-limit audit.
                  </div>
                </div>
                <div className="founder-perk-item">
                  <CheckCircle2 size={18} color="#2563EB" />
                  <div>
                    <strong>Custom Guardrail Definition:</strong> Zero hallucinations with strict margin policies.
                  </div>
                </div>
                <div className="founder-perk-item">
                  <CheckCircle2 size={18} color="#2563EB" />
                  <div>
                    <strong>48-Hour Production Sandbox:</strong> Pre-loaded catalog and WhatsApp preview.
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Founder Meeting Form */}
            <div className="founder-form-card">
              <h3 className="form-card-title">Book Founder Strategy Call</h3>
              <p className="form-card-sub">Reserved for founders, CTOs, and retail operations executives.</p>

              {founderSubmitted ? (
                <div className="form-success-box">
                  <CheckCircle2 size={40} color="#16A34A" />
                  <h4>Meeting Confirmed!</h4>
                  <p>Our founder will reach out at <strong>{founderForm.email}</strong> with calendar coordinates within 2 hours.</p>
                  <Button variant="secondary" size="sm" onClick={() => setFounderSubmitted(false)}>
                    Schedule Another Session
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleFounderSubmit} className="founder-form-body">
                  {founderError && (
                    <div className="form-error-alert">{founderError}</div>
                  )}

                  <div className="form-row-2">
                    <div className="form-field-group">
                      <label>Your Name *</label>
                      <input 
                        type="text" 
                        className="moniveo-input" 
                        placeholder="Marcus Vance"
                        value={founderForm.name} 
                        onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })} 
                      />
                    </div>
                    <div className="form-field-group">
                      <label>Business Email *</label>
                      <input 
                        type="email" 
                        className="moniveo-input" 
                        placeholder="marcus@company.com"
                        value={founderForm.email} 
                        onChange={(e) => setFounderForm({ ...founderForm, email: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-field-group">
                      <label>Company / Brand Name *</label>
                      <input 
                        type="text" 
                        className="moniveo-input" 
                        placeholder="Vance Flagship Goods"
                        value={founderForm.company} 
                        onChange={(e) => setFounderForm({ ...founderForm, company: e.target.value })} 
                      />
                    </div>
                    <div className="form-field-group">
                      <label>Phone / WhatsApp</label>
                      <input 
                        type="tel" 
                        className="moniveo-input" 
                        placeholder="+1 (555) 234-5678"
                        value={founderForm.phone} 
                        onChange={(e) => setFounderForm({ ...founderForm, phone: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-field-group">
                      <label>Preferred Date</label>
                      <input 
                        type="date" 
                        className="moniveo-input" 
                        value={founderForm.preferredDate} 
                        onChange={(e) => setFounderForm({ ...founderForm, preferredDate: e.target.value })} 
                      />
                    </div>
                    <div className="form-field-group">
                      <label>Preferred Time</label>
                      <select 
                        className="moniveo-select" 
                        value={founderForm.preferredTime}
                        onChange={(e) => setFounderForm({ ...founderForm, preferredTime: e.target.value })}
                      >
                        <option>Morning (10:00 AM - 1:00 PM EST)</option>
                        <option>Afternoon (1:00 PM - 5:00 PM EST)</option>
                        <option>Evening (5:00 PM - 8:00 PM EST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label>Current Automation Bottleneck</label>
                    <textarea 
                      rows={2} 
                      className="moniveo-textarea" 
                      placeholder="What is your biggest bottleneck across WhatsApp or Instagram sales?"
                      value={founderForm.message}
                      onChange={(e) => setFounderForm({ ...founderForm, message: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="moniveo-submit-btn" 
                    disabled={founderLoading}
                  >
                    {founderLoading ? 'Confirming...' : 'Confirm Founder Meeting'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          8. FREQUENTLY ASKED QUESTIONS
          ------------------------------------------------------------- */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header-centered">
            <div className="section-eyebrow-pill">
              <span>FAQ</span>
            </div>
            <h2 className="section-title-large">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="faq-grid-2">
            {faqs.map((f, i) => (
              <div key={i} className="faq-card">
                <h4 className="faq-question">{f.q}</h4>
                <p className="faq-answer">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          9. FINAL CONVERSION BANNER
          ------------------------------------------------------------- */}
      <section className="final-cta-section">
        <div className="container">
          <div className="final-cta-card">
            <h2 className="final-cta-title">
              Ready to Turn Your Workflow into AI Agent Automations?
            </h2>
            <p className="final-cta-sub">
              Join leading retail brands that rely on KreazyAI for autonomous sales, verified checkout, and 24/7 customer care.
            </p>
            <div className="final-cta-buttons">
              <button 
                type="button" 
                className="final-cta-primary-btn" 
                onClick={() => onNavigate('signup')}
              >
                <span>Get started now</span>
                <ChevronRight size={18} />
              </button>
              <button 
                type="button" 
                className="final-cta-secondary-btn" 
                onClick={() => onNavigate('book-demo')}
              >
                Book a Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
