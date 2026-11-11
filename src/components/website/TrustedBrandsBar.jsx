import React from 'react';

export function TrustedBrandsBar() {
  return (
    <section className="trusted-brands-strip">
      <div className="container">
        <div className="trusted-brands-grid">
          <div className="trusted-brands-label">
            Trusted by 100+ world's best brand
          </div>

          <div className="trusted-brands-logos">
            {/* eBay */}
            <div className="brand-logo-item">
              <span className="brand-text-logo ebay-logo">
                <span style={{ color: '#E53238' }}>e</span>
                <span style={{ color: '#0064D2' }}>b</span>
                <span style={{ color: '#F5AF02' }}>a</span>
                <span style={{ color: '#86B817' }}>y</span>
              </span>
            </div>

            {/* Expedia */}
            <div className="brand-logo-item">
              <span className="brand-text-logo expedia-logo">
                Expedia
              </span>
            </div>

            {/* DocuSign */}
            <div className="brand-logo-item">
              <span className="brand-text-logo docusign-logo">
                Docu<strong style={{ color: '#0F172A' }}>Sign</strong>
              </span>
            </div>

            {/* Phantom */}
            <div className="brand-logo-item">
              <span className="brand-text-logo phantom-logo">
                Phantom
              </span>
            </div>

            {/* Shopify */}
            <div className="brand-logo-item">
              <span className="brand-text-logo shopify-logo">
                Shopify
              </span>
            </div>

            {/* Meta */}
            <div className="brand-logo-item">
              <span className="brand-text-logo meta-logo">
                ∞ Meta
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
