import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { LanguageSelector } from '../common/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';
import { TopDiscountBanner } from './TopDiscountBanner';

export function Navbar({
  currentPage,
  onNavigate,
  user,
  onLogout,
  showDiscountBanner = true,
  discountPercent = 10,
  promoPrefix,
  promoMessage,
  ctaText,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('kreazy_discount_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const { t } = useLanguage();

  const isBannerVisible = showDiscountBanner && !bannerDismissed;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and tag body when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('mobile-nav-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-nav-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-nav-open');
    };
  }, [mobileMenuOpen]);

  const handleLinkClick = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { id: 'pricing', label: t('nav.pricing', 'Pricing') },
    { id: 'blog', label: t('nav.blog', 'Blog') },
    { id: 'solutions', label: t('nav.solutions', 'Solutions') },
    { id: 'integrations', label: t('nav.integrations', 'Integrations') },
    { id: 'aibootcampwithsadat', label: 'AI Bootcamp', badge: 'FREE' },
  ];

  return (
    <>
      <header className={`site-nav ${scrolled ? 'scrolled' : ''} ${isBannerVisible ? 'has-discount-banner' : ''}`}>
        {isBannerVisible && (
          <TopDiscountBanner
            onNavigate={onNavigate}
            discountPercent={discountPercent}
            promoPrefix={promoPrefix}
            promoMessage={promoMessage}
            ctaText={ctaText}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}
        <div className="container site-nav-inner">
          {/* Left: Kreazy AI Logo */}
          <div
            className="brand-logo"
            onClick={() => handleLinkClick('home')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="KREAZY AI — Conversational AI"
          >
            <img
              src="/brand-logo-dark.png?v=20261115"
              alt="KREAZY AI — Conversational AI"
              className="brand-header-logo-img"
            />
          </div>

          {/* Center: Navigation Links */}
          <nav className="nav-links">
            {navLinks.map((item) => (
              <span
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleLinkClick(item.id)}
                style={item.badge ? { display: 'inline-flex', alignItems: 'center', gap: '5px' } : undefined}
              >
<span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    padding: '1px 6px',
                    borderRadius: 0,
                    letterSpacing: '0.04em'
                  }}>
                    {item.badge}
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Right: Language Selector + Log In & Get Started CTA */}
          <div className="nav-actions">
            <div className="nav-header-lang">
              <LanguageSelector />
            </div>

            {user ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  className="nav-btn-signup"
                  onClick={() => handleLinkClick('dashboard')}
                >
                  {t('nav.dashboard')}
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
                  {t('nav.signOut')}
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
                  {t('nav.signIn')}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  className="nav-btn-signup"
                  onClick={() => handleLinkClick('signup')}
                >
                  {t('nav.getStarted')}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-medium)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t('nav.selectLanguage')}:</span>
          <LanguageSelector align="left" />
        </div>

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
                  borderRadius: '0px',
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
                {t('nav.dashboard')}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                style={{ width: '100%', justifyContent: 'center', color: '#94A3B8', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              >
                {t('nav.signOut')}
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
                {t('nav.getStarted')}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleLinkClick('login')}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {t('nav.signIn')}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
