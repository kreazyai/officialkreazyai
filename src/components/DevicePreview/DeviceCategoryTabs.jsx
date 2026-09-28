import React from 'react';
import { DEVICE_CATEGORIES } from './deviceConfig';

export function DeviceCategoryTabs({ activeCategory, onSelectCategory }) {
  return (
    <div className="device-category-chips" role="tablist" aria-label="Device categories">
      {DEVICE_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`device-chip-btn ${isActive ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
