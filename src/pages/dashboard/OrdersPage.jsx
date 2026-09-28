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
  Bot,
  Boxes,
  Network,
  Sparkles
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { orderService } from '../../services/api';

export function OrdersPage({ user, onOpenConversation, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [previewingDemo, setPreviewingDemo] = useState(isDemo);

  const fetchOrders = async (forceDemo = false) => {
    if (!isDemo && !forceDemo && !previewingDemo) {
      setOrders([]);
      return;
    }
    const data = await orderService.getAll();
    setOrders(data);
  };

  useEffect(() => {
    fetchOrders();
  }, [isDemo]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    await orderService.updateStatus(orderId, newStatus);
    fetchOrders(true);
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
          <p style={{ fontSize: '0.9rem' }}>
            {orders.length > 0 
              ? 'Orders initiated and captured autonomously across WhatsApp, Instagram, and Facebook.'
              : 'Clean social commerce orders log. Incoming customer sales will automatically be recorded here.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant={orders.length > 0 ? 'olive' : 'subtle'}>
            <Bot size={14} /> {orders.length > 0 ? 'AI Order Capture: Active' : 'AI Order Capture: Standby'}
          </Badge>
          {orders.length === 0 && (
            <Button variant="secondary" size="sm" onClick={() => { setPreviewingDemo(true); fetchOrders(true); }} icon={Sparkles}>
              Preview Demo Orders
            </Button>
          )}
        </div>
      </div>

      {orders.length > 0 ? (
        <>
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
                      <td style={{ fontWeight: 700, color: 'var(--bright-olive)' }}>
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
        </>
      ) : (
        /* Clean Empty State for New Users */
        <div style={{
          padding: '3.5rem 2rem',
          border: '1px dashed var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '1.5rem'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(163, 230, 53, 0.1)',
            color: 'var(--bright-olive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <ShoppingBag size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            No social commerce orders yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Your store does not have any orders yet. When customers browse your catalog and check out via WhatsApp, Instagram, or Facebook, autonomous orders will appear here automatically.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="primary" size="md" onClick={() => onNavigateModule ? onNavigateModule('integrations') : null} icon={Network}>
              1. Connect Meta Channels
            </Button>
            <Button variant="secondary" size="md" onClick={() => onNavigateModule ? onNavigateModule('products') : null} icon={Boxes}>
              2. Add Products
            </Button>
            <Button variant="subtle" size="md" onClick={() => { setPreviewingDemo(true); fetchOrders(true); }} icon={Sparkles}>
              ⚡ Preview Demo Orders
            </Button>
          </div>
        </div>
      )}

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

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                {onOpenConversation && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    icon={MessageSquare}
                    onClick={() => {
                      setSelectedOrder(null);
                      onOpenConversation();
                    }}
                  >
                    View Conversation
                  </Button>
                )}
              </div>
            </div>
          )}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Bar Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Channel:</span>{' '}
                <Badge variant={selectedOrder.customer.channel}>{selectedOrder.customer.channel.toUpperCase()}</Badge>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>{' '}
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment:</span>{' '}
                <span className="badge badge-success">{selectedOrder.paymentStatus.toUpperCase()}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Customer Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Name:</strong> {selectedOrder.customer.name}</div>
                <div><strong>Phone / Contact:</strong> {selectedOrder.customer.phone}</div>
                <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</div>
                <div><strong>Order Date:</strong> {selectedOrder.date}</div>
              </div>
            </div>

            {/* Purchased Items List */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ordered Products</h4>
              <div style={{ border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: idx !== selectedOrder.items.length - 1 ? '1px solid var(--border-subtle)' : 'none', fontSize: '0.85rem' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} • Unit: ${item.price.toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      ${(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calculation */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: '1rem' }}>Total Amount:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--bright-olive)' }}>
                  ${selectedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
