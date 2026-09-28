import React, { useState, useEffect } from 'react';
import { Users, Search, MessageSquare, ShoppingBag, Tag, ExternalLink, Eye, Plus, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { CustomerProfileDrawer } from '../../components/customer/CustomerProfileDrawer';
import { customerCrmService } from '../../services/api';

export function CustomersPage({ onOpenMessages }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCustomers = async () => {
    const res = await customerCrmService.getAll();
    if (res.success) {
      setCustomers(res.data);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

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
          <p style={{ fontSize: '0.9rem' }}>Aggregated shopper identities, multi-endpoint contacts, spend records, and behavioral tags.</p>
        </div>

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
      </div>

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
                <td style={{ fontWeight: 700, color: 'var(--olive-950)' }}>
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

      {/* Customer 360 Slide-over Drawer */}
      <CustomerProfileDrawer
        customer={selectedCustomer}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onRefresh={fetchCustomers}
      />
    </div>
  );
}
