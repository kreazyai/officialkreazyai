import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft,
  Clock, 
  User, 
  Tag, 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  Share2,
  X,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { articles } from '../../data/blogArticles';

export function BlogPage({ onNavigate, articleSlug }) {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const categories = [
    'All',
    'WhatsApp Commerce',
    'AI Agents',
    'Omnichannel Growth',
    'Payment & Checkout'
  ];

  // Synchronize activeArticle with articleSlug prop or current window pathname
  useEffect(() => {
    if (articleSlug) {
      const match = articles.find(a => a.id.toLowerCase() === articleSlug.toLowerCase());
      if (match) {
        setActiveArticle(match);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
      if ((parts[0] === 'article' || parts[0] === 'articles' || parts[0] === 'blog') && parts[1]) {
        const match = articles.find(a => a.id.toLowerCase() === parts[1].toLowerCase());
        if (match) {
          setActiveArticle(match);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
    }
    setActiveArticle(null);
  }, [articleSlug]);

  const handleOpenArticle = (article) => {
    setActiveArticle(article);
    if (onNavigate) {
      onNavigate('/article/' + article.id);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/article/' + article.id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBlog = () => {
    setActiveArticle(null);
    if (onNavigate) {
      onNavigate('/blog');
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/blog');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredArticles = selectedCategory === 'All'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const featuredArticle = articles.find(a => a.featured) || articles[0];

  /* ═══════════════════════════════════════════════════════════════
     VIEW A: FULL-PAGE ARTICLE READER (URL: /article/:slug)
     - NO DATE, NO 'Verified Publication' (Completely Removed)
     - STRICT 0px CORNERING ARCHITECTURE (No rounded curves)
     ═══════════════════════════════════════════════════════════════ */
  if (activeArticle) {
    return (
      <div style={{ 
        backgroundColor: '#06080D', 
        minHeight: '100vh', 
        color: '#FFFFFF', 
        paddingTop: 'calc(var(--topbar-height, 68px) + 2rem)', 
        paddingBottom: '6rem' 
      }}>
        <div className="container" style={{ maxWidth: '920px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Breadcrumb & Top Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '1.25rem'
          }}>
            <button
              type="button"
              onClick={handleBackToBlog}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: '#FFFFFF',
                borderRadius: 0,
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#475569'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
            >
              <ArrowLeft size={15} />
              <span>All Articles</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B' }}>
              <span style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={() => onNavigate && onNavigate('home')}>Home</span>
              <span>/</span>
              <span style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={handleBackToBlog}>Blog</span>
              <span>/</span>
              <span style={{ color: '#CBD5E1', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeArticle.title}
              </span>
            </div>
          </div>

          {/* Article Header Meta (NO DATE, NO 'Verified Publication') */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.84rem',
            color: '#94A3B8'
          }}>
            <span style={{
              background: 'rgba(148, 163, 184, 0.16)',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              color: '#E2E8F0',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {activeArticle.category}
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#94A3B8' }}>
              <Clock size={14} /> {activeArticle.readTime}
            </span>
          </div>

          {/* Article Title */}
          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.1rem)',
            fontWeight: 900,
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            color: '#FFFFFF',
            margin: '0 0 1.75rem 0'
          }}>
            {activeArticle.title}
          </h1>

          {/* Author Showcase Card (Strict 0px Corners) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '1.1rem 1.35rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 0,
            marginBottom: '2.5rem'
          }}>
            <img
              src={activeArticle.avatar || '/sadat-sakib.jpg'}
              alt={activeArticle.author}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: 0,
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                flexShrink: 0
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 850, fontSize: '1.05rem', color: '#FFFFFF' }}>
                  {activeArticle.author}
                </span>
                <span style={{
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: 0,
                  letterSpacing: '0.04em'
                }}>
                  AUTHOR & ARCHITECT
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '3px' }}>
                {activeArticle.authorRole}
              </div>
            </div>
          </div>

          {/* Executive Summary Callout (Strict 0px Corners) */}
          {activeArticle.summary && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(28, 38, 58, 0.75) 0%, rgba(14, 19, 31, 0.9) 100%)',
              borderLeft: '4px solid #475569',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 0,
              padding: '1.35rem 1.65rem',
              marginBottom: '3rem',
              fontSize: '1.02rem',
              color: '#CBD5E1',
              lineHeight: 1.65
            }}>
              <strong style={{
                color: '#FFFFFF',
                display: 'block',
                marginBottom: '0.45rem',
                fontSize: '0.82rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Executive Summary
              </strong>
              {activeArticle.summary}
            </div>
          )}

          {/* Detailed Article Body Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {activeArticle.sections && activeArticle.sections.map((sec, idx) => (
              <div key={idx}>
                <h2 style={{
                  fontSize: 'clamp(1.35rem, 2.5vw, 1.7rem)',
                  fontWeight: 850,
                  color: '#FFFFFF',
                  letterSpacing: '-0.025em',
                  marginBottom: '1rem',
                  lineHeight: 1.25
                }}>
                  {sec.heading}
                </h2>
                <div style={{
                  fontSize: '1.04rem',
                  color: '#CBD5E1',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-line'
                }}>
                  {sec.body}
                </div>
              </div>
            ))}
          </div>

          {/* Author Biography Footer (Strict 0px Corners) */}
          <div style={{
            marginTop: '4rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <img 
              src="/sadat-sakib.jpg" 
              alt="Sadat Sakib Prodhan"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 0,
                objectFit: 'cover',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                flexShrink: 0
              }}
            />
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ fontWeight: 850, fontSize: '1.15rem', color: '#FFFFFF' }}>
                Sadat Sakib Prodhan
              </div>
              <div style={{ fontSize: '0.84rem', color: '#38BDF8', fontWeight: 650, marginBottom: '0.4rem' }}>
                Founder & Lead Architect @ Kreazy AI
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.55 }}>
                Pioneering autonomous conversational commerce infrastructure across Meta platforms. Dedicated to helping retail stores automate 80%+ of chat volume and capture high-intent buyers around the clock.
              </p>
            </div>
          </div>

          {/* Bottom In-Article Conversion Banner (Strict 0px Corners) */}
          <div style={{
            marginTop: '2.5rem',
            padding: '2rem',
            background: 'rgba(18, 24, 38, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem'
          }}>
            <div>
              <div style={{ fontWeight: 850, fontSize: '1.15rem', color: '#FFFFFF', marginBottom: '0.25rem' }}>
                Automate Your Store with Kreazy AI Today
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                14-day free trial • Connect WhatsApp in under 3 minutes
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('signup')}
                style={{
                  background: '#FFFFFF',
                  color: '#06080D',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  padding: '9px 18px',
                  borderRadius: 0,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Start Free Trial</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('book-demo')}
                style={{
                  background: '#475569',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  padding: '9px 18px',
                  borderRadius: 0,
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  cursor: 'pointer'
                }}
              >
                Book a Demo
              </button>
            </div>
          </div>

          {/* Related Articles Section (Strict 0px Corners) */}
          <div style={{ marginTop: '4.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Related Engineering & Commerce Guides
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
              gap: '1.25rem' 
            }}>
              {articles.filter(a => a.id !== activeArticle.id).slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => handleOpenArticle(rel)}
                  style={{
                    background: 'rgba(18, 24, 38, 0.72)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 0,
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)'; }}
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      {rel.category}
                    </div>
                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.35, margin: '0 0 0.5rem 0' }}>
                      {rel.title}
                    </h4>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#38BDF8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.75rem' }}>
                    Read Guide <ArrowRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     VIEW B: BLOG LISTING HUB (URL: /blog)
     - NO DATE, NO 'Verified Publication' (Completely Removed)
     - STRICT 0px CORNERING ARCHITECTURE (No rounded curves)
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ 
      backgroundColor: '#06080D', 
      minHeight: '100vh', 
      color: '#FFFFFF', 
      paddingTop: 'calc(var(--topbar-height, 68px) + 1.5rem)', 
      paddingBottom: '5rem' 
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* Category Pills Filter (Strict 0px Corners) */}
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

        {/* Featured Hero Article (Strict 0px Corners) */}
        {featuredArticle && (
          <div 
            onClick={() => handleOpenArticle(featuredArticle)}
            style={{ 
              background: 'rgba(18, 24, 38, 0.72)', 
              backdropFilter: 'blur(20px)', 
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              borderRadius: 0, 
              padding: 'clamp(1.75rem, 3.5vw, 2.75rem)', 
              marginBottom: '3rem', 
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(148, 163, 184, 0.1)', 
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.45)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div>
              {/* Category & Read Time (NO DATE, NO 'Verified Publication') */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ 
                  background: 'rgba(148, 163, 184, 0.16)', 
                  border: '1px solid rgba(148, 163, 184, 0.35)', 
                  color: '#E2E8F0', 
                  fontSize: '0.75rem', 
                  fontWeight: 750, 
                  padding: '3px 10px', 
                  borderRadius: 0, 
                  textTransform: 'uppercase' 
                }}>
                  {featuredArticle.tag}
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
                {/* Author with Sharp Square Frame (borderRadius: 0) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src={featuredArticle.avatar} 
                    alt={featuredArticle.author} 
                    style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: 0, 
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                      flexShrink: 0
                    }} 
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF' }}>
                      {featuredArticle.author}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                      {featuredArticle.authorRole}
                    </div>
                  </div>
                </div>

                <div 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    background: '#FFFFFF',
                    color: '#06080D', 
                    fontWeight: 750, 
                    fontSize: '0.9rem',
                    padding: '8px 16px',
                    borderRadius: 0,
                    boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>Read Article</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>

            {/* Visual Teaser Card (Strict 0px Corners) */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(28, 38, 58, 0.85) 0%, rgba(14, 19, 31, 0.98) 100%)', 
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              borderRadius: 0, 
              padding: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 600 }}>Automation Metric</span>
                <span style={{ fontSize: '0.82rem', color: '#38BDF8', fontWeight: 750 }}>+124% Captured Orders</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.04em' }}>
                ~1.4s
              </div>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                Average autonomous customer resolution speed across 1,000,000+ processed Bengali and English messages.
              </p>
              <div style={{ 
                borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
                paddingTop: '0.85rem',
                fontSize: '0.78rem',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <ShieldCheck size={14} color="#94A3B8" />
                <span>Verified across Meta Cloud Business API</span>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid (3 columns, Strict 0px Corners) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '1.75rem',
          marginBottom: '4rem'
        }}>
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => handleOpenArticle(article)}
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
                    padding: '3px 10px', 
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
                {/* Author with Sharp Square Frame (borderRadius: 0) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={article.avatar || '/sadat-sakib.jpg'} 
                    alt={article.author} 
                    style={{ 
                      width: '28px', 
                      height: '28px', 
                      borderRadius: 0, 
                      objectFit: 'cover',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      flexShrink: 0
                    }} 
                  />
                  <span style={{ color: '#CBD5E1', fontWeight: 650, fontSize: '0.8rem' }}>
                    {article.author}
                  </span>
                </div>

                <span style={{ 
                  color: '#FFFFFF', 
                  fontWeight: 750, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '0.82rem'
                }}>
                  Read Article <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner (Strict 0px Corners) */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(28, 38, 58, 0.75) 0%, rgba(14, 19, 31, 0.92) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 0,
          padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 850, color: '#FFFFFF', marginBottom: '1rem' }}>
            Ready to Automate Your Brand with Custom AI Agents?
          </h2>
          <p style={{ maxWidth: '640px', margin: '0 auto 2rem auto', color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Join Bangladesh's leading multi-channel merchants capturing $50k+ in monthly social sales with sub-2-second automated responses.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('signup')}
              style={{
                background: '#FFFFFF',
                color: '#06080D',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '12px 28px',
                borderRadius: 0,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('pricing')}
              style={{
                background: '#475569',
                color: '#FFFFFF',
                fontWeight: 750,
                fontSize: '0.95rem',
                padding: '12px 28px',
                borderRadius: 0,
                border: '1px solid rgba(255, 255, 255, 0.22)',
                cursor: 'pointer'
              }}
            >
              <span>View Pricing Plans</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
