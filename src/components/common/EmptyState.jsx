import React from 'react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div className={`state-box ${className}`}>
      {Icon && (
        <div className="state-box-icon">
          <Icon size={24} />
        </div>
      )}
      <h4>{title}</h4>
      {description && <p style={{ maxWidth: '420px', margin: '0 auto' }}>{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} style={{ marginTop: '0.5rem' }}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
