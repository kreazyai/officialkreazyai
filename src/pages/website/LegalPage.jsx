import React, { useState } from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export function LegalPage({ initialTab = 'privacy' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-8)' }}>
          <button
            type="button"
            className={`btn btn-md ${activeTab === 'privacy' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('privacy')}
          >
            <ShieldCheck size={16} />
            Privacy Policy
          </button>
          <button
            type="button"
            className={`btn btn-md ${activeTab === 'terms' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('terms')}
          >
            <FileText size={16} />
            Terms of Service
          </button>
        </div>

        <div className="card" style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-10)', lineHeight: 1.7 }}>
          {activeTab === 'privacy' ? (
            <div>
              <span className="eyebrow" style={{ marginBottom: '1rem' }}>Last updated: September 2026</span>
              <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>KreazyAI Privacy Policy</h1>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Introduction & Scope</h3>
              <p>
                KreazyAI ("we", "our", or "us") provides conversational commerce and AI automation software to retailers and business clients ("Merchants"). 
                This Privacy Policy explains how we collect, process, and safeguard information when Merchants connect their WhatsApp Business, 
                Instagram Professional, and Facebook accounts to our services.
              </p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Data Collection & Processing</h3>
              <p>
                We only ingest customer messages, catalog data, and order details strictly necessary to fulfill automated customer service and sales processing. 
                We do NOT sell personal data or merchant conversation records to third-party data brokers.
              </p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. AI Model Governance</h3>
              <p>
                Merchant catalog data, proprietary store policies, and customer chat histories are strictly segregated by workspace tenant. 
                We do NOT use private customer data to train public foundation models without explicit contractual consent.
              </p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Security Standards</h3>
              <p>
                All communications through Meta Cloud APIs and WhatsApp Webhooks are encrypted in transit via TLS 1.3. 
                Customer order identifiers and sensitive tokens are stored using AES-256 encryption at rest.
              </p>
            </div>
          ) : (
            <div>
              <span className="eyebrow" style={{ marginBottom: '1rem' }}>Last updated: September 2026</span>
              <h1 style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Terms of Commercial Service</h1>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Platform License</h3>
              <p>
                KreazyAI grants you a non-exclusive, non-transferable, revocable license to access and use our software for your 
                commercial social commerce channels in compliance with Meta's Commerce & Platform Terms.
              </p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Acceptable Use & AI Safety</h3>
              <p>
                Merchants agree not to configure KreazyAI to engage in deceptive practices, spamming, prohibited medical claims, 
                or unauthorized automated unsolicited marketing messages in violation of WhatsApp Business Policies.
              </p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Service Availability & Uptime</h3>
              <p>
                We strive for continuous 99.9% uptime. Scheduled maintenance windows are communicated in advance. KreazyAI is not liable 
                for upstream downtime caused by third-party infrastructure outages (e.g. Meta Graph API platform incidents).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
