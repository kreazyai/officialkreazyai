import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Plus, 
  Globe, 
  Mic, 
  Bot, 
  Lock, 
  Sliders,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export function DarkEnterpriseSection({ onExplore }) {
  const [darkPrompt, setDarkPrompt] = useState('');
  const [darkSubmitted, setDarkSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!darkPrompt) return;
    setDarkSubmitted(true);
    setTimeout(() => setDarkSubmitted(false), 3000);
  };

  return (
    <section className="dark-enterprise-showcase">
      <div className="container">
        <div className="dark-section-header">
          <div className="dark-eyebrow-pill">
            <span>AI + AUTOMATION</span>
          </div>
          <h2 className="dark-section-title">
            Enterprise-ready automation in seconds
          </h2>
        </div>

        {/* 3 Grid Cards */}
        <div className="dark-cards-grid">
          {/* CARD 1: AI for the whole team (with embedded prompt box) */}
          <div className="dark-feature-card dark-feature-primary">
            <h3 className="dark-card-title">AI for the whole team</h3>
            <p className="dark-card-desc">
              Bring workflow automation and AI to the entire organization with apps, chatbots, and integrations.
            </p>

            {/* Embedded Dark Prompt Box (Matching Image 1 & 2) */}
            <div className="dark-embedded-prompt-box">
              <form onSubmit={handleSubmit}>
                <input 
                  type="text"
                  className="dark-prompt-input"
                  placeholder="Ask anythings ..."
                  value={darkPrompt}
                  onChange={(e) => setDarkPrompt(e.target.value)}
                />

                <div className="dark-prompt-toolbar">
                  <div className="dark-prompt-tools-left">
                    <button type="button" className="dark-tool-icon-btn">
                      <Plus size={14} />
                    </button>
                    <button type="button" className="dark-tool-icon-btn">
                      <Globe size={14} />
                    </button>
                    <button type="button" className="dark-tool-icon-btn">
                      <Mic size={14} />
                    </button>
                  </div>

                  <button type="submit" className="dark-prompt-sparkle-btn" aria-label="Send">
                    <Sparkles size={14} />
                  </button>
                </div>
              </form>

              {darkSubmitted && (
                <div className="dark-prompt-success-msg">
                  <CheckCircle2 size={13} color="#60A5FA" />
                  <span>Agent dispatched across workspace</span>
                </div>
              )}
            </div>
          </div>

          {/* CARD 2: Enterprise Security */}
          <div className="dark-feature-card">
            <div className="dark-card-icon-wrap blue">
              <ShieldCheck size={22} color="#60A5FA" />
            </div>
            <h3 className="dark-card-title">Enterprise security</h3>
            <p className="dark-card-desc">
              Keep data safe with best-in-class security protocols and AI guardrails. Role-based access control and encrypted API handshakes.
            </p>
          </div>

          {/* CARD 3: Fast and Intuitive */}
          <div className="dark-feature-card">
            <div className="dark-card-icon-wrap purple">
              <Zap size={22} color="#A78BFA" />
            </div>
            <h3 className="dark-card-title">Fast and intuitive</h3>
            <p className="dark-card-desc">
              Build easily with drag and drop, low/no-code and collaboration tools. Connect complex multi-turn logic in minutes.
            </p>

            <div className="dark-card-preview-pill">
              <Bot size={13} />
              <span>AI Chatbots</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
