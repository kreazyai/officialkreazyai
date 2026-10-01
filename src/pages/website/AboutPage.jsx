import React from 'react';
import { Target, HeartHandshake, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function AboutPage({ onNavigate }) {
  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="eyebrow">About KreazyAI</span>
          <h1>Building the infrastructure for modern social commerce</h1>
          <p>
            KreazyAI was founded to solve a critical commercial bottleneck: online businesses are overwhelmed
            by fragmented messaging while consumers demand immediate, personalized service.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="about-pillars-grid">
          <div className="card">
            <div className="feature-icon-box">
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Our Mission</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              To empower online retailers and independent brands with intelligent, reliable automation that turns
              casual chats into lifelong customer relationships and profitable transactions.
            </p>
          </div>

          <div className="card">
            <div className="feature-icon-box">
              <HeartHandshake size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>What We Believe</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              Commerce is fundamentally conversational. Customers want real answers from brands they trust,
              not robotic scripts or endless wait times. AI should empower merchants, not distance them from buyers.
            </p>
          </div>

          <div className="card">
            <div className="feature-icon-box">
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Safety & Brand Integrity</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              We believe in deterministic guardrails. AI agents must operate strictly within business knowledge
              boundaries and preserve brand reputation with zero hallucinations or rogue behavior.
            </p>
          </div>
        </div>

        {/* Why KreazyAI Deep Dive */}
        <div className="card" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', marginTop: 'var(--space-8)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span className="eyebrow" style={{ marginBottom: '1rem' }}>Why KreazyAI</span>
            <h2 style={{ marginBottom: '1.25rem' }}>Engineered for real commercial operations</h2>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Most AI chat tools were designed as generic customer service deflectors. They answer basic questions,
              generate canned apologies, and send users to an external website link.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              KreazyAI was engineered specifically for commerce. We treat conversation as a complete sales transaction:
              from sizing consultation, real-time stock checks, and catalog presentation, to instant checkout link generation,
              secure payment capture, and delivery tracking.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => onNavigate('book-demo')}>
                Schedule Founder Demo
              </Button>
              <Button variant="secondary" onClick={() => onNavigate('how-it-works')}>
                Explore The Architecture
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
