import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';

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

export function FaqPage() {
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
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        <div className="section-header">
          <span className="eyebrow">Frequently Answered Questions</span>
          <h1>Everything you need to know about KreazyAI</h1>
          <p>
            Learn about our AI architecture, Meta channel connections, order workflows, and safety controls.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 'var(--space-8)' }}>
          <Input
            placeholder="Search questions by keyword (e.g. Meta, pricing, handoff, WhatsApp)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>

        {/* Category Pills */}
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

        {/* FAQ List */}
        <div style={{ marginTop: 'var(--space-8)' }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openItems[idx];
              return (
                <div key={idx} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => toggleItem(idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={18} 
                      style={{ 
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        marginLeft: '0.5rem'
                      }} 
                    />
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                      <div style={{ marginTop: '0.75rem' }}>
                        <Badge variant="olive">{faq.category}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="state-box">
              <h4>No matching questions found</h4>
              <p>Try searching for a different keyword or choose another category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
