import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { apiClient } from '../../api/client';

export function AdminLoginPage({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanIdentifier = identifier.trim();

    try {
      const res = await apiClient.post('/auth/admin-login', {
        email: cleanIdentifier,
        password: password
      });

      setLoading(false);
      if (res && res.token) {
        apiClient.setAuthToken(res.token);
        if (rememberMe) {
          localStorage.setItem('kreazy_superadmin_auth', 'true');
          localStorage.setItem('kreazy_superadmin_email', res.user?.email || cleanIdentifier);
        } else {
          sessionStorage.setItem('kreazy_superadmin_auth', 'true');
          sessionStorage.setItem('kreazy_superadmin_email', res.user?.email || cleanIdentifier);
        }
        onLoginSuccess();
      } else {
        throw new Error('Email or password is incorrect.');
      }
    } catch (err) {
      setLoading(false);
      let msg = err?.message || 'Email or password is incorrect.';
      if (err?.status === 429) {
        msg = err.message || 'Too many attempts. Please try again in a few minutes.';
      } else if (!err?.status && (msg.includes('fetch') || msg.includes('Network') || msg.includes('Failed'))) {
        msg = 'Unable to connect to authentication server. Please check your network or try again in a moment.';
      }
      setError(msg);
    }
  };

  return (
    <div className="mac-admin-login-wrapper">
      <div className="mac-admin-window" role="dialog" aria-labelledby="mac-window-title">
        {/* macOS Window Title Bar */}
        <div className="mac-window-titlebar">
          <div className="mac-window-traffic-lights" aria-hidden="true">
            <span className="mac-traffic-dot mac-dot-close" />
            <span className="mac-traffic-dot mac-dot-minimize" />
            <span className="mac-traffic-dot mac-dot-maximize" />
          </div>
          <div id="mac-window-title" className="mac-window-title-text">
            KREAZY AI Admin
          </div>
          <div className="mac-window-traffic-spacer" aria-hidden="true" />
        </div>

        {/* Window Content */}
        <div className="mac-window-body">
          {/* Logo & Headline */}
          <div className="mac-login-header">
            <img
              src="/logo-dark.svg"
              alt="KREAZY AI"
              className="mac-login-logo"
            />
            <h1 className="mac-login-title">Admin Portal</h1>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mac-login-error" role="alert">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="mac-login-form">
            <div className="mac-form-group">
              <label htmlFor="admin-identifier" className="mac-form-label">
                Email or Username
              </label>
              <div className="mac-input-wrapper">
                <Mail size={16} className="mac-input-icon" aria-hidden="true" />
                <input
                  id="admin-identifier"
                  type="text"
                  required
                  autoComplete="off"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="mac-input"
                  placeholder="Enter email or username"
                />
              </div>
            </div>

            <div className="mac-form-group">
              <label htmlFor="admin-password" className="mac-form-label">
                Password
              </label>
              <div className="mac-input-wrapper">
                <Lock size={16} className="mac-input-icon" aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mac-input mac-input-password"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mac-password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="mac-form-options">
              <label className="mac-remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mac-checkbox"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mac-signin-btn"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
