import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '../common/Button';

export function Navbar({ currentPage, onNavigate }) {
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
    { id: 'home', label: 'Platform' },
    { id: 'features', label: 'Solutions', hasDropdown: true },
    { id: 'how-it-works', label: 'Resources' },
    { id: 'pricing', label: 'Pricing' },
  ];

  return (
    <>
      <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container site-nav-inner">
          {/* Left: KreazyAI Geometric Blue Logo (Matching Image 1 & 2) */}
          <div 
            className="brand-logo" 
            onClick={() => handleLinkClick('home')}
            style={{ cursor: 'pointer' }}
          >
            {/* Custom Modern Geometric Blue Glyph */}
            <div className="modern-brand-mark">
              <div className="mark-slant m-1"></div>
              <div className="mark-slant m-2"></div>
              <div className="mark-slant m-3"></div>
            </div>
            <span className="brand-text">
              moniveo <span className="brand-text-sub">KreazyAI</span>
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav className="nav-links">
            {navLinks.map((item) => (
              <span 
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleLinkClick(item.id)}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown size={14} style={{ opacity: 0.65, marginLeft: 2 }} />}
              </span>
            ))}
          </nav>

          {/* Right: Login & Blue Pill Sign Up Button */}
          <div className="nav-actions">
            <button 
              type="button"
              className="nav-link-btn"
              onClick={() => handleLinkClick('login')}
            >
              Login
            </button>

            <button 
              type="button"
              className="nav-signup-pill-btn"
              onClick={() => handleLinkClick('signup')}
            >
              Sign Up
            </button>

            {/* Mobile Circular Hamburger Button (Matching Image 1) */}
            <button 
              className="mobile-menu-circle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-over Drawer (Matching Image 1) */}
      <div 
        className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navLinks.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <div 
                key={item.id}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`} 
                onClick={() => handleLinkClick(item.id)}
              >
                <span>{item.label}</span>
                {isActive && <span className="mobile-active-dot"></span>}
              </div>
            );
          })}
          <div 
            className="mobile-nav-link" 
            onClick={() => handleLinkClick('about')}
          >
            <span>About</span>
          </div>
          <div 
            className="mobile-nav-link" 
            onClick={() => handleLinkClick('contact')}
          >
            <span>Contact</span>
          </div>
        </div>

        <div className="mobile-drawer-bottom-actions">
          <button 
            type="button"
            className="mobile-drawer-primary-btn"
            onClick={() => handleLinkClick('signup')}
          >
            Sign Up Free
          </button>
          <button 
            type="button"
            className="mobile-drawer-secondary-btn"
            onClick={() => handleLinkClick('login')}
          >
            Log In to Workspace
          </button>
          <button 
            type="button"
            className="mobile-drawer-ghost-btn"
            onClick={() => handleLinkClick('book-demo')}
          >
            Book a Demo
          </button>
        </div>
      </div>
    </>
  );
}
