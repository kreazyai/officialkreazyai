import React, { useState } from 'react';
import { ShoppingBag, ArrowUpRight, ExternalLink } from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * OrderTable — Recent Orders Table Card
 * Compact, high-density order rows with subtle status pills,
 * clear column alignment, and interactive row click.
 */
export function OrderTable({
  orders = [],
  onSelectOrder,
  onViewAllOrders
}) {
  const defaultOrders = [
    {
      id: '#KA-10482',
      customer: 'Customer #1048',
      customerName: 'Elena Rostova',
      channel: 'instagram',
      amount: '$129.00',
      status: 'processing',
      date: '10 min ago',
      item: 'Minimalist Stoneware Carafe (x2)'
    },
    {
      id: '#KA-10481',
      customer: 'Customer #1047',
      customerName: 'Marcus Vance',
      channel: 'whatsapp',
      amount: '$84.00',
      status: 'confirmed',
      date: '38 min ago',
      item: 'Artisan Linen Overshirt - Olive / L'
    },
    {
      id: '#KA-10480',
      customer: 'Customer #1046',
      customerName: 'Tariq Mansoor',
      channel: 'facebook',
      amount: '$210.00',
      status: 'completed',
      date: '2 hrs ago',
      item: 'Botanical Eau De Parfum (50ml)'
    },
    {
      id: '#KA-10479',
      customer: 'Customer #1045',
      customerName: 'Sarah Jenkins',
      channel: 'whatsapp',
      amount: '$45.00',
      status: 'shipped',
      date: '4 hrs ago',
      item: 'Minimalist Stoneware Carafe'
    },
    {
      id: '#KA-10478',
      customer: 'Customer #1044',
      customerName: 'David Kim',
      channel: 'instagram',
      amount: '$189.00',
      status: 'completed',
      date: 'Yesterday',
      item: 'Heavyweight Cotton Throw & Cardholder'
    }
  ];

  const displayOrders = orders;

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'confirmed':
        return 'olive';
      case 'processing':
        return 'warning';
      case 'shipped':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="card recent-orders-card">
      <div className="card-header-flex">
        <div>
          <div className="chart-title-wrap">
            <h3 className="card-title">Recent Orders</h3>
            <span className="live-telemetry-badge">
              <span className="telemetry-dot"></span>
              Omnichannel
            </span>
          </div>
          <p className="card-subtitle">Real-time social commerce transactions across connected endpoints</p>
        </div>

        <button
          type="button"
          className="btn-header-link"
          onClick={onViewAllOrders}
        >
          View All <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Table Container */}
      <div className="table-responsive-wrapper">
        <table className="operations-table">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Order</th>
              <th style={{ width: '28%' }}>Customer</th>
              <th style={{ width: '18%' }}>Channel</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Amount</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.length > 0 ? (
              displayOrders.map((ord) => (
                <tr
                  key={ord.id}
                  className="clickable-table-row"
                  onClick={() => onSelectOrder && onSelectOrder(ord)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (onSelectOrder) onSelectOrder(ord);
                    }
                  }}
                >
                  <td>
                    <span className="order-id-badge">{ord.id}</span>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-primary">{ord.customer}</span>
                      {ord.customerName && (
                        <span className="customer-sub">{ord.customerName}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <Badge variant={ord.channel.toLowerCase()}>
                      {ord.channel.charAt(0).toUpperCase() + ord.channel.slice(1)}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="order-amount-text">{ord.amount}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Badge variant={getStatusBadgeVariant(ord.status)}>
                      {ord.status.charAt(0).toUpperCase() + ord.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              /* Clean Empty State as requested */
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
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
                      <ShoppingBag size={18} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      No orders recorded yet
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.4 }}>
                      Orders placed autonomously via WhatsApp, Instagram, and Facebook will appear here in real-time.
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
