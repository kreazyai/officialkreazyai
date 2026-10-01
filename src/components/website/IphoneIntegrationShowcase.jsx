import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Smartphone, 
  MessageCircle, 
  Send, 
  ShoppingBag, 
  ShieldCheck, 
  Zap, 
  ArrowUpRight,
  Layers,
  ChevronRight
} from 'lucide-react';
import { MobilePhoneMockup } from './MobilePhoneMockup';

export function IphoneIntegrationShowcase({ onNavigate }) {
  const [selectedChannel, setSelectedChannel] = useState('all');

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      tag: 'Meta Cloud API',
      color: '#22c55e',
      desc: 'Sub-second webhook response, catalog browsing, verified business green checkmark, and direct voice note AI transcription.',
      metric: '< 1.1s reply'
    },
    {
      id: 'instagram',
      name: 'Instagram Direct & Story',
      tag: 'Official Meta Graph',
      color: '#ec4899',
      desc: 'Automates story mention replies, high-volume direct messages, and comment-to-DM checkout triggers without shadowban risk.',
      metric: '3.4x DM sales'
    },
    {
      id: 'messenger',
      name: 'Facebook Messenger',
      tag: 'Omnichannel Lead Funnel',
      color: '#3b82f6',
      desc: 'Turns Facebook page traffic, ad click-to-chat leads, and post questions into automated appointments and direct checkout links.',
      metric: '82% qualified'
    },
    {
      id: 'shopify',
      name: 'Shopify & Catalog Sync',
      tag: 'Real-Time Inventory',
      color: '#10b981',
      desc: 'Synchronizes inventory stocks, live variants, customer orders, and tracking updates dynamically across every chat window.',
      metric: 'Real-time sync'
    }
  ];

  return (
    <div className="iphone-integration-wrapper">
      <div className="iphone-integration-grid">
        {/* Left Column: Realistic AI Customer Messaging Mobile Phone Mockup */}
        <div className="iphone-visual-container">
          <MobilePhoneMockup activeChannel={selectedChannel} onSelectChannel={setSelectedChannel} />
        </div>

        {/* Right Column: Premium iOS Native Experience Details */}
        <div className="iphone-details-container">
          <h2 className="integration-main-heading">
            Your Entire Business Messenger <br />
            <span className="highlight">Re-Engineered for iPhone.</span>
          </h2>

          <p className="integration-sub-text">
            Experience ultra-smooth, native Apple-grade design. All your customer interactions across WhatsApp, Instagram, and Messenger unified into a single intelligent conversation engine.
          </p>

          {/* Interactive Channel Cards */}
          <div className="integration-channel-cards">
            {channels.map((chan) => (
              <div 
                key={chan.id} 
                onClick={() => setSelectedChannel(chan.id)}
                className={`integration-card ${selectedChannel === chan.id ? 'active' : ''}`}
              >
                <div className="card-top-row">
                  <div className="card-title-group">
                    <span className="card-dot" style={{ backgroundColor: chan.color }}></span>
                    <h4 className="card-title">{chan.name}</h4>
                  </div>
                  <span className="card-metric-badge">{chan.metric}</span>
                </div>
                <p className="card-desc">{chan.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom Action Strip */}
          <div className="integration-action-bar">
            <div className="integration-perks">
              <div className="perk-item">
                <Check size={15} color="var(--bright-olive)" />
                <span>Zero QR Code disconnects</span>
              </div>
              <div className="perk-item">
                <Check size={15} color="var(--bright-olive)" />
                <span>Apple iOS & Android compatible</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => onNavigate('integrations')}
              className="btn btn-primary btn-md"
            >
              <span>Connect Your Channels</span>
              <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
