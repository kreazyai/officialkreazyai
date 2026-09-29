import React from 'react';

export function Card({
  children,
  variant = 'base', // base | elevated | interactive | glass
  className = '',
  onClick,
  style = {},
  ...props
}) {
  const variantClass = {
    base: 'card',
    elevated: 'card card-elevated',
    interactive: 'card card-interactive',
    glass: 'glass-card'
  }[variant] || 'card';

  return (
    <div
      className={`${variantClass} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
