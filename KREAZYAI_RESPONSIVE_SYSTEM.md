# KREAZYAI RESPONSIVE SYSTEM SPECIFICATION
=============================================================================
**Document Version:** 1.0.0  
**Target Viewports:** 320px to 1920px (Mobile, Tablet, Desktop, Ultrawide)  
**Core Rule:** Never simply shrink desktop; adapt structure intentionally for each form factor.  
=============================================================================

---

## 1. Breakpoint Grid Matrix

| Breakpoint Name | Viewport Width | Typical Devices | Navigation Mode | Grid Columns | Content Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile Compact** | `320px - 374px` | iPhone SE, small Androids | Mobile Drawer + Top Header | 1 Column (Stacked) | Full-width cards, compact buttons, zero multi-column tables |
| **Mobile Standard** | `375px - 430px` | iPhone 13/14/15, Pixel, Galaxy | Mobile Drawer + Top Header | 1 Column (Stacked) | Stacked metrics, mobile action sheets, 44px touch targets |
| **Tablet Portrait** | `768px - 834px` | iPad Mini, iPad 10.2, Air | Collapsible Sidebar Drawer | 2 Column Grid | 2-column KPI cards, split preview panels |
| **Tablet Landscape**| `835px - 1023px`| iPad Pro 11, Surface Pro | Slim Icon Sidebar / Drawer | 2-3 Column Grid | 3-column metrics, side-by-side forms |
| **Desktop Base** | `1024px - 1279px`| MacBook Air, 13" Laptops | 260px Persistent Sidebar | 3-4 Column Grid | Full master-detail split in Inbox, full tables |
| **Desktop Wide** | `1280px - 1535px`| 24" Displays, 15" Laptops | Persistent Sidebar + Right Drawer | 4 Column Grid | Full telemetry dashboards, expanded tables |
| **Large Screens** | `1536px - 1920px`| 27" iMac, 4K Ultrawide | Persistent Sidebar | 4 Column (Max 1440px) | Content centered with balanced white space |

---

## 2. Component Transformation Rules Across Breakpoints

### 2.1. Data Tables -> Mobile Responsive Cards
```
Desktop (>= 768px):
+-----------------------------------------------------------------------------------------+
| ORDER ID  | CUSTOMER       | CHANNEL   | PRODUCT            | AMOUNT   | STATUS   | ACTIONS |
| KZ-1049   | Marcus Vance   | WhatsApp  | Linen Overshirt    | $89.00   | Confirmed| [ View ]|
+-----------------------------------------------------------------------------------------+

Mobile (< 768px):
+----------------------------------------------------+
| KZ-1049                          [ Confirmed ]     |
| Marcus Vance • WhatsApp                            |
| Product: Artisan Linen Overshirt (L)               |
| Amount: $89.00                                     |
| [ View Order Details ]      [ Message Customer ]   |
+----------------------------------------------------+
```
- **Rule:** On viewports under `768px`, data tables automatically drop horizontal layout and render as structured, touch-friendly cards with high visual contrast.

### 2.2. Application Shell Navigation
- **Desktop (>= 1024px):**
  - Left navigation: Fixed 260px sidebar (`.app-sidebar`).
  - Main view: `margin-left: 260px; width: calc(100% - 260px)`.
- **Tablet & Mobile (< 1024px):**
  - Left navigation: Off-canvas slide-out drawer with backdrop blur (`z-index: 1050`).
  - Top header: Shows hamburger toggle button (`#mobile-sidebar-toggle`) with 44px touch target.
  - Main view: `margin-left: 0; width: 100%`.

### 2.3. Live Inbox / Messenger Layout
- **Desktop (>= 1024px):**
  - Side-by-side 3-pane layout: Sidebar Threads (280px) | Active Chat Stream (Flex 1) | Customer 360 Context (300px).
- **Mobile (< 768px):**
  - Single-pane view with smooth transitions.
  - Thread list is shown first. Tapping a thread smoothly transitions into the full-screen chat stream with a prominent `< Back to Messages` button in the header.
  - Customer info is accessible via a dedicated top-bar info toggle icon.

### 2.4. Modal Dialogs & Drawers
- **Desktop:** Centered floating card (`max-width: 580px`, `border-radius: 16px`, `box-shadow: var(--shadow-xl)`).
- **Mobile (< 640px):** Transitions to a **Mobile Bottom Sheet**:
  - Anchored to bottom of screen (`inset: auto 0 0 0`).
  - Border radius: `16px 16px 0 0`.
  - Max height: `90dvh` with internal scrollbar.
  - Touch-friendly swipe or drag handle at top.

---

## 3. Mobile Quality & Touch Mandates

1. **Zero Horizontal Overflow:**
   - `overflow-x: hidden` enforced on `html` and `body`.
   - All flex and grid containers must use `min-width: 0` on flex items to prevent text overflow blowouts.
2. **Minimum Touch Target:**
   - All interactive controls (buttons, links, form inputs, table actions, close icons) must meet or exceed **44px x 44px** accessible touch dimensions.
3. **No Clipped Text or Runaways:**
   - Ellipsis truncation (`text-overflow: ellipsis; overflow: hidden; white-space: nowrap`) required for user emails, order items, and URLs on mobile viewports.
4. **Input Zoom Prevention:**
   - All mobile input fields must have a minimum `font-size: 16px` (`1rem`) to prevent iOS Safari from zooming the viewport on focus.
5. **Safe Area Insets:**
   - Navigation bars and bottom action bars must include `padding-bottom: max(1rem, env(safe-area-inset-bottom))` for notched displays (iPhone 12/13/14/15/16).
