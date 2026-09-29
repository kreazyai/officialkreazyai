import React, { useState } from 'react';
import { Mail, Lock, Building2, User, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { authService } from '../../services/api';

export function SignUpPage({ onNavigate, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = authService.registerWorkspace({
        storeName: formData.businessName || "My Retail Store",
        ownerName: formData.fullName || "Store Owner",
        email: formData.email,
        password: formData.password,
        plan: "Enterprise ($12/mo)"
      });
      if (onLoginSuccess) onLoginSuccess(user);
      onNavigate('onboarding');
    }, 400);
  };

  return (
    <div className="home-page-root" style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', background: '#F8FAFC' }}>
      <div style={{ width: '100%', maxWidth: '480px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            className="brand-logo" 
            style={{ justifyContent: 'center', marginBottom: '1.25rem', cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
          >
            <div className="modern-brand-mark">
              <div className="mark-slant m-1"></div>
              <div className="mark-slant m-2"></div>
              <div className="mark-slant m-3"></div>
            </div>
            <span className="brand-text">
              moniveo <span className="brand-text-sub">KreazyAI</span>
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Create your business workspace
          </h1>
          <p style={{ fontSize: '0.885rem', color: '#64748B' }}>
            Start your 14-day free trial. Automate your sales across WhatsApp, Instagram, and Web.
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div className="form-field-group">
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
              Business / Store Name *
            </label>
            <input
              type="text"
              name="businessName"
              required
              className="moniveo-input"
              placeholder="e.g. Sylvan Studio"
              value={formData.businessName}
              onChange={handleChange}
            />
          </div>

          <div className="form-field-group">
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
              Your Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              className="moniveo-input"
              placeholder="e.g. Elena Rostova"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="form-field-group">
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
              Work Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              className="moniveo-input"
              placeholder="elena@sylvanstudio.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-field-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                Password (min 8) *
              </label>
              <input
                type="password"
                name="password"
                required
                className="moniveo-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-field-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="moniveo-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem' }}>
            <input 
              type="checkbox" 
              name="agreeTerms"
              checked={formData.agreeTerms} 
              onChange={handleChange}
              style={{ marginTop: '0.2rem' }}
            />
            <span>
              I agree to the <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => onNavigate('legal-terms')}>Terms of Service</span> and <span style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => onNavigate('legal-privacy')}>Privacy Policy</span>.
            </span>
          </div>

          <button
            type="submit"
            className="moniveo-submit-btn"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>{loading ? 'Creating Workspace...' : 'Get Started Free'}</span>
            <ChevronRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            Already have an account?{' '}
            <span 
              style={{ color: '#2563EB', fontWeight: 700, cursor: 'pointer' }} 
              onClick={() => onNavigate('login')}
            >
              Sign in to workspace
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
