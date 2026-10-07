import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

export function Navbar({ currentPage, onNavigate, user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open
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
    { id: 'features', label: 'Solutions' },
    { id: 'ai-agents', label: 'AI Agents', target: 'features' },
    { id: 'integrations', label: 'Integrations', target: 'how-it-works' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'Resources' },
  ];

  return (
    <>
      <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container site-nav-inner">
          {/* Left: Kreazy AI Logo */}
          <div
            className="brand-logo"
            onClick={() => handleLinkClick('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="KREAZY AI"
          >
            <img
              src="/logo-dark.svg"
              alt="KREAZY AI"
              className="brand-logo-img"
              style={{ height: '22px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Center: Navigation Links */}
          <nav className="nav-links">
            {navLinks.map((item) => {
              const targetPage = item.target || item.id;
              return (
                <span
                  key={item.id}
                  className={`nav-link ${currentPage === targetPage ? 'active' : ''}`}
                  onClick={() => handleLinkClick(targetPage)}
                >
                  {item.label}
                </span>
              );
            })}
          </nav>

          {/* Right: Log In & Get Started CTA */}
          <div className="nav-actions">
            {user ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  className="nav-btn-signup"
                  onClick={() => handleLinkClick('dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="nav-btn-signin"
                  onClick={() => {
                    if (onLogout) onLogout();
                  }}
                  style={{ color: 'var(--danger)' }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="nav-btn-signin"
                  onClick={() => handleLinkClick('login')}
                >
                  Sign In
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  className="nav-btn-signup"
                  onClick={() => handleLinkClick('signup')}
                >
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} color="var(--text-primary)" /> : <Menu size={22} color="var(--text-primary)" />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      <div
        className={`mobile-nav-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      {/* Mobile Slide-over Drawer (Outside header to avoid backdrop-filter fixed positioning bugs on mobile) */}
      <div
        className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                  backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-medium)' }}>
          {user ? (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleLinkClick('dashboard')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Open Dashboard
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                style={{ width: '100%', justifyContent: 'center', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleLinkClick('signup')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign Up Free
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleLinkClick('login')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Log In to Workspace
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleLinkClick('book-demo')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Book a Demo
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
