# KREAZYAI COMPONENT SYSTEM ARCHITECTURE
=============================================================================
**Document Version:** 1.0.0  
**Component Standard:** Generational Enterprise AI SaaS Component Library  
**Target Architecture:** React + Vanilla CSS Design Tokens + Strict Semantic Props  
=============================================================================

---

## 1. Overview & Architecture

The KreazyAI component system bridges design tokens with real full-stack behavior. It eliminates all ad-hoc styling and provides a standardized, type-safe, accessible component library across all 37 views of the platform.

Every component must satisfy four foundational rules:
1. **Token Strictness:** Colors, padding, radii, and shadows must derive directly from CSS custom properties (`var(--...)`). Zero raw hex or random pixel values.
2. **State Totality:** Every component must account for: `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `empty`, and `error`.
3. **Responsive Resilience:** Components must seamlessly adapt between phone (320px–430px), tablet (768px–834px), and desktop/wide displays (1024px–1920px).
4. **Accessible Semantics (WCAG 2.1 AA):** Mandatory ARIA attributes, keyboard traps for dialogs, visible focus rings, and screen-reader status alerts.

---

## 2. Core UI Components & API Specifications

### 2.1. Button System
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
}
```
- **Primary:** `--bright-olive` (`#8FA653`) background, dark text (`#141B14`), 700 weight, 1px subtle highlight. Used for primary conversions: "Book a Demo", "Save Changes", "Take Over Chat".
- **Secondary:** Transparent background, `--color-border-medium` (`#465340`), `--text-primary` (`#F5F4EC`). Used for supporting actions: "Explore KreazyAI", "Filter", "Export CSV".
- **Subtle:** Soft olive wash (`rgba(102, 122, 62, 0.18)`), `--soft-olive` text. Used for inline tags, non-intrusive actions.
- **Ghost:** Borderless, `--text-secondary`. Used for table actions, dismiss buttons, header navigation links.
- **Danger:** Soft red tint (`rgba(217, 120, 112, 0.15)`), `--status-error` text. Used for "Delete Product", "Disconnect Channel", "Suspend Store".

### 2.2. Card & Surface System (`Card`, `GlassCard`)
```typescript
interface CardProps {
  variant?: 'base' | 'elevated' | 'subtle' | 'interactive' | 'featured';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
```
- **Base Card:** Background `--color-bg-card` (`#2B382A`), border 1px solid `--color-border-medium`, radius `--radius-lg` (12px), shadow `--shadow-sm`.
- **Elevated Card:** Background `--color-bg-elevated` (`#263226`), border `--color-border-strong`, shadow `--shadow-md`.
- **Interactive Card:** Transitions on hover (`transform: translateY(-2px)`, border-color `--color-border-bright`, shadow `--shadow-md`).
- **GlassCard:** Background `rgba(38, 50, 38, 0.85)`, backdrop filter `blur(12px)`, subtle highlight border `rgba(184, 197, 138, 0.2)`.

### 2.3. Form & Input Controls (`Input`, `Textarea`, `Select`, `Switch`, `Checkbox`)
```typescript
interface InputProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date';
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  actionRight?: React.ReactNode;
}
```
- **Form Group Standards:** Always renders a visible `<label>` (with asterisk when `required`).
- **Focus State:** 2px outline `--bright-olive`, box shadow `0 0 0 3px rgba(143, 166, 83, 0.18)`.
- **Error State:** Border `--color-status-error-border`, helper text in `--color-status-error-text` with an inline alert icon.
- **Helper Hint:** Rendered below control in `--color-text-muted` (0.75rem).

### 2.4. Dialogs & Overlays (`Modal`, `Drawer`)
- **`Modal`:** Centered dialog for high-intent actions (Add Product, Order Details, Inbound Simulation). Clamped to viewport with mobile scroll lock and Escape key listener.
- **`Drawer` (`CustomerProfileDrawer`):** Slide-in panel anchored to the right viewport edge (width: 560px on desktop, 100% on mobile). Standardized to `--color-bg-elevated` (`#263226`) with `--color-bg-card` header, replacing any light mode regressions.

### 2.5. Data Presentation (`DataTable`, `MetricCard`, `Timeline`)
- **`DataTable`:**
  - *Desktop:* Rich table with sortable columns, status pills, and action icon buttons.
  - *Mobile (`< 768px`):* Automatically transforms into stacked responsive **DataCards** where headers become metadata labels and actions remain accessible with 44px touch targets.
- **`MetricCard`:** Displays metric title, prominent value in `--font-sans` 800 weight, comparison percentage pill (with green/amber trending arrow), and optional contextual sparkline.

### 2.6. AI Experience Components (`AIMessage`, `CopilotBadge`, `AgenticFlowBar`)
- **`AIMessage`:** Deep green gradient bubble (`#15803d` -> `#166534`), soft contrast text, timestamped with Bot icon and verified checkmarks (`✓✓`).
- **`CopilotBadge`:** Pill badge with live pulsing indicator dot (`animation: pulseGreenGlow 2s infinite`) and "AI Copilot Live" label.
- **`AgenticFlowBar`:** Horizontal sequential workflow (Customer Message -> AI Understanding -> Product Matching -> Order Capture -> Operational Dispatch) with animated flow connectors.

---

## 3. System States & Handling

### 3.1. Loading States (`Skeleton`, `Spinner`)
- Replace generic text like `"Loading..."` with animated shimmer skeleton blocks.
- Skeletons must match the exact dimensions of target components (e.g. 4 MetricCard skeletons in Dashboard, table row skeletons in Orders/Products).
```css
.skeleton-shimmer {
  background: linear-gradient(90deg, #263226 25%, #314030 50%, #263226 75%);
  background-size: 200% 100%;
  animation: skeletonShimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}
@keyframes skeletonShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 3.2. Empty States (`EmptyState`)
- Mandatory when data is absent (e.g., zero search matches, empty orders, no connected channels).
- Structure:
  1. Centered visual icon in subtle circular container.
  2. Distinct H4 heading explaining what is missing.
  3. Actionable body copy explaining why it matters.
  4. Primary CTA button (e.g. "Add First Product", "Connect WhatsApp", "Clear Search").

### 3.3. Error States (`Alert`, `ErrorCard`)
- Human-friendly, non-technical error notifications with distinct retry actions.
- Never display raw database exceptions or unhandled stack traces.

### 3.4. Success States (`Toast`, `SuccessBanner`)
- Non-blocking toast notifications for background actions (e.g. "Webhook Dispatched", "Product Saved Live").
- Persistent confirmation screens for high-value user milestones (Founder Meeting Scheduled, Order Confirmed).

---

## 4. Component Adoption Checklist

Every page must consume the centralized components:
- [ ] Public Landing Page (`HomePage.jsx`) uses `Button`, `Badge`, `HeroDashboardPreview`
- [ ] Admin Portal (`AdminDashboard.jsx`) uses `Button`, `Badge`, `Modal`, `EmptyState`
- [ ] Merchant Inbox (`MessagesPage.jsx`) uses `Button`, `Badge`, `Input`
- [ ] Orders (`OrdersPage.jsx`) uses `DataTable`, `Button`, `Badge`, `Modal`
- [ ] Products (`ProductsPage.jsx`) uses `DataTable`, `Button`, `Badge`, `Modal`
- [ ] Customer 360 (`CustomersPage.jsx`, `CustomerProfileDrawer.jsx`) uses `Drawer`, `Button`, `Badge`
- [ ] Settings (`SettingsPage.jsx`) uses `Card`, `Input`, `Select`, `Button`
