import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleIcon, GoogleVerificationModal } from '../../components/auth/GoogleVerificationModal';
import { AppleIcon } from '../../components/auth/AppleIcon';
import { AuthShowcaseCard } from '../../components/auth/AuthShowcaseCard';
import { triggerGoogleNativeAuth } from '../../services/googleAuth';

export function SignUpPage({ onNavigate, onLoginSuccess }) {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // If already authenticated, navigate to dashboard immediately
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, onNavigate]);

  const handleGoogleSuccess = async (googleProfile) => {
    setIsGoogleModalOpen(false);
    setLoading(true);
    setError('');
    try {
      const user = await loginWithGoogle({
        ...googleProfile,
        storeName: `${googleProfile.name || 'Merchant'}'s Store`
      });
      if (onLoginSuccess) onLoginSuccess(user);
      onNavigate('dashboard');
    } catch (err) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setError('');
    triggerGoogleNativeAuth({
      storeName: firstName.trim() ? `${firstName.trim()}'s Store` : 'My Store',
      onSuccess: handleGoogleSuccess,
      onError: (err) => {
        console.warn('Google Native Auth fallback to modal:', err?.message);
        setIsGoogleModalOpen(true);
      }
    });
  };

  const handleAppleAuth = () => {
    setError('Apple Sign-In is currently reserved for the iOS mobile application. Please continue with Google or your Work Email.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanFirst) {
      setError('Please enter your first name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid work email.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms & Conditions to create an account.');
      return;
    }

    setLoading(true);
    const ownerName = cleanLast ? `${cleanFirst} ${cleanLast}` : cleanFirst;
    const storeName = `${cleanFirst}'s Store`;

    try {
      const registeredUser = await register({
        storeName,
        ownerName: ownerName || cleanEmail.split('@')[0],
        email: cleanEmail,
        password,
        plan: 'Growth ($119/mo)'
      });

      setSuccessMsg('Account created successfully! Preparing your workspace…');
      if (onLoginSuccess) {
        onLoginSuccess(registeredUser);
      }

      setTimeout(() => {
        onNavigate('dashboard');
      }, 500);
    } catch (err) {
      if (err?.code === 'CONFLICT' || err?.message?.includes('already exists') || err?.status === 409) {
        setError('An account with this email already exists. Please log in instead.');
      } else {
        setError(err?.message || 'Failed to initialize account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Subtle Atmospheric Decorative Rings and Dots */}
      <div className="auth-bg-deco-ring auth-bg-deco-ring-1" aria-hidden="true" />
      <div className="auth-bg-deco-ring auth-bg-deco-ring-2" aria-hidden="true" />
      <div className="auth-bg-dot auth-bg-dot-1" aria-hidden="true" />
      <div className="auth-bg-dot auth-bg-dot-2" aria-hidden="true" />
      <div className="auth-bg-dot auth-bg-dot-3" aria-hidden="true" />

      {/* Top Bar with Brand Link */}
      <div className="auth-top-bar">
        <div
          className="auth-brand-logo"
          onClick={() => onNavigate('home')}
          title="KreazyAI Home"
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
        >
          <img src="/brand-logo-dark.png?v=20261115" alt="KREAZY AI — Conversational AI" style={{ height: '36px', width: 'auto', maxWidth: '170px', objectFit: 'contain' }} />
        </div>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="auth-top-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span className="auth-back-text-full">Back to website</span>
          <span className="auth-back-text-short">Back</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Main Split Auth Card */}
      <div className="auth-card-frame">
        {/* Left Side: Form Panel (Always visible, full-width on mobile) */}
        <div className="auth-form-panel">
          {/* Header */}
          <div className="auth-form-header">
            <h1 className="auth-form-header-title">Create an account</h1>
            <p className="auth-form-header-subtitle">
              Already have an account?{' '}
              <button
                type="button"
                className="auth-form-link"
                onClick={() => onNavigate('login')}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit' }}
              >
                Log in
              </button>
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="auth-alert auth-alert-error">
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div>{error}</div>
                {error.includes('already exists') && (
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    style={{
                      marginTop: '8px',
                      background: '#475569',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Go to Sign In</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert auth-alert-success">
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{successMsg}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* First Name & Last Name (2 columns) */}
            <div className="auth-name-grid">
              <div className="auth-input-group">
                <div className="auth-input-wrapper">
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div className="auth-input-wrapper">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    className="auth-input"
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div className="auth-input-group">
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password Field with show/hide toggle */}
            <div className="auth-input-group">
              <div className="auth-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="auth-input auth-input-has-toggle"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="auth-password-toggle-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms and conditions agreement checkbox */}
            <label className="auth-checkbox-row" style={{ marginTop: '2px' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNavigate('legal-terms');
                  }}
                  className="auth-form-link"
                  style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', textDecoration: 'underline' }}
                >
                  terms & conditions
                </button>
              </span>
            </label>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <span>Creating account…</span>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="auth-form-divider">
              <span>or register with</span>
            </div>

            {/* Social Logins: Google & Apple (2 columns) */}
            <div className="auth-social-grid">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="auth-social-btn"
                title="Connect with Google"
              >
                <GoogleIcon size={18} />
                <span>Connect with Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleAuth}
                disabled={loading}
                className="auth-social-btn"
                title="Register with Apple"
              >
                <AppleIcon size={18} />
                <span>Apple</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Showcase Panel (Visible on Desktop, flush to right edge with 0 empty space, hidden on Mobile) */}
        <AuthShowcaseCard type="signup" onNavigate={onNavigate} />
      </div>

      {/* Google Verification Modal Fallback */}
      <GoogleVerificationModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        mode="signup"
        defaultEmail={email}
      />
    </div>
  );
}
