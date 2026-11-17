import { apiClient } from '../../api/client';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Bot, 
  CheckCircle, 
  ExternalLink,
  User,
  Settings,
  LogOut,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { 
  getStoredNotifications, 
  markAllNotificationsRead, 
  clearAllNotifications 
} from '../../services/notificationStore';

export function TopHeader({ user, onToggleMobileSidebar, onNavigateModule, onLogout, onNavigate }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsList, setNotificationsList] = useState(getStoredNotifications);

  useEffect(() => {
    const handleUpdate = () => {
      setNotificationsList(getStoredNotifications());
    };
    window.addEventListener('kreazy_notification_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kreazy_notification_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const unreadCount = notificationsList.filter(n => n.unread).length;
  const isDemo = Boolean(user?.isDemo);


  const isImpersonating = Boolean(
    user?.isImpersonated || 
    user?.is_impersonated ||
    sessionStorage.getItem('kreazy_superadmin_auth_backup') ||
    localStorage.getItem('kreazy_superadmin_auth_backup')
  );

  const handleReturnToAdmin = () => {
    const backupToken = sessionStorage.getItem('kreazy_superadmin_auth_backup') || localStorage.getItem('kreazy_superadmin_auth_backup');
    const backupUser = sessionStorage.getItem('kreazy_superadmin_user_backup') || localStorage.getItem('kreazy_superadmin_user_backup');
    if (backupToken) {
      apiClient.setAuthToken(backupToken);
      sessionStorage.removeItem('kreazy_superadmin_auth_backup');
      localStorage.removeItem('kreazy_superadmin_auth_backup');
    }
    if (backupUser) {
      localStorage.setItem('kreazy_auth_user', backupUser);
      sessionStorage.removeItem('kreazy_superadmin_user_backup');
      localStorage.removeItem('kreazy_superadmin_user_backup');
    }
    window.dispatchEvent(new CustomEvent('kreazy_auth_sync', { detail: null }));
    window.dispatchEvent(new Event('storage'));
    if (onNavigate) {
      onNavigate('admin');
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <header className="app-topbar">
      {isImpersonating && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #481577 0%, #300C52 100%)',
          color: '#FFFFFF',
          padding: '6px 14px',
          borderRadius: '10px',
          fontSize: '0.82rem',
          fontWeight: 600,
          boxShadow: '0 2px 10px rgba(72, 21, 119, 0.35)',
          whiteSpace: 'nowrap'
        }}>
          <ShieldCheck size={16} style={{ color: '#10B981' }} />
          <span>Super-Admin Mode</span>
          <button
            type="button"
            onClick={handleReturnToAdmin}
            style={{
              background: '#FFFFFF',
              color: '#481577',
              border: 'none',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '4px'
            }}
          >
            <span>Return to Admin</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}
      {/* Mobile Toggle & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-icon btn-ghost mobile-sidebar-toggle-btn"
          onClick={onToggleMobileSidebar}
          id="mobile-sidebar-toggle"
          aria-label="Toggle navigation menu"
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
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                minWidth: '16px', height: '16px', borderRadius: 0,
                backgroundColor: '#e11d48', color: '#ffffff',
                fontSize: '10px', fontWeight: 800, display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                boxShadow: '0 0 8px rgba(225, 29, 72, 0.6)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
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
                  width: 'min(340px, calc(100vw - 2rem))',
                  backgroundColor: '#0E131F',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                  zIndex: 850,
                  padding: '0.75rem 0',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  padding: '0.5rem 1rem 0.65rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  fontWeight: 700, fontSize: '0.85rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  color: 'var(--text-primary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        background: 'rgba(225, 29, 72, 0.12)', color: '#e11d48',
                        padding: '1px 6px', borderRadius: 0, fontSize: '0.7rem', fontWeight: 800
                      }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {notificationsList.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span 
                        onClick={() => {
                          const updated = markAllNotificationsRead();
                          setNotificationsList(updated);
                        }}
                        style={{ fontSize: '0.72rem', color: 'var(--primary, #087A4A)', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                      >
                        <CheckCheck size={12} /> Mark all read
                      </span>
                      <span 
                        onClick={() => {
                          const updated = clearAllNotifications();
                          setNotificationsList(updated);
                        }}
                        style={{ fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        Clear
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {notificationsList.length > 0 ? (
                    notificationsList.map(n => {
                      const isPayment = n.type === 'payment' || n.title.toLowerCase().includes('payment');
                      return (
                        <div 
                          key={n.id} 
                          onClick={() => {
                            if (n.link && onNavigateModule) {
                              const moduleName = n.link.replace('/dashboard/', '');
                              onNavigateModule(moduleName);
                            }
                            setNotificationsOpen(false);
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                            backgroundColor: n.unread ? 'rgba(8, 122, 74, 0.05)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            {isPayment && (
                              <span style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }}>
                                <CheckCircle size={15} />
                              </span>
                            )}
                            <div style={{ flexGrow: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.825rem', marginBottom: '2px', color: 'var(--text-primary)' }}>
                                {n.title}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px', lineHeight: 1.4 }}>
                                {n.desc}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {n.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
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

        {/* User Profile Capsule (Reference Visual Language) */}
        <div style={{ position: 'relative' }}>
          <div 
            className="user-profile-capsule"
            onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.3rem 0.75rem 0.3rem 0.35rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div 
              className="user-avatar"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.78rem',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {(user?.avatarUrl || user?.picture) ? (
                <img 
                  src={user.avatarUrl || user.picture} 
                  alt={user?.name || 'User'} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                user?.name ? user.name.slice(0, 2).toUpperCase() : (isDemo ? 'MA' : 'ME')
              )}
            </div>
            <div style={{ lineHeight: 1.2, textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#FFFFFF' }}>
                {user?.name || (isDemo ? 'Marcus Vance' : 'Store Owner')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Store Manager</div>
            </div>
            <div style={{
              marginLeft: '0.35rem',
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#CBD5E1'
            }}>
              <Settings size={13} />
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
                  backgroundColor: '#0E131F',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
                  zIndex: 850,
                  padding: '0.5rem 0',
                  color: '#FFFFFF'
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
                  style={{ padding: '0.65rem 1rem', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary, #087A4A)', fontWeight: 600 }}
                  onClick={() => { onNavigateModule('billing'); setProfileOpen(false); }}
                >
                  <CreditCard size={15} /> Billing & Pricing
                </div>
                <button 
                  type="button"
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: '#f87171',
                    background: 'transparent',
                    border: 'none',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'left',
                    fontWeight: 600,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
