# KREAZYAI DESIGN SYSTEM SPECIFICATION
=============================================================================
**Document Version:** 1.0.0  
**Design Standard:** Generational AI Automation Enterprise SaaS  
**Visual Direction:** Deep Olive (`#182018`) + Warm Neutrals + Soft Contrast + Tactile Olive Accents  
**Typography Standard:** Plus Jakarta Sans & JetBrains Mono  
=============================================================================

---

## 1. Design Philosophy: Intelligence, Trust & Calm Precision

KreazyAI is not an experimental novelty chatbot; it is a **business-critical, mission-critical autonomous commercial engine** that handles enterprise catalog data, sensitive customer transactions, and automated order fulfillment.

The visual language communicates:
- **Calm Authority:** Dark, architectural surfaces that eliminate cognitive fatigue.
- **Organic Tech Contrast:** Deep Olive tones infused with warm moonlight text, rejecting noisy cyber neon.
- **Predictable Hierarchy:** Every screen features exactly one dominant focal point, clear secondary paths, and subdued administrative metadata.
- **Tactile Feedback:** Crisp 1px borders, subtle soft depth, and responsive micro-animations that confirm system actions without flashy distraction.

---

## 2. Core Color Palette & Semantic Tokens

### Base Palette Specification
```css
/* Core Palette */
--deep-olive-base:     #182018; /* Canvas base */
--deep-olive-secondary:#202A20; /* Canvas alt / subtle containers */
--deep-olive-elevated: #263226; /* Popovers, modals, flyout drawers */
--deep-olive-card:     #2B382A; /* Content cards, panels */
--deep-olive-border:   #465340; /* Structural 1px border */
--primary-olive:       #667A3E; /* Brand primary tone */
--bright-olive:        #8FA653; /* Primary tactile CTA & active states */
--soft-olive:          #B8C58A; /* Secondary accent & badge highlights */
--warm-cream:          #F3F0E4; /* Brand accent highlights */
--text-primary:        #F5F4EC; /* High contrast primary body/headings */
--text-secondary:      #C7C9BA; /* Medium contrast supporting content */
--text-muted:          #969B8A; /* Low contrast metadata, labels, icons */
--accent-amber:        #D6A85C; /* High-value badges, warning alerts */
```

### Semantic Token Architecture
```css
:root {
  /* Surface Tokens */
  --color-bg-canvas:          var(--deep-olive-base);
  --color-bg-surface:         var(--deep-olive-base);
  --color-bg-secondary:       var(--deep-olive-secondary);
  --color-bg-elevated:        var(--deep-olive-elevated);
  --color-bg-card:            var(--deep-olive-card);
  --color-bg-card-hover:      #314030;
  --color-bg-overlay:         rgba(18, 24, 18, 0.75);

  /* Border Tokens */
  --color-border-subtle:      rgba(70, 83, 64, 0.45);
  --color-border-medium:      var(--deep-olive-border);
  --color-border-strong:      var(--primary-olive);
  --color-border-bright:      var(--bright-olive);

  /* Text Tokens */
  --color-text-primary:       var(--text-primary);
  --color-text-secondary:     var(--text-secondary);
  --color-text-muted:         var(--text-muted);
  --color-text-inverse:       #141B14;
  --color-text-accent:        var(--soft-olive);

  /* Interactive / CTA Tokens */
  --color-cta-primary-bg:     var(--bright-olive);
  --color-cta-primary-hover:  #9db55f;
  --color-cta-primary-text:   #141B14;
  --color-cta-secondary-border:var(--color-border-medium);
  --color-cta-secondary-hover:rgba(102, 122, 62, 0.2);

  /* Status Tokens */
  --color-status-success-bg:  rgba(143, 166, 83, 0.15);
  --color-status-success-border: rgba(143, 166, 83, 0.35);
  --color-status-success-text:#B8C58A;

  --color-status-warning-bg:  rgba(214, 168, 92, 0.15);
  --color-status-warning-border: rgba(214, 168, 92, 0.35);
  --color-status-warning-text:#D6A85C;

  --color-status-error-bg:    rgba(217, 120, 112, 0.15);
  --color-status-error-border:rgba(217, 120, 112, 0.35);
  --color-status-error-text:  #E88A82;

  --color-status-info-bg:     rgba(184, 197, 138, 0.15);
  --color-status-info-border: rgba(184, 197, 138, 0.35);
  --color-status-info-text:   #B8C58A;

  /* Official Channel Integration Tokens */
  --color-channel-whatsapp:   #25D366;
  --color-channel-whatsapp-bg:rgba(37, 211, 102, 0.12);
  --color-channel-instagram:  #E1306C;
  --color-channel-instagram-bg:rgba(225, 48, 108, 0.12);
  --color-channel-facebook:   #1877F2;
  --color-channel-facebook-bg:rgba(24, 119, 242, 0.12);
  --color-channel-shopify:    #96BF48;
  --color-channel-shopify-bg: rgba(150, 191, 72, 0.12);
}
```

---

## 3. Typography Scale & Hierarchy

KreazyAI utilizes **Plus Jakarta Sans** for interface and display typography, with **JetBrains Mono** reserved for code, monetary metrics, order hashes, and technical data.

| Semantic Level | Font Size | Line Height | Weight | Letter Spacing | Primary Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `clamp(2.75rem, 5vw, 4.25rem)` | 1.12 | 800 | `-0.035em` | Marketing Hero Headline |
| **H1** | `clamp(2.0rem, 3.5vw, 2.75rem)` | 1.2 | 800 | `-0.03em` | Primary Section / Page Title |
| **H2** | `clamp(1.5rem, 2.5vw, 2.0rem)` | 1.25 | 700 | `-0.025em` | Section Sub-headers, Module Titles |
| **H3** | `1.35rem (21.6px)` | 1.3 | 700 | `-0.02em` | Card Titles, Modal Headers |
| **H4** | `1.125rem (18px)` | 1.35 | 600 | `-0.015em` | Subsection Labels, Group Headings |
| **Body Large** | `1.125rem (18px)` | 1.65 | 400 | `-0.01em` | Lead Paragraphs, Hero Subtitles |
| **Body (Base)**| `0.9375rem (15px)`| 1.6 | 400 | `-0.005em` | Standard Body, Form Descriptions |
| **Body Small** | `0.84375rem (13.5px)`| 1.5 | 400 / 500 | `0` | Table Cells, Sidebar Subtexts |
| **Caption** | `0.75rem (12px)` | 1.4 | 500 | `+0.01em` | Metadata, Timestamps, Helper Hints |
| **Label / Eyebrow**| `0.75rem (12px)` | 1.2 | 700 | `+0.08em` | Uppercase Category Badges |
| **Button** | `0.875rem (14px)` | 1.0 | 600 / 700 | `-0.01em` | Interactive Buttons |
| **Metric Value**| `1.75rem (28px)` | 1.15 | 800 | `-0.02em` | Telemetry KPIs, Revenue Numbers |
| **Code / Hash** | `0.8125rem (13px)`| 1.4 | 500 | `0` | Order IDs (KZ-1049), SKUs, JSON |

---

## 4. Spacing System & Layout Grid

### Spacing Scale
Based on a 4px geometric progression:
- `--space-1`: `4px` (`0.25rem`) — Micro gaps, badge inner padding
- `--space-2`: `8px` (`0.5rem`) — Button icon gaps, item stack spacing
- `--space-3`: `12px` (`0.75rem`) — Compact card padding, input horizontal padding
- `--space-4`: `16px` (`1.0rem`) — Standard component padding, list gaps
- `--space-5`: `20px` (`1.25rem`) — Card inner padding, section sub-elements
- `--space-6`: `24px` (`1.5rem`) — Dashboard card padding, header margins
- `--space-8`: `32px` (`2.0rem`) — Grid column gaps, container inner margins
- `--space-10`: `40px` (`2.5rem`) — Major module separations
- `--space-12`: `48px` (`3.0rem`) — Website section padding
- `--space-16`: `64px` (`4.0rem`) — Major website section separators
- `--space-20`: `80px` (`5.0rem`) — Hero vertical margins
- `--space-24`: `96px` (`6.0rem`) — Page anchor spacing

### Container Widths & Responsive Grid
```css
--container-sm: 640px;   /* Dialogs, auth cards, article reads */
--container-md: 896px;   /* Medium documentation, forms */
--container-lg: 1140px;  /* Standard content container */
--container-xl: 1320px;  /* Marketing website max content width */
--container-full: 100%;  /* Fluid responsive application shell */
```

### Layout Grid Rules
- **Desktop (>= 1024px):** 12-column grid, 24px-32px gutters.
- **Tablet (768px - 1023px):** 6-column grid, 16px-20px gutters.
- **Mobile (< 768px):** 4-column fluid stack, 12px-16px gutters, 0px-16px screen margin.

---

## 5. Architectural Radii, Borders & Elevation

### Radius System
- `--radius-xs`: `4px` — Subtle tags, code pills
- `--radius-sm`: `6px` — Compact buttons, input fields, badges
- `--radius-md`: `8px` — Standard buttons, dropdowns, workspace badges
- `--radius-lg`: `12px` — Dashboard cards, message bubbles, table containers
- `--radius-xl`: `16px` — Hero mockups, major feature panels, modal dialogs
- `--radius-2xl`: `20px` — Highlight cards, promo banners
- `--radius-full`: `9999px` — Avatars, status pills, pill buttons

### Elevation & Shadows
Soft, ambient dark shadows that prevent edge bleeding without glowing neon rings:
- `--shadow-xs`: `0 1px 2px rgba(0, 0, 0, 0.35)`
- `--shadow-sm`: `0 2px 5px rgba(0, 0, 0, 0.45), 0 1px 2px rgba(0, 0, 0, 0.25)`
- `--shadow-md`: `0 4px 14px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.3)`
- `--shadow-lg`: `0 10px 30px rgba(0, 0, 0, 0.65), 0 3px 8px rgba(0, 0, 0, 0.35)`
- `--shadow-xl`: `0 20px 50px rgba(0, 0, 0, 0.8), 0 6px 16px rgba(0, 0, 0, 0.45)`

---

## 6. Interaction & Motion System

Animations must be snappy, intentional, and respectful of system performance and accessibility preferences.

### Timing Tokens
- `--transition-fast`: `160ms cubic-bezier(0.16, 1, 0.3, 1)` — Button hover, toggle switches, badge states
- `--transition-base`: `240ms cubic-bezier(0.16, 1, 0.3, 1)` — Popovers, dropdown reveals, tab shifts
- `--transition-smooth`: `360ms cubic-bezier(0.16, 1, 0.3, 1)` — Modal scale-in, drawer slide-overs

### Accessibility Constraint
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Z-Index Layering Order
```css
--z-base:        0;
--z-card:        1;
--z-sticky:      100;   /* Sticky headers */
--z-navigation:  800;   /* Top header, sidebar */
--z-dropdown:    850;   /* Menus, select popovers */
--z-backdrop:    950;   /* Modal / drawer backdrop */
--z-drawer:      1000;  /* Customer 360 profile drawer */
--z-modal:       1050;  /* Confirmation / edit modals */
--z-toast:       1100;  /* Notification banners, toasts */
--z-tooltip:     1200;  /* Hover tooltips */
```
