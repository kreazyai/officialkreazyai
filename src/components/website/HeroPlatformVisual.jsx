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
  Layers
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
        time: '42ms'
      });
    }, 450);
  };

  return (
    <div className="hero-platform-container">
      {/* 3D Isometric Platform Graphic */}
      <div className="iso-platform-scene" aria-label="KreazyAI Agent Orchestration Platform Visual">
        
        {/* Isometric Grid Background Ground */}
        <div className="iso-grid-mesh"></div>

        {/* Floating Connecting Circuit Lines */}
        <svg className="iso-circuits-svg" viewBox="0 0 700 420" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Central Hub Radial Lines */}
          <path d="M350 210 L160 120" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 4" className="circuit-line" />
          <path d="M350 210 L120 220" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 4" className="circuit-line" />
          <path d="M350 210 L190 320" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 4" className="circuit-line" />
          <path d="M350 210 L540 120" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 4" className="circuit-line" />
          <path d="M350 210 L590 220" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 4" className="circuit-line" />
          <path d="M350 210 L520 320" stroke="#BFDBFE" strokeWidth="2" strokeDasharray="4 4" className="circuit-line" />

          {/* Stepper Flow Lines */}
          <path d="M350 160 L440 90" stroke="#93C5FD" strokeWidth="2.5" />
          <path d="M440 90 L560 60" stroke="#93C5FD" strokeWidth="2.5" />
        </svg>

        {/* Central 3D Elevated Pedestal / Hub */}
        <div className="iso-central-pedestal">
          <div className="pedestal-shadow"></div>
          <div className="pedestal-outer-ring">
            <div className="pedestal-inner-ring">
              <div className="pedestal-core">
                {/* Stylized Modern Moniveo/KreazyAI Mark */}
                <div className="pedestal-brand-glyph">
                  <div className="glyph-bar glyph-1"></div>
                  <div className="glyph-bar glyph-2"></div>
                  <div className="glyph-bar glyph-3"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="pedestal-pulse-beacon"></div>
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

        {/* Floating Isometric Integration Service Nodes */}
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

      {/* Docked AI Prompt Input Bar (Matching Image 1 & 2) */}
      <div className="hero-prompt-bar-wrap">
        <form className="hero-prompt-card" onSubmit={handleSendPrompt}>
          <div className="hero-prompt-main-row">
            <input 
              type="text"
              className="hero-prompt-input"
              placeholder="Ask anything ..."
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
                title="Add attachment or data source"
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
                onClick={() => setPromptText("Voice prompt recorded: Check customer returns")}
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
