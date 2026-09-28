import React, { useState, useEffect } from 'react';
import { 
  Network, 
  MessageSquare, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Settings, 
  X,
  Sparkles
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { integrationService, conversationService } from '../../services/api';

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [activeModalChannel, setActiveModalChannel] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchIntegrations = async () => {
    const list = await integrationService.getAll();
    setIntegrations(list);
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleToggle = async (channelId) => {
    setIsConnecting(true);
    setTimeout(async () => {
      await integrationService.toggleConnection(channelId);
      await fetchIntegrations();
      setIsConnecting(false);
      setActiveModalChannel(null);
    }, 600);
  };

  const handleTestInbound = async (item) => {
    let customerName = "Sophia Chen";
    let text = "Hi Kreazy! Do you have linen overshirts in stock for delivery?";
    let phone = "+1 (555) 782-9912";

    if (item.id === 'instagram') {
      customerName = "Julian Bennett";
      text = "Loving your new ceramics catalog! What are the dimensions of the carafe?";
      phone = "+1 (555) 912-3841";
    } else if (item.id === 'facebook') {
      customerName = "David Kim";
      text = "Hello! Do you offer expedited shipping for gift orders?";
      phone = "+1 (555) 234-8899";
    }

    await conversationService.receiveIncomingMessage({
      customerName,
      channel: item.id,
      text,
      phone,
      email: `${customerName.toLowerCase().replace(/[^a-z0-9]/g, '')}@meta.example`
    });

    setNotification(`⚡ Inbound webhook dispatched from ${item.name}! Customer profile for "${customerName}" has been automatically created in your Customer 360 CRM.`);
    setTimeout(() => setNotification(''), 7000);
  };

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
          <h2>Meta Channel Hub & Webhook Integrations</h2>
          <p style={{ fontSize: '0.9rem' }}>Manage official Meta Cloud API connections, permissions, and catalog synchronizations.</p>
        </div>

        <Badge variant="olive">
          <ShieldCheck size={14} /> Meta Graph API v20.0 Verified
        </Badge>
      </div>

      <div className="integrations-grid">
        {integrations.map((item) => {
          const isConn = item.status === 'connected';
          return (
            <div key={item.id} className="integration-card">
              <div className="integration-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div 
                    className="integration-logo-badge"
                    style={{
                      backgroundColor: item.id === 'whatsapp' ? 'var(--channel-whatsapp-soft)' : item.id === 'instagram' ? 'var(--channel-instagram-soft)' : 'var(--channel-facebook-soft)',
                      color: item.id === 'whatsapp' ? '#177339' : item.id === 'instagram' ? '#9d204d' : '#1254ad'
                    }}
                  >
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{item.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.platform}</div>
                  </div>
                </div>

                <Badge variant={isConn ? 'success' : 'default'}>
                  {isConn ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {item.description}
              </p>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bound Account:</span>
                  <strong>{item.account}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Webhook Health:</span>
                  <span style={{ color: isConn ? '#16a34a' : 'var(--text-muted)', fontWeight: 600 }}>
                    {isConn ? 'Active (0ms latency)' : 'Standby'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Last Handshake:</span>
                  <span>{item.lastSync}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant={isConn ? 'secondary' : 'primary'}
                    size="sm"
                    style={{ flexGrow: 1 }}
                    onClick={() => setActiveModalChannel(item)}
                  >
                    {isConn ? 'Settings & Webhook' : 'Connect Channel'}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(item.id)}
                    title={isConn ? 'Disconnect Channel' : 'Reconnect Channel'}
                  >
                    <RefreshCw size={14} />
                  </Button>
                </div>

                <Button
                  variant="subtle"
                  size="sm"
                  style={{ width: '100%', fontSize: '0.78rem' }}
                  onClick={() => handleTestInbound(item)}
                  icon={Sparkles}
                >
                  ⚡ Test Inbound Message Webhook
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Setup / Configuration Modal */}
      {activeModalChannel && (
        <Modal
          isOpen={!!activeModalChannel}
          onClose={() => setActiveModalChannel(null)}
          title={`Configure ${activeModalChannel.name}`}
          maxWidth="560px"
          footer={(
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Button
                variant={activeModalChannel.status === 'connected' ? 'danger' : 'primary'}
                size="sm"
                loading={isConnecting}
                onClick={() => handleToggle(activeModalChannel.id)}
              >
                {activeModalChannel.status === 'connected' ? 'Disconnect Channel' : 'Authorize & Connect'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveModalChannel(null)}>
                Close
              </Button>
            </div>
          )}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={20} color="var(--olive-700)" />
              <div>
                <strong>Meta Cloud API Credentials</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Encrypted webhook tokens securely managed by KreazyAI.</p>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Meta App ID</label>
              <input type="text" className="form-input" readOnly value="meta_app_991823901" style={{ backgroundColor: 'var(--bg-subtle)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Webhook Callback URL</label>
              <input type="text" className="form-input" readOnly value="https://api.kreazy.ai/v1/meta/webhook/kz-prod-live" style={{ backgroundColor: 'var(--bg-subtle)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>Permissions Granted</label>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <li>✓ <code>messages</code> (Receive and reply to customer inquiries)</li>
                <li>✓ <code>messaging_postbacks</code> (Interactive buttons and catalog clicks)</li>
                <li>✓ <code>catalog_management</code> (Real-time product availability checks)</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
