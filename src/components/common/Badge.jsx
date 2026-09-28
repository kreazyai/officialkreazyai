import React from 'react';

export function Badge({
  children,
  variant = 'default', // default | olive | success | warning | error | info | purple | whatsapp | instagram | facebook
  icon: Icon,
  className = ''
}) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
