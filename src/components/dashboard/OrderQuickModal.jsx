import React from 'react';
import { X, ShoppingBag, ExternalLink, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

/**
 * OrderQuickModal — Quick interactive modal when clicking a row in Recent Orders
 */
export function OrderQuickModal({ order, onClose, onOpenChat, onNavigateOrders }) {
  if (!order) return null;

  return (
    <div className="order-modal-backdrop" onClick={onClose}>
      <div
        className="order-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="order-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="order-modal-icon-badge">
              <ShoppingBag size={18} color="var(--bright-olive)" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Order {order.id}
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Placed {order.date} via {order.channel.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="order-modal-body">
          <div className="order-modal-summary-grid">
            <div className="summary-box">
              <span className="box-label">Customer</span>
              <strong className="box-val">{order.customerName || order.customer}</strong>
              <small className="box-sub">{order.customer}</small>
            </div>
            <div className="summary-box">
              <span className="box-label">Channel</span>
              <Badge variant={order.channel.toLowerCase()}>
                {order.channel.toUpperCase()}
              </Badge>
            </div>
            <div className="summary-box">
              <span className="box-label">Total Amount</span>
              <strong className="box-val text-bright">{order.amount}</strong>
              <small className="box-sub">Payment Captured</small>
            </div>
            <div className="summary-box">
              <span className="box-label">Fulfillment Status</span>
              <Badge variant="olive">
                {order.status.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="order-modal-item-line">
            <span className="box-label">Ordered Item</span>
            <div className="ordered-item-name">{order.item || 'Artisan Linen Overshirt - Olive / L'}</div>
            <div className="ordered-item-meta">
              Autonomous AI checkout link confirmed with customer address & payment verification.
            </div>
          </div>
        </div>

        <div className="order-modal-footer">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              if (onOpenChat) onOpenChat();
            }}
            icon={MessageSquare}
          >
            View Customer Thread
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              if (onNavigateOrders) onNavigateOrders();
            }}
            icon={ExternalLink}
          >
            Open in Orders Management
          </Button>
        </div>
      </div>
    </div>
  );
}
