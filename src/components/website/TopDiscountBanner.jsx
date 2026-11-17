import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function TopDiscountBanner({
  onNavigate,
  discountPercent = 10,
  promoPrefix,
  promoMessage,
  ctaText,
  storageKey = 'kreazy_discount_banner_dismissed',
  showClose = true,
  onDismiss
}) {
  const { t } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(true); // default true until client check to avoid flicker
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      setIsDismissed(stored === 'true');
    } catch {
      setIsDismissed(false);
    }
  }, [storageKey]);

  if (isDismissed) {
    return null;
  }

  const effectivePrefix = promoPrefix || t('banner.prefix', 'Get');
  const effectiveMessage = promoMessage || t('banner.suffix', 'on Kreazy AI');
  const effectiveCta = ctaText || t('banner.cta', 'Claim Offer');

  const handleClaimOffer = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Persist claimed promo state in sessionStorage
    try {
      sessionStorage.setItem('kreazy_active_promo', 'KREAZY10');
      sessionStorage.setItem('kreazy_discount_percent', String(discountPercent || 10));
    } catch {
      // storage unavailable
    }

    // Immediate tactile feedback
    setClaimed(true);
    setTimeout(() => setClaimed(false), 3000);

    // Global custom event for the pricing page to reactively update prices & show toast
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kreazy:apply-discount', {
          detail: {
            promoCode: 'KREAZY10',
            discountPercent: discountPercent || 10,
            source: 'header-banner',
            timestamp: Date.now()
          }
        })
      );
    }

    // Navigate to pricing page if not already there
    if (onNavigate) {
      onNavigate('pricing');
    }

    // Smooth scroll with fixed header offset so pricing cards land perfectly in view
    const performScroll = () => {
      const pricingSection =
        document.getElementById('pricing') ||
        document.querySelector('.pricing-suite-section') ||
        document.querySelector('.pricing-controls-row');
      if (pricingSection) {
        const headerEl = document.querySelector('.site-nav');
        const headerOffset = headerEl ? headerEl.offsetHeight : 80;
        const targetPos =
          pricingSection.getBoundingClientRect().top + window.pageYOffset - (headerOffset + 18);
        window.scrollTo({
          top: targetPos > 0 ? targetPos : 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    // Execute scroll immediately and again shortly in case of view transition
    performScroll();
    setTimeout(performScroll, 60);
    setTimeout(performScroll, 220);
  };

  const handleDismiss = (e) => {
    if (e) e.stopPropagation();
    setIsDismissed(true);
    try {
      sessionStorage.setItem(storageKey, 'true');
    } catch {
      // storage unavailable
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <aside
      className="site-discount-banner apple-discount-banner"
      role="banner"
      aria-label="Kreazy AI Discount Announcement"
    >
      <div className="container site-discount-banner-inner apple-discount-inner">
        <div
          className="discount-banner-content apple-discount-content"
          onClick={handleClaimOffer}
        >
          <span className="discount-banner-text apple-discount-text">
            {effectivePrefix}{' '}
            <strong className="discount-highlight apple-discount-highlight">{discountPercent}% OFF</strong>{' '}
            {effectiveMessage}{' '}
            <span className="apple-discount-code-tag">Use code <strong>KREAZY10</strong></span>
          </span>

          <button
            type="button"
            className={`discount-cta-button apple-discount-cta ${claimed ? 'claimed' : ''}`}
            onClick={handleClaimOffer}
            aria-label={`${effectiveCta} - ${discountPercent}% OFF`}
          >
            {claimed ? (
              <>
                <Check size={14} className="apple-cta-icon-check" />
                <span>Offer Claimed!</span>
              </>
            ) : (
              <>
                <span>{effectiveCta}</span>
                <ArrowRight size={13} className="discount-cta-arrow" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {showClose && (
          <button
            type="button"
            className="discount-close-button apple-discount-close"
            onClick={handleDismiss}
            aria-label={t('banner.dismiss', 'Dismiss discount banner')}
            title="Dismiss announcement"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}
