import React from 'react';

/**
 * Official vector brand icons for KreazyAI Integrations
 */

export function WhatsAppIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="13" fill="#25D366" />
      <path
        d="M24 10C16.27 10 10 16.27 10 24C10 26.79 10.82 29.39 12.22 31.59L11 36L15.65 34.82C18.06 36.5 20.93 37.47 24 37.47C31.73 37.47 38 31.2 38 23.47C38 15.74 31.73 10 24 10ZM31.86 28.6C31.53 29.53 30.23 30.34 29.41 30.45C28.85 30.53 28.12 30.57 25.66 29.55C22.52 28.25 20.49 25.07 20.33 24.86C20.18 24.65 19.04 23.14 19.04 21.58C19.04 20.02 19.84 19.26 20.16 18.93C20.42 18.67 20.75 18.59 21.01 18.59C21.19 18.59 21.36 18.6 21.5 18.61C21.91 18.63 22.12 18.65 22.39 20.29C22.68 22.06 22.05 22.19 21.84 22.51C21.63 22.84 21.43 23.04 21.22 23.29C21.01 23.53 20.81 23.77 21.05 24.18C21.29 24.59 22.12 25.95 23.34 27.04C24.91 28.44 26.19 28.89 26.65 29.08C27 29.23 27.27 29.2 27.52 28.91C27.83 28.55 28.21 28 28.6 27.45C28.88 27.05 29.23 27.11 29.62 27.26C30.01 27.4 32.06 28.42 32.48 28.63C32.89 28.84 33.17 28.94 33.27 29.11C33.37 29.28 33.37 30.02 31.86 28.6Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function MessengerIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="messenger-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C6FF" />
          <stop offset="100%" stopColor="#0078FF" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#messenger-bg-grad)" />
      <path
        d="M24 12C16.82 12 11 17.38 11 24.03C11 27.81 12.89 31.2 15.85 33.4V38L20.25 35.58C21.43 35.91 22.69 36.08 24 36.08C31.18 36.08 37 30.7 37 24.05C37 17.38 31.18 12 24 12ZM25.2 28.5L21.4 24.44L14.2 28.5L22.12 20.1L26 24.16L33.1 20.1L25.2 28.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function FacebookIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="48" height="48" rx="13" fill="#1877F2" />
      <path
        d="M29.5 25.5H25V36H20.5V25.5H17.5V21.5H20.5V18.7C20.5 15.65 22.37 14 25.07 14C26.37 14 27.48 14.1 27.8 14.15V17.33H25.92C24.44 17.33 24.15 18.03 24.15 19.06V21.5H28.7L29.5 25.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export function InstagramIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <radialGradient id="ig-radial-grad" cx="20%" cy="105%" r="120%">
          <stop offset="0%" stopColor="#FFDD55" />
          <stop offset="10%" stopColor="#FFDD55" />
          <stop offset="50%" stopColor="#FF543E" />
          <stop offset="100%" stopColor="#C837AB" />
        </radialGradient>
        <linearGradient id="ig-linear-grad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3771C8" stopOpacity="0" />
          <stop offset="100%" stopColor="#3771C8" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#ig-radial-grad)" />
      <rect width="48" height="48" rx="13" fill="url(#ig-linear-grad)" />
      <rect
        x="13.5"
        y="13.5"
        width="21"
        height="21"
        rx="6"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />
      <circle
        cx="24"
        cy="24"
        r="5.2"
        stroke="#FFFFFF"
        strokeWidth="2.5"
      />
      <circle
        cx="29.8"
        cy="18.2"
        r="1.4"
        fill="#FFFFFF"
      />
    </svg>
  );
}

