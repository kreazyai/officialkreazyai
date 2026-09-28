import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Key, 
  CreditCard, 
  Copy, 
  Check, 
  ShieldCheck, 
  Plus, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';

export function SettingsPage({ user }) {
  const [activeTab, setActiveTab] = useState('workspace'); // workspace | team | api-keys | billing
  const [copiedKey, setCopiedKey] = useState(false);

  const team = [
    { name: user?.name || 'Marcus Aurelius', email: user?.email || 'founder@kreazybrand.com', role: 'Owner', status: 'Active' },
    { name: 'Sarah Jenkins', email: 'sarah.j@kreazybrand.com', role: 'Support Specialist', status: 'Active' },
    { name: 'Devin Cole', email: 'devin@agencypartners.io', role: 'Catalog Manager', status: 'Active' }
  ];

  const handleCopyKey = () => {
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="dashboard-content">
      <div className="page-title-row">
        <div>
          <h2>Workspace & Organization Settings</h2>
          <p style={{ fontSize: '0.9rem' }}>Configure team access, production API webhooks, and billing plans.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav smooth-scroll-x" style={{ marginBottom: 'var(--space-6)', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspace')}
        >
          General Workspace
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          Team Members (3)
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'api-keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('api-keys')}
        >
          Developer APIs & Webhooks
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Subscription & Billing
        </button>
      </div>

      <div className="card" style={{ maxWidth: '820px', padding: 'var(--space-8)' }}>
        {/* TAB 1: WORKSPACE */}
        {activeTab === 'workspace' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Workspace Details</h3>

            <Input
              label="Store Display Name"
              defaultValue={user?.storeName || "Kreazy Flagship Studio"}
            />
            <Input
              label="Primary Contact Email"
              defaultValue={user?.email || "founder@kreazybrand.com"}
            />
            <Select
              label="Store Base Currency"
              defaultValue="USD"
              options={[
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EUR', label: 'EUR (€) - Euro' },
                { value: 'GBP', label: 'GBP (£) - British Pound' },
                { value: 'CAD', label: 'CAD ($) - Canadian Dollar' }
              ]}
            />
            <Button variant="primary" size="sm" style={{ width: 'fit-content' }}>
              Save Workspace Changes
            </Button>
          </div>
        )}

        {/* TAB 2: TEAM */}
        {activeTab === 'team' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Team Members</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Colleagues with access to inbox, order management, and AI settings.</p>
              </div>
              <Button variant="primary" size="sm" icon={Plus}>
                Invite Teammate
              </Button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((m, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.email}</div>
                      </td>
                      <td><Badge variant="olive">{m.role}</Badge></td>
                      <td><span className="badge badge-success">{m.status}</span></td>
                      <td>
                        {m.role !== 'Owner' && (
                          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--status-error-text)' }}>
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: API KEYS & WEBHOOKS */}
        {activeTab === 'api-keys' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>Production API Keys</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Use this secret key to authenticate custom ERP or backend server webhook integrations.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>
                Secret Live API Key
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="password"
                  className="form-input"
                  readOnly
                  value="kz_live_sec_9941a82fbc00192841"
                  style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'var(--bg-subtle)' }}
                />
                <Button variant="secondary" size="md" onClick={handleCopyKey} icon={copiedKey ? Check : Copy}>
                  {copiedKey ? 'Copied' : 'Copy Key'}
                </Button>
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--olive-50)', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', border: '1px solid var(--olive-100)' }}>
              🔒 <strong>Security Warning:</strong> Never expose your secret API key in client-side applications. Webhooks should verify HMAC signatures.
            </div>
          </div>
        )}

        {/* TAB 4: BILLING */}
        {activeTab === 'billing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Current Subscription Plan</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Billed annually. Next billing date: September 2027.</p>
              </div>
              <Badge variant="olive">Growth Plan ($119/mo)</Badge>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span>Conversations Used This Month:</span>
                <strong>4,890 / 5,000 (97.8%)</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '97.8%', height: '100%', backgroundColor: 'var(--olive-700)', borderRadius: '4px' }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="primary" size="sm">
                Upgrade to Scale & Enterprise Plan
              </Button>
              <Button variant="secondary" size="sm">
                View Invoices & Receipts
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
