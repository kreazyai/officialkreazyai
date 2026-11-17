import React, { useState } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  Share2 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function BlogPage({ onNavigate }) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'WhatsApp Commerce',
    'AI Agents',
    'Omnichannel Growth',
    'Payment & Checkout'
  ];

  const articles = [
    {
      id: 'whatsapp-automation-guide',
      title: 'How to Automate 80% of WhatsApp Inquiries and Double Sales in 30 Days',
      excerpt: 'Learn how modern retail brands deploy autonomous AI agents to qualify leads, suggest product sizes, and take orders inside WhatsApp 24/7 without human intervention.',
      category: 'WhatsApp Commerce',
      date: 'Nov 8, 2026',
      readTime: '5 min read',
      author: 'Marcus Vance',
      tag: 'Case Study',
      featured: true,
      accentColor: '#0FA968'
    },
    {
      id: 'conversational-ai-vs-chatbots',
      title: 'Why Traditional Rule-Based Chatbots Fail and How LLM Agents Win',
      excerpt: 'Traditional bots with rigid decision trees frustrate customers. Discover how contextual AI models understand mixed languages (Banglish), voice notes, and slang seamlessly.',
      category: 'AI Agents',
      date: 'Nov 4, 2026',
      readTime: '6 min read',
      author: 'Elena Rostova',
      tag: 'AI Architecture',
      featured: false,
      accentColor: '#FF334B'
    },
    {
      id: 'bkash-nagad-chat-checkout',
      title: 'Direct Chat Checkout with bKash & Nagad: Eliminating Cart Abandonment',
      excerpt: 'Friction in redirecting customers to external web checkouts causes up to 65% dropoff. Here is how direct in-chat payment links capture spontaneous buyers instantly.',
      category: 'Payment & Checkout',
      date: 'Oct 29, 2026',
      readTime: '4 min read',
      author: 'Finance & Payments Team',
      tag: 'Conversion Rate',
      featured: false,
      accentColor: '#38BDF8'
    },
    {
      id: 'inventory-realtime-sync',
      title: 'Real-Time Inventory Sync: Preventing Out-of-Stock Orders on Social Channels',
      excerpt: 'When thousands of customers message simultaneously during festive sales, stock mismatches lead to refunds. Learn how multi-channel webhook syncing solves this entirely.',
      category: 'Omnichannel Growth',
      date: 'Oct 22, 2026',
      readTime: '7 min read',
      author: 'Systems Engineering',
      tag: 'Operations',
      featured: false,
      accentColor: '#EAB308'
    },
    {
      id: 'omnichannel-unification-guide',
      title: 'Unifying Instagram DMs, Messenger & WhatsApp into a Single Merchant Inbox',
      excerpt: 'Managing scattered social channels causes delayed replies and missed deals. Explore the unified architecture that routes every conversation through one intelligent pipeline.',
      category: 'Omnichannel Growth',
      date: 'Oct 15, 2026',
      readTime: '5 min read',
      author: 'Growth Strategy Team',
      tag: 'Strategy',
      featured: false,
      accentColor: '#A855F7'
    },
    {
      id: 'peak-season-scaling',
      title: 'Handling 50,000+ Daily Inquiries During Eid & Black Friday Without Extra Staff',
      excerpt: 'Case analysis of how a top fashion house scaled conversation capacity by 10x during peak season campaigns while keeping response times under 2 seconds.',
      category: 'WhatsApp Commerce',
      date: 'Oct 8, 2026',
      readTime: '8 min read',
      author: 'Marcus Vance',
      tag: 'Enterprise',
      featured: false,
      accentColor: '#0FA968'
    }
  ];

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const featuredArticle = articles.find(a => a.featured) || articles[0];

  return (
    <div style={{ backgroundColor: '#06080D', minHeight: '100vh', color: '#FFFFFF', paddingTop: 'calc(var(--topbar-height, 68px) + 2rem)', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 3rem auto' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(255, 51, 75, 0.12)', 
            border: '1px solid rgba(255, 51, 75, 0.3)', 
            borderRadius: 0, 
            padding: '6px 14px', 
            fontSize: '0.85rem', 
            color: '#FF6B7E', 
            fontWeight: 700, 
            marginBottom: '1.25rem' 
          }}>
            <Sparkles size={14} />
            <span>KREAZY AI INSIGHTS & ENGINEERING</span>
          </div>

          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', 
            fontWeight: 900, 
            letterSpacing: '-0.04em', 
            lineHeight: 1.05, 
            marginBottom: '1.25rem',
            color: '#FFFFFF'
          }}>
            Insights for High-Growth Modern Commerce
          </h1>

          <p style={{ 
            fontSize: '1.15rem', 
            color: '#94A3B8', 
            lineHeight: 1.6, 
            maxWidth: '620px', 
            margin: '0 auto' 
          }}>
            Actionable strategies, deep dives, and automation benchmarks to scale your sales across WhatsApp, Instagram, and Meta channels.
          </p>
        </div>

        {/* Featured Hero Article */}
        {featuredArticle && (
          <div 
            onClick={() => onNavigate && onNavigate('pricing')}
            style={{ 
              background: 'rgba(18, 24, 38, 0.72)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              borderRadius: 0, 
              padding: 'clamp(1.75rem, 3.5vw, 2.75rem)', 
              marginBottom: '3rem', 
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 51, 75, 0.1)', 
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 51, 75, 0.45)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <span style={{ 
                  background: 'rgba(15, 169, 104, 0.18)', 
                  border: '1px solid rgba(15, 169, 104, 0.4)', 
                  color: '#25D366', 
                  fontSize: '0.75rem', 
                  fontWeight: 750, 
                  padding: '3px 10px', 
                  borderRadius: 0, 
                  textTransform: 'uppercase' 
                }}>
                  {featuredArticle.tag}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> {featuredArticle.date}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {featuredArticle.readTime}
                </span>
              </div>

              <h2 style={{ 
                fontSize: 'clamp(1.6rem, 2.8vw, 2.3rem)', 
                fontWeight: 850, 
                letterSpacing: '-0.035em', 
                lineHeight: 1.18, 
                marginBottom: '1rem',
                color: '#FFFFFF'
              }}>
                {featuredArticle.title}
              </h2>

              <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {featuredArticle.excerpt}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #FF334B, #E11D48)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 800, 
                    fontSize: '0.85rem',
                    color: '#FFFFFF'
                  }}>
                    MV
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>{featuredArticle.author}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Head of Product Solutions</div>
                  </div>
                </div>

                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  color: '#FFFFFF', 
                  fontWeight: 700, 
                  fontSize: '0.95rem' 
                }}>
                  <span>Read Article</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* Visual Teaser Card */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(28, 38, 58, 0.8) 0%, rgba(14, 19, 31, 0.95) 100%)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: 0, 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Automation Metric</span>
                <span style={{ fontSize: '0.82rem', color: '#25D366', fontWeight: 750 }}>+124% Captured Orders</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.04em' }}>
                ~1.4s
              </div>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                Average autonomous customer resolution speed across 1,000,000+ processed Bengali and English messages.
              </p>
            </div>
          </div>
        )}

        {/* Category Pills Filter */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          overflowX: 'auto', 
          paddingBottom: '1.25rem', 
          marginBottom: '2.5rem',
          scrollbarWidth: 'none'
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#FFFFFF' : 'rgba(255, 255, 255, 0.06)',
                color: selectedCategory === cat ? '#06080D' : '#94A3B8',
                border: selectedCategory === cat ? '1px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 0,
                padding: '8px 18px',
                fontSize: '0.875rem',
                fontWeight: selectedCategory === cat ? 750 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid (3 columns) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '1.75rem',
          marginBottom: '4rem'
        }}>
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onNavigate && onNavigate('pricing')}
              style={{
                background: 'rgba(18, 24, 38, 0.72)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 0,
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ 
                    background: 'rgba(255, 255, 255, 0.06)', 
                    border: '1px solid rgba(255, 255, 255, 0.12)', 
                    borderRadius: 0, 
                    padding: '3px 9px', 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    color: '#CBD5E1' 
                  }}>
                    {article.category}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {article.readTime}
                  </span>
                </div>

                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 800, 
                  letterSpacing: '-0.025em', 
                  lineHeight: 1.25, 
                  marginBottom: '0.75rem',
                  color: '#FFFFFF'
                }}>
                  {article.title}
                </h3>

                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#94A3B8', 
                  lineHeight: 1.55, 
                  marginBottom: '1.5rem' 
                }}>
                  {article.excerpt}
                </p>
              </div>

              <div style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
                paddingTop: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                fontSize: '0.85rem' 
              }}>
                <span style={{ color: '#64748B' }}>{article.date}</span>
                <span style={{ 
                  color: '#FFFFFF', 
                  fontWeight: 700, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px' 
                }}>
                  Read <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(28, 38, 58, 0.9) 0%, rgba(14, 19, 31, 0.95) 100%)',
          border: '1px solid rgba(255, 51, 75, 0.35)',
          borderRadius: 0,
          padding: 'clamp(2rem, 4vw, 3.5rem) 2rem',
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(255, 51, 75, 0.12)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.035em', marginBottom: '0.75rem', color: '#FFFFFF' }}>
            Ready to Automate Your Commerce Conversations?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', maxWidth: '580px', margin: '0 auto 1.75rem auto', lineHeight: 1.6 }}>
            Set up your WhatsApp, Messenger, and Instagram AI copilot in under 5 minutes. No coding required.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('signup')}
              style={{
                background: '#FFFFFF',
                color: '#06080D',
                fontWeight: 750,
                fontSize: '0.95rem',
                padding: '0.85rem 1.75rem',
                borderRadius: 0,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(255, 255, 255, 0.15)'
              }}
            >
              <span>Start Free Trial</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('pricing')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                fontWeight: 650,
                fontSize: '0.95rem',
                padding: '0.85rem 1.75rem',
                borderRadius: 0,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer'
              }}
            >
              View Pricing Plans
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
