import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Headphones,
  Target,
  Languages,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Clock,
  MessageSquare,
  ShoppingBag,
  Send,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

const AGENTS = [
  {
    id: 'sales',
    name: 'Autonomous Sales Agent',
    role: 'Lead Ingestion & In-Chat Commerce',
    tag: 'Revenue Driver',
    speed: '⚡ 1.2s avg reply',
    description: 'Understands customer style, sizing preferences, and budget to recommend the exact right product, calculate totals, and complete in-chat checkout.',
    capabilities: [
      'Checks live inventory and SKU availability before recommending products',
      'Calculates accurate order totals including shipping fees by location',
      'Captures and verifies customer name, phone number, and delivery address',
      'Enforces maximum discount rules to protect merchant profit margins'
    ],
    sampleSnippet: 'Recommends matching apparel & creates confirmed order in under 2 minutes'
  },
  {
    id: 'support',
    name: '24/7 Customer Support Agent',
    role: 'Instant Resolution & Policy Concierge',
    tag: 'Customer Success',
    speed: '98% First-Contact SLA',
    description: 'Answers repetitive customer inquiries instantly—delivery timelines, tracking statuses, exchange rules, and store locations without human delay.',
    capabilities: [
      'Grounded strictly on your uploaded store policies, FAQ, and shipping rules',
      'Provides live courier tracking updates (Steadfast, Pathao, RedX)',
      'Understands customer sentiment and prioritizes urgent complaints',
      'Maintains full conversation history across multiple messaging sessions'
    ],
    sampleSnippet: 'Answers delivery fees, parcel locations & policy questions with zero lag'
  },
  {
    id: 'qualifier',
    name: 'Lead Qualification Agent',
    role: 'High-Intent Customer Scoring',
    tag: 'Pipeline Builder',
    speed: 'Real-Time CRM Sync',
    description: 'Separates window shoppers from ready-to-buy customers, scoring purchase urgency and pushing qualified buyer data directly to your CRM.',
    capabilities: [
      'Extracts buyer timeline, order quantity, and preferred payment methods',
      'Scores leads (Hot, Warm, Low) based on conversational engagement depth',
      'Automatically logs customer records into your CRM and Google Sheets',
      'Triggers automated re-engagement reminders if a customer drops off'
    ],
    sampleSnippet: 'Filters high-intent buyers and syncs contact details automatically'
  },
  {
    id: 'multilingual',
    name: 'Multilingual & Voice Agent',
    role: 'Bangla, Banglish & English Processing',
    tag: 'Localized Engine',
    speed: 'Voice & Text',
    description: 'Engineered specifically for South Asian retail communication. Listens to customer voice messages and parses conversational Banglish seamlessly.',
    capabilities: [
      'Transcribes customer audio voice notes in Bangla and English in seconds',
      'Flawlessly understands romanized Banglish spelling variations',
      'Adapts tone of voice to match your brand (casual, professional, luxury)',
      'Switches languages mid-conversation based on customer preference'
    ],
    sampleSnippet: 'Understands customer voice notes and conversational Banglish naturally'
  },
  {
    id: 'vision',
    name: 'Visual Catalog Agent',
    role: 'Screenshot & Photo Recognition',
    tag: 'Computer Vision',
    speed: 'Instant Match',
    description: 'Customers frequently send screenshots of products from your social media posts. The Vision Agent recognizes the SKU, price, and variant instantly.',
    capabilities: [
      'Matches uploaded product screenshots against your live product catalog',
      'Extracts transaction ID and amount from bank and mobile payment slips',
      'Recognizes fabric color variations and apparel patterns from buyer photos',
      'Confirms order matching without requiring product link copy-pasting'
    ],
    sampleSnippet: 'Identifies products from customer photo uploads and payment receipts'
  },
  {
    id: 'moderator',
    name: 'Supervisor & Safety Copilot',
    role: 'Human In-the-Loop Orchestration',
    tag: 'Enterprise Safety',
    speed: '1-Click Takeover',
    description: 'Monitors ongoing conversations with strict confidence thresholds. Flags complex negotiations or negative sentiment for instant moderator takeover.',
    capabilities: [
      'Zero-hallucination safeguard: refuses to invent unverified prices or phantom stock',
      '1-click human agent takeover with comprehensive context brief',
      'Generates suggested AI responses that human staff can approve or edit',
      'Comprehensive audit logs of all bot and human interactions'
    ],
    sampleSnippet: 'Escalates sensitive inquiries to human moderators with draft replies'
  }
];

export function AiAgentsPage({ onNavigate }) {
  const [selectedAgentId, setSelectedAgentId] = useState('sales');

  const activeAgent = AGENTS.find(a => a.id === selectedAgentId) || AGENTS[0];

  return (
    <div className="ai-agents-page-wrapper" style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="badge badge-mint" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            SPECIALIZED WORKFORCE
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Meet your autonomous AI workforce
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Specialized autonomous agents trained to sell, recommend, qualify leads, and support customers across WhatsApp, Instagram, and Messenger — 24/7.
          </p>
        </div>

        {/* Agents Grid (All 6 Agents in Clear Box Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          {AGENTS.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '2px solid var(--green)' : '1.5px solid var(--border)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: isSelected ? '0 12px 32px rgba(15, 169, 104, 0.14)' : '0 4px 16px rgba(9, 42, 32, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="badge badge-mint" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                    {agent.tag}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 700, background: 'rgba(15, 169, 104, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                    {agent.speed}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {agent.name}
                </h3>
                <div style={{ fontSize: '0.825rem', color: 'var(--green-dark)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {agent.role}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  {agent.description}
                </p>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--primary-dark)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Capabilities:
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {agent.capabilities.slice(0, 2).map((cap, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Conversation Simulation Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid var(--border)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          boxShadow: '0 12px 40px rgba(9, 42, 32, 0.06)',
          marginBottom: '3.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge badge-mint" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              LIVE AGENT SIMULATION
            </span>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
              See how the {activeAgent.name} conducts business
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              Real multi-turn conversation simulation handling customer inquiries, verifying inventory, and confirming orders in real time.
            </p>
          </div>

          {/* WhatsApp / Chat Screen Container */}
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            background: 'var(--mint-soft)',
            border: '1.5px solid rgba(15, 169, 104, 0.25)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(9, 42, 32, 0.08)'
          }}>
            {/* Top Bar */}
            <div style={{
              background: 'var(--primary-dark)',
              color: '#FFFFFF',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <Bot size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 750 }}>KREAZY AI Assistant</div>
                  <div style={{ fontSize: '0.72rem', color: '#AEEBCB' }}>● Online • Meta Cloud Verified</div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                WhatsApp Business
              </span>
            </div>

            {/* Chat Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Message 1: Customer */}
              <div style={{ alignSelf: 'flex-start', maxWidth: '82%', background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '14px 14px 14px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  Apar eita ki black color S size hobe? Ar delivery charge koto?
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                  10:14 AM
                </div>
              </div>

              {/* Message 2: AI Agent */}
              <div style={{ alignSelf: 'flex-end', maxWidth: '85%', background: '#E3F8ED', border: '1px solid rgba(15, 169, 104, 0.3)', padding: '0.85rem 1rem', borderRadius: '14px 14px 4px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary-dark)', lineHeight: 1.45 }}>
                  Ji! Black color Size S ekhon live stock-e available ache (৳1,450). ✨<br />
                  Dhaka city te delivery charge ৳70, 24-48 hours e delivery paben. Apnar order confirm korte name, address ar phone number dite paren?
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--green-dark)', textAlign: 'right', marginTop: '4px' }}>
                  10:14 AM • ⚡ Replied in 1.1s
                </div>
              </div>

              {/* Message 3: Customer */}
              <div style={{ alignSelf: 'flex-start', maxWidth: '82%', background: '#FFFFFF', padding: '0.85rem 1rem', borderRadius: '14px 14px 14px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  Order confirm kore den. Name: Tanvir Ahmed, Phone: 01712345678, Address: House 12, Road 5, Banani, Dhaka.
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                  10:15 AM
                </div>
              </div>

              {/* Message 4: AI Agent Confirmed Order Card */}
              <div style={{ alignSelf: 'flex-end', maxWidth: '88%', background: '#FFFFFF', border: '1.5px solid var(--green)', padding: '1rem', borderRadius: '14px 14px 4px 14px', boxShadow: '0 4px 12px rgba(15, 169, 104, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--green)" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--primary-dark)' }}>ORDER CONFIRMED #KZ-9941</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  <strong>Item:</strong> Minimalist Black T-Shirt (Size: S) • ৳1,450<br />
                  <strong>Delivery:</strong> Banani, Dhaka • ৳70<br />
                  <strong>Total:</strong> ৳1,520 (Cash on Delivery)
                </div>
                <div style={{ fontSize: '0.75rem', background: 'var(--mint-soft)', padding: '6px 10px', borderRadius: '6px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                  ✓ Synced to CRM &amp; Steadfast Courier Dispatch
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Governance & Guardrails Strip */}
        <div style={{
          background: 'var(--mint-soft)',
          border: '1.5px solid rgba(15, 169, 104, 0.25)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '3.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              Built with zero-hallucination retail safety
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.25rem auto 0 auto' }}>
              Your brand reputation is protected with multi-layered guardrails and instant human oversight.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                Strict Catalog Grounding
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Agents only quote verified prices and items present in your live store database.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                Discount Thresholds
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Hard caps prevent unauthorized bargaining and protect your product margins.
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                Instant Human Takeover
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Moderators can intervene at any moment with full chat summary and suggested replies.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          background: 'var(--primary-dark)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          textAlign: 'center',
          color: '#FFFFFF',
          border: '1.5px solid rgba(15, 169, 104, 0.3)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Deploy custom AI agents for your business
          </h2>
          <p style={{ maxWidth: '580px', margin: '0 auto 1.75rem auto', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.975rem', lineHeight: 1.6 }}>
            Connect your Meta channels and let our engineering team calibrate your store agents in under 24 hours.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('book-demo')}
              style={{ background: 'var(--green)', borderColor: 'var(--green)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>Book a Demo</span>
              <ArrowRight size={17} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('signup')}
              style={{ background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.25)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>Start Free Trial</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
