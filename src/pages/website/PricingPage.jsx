import React from 'react';
import { PricingTiersSection } from '../../components/website/PricingTiersSection';

export function PricingPage({ onNavigate }) {
  return (
    <div style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      <PricingTiersSection 
        onNavigate={onNavigate}
        title="Simple pricing that pays for itself in captured sales"
        subtitle="Choose the plan that fits your growth. Upgrade or adjust anytime as your message volume and team scale."
      />
    </div>
  );
}

