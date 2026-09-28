import React from 'react';
import { Smartphone } from 'lucide-react';

export function FloatingPreviewLauncher({ onClick }) {
  return (
    <button
      type="button"
      className="floating-preview-launcher"
      onClick={onClick}
      aria-label="Open responsive device preview system"
      title="Preview Kreazy AI across Mobile, Tablet, Foldable, and Desktop devices"
    >
      <span className="launcher-dot" aria-hidden="true"></span>
      <Smartphone size={15} />
      <span>Device Preview</span>
    </button>
  );
}
