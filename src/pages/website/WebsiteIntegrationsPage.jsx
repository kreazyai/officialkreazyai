import React, { useState } from 'react';
import {
  MessageSquare,
  Share2,
  Globe,
  ShoppingBag,
  Truck,
  Table,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

const CATEGORIES = [
  { id: 'all', label: 'All Integrations' },
  { id: 'meta', label: 'Meta Channels' },
  { id: 'ecommerce', label: 'E-Commerce' },
  { id: 'logistics', label: 'Couriers & Logistics' },
  { id: 'crm', label: 'CRM & Data' }
];

const INTEGRATIONS_DATA = [
  {
    id: 'whatsapp',
    category: 'meta',
    name: 'WhatsApp Business Cloud',
    partnerTag: 'Official Meta Partner',
    setupTime: '⚡ 2 min setup',
    desc: 'Official Meta Cloud API. Automates 1-on-1 customer chats, product catalog cards, interactive button menus, and order tracking alerts.',
    features: ['Verified green checkmark compatible', 'Interactive buttons & list messages', 'Automated shipping alerts & notifications']
  },
  {
    id: 'instagram',
    category: 'meta',
    name: 'Instagram Direct Automation',
    partnerTag: 'Official Meta Graph',
    setupTime: '⚡ 1 click connect',
    desc: 'Direct integration with Instagram Professional. Auto-respond to story mentions, post comments, and DMs with interactive product cards.',
    features: ['Story mention auto-replies', 'Comment-to-DM automated triggers', 'In-chat product catalog browsing']
  },
  {
    id: 'messenger',
    category: 'meta',
    name: 'Facebook Messenger Pages',
    partnerTag: 'Official Meta Graph',
    setupTime: '⚡ 1 click connect',
    desc: 'Synchronizes your business Facebook page inbox. Converts Click-to-Messenger ad traffic into confirmed paid orders with zero delay.',
    features: ['Paid ad lead instant conversion', 'Multi-page consolidated inbox', 'Automated customer contact saving']
  },
  {
    id: 'webchat',
    category: 'meta',
    name: 'Website Live Chat SDK',
    partnerTag: 'Embeddable JS',
    setupTime: '⚡ Copy & paste snippet',
    desc: 'Lightweight, high-speed chat widget for your website or online store. Engages visitors and captures orders without slowing down page load.',
    features: ['Sub-20kb asynchronous script', 'Customizable brand color & avatar', 'Seamless visitor-to-order flow']
  },
  {
    id: 'shopify',
    category: 'ecommerce',
    name: 'Shopify Storefront Sync',
    partnerTag: 'Direct OAuth App',
    setupTime: '⚡ Real-time sync',
    desc: 'Bi-directional synchronization with Shopify. Live inventory reservation, product variant lookup, and automatic order creation.',
    features: ['Real-time SKU & stock balance', 'Automated order and customer sync', 'Discount code validation']
  },
  {
    id: 'woocommerce',
    category: 'ecommerce',
    name: 'WooCommerce API v3',
    partnerTag: 'REST Integration',
    setupTime: '⚡ 3 min setup',
    desc: 'Connect your WordPress WooCommerce store. Search products, verify stock availability, and push confirmed in-chat orders instantly.',
    features: ['Automatic order creation in WP', 'Customer billing address sync', 'Real-time category indexing']
  },
  {
    id: 'steadfast',
    category: 'logistics',
    name: 'Steadfast Courier API',
    partnerTag: 'Bangladesh Logistics',
    setupTime: '⚡ Auto-dispatch',
    desc: 'Generate courier consignment numbers and print shipping invoices the second an order is confirmed in WhatsApp or Messenger.',
    features: ['Automated tracking number generation', 'Dhaka & nationwide parcel delivery', 'In-chat delivery status retrieval']
  },
  {
    id: 'pathao',
    category: 'logistics',
    name: 'Pathao Courier Ingestion',
    partnerTag: 'Merchant Partner',
    setupTime: '⚡ Auto-dispatch',
    desc: 'Direct courier booking via Pathao Merchant API. Push customer phone number, delivery address, and COD amount with automated dispatch.',
    features: ['Instant delivery pickup requests', 'Real-time parcel webhook updates', 'Automated COD reconciliation']
  },
  {
    id: 'redx',
    category: 'logistics',
    name: 'RedX Logistics API',
    partnerTag: 'Enterprise Delivery',
    setupTime: '⚡ Auto-dispatch',
    desc: 'Nationwide Bangladesh parcel logistics. Automatic order dispatching, invoice printing, and delivery notifications sent to customer chats.',
    features: ['Full district coverage mapping', 'Live tracking URL auto-sent to buyer', 'Automated return alert tracking']
  },
  {
    id: 'sheets',
    category: 'crm',
    name: 'Google Sheets Live Sync',
    partnerTag: 'Cloud Sync',
    setupTime: '⚡ Instant setup',
    desc: 'Instantly append verified customer phone numbers, orders, items purchased, and revenue totals into your Google Sheets spreadsheet.',
    features: ['Zero delay row appending', 'Separate sheets per channel or date', 'Custom column mapping']
  },
  {
    id: 'hubspot',
    category: 'crm',
    name: 'HubSpot CRM Integration',
    partnerTag: 'CRM Connector',
    setupTime: '⚡ OAuth connect',
    desc: 'Sync qualified retail leads, conversational transcripts, and deal stages directly into your HubSpot sales pipeline.',
    features: ['Lead contact timeline logging', 'Automated deal creation', 'Custom property mapping']
  },
  {
    id: 'webhooks',
    category: 'crm',
    name: 'Custom REST API & Webhooks',
    partnerTag: 'Developer Platform',
    setupTime: '⚡ HMAC SHA-256',
    desc: 'Connect your proprietary ERP, warehouse system, or POS backend with real-time JSON webhooks and REST endpoints.',
    features: ['HMAC SHA-256 signature verification', 'Sub-second event delivery', 'Full request retry queue']
  }
];

export function WebsiteIntegrationsPage({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = selectedCategory === 'all'
    ? INTEGRATIONS_DATA
    : INTEGRATIONS_DATA.filter(i => i.category === selectedCategory);

  return (
    <div className="integrations-page-wrapper" style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="badge badge-mint" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            ECOSYSTEM &amp; CONNECTIVITY
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Connect your entire commerce stack in minutes
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Official Meta Cloud APIs, e-commerce storefronts, logistics couriers, and CRM pipelines — seamlessly synchronized with zero code required.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', overflowX: 'auto', padding: '4px' }}>
          <div className="capsule-filter-group" style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`capsule-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid (Clean Boxes for Web & Mobile) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid var(--border)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 4px 16px rgba(9, 42, 32, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="badge badge-mint" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                    {item.partnerTag}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 700, background: 'rgba(15, 169, 104, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                    {item.setupTime}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {item.name}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {item.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Security & Reliability Strip */}
        <div style={{
          background: 'var(--mint-soft)',
          border: '1.5px solid rgba(15, 169, 104, 0.25)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '3.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              Built on official Meta enterprise cloud endpoints
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.25rem auto 0 auto' }}>
              No unofficial browser automation or risky wrappers. All channels connect directly through verified APIs.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                Official Meta Verified
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Direct handshake with Meta Graph API endpoints ensures 100% account safety and zero ban risk.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                End-to-End Encryption
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Customer messages and order data are transmitted over TLS 1.3 with AES-256 data protection.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                99.99% Uptime Guarantee
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Multi-region queue architecture guarantees zero dropped messages even during peak viral sales events.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div style={{
          background: 'var(--primary-dark)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          textAlign: 'center',
          color: '#FFFFFF',
          border: '1.5px solid rgba(15, 169, 104, 0.3)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Need a custom CRM or ERP integration?
          </h2>
          <p style={{ maxWidth: '580px', margin: '0 auto 1.75rem auto', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.975rem', lineHeight: 1.6 }}>
            Our engineering team connects custom inventory systems, warehouse management software, and payment gateways for enterprise retailers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('book-demo')}
              style={{ background: 'var(--green)', borderColor: 'var(--green)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>Schedule Live Integration Demo</span>
              <ArrowRight size={17} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('contact')}
              style={{ background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.25)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>Talk to Integration Engineer</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
