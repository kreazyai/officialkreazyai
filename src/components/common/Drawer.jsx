import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '560px'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="drawer-panel-right"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </Button>
        </div>

        <div className="drawer-body">
          {children}
        </div>

        {footer && (
          <div className="drawer-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
