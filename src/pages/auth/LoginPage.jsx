import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleIcon, GoogleVerificationModal } from '../../components/auth/GoogleVerificationModal';
import { AppleIcon } from '../../components/auth/AppleIcon';
import { AuthShowcaseCard } from '../../components/auth/AuthShowcaseCard';
import { triggerGoogleNativeAuth } from '../../services/googleAuth';
import { authService } from '../../services/api';

export function LoginPage({ onNavigate, onLoginSuccess }) {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const [authMethod, setAuthMethod] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

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
      const user = await loginWithGoogle(googleProfile);
      if (onLoginSuccess) onLoginSuccess(user);
      onNavigate('dashboard');
    } catch (err) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    setError('');
    triggerGoogleNativeAuth({
      onSuccess: handleGoogleSuccess,
      onError: (err) => {
        console.warn('Native Google Auth fallback to modal:', err);
        setIsGoogleModalOpen(true);
      }
    });
  };

  const handleAppleClick = () => {
    setError('Apple Sign-In is currently reserved for the iOS mobile application. Please continue with Google or your Work Email.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (authMethod === 'password') {
      if (!email || !password) {
        setError('Please provide your work email and password.');
        return;
      }

      setLoading(true);
      try {
        const user = await login(email.trim().toLowerCase(), password, false);
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
    } else {
      // OTP Verification Submission
      const fullOtp = otpDigits.join('');
      if (fullOtp.length < 6) {
        setError('Please enter the full 6-digit verification code.');
        return;
      }

      setLoading(true);
      try {
        const verifyRes = await authService.verifyOtp(email.trim().toLowerCase(), fullOtp);
        const isVerified = verifyRes?.verified || verifyRes?.data?.verified || verifyRes?.success;
        if (!isVerified) {
          throw new Error(verifyRes?.error || 'Invalid or expired OTP code.');
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await loginWithGoogle({
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          storeName: `${cleanEmail.split('@')[0]}'s Store`
        });

        if (onLoginSuccess) onLoginSuccess(user);
        onNavigate('dashboard');
      } catch (err) {
        setError(err?.message || 'Invalid or expired code. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your work email first.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setOtpLoading(true);
    try {
      const res = await authService.sendOtp(email.trim().toLowerCase());
      setOtpSent(true);
      const activeCode = res?.otp || res?.data?.otp || res?.devCode;
      if (activeCode) {
        setActiveOtpCode(activeCode);
      }
      setSuccessMsg(`A 6-digit login code has been sent to ${email}`);
    } catch (err) {
      setError(err?.message || 'Failed to dispatch verification code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`login-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const autoFillOtp = () => {
    if (!activeOtpCode || activeOtpCode.length !== 6) return;
    const digits = activeOtpCode.split('');
    setOtpDigits(digits);
    const lastInput = document.getElementById('login-otp-5');
    if (lastInput) lastInput.focus();
  };

  const isAdminError = error && (error.includes('/admin') || error.includes('Admin Portal') || error.includes('Administrative'));

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
            <h1 className="auth-form-header-title">Welcome back</h1>
            <p className="auth-form-header-subtitle">
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-form-link"
                onClick={() => onNavigate('signup')}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit' }}
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="auth-alert auth-alert-error">
              <ShieldAlert size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div>{error}</div>
                {isAdminError && (
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/admin'; }}
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
                    <span>Open Admin Portal (/admin)</span>
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

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Field */}
            <div className="auth-input-group">
              <label className="auth-input-label">Email</label>
              <div className="auth-input-wrapper">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="merchant@yourbrand.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="auth-input"
                />
              </div>
            </div>

            {/* Password vs OTP verification */}
            {authMethod === 'password' ? (
              <>
                <div className="auth-input-group">
                  <label className="auth-input-label">Password</label>
                  <div className="auth-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
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

                {/* Options Row */}
                <div className="auth-options-row">
                  <label className="auth-checkbox-row">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="auth-form-link"
                    style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.82rem' }}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            ) : (
              /* OTP 6-Digit Code Mode */
              <div className="auth-input-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="auth-input-label">6-Digit Login Code</label>
                  {!otpSent ? (
                    <button
                      type="button"
                      disabled={otpLoading || !email}
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#475569',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: (otpLoading || !email) ? 'not-allowed' : 'pointer',
                        padding: 0
                      }}
                    >
                      {otpLoading ? 'Sending…' : 'Send Code →'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={otpLoading}
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '0.4rem 0' }}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`login-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      style={{
                        width: '46px',
                        height: '50px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        background: 'rgba(9, 13, 22, 0.95)',
                        border: digit ? '1.5px solid #475569' : '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '12px',
                        outline: 'none',
                        boxShadow: digit ? '0 0 12px rgba(148, 163, 184, 0.25)' : 'none'
                      }}
                    />
                  ))}
                </div>

                {activeOtpCode && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(148, 163, 184, 0.08)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.78rem'
                  }}>
                    <span style={{ color: '#FF8A98' }}>Active code: <strong>{activeOtpCode}</strong></span>
                    <button
                      type="button"
                      onClick={autoFillOtp}
                      style={{
                        background: '#475569',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? (
                <span>Authenticating…</span>
              ) : (
                <>
                  <span>{authMethod === 'password' ? 'Sign In' : 'Verify & Sign In'}</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>

            {/* Subtle method toggle */}
            <div style={{ textAlign: 'center', marginTop: '2px' }}>
              {authMethod === 'password' ? (
                <button
                  type="button"
                  onClick={() => { setAuthMethod('otp'); setError(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
                >
                  Sign in with 6-digit email code instead
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAuthMethod('password'); setError(''); setSuccessMsg(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
                >
                  Sign in with password instead
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="auth-form-divider">
              <span>or sign in with</span>
            </div>

            {/* Social Logins: Google & Apple (2 columns) */}
            <div className="auth-social-grid">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="auth-social-btn"
                title="Connect with Google"
              >
                <GoogleIcon size={18} />
                <span>Connect with Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleClick}
                disabled={loading}
                className="auth-social-btn"
                title="Sign in with Apple"
              >
                <AppleIcon size={18} />
                <span>Apple</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Showcase Panel (Visible on Desktop, flush to right edge with 0 empty space, hidden on Mobile) */}
        <AuthShowcaseCard onNavigate={onNavigate} />
      </div>

      {/* Google Verification Modal Fallback */}
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
