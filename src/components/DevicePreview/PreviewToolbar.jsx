import React from 'react';
import { 
  ArrowLeft, 
  Smartphone, 
  Sliders, 
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { DeviceSelector } from './DeviceSelector';
import { OrientationToggle } from './OrientationToggle';
import { DEVICE_CATEGORIES, DEVICES } from './deviceConfig';

export function PreviewToolbar({
  selectedDevice,
  onSelectDevice,
  orientation,
  onToggleOrientation,
  scale,
  onChangeScale,
  currentRoute,
  onChangeRoute,
  showFrameBezel,
  onToggleBezel,
  onOpenCustomModal,
  onClosePreview
}) {
  const routes = [
    { id: 'home', label: 'Landing Page' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'book-demo', label: 'Book Demo' },
    { id: 'about', label: 'About Us' },
    { id: 'faq', label: 'FAQ' },
    { id: 'onboarding', label: 'Merchant Onboarding' },
    { id: 'login', label: 'Login' }
  ];

  const isDesktopCategory = selectedDevice?.category === 'desktop';

  // Quick category selection shortcuts
  const handleQuickCategorySelect = (categoryId) => {
    if (categoryId === 'all') return;
    const firstInCat = DEVICES.find(d => d.category === categoryId);
    if (firstInCat) {
      onSelectDevice(firstInCat);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flexShrink: 0, zIndex: 2010 }}>
      {/* Primary Toolbar Row */}
      <header className="preview-toolbar" role="toolbar" aria-label="Device preview controls">
        {/* LEFT: BRAND & EXIT BUTTON */}
        <div className="preview-toolbar-left">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={onClosePreview}
            title="Exit Device Preview and return to live website"
            style={{ gap: '0.4rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} />
            <span>Exit Preview</span>
          </button>

          <div className="preview-brand-badge" onClick={onClosePreview}>
            <div className="brand-icon">
              <span>K</span>
            </div>
            <span className="preview-brand-title">
              Kreazy<span style={{ color: 'var(--olive-600)' }}>AI</span>
            </span>
            <span className="preview-badge-pill">Device Preview</span>
          </div>
        </div>

        {/* CENTER: DEVICE SELECTOR & ORIENTATION */}
        <div className="preview-toolbar-center">
          <DeviceSelector
            selectedDevice={selectedDevice}
            onSelectDevice={onSelectDevice}
            orientation={orientation}
            onOpenCustomModal={onOpenCustomModal}
          />

          {/* Orientation Toggle (Portrait/Landscape) */}
          <OrientationToggle
            orientation={orientation}
            onChange={onToggleOrientation}
            disabled={isDesktopCategory}
          />

          {/* Zoom / Scale Selector */}
          <div className="scale-selector-wrap" title="Preview Zoom / Scale">
            <select 
              value={scale} 
              onChange={(e) => onChangeScale(e.target.value)}
              aria-label="Viewport scale percentage"
            >
              <option value="fit">Fit to Screen</option>
              <option value="1">100%</option>
              <option value="0.75">75%</option>
              <option value="0.5">50%</option>
            </select>
          </div>
        </div>

        {/* RIGHT: ROUTE SELECTOR & HARDWARE BEZEL TOGGLE */}
        <div className="preview-toolbar-right">
          {/* Page Route Selector */}
          <div className="route-selector-wrap" title="Select website page to preview">
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Page:</span>
            <select
              className="route-selector-select"
              value={currentRoute}
              onChange={(e) => onChangeRoute(e.target.value)}
              aria-label="Preview page"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Custom Size Modal Button */}
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={onOpenCustomModal}
            title="Custom width & height"
          >
            <Sliders size={14} />
            <span style={{ display: 'none' }} className="desktop-user-info">Custom</span>
          </button>

          {/* Hardware Bezel Toggle */}
          <button
            type="button"
            className={`btn btn-sm ${showFrameBezel ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={onToggleBezel}
            title={showFrameBezel ? 'Hide Hardware Bezel' : 'Show Hardware Bezel'}
            style={{ fontSize: '0.78rem' }}
          >
            <Smartphone size={14} />
            <span style={{ display: 'none' }} className="desktop-user-info">Bezel</span>
          </button>
        </div>
      </header>

      {/* Secondary Category Navigation Strip (Desktop and Mobile scrollable) */}
      <div 
        style={{ 
          backgroundColor: '#fafbf9', 
          borderBottom: '1px solid var(--border-medium)', 
          padding: '0.4rem var(--space-5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '0.5rem',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '0.35rem' }}>
            Categories:
          </span>
          {DEVICE_CATEGORIES.map(cat => {
            const isActive = selectedDevice?.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`device-chip-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleQuickCategorySelect(cat.id)}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span className="status-dot active" style={{ width: '6px', height: '6px' }}></span>
            Active Viewport: <strong style={{ color: 'var(--olive-950)' }}>{selectedDevice?.name}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
