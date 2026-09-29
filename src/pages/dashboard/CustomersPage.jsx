import React, { useState, useEffect } from 'react';
import { Users, Search, MessageSquare, ShoppingBag, Tag, ExternalLink, Eye, Plus, ShieldCheck, Network, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { CustomerProfileDrawer } from '../../components/customer/CustomerProfileDrawer';
import { customerCrmService, conversationService } from '../../services/api';

export function CustomersPage({ user, onOpenMessages, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewingDemo, setPreviewingDemo] = useState(false);

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
      setNotification(`Inbound customer message received via ${simulateChannel.toUpperCase()}! Profile for "${simulateName}" automatically synthesized into your 360 CRM.`);
      setTimeout(() => setNotification(''), 7000);
      await fetchCustomers();
    } catch (err) {
      console.error(err);
      setIsSubmittingSim(false);
    }
  };

  const applyPreset = (name, phone, channel, text) => {
    setSimulateName(name);
    setSimulatePhone(phone);
    setSimulateChannel(channel);
    setSimulateText(text);
  };

  const filtered = customers.filter(c => 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-content">
      {notification && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: 'rgba(163, 230, 53, 0.12)',
          border: '1px solid rgba(163, 230, 53, 0.3)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          color: 'var(--text-primary)'
        }}>
          <CheckCircle2 size={18} color="var(--bright-olive)" />
          <span>{notification}</span>
        </div>
      )}

      <div className="page-title-row">
        <div>
          <h2>Customer Directory & Cross-Channel 360 CRM</h2>
          <p style={{ fontSize: '0.9rem' }}>
            {customers.length > 0 
              ? 'Aggregated shopper identities, multi-endpoint contacts, spend records, and behavioral tags.'
              : 'Clean customer CRM directory. Shopper profiles will automatically be aggregated as they message or purchase.'}
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
              Exit Demo Preview
            </button>
          )}

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setIsSimulateModalOpen(true)} 
            icon={Plus}
          >
            Simulate Inbound Customer
          </Button>

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
        <div className="table-container smooth-scroll-x" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table" style={{ minWidth: '760px' }}>
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
                        src={c.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name || 'Customer')}&background=182018&color=a3e635`}
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
                    <Badge variant={c.preferred_channel === 'WHATSAPP' ? 'whatsapp' : c.preferred_channel === 'INSTAGRAM' ? 'instagram' : 'olive'}>
                      {c.preferred_channel || 'DIRECT'}
                    </Badge>
                  </td>
                  <td>
                    <span className={`badge ${c.customer_type === 'VIP' ? 'badge-olive' : 'badge-default'}`}>
                      {c.customer_type || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.total_orders || 0} orders</td>
                  <td style={{ fontWeight: 700, color: 'var(--bright-olive)' }}>
                    ${(Number(c.total_spent || 0)).toFixed(2)}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    ${(Number(c.average_order_value || 0)).toFixed(2)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(c.tags || []).map(t => (
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
            <Button variant="primary" size="md" onClick={() => setIsSimulateModalOpen(true)} icon={MessageSquare}>
              ⚡ Receive Inbound Customer Message
            </Button>
            <Button variant="secondary" size="md" onClick={() => onNavigateModule ? onNavigateModule('integrations') : null} icon={Network}>
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

      {/* SIMULATE INBOUND CUSTOMER MESSAGE MODAL */}
      <Modal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        title="Simulate Inbound Customer Message"
        maxWidth="520px"
        footer={(
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button variant="secondary" size="sm" onClick={() => setIsSimulateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSimulateInboundMessage}
              loading={isSubmittingSim}
              icon={Send}
            >
              Receive Inbound Message
            </Button>
          </div>
        )}
      >
        <form onSubmit={handleSimulateInboundMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Simulate a shopper initiating a live conversation across your connected software. Kreazy AI will receive the message, process it, and automatically register the customer into this 360 CRM.
          </p>

          {/* Quick Presets */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Quick Presets:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => applyPreset('Sophia Chen', '+1 (555) 782-9912', 'whatsapp', 'Hi! Do you have the Linen Overshirt in size M in stock?')}
              >
                💬 Sophia (WhatsApp)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => applyPreset('Julian Bennett', '+1 (555) 912-3841', 'instagram', 'Love your ceramic collection! What are the dimensions of the carafe?')}
              >
                📸 Julian (Instagram)
              </button>
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                onClick={() => applyPreset('David Kim', '+1 (555) 234-8899', 'facebook', 'Hello! Can you provide shipping estimates to Chicago?')}
              >
                📘 David (Facebook)
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Integrated Channel
            </label>
            <select 
              className="form-select"
              value={simulateChannel}
              onChange={(e) => setSimulateChannel(e.target.value)}
            >
              <option value="whatsapp">WhatsApp Cloud API (+1 Direct Webhook)</option>
              <option value="instagram">Instagram Graph API (DM Inbound)</option>
              <option value="facebook">Facebook Messenger (Meta Webhook)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Customer Full Name
              </label>
              <input
                type="text"
                className="form-input"
                required
                value={simulateName}
                onChange={(e) => setSimulateName(e.target.value)}
                placeholder="e.g. Sophia Chen"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                Phone / Handle
              </label>
              <input
                type="text"
                className="form-input"
                value={simulatePhone}
                onChange={(e) => setSimulatePhone(e.target.value)}
                placeholder="e.g. +1 (555) 000-0000"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              Inbound Customer Message
            </label>
            <textarea
              className="form-input"
              rows={3}
              required
              value={simulateText}
              onChange={(e) => setSimulateText(e.target.value)}
              placeholder="Type message text sent by customer..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
