import React from 'react';

export function StatusIndicator({
  status = 'active', // active | pending | inactive | error
  label,
  pulse = true,
  className = ''
}) {
  const isGreen = status === 'active' || status === 'live' || status === 'online';
  const isAmber = status === 'pending' || status === 'standby' || status === 'warning';
  const isRed = status === 'error' || status === 'offline';

  const dotColor = isGreen ? '#8FA653' : isAmber ? '#D6A85C' : isRed ? '#D97870' : '#969B8A';

  return (
    <span className={`status-indicator-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          boxShadow: pulse ? `0 0 6px ${dotColor}` : 'none',
          display: 'inline-block',
          flexShrink: 0
        }}
      />
      {label && <span>{label}</span>}
    </span>
  );
}

export function CopilotBadge({ label = 'AI Copilot Live', className = '' }) {
  return (
    <span
      className={`mockup-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0.28rem 0.65rem',
        borderRadius: '9999px',
        backgroundColor: 'rgba(143, 166, 83, 0.15)',
        border: '1px solid rgba(143, 166, 83, 0.3)',
        color: '#B8C58A',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#8FA653',
          boxShadow: '0 0 8px #8FA653',
          animation: 'pulseGreenGlow 2s infinite'
        }}
      />
      <span>{label}</span>
    </span>
  );
}
