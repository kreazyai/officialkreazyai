import React from 'react';
import { Target, HeartHandshake, Shield, Sparkles, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export function AboutPage({ onNavigate }) {
  return (
    <div className="home-page-root" style={{ padding: '3.5rem 0 6rem 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header-centered" style={{ marginBottom: '3.5rem' }}>
          <div className="section-eyebrow-pill">
            <span>ABOUT KREAZYAI</span>
          </div>
          <h1 className="section-title-large">
            Building the infrastructure for modern social commerce
          </h1>
          <p className="section-subtitle-clean">
            KreazyAI was founded to solve a critical commercial bottleneck: online businesses are overwhelmed 
            by fragmented messaging while consumers demand immediate, personalized service.
          </p>
        </div>

        {/* 3 Core Value Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div className="winning-plan-card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Target size={22} color="#2563EB" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem' }}>Our Mission</h3>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: '#475569' }}>
              To empower online retailers and independent brands with intelligent, reliable automation that turns 
              casual chats into lifelong customer relationships and profitable transactions.
            </p>
          </div>

          <div className="winning-plan-card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <HeartHandshake size={22} color="#059669" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem' }}>What We Believe</h3>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: '#475569' }}>
              Commerce is fundamentally conversational. Customers want real answers from brands they trust, 
              not robotic scripts or endless wait times. AI should empower merchants, not distance them from buyers.
            </p>
          </div>

          <div className="winning-plan-card">
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Shield size={22} color="#D97706" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem' }}>Safety & Brand Integrity</h3>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.6, color: '#475569' }}>
              We believe in deterministic guardrails. AI agents must operate strictly within business knowledge 
              boundaries and preserve brand reputation with zero hallucinations or rogue behavior.
            </p>
          </div>
        </div>

        {/* Business Metrics Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '2.5rem', marginBottom: '4rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>99.8%</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>Intent & Sizing Accuracy</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>&lt; 48h</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>Catalog & Meta API Onboarding</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>3.2x</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>Average Conversion Lift</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em' }}>24/7</div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>Autonomous Customer Care</div>
          </div>
        </div>

        {/* Why KreazyAI Deep Dive */}
        <div style={{ background: '#080D1A', color: '#FFFFFF', borderRadius: '24px', padding: '3.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div className="dark-eyebrow-pill" style={{ marginBottom: '1rem' }}>
              <span>COMMERCIAL INTELLIGENCE</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1.25rem', color: '#FFFFFF' }}>
              Engineered for real commercial operations
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#94A3B8', marginBottom: '1.5rem' }}>
              Most AI chat tools were designed as generic customer service deflectors. They answer basic questions, 
              generate canned apologies, and send users to an external website link.
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#94A3B8', marginBottom: '2.5rem' }}>
              KreazyAI was engineered specifically for commerce. We treat conversation as a complete sales transaction: 
              from sizing consultation, real-time stock checks, and catalog presentation, to instant checkout link generation, 
              secure payment capture, and delivery tracking.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="hero-get-started-btn"
                onClick={() => onNavigate('book-demo')}
              >
                <span>Schedule Founder Demo</span>
                <ChevronRight size={18} />
              </button>
              <button 
                type="button" 
                className="final-cta-secondary-btn"
                onClick={() => onNavigate('how-it-works')}
              >
                Explore The Architecture
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
