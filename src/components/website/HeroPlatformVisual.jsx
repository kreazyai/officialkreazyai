import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Globe, 
  Mic, 
  ArrowRight,
  Database,
  FileSpreadsheet,
  Mail,
  Play,
  Cloud,
  MessageCircle,
  ShoppingBag,
  Send,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  Activity
} from 'lucide-react';

export function HeroPlatformVisual({ onGetStarted }) {
  const [promptText, setPromptText] = useState('');
  const [activeQuery, setActiveQuery] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState(null);

  const sampleQueries = [
    "Sync today's Shopify orders to Google Sheets",
    "Activate AI sales concierge on WhatsApp",
    "Answer shipping FAQ from Knowledge Base"
  ];

  const handleSelectQuery = (q) => {
    setPromptText(q);
    setActiveQuery(q);
  };

  const handleSendPrompt = (e) => {
    e?.preventDefault();
    if (!promptText.trim()) return;
    setIsSubmitting(true);
    setSubmittedResponse(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedResponse({
        query: promptText,
        action: 'Autonomous workflow executed successfully',
        time: '38ms'
      });
    }, 420);
  };

  return (
    <div className="hero-platform-container">
      {/* 3D Isometric Platform Graphic */}
      <div className="iso-platform-scene" aria-label="KreazyAI Agent Orchestration Platform Visual">
        
        {/* Isometric Grid Background Ground */}
        <div className="iso-grid-mesh"></div>

        {/* Ambient Radial Energy Glow Under Pedestal */}
        <div className="iso-ambient-glow"></div>

        {/* Floating Connecting Circuit Lines with Animated Energy Pulses */}
        <svg className="iso-circuits-svg" viewBox="0 0 700 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#BFDBFE" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Main Central Hub Radial Flow Lines */}
          <path d="M350 210 L160 120" stroke="url(#circuitGrad)" strokeWidth="2" strokeDasharray="5 5" className="circuit-line circuit-anim-1" />
          <path d="M350 210 L120 220" stroke="url(#circuitGrad)" strokeWidth="2" strokeDasharray="5 5" className="circuit-line circuit-anim-2" />
          <path d="M350 210 L190 320" stroke="url(#circuitGrad)" strokeWidth="2" strokeDasharray="5 5" className="circuit-line circuit-anim-3" />
          <path d="M350 210 L540 120" stroke="url(#circuitGrad)" strokeWidth="2" strokeDasharray="5 5" className="circuit-line circuit-anim-4" />
          <path d="M350 210 L590 220" stroke="url(#circuitGrad)" strokeWidth="2" strokeDasharray="5 5" className="circuit-line circuit-anim-5" />
          <path d="M350 210 L520 320" stroke="url(#circuitGrad)" strokeWidth="2" strokeDasharray="5 5" className="circuit-line circuit-anim-6" />

          {/* Stepper Flow Lines */}
          <path d="M350 160 L440 90" stroke="#60A5FA" strokeWidth="2.5" strokeDasharray="3 3" className="circuit-line-fast" />
          <path d="M440 90 L560 60" stroke="#60A5FA" strokeWidth="2.5" strokeDasharray="3 3" className="circuit-line-fast" />

          {/* Animated Energy Signal Packets */}
          <circle cx="255" cy="165" r="3.5" fill="#2563EB" filter="url(#glow)" className="energy-dot-1" />
          <circle cx="235" cy="215" r="3.5" fill="#2563EB" filter="url(#glow)" className="energy-dot-2" />
          <circle cx="445" cy="165" r="3.5" fill="#2563EB" filter="url(#glow)" className="energy-dot-3" />
          <circle cx="470" cy="215" r="3.5" fill="#2563EB" filter="url(#glow)" className="energy-dot-4" />
        </svg>

        {/* Central 3D Elevated Pedestal / Hub */}
        <div className="iso-central-pedestal">
          <div className="pedestal-shadow"></div>
          
          {/* Concentric Sonar Pulse Beacons */}
          <div className="pedestal-sonar-ring ring-1"></div>
          <div className="pedestal-sonar-ring ring-2"></div>
          <div className="pedestal-sonar-ring ring-3"></div>

          <div className="pedestal-outer-ring">
            <div className="pedestal-inner-ring">
              <div className="pedestal-core">
                {/* Stylized Modern Moniveo/KreazyAI Mark with Glow */}
                <div className="pedestal-brand-glyph">
                  <div className="glyph-bar glyph-1"></div>
                  <div className="glyph-bar glyph-2"></div>
                  <div className="glyph-bar glyph-3"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="pedestal-status-beacon">
            <span className="beacon-dot"></span>
          </div>
        </div>

        {/* Floating Workflow Step Cards (Top Right) */}
        <div className="iso-step-card step-1">
          <div className="step-card-inner">
            <div className="step-card-icon-box blue">
              <Cpu size={14} color="#2563EB" />
            </div>
            <div className="step-card-text">
              <span className="step-card-title">AI Agent Decision</span>
              <span className="step-card-meta">Autonomous Trigger</span>
            </div>
          </div>
        </div>

        <div className="iso-step-card step-2">
          <div className="step-card-inner">
            <div className="step-card-icon-box green">
              <CheckCircle2 size={14} color="#16A34A" />
            </div>
            <div className="step-card-text">
              <span className="step-card-title">Action Executed</span>
              <span className="step-card-meta">Verified 100%</span>
            </div>
          </div>
        </div>

        {/* Floating Isometric Integration Service Nodes with Organic Animations */}
        {/* Node 1: Google Sheets (Top Left) */}
        <div className="iso-node-pill node-sheets">
          <div className="node-icon-bg sheets-bg">
            <FileSpreadsheet size={16} color="#16A34A" />
          </div>
          <span className="node-name">Sheets</span>
        </div>

        {/* Node 2: HubSpot / CRM (Middle Left) */}
        <div className="iso-node-pill node-hubspot">
          <div className="node-icon-bg hubspot-bg">
            <Database size={16} color="#EA580C" />
          </div>
          <span className="node-name">HubSpot</span>
        </div>

        {/* Node 3: Gmail (Bottom Left) */}
        <div className="iso-node-pill node-gmail">
          <div className="node-icon-bg gmail-bg">
            <Mail size={16} color="#DC2626" />
          </div>
          <span className="node-name">Gmail</span>
        </div>

        {/* Node 4: WhatsApp (Top Right) */}
        <div className="iso-node-pill node-whatsapp">
          <div className="node-icon-bg whatsapp-bg">
            <MessageCircle size={16} color="#15803D" />
          </div>
          <span className="node-name">WhatsApp</span>
        </div>

        {/* Node 5: Salesforce / Cloud (Middle Right) */}
        <div className="iso-node-pill node-salesforce">
          <div className="node-icon-bg salesforce-bg">
            <Cloud size={16} color="#0284C7" />
          </div>
          <span className="node-name">Salesforce</span>
        </div>

        {/* Node 6: Shopify (Bottom Right) */}
        <div className="iso-node-pill node-shopify">
          <div className="node-icon-bg shopify-bg">
            <ShoppingBag size={16} color="#059669" />
          </div>
          <span className="node-name">Shopify</span>
        </div>
      </div>

      {/* Docked AI Prompt Input Bar with Shimmer Aura */}
      <div className="hero-prompt-bar-wrap">
        <form className="hero-prompt-card" onSubmit={handleSendPrompt}>
          <div className="hero-prompt-main-row">
            <input 
              type="text"
              className="hero-prompt-input"
              placeholder="Ask anything about your business..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              aria-label="Ask AI Agent prompt"
            />
          </div>

          <div className="hero-prompt-actions-row">
            <div className="hero-prompt-left-actions">
              <button 
                type="button" 
                className="prompt-tool-btn" 
                title="Add data source"
                onClick={() => setPromptText("Connect Shopify Catalog & Orders")}
              >
                <Plus size={16} />
              </button>

              <button 
                type="button" 
                className="prompt-pill-btn active"
                onClick={() => setPromptText("Search live product inventory")}
              >
                <Globe size={13} />
                <span>Web Search</span>
              </button>
            </div>

            <div className="hero-prompt-right-actions">
              <button 
                type="button" 
                className="prompt-tool-btn mic-btn" 
                title="Voice input"
                onClick={() => setPromptText("Voice prompt: Check today's sales and dispatch")}
              >
                <Mic size={16} />
              </button>

              <button 
                type="submit" 
                className="prompt-send-pill-btn"
                title="Send AI Command"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="prompt-spinner"></span>
                ) : (
                  <Sparkles size={16} />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Live Feedback Result Bubble */}
        {submittedResponse && (
          <div className="prompt-result-pill animate-fade-in">
            <span className="status-dot-active"></span>
            <strong>AI Agent:</strong>
            <span>{submittedResponse.action} ({submittedResponse.time})</span>
            <button 
              type="button" 
              className="prompt-result-close" 
              onClick={() => setSubmittedResponse(null)}
            >
              ✕
            </button>
          </div>
        )}

        {/* Suggestion Quick Tags */}
        <div className="prompt-suggestions-row">
          <span className="prompt-suggestions-label">Try:</span>
          {sampleQueries.map((q) => (
            <button
              key={q}
              type="button"
              className={`prompt-suggestion-pill ${activeQuery === q ? 'active' : ''}`}
              onClick={() => handleSelectQuery(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
