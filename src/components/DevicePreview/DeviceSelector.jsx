import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Tv, 
  Layers, 
  X, 
  Sliders
} from 'lucide-react';
import { DeviceSearch } from './DeviceSearch';
import { DeviceCategoryTabs } from './DeviceCategoryTabs';
import { DeviceList } from './DeviceList';
import { DEVICES } from './deviceConfig';

export function DeviceSelector({ 
  selectedDevice, 
  onSelectDevice, 
  orientation, 
  onOpenCustomModal 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 860);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 860);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target) && !isMobileScreen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobileScreen]);

  useEffect(() => {
    if (isOpen && isMobileScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobileScreen]);

  const handleDeviceChosen = (device) => {
    onSelectDevice(device);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getDeviceIcon = () => {
    switch (selectedDevice?.type) {
      case 'tablet': return <Tablet size={16} />;
      case 'foldable': return <Layers size={16} />;
      case 'desktop': return <Monitor size={16} />;
      case 'smart-display': return <Tv size={16} />;
      case 'phone':
      default: return <Smartphone size={16} />;
    }
  };

  const widthDisplay = orientation === 'landscape' && selectedDevice?.category !== 'desktop'
    ? selectedDevice?.height 
    : selectedDevice?.width;
  const heightDisplay = orientation === 'landscape' && selectedDevice?.category !== 'desktop'
    ? selectedDevice?.width 
    : selectedDevice?.height;

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`device-selector-trigger ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Current device: ${selectedDevice?.name}. Click to change device.`}
      >
        <div className="device-trigger-icon" aria-hidden="true">
          {getDeviceIcon()}
        </div>

        <div className="device-trigger-info">
          <span className="device-trigger-name">{selectedDevice?.name || 'iPhone 16 Pro Max'}</span>
          <span className="device-trigger-dims">
            {widthDisplay} × {heightDisplay}
          </span>
          <span className="device-trigger-tag">
            {selectedDevice?.category}
          </span>
        </div>

        <ChevronDown 
          size={15} 
          color="var(--text-muted)" 
          style={{ 
            transition: 'transform var(--transition-fast)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: 'auto'
          }} 
        />
      </button>

      {/* -------------------------------------------------------------
          1. DESKTOP POPOVER DROPDOWN (>= 860px)
          ------------------------------------------------------------- */}
      {isOpen && !isMobileScreen && (
        <div className="device-popover-dropdown" role="dialog" aria-label="Device Selector">
          {/* Search Bar */}
          <DeviceSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search devices..."
          />

          {/* Category Tabs */}
          <DeviceCategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Devices List */}
          <DeviceList
            selectedDevice={selectedDevice}
            onSelectDevice={handleDeviceChosen}
            category={activeCategory}
            query={searchQuery}
          />

          {/* Popover Footer: Custom Dimensions Trigger */}
          <div style={{ padding: '0.6rem 0.85rem', backgroundColor: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              {DEVICES.length} verified devices
            </span>
            <button
              type="button"
              className="btn btn-sm btn-subtle"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              onClick={() => {
                setIsOpen(false);
                if (onOpenCustomModal) onOpenCustomModal();
              }}
            >
              <Sliders size={12} /> Custom Size
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          2. MOBILE TOUCH-FRIENDLY BOTTOM SHEET (< 860px)
          ------------------------------------------------------------- */}
      {isOpen && isMobileScreen && (
        <div 
          className="mobile-bottom-sheet-overlay"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div 
            className="mobile-bottom-sheet"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Select Device for Preview"
          >
            {/* Drag Handle Indicator */}
            <div className="sheet-drag-handle-wrap">
              <div className="sheet-drag-handle"></div>
            </div>

            {/* Sticky Sheet Header */}
            <div className="sheet-header">
              <div>
                <h3 className="sheet-title">Select Device</h3>
                <span className="sheet-device-count">{DEVICES.length} devices</span>
              </div>
              <button
                type="button"
                className="btn btn-icon btn-ghost"
                onClick={() => setIsOpen(false)}
                aria-label="Close device selector"
                style={{ width: '40px', height: '40px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search Bar */}
            <DeviceSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search devices..."
            />

            {/* Mobile Horizontal Category Chips */}
            <DeviceCategoryTabs
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />

            {/* Scrollable Device Items */}
            <div style={{ flexGrow: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <DeviceList
                selectedDevice={selectedDevice}
                onSelectDevice={handleDeviceChosen}
                category={activeCategory}
                query={searchQuery}
              />
            </div>

            {/* Sheet Footer with Custom Viewport Action */}
            <div style={{ padding: '0.75rem var(--space-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenCustomModal) onOpenCustomModal();
                }}
              >
                <Sliders size={16} /> Enter Custom Width & Height
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
