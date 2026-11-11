import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../common/LanguageSelector';

export function Footer({ onNavigate }) {
  const { t } = useLanguage();

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
              {t('footer.brandDesc')}
            </p>
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <LanguageSelector align="left" />
            </div>
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
            <h5 className="footer-col-title">{t('footer.solutionsTitle')}</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('solutions')}>{t('footer.solAiSupport')}</span></li>
              <li><span onClick={() => handleNav('solutions')}>{t('footer.solLeadQual')}</span></li>
              <li><span onClick={() => handleNav('solutions')}>{t('footer.solOrderAuto')}</span></li>
              <li><span onClick={() => handleNav('solutions')}>{t('footer.solHumanHandoff')}</span></li>
            </ul>
          </div>

          {/* Integrations Col */}
          <div>
            <h5 className="footer-col-title">{t('footer.integrationsTitle')}</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('integrations')}>{t('footer.intWhatsapp')}</span></li>
              <li><span onClick={() => handleNav('integrations')}>{t('footer.intInstagram')}</span></li>
              <li><span onClick={() => handleNav('integrations')}>{t('footer.intMessenger')}</span></li>
              <li><span onClick={() => handleNav('integrations')}>{t('footer.intWebchat')}</span></li>
            </ul>
          </div>

          {/* Company & Resources */}
          <div>
            <h5 className="footer-col-title">{t('footer.companyTitle')}</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('about')}>{t('footer.compAbout')}</span></li>
              <li><span onClick={() => handleNav('aibootcampwithsadat')} style={{ color: '#FBBF24', fontWeight: 600 }}>AI Bootcamp (Free)</span></li>
              <li><span onClick={() => handleNav('founder-meeting')}>{t('footer.compFounder')}</span></li>
              <li><span onClick={() => handleNav('book-demo')}>{t('footer.compDemo')}</span></li>
              <li><span onClick={() => handleNav('contact')}>{t('footer.compContact')}</span></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h5 className="footer-col-title">{t('footer.resourcesTitle')}</h5>
            <ul className="footer-links-list">
              <li><span onClick={() => handleNav('pricing')}>{t('footer.resPricing')}</span></li>
              <li><span onClick={() => handleNav('faq')}>{t('footer.resFaq')}</span></li>
              <li><span onClick={() => handleNav('legal-privacy')}>{t('footer.resPrivacy')}</span></li>
              <li><span onClick={() => handleNav('legal-terms')}>{t('footer.resTerms')}</span></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Row */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} KREAZY AI Technologies Inc. {t('footer.copyright')}
          </div>
          <div className="footer-bottom-links">
            <span onClick={() => handleNav('legal-privacy')}>{t('footer.privacy')}</span>
            <span onClick={() => handleNav('legal-terms')}>{t('footer.terms')}</span>
            <span onClick={() => handleNav('contact')}>{t('footer.security')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
