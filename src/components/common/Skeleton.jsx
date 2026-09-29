import React from 'react';

export function Skeleton({
  variant = 'text', // text | text-sm | circle | card | rect
  width,
  height,
  className = '',
  style = {}
}) {
  const variantClass = {
    text: 'skeleton-text',
    'text-sm': 'skeleton-text-sm',
    circle: 'skeleton-circle',
    card: 'skeleton-card',
    rect: ''
  }[variant] || 'skeleton-text';

  const inlineStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style
  };

  return (
    <div
      className={`skeleton-shimmer ${variantClass} ${className}`}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <Skeleton variant="text-sm" width="40%" />
      <Skeleton variant="text" height="28px" width="60%" />
      <Skeleton variant="text-sm" width="80%" />
    </div>
  );
}

export function SkeletonTable({ rows = 4, cols = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 0' }}>
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton key={cIdx} variant="text" width={cIdx === 0 ? '15%' : cIdx === 1 ? '30%' : '20%'} />
          ))}
        </div>
      ))}
    </div>
  );
}
