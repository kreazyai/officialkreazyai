import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle, 
  MessageSquare, 
  ExternalLink,
  Bot
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { orderService } from '../../services/api';

export function OrdersPage({ onOpenConversation }) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    const data = await orderService.getAll();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    await orderService.updateStatus(orderId, newStatus);
    fetchOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items[0]?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge variant="success">Confirmed</Badge>;
      case 'processing': return <Badge variant="warning">Processing</Badge>;
      case 'shipped': return <Badge variant="info">Shipped</Badge>;
      case 'delivered': return <Badge variant="olive">Delivered</Badge>;
      case 'cancelled': return <Badge variant="error">Cancelled</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-title-row">
        <div>
          <h2>Social Commerce Orders</h2>
          <p style={{ fontSize: '0.9rem' }}>Orders initiated and captured autonomously across WhatsApp, Instagram, and Facebook.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Badge variant="olive">
            <Bot size={14} /> AI Order Capture: Active
          </Badge>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="smooth-scroll-x" style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {['all', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                style={{ flexShrink: 0 }}
                onClick={() => setStatusFilter(st)}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.825rem' }}
              placeholder="Search by order ID or buyer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Order Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Channel</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td className="mono" style={{ fontWeight: 700 }}>{order.id}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.date}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer.phone}</div>
                  </td>
                  <td>
                    <Badge variant={order.customer.channel === 'whatsapp' ? 'whatsapp' : order.customer.channel === 'instagram' ? 'instagram' : 'facebook'}>
                      {order.customer.channel}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.items[0]?.name}</div>
                    {order.items.length > 1 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{order.items.length - 1} more items</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--olive-950)' }}>
                    ${order.totalAmount.toFixed(2)}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <span className="badge badge-success">{order.paymentStatus.toUpperCase()}</span>
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      icon={Eye}
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                  No orders found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ORDER DETAIL MODAL / DRAWER */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id} Details`}
          maxWidth="640px"
          footer={(
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Update Status:</span>
                <select
                  className="form-select"
                  style={{ width: '140px', padding: '0.3rem 0.6rem', fontSize: '0.825rem' }}
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          )}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <strong>Customer:</strong> {selectedOrder.customer.name} ({selectedOrder.customer.email})
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone: {selectedOrder.customer.phone}</div>
              </div>
              <div>
                {getStatusBadge(selectedOrder.status)}
              </div>
            </div>

            {/* Line items */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Ordered Products</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                    <div>
                      <strong>{it.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Variant: {it.variant} • Qty: {it.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      ${(it.price * it.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.5rem', fontWeight: 800, fontSize: '1.05rem', color: 'var(--olive-950)' }}>
                Total: ${selectedOrder.totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Shipping & Payment info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.75rem', backgroundColor: '#fafbf9', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>SHIPPING DESTINATION</div>
                <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{selectedOrder.shippingAddress}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--olive-700)', marginTop: '4px' }}>Tracking: {selectedOrder.trackingNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>PAYMENT GATEWAY</div>
                <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{selectedOrder.paymentMethod}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--status-success-text)', marginTop: '4px' }}>Status: {selectedOrder.paymentStatus.toUpperCase()}</div>
              </div>
            </div>

            {/* AI Notes */}
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--olive-50)', border: '1px solid var(--olive-100)', borderRadius: '8px', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--olive-950)', marginBottom: '2px' }}>
                <Bot size={14} /> AI Processing Timeline
              </div>
              {selectedOrder.aiNotes}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
