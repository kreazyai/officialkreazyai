import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag, 
  MessageSquare, 
  Clock, 
  Tag, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Share2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { customerCrmService } from '../../services/api';

export function CustomerProfileDrawer({ customer, isOpen, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | contacts | orders | notes | activity
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [newTag, setNewTag] = useState('');

  if (!isOpen || !customer) return null;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    await customerCrmService.addNote(customer.id, newNote, "Support Agent");
    setNewNote('');
    setAddingNote(false);
    if (onRefresh) onRefresh();
  };

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    await customerCrmService.addTag(customer.id, newTag.trim());
    setNewTag('');
    if (onRefresh) onRefresh();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-medium)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          boxShadow: 'var(--shadow-xl)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fafbf9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={customer.profile_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={customer.full_name}
              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-medium)' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--olive-950)' }}>
                {customer.full_name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>ID: {customer.id}</span>
                <span>•</span>
                <Badge variant={customer.preferred_channel === 'WHATSAPP' ? 'whatsapp' : 'instagram'}>
                  {customer.preferred_channel}
                </Badge>
                <span className="badge badge-olive">{customer.customer_type}</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close drawer">
            <X size={18} />
          </Button>
        </div>

        {/* Drawer Navigation Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto', backgroundColor: '#ffffff' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'contacts', label: 'Contacts & Social' },
            { id: 'orders', label: `Orders (${customer.total_orders})` },
            { id: 'notes', label: `Notes (${customer.notes?.length || 0})` },
            { id: 'activity', label: 'Timeline' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8rem', height: '30px', padding: '0 0.75rem' }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Scrollable Body */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Financial Metrics Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>LIFETIME SPEND</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--olive-950)', marginTop: '2px' }}>
                    ${customer.total_spent?.toFixed(2)}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ORDERS</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--olive-950)', marginTop: '2px' }}>
                    {customer.total_orders}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>AVG ORDER</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--olive-950)', marginTop: '2px' }}>
                    ${customer.average_order_value?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Core Information Card */}
              <div className="card" style={{ padding: 'var(--space-4)', fontSize: '0.85rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--olive-950)' }}>Contact Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={14} color="var(--text-muted)" />
                    <span>{customer.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={14} color="var(--text-muted)" />
                    <span>{customer.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <span style={{ color: 'var(--text-muted)' }}>Last active {customer.last_activity_at}</span>
                  </div>
                </div>
              </div>

              {/* Segmentation Tags */}
              <div className="card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--olive-950)' }}>Segments & Tags</h4>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {customer.tags?.map(t => (
                    <Badge key={t} variant="olive">{t}</Badge>
                  ))}
                </div>
                <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add custom tag (e.g. VIP Wholesale)..."
                    style={{ height: '32px', fontSize: '0.8rem' }}
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <Button type="submit" variant="secondary" size="sm" icon={Plus}>
                    Add
                  </Button>
                </form>
              </div>

              {/* Default Address */}
              {customer.addresses && customer.addresses.length > 0 && (
                <div className="card" style={{ padding: 'var(--space-4)', fontSize: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--olive-950)' }}>Default Shipping Address</h4>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="var(--olive-700)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      {customer.addresses[0].address_line_1}<br />
                      {customer.addresses[0].city}, {customer.addresses[0].district} {customer.addresses[0].postal_code}<br />
                      {customer.addresses[0].country}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONTACTS & SOCIAL */}
          {activeTab === 'contacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: 'var(--space-4)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Verified Communication Endpoints</h4>
                {customer.contacts?.map(cnt => (
                  <div key={cnt.id} style={{ padding: '0.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', marginBottom: '0.5rem', fontSize: '0.825rem' }}>
                    <div><strong>Email:</strong> {cnt.email}</div>
                    <div><strong>WhatsApp Phone:</strong> {cnt.phone}</div>
                    <div style={{ marginTop: '4px' }}>
                      <span className="badge badge-success">{cnt.verification_status}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 'var(--space-4)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Linked Social Profiles</h4>
                {customer.social_accounts?.map(soc => (
                  <div key={soc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', border: '1px solid var(--border-subtle)', borderRadius: '6px', marginBottom: '0.5rem' }}>
                    <div>
                      <Badge variant={soc.platform === 'WHATSAPP' ? 'whatsapp' : 'instagram'}>
                        {soc.platform}
                      </Badge>
                      <strong style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>{soc.display_name}</strong>
                    </div>
                    <span className="status-dot active"></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS */}
          {activeTab === 'orders' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Order #KZ-1049</span>
                  <Badge variant="success">Confirmed</Badge>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Artisan Linen Overshirt (Olive / L) • $89.00 • 10 mins ago via WhatsApp
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Order #KZ-1032</span>
                  <Badge variant="olive">Delivered</Badge>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Artisan Linen Overshirt (Sand / L) • $89.00 • 2 weeks ago
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Record an internal note about customer preferences or sizing..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button type="submit" variant="primary" size="sm" loading={addingNote} style={{ alignSelf: 'flex-end' }}>
                  Post Note
                </Button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {customer.notes?.map(n => (
                  <div key={n.id} style={{ padding: '0.75rem', backgroundColor: '#fafbf9', border: '1px solid var(--border-medium)', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      <strong>{n.author}</strong>
                      <span>{n.created_at}</span>
                    </div>
                    <div>{n.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITY TIMELINE */}
          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {customer.activities?.map(act => (
                <div key={act.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.825rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.7rem' }}>
                    {act.performed_by === 'AI' ? 'AI' : 'US'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--olive-950)' }}>{act.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Source: {act.source} • {act.created_at}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
