import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Sliders, 
  BookOpen, 
  ShieldCheck, 
  Zap, 
  Check, 
  Save, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import { aiConfigService } from '../../services/api';

export function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState('general'); // general | knowledge | behavior | safety
  const [config, setConfig] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Interactive Live Sandbox state
  const [sandboxMessages, setSandboxMessages] = useState([
    { sender: 'assistant', text: 'Hello! I am your Kreazy Copilot configured for your store. Ask me anything about sizing, stock, or policies to test my responses.' }
  ]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    aiConfigService.getConfig().then(data => setConfig(data));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    await aiConfigService.updateConfig(activeTab, config[activeTab]);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSendTest = async (e) => {
    e.preventDefault();
    if (!sandboxInput.trim() || simulating) return;

    const userMsg = sandboxInput;
    setSandboxInput('');
    setSandboxMessages(prev => [...prev, { sender: 'user', text: userMsg }]);

    setSimulating(true);
    setTimeout(async () => {
      const res = await aiConfigService.simulateChat(userMsg);
      setSandboxMessages(prev => [
        ...prev, 
        { 
          sender: 'assistant', 
          text: res.reply, 
          confidence: res.confidence, 
          source: res.source 
        }
      ]);
      setSimulating(false);
    }, 400);
  };

  if (!config) {
    return <div className="dashboard-content"><p>Loading AI Studio configuration...</p></div>;
  }

  return (
    <div className="dashboard-content">
      <div className="page-title-row">
        <div>
          <h2>AI Assistant Studio & Policy Configuration</h2>
          <p style={{ fontSize: '0.9rem' }}>Ground your AI commerce agent in your exact brand voice, products, return rules, and guardrails.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {savedSuccess && (
            <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Check size={16} /> Changes Saved Live
            </span>
          )}
          <Button variant="primary" size="sm" onClick={handleSave} icon={Save}>
            Save Active Config
          </Button>
        </div>
      </div>

      <div className="ai-studio-grid">
        {/* Left Side: Configuration Tabs & Form */}
        <div>
          {/* Studio Navigation Tabs */}
          <div className="tabs-nav smooth-scroll-x" style={{ marginBottom: 'var(--space-6)', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              1. General & Persona
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'knowledge' ? 'active' : ''}`}
              onClick={() => setActiveTab('knowledge')}
            >
              2. Store Knowledge Base
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'behavior' ? 'active' : ''}`}
              onClick={() => setActiveTab('behavior')}
            >
              3. Sales Behavior
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
              onClick={() => setActiveTab('safety')}
            >
              4. Guardrails & Safety
            </button>
          </div>

          <div className="card" style={{ padding: 'var(--space-8)' }}>
            {/* TAB 1: GENERAL */}
            {activeTab === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Assistant Identity & Persona</h3>

                <Input
                  label="Assistant Display Name"
                  value={config.general.assistantName}
                  onChange={(e) => setConfig({
                    ...config,
                    general: { ...config.general, assistantName: e.target.value }
                  })}
                  hint="How the AI introduces itself to shoppers on WhatsApp and Instagram."
                />

                <Select
                  label="Conversation Tone"
                  value={config.general.tone}
                  onChange={(e) => setConfig({
                    ...config,
                    general: { ...config.general, tone: e.target.value }
                  })}
                  options={[
                    { value: 'Professional, warm, and concise', label: 'Professional, warm, and concise (Recommended)' },
                    { value: 'Luxury & Elevated Concierge', label: 'Luxury & Elevated Concierge' },
                    { value: 'Friendly & Casual Lifestyle', label: 'Friendly & Casual Lifestyle' },
                    { value: 'Direct & Technical Specialist', label: 'Direct & Technical Specialist' }
                  ]}
                />

                <Textarea
                  label="Brand Personality Prompt Directive"
                  rows={3}
                  value={config.general.personality}
                  onChange={(e) => setConfig({
                    ...config,
                    general: { ...config.general, personality: e.target.value }
                  })}
                />

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  🌐 <strong>Multilingual Auto-Translation:</strong> Active. The AI detects customer language (Spanish, Arabic, French, etc.) and translates automatically.
                </div>
              </div>
            )}

            {/* TAB 2: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Business Knowledge & Policies</h3>

                <Textarea
                  label="Store Description & Brand Philosophy"
                  rows={2}
                  value={config.knowledge.businessDescription}
                  onChange={(e) => setConfig({
                    ...config,
                    knowledge: { ...config.knowledge, businessDescription: e.target.value }
                  })}
                />

                <Textarea
                  label="Return & Refund Policy Grounding"
                  rows={3}
                  value={config.knowledge.returnPolicy}
                  onChange={(e) => setConfig({
                    ...config,
                    knowledge: { ...config.knowledge, returnPolicy: e.target.value }
                  })}
                />

                <Textarea
                  label="Shipping & Courier Timelines"
                  rows={3}
                  value={config.knowledge.shippingInfo}
                  onChange={(e) => setConfig({
                    ...config,
                    knowledge: { ...config.knowledge, shippingInfo: e.target.value }
                  })}
                />

                <Input
                  label="Accepted Payment Gateways"
                  value={config.knowledge.paymentMethods}
                  onChange={(e) => setConfig({
                    ...config,
                    knowledge: { ...config.knowledge, paymentMethods: e.target.value }
                  })}
                />
              </div>
            )}

            {/* TAB 3: BEHAVIOR */}
            {activeTab === 'behavior' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Sales Behavior & Commercial Triggers</h3>

                <Select
                  label="Sales Strategy Mode"
                  value={config.behavior.salesStrategy}
                  onChange={(e) => setConfig({
                    ...config,
                    behavior: { ...config.behavior, salesStrategy: e.target.value }
                  })}
                  options={[
                    { value: 'Consultative (recommends items based on customer context)', label: 'Consultative (Context-aware recommendations)' },
                    { value: 'Passive Assistance (Answers questions only, no upsell)', label: 'Passive Assistance (Answers questions only)' },
                    { value: 'Proactive Promotional (Highlights bestsellers & bundles)', label: 'Proactive Promotional (Highlights bestsellers)' }
                  ]}
                />

                <Input
                  label="Maximum Allowed Discretionary Discount (%)"
                  type="number"
                  value={config.behavior.maxDiscountAllowed}
                  onChange={(e) => setConfig({
                    ...config,
                    behavior: { ...config.behavior, maxDiscountAllowed: parseInt(e.target.value, 10) }
                  })}
                  hint="AI can never offer discounts exceeding this threshold without supervisor sign-off."
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <strong>Autonomous Order Creation</strong>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generate secure payment links directly in chat when customer is ready</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={config.behavior.autoCreateOrders}
                      onChange={(e) => setConfig({
                        ...config,
                        behavior: { ...config.behavior, autoCreateOrders: e.target.checked }
                      })} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: SAFETY */}
            {activeTab === 'safety' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Guardrails & Human Escalation Triggers</h3>

                <div>
                  <label className="form-label">
                    <span>Minimum AI Confidence Threshold</span>
                    <span style={{ fontWeight: 700, color: 'var(--olive-900)' }}>{config.safety.confidenceThreshold}%</span>
                  </label>
                  <input
                    type="range"
                    min="70"
                    max="98"
                    value={config.safety.confidenceThreshold}
                    onChange={(e) => setConfig({
                      ...config,
                      safety: { ...config.safety, confidenceThreshold: parseInt(e.target.value, 10) }
                    })}
                    style={{ width: '100%', accentColor: 'var(--olive-700)' }}
                  />
                  <small style={{ color: 'var(--text-muted)' }}>
                    If confidence drops below {config.safety.confidenceThreshold}%, the conversation is flagged for human review.
                  </small>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: '#fafbf9', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ fontSize: '0.85rem' }}>Automated Human Handoff Conditions:</strong>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.825rem' }}>
                    {config.safety.humanHandoffConditions.map((cond, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Check size={14} color="var(--olive-700)" /> {cond}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Live Testing Playground */}
        <div className="ai-playground-card">
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-medium)', backgroundColor: '#fafbf9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
              <Bot size={16} color="var(--olive-700)" />
              <span>Interactive AI Test Sandbox</span>
            </div>
            <Badge variant="olive">Live Grounding</Badge>
          </div>

          {/* Sandbox Messages */}
          <div style={{ flexGrow: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.825rem' }}>
            {sandboxMessages.map((msg, i) => (
              <div 
                key={i} 
                style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  backgroundColor: msg.sender === 'user' ? 'var(--bg-subtle)' : 'var(--olive-850)',
                  color: msg.sender === 'user' ? 'var(--text-primary)' : '#ffffff',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '12px',
                  borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.sender === 'assistant' ? '2px' : '12px',
                  border: msg.sender === 'user' ? '1px solid var(--border-medium)' : 'none'
                }}
              >
                <div>{msg.text}</div>
                {msg.source && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--olive-200)', marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '2px' }}>
                    Attribution: {msg.source} ({msg.confidence}% confidence)
                  </div>
                )}
              </div>
            ))}
            {simulating && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                AI is thinking...
              </div>
            )}
          </div>

          {/* Sandbox Input */}
          <form onSubmit={handleSendTest} style={{ padding: '0.75rem', borderTop: '1px solid var(--border-medium)', display: 'flex', gap: '0.5rem', backgroundColor: '#fafbf9' }}>
            <input
              type="text"
              className="form-input"
              style={{ height: '36px', fontSize: '0.825rem' }}
              placeholder="Ask about returns, sizing, or coupons..."
              value={sandboxInput}
              onChange={(e) => setSandboxInput(e.target.value)}
            />
            <Button type="submit" variant="primary" size="sm" icon={Send} disabled={simulating}>
              Test
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
