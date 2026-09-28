import React, { useState, useEffect } from 'react';
import { Users, Search, MessageSquare, ShoppingBag, Tag, ExternalLink, Eye, Plus, ShieldCheck, Network, Sparkles } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CustomerProfileDrawer } from '../../components/customer/CustomerProfileDrawer';
import { customerCrmService } from '../../services/api';

export function CustomersPage({ user, onOpenMessages, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewingDemo, setPreviewingDemo] = useState(isDemo);

  const fetchCustomers = async (forceDemo = false) => {
    const res = await customerCrmService.getAll(forceDemo || previewingDemo);
    if (res.success) {
      setCustomers(res.data);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [isDemo, previewingDemo]);

  const handleOpenCustomer = (customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  const filtered = customers.filter(c => 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-content">
      <div className="page-title-row">
        <div>
          <h2>Customer Directory & Cross-Channel 360 CRM</h2>
          <p style={{ fontSize: '0.9rem' }}>
            {customers.length > 0 
              ? 'Aggregated shopper identities, multi-endpoint contacts, spend records, and behavioral tags.'
              : 'Clean customer CRM directory. Shopper profiles will automatically be aggregated as they message or purchase.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {previewingDemo && !isDemo && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => setPreviewingDemo(false)}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
            >
              Exit Demo Preview
            </button>
          )}
          {customers.length > 0 && (
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.825rem' }}
                placeholder="Search customer by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {customers.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Channel Origin</th>
                <th>Status / Tier</th>
                <th>Total Orders</th>
                <th>Lifetime Spend</th>
                <th>Average Order</th>
                <th>Segments & Tags</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={c.profile_image}
                        alt={c.full_name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={c.preferred_channel === 'WHATSAPP' ? 'whatsapp' : 'instagram'}>
                      {c.preferred_channel}
                    </Badge>
                  </td>
                  <td>
                    <span className={`badge ${c.customer_type === 'VIP' ? 'badge-olive' : 'badge-default'}`}>
                      {c.customer_type}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.total_orders} orders</td>
                  <td style={{ fontWeight: 700, color: 'var(--bright-olive)' }}>
                    ${c.total_spent?.toFixed(2)}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    ${c.average_order_value?.toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {c.tags?.map(t => (
                        <span key={t} className="badge badge-default" style={{ fontSize: '0.7rem' }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.last_activity_at}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleOpenCustomer(c)}
                        icon={Eye}
                      >
                        360 Profile
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
              ))}
            </tbody>
          </table>
        </div>
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
            <Users size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            No customer profiles yet
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Customer profiles, phone contacts, lifetime spend, and behavioral tags are automatically synthesized when shoppers message you on WhatsApp, Instagram, or Facebook.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="primary" size="md" onClick={() => onNavigateModule ? onNavigateModule('integrations') : null} icon={Network}>
              Connect Channels
            </Button>
            <Button variant="subtle" size="md" onClick={() => { setPreviewingDemo(true); fetchCustomers(true); }} icon={Sparkles}>
              ⚡ Preview Demo Customers
            </Button>
          </div>
        </div>
      )}

      {/* Customer 360 Slide-over Drawer */}
      <CustomerProfileDrawer
        customer={selectedCustomer}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRefresh={() => fetchCustomers(true)}
      />
    </div>
  );
}
