import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { MetaLogo, BkashLogo, NagadLogo, InstantSetupSpeedIcon } from './BrandLogos';

export function TrustGuaranteeSection({ 
  className = "", 
  variant = "section", // "section" | "card" | "strip"
  container = true 
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText('01643792804').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const content = (
    <div className={`trust-guarantee-card ${variant === 'strip' ? 'trust-guarantee-card-strip' : ''}`}>
      <div className="trust-guarantee-grid">
        
        {/* Item 1: Meta Cloud API Verified */}
        <div className="trust-guarantee-item trust-item-meta">
          <div className="trust-logo-badge meta-badge" title="Official Meta Cloud API">
            <MetaLogo size={22} />
          </div>
          <div className="trust-item-body">
            <div className="trust-item-title">
              {t('pricing.metaVerified', 'Official Meta Cloud API Verified')}
            </div>
            <div className="trust-item-subtitle">
              {t('pricing.metaSub', 'Direct Meta Graph API • Zero account risk')}
            </div>
          </div>
        </div>

        {/* Item 2: Instant Setup in under 5 minutes */}
        <div className="trust-guarantee-item trust-item-speed">
          <div className="trust-logo-badge speed-badge" title="5-Minute Rapid Deployment">
            <InstantSetupSpeedIcon size={22} color="#10B981" />
          </div>
          <div className="trust-item-body">
            <div className="trust-item-title">
              {t('pricing.instantSetup', 'Instant Setup in under 5 minutes')}
            </div>
            <div className="trust-item-subtitle">
              {t('pricing.speedSub', '1-Click QR Pairing • Automated Webhooks')}
            </div>
          </div>
        </div>

        {/* Item 3: bKash & Nagad 01643792804 supported */}
        <div className="trust-guarantee-item trust-item-mfs">
          <div className="trust-logos-duo" title="Official bKash & Nagad Support">
            <div className="trust-logo-badge bkash-badge" title="bKash MFS">
              <BkashLogo size={22} />
            </div>
            <div className="trust-logo-badge nagad-badge" title="Nagad MFS">
              <NagadLogo size={22} />
            </div>
          </div>
          <div className="trust-item-body">
            <div className="trust-item-title trust-mfs-title">
              <span>{t('pricing.bkashSupported', 'bKash & Nagad 01643792804 supported')}</span>
              <button
                type="button"
                onClick={handleCopyNumber}
                className="trust-copy-btn"
                title="Copy official merchant / send money number"
                aria-label="Copy bKash & Nagad number"
              >
                {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                <span className="trust-copy-text">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="trust-item-subtitle">
              {t('pricing.mfsSub', 'Direct Merchant Send Money • Instant Verification')}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  if (variant === 'section') {
    return (
      <section className={`trust-guarantee-section ${className}`} id="enterprise-trust-verification">
        {container ? (
          <div className="container">
            {content}
          </div>
        ) : (
          content
        )}
      </section>
    );
  }

  return (
    <div className={`trust-guarantee-wrapper ${className}`}>
      {content}
    </div>
  );
}
export default TrustGuaranteeSection;
