import React, { useState, useEffect } from 'react';
import { Mail, Lock, Building2, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { GoogleAuthButton, GoogleVerificationModal } from '../../components/auth/GoogleVerificationModal';

export function SignUpPage({ onNavigate, onLoginSuccess }) {
  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  // If already authenticated, redirect to dashboard immediately
  useEffect(() => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, onNavigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const isLengthValid = formData.password.length >= 8;
  const isMatchValid = formData.password.length > 0 && formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
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
    try {
      const user = await register({
        storeName: formData.businessName || "My Retail Store",
        ownerName: formData.fullName || "Store Owner",
        email: formData.email,
        password: formData.password,
        plan: "Growth ($119/mo)"
      });
      if (onLoginSuccess) onLoginSuccess(user);
      onNavigate('onboarding');
    } catch (err) {
      if (err?.status === 409 || err?.code === 'CONFLICT' || err?.message?.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(err?.message || 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (googleData) => {
    try {
      const user = await loginWithGoogle({
        ...googleData,
        storeName: formData.businessName || googleData.storeName
      });
      if (onLoginSuccess) onLoginSuccess(user);
      setIsGoogleModalOpen(false);
      onNavigate('onboarding');
    } catch (err) {
      setError(err?.message || 'Google account verification failed. Please try again.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '490px' }}>
        <div className="auth-header">
          <div
            className="brand-logo"
            style={{ justifyContent: 'center', marginBottom: '1.5rem', cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
            title="KreazyAI"
          >
            <img src="/logo-dark.svg" alt="KreazyAI" className="brand-logo-img brand-logo-lg" />
          </div>
          <h1>Create your merchant account</h1>
          <p>Start your 14-day free trial. Automate your sales across WhatsApp and Meta.</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid var(--status-error-border)' }}>
            {error}
          </div>
        )}

        {/* Clean Google Authentication Button */}
        <GoogleAuthButton
          text="Sign up with Google"
          onClick={() => setIsGoogleModalOpen(true)}
        />

        {/* Clear Divider */}
        <div className="auth-divider">
          <span>or register with email</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <Input
            label="Business / Store Name"
            name="businessName"
            required
            icon={Building2}
            placeholder="e.g. Sylvan Studio"
            value={formData.businessName}
            onChange={handleChange}
          />

          <Input
            label="Your Full Name"
            name="fullName"
            required
            icon={User}
            placeholder="e.g. Elena Rostova"
            value={formData.fullName}
            onChange={handleChange}
          />

          <Input
            label="Work Email"
            name="email"
            type="email"
            required
            icon={Mail}
            placeholder="elena@sylvanstudio.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Min. 8 chars"
              value={formData.password}
              onChange={handleChange}
              iconRight={showPassword ? EyeOff : Eye}
              onIconRightClick={() => setShowPassword(prev => !prev)}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              iconRight={showConfirmPassword ? EyeOff : Eye}
              onIconRightClick={() => setShowConfirmPassword(prev => !prev)}
              autoComplete="new-password"
            />
          </div>

          {/* Real-Time Password Clarity Feedback */}
          {(formData.password.length > 0 || formData.confirmPassword.length > 0) && (
            <div className="password-requirements-box">
              <div className={`password-req-item ${isLengthValid ? 'met' : 'unmet'}`}>
                <CheckCircle2 size={13} />
                <span>At least 8 characters ({formData.password.length}/8)</span>
              </div>
              <div className={`password-req-item ${isMatchValid ? 'met' : 'unmet'}`}>
                <CheckCircle2 size={13} />
                <span>{isMatchValid ? 'Passwords match' : 'Passwords do not match yet'}</span>
              </div>
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              style={{ marginTop: '3px' }}
            />
            <span>
              I agree to the <span style={{ textDecoration: 'underline' }}>Terms of Commercial Service</span> and <span style={{ textDecoration: 'underline' }}>Privacy Policy</span>.
            </span>
          </label>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', marginTop: '0.25rem' }}>
            Create Account & Setup Channels
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: 'inherit'
            }}
            onClick={() => onNavigate('login')}
          >
            Sign in here
          </button>
        </div>
      </div>

      {/* Google Verification Modal */}
      <GoogleVerificationModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        mode="signup"
        defaultEmail={formData.email}
      />
    </div>
  );
}
