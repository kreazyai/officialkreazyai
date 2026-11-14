import React, { useState } from 'react';
import { 
  FileText, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  Activity,
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';

export function OrchestrationFlowPreview() {
  const [activeStep, setActiveStep] = useState('produce');

  return (
    <div className="orchestration-section-wrap">
      <div className="section-header-centered">
        <h2 className="section-title-large">
          Connected AI orchestration platform
        </h2>
        <p className="section-subtitle-clean">
          Powerful and production-ready, our cloud platform has the solutions you need to succeed.
        </p>
      </div>

      {/* Visual Workflow Canvas Shell */}
      <div className="orchestration-canvas-frame">
        {/* Top canvas bar */}
        <div className="canvas-header-bar">
          <div className="canvas-nav-left">
            <span className="canvas-tab active">Stage</span>
            <span className="canvas-tab">Policies</span>
            <span className="canvas-tab">Run History</span>
          </div>
          <div className="canvas-status-tag">
            <span className="status-dot-active"></span>
            <span>Live Orchestrator</span>
          </div>
        </div>

        {/* Canvas Body: Left Graph + Right Inspector */}
        <div className="canvas-grid-split">
          {/* LEFT: Node Graph */}
          <div className="canvas-nodes-plane">
            {/* Node 1 */}
            <div 
              className={`flow-node-box ${activeStep === 'send' ? 'active' : ''}`}
              onClick={() => setActiveStep('send')}
            >
              <div className="node-box-header">
                <FileText size={14} color="#2563EB" />
                <span>Send written report</span>
              </div>
              <div className="node-box-meta">Trigger: Daily 09:00 AM</div>
            </div>

            {/* Connecting arrow */}
            <div className="node-connector-line">
              <span className="connector-arrow">↓</span>
            </div>

            {/* Node 2: Central AI */}
            <div 
              className={`flow-node-box node-decision ${activeStep === 'produce' ? 'active' : ''}`}
              onClick={() => setActiveStep('produce')}
            >
              <div className="node-box-header">
                <Cpu size={14} color="#1D4ED8" />
                <span>Produce report & inspect</span>
              </div>
              <div className="node-box-meta">KreazyAI Autonomous Evaluator</div>
            </div>

            {/* Branching */}
            <div className="node-branch-split">
              <div className="node-branch-arm">
                <span className="branch-label">Condition: Urgent</span>
                <div 
                  className={`flow-node-box branch-urgent ${activeStep === 'urgent' ? 'active' : ''}`}
                  onClick={() => setActiveStep('urgent')}
                >
                  <div className="node-box-header">
                    <AlertCircle size={14} color="#EA580C" />
                    <span>Urgent data</span>
                  </div>
                  <div className="node-box-meta">SMS & WhatsApp Escalate</div>
                </div>
              </div>

              <div className="node-branch-arm">
                <span className="branch-label">Condition: Standard</span>
                <div 
                  className={`flow-node-box branch-standard ${activeStep === 'email' ? 'active' : ''}`}
                  onClick={() => setActiveStep('email')}
                >
                  <div className="node-box-header">
                    <Send size={14} color="#16A34A" />
                    <span>Email report</span>
                  </div>
                  <div className="node-box-meta">Store in BigQuery & Notify</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Inspector Sidebar */}
          <div className="canvas-inspector-panel">
            <h4 className="inspector-title">Inspector & Settings</h4>
            
            <div className="inspector-field">
              <label>Node Target</label>
              <input type="text" readOnly value="Autonomous Executive Digest" className="inspector-input" />
            </div>

            <div className="inspector-field">
              <label>Description</label>
              <textarea 
                readOnly 
                rows={3}
                value="Stage reports through differential data collection. Manage fine-grained enterprise notifications and multi-cloud sync."
                className="inspector-textarea"
              />
            </div>

            <div className="inspector-field">
              <label>Tags & Scope</label>
              <div className="inspector-tags-row">
                <span className="inspector-tag">B2B</span>
                <span className="inspector-tag">Insight</span>
                <span className="inspector-tag">CRM</span>
              </div>
            </div>

            <div className="inspector-field">
              <label>Credentials & Guardrails</label>
              <div className="inspector-credential-box">
                <ShieldCheck size={14} color="#16A34A" />
                <span>OAuth 2.0 Meta Cloud Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Compliance & SLA Strip */}
        <div className="canvas-footer-stats">
          <div className="canvas-stat-box">
            <div className="stat-value">SOC 3</div>
            <div className="stat-desc">Standards for security and compliance</div>
          </div>
          <div className="canvas-stat-box">
            <div className="stat-value">98%</div>
            <div className="stat-desc">Enterprise SLA Volumes block storage</div>
          </div>
        </div>
      </div>
    </div>
  );
}
