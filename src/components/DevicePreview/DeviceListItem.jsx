import React from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Tv, 
  Layers, 
  Check 
} from 'lucide-react';

export function DeviceListItem({ device, isSelected, onSelect }) {
  const getDeviceIcon = () => {
    switch (device.type) {
      case 'tablet':
        return <Tablet size={16} />;
      case 'foldable':
        return <Layers size={16} />;
      case 'desktop':
        return <Monitor size={16} />;
      case 'smart-display':
        return <Tv size={16} />;
      case 'phone':
      default:
        return <Smartphone size={16} />;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(device);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`device-card-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(device)}
      onKeyDown={handleKeyDown}
      aria-selected={isSelected}
      aria-label={`${device.name}, ${device.category}, ${device.width} by ${device.height} pixels`}
    >
      <div className="device-item-left">
        <div className="device-item-icon-box" aria-hidden="true">
          {getDeviceIcon()}
        </div>
        <div className="device-item-meta">
          <div className="device-item-title-row">
            <span className="device-item-name">{device.name}</span>
            <span className="device-trigger-tag">{device.manufacturer}</span>
          </div>
          <span className="device-item-desc">
            {device.description || `${device.width} × ${device.height}`}
          </span>
        </div>
      </div>

      <div className="device-item-right">
        <span className="device-item-dims-pill">
          {device.width} × {device.height}
        </span>
        <div className="device-item-check" aria-hidden="true">
          {isSelected && <Check size={16} strokeWidth={2.5} />}
        </div>
      </div>
    </div>
  );
}
