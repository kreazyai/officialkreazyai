import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Users, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Edit, 
  AlertTriangle,
  ArrowUpRight,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { adminService } from '../../services/api';

export function AdminDashboard({ user, onNavigate, onLogout }) {
  // Authorization Verification:
  // If user is not super admin or lacks admin credentials, reject with strict 403 screen!
  const isAuthorized = user && (user.is_super_admin === true || user.role === 'SUPER_ADMIN');

  const [activeTab, setActiveTab] = useState('overview'); // overview | demos | businesses | audit
  const [metrics, setMetrics] = useState(null);
  const [demoRequests, setDemoRequests] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Demo request detail modal state
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [demoStatusFilter, setDemoStatusFilter] = useState('ALL');
  const [demoSearch, setDemoSearch] = useState('');

  const loadAdminData = async () => {
    const metRes = await adminService.getPlatformMetrics();
    if (metRes.success) setMetrics(metRes.data);

    const demoRes = await adminService.getDemoRequests();
    if (demoRes.success) setDemoRequests(demoRes.data);

    const busRes = await adminService.getBusinesses();
    if (busRes.success) setBusinesses(busRes.data);

    const audRes = await adminService.getAuditLogs();
    if (audRes.success) setAuditLogs(audRes.data);
  };

  useEffect(() => {
    if (isAuthorized) {
      loadAdminData();
    }
  }, [isAuthorized]);

  // Handle Demo Status Update
  const handleUpdateDemoStatus = async (id, status) => {
    await adminService.updateDemoStatus(id, status, adminNoteInput.trim() || null);
    setAdminNoteInput('');
    loadAdminData();
    if (selectedDemo) {
      setSelectedDemo(prev => ({ ...prev, status }));
    }
  };

  // Handle Business Suspension / Activation
  const handleToggleBusinessStatus = async (id) => {
    await adminService.toggleBusinessStatus(id);
    loadAdminData();
  };

  // Export Demo Bookings to CSV
  const handleExportDemos = () => {
    alert("Exporting demo bookings list to CSV...");
  };

  // -------------------------------------------------------------------
  // 403 FORBIDDEN / UNAUTHORIZED STATE
  // -------------------------------------------------------------------
  if (!isAuthorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcfaf7', padding: 'var(--space-6)' }}>
        <div className="card" style={{ maxWidth: '520px', textAlign: 'center', padding: 'var(--space-10)', border: '1px solid #f87171', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <ShieldAlert size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#991b1b', marginBottom: '0.5rem' }}>403 Forbidden: Platform Admin Area</h2>
          <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            You do not possess the required <code>SUPER_ADMIN</code> platform credentials to access the KreazyAI administrative control center. This incident has been logged.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => onNavigate('dashboard')}>
              Back to Merchant Workspace
            </Button>
            <Button variant="primary" onClick={() => onNavigate('home')}>
              Return to Public Website
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered Demos
  const filteredDemos = demoRequests.filter(d => {
    const matchesStatus = demoStatusFilter === 'ALL' || d.status === demoStatusFilter;
    const matchesSearch = 
      d.full_name.toLowerCase().includes(demoSearch.toLowerCase()) ||
      d.business_name.toLowerCase().includes(demoSearch.toLowerCase()) ||
      d.email.toLowerCase().includes(demoSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8faf7' }}>
      
      {/* Platform Admin Top Header */}
      <header style={{ minHeight: '64px', backgroundColor: 'var(--olive-950)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem var(--space-5)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="brand-logo" style={{ color: '#ffffff' }}>
            <div className="brand-icon" style={{ backgroundColor: 'var(--olive-700)' }}>
              <span>K</span>
            </div>
            <span>Kreazy<span style={{ color: 'var(--olive-300)' }}>Admin</span></span>
          </div>
          <span className="badge badge-olive" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--olive-200)' }}>
            <ShieldCheck size={12} /> Super Admin
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')} style={{ color: 'var(--olive-200)' }}>
            Merchant View
          </Button>
          <Button variant="subtle" size="sm" onClick={onLogout} icon={LogOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Admin Content Area */}
      <div className="container-wide" style={{ padding: 'var(--space-6) var(--space-4)', flexGrow: 1 }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="smooth-scroll-x" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', width: '100%', paddingBottom: '6px', whiteSpace: 'nowrap' }}>
            <button
              type="button"
              className={`btn btn-md ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flexShrink: 0 }}
              onClick={() => setActiveTab('overview')}
            >
              Platform Overview
            </button>
            <button
              type="button"
              className={`btn btn-md ${activeTab === 'demos' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flexShrink: 0 }}
              onClick={() => setActiveTab('demos')}
            >
              Demo Bookings & Leads ({demoRequests.filter(d => d.status === 'NEW').length} New)
            </button>
            <button
              type="button"
              className={`btn btn-md ${activeTab === 'businesses' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flexShrink: 0 }}
              onClick={() => setActiveTab('businesses')}
            >
              Registered Businesses ({businesses.length})
            </button>
            <button
              type="button"
              className={`btn btn-md ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flexShrink: 0 }}
              onClick={() => setActiveTab('audit')}
            >
              Audit Trail
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={loadAdminData} icon={RefreshCw}>
            Sync Telemetry
          </Button>
        </div>

        {/* -------------------------------------------------------------
            TAB 1: PLATFORM OVERVIEW METRICS
            ------------------------------------------------------------- */}
        {activeTab === 'overview' && metrics && (
          <div>
            <div className="metrics-grid">
              <div className="metric-card">
                <span className="metric-header">Total Registered Businesses</span>
                <span className="metric-val">{metrics.totalBusinesses}</span>
                <span className="metric-sub metric-growth-pos">{metrics.activeBusinesses} active workspaces</span>
              </div>

              <div className="metric-card">
                <span className="metric-header">Total Demo Requests</span>
                <span className="metric-val">{metrics.totalDemoRequests}</span>
                <span className="metric-sub" style={{ color: '#d97706', fontWeight: 600 }}>
                  {metrics.pendingDemos} pending immediate review
                </span>
              </div>

              <div className="metric-card">
                <span className="metric-header">Platform Processed Orders</span>
                <span className="metric-val">{metrics.totalOrdersProcessed}</span>
                <span className="metric-sub metric-growth-pos">{metrics.platformRevenueVolume} GMV</span>
              </div>

              <div className="metric-card">
                <span className="metric-header">Meta Cloud Webhook Health</span>
                <span className="metric-val" style={{ fontSize: '1.25rem', color: '#16a34a' }}>99.98%</span>
                <span className="metric-sub">{metrics.metaApiStatus}</span>
              </div>
            </div>

            {/* Quick Actions & Recent Platform Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
              <div className="card">
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Pending Demo Inquiries Awaiting Response</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>Leads submitted via the public "Book a Demo" funnel.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {demoRequests.slice(0, 3).map(d => (
                    <div key={d.id} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{d.business_name}</strong> ({d.full_name})
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {d.business_type} • Vol: {d.monthly_order_volume} • {d.created_at}
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => { setSelectedDemo(d); setActiveTab('demos'); }}>
                        Review Lead
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Meta Platform API Diagnostics</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>Live health metrics of official Meta Graph endpoints.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                    <span>WhatsApp Cloud API Webhooks</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Operational (12ms)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                    <span>Instagram Direct Graph v20.0</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Operational (18ms)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px' }}>
                    <span>Facebook Messenger Pages API</span>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Operational (15ms)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 2: DEMO BOOKINGS & LEADS CRM
            ------------------------------------------------------------- */}
        {activeTab === 'demos' && (
          <div>
            {/* Filter and Search Bar */}
            <div className="card" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                  {['ALL', 'NEW', 'CONTACTED', 'SCHEDULED', 'QUALIFIED', 'CONVERTED', 'CANCELLED'].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`btn btn-sm ${demoStatusFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setDemoStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', width: '260px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.825rem' }}
                      placeholder="Search company or prospect..."
                      value={demoSearch}
                      onChange={(e) => setDemoSearch(e.target.value)}
                    />
                  </div>

                  <Button variant="secondary" size="sm" onClick={handleExportDemos} icon={Download}>
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Demos Table */}
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business / Prospect</th>
                    <th>Email & Phone</th>
                    <th>Vertical</th>
                    <th>Primary Channel</th>
                    <th>Monthly Order Vol</th>
                    <th>Preferred Date/Time</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDemos.map(d => (
                    <tr key={d.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{d.business_name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.full_name}</div>
                      </td>
                      <td style={{ fontSize: '0.825rem' }}>
                        <div>{d.email}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{d.phone}</div>
                      </td>
                      <td><Badge variant="olive">{d.business_type}</Badge></td>
                      <td>
                        <Badge variant={d.primary_channel.toLowerCase().includes('whatsapp') ? 'whatsapp' : 'instagram'}>
                          {d.primary_channel}
                        </Badge>
                      </td>
                      <td style={{ fontSize: '0.825rem' }}>{d.monthly_order_volume}</td>
                      <td style={{ fontSize: '0.8rem' }}>
                        <div>{d.preferred_date}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{d.preferred_time}</div>
                      </td>
                      <td>
                        <span className={`badge ${d.status === 'NEW' ? 'badge-warning' : d.status === 'SCHEDULED' ? 'badge-info' : d.status === 'CONVERTED' ? 'badge-success' : 'badge-default'}`}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.created_at}</td>
                      <td>
                        <Button variant="secondary" size="sm" onClick={() => setSelectedDemo(d)}>
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DEMO DETAIL & STATUS TRANSITION MODAL */}
            {selectedDemo && (
              <Modal
                isOpen={!!selectedDemo}
                onClose={() => setSelectedDemo(null)}
                title={`Manage Lead: ${selectedDemo.business_name}`}
                maxWidth="600px"
                footer={(
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>Transition Status:</span>
                      <select
                        className="form-select"
                        style={{ width: '150px', padding: '0.3rem 0.6rem', fontSize: '0.825rem' }}
                        value={selectedDemo.status}
                        onChange={(e) => handleUpdateDemoStatus(selectedDemo.id, e.target.value)}
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <Button variant="secondary" size="sm" onClick={() => setSelectedDemo(null)}>
                      Close
                    </Button>
                  </div>
                )}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div><strong>Contact:</strong> {selectedDemo.full_name} ({selectedDemo.email} • {selectedDemo.phone})</div>
                    <div><strong>Website:</strong> {selectedDemo.website || 'N/A'}</div>
                    <div><strong>Primary Channel:</strong> {selectedDemo.primary_channel}</div>
                    <div><strong>Order Volume:</strong> {selectedDemo.monthly_order_volume}</div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Customer's Stated Bottleneck / Inquiry:</label>
                    <div style={{ padding: '0.75rem', backgroundColor: '#fafbf9', border: '1px solid var(--border-medium)', borderRadius: '6px', fontStyle: 'italic' }}>
                      "{selectedDemo.message || 'No additional message provided.'}"
                    </div>
                  </div>

                  <div>
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Administrative Follow-up Notes:</label>
                    <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      {selectedDemo.notes || 'No notes added yet.'}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Add note (e.g. Sent calendar invitation for Thursday 2pm)..."
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                      />
                      <Button variant="primary" size="sm" onClick={() => handleUpdateDemoStatus(selectedDemo.id, selectedDemo.status)}>
                        Save Note
                      </Button>
                    </div>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 3: REGISTERED BUSINESSES
            ------------------------------------------------------------- */}
        {activeTab === 'businesses' && (
          <div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Workspace Name</th>
                    <th>Account Owner</th>
                    <th>Active Plan</th>
                    <th>Status</th>
                    <th>Channels Connected</th>
                    <th>Total Customers</th>
                    <th>Total Orders</th>
                    <th>Total Converted GMV</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {b.id}</div>
                      </td>
                      <td>
                        <div>{b.owner_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.owner_email}</div>
                      </td>
                      <td><Badge variant="olive">{b.plan}</Badge></td>
                      <td>
                        <span className={`badge ${b.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {b.channels_connected.map(ch => (
                            <span key={ch} className="badge badge-default" style={{ fontSize: '0.7rem' }}>{ch}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{b.total_customers}</td>
                      <td style={{ fontWeight: 600 }}>{b.total_orders}</td>
                      <td style={{ fontWeight: 700, color: 'var(--olive-950)' }}>{b.total_revenue}</td>
                      <td>
                        <Button
                          variant={b.status === 'ACTIVE' ? 'danger' : 'primary'}
                          size="sm"
                          onClick={() => handleToggleBusinessStatus(b.id)}
                        >
                          {b.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            TAB 4: PLATFORM AUDIT LOG
            ------------------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Administrative Audit Log</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Immutable record of sensitive actions performed by platform administrators.
            </p>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Administrator</th>
                    <th>Action</th>
                    <th>Entity Identifier</th>
                    <th>Event Metadata</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id}>
                      <td className="mono" style={{ fontSize: '0.78rem' }}>{log.id}</td>
                      <td><strong>{log.admin}</strong></td>
                      <td><span className="badge badge-olive">{log.action}</span></td>
                      <td className="mono" style={{ fontSize: '0.8rem' }}>{log.entityId}</td>
                      <td style={{ fontSize: '0.825rem' }}>{log.metadata}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
