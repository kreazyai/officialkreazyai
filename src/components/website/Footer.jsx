import React from 'react';
import { ArrowUpRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function Footer({ onNavigate }) {
  const handleNav = (page) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-col" style={{ paddingRight: '2rem' }}>
            <div className="brand-logo" style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => handleNav('home')}>
              <div className="brand-icon">
                <span>K</span>
              </div>
              <span>Kreazy<span className="ai">AI</span></span>
            </div>
            <p style={{ fontSize: '0.9rem', marginBottom: '1.25rem', maxWidth: '320px' }}>
              AI-powered business automation platform for modern online retailers and multi-channel commerce brands.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', color: 'var(--status-success-text)', fontWeight: 600 }}>
              <span className="status-dot active"></span>
              Meta Cloud APIs & Systems Operational
            </div>
          </div>

          {/* Product Col */}
          <div className="footer-col">
            <h5>Product</h5>
            <ul className="footer-links">
              <li><a href="#features" onClick={(e) => { e.preventDefault(); handleNav('features'); }}>AI Sales Agent</a></li>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); handleNav('features'); }}>AI Support Concierge</a></li>
              <li><a href="#features" onClick={(e) => { e.preventDefault(); handleNav('features'); }}>Omnichannel Inbox</a></li>
              <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); handleNav('how-it-works'); }}>Workflow Engine</a></li>
              <li><a href="#pricing" onClick={(e) => { e.preventDefault(); handleNav('pricing'); }}>Pricing Plans</a></li>
            </ul>
          </div>

          {/* Channels Col */}
          <div className="footer-col">
            <h5>Channels</h5>
            <ul className="footer-links">
              <li><a href="#channels" onClick={(e) => { e.preventDefault(); handleNav('features'); }}>WhatsApp Business</a></li>
              <li><a href="#channels" onClick={(e) => { e.preventDefault(); handleNav('features'); }}>Instagram Direct</a></li>
              <li><a href="#channels" onClick={(e) => { e.preventDefault(); handleNav('features'); }}>Facebook Messenger</a></li>
              <li><a href="#channels" onClick={(e) => { e.preventDefault(); handleNav('features'); }}>Shopify Catalog Sync</a></li>
              <li><a href="#channels" onClick={(e) => { e.preventDefault(); handleNav('features'); }}>WooCommerce Connector</a></li>
            </ul>
          </div>

          {/* Company Col */}
          <div className="footer-col">
            <h5>Company</h5>
            <ul className="footer-links">
              <li><a href="#about" onClick={(e) => { e.preventDefault(); handleNav('about'); }}>About KreazyAI</a></li>
              <li><a href="#contact" onClick={(e) => { e.preventDefault(); handleNav('contact'); }}>Contact Sales</a></li>
              <li><a href="#demo" onClick={(e) => { e.preventDefault(); handleNav('book-demo'); }}>Book a Demo</a></li>
              <li><a href="#faq" onClick={(e) => { e.preventDefault(); handleNav('faq'); }}>Knowledge & FAQ</a></li>
            </ul>
          </div>

          {/* Legal Col */}
          <div className="footer-col">
            <h5>Governance</h5>
            <ul className="footer-links">
              <li><a href="#privacy" onClick={(e) => { e.preventDefault(); handleNav('legal-privacy'); }}>Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => { e.preventDefault(); handleNav('legal-terms'); }}>Terms of Service</a></li>
              <li><a href="#security" onClick={(e) => { e.preventDefault(); handleNav('faq'); }}>Data Security & Meta Compliance</a></li>
              <li><a href="#gdpr" onClick={(e) => { e.preventDefault(); handleNav('legal-privacy'); }}>GDPR Alignment</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Row */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} KreazyAI Technologies Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => handleNav('legal-privacy')}>Privacy</span>
            <span style={{ cursor: 'pointer' }} onClick={() => handleNav('legal-terms')}>Terms</span>
            <span style={{ cursor: 'pointer' }} onClick={() => handleNav('contact')}>Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
