import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function TopDiscountBanner({
  onNavigate,
  discountPercent = 10,
  badgeText,
  promoPrefix,
  promoMessage,
  ctaText,
  storageKey = 'kreazy_discount_banner_dismissed',
  showClose = true,
  onDismiss
}) {
  const { t } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(true); // default true until client check to avoid flicker

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

  const effectiveBadge = badgeText || t('banner.badge', 'Limited Time Offer!');
  const effectivePrefix = promoPrefix || t('banner.prefix', 'Get');
  const effectiveMessage = promoMessage || t('banner.suffix', 'on Kreazy AI');
  const effectiveCta = ctaText || t('banner.cta', 'Claim Offer');

  const handleClaimOffer = (e) => {
    if (e) e.stopPropagation();
    if (onNavigate) {
      onNavigate('pricing');
    }
    // Smooth scroll to pricing section if present in current view
    setTimeout(() => {
      const pricingSection = document.getElementById('pricing') || document.querySelector('.pricing-suite-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 40);
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
      className="site-discount-banner"
      role="banner"
      aria-label="Kreazy AI Discount Announcement"
    >
      <div className="container site-discount-banner-inner">
        <div className="discount-banner-content" onClick={handleClaimOffer} style={{ cursor: 'pointer' }}>
          <span className="discount-banner-badge">
            <span className="discount-emoji" aria-hidden="true">🎉</span>
            <span className="discount-badge-label">{effectiveBadge}</span>
          </span>

          <span className="discount-banner-text">
            {effectivePrefix}{' '}
            <strong className="discount-highlight">{discountPercent}% OFF</strong>{' '}
            {effectiveMessage}
          </span>

          <button
            type="button"
            className="discount-cta-button"
            onClick={handleClaimOffer}
            aria-label={`${effectiveCta} - ${discountPercent}% OFF`}
          >
            <span>{effectiveCta}</span>
            <span className="discount-cta-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        {showClose && (
          <button
            type="button"
            className="discount-close-button"
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
