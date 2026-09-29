import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { authService } from '../../services/api';

export function LoginPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your work email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const user = authService.login(email, password, false);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      onNavigate('dashboard');
    }, 400);
  };

  const handleDemoQuickLogin = () => {
    const user = authService.login('founder@kreazybrand.com', 'demo', true);
    if (onLoginSuccess) onLoginSuccess(user);
    onNavigate('dashboard');
  };

  return (
    <div className="home-page-root" style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', background: '#F8FAFC' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
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
            Welcome back
          </h1>
          <p style={{ fontSize: '0.885rem', color: '#64748B' }}>
            Sign in to your merchant workspace to manage conversations, sales, and AI agents.
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div className="form-field-group">
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
              Work Email
            </label>
            <input
              type="email"
              required
              className="moniveo-input"
              placeholder="merchant@yourbrand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-field-group">
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block', marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              required
              className="moniveo-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem', color: '#64748B' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span>Remember this device</span>
            </label>
            <span 
              style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => onNavigate('forgot-password')}
            >
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            className="moniveo-submit-btn"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span>{loading ? 'Signing in...' : 'Sign In to Workspace'}</span>
            <ChevronRight size={18} />
          </button>
        </form>

        {/* Quick Demo Access */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleDemoQuickLogin}
            style={{ width: '100%', padding: '0.75rem', background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', cursor: 'pointer' }}
          >
            ⚡ Quick Demo Sign-In (Marcus Vance Flagship)
          </button>

          <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748B' }}>
            Don't have an account?{' '}
            <span 
              style={{ color: '#2563EB', fontWeight: 700, cursor: 'pointer' }} 
              onClick={() => onNavigate('signup')}
            >
              Create free account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
