import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export function Navbar({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile drawer is open to prevent awkward background scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'home', label: 'Product' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'about', label: 'About' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
    { id: 'preview', label: '📱 Device Preview' }
  ];

  return (
    <>
      <header className="site-nav">
        <div className="container site-nav-inner">
          {/* Brand Logo */}
          <div 
            className="brand-logo" 
            onClick={() => handleLinkClick('home')}
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-icon">
              <span>K</span>
            </div>
            <span>Kreazy<span className="ai">AI</span></span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-links">
            {navLinks.map((item) => (
              <span 
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleLinkClick(item.id)}
              >
                {item.label}
              </span>
            ))}
          </nav>

          {/* Header Right Action CTAs */}
          <div className="nav-actions">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleLinkClick('login')}
            >
              Login
            </Button>

            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => handleLinkClick('book-demo')}
            >
              Book a Demo
            </Button>

            <Button 
              variant="primary" 
              size="sm"
              onClick={() => handleLinkClick('signup')}
              iconRight={ArrowRight}
            >
              Get Started
            </Button>

            {/* Mobile Hamburger Toggle with 44x44px touch area */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              style={{
                width: '44px',
                height: '44px',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-over Drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navLinks.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <div 
                  key={item.id}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`} 
                  onClick={() => handleLinkClick(item.id)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--olive-50)' : 'transparent',
                    color: isActive ? 'var(--olive-900)' : 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="status-dot active"></span>}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-medium)' }}>
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={() => handleLinkClick('login')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Merchant Log In
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => handleLinkClick('book-demo')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Book a Live Demo
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => handleLinkClick('signup')}
              iconRight={ArrowRight}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Start 14-Day Free Trial
            </Button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 28, 21, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 898
          }}
          aria-hidden="true"
        />
      )}
    </>
  );
}
