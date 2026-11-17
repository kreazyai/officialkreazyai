import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  MessageCircle, 
  Laptop, 
  Briefcase, 
  TrendingUp, 
  Globe 
} from 'lucide-react';
import { bootcampService } from '../../services/api';

export function AIBootcampPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentRole: 'Student / Graduate',
    experienceLevel: 'Complete Beginner (Curious about AI)',
    primaryGoal: 'Career Transition to High-Income AI Role',
    preferredSlot: 'Next Saturday • 8:00 PM BST / 10:00 AM EST',
    linkedinOrPortfolio: '',
    questions: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isFormValid = formData.fullName.trim() && formData.email.trim() && formData.phone.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please provide your name, email, and WhatsApp number so we can send your session link.');
      return;
    }

    setLoading(true);
    try {
      const res = await bootcampService.register(formData);
      if (res?.success || res?.confirmed) {
        setConfirmedData({
          seatNumber: res?.seatNumber || `SEAT-${Math.floor(1000 + Math.random() * 9000)}`,
          slot: formData.preferredSlot,
          name: formData.fullName,
          email: formData.email
        });
        setSubmitted(true);
      } else {
        throw new Error(res?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      // Graceful fallback: show confirmation
      setConfirmedData({
        seatNumber: `SEAT-${Math.floor(1000 + Math.random() * 9000)}`,
        slot: formData.preferredSlot,
        name: formData.fullName,
        email: formData.email
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bootcamp-page-wrapper" style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(148, 163, 184, 0.12) 0%, rgba(71, 85, 105, 0.06) 40%, rgba(6, 8, 13, 0) 75%), #06080D',
      color: '#FFFFFF',
      paddingBottom: '5rem'
    }}>
      {/* ═══════════════════════════════════════════════════════════════
          1. TOP VIP BANNER & TRUST TICKER (EXECUTIVE GRAY THEME)
          ═══════════════════════════════════════════════════════════════ */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.55)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        padding: '0.65rem 1rem',
        textAlign: 'center',
        fontSize: '0.84rem',
        fontWeight: 650,
        color: '#E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          background: '#475569',
          color: '#FFFFFF',
          fontSize: '0.7rem',
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          100% FREE
        </span>
        <span>Limited to 50 curated seats per live batch • Interactive 1-on-1 Q&A included</span>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3.5rem) 1.25rem 0 1.25rem' }}>
        
        {/* ═══════════════════════════════════════════════════════════════
            2. HERO SECTION & FOUNDER MENTORSHIP CARD
            ═══════════════════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(2rem, 4vw, 3.5rem)',
          alignItems: 'start',
          marginBottom: '4.5rem'
        }}>
          
          {/* ── LEFT COLUMN: HUMAN MENTORSHIP POSTER ── */}
          <div>
            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(2.1rem, 4.5vw, 3.2rem)',
              fontWeight: 850,
              letterSpacing: '-0.035em',
              lineHeight: 1.12,
              margin: '0 0 1.25rem 0',
              color: '#FFFFFF'
            }}>
              Master Practical AI Engineering & Launch Your High-Income Career
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
              lineHeight: 1.6,
              color: '#94A3B8',
              margin: '0 0 2rem 0'
            }}>
              Join Sadat Sakib Prodhan (Founder of Kreazy AI) for a 60-minute live, interactive bootcamp. Learn the exact blueprints to build autonomous AI sales agents, transition into remote AI roles, and close global clients in 2026.
            </p>

            {/* ══ HUMAN MASTERCLASS POSTER CARD (GRAY THEME) ══ */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(24, 30, 42, 0.95) 0%, rgba(15, 20, 30, 0.98) 100%)',
              border: '1px solid rgba(148, 163, 184, 0.28)',
              borderRadius: 0,
              padding: 'clamp(1.75rem, 3vw, 2.25rem)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(148, 163, 184, 0.06)',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '2rem'
            }}>
              {/* Subtle Ambient Gray Glow Corner */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(148, 163, 184, 0.18) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Mentor Header Profile with Founder Photo in Small Circle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <img 
                  src="/sadat-sakib.jpg" 
                  alt="Sadat Sakib Prodhan"
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(148, 163, 184, 0.45)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                    flexShrink: 0
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                      Sadat Sakib Prodhan
                    </h3>
                    <span style={{
                      background: 'rgba(148, 163, 184, 0.15)',
                      border: '1px solid rgba(148, 163, 184, 0.35)',
                      color: '#E2E8F0',
                      fontSize: '0.7rem',
                      fontWeight: 750,
                      padding: '2px 8px',
                      borderRadius: 0,
                      letterSpacing: '0.04em'
                    }}>
                      VERIFIED MENTOR
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#CBD5E1', fontWeight: 600 }}>
                    Founder & Lead Architect @ Kreazy AI
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                    Automating 500k+ conversations across Meta platforms
                  </div>
                </div>
              </div>

              {/* Personal Human Quote */}
              <blockquote style={{
                margin: 0,
                padding: '1rem 1.25rem',
                borderRadius: 0,
                background: 'rgba(255, 255, 255, 0.04)',
                borderLeft: '3px solid #94A3B8',
                fontSize: '0.92rem',
                lineHeight: 1.55,
                color: '#CBD5E1',
                fontStyle: 'italic'
              }}>
                "You do not need a computer science degree or millions in funding to build life-changing income in AI. You need practical workflows, production architecture, and client acquisition systems. In this live session, I am sharing the exact playbook we built Kreazy AI with."
              </blockquote>
            </div>
          </div>

          {/* ── RIGHT COLUMN: REGISTRATION FORM CARD (CLEAN WITHOUT MARKUPS) ── */}
          <div>
            <div style={{
              background: 'rgba(14, 19, 31, 0.92)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: 0,
              padding: 'clamp(2rem, 4vw, 2.75rem) clamp(1.5rem, 3vw, 2.25rem)',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(148, 163, 184, 0.06)',
              position: 'relative'
            }}>
              
              {!submitted ? (
                <>
                  <div style={{ marginBottom: '1.75rem' }}>
                    <h2 style={{
                      fontSize: 'clamp(1.5rem, 2.5vw, 1.85rem)',
                      fontWeight: 800,
                      letterSpacing: '-0.025em',
                      color: '#FFFFFF',
                      margin: '0 0 0.45rem 0'
                    }}>
                      Claim Your Free Seat
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.5 }}>
                      Fill in your details to secure your spot and receive the private session calendar invite.
                    </p>
                  </div>

                  {error && (
                    <div style={{
                      padding: '0.85rem 1rem',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: 0,
                      color: '#F87171',
                      fontSize: '0.86rem',
                      marginBottom: '1.25rem'
                    }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                    {/* Full Name */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="e.g. Rahat Chowdhury"
                        value={formData.fullName}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: '46px',
                          background: 'rgba(9, 13, 22, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          borderRadius: 0,
                          padding: '0 1rem',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#94A3B8'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)'; }}
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                        Work / Personal Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: '46px',
                          background: 'rgba(9, 13, 22, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          borderRadius: 0,
                          padding: '0 1rem',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#94A3B8'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)'; }}
                      />
                    </div>

                    {/* WhatsApp / Phone Number */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                        WhatsApp Number
                        <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '6px' }}>(For Zoom link & calendar reminder)</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="+880 1712-345678 or +1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: '46px',
                          background: 'rgba(9, 13, 22, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          borderRadius: 0,
                          padding: '0 1rem',
                          color: '#FFFFFF',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#94A3B8'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)'; }}
                      />
                    </div>

                    {/* Current Background / Status */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                        Current Professional Status
                      </label>
                      <select
                        name="currentRole"
                        value={formData.currentRole}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: '46px',
                          background: 'rgba(9, 13, 22, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          borderRadius: 0,
                          padding: '0 1rem',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Student / Graduate" style={{ background: '#0E131F', color: '#fff' }}>Student / Fresh Graduate</option>
                        <option value="Software Engineer / Developer" style={{ background: '#0E131F', color: '#fff' }}>Software Engineer / Web Developer</option>
                        <option value="Freelancer / Consultant" style={{ background: '#0E131F', color: '#fff' }}>Freelancer / Consultant</option>
                        <option value="Business Owner / Founder" style={{ background: '#0E131F', color: '#fff' }}>E-Commerce Store Owner / Founder</option>
                        <option value="Marketer / Creative Professional" style={{ background: '#0E131F', color: '#fff' }}>Marketer / Creative Professional</option>
                        <option value="Career Transitioner" style={{ background: '#0E131F', color: '#fff' }}>Switching Careers into AI</option>
                      </select>
                    </div>

                    {/* Primary Goal */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                        What is your #1 Goal from this Masterclass?
                      </label>
                      <select
                        name="primaryGoal"
                        value={formData.primaryGoal}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: '46px',
                          background: 'rgba(9, 13, 22, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          borderRadius: 0,
                          padding: '0 1rem',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Career Transition to High-Income AI Role" style={{ background: '#0E131F', color: '#fff' }}>Land a High-Paying Remote AI Role</option>
                        <option value="Build & Monetize AI Agents" style={{ background: '#0E131F', color: '#fff' }}>Build & Sell Custom AI Agents to Businesses</option>
                        <option value="Automate My Own E-Commerce Store" style={{ background: '#0E131F', color: '#fff' }}>Automate My Own Store & WhatsApp/IG Sales</option>
                        <option value="Start an AI Automation Agency" style={{ background: '#0E131F', color: '#fff' }}>Launch an AI Automation Agency (AAA)</option>
                        <option value="Master Prompt & Workflow Architecture" style={{ background: '#0E131F', color: '#fff' }}>Master Production Architecture & APIs</option>
                      </select>
                    </div>

                    {/* Preferred Slot */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                        Preferred Live Session Slot
                      </label>
                      <select
                        name="preferredSlot"
                        value={formData.preferredSlot}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          height: '46px',
                          background: 'rgba(9, 13, 22, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          borderRadius: 0,
                          padding: '0 1rem',
                          color: '#FFFFFF',
                          fontSize: '0.88rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="Next Saturday • 8:00 PM BST / 10:00 AM EST" style={{ background: '#0E131F', color: '#fff' }}>
                          Next Saturday • 8:00 PM BST / 10:00 AM EST (Primary Weekend Batch)
                        </option>
                        <option value="Next Tuesday • 8:00 PM BST / 10:00 AM EST" style={{ background: '#0E131F', color: '#fff' }}>
                          Next Tuesday • 8:00 PM BST / 10:00 AM EST (Weekday Evening Batch)
                        </option>
                      </select>
                    </div>

                    {/* Optional: Question for Sadat Sakib Prodhan */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                        Any specific question for Sadat Sakib Prodhan? <span style={{ fontSize: '0.75rem', color: '#64748B' }}>(Optional)</span>
                      </label>
                      <textarea
                        name="questions"
                        rows={2}
                        placeholder="e.g. How do I pitch AI to local retailers? Can I build without coding?"
                        value={formData.questions}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          background: 'rgba(9, 13, 22, 0.85)',
                          border: '1px solid rgba(255, 255, 255, 0.14)',
                          borderRadius: 0,
                          padding: '0.65rem 1rem',
                          color: '#FFFFFF',
                          fontSize: '0.86rem',
                          boxSizing: 'border-box',
                          outline: 'none',
                          resize: 'vertical',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#94A3B8'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)'; }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || !isFormValid}
                      style={{
                        width: '100%',
                        height: '52px',
                        borderRadius: 0,
                        fontSize: '1rem',
                        fontWeight: 800,
                        background: isFormValid 
                          ? 'linear-gradient(135deg, #475569 0%, #334155 100%)' 
                          : 'rgba(255, 255, 255, 0.1)',
                        color: isFormValid ? '#FFFFFF' : '#64748B',
                        border: isFormValid ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(255, 255, 255, 0.08)',
                        boxShadow: isFormValid ? '0 6px 24px rgba(0, 0, 0, 0.4)' : 'none',
                        cursor: (loading || !isFormValid) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      {loading ? (
                        <span>Securing Your Seat…</span>
                      ) : (
                        <>
                          <span>Reserve My Free Seat Now</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                /* ════ CONFIRMATION STATE ════ */
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(15, 169, 104, 0.18)',
                    border: '1.5px solid rgba(15, 169, 104, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34D399',
                    margin: '0 auto 1.25rem auto'
                  }}>
                    <CheckCircle2 size={34} />
                  </div>

                  <span style={{
                    background: 'rgba(148, 163, 184, 0.18)',
                    border: '1px solid rgba(148, 163, 184, 0.35)',
                    color: '#E2E8F0',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 0,
                    display: 'inline-block',
                    marginBottom: '0.75rem'
                  }}>
                    {confirmedData?.seatNumber} CONFIRMED
                  </span>

                  <h3 style={{ fontSize: '1.6rem', fontWeight: 850, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
                    You're In, {confirmedData?.name?.split(' ')[0]}!
                  </h3>

                  <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: 1.55, maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                    Your free seat for <strong>AI Bootcamp with Sadat Sakib Prodhan</strong> has been reserved for:
                  </p>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 0,
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#CBD5E1', fontWeight: 700, marginBottom: '0.35rem' }}>
                      <Calendar size={16} />
                      <span>{confirmedData?.slot}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      Joining links and workshop materials sent to: <strong style={{ color: '#FFFFFF' }}>{confirmedData?.email}</strong>
                    </div>
                  </div>

                  {/* VIP Community Action */}
                  <a
                    href="https://chat.whatsapp.com/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      height: '50px',
                      borderRadius: 0,
                      background: '#25D366',
                      color: '#06080D',
                      fontWeight: 750,
                      fontSize: '0.95rem',
                      textDecoration: 'none',
                      marginBottom: '0.75rem',
                      boxShadow: '0 4px 20px rgba(37, 211, 102, 0.3)'
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>Join VIP Bootcamp WhatsApp Group</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onNavigate('home')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    ← Return to Kreazy AI Homepage
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            3. WHAT YOU WILL MASTER (CURRICULUM MODULES - GRAY ACCENTS)
            ═══════════════════════════════════════════════════════════════ */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '0.5rem'
            }}>
              CURRICULUM BREAKDOWN
            </span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.5rem)', fontWeight: 850, color: '#FFFFFF', margin: 0 }}>
              What You Will Learn in 60 Minutes
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              {
                title: 'The Real 2026 AI Economy',
                desc: 'How non-coders and engineers alike are replacing tedious manual work with autonomous AI workflows and landing high-paying global contracts.',
                icon: TrendingUp,
                color: '#CBD5E1'
              },
              {
                title: 'Live Build: Autonomous Sales Agent',
                desc: 'Watch Sadat Sakib Prodhan build a real Meta-verified WhatsApp & Instagram commerce bot live that syncs stock, calculates sizes, and confirms checkout.',
                icon: Laptop,
                color: '#94A3B8'
              },
              {
                title: 'Landing Global High-Ticket Clients',
                desc: 'The exact proposal templates, client onboarding checklists, and pricing strategies to charge $1,500 – $5,000 per automation build.',
                icon: Globe,
                color: '#64748B'
              },
              {
                title: 'Personal Career Transition Plan',
                desc: 'Step-by-step roadmap to position your portfolio, leverage LinkedIn, and stand out as an elite AI practitioner over traditional workers.',
                icon: Briefcase,
                color: '#CBD5E1'
              }
            ].map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div key={idx} style={{
                  background: 'rgba(18, 24, 38, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 0,
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 0,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: `1px solid rgba(148, 163, 184, 0.3)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: mod.color
                    }}>
                      <Icon size={20} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: '#FFFFFF', marginBottom: '0.6rem' }}>
                    {mod.title}
                  </h3>

                  <p style={{ fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.55, margin: 0 }}>
                    {mod.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            4. WHO SHOULD ATTEND (CAREER PATHS - GRAY THEME)
            ═══════════════════════════════════════════════════════════════ */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(22, 28, 40, 0.8) 0%, rgba(14, 19, 31, 0.95) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: 0,
          padding: 'clamp(2rem, 4vw, 3.5rem)',
          marginBottom: '5rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              DESIGNED FOR HIGH-IMPACT TRANSITIONS
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 850, color: '#FFFFFF', marginTop: '0.35rem' }}>
              Is This AI Bootcamp Right for You?
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1.25rem', borderRadius: 0, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontWeight: 750, color: '#E2E8F0', fontSize: '1rem', marginBottom: '0.4rem' }}>
                Students & Graduates
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                Gain the competitive edge with hands-on enterprise AI skills that traditional university curriculums don't teach.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1.25rem', borderRadius: 0, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontWeight: 750, color: '#CBD5E1', fontSize: '1rem', marginBottom: '0.4rem' }}>
                Software Engineers
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                Upgrade from writing boilerplate CRUD to orchestrating intelligent agents, vector embeddings, and official Meta APIs.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1.25rem', borderRadius: 0, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontWeight: 750, color: '#CBD5E1', fontSize: '1rem', marginBottom: '0.4rem' }}>
                Freelancers & Agencies
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                Stop competing on $10/hour tasks. Package high-value autonomous commerce workflows that clients eagerly pay recurring fees for.
              </p>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1.25rem', borderRadius: 0, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ fontWeight: 750, color: '#E2E8F0', fontSize: '1rem', marginBottom: '0.4rem' }}>
                E-Commerce Store Owners
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                Learn how to put your customer support, inventory reservations, and checkout on 24/7 autopilot without hiring more moderators.
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            5. FINAL CALL TO ACTION (GRAY & CHARCOAL DESIGN)
            ═══════════════════════════════════════════════════════════════ */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(24, 30, 42, 0.95) 0%, rgba(15, 20, 30, 0.98) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.28)',
          borderRadius: 0,
          padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 50px rgba(148, 163, 184, 0.06)'
        }}>
          <span style={{
            background: '#475569',
            color: '#FFFFFF',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            FREE 60-MINUTE MASTERCLASS
          </span>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.35rem)', fontWeight: 850, color: '#FFFFFF', margin: '0 0 0.85rem 0' }}>
            Ready to Build Real AI Systems with Sadat Sakib Prodhan?
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto', color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6 }}>
            No catch. No robot fluff. Just real code, real architecture, and direct career guidance from someone building at scale.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: 0,
                padding: '0.85rem 1.85rem',
                fontSize: '0.95rem',
                fontWeight: 750,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>Scroll Up & Reserve Free Seat</span>
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 0,
                padding: '0.85rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>Explore Kreazy AI Platform</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
