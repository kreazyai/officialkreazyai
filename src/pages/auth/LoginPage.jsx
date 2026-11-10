import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthButton } from '../../components/auth/GoogleVerificationModal';
import { triggerGoogleNativeAuth } from '../../services/googleAuth';

export function LoginPage({ onNavigate, onLoginSuccess }) {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // If already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, onNavigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide your work email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password, false);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
      onNavigate('dashboard');
    } catch (err) {
      if (err?.code === 'SUPER_ADMIN_PORTAL_REQUIRED' || (err?.status === 403 && err?.message?.includes('/admin'))) {
        setError(err.message || 'Administrative accounts must sign in through the Admin Portal at /admin.');
      } else if (err?.status === 401) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else {
        setError(err?.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setError('');
    triggerGoogleNativeAuth({
      onSuccess: async (googleProfile) => {
        setLoading(true);
        try {
          const user = await loginWithGoogle(googleProfile);
          if (onLoginSuccess) onLoginSuccess(user);
          onNavigate('dashboard');
        } catch (err) {
          setError(err?.message || 'Google authentication failed.');
        } finally {
          setLoading(false);
        }
      },
      onError: (err) => {
        setError(err?.message || 'Google account selection was cancelled.');
      }
    });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div
            className="brand-logo"
            style={{ justifyContent: 'center', marginBottom: '1.5rem', cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
            title="KreazyAI"
          >
            <img src="/logo-white.svg" alt="KreazyAI" className="brand-logo-img brand-logo-lg" />
          </div>
          <h1>Welcome back</h1>
          <p>Sign in to your merchant workspace to manage conversations, sales, and AI agents.</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid var(--status-error-border)' }}>
            {error}
          </div>
        )}

        {/* Clean Google Authentication Button */}
        <GoogleAuthButton
          text="Continue with Google"
          onClick={handleGoogleClick}
        />

        {/* Clear Divider */}
        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

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
            autoComplete="email"
          />

          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            icon={Lock}
            iconRight={showPassword ? EyeOff : Eye}
            onIconRightClick={() => setShowPassword(prev => !prev)}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
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
              style={{ color: '#FF334B', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => onNavigate('forgot-password')}
            >
              Forgot password?
            </span>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
            Sign In to Workspace
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => onNavigate('signup')}
            style={{
              width: '100%',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.22)',
              color: '#FFFFFF',
              fontWeight: 600
            }}
            iconRight={ArrowRight}
          >
            Create New Account / Sign Up
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#FF334B',
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

      {/* Google Verification Modal */}
      <GoogleVerificationModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        mode="login"
        defaultEmail={email}
      />
    </div>
  );
}
