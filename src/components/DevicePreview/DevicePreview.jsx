import React, { useState, useEffect } from 'react';
import { PreviewToolbar } from './PreviewToolbar';
import { DevicePreviewFrame } from './DevicePreviewFrame';
import { CustomViewport } from './CustomViewport';
import { getDeviceById, DEFAULT_DEVICE_ID } from './deviceConfig';

export function DevicePreview({ onClose, initialRoute = 'home' }) {
  // Read initial device & orientation from URL search params if present
  const getInitialDevice = () => {
    const params = new URLSearchParams(window.location.search);
    const devParam = params.get('device') || params.get('preview_device');
    return getDeviceById(devParam || DEFAULT_DEVICE_ID);
  };

  const getInitialOrientation = () => {
    const params = new URLSearchParams(window.location.search);
    const orient = params.get('orientation') || params.get('preview_orientation');
    return orient === 'landscape' ? 'landscape' : 'portrait';
  };

  const [selectedDevice, setSelectedDevice] = useState(getInitialDevice);
  const [orientation, setOrientation] = useState(getInitialOrientation);
  const [scale, setScale] = useState('fit'); // 'fit' | '1' | '0.75' | '0.5'
  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const [customDimensions, setCustomDimensions] = useState(null);
  const [showFrameBezel, setShowFrameBezel] = useState(true);
  const [customModalOpen, setCustomModalOpen] = useState(false);

  // Sync state to URL search parameters for link sharing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedDevice?.id) {
      params.set('preview_device', selectedDevice.id);
    }
    params.set('preview_orientation', orientation);
    params.set('preview_route', currentRoute);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [selectedDevice, orientation, currentRoute]);

  // Keyboard shortcut listener (R to rotate orientation, Esc to exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Rotate when pressing 'r' (unless typing in an input)
      if ((e.key === 'r' || e.key === 'R') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        if (selectedDevice?.category !== 'desktop') {
          setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
        }
      }
      // Esc to exit preview
      if (e.key === 'Escape' && !customModalOpen) {
        if (onClose) onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDevice, customModalOpen, onClose]);

  const handleDeviceChange = (dev) => {
    setSelectedDevice(dev);
    setCustomDimensions(null);
    if (dev.defaultOrientation) {
      setOrientation(dev.defaultOrientation);
    }
  };

  const handleApplyCustom = (w, h) => {
    setCustomDimensions({ width: w, height: h });
    setSelectedDevice({
      id: 'custom-viewport',
      name: `Custom (${w} × ${h})`,
      category: w < 600 ? 'mobile' : w < 1024 ? 'tablets' : 'desktop',
      manufacturer: 'User',
      width: w,
      height: h,
      pixelRatio: 1,
      type: w < 600 ? 'phone' : 'desktop'
    });
  };

  return (
    <div className="device-preview-workspace" role="main" aria-label="Responsive Device Preview Workspace">
      {/* Top Controls Toolbar */}
      <PreviewToolbar
        selectedDevice={selectedDevice}
        onSelectDevice={handleDeviceChange}
        orientation={orientation}
        onToggleOrientation={(mode) => setOrientation(mode)}
        scale={scale}
        onChangeScale={setScale}
        currentRoute={currentRoute}
        onChangeRoute={setCurrentRoute}
        showFrameBezel={showFrameBezel}
        onToggleBezel={() => setShowFrameBezel(!showFrameBezel)}
        onOpenCustomModal={() => setCustomModalOpen(true)}
        onClosePreview={onClose}
      />

      {/* Main Preview Stage Area */}
      <DevicePreviewFrame
        device={selectedDevice}
        orientation={orientation}
        scale={scale}
        customDimensions={customDimensions}
        showFrameBezel={showFrameBezel}
        currentRoute={currentRoute}
      />

      {/* Precision Custom Dimensions Modal */}
      <CustomViewport
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        currentWidth={customDimensions?.width || selectedDevice?.width}
        currentHeight={customDimensions?.height || selectedDevice?.height}
        onApplyCustom={handleApplyCustom}
      />
    </div>
  );
}
