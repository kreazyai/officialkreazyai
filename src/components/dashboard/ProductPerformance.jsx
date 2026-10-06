import React from 'react';
import { Boxes, ArrowUpRight, TrendingUp } from 'lucide-react';

/**
 * ProductPerformance — Top Products Card
 * Compact product rows with orders, revenue, and growth trend.
 */
export function ProductPerformance({
  products = [],
  onManageProducts
}) {
  return (
    <div className="card product-performance-card">
      <div className="card-header-flex">
        <div>
          <div className="chart-title-wrap">
            <h3 className="card-title">Top Products</h3>
            <span className="infrastructure-badge">Catalog Velocity</span>
          </div>
          <p className="card-subtitle">Fastest moving inventory through autonomous commerce</p>
        </div>

        <button
          type="button"
          className="btn-header-link"
          onClick={onManageProducts}
        >
          Catalog <ArrowUpRight size={14} />
        </button>
      </div>

      <div className="table-responsive-wrapper">
        <table className="operations-table">
          <thead>
            <tr>
              <th style={{ width: '42%' }}>Product</th>
              <th style={{ width: '18%', textAlign: 'center' }}>Orders</th>
              <th style={{ width: '22%', textAlign: 'right' }}>Revenue</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((item) => (
                <tr
                  key={item.id}
                  className="clickable-table-row"
                  onClick={onManageProducts}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onManageProducts) onManageProducts();
                    }
                  }}
                >
                  <td>
                    <div className="product-table-cell">
                      <span className="product-name-primary">{item.name}</span>
                      <span className="product-cat-sub">{item.category}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="product-stat-num">{item.orders}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="product-revenue-text">{item.revenue}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="kpi-trend-pill positive inline-trend">
                      <TrendingUp size={11} />
                      {item.trend}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(143, 164, 90, 0.1)',
                      border: '1px solid rgba(143, 164, 90, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--bright-olive)',
                      marginBottom: '0.25rem'
                    }}>
                      <Boxes size={18} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      No product sales recorded yet
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '340px', lineHeight: 1.4 }}>
                      Publish your catalog and connect Meta channels to track real-time item sales velocity.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
