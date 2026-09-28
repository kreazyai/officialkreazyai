import React from 'react';

export function Footer({ onNavigate }) {
  const handleNav = (page) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFounderMeetingScroll = () => {
    onNavigate('home');
    setTimeout(() => {
      const el = document.getElementById('founder-meeting');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div style={{ paddingRight: '1.5rem' }}>
            <div className="brand-logo" style={{ marginBottom: '0.85rem', cursor: 'pointer' }} onClick={() => handleNav('home')}>
              <div className="brand-icon">
                <span>K</span>
              </div>
              <span>Kreazy<span className="ai">AI</span></span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', maxWidth: '320px', lineHeight: 1.6 }}>
              Enterprise-grade AI automation platform designed for modern retailers, high-volume merchants, and multichannel business operations.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', color: 'var(--soft-olive)', fontWeight: 600 }}>
              <span className="status-dot active"></span>
              Meta Cloud APIs Operational
            </div>
          </div>

          {/* Product & Solutions */}
          <div>
            <h5 className="footer-col-title">Platform</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('home')}>Product</span></li>
              <li><span onClick={() => handleNav('features')}>Solutions</span></li>
              <li><span onClick={() => handleNav('how-it-works')}>How It Works</span></li>
              <li><span onClick={() => handleNav('pricing')}>Pricing</span></li>
            </ul>
          </div>

          {/* Engage & Meetings */}
          <div>
            <h5 className="footer-col-title">Engage</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('book-demo')}>Book a Demo</span></li>
              <li><span onClick={handleFounderMeetingScroll}>Founder Meeting</span></li>
              <li><span onClick={() => handleNav('about')}>About</span></li>
              <li><span onClick={() => handleNav('contact')}>Contact</span></li>
            </ul>
          </div>

          {/* Governance & Social */}
          <div>
            <h5 className="footer-col-title">Legal & Social</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('legal-privacy')}>Privacy Policy</span></li>
              <li><span onClick={() => handleNav('legal-terms')}>Terms of Service</span></li>
              <li style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Facebook</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Instagram</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>LinkedIn</a>
              </li>
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
            <span style={{ cursor: 'pointer' }} onClick={() => handleNav('contact')}>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
