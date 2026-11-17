import React from 'react';
import { PricingTiersSection } from '../../components/website/PricingTiersSection';

export function PricingPage({ onNavigate }) {
  return (
    <div style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      <PricingTiersSection onNavigate={onNavigate} hideHeader={true} />
    </div>
  );
}
