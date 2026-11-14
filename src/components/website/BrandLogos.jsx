import React from 'react';

/**
 * Official Meta Company Logo (Infinity Brandmark)
 * Precision SVG vector with authentic Meta gradient
 */
export function MetaLogo({ size = 22, className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="Meta Logo"
      role="img"
    >
      <defs>
        <linearGradient id="metaOfficialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0081FB" />
          <stop offset="50%" stopColor="#0064E0" />
          <stop offset="100%" stopColor="#004EC4" />
        </linearGradient>
      </defs>
      <path
        fill="url(#metaOfficialGrad)"
        d="M2.035 13.42c.26-6.058 5.405-11.598 10.229-5.27c4.326-6.307 9.45-.643 9.679 4.959a7 7 0 0 1-.706 4.066a3.33 3.33 0 0 1-4.42 1.038c-1.43-.84-2.25-2.386-3.111-3.756c-.57-.944-1.141-1.877-1.701-2.832c-1.256 2.003-2.822 5.727-4.97 6.733a3.485 3.485 0 0 1-4.211-1.183a6.22 6.22 0 0 1-.789-3.755m18.02.623c-.083-2.563-.747-6.422-3.756-6.961c-1.41 0-2.272 1.317-2.998 2.344v.166c.789 1.162 1.473 2.396 2.21 3.59c.602.87 1.587 2.81 2.531 3.184c1.577.498 2.064-1.058 2.013-2.303zm-15.883-.25v.54a2.48 2.48 0 0 0 .56 1.701a1.46 1.46 0 0 0 1.691.27a5.5 5.5 0 0 0 1.608-1.712c1.038-1.473 1.92-3.008 2.915-4.502c0-.104-.176-.28-.217-.384c-.851-1.14-2.075-2.635-3.694-2.075c-2.074 1.245-2.79 3.932-2.863 6.163"
      />
    </svg>
  );
}

/**
 * Official bKash Company Logo (Origami Bird Brandmark)
 * Multi-faceted polygons extracted from official vector source
 */
export function BkashLogo({ size = 24, className = "", style = {} }) {
  return (
    <svg
      viewBox="168 0 158 150"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="bKash Logo"
      role="img"
    >
      <polygon fill="#D02053" points="225.42,71.2 234.67,112.76 295.16,82.13" />
      <polygon fill="#E2126E" points="242.63,9.1 225.43,71.21 295.18,82.13" />
      <polygon fill="#D02053" points="168.73,0 240.86,8.62 223.81,70.36" />
      <polygon fill="#9D1638" points="168.15,12.15 176.19,12.15 198.73,40.96" />
      <polygon fill="#D02053" points="297.09,81.74 276.12,52.72 310.04,46.65" />
      <polygon fill="#E2126E" points="293.59,90.24 295.74,83.78 242.81,110.64" />
      <polygon fill="#9D1638" points="223.94,72.84 234.98,122.49 202.2,149.14" />
      <polygon fill="#E2126E" points="306.73,61.4 325.98,61.07 312.07,46.92" />
    </svg>
  );
}

/**
 * Official Nagad Company Logo (Circular Dynamic Swirl Brandmark)
 * Precision SVG paths with authentic orange and crimson layers
 */
export function NagadLogo({ size = 24, className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 46 45"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="Nagad Logo"
      role="img"
    >
      <path
        fill="#F7941D"
        d="M 12.918 11.578 C 14.312 8.098 16.461 5.125 19.355 2.656 C 19.961 2.137 20.688 1.602 21.535 1.055 C 22.172 0.637 22.781 0.477 23.465 0.781 C 23.871 0.965 24.117 1.25 24.332 1.648 C 25.5 3.797 26.664 5.934 27.816 8.059 C 27.828 8.078 27.82 8.09 27.801 8.098 C 24.645 9.258 21.832 11.359 19.578 13.898 C 16.121 17.793 13.789 22.672 13.152 27.871 C 13.125 28.105 13.105 28.332 13.094 28.543 C 13.09 28.648 13.066 28.652 13.031 28.555 C 12.621 27.465 12.277 26.336 12.004 25.168 C 11.613 23.5 11.402 21.855 11.367 20.23 C 11.301 17.199 11.816 14.316 12.918 11.578 Z"
      />
      <path
        fill="#F37023"
        d="M 29.363 8.758 L 26.953 4.238 C 30.543 1.789 34.738 0.688 39.07 0.789 C 39.824 0.809 40.469 1.254 40.695 1.957 C 40.75 2.129 40.789 2.426 40.805 2.84 C 40.926 5.969 41.055 9.07 41.184 12.148 C 38.438 11.879 35.656 11.879 32.938 12.25 C 27.883 12.938 23.184 15.039 19.652 18.664 C 18.137 20.223 16.875 21.961 15.867 23.883 C 16.707 18.461 20.508 13.945 25.039 11.035 C 26.41 10.156 27.852 9.398 29.363 8.758 Z"
      />
      <path
        fill="#ED1C24"
        d="M 31.359 40.094 C 28.957 41.461 26.484 42.199 23.883 42.434 C 20.73 42.715 17.492 42.23 14.566 40.961 C 11.078 39.453 8.254 37.117 6.094 33.957 C 4.098 31.035 2.977 27.555 2.805 24.062 C 2.648 20.922 3.219 17.918 4.508 15.043 C 6.383 11.922 8.789 9.41 11.719 7.406 C 12.523 6.855 13.379 6.352 14.273 5.887 C 11.789 9.797 10.391 14.391 10.043 19.004 C 9.855 21.441 10.039 23.891 10.586 26.348 C 11.801 31.805 14.98 36.82 19.961 39.465 C 21.641 40.355 23.422 40.891 25.305 41.07 C 27.359 41.27 29.379 40.945 31.359 40.094 Z"
      />
      <path
        fill="#ED1C24"
        d="M 42.359 13.387 L 42.102 8.254 C 42.066 7.453 41.836 6.785 41.41 6.25 C 40.781 5.465 39.871 5.094 38.68 5.137 C 35.156 5.258 31.836 6.32 28.723 8.324 C 28.672 8.355 28.664 8.379 28.699 8.418 L 30.738 10.84 C 33.375 9.465 36.195 8.711 39.195 8.578 C 39.23 8.578 39.246 8.594 39.246 8.629 L 39.023 14.07 C 37.387 14.281 35.789 14.73 34.238 15.418 C 29.07 17.703 25.105 21.578 22.344 27.047 C 21.059 29.594 20.258 32.324 19.941 35.234 C 19.914 35.48 19.957 35.531 20.176 35.41 C 23.879 33.348 27.676 31.574 31.566 30.086 C 36.008 28.387 40.238 25.992 43.141 21.996 C 44.402 20.266 44.977 18.23 44.867 16.035 C 44.758 13.84 43.668 12.336 42.359 13.387 Z"
      />
      <path
        fill="#F37023"
        d="M 4.504 14.941 C 4.531 14.953 4.531 14.988 4.508 15.043 C 3.219 17.918 2.648 20.922 2.805 24.062 C 2.977 27.555 4.098 31.035 6.094 33.957 C 8.254 37.117 11.078 39.453 14.566 40.961 C 17.492 42.23 20.73 42.715 23.883 42.434 C 26.484 42.199 28.957 41.461 31.359 40.094 C 27.277 42.062 22.848 42.488 18.422 41.344 C 13.844 40.16 9.945 37.387 7.027 33.277 C 4.148 29.219 2.766 24.57 2.871 19.684 C 2.934 16.711 3.594 13.832 4.871 11.16 C 5.09 10.703 5.438 10.719 5.621 11.18 C 5.148 12.379 4.773 13.645 4.504 14.941 Z"
      />
    </svg>
  );
}

/**
 * Precision High-Speed SLA Vector Icon (No Emoji)
 * Represents instant setup in under 5 minutes
 */
export function InstantSetupSpeedIcon({ size = 22, color = "#10B981", className = "", style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-label="Instant Setup"
      role="img"
    >
      <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.75" strokeOpacity="0.4" />
      <path
        d="M12 2.5 A9.5 9.5 0 0 1 21.5 12"
        stroke={color}
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <path
        d="M12 7V12L15.5 14"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
