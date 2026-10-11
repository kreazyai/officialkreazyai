import React from 'react';
import { ArrowRight } from 'lucide-react';
import { WhatsAppIcon, MessengerIcon, InstagramIcon } from '../../../components/integrations/BrandIcons';

export function IntegrationsOverview({ connection, onSelectIntegration }) {
  const isConnected = connection?.status === 'CONNECTED';
  const isReauth = connection?.status === 'REAUTH_REQUIRED';

  return (
    <div className="macos-integrations-wrapper">
      <div className="macos-integrations-container">
        {/* Page Header */}
        <div className="macos-header">
          <h1 className="macos-title">Integrations</h1>
          <p className="macos-subtitle">
            Connect your channels and automate conversations.
          </p>
        </div>

        {/* Three macOS-inspired Cards Grid */}
        <div className="macos-cards-grid">
          {/* CARD 1 — WHATSAPP (ACTIVE & CLICKABLE) */}
          <div
            className="macos-card macos-card-interactive"
            onClick={() => onSelectIntegration && onSelectIntegration('whatsapp')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onSelectIntegration) onSelectIntegration('whatsapp');
              }
            }}
            aria-label="Manage WhatsApp Integration"
          >
            <div>
              <div className="macos-card-top">
                <div className="macos-brand-icon-box" style={{ background: '#25D366' }}>
                  <WhatsAppIcon size={44} />
                </div>
                {/* Small Connection Status Indicator */}
                <div
                  className={`macos-status-pill ${
                    isConnected ? 'connected' : isReauth ? 'reauth' : 'disconnected'
                  }`}
                >
                  <span className="macos-status-dot" />
                  <span>
                    {isConnected
                      ? 'Connected'
                      : isReauth
                      ? 'Reauth Required'
                      : 'Not Connected'}
                  </span>
                </div>
              </div>

              <div className="macos-card-content">
                <h2 className="macos-card-heading">WhatsApp</h2>
                <p className="macos-card-desc">
                  Automate customer conversations with AI
                </p>
              </div>
            </div>

            <div className="macos-card-bottom">
              <span className="macos-card-action-text">
                Manage Integration
                <ArrowRight size={15} />
              </span>
            </div>
          </div>

          {/* CARD 2 — MESSENGER (COMING SOON / DISABLED) */}
          <div className="macos-card macos-card-disabled" aria-disabled="true">
            <div>
              <div className="macos-card-top">
                <div className="macos-brand-icon-box">
                  <MessengerIcon size={44} />
                </div>
                <div className="macos-status-pill coming-soon">
                  <span className="macos-status-dot" />
                  <span>Coming Soon</span>
                </div>
              </div>

              <div className="macos-card-content">
                <h2 className="macos-card-heading">Messenger</h2>
                <p className="macos-card-desc">
                  AI-powered Messenger automation
                </p>
              </div>
            </div>

            <div className="macos-card-bottom">
              <span style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 500 }}>
                Available soon
              </span>
            </div>
          </div>

          {/* CARD 3 — INSTAGRAM (COMING SOON / DISABLED) */}
          <div className="macos-card macos-card-disabled" aria-disabled="true">
            <div>
              <div className="macos-card-top">
                <div className="macos-brand-icon-box">
                  <InstagramIcon size={44} />
                </div>
                <div className="macos-status-pill coming-soon">
                  <span className="macos-status-dot" />
                  <span>Coming Soon</span>
                </div>
              </div>

              <div className="macos-card-content">
                <h2 className="macos-card-heading">Instagram</h2>
                <p className="macos-card-desc">
                  Automate Instagram DMs and story replies
                </p>
              </div>
            </div>

            <div className="macos-card-bottom">
              <span style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 500 }}>
                Available soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
