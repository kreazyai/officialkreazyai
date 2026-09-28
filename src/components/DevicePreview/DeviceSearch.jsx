import React from 'react';
import { Search, X } from 'lucide-react';

export function DeviceSearch({ value, onChange, placeholder = "Search devices..." }) {
  return (
    <div className="device-popover-search">
      <Search size={15} className="device-search-icon" aria-hidden="true" />
      <input
        type="text"
        className="device-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Filter devices"
      />
      {value && (
        <button
          type="button"
          className="device-search-clear"
          onClick={() => onChange('')}
          aria-label="Clear search query"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
