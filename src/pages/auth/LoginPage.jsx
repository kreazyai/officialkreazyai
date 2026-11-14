import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle2, Sparkles, ShieldAlert } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthButton, GoogleVerificationModal } from '../../components/auth/GoogleVerificationModal';
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

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // If already authenticated, redirect to dashboard immediately
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
    } else {
      // OTP Verification Submission
      const fullOtp = otpDigits.join('');
      if (fullOtp.length < 6) {
        setError('Please enter the full 6-digit verification code.');
        return;
      }

      setLoading(true);
      try {
        const verifyRes = await authService.verifyOtp(email, fullOtp);
        const isVerified = verifyRes?.verified || verifyRes?.data?.verified || verifyRes?.success;
        if (!isVerified) {
          throw new Error(verifyRes?.error || 'Invalid or expired OTP code.');
        }

        // Auto-login user with verified session
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
      const res = await authService.sendOtp(email.trim());
      setOtpSent(true);
      const activeCode = res?.otp || res?.data?.otp || res?.devCode;
      if (activeCode) {
        setActiveOtpCode(activeCode);
        setSuccessMsg(`A 6-digit login code has been sent to ${email}`);
      } else {
        setSuccessMsg(`A 6-digit login code has been sent to ${email}`);
      }
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
    <div className="auth-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at 50% 15%, rgba(255, 51, 75, 0.08) 0%, rgba(6, 8, 13, 0) 70%), #06080D',
      position: 'relative',
      color: '#FFFFFF'
    }}>
      <div className="auth-card" style={{
        width: '100%',
        maxWidth: '460px',
        background: 'rgba(14, 19, 31, 0.9)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: 'clamp(2rem, 4vw, 2.75rem)',
        boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 51, 75, 0.06)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
            className="brand-logo"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem', marginBottom: '1.25rem', cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
            title="KreazyAI"
          >
            <img src="/logo-mark.png" alt="Kreazy AI Emblem" className="brand-logo-mark" style={{ height: '36px' }} />
            <img src="/logo-white.svg" alt="KreazyAI" style={{ height: '26px', width: 'auto' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 1.85rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
            Welcome back
          </h1>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#94A3B8', lineHeight: 1.5 }}>
            Sign in to your merchant workspace to manage conversations, sales, and AI agents.
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            color: '#F87171',
            fontSize: '0.86rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
            {isAdminError && (
              <button
                type="button"
                onClick={() => { window.location.href = '/admin'; }}
                style={{
                  alignSelf: 'flex-start',
                  background: '#FF334B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px'
                }}
              >
                <span>Open Admin Portal (/admin)</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '0.85rem 1rem',
            background: 'rgba(15, 169, 104, 0.12)',
            border: '1px solid rgba(15, 169, 104, 0.35)',
            borderRadius: '12px',
            color: '#34D399',
            fontSize: '0.86rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Clean Google Authentication Button */}
        <GoogleAuthButton
          text="Continue with Google"
          onClick={handleGoogleClick}
        />

        {/* Clear Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.5rem 0',
          color: '#64748B',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
          <span>or sign in with</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
        </div>

        {/* Method Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMethod('password'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 12px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '9px',
              border: 'none',
              background: authMethod === 'password' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: authMethod === 'password' ? '#FFFFFF' : '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Lock size={14} />
            <span>Password</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod('otp'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 12px',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '9px',
              border: 'none',
              background: authMethod === 'otp' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              color: authMethod === 'otp' ? '#FFFFFF' : '#94A3B8',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <KeyRound size={14} />
            <span>6-Digit Code</span>
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
              Work Email <span style={{ color: '#FF334B' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                required
                placeholder="merchant@yourbrand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={{
                  width: '100%',
                  height: '46px',
                  background: 'rgba(9, 13, 22, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '12px',
                  padding: '0 1rem',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#FF334B'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)'; }}
              />
            </div>
          </div>

          {authMethod === 'password' ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                  Password <span style={{ color: '#FF334B' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      height: '46px',
                      background: 'rgba(9, 13, 22, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '12px',
                      padding: '0 2.5rem 0 1rem',
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#FF334B'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.14)'; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#94A3B8' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#FF334B' }}
                  />
                  <span>Remember this device</span>
                </label>
                <span
                  style={{ color: '#FF334B', cursor: 'pointer', fontWeight: 650 }}
                  onClick={() => onNavigate('forgot-password')}
                >
                  Forgot password?
                </span>
              </div>
            </>
          ) : (
            <>
              {/* OTP Code Entry Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 650, color: '#CBD5E1' }}>
                    Enter 6-Digit Verification Code
                  </label>
                  {!otpSent ? (
                    <button
                      type="button"
                      disabled={otpLoading || !email}
                      onClick={handleSendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FF334B',
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
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Resend Code
                    </button>
                  )}
                </div>

                {/* 6 Box Inputs */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '0.5rem 0' }}>
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
                        height: '52px',
                        textAlign: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#FFFFFF',
                        background: 'rgba(9, 13, 22, 0.95)',
                        border: digit ? '1.5px solid #FF334B' : '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '12px',
                        outline: 'none',
                        boxShadow: digit ? '0 0 12px rgba(255, 51, 75, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Active OTP helper badge with 1-click Auto-fill */}
                {activeOtpCode && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: 'rgba(255, 51, 75, 0.08)',
                    border: '1px solid rgba(255, 51, 75, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem'
                  }}>
                    <span style={{ color: '#FF8A98' }}>Active code: <strong>{activeOtpCode}</strong></span>
                    <button
                      type="button"
                      onClick={autoFillOtp}
                      style={{
                        background: '#FF334B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '3px 8px',
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
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              background: '#FF334B',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 51, 75, 0.5)',
              boxShadow: '0 4px 20px rgba(255, 51, 75, 0.35)',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = '#FF4D61'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.background = '#FF334B'; e.currentTarget.style.transform = 'translateY(0)'; } }}
          >
            {loading ? (
              <span>Authenticating…</span>
            ) : (
              <>
                <span>{authMethod === 'password' ? 'Sign In to Workspace' : 'Verify & Sign In'}</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>

          {/* Create Account Link Button */}
          <button
            type="button"
            onClick={() => onNavigate('signup')}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; }}
          >
            <span>Create New Account / Sign Up</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '0.86rem',
          color: '#94A3B8'
        }}>
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
