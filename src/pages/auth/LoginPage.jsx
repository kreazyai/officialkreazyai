import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
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
    }, 500);
  };

  const handleDemoQuickLogin = () => {
    const user = authService.login('founder@kreazybrand.com', 'demo', true);
    if (onLoginSuccess) onLoginSuccess(user);
    onNavigate('dashboard');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div 
            className="brand-logo" 
            style={{ justifyContent: 'center', marginBottom: '1.25rem', cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
          >
            <img src="/logo.png" alt="Kreazy AI Logo" className="brand-logo-img" />
            <span className="brand-text">Kreazy <span className="brand-ai">AI</span></span>
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your merchant workspace to manage conversations, sales, and AI agents.</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid var(--status-error-border)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <Input
            label="Work Email"
            name="email"
            type="email"
            required
            icon={Mail}
            placeholder="merchant@yourbrand.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            required
            icon={Lock}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span>Remember this device</span>
            </label>
            <span 
              style={{ color: 'var(--olive-700)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => onNavigate('forgot-password')}
            >
              Forgot password?
            </span>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            Sign In to Workspace
          </Button>

          <Button 
            type="button" 
            variant="secondary" 
            size="lg" 
            onClick={() => onNavigate('signup')}
            style={{ 
              width: '100%', 
              borderColor: 'var(--bright-olive)', 
              color: 'var(--text-primary)', 
              fontWeight: 600,
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
            iconRight={ArrowRight}
          >
            Create New Account / Sign Up
          </Button>

          <Button 
            type="button" 
            variant="subtle" 
            size="md" 
            onClick={handleDemoQuickLogin}
            style={{ width: '100%', border: '1px dashed var(--olive-400)', marginTop: '0.25rem' }}
          >
            ⚡ One-Click Instant Demo Login (Pre-Loaded Studio)
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <button 
            type="button"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--bright-olive)', 
              fontWeight: 700, 
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: 'inherit'
            }}
            onClick={() => onNavigate('signup')}
          >
            Sign up for free
          </button>
        </div>
      </div>
    </div>
  );
}

