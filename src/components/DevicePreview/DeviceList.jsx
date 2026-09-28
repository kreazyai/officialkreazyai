import React from 'react';
import { DeviceListItem } from './DeviceListItem';
import { getGroupedDevices } from './deviceConfig';
import { SearchX } from 'lucide-react';

export function DeviceList({ selectedDevice, onSelectDevice, category, query }) {
  const grouped = getGroupedDevices(category, query);
  const groupKeys = Object.keys(grouped);

  if (groupKeys.length === 0) {
    return (
      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: 'var(--olive-700)' }}>
          <SearchX size={20} />
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          No devices found
        </div>
        <p style={{ fontSize: '0.78rem' }}>
          Try searching for "iPhone", "Pixel", "iPad", or select "All".
        </p>
      </div>
    );
  }

  return (
    <div className="device-items-scroll-list">
      {groupKeys.map((catKey) => {
        const group = grouped[catKey];
        return (
          <div key={catKey} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="device-group-header">
              <span>{group.title}</span>
              <span className="device-group-count">{group.devices.length} devices</span>
            </div>

            {group.devices.map((device) => (
              <DeviceListItem
                key={device.id}
                device={device}
                isSelected={selectedDevice?.id === device.id}
                onSelect={onSelectDevice}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
