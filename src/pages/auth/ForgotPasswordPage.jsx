import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {!submitted ? (
          <div>
            <div className="auth-header">
              <div 
                className="brand-logo" 
                style={{ justifyContent: 'center', marginBottom: '1.5rem', cursor: 'pointer' }}
                onClick={() => onNavigate('home')}
                title="KreazyAI"
              >
                <img src="/logo.png" alt="KreazyAI" className="brand-logo-img brand-logo-lg" />
              </div>
              <h1>Reset your password</h1>
              <p>Enter the email associated with your KreazyAI account and we'll send you a secure recovery link.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Input
                label="Work Email"
                name="email"
                type="email"
                required
                icon={Mail}
                placeholder="merchant@yourbrand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
                Send Password Reset Link
              </Button>

              <Button 
                type="button" 
                variant="ghost" 
                size="md" 
                onClick={() => onNavigate('login')}
                style={{ width: '100%' }}
                icon={ArrowLeft}
              >
                Back to Sign In
              </Button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={30} />
            </div>
            <h2>Password link sent</h2>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '0.925rem' }}>
              If an account exists for <strong>{email}</strong>, a secure password reset link has been dispatched. Please check your inbox and spam folder.
            </p>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => onNavigate('login')}>
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
