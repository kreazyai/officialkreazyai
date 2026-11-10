import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  Eye,
  Plus,
  Sparkles,
  Network,
  CheckCircle2,
  DollarSign,
  ShoppingBag,
  Send
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CustomerProfileDrawer } from '../../components/customer/CustomerProfileDrawer';
import { customerCrmService, conversationService } from '../../services/api';

export function CustomersPage({ user, onOpenMessages, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewingDemo, setPreviewingDemo] = useState(isDemo);

  // Inbound Simulation Modal
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simulateChannel, setSimulateChannel] = useState('whatsapp');
  const [simulateName, setSimulateName] = useState('Sophia Chen');
  const [simulatePhone, setSimulatePhone] = useState('+1 (555) 782-9912');
  const [simulateText, setSimulateText] = useState('Hi there! Do you ship to New York? I want to place an order.');
  const [isSubmittingSim, setIsSubmittingSim] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchCustomers = async (forceDemo = false) => {
    const res = await customerCrmService.getAll(forceDemo || previewingDemo);
    if (res && res.success) {
      setCustomers(res.data || []);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [isDemo, previewingDemo]);

  const handleOpenCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  const handleSimulateInboundMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!simulateName.trim() || !simulateText.trim()) return;

    setIsSubmittingSim(true);
    try {
      await conversationService.receiveIncomingMessage({
        customerName: simulateName.trim(),
        channel: simulateChannel,
        text: simulateText.trim(),
        phone: simulatePhone.trim(),
        email: `${simulateName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`
      });

      setIsSubmittingSim(false);
      setIsSimulateModalOpen(false);
      setNotification(`Inbound message received from "${simulateName}" via ${simulateChannel.toUpperCase()}! Profile created.`);
      setTimeout(() => setNotification(''), 6000);
      await fetchCustomers(true);
    } catch (err) {
      console.error(err);
      setIsSubmittingSim(false);
    }
  };

  // High-level summary stats (Settings page theme)
  const stats = useMemo(() => {
    const total = customers.length;
    const vips = customers.filter(c => c.customer_type === 'VIP').length;
    const totalSpentSum = customers.reduce((sum, c) => sum + Number(c.total_spent || 0), 0);
    const avgSpend = total > 0 ? (totalSpentSum / total).toFixed(2) : '0.00';

    return { total, vips, totalSpentSum: totalSpentSum.toFixed(2), avgSpend };
  }, [customers]);

  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchesTab =
        filterTab === 'all' ||
        (filterTab === 'vip' && c.customer_type === 'VIP') ||
        (filterTab === 'active' && c.customer_type !== 'VIP');

      const q = search.trim().toLowerCase();
      if (!q) return matchesTab;

      const matchesQuery =
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q);

      return matchesTab && matchesQuery;
    });
  }, [customers, filterTab, search]);

  const getChannelBadge = (ch) => {
    const channel = (ch || 'DIRECT').toLowerCase();
    let variant = 'default';
    if (channel === 'whatsapp') variant = 'whatsapp';
    else if (channel === 'instagram') variant = 'instagram';
    else if (channel === 'facebook') variant = 'facebook';

    return (
      <Badge variant={variant} style={{ textTransform: 'capitalize' }}>
        {channel}
      </Badge>
    );
  };

  return (
    <div className="dashboard-content">
      {/* Toast notification */}
      {notification && (
        <div style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(143, 166, 83, 0.12)',
          border: '1px solid rgba(143, 166, 83, 0.3)',
          borderRadius: '12px',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--text-primary)'
        }}>
          <CheckCircle2 size={16} color="var(--bright-olive)" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header — clean & simplified */}
      <div className="page-title-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Customers</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
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

      {customers.length > 0 ? (
        <>
          {/* Quick-glance Stat Cards (Settings-style design) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Customers
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
                  <Users size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Captured across all channels
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Lifetime Spend
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                ${stats.totalSpentSum}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--bright-olive)', marginTop: '0.4rem' }}>
                Autonomous social commerce
              </div>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Avg. Spend / Customer
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(143, 166, 83, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bright-olive)' }}>
                  <ShoppingBag size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                ${stats.avgSpend}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                Average customer lifetime value
              </div>
            </div>
          </div>

          {/* Clean Toolbar: Filter tabs + Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <div className="capsule-filter-group">
              {[
                { key: 'all', label: 'All', count: customers.length },
                { key: 'vip', label: 'VIP Shoppers', count: stats.vips },
                { key: 'active', label: 'Active', count: customers.length - stats.vips }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  className={`capsule-filter-btn ${filterTab === tab.key ? 'active' : ''}`}
                  onClick={() => setFilterTab(tab.key)}
                >
                  <span>{tab.label}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    backgroundColor: filterTab === tab.key ? 'rgba(189, 211, 148, 0.25)' : 'rgba(255,255,255,0.08)',
                    color: filterTab === tab.key ? 'var(--primary-accent)' : 'inherit'
                  }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.825rem' }}
                placeholder="Search name, phone, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Simplified Table wrapped in Smoked-Glass container */}
          <div style={{
            background: 'var(--bg-card)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-card)',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch'
          }} className="table-container">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Channel</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Tier</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map(c => (
                    <tr key={c.id}>
                      {/* Customer Avatar & Name */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={c.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name || 'Customer')}&background=202A20&color=8FA653`}
                            alt={c.full_name}
                            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                              {c.full_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {c.email || c.phone || 'Direct customer'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Preferred Channel */}
                      <td>
                        {getChannelBadge(c.preferred_channel)}
                      </td>

                      {/* Total Orders */}
                      <td style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {c.total_orders || 0} {c.total_orders === 1 ? 'order' : 'orders'}
                      </td>

                      {/* Spend */}
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--bright-olive)', fontSize: '0.95rem' }}>
                          ${(Number(c.total_spent || 0)).toFixed(2)}
                        </span>
                      </td>

                      {/* Tier */}
                      <td>
                        <span className={`badge ${c.customer_type === 'VIP' ? 'badge-olive' : 'badge-default'}`}>
                          {c.customer_type || 'Standard'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenCustomer(c)}
                            icon={Eye}
                          >
                            Profile
                          </Button>
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={onOpenMessages}
                            icon={MessageSquare}
                          >
                            Chat
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No customers match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* CLEAN, SIMPLIFIED EMPTY STATE (Settings Page Theme) */
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: '16px',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '620px',
          margin: '2rem auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(143, 166, 83, 0.12)',
            border: '1px solid rgba(143, 166, 83, 0.3)',
            boxShadow: '0 0 24px rgba(143, 166, 83, 0.18)',
            color: 'var(--bright-olive)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem'
          }}>
            <Users size={28} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            No customers yet
          </h3>
        </div>
      )}

      {/* Customer 360 Slide-in Drawer */}
      <CustomerProfileDrawer
        customer={selectedCustomer}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRefresh={() => fetchCustomers(true)}
      />

      {/* Inbound Message Simulation Modal (Settings-styled) */}
      {isSimulateModalOpen && (
        <Modal
          isOpen={isSimulateModalOpen}
          onClose={() => setIsSimulateModalOpen(false)}
          title="Simulate Inbound Customer Message"
          maxWidth="520px"
          footer={(
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
              <Button variant="secondary" size="sm" onClick={() => setIsSimulateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                onClick={handleSimulateInboundMessage}
                disabled={isSubmittingSim}
              >
                {isSubmittingSim ? 'Receiving...' : 'Send Test Message'}
              </Button>
            </div>
          )}
        >
          <form onSubmit={handleSimulateInboundMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Channel
              </label>
              <select
                className="form-select"
                value={simulateChannel}
                onChange={(e) => setSimulateChannel(e.target.value)}
              >
                <option value="whatsapp">WhatsApp Cloud API</option>
                <option value="instagram">Instagram Direct</option>
                <option value="facebook">Facebook Messenger</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Customer Name
              </label>
              <input
                type="text"
                className="form-input"
                value={simulateName}
                onChange={(e) => setSimulateName(e.target.value)}
                placeholder="e.g. Sophia Chen"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Phone / Handle
              </label>
              <input
                type="text"
                className="form-input"
                value={simulatePhone}
                onChange={(e) => setSimulatePhone(e.target.value)}
                placeholder="e.g. +1 (555) 782-9912"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Inquiry Message
              </label>
              <textarea
                className="form-input"
                style={{ height: '70px', resize: 'vertical' }}
                value={simulateText}
                onChange={(e) => setSimulateText(e.target.value)}
                placeholder="What is the customer asking about?"
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
