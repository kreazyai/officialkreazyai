import React from 'react';

export function AuthShowcaseCard({ type = 'login' }) {
  const isSignup = type === 'signup';
  const photoSrc = isSignup
    ? '/images/signup-showcase-dark.jpg'
    : '/images/auth-founder-showcase.jpg';

  return (
    <div className={`auth-showcase-panel ${isSignup ? 'auth-showcase-signup' : 'auth-showcase-login'}`}>
      {/* Showcase Visual Stage */}
      <div className="auth-showcase-image-stage">
        <img
          src={photoSrc}
          alt={isSignup ? "KreazyAI WhatsApp Store Showcase" : "KreazyAI WhatsApp Store Automation in Action"}
          className={`auth-showcase-photo ${isSignup ? 'auth-showcase-photo-signup' : ''}`}
          loading="eager"
        />
        {/* Subtle Vignette Overlay for Natural Glass Contrast */}
        <div className="auth-showcase-photo-overlay" />
      </div>
    </div>
  );
}
