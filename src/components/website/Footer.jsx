import React from 'react';

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
          <div className="footer-brand-col">
            <div className="brand-logo" style={{ marginBottom: '1rem', cursor: 'pointer' }} onClick={() => handleNav('home')} title="KreazyAI">
              <img src="/logo-white.svg" alt="KreazyAI" className="brand-logo-img brand-logo-lg" />
            </div>
            <p className="footer-brand-desc">
              Smart automation for your business. Transform conversations across WhatsApp, Instagram, Messenger, and Web into sales automatically — 24/7.
            </p>
            <div className="footer-social-links">
              <a href="https://facebook.com/kreazyai" target="_blank" rel="noopener noreferrer">Facebook</a>
              <span>•</span>
              <a href="https://instagram.com/kreazyai" target="_blank" rel="noopener noreferrer">Instagram</a>
              <span>•</span>
              <a href="https://linkedin.com/company/kreazyai" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </div>

          {/* Solutions Col */}
          <div>
            <h5 className="footer-col-title">Solutions</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('solutions')}>AI Customer Support</span></li>
              <li><span onClick={() => handleNav('solutions')}>Lead Qualification</span></li>
              <li><span onClick={() => handleNav('solutions')}>Order Automation</span></li>
              <li><span onClick={() => handleNav('solutions')}>Human Handoff</span></li>
            </ul>
          </div>

          {/* Integrations Col */}
          <div>
            <h5 className="footer-col-title">Integrations</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('integrations')}>WhatsApp Business</span></li>
              <li><span onClick={() => handleNav('integrations')}>Instagram Direct</span></li>
              <li><span onClick={() => handleNav('integrations')}>Facebook Messenger</span></li>
              <li><span onClick={() => handleNav('integrations')}>Website Live Chat</span></li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div>
            <h5 className="footer-col-title">Company</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('about')}>About Us</span></li>
              <li><span onClick={() => handleNav('founder-meeting')}>Founder Consultation</span></li>
              <li><span onClick={() => handleNav('book-demo')}>Schedule Demo</span></li>
              <li><span onClick={() => handleNav('contact')}>Contact Team</span></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="footer-col-title">Resources</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('pricing')}>Pricing Plans</span></li>
              <li><span onClick={() => handleNav('faq')}>FAQ & Guides</span></li>
              <li><span onClick={() => handleNav('legal-privacy')}>Privacy Policy</span></li>
              <li><span onClick={() => handleNav('legal-terms')}>Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Row */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} KREAZY AI Technologies Inc. All rights reserved. • kreazyai.com
          </div>
          <div className="footer-bottom-links">
            <span onClick={() => handleNav('legal-privacy')}>Privacy</span>
            <span onClick={() => handleNav('legal-terms')}>Terms</span>
            <span onClick={() => handleNav('contact')}>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
