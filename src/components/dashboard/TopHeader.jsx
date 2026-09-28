import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Bot, 
  CheckCircle, 
  ExternalLink,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { Badge } from '../common/Badge';

export function TopHeader({ user, onToggleMobileSidebar, onNavigateModule, onLogout }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New Autonomous Order #KZ-1049',
      desc: 'Marcus Vance confirmed Artisan Linen Overshirt ($89.00) via WhatsApp',
      time: '2 mins ago',
      unread: true
    },
    {
      id: 2,
      title: 'Human Handoff Request',
      desc: 'Julian Bennett requested agent assistance regarding sizing on Facebook',
      time: '48 mins ago',
      unread: true
    },
    {
      id: 3,
      title: 'Shopify Inventory Synced',
      desc: '48 products and stock numbers updated successfully',
      time: '1 hour ago',
      unread: false
    }
  ];

  const isDemo = Boolean(user?.isDemo);
  const activeNotifications = isDemo ? notifications : [];

  return (
    <header className="app-topbar">
      {/* Mobile Toggle & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-icon btn-ghost"
          onClick={onToggleMobileSidebar}
          style={{ display: 'none' }}
          id="mobile-sidebar-toggle"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-search-wrap">
          <Search size={16} className="input-icon" style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search orders, customers, or SKUs..."
          />
          <span className="search-shortcut-kbd">/</span>
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="topbar-actions">
        {/* Meta Cloud Status Pill */}
        <Badge variant={isDemo ? 'olive' : 'subtle'}>
          <Bot size={12} /> {isDemo ? 'Meta Cloud Live' : 'Channels Standby (0/3)'}
        </Badge>

        {/* Notifications Popover Toggle */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn btn-icon btn-ghost"
            onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
            style={{ position: 'relative', width: '40px', height: '40px' }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {activeNotifications.some(n => n.unread) && (
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e11d48' }}></span>
            )}
          </button>

          {notificationsOpen && (
            <>
              <div 
                onClick={() => setNotificationsOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 840 }}
                aria-hidden="true"
              />
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: 'min(320px, calc(100vw - 2rem))',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 850,
                  padding: '0.75rem 0'
                }}
              >
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                  <span>Notifications</span>
                  {activeNotifications.length > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--bright-olive)', cursor: 'pointer' }}>Mark all read</span>
                  )}
                </div>
                <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                  {activeNotifications.length > 0 ? (
                    activeNotifications.map(n => (
                      <div key={n.id} style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--border-subtle)', backgroundColor: n.unread ? 'rgba(163, 230, 53, 0.05)' : 'transparent', cursor: 'pointer' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.825rem', marginBottom: '2px', color: 'var(--text-primary)' }}>{n.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>{n.desc}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{n.time}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No new notifications. Everything is ready.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <div 
            className="user-profile-menu"
            onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
            style={{ cursor: 'pointer', padding: '0.35rem' }}
          >
            <div className="user-avatar">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : (isDemo ? 'MA' : 'ME')}
            </div>
            <div style={{ display: 'none', lineHeight: 1.2 }} className="desktop-user-info">
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{user?.name || (isDemo ? 'Marcus Aurelius' : 'Store Owner')}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Store Admin</div>
            </div>
          </div>

          {profileOpen && (
            <>
              <div 
                onClick={() => setProfileOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 840 }}
                aria-hidden="true"
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: 'min(220px, calc(100vw - 2rem))',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 850,
                  padding: '0.5rem 0'
                }}
              >
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{user?.name || (isDemo ? 'Marcus Aurelius' : 'Store Owner')}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.email || (isDemo ? 'founder@kreazybrand.com' : 'owner@yourbrand.com')}</div>
                </div>
                <div 
                  style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => { onNavigateModule('settings'); setProfileOpen(false); }}
                >
                  <Settings size={15} /> Workspace Settings
                </div>
                <div 
                  style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-error-text)', borderTop: '1px solid var(--border-subtle)' }}
                  onClick={onLogout}
                >
                  <LogOut size={15} /> Sign Out
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
