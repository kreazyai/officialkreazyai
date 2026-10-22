import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  MessageSquare,
  Sparkles,
  Network,
  Boxes,
  TrendingUp,
  LayoutGrid,
  List,
  DollarSign
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
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const fetchOrders = async (forceDemo = false) => {
    const data = await orderService.getAll(forceDemo || previewingDemo);
    setOrders(data || []);
  };

  useEffect(() => {
    fetchOrders();
  }, [isDemo, previewingDemo]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    await orderService.updateStatus(orderId, newStatus);
    fetchOrders(true);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
  };

  // High-level summary metrics for instant glance ("easy to watch")
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const totalRevenue = orders.reduce((acc, o) => {
      const val = Number(o.totalAmount ?? o.total ?? 0);
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    const activeCount = orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;

    return { totalCount, totalRevenue, activeCount, deliveredCount };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const custName = (typeof o.customer === 'object' ? o.customer?.name : o.customer) || o.customer_name || '';
      const itemFirst = (o.items && o.items[0]?.name) || (o.items && o.items[0]?.product_name) || '';
      const query = searchQuery.trim().toLowerCase();

      if (!query) return matchesStatus;

      const matchesSearch =
        o.id?.toLowerCase().includes(query) ||
        custName.toLowerCase().includes(query) ||
        itemFirst.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

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

  const getChannelBadge = (order) => {
    const ch = (order.customer?.channel || order.channel || 'direct').toLowerCase();
    let variant = 'default';
    if (ch === 'whatsapp') variant = 'whatsapp';
    else if (ch === 'instagram') variant = 'instagram';
    else if (ch === 'facebook') variant = 'facebook';

    return (
      <Badge variant={variant} style={{ textTransform: 'capitalize' }}>
        {ch}
      </Badge>
    );
  };

  return (
    <div className="dashboard-content">
      {/* Crisp, simplified header */}
      <div className="page-title-row" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2>Orders</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Autonomous sales captured across WhatsApp, Instagram & Facebook.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {previewingDemo && !isDemo && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setPreviewingDemo(false)}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
            >
              Exit Demo
            </button>
          )}
        </div>
      </div>

      {orders.length > 0 ? (
        <>
          {/* Quick-glance Stat Strip - Minimal and easy to watch */}
          <div className="orders-stat-strip">
            <div className="orders-stat-card">
              <div>
                <div className="orders-stat-label">Total Orders</div>
                <div className="orders-stat-value">{metrics.totalCount}</div>
              </div>
              <div className="orders-stat-icon">
                <ShoppingBag size={20} />
              </div>
            </div>

            <div className="orders-stat-card">
              <div>
                <div className="orders-stat-label">Total Revenue</div>
                <div className="orders-stat-value">${metrics.totalRevenue.toFixed(2)}</div>
              </div>
              <div className="orders-stat-icon">
                <DollarSign size={20} />
              </div>
            </div>

            <div className="orders-stat-card">
              <div>
                <div className="orders-stat-label">In Progress</div>
                <div className="orders-stat-value">{metrics.activeCount}</div>
              </div>
              <div className="orders-stat-icon">
                <Clock size={20} />
              </div>
            </div>

            <div className="orders-stat-card">
              <div>
                <div className="orders-stat-label">Delivered</div>
                <div className="orders-stat-value">{metrics.deliveredCount}</div>
              </div>
              <div className="orders-stat-icon">
                <Truck size={20} />
              </div>
            </div>
          </div>

          {/* Simplified Toolbar: Clean Filter Tabs + Search + View Switch */}
          <div className="orders-toolbar">
            <div className="orders-filter-group">
              {[
                { key: 'all', label: 'All', count: orders.length },
                { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
                { key: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
                { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
                { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  className={`orders-filter-tab ${statusFilter === tab.key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(tab.key)}
                >
                  <span>{tab.label}</span>
                  <span className="orders-filter-count">{tab.count}</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.825rem' }}
                  placeholder="Search order or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="orders-view-switch">
                <button
                  type="button"
                  className={`orders-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table View"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  className={`orders-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="Card View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE: TABLE (Simplified, spacious 6-column layout) */}
          {viewMode === 'table' ? (
            <div className="table-container" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => {
                      const custName = order.customer?.name || order.customer_name || 'Direct Shopper';
                      const firstItem = (order.items && order.items[0]?.name) || (order.items && order.items[0]?.product_name) || 'Store Item';
                      const moreItems = order.items && order.items.length > 1 ? order.items.length - 1 : 0;
                      const orderTotal = Number(order.totalAmount ?? order.total ?? 0);

                      return (
                        <tr key={order.id}>
                          {/* Order ID & Time */}
                          <td>
                            <div className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              #{order.id}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {order.date || order.createdAt || 'Recent'}
                            </div>
                          </td>

                          {/* Customer & Channel */}
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                              {custName}
                            </div>
                            <div>{getChannelBadge(order)}</div>
                          </td>

                          {/* Items summary */}
                          <td>
                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {firstItem}
                            </div>
                            {moreItems > 0 && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--bright-olive)', marginTop: '2px' }}>
                                +{moreItems} more {moreItems === 1 ? 'item' : 'items'}
                              </div>
                            )}
                          </td>

                          {/* Price */}
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--bright-olive)', fontSize: '0.95rem' }}>
                              ${orderTotal.toFixed(2)}
                            </div>
                          </td>

                          {/* Status */}
                          <td>{getStatusBadge(order.status)}</td>

                          {/* Action */}
                          <td style={{ textAlign: 'right' }}>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              icon={Eye}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* VIEW MODE: CARDS (Clean glanceable cards) */
            <div className="orders-card-grid">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const custName = order.customer?.name || order.customer_name || 'Direct Shopper';
                  const firstItem = (order.items && order.items[0]?.name) || (order.items && order.items[0]?.product_name) || 'Store Item';
                  const moreItems = order.items && order.items.length > 1 ? order.items.length - 1 : 0;
                  const orderTotal = Number(order.totalAmount ?? order.total ?? 0);

                  return (
                    <div
                      key={order.id}
                      className="orders-card-item"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            #{order.id}
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {order.date || order.createdAt || 'Recent'}
                          </div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '0.65rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{custName}</span>
                          {getChannelBadge(order)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {firstItem} {moreItems > 0 && <span style={{ color: 'var(--bright-olive)' }}>(+{moreItems})</span>}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount</span>
                          <div style={{ fontWeight: 700, color: 'var(--bright-olive)', fontSize: '1.05rem' }}>
                            ${orderTotal.toFixed(2)}
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" icon={Eye}>
                          Details
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No orders match your filter criteria.
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* CLEAN, SIMPLIFIED EMPTY STATE */
        <div className="orders-empty-box">
          <div className="orders-empty-glow-icon">
            <ShoppingBag size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            No orders yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.5, margin: 0 }}>
            Orders placed via WhatsApp, Instagram, or Facebook will show up here automatically.
          </p>
        </div>
      )}

      {/* CLEAN ORDER DETAIL MODAL */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id}`}
          maxWidth="560px"
          footer={(
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                <select
                  className="form-select"
                  style={{ width: '130px', padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
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
                    Chat
                  </Button>
                )}
              </div>
            </div>
          )}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Quick summary bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-canvas-alt)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '6px' }}>Channel:</span>
                {getChannelBadge(selectedOrder)}
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '6px' }}>Status:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedOrder.date || selectedOrder.createdAt || 'Recent'}
              </div>
            </div>

            {/* Customer Details */}
            <div style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Customer Details
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{selectedOrder.customer?.name || selectedOrder.customer_name || 'Customer'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedOrder.customer?.phone || selectedOrder.customer_phone || selectedOrder.customer?.email || 'No phone'}</div>
                </div>
                {selectedOrder.shippingAddress && (
                  <div style={{ maxWidth: '240px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                    {selectedOrder.shippingAddress}
                  </div>
                )}
              </div>
            </div>

            {/* Purchased Items List */}
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Purchased Items
              </div>
              <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderBottom: idx !== ((selectedOrder.items?.length || 0) - 1) ? '1px solid var(--border-subtle)' : 'none',
                      fontSize: '0.85rem',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name || item.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity || 1} {item.variant ? `• ${item.variant}` : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${(Number(item.quantity || 1) * Number(item.price || item.unit_price || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Amount */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Amount</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--bright-olive)' }}>
                ${(Number(selectedOrder.totalAmount ?? selectedOrder.total ?? 0)).toFixed(2)}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
