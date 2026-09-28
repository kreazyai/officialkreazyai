import React from 'react';
import { Smartphone } from 'lucide-react';

export function OrientationToggle({ orientation, onChange, disabled = false }) {
  return (
    <div className="orientation-pill-group" role="group" aria-label="Device orientation">
      <button
        type="button"
        disabled={disabled}
        className={`orientation-btn ${orientation === 'portrait' ? 'active' : ''}`}
        onClick={() => onChange('portrait')}
        title="Portrait Orientation"
        aria-pressed={orientation === 'portrait'}
      >
        <Smartphone size={14} />
        <span>Portrait</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        className={`orientation-btn ${orientation === 'landscape' ? 'active' : ''}`}
        onClick={() => onChange('landscape')}
        title="Landscape Orientation"
        aria-pressed={orientation === 'landscape'}
      >
        <Smartphone size={14} style={{ transform: 'rotate(90deg)' }} />
        <span>Landscape</span>
      </button>
    </div>
  );
}
