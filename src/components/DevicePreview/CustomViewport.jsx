import React, { useState } from 'react';
import { Link2, Link2Off, RotateCcw, Check, Sliders } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function CustomViewport({ isOpen, onClose, currentWidth, currentHeight, onApplyCustom }) {
  const [width, setWidth] = useState(currentWidth || 390);
  const [height, setHeight] = useState(currentHeight || 844);
  const [lockRatio, setLockRatio] = useState(false);
  const [ratio, setRatio] = useState((currentWidth || 390) / (currentHeight || 844));

  const handleWidthChange = (val) => {
    const num = Math.max(280, Math.min(3840, parseInt(val, 10) || 0));
    setWidth(num);
    if (lockRatio && ratio) {
      setHeight(Math.round(num / ratio));
    }
  };

  const handleHeightChange = (val) => {
    const num = Math.max(300, Math.min(2560, parseInt(val, 10) || 0));
    setHeight(num);
    if (lockRatio && ratio) {
      setWidth(Math.round(num * ratio));
    }
  };

  const handleToggleRatio = () => {
    if (!lockRatio) {
      setRatio(width / height);
    }
    setLockRatio(!lockRatio);
  };

  const handlePreset = (w, h) => {
    setWidth(w);
    setHeight(h);
    if (lockRatio) {
      setRatio(w / h);
    }
  };

  const handleReset = () => {
    setWidth(393);
    setHeight(852);
    setLockRatio(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyCustom(width, height);
    onClose();
  };

  const presets = [
    { label: '375 × 667 (SE)', w: 375, h: 667 },
    { label: '393 × 852 (iP16)', w: 393, h: 852 },
    { label: '440 × 956 (Pro Max)', w: 440, h: 956 },
    { label: '768 × 1024 (iPad)', w: 768, h: 1024 },
    { label: '1280 × 800 (Laptop)', w: 1280, h: 800 },
    { label: '1440 × 900 (Desktop)', w: 1440, h: 900 }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Custom Responsive Size"
      size="md"
    >
      <form onSubmit={handleSubmit} className="custom-viewport-form">
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Manually enter exact pixel width and height to test unique viewport breakpoints.
        </p>

        {/* Inputs */}
        <div className="custom-inputs-row">
          <div className="custom-input-box">
            <label htmlFor="custom-width-input">Width (px)</label>
            <input
              id="custom-width-input"
              type="number"
              min="280"
              max="3840"
              className="form-input"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={`custom-link-aspect-btn ${lockRatio ? 'active' : ''}`}
            onClick={handleToggleRatio}
            title={lockRatio ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
            aria-label="Toggle aspect ratio lock"
          >
            {lockRatio ? <Link2 size={16} /> : <Link2Off size={16} />}
          </button>

          <div className="custom-input-box">
            <label htmlFor="custom-height-input">Height (px)</label>
            <input
              id="custom-height-input"
              type="number"
              min="300"
              max="2560"
              className="form-input"
              value={height}
              onChange={(e) => handleHeightChange(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Common Screen Sizes
          </label>
          <div className="custom-presets-grid">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-chip-btn"
                onClick={() => handlePreset(p.w, p.h)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            icon={RotateCcw}
          >
            Reset
          </Button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" icon={Check}>
              Apply
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
