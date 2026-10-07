import React, { useState } from 'react';
import { ChevronDown, Search, ArrowRight, MessageSquare, Headphones } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

const FAQ_ITEMS = [
  {
    category: 'General',
    q: 'What is KreazyAI and who is it designed for?',
    a: 'KreazyAI is an AI-powered business automation platform designed for modern online retailers and multi-channel commerce brands. It automates customer conversations, product sizing guidance, order capturing, and customer operations across WhatsApp, Instagram, and Facebook Messenger.'
  },
  {
    category: 'General',
    q: 'How is KreazyAI different from a standard support chatbot?',
    a: 'Traditional chatbots only serve canned answers or pass links. KreazyAI functions as an autonomous commerce agent: it connects directly to your live product catalog, checks inventory, answers sizing questions based on real specs, generates secure checkout links, and writes orders to your backend.'
  },
  {
    category: 'AI',
    q: 'How does the AI know my products and policies?',
    a: 'During setup, you connect your store catalog or upload product information, sizing specifications, FAQs, and policies. KreazyAI grounds every response in your verified data and adheres to confidence thresholds to prevent hallucinations.'
  },
  {
    category: 'AI',
    q: 'Can the AI speak multiple languages?',
    a: 'Yes. KreazyAI natively detects the customer language (including English, Spanish, French, German, Arabic, Bengali, etc.) and responds fluently in that language while maintaining your brand tone.'
  },
  {
    category: 'Integrations',
    q: 'Does KreazyAI use official Meta APIs?',
    a: 'Yes. We strictly utilize official Meta Cloud APIs for WhatsApp Business, Instagram Graph, and Facebook Pages. There are no unofficial scrapers or browser extensions, protecting your business accounts from blocks or bans.'
  },
  {
    category: 'Integrations',
    q: 'Can I connect Shopify or WooCommerce?',
    a: 'Yes. We provide native real-time sync with Shopify and WooCommerce to automatically pull new products, update stock levels, and sync customer orders.'
  },
  {
    category: 'Orders',
    q: 'Can a customer place and pay for an order directly in WhatsApp or Instagram?',
    a: 'Yes. KreazyAI can generate direct secure checkout payment links (via Stripe, WhatsApp Pay, Apple Pay, or your store payment gateway). Once paid, the order is confirmed automatically and recorded in your KreazyAI dashboard.'
  },
  {
    category: 'Orders',
    q: 'How are delivery updates handled?',
    a: 'When an order status changes to "Shipped" and a tracking number is added, KreazyAI automatically sends an interactive courier update to the customer on the channel where they ordered.'
  },
  {
    category: 'Products',
    q: 'What happens when an item goes out of stock?',
    a: 'Because KreazyAI syncs with your inventory in real-time, the AI will immediately inform inquiring customers that the variant is currently out of stock and offer to recommend an in-stock alternative.'
  },
  {
    category: 'Security',
    q: 'Is customer conversational data secure and private?',
    a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never use your private store data, conversations, or customer records to train public AI models.'
  },
  {
    category: 'Security',
    q: 'What prevents the AI from giving away unauthorized discounts?',
    a: 'You set strict rule-based boundaries in the AI Assistant Studio (e.g. maximum 10% discount). Any request beyond your predefined parameters is automatically declined or escalated to a human supervisor for approval.'
  },
  {
    category: 'Support',
    q: 'How does human handoff work if a customer demands a real person?',
    a: 'When a customer requests a human or expresses frustration, KreazyAI triggers a handoff event. The conversation is flagged in your inbox with full context and an AI-drafted reply, allowing your team to take over immediately.'
  },
  {
    category: 'Pricing',
    q: 'Can I change my plan or cancel at any time?',
    a: 'Yes. There are no long-term contracts on monthly plans. You can upgrade, downgrade, or cancel directly from your workspace billing settings at any time.'
  }
];

const CATEGORIES = ['All', 'General', 'AI', 'Integrations', 'Orders', 'Products', 'Security', 'Support', 'Pricing'];

export function FaqPage({ onNavigate }) {
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (idx) => {
    setOpenItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredFaqs = FAQ_ITEMS.filter(item => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0 clamp(4rem, 8vw, 6rem) 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Header — "Frequently Answered Questions" eyebrow badge removed as requested */}
        <div style={{ maxWidth: '780px', margin: '0 auto clamp(2rem, 4vw, 3.25rem) auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.08, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
            Everything you need to know about KreazyAI
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            Learn about our AI architecture, Meta channel connections, order workflows, and safety controls.
          </p>
        </div>

        {/* Search Bar in clean container */}
        <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto var(--space-8) auto' }}>
          <Input
            placeholder="Search questions by keyword (e.g. Meta, pricing, handoff, WhatsApp)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <div className="capsule-filter-group" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`capsule-filter-btn ${selectedCat === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List in Distinct Modular Boxes */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openItems[idx];
              return (
                <div key={idx} className={`faq-box ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => toggleItem(idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <div className="faq-trigger-icon">
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                      <div style={{ marginTop: '0.85rem' }}>
                        <Badge variant="mint">{faq.category}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="state-box" style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>No matching questions found</h4>
              <p style={{ color: 'var(--text-secondary)' }}>Try searching for a different keyword or choose another category.</p>
            </div>
          )}
        </div>

        {/* Still Have Questions Box */}
        <div style={{
          marginTop: 'clamp(3rem, 6vw, 4.5rem)',
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'clamp(2rem, 4vw, 3rem) 2rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(9, 42, 32, 0.05)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
            Still have questions?
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
            Can't find what you're looking for? Our solutions team is available to walk you through our platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => onNavigate && onNavigate('book-demo')} iconRight={ArrowRight}>
              Book a 1-on-1 Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
