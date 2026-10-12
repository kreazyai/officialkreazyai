import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  ShoppingBag, 
  Boxes, 
  Users, 
  Network, 
  Bot, 
  BarChart3, 
  DollarSign, 
  Settings, 
  Sparkles, 
  ChevronDown,
  LogOut,
  X,
  Home,
  CreditCard
} from 'lucide-react';

export function Sidebar({ currentModule, onSelectModule, onLogout, isMobileOpen, onCloseMobile, user, onNavigate }) {
  const isDemo = Boolean(user?.isDemo);

  const navItems = [
    { id: 'overview', path: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'messages', path: '/dashboard/messages', label: 'Messages', icon: MessageSquare, badge: isDemo ? '3' : null },
    { id: 'orders', path: '/dashboard/orders', label: 'Orders', icon: ShoppingBag, badge: isDemo ? '5' : null },
    { id: 'products', path: '/dashboard/products', label: 'Products', icon: Boxes },
    { id: 'customers', path: '/dashboard/customers', label: 'Customers', icon: Users },
    { id: 'integrations', path: '/dashboard/integrations', label: 'Integrations', icon: Network, badge: isDemo ? 'Meta' : null },
    { id: 'ai-assistant', path: '/dashboard/ai-assistant', label: 'AI Assistant', icon: Bot, highlight: true },
    { id: 'analytics', path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'revenue', path: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
    { id: 'billing', path: '/dashboard/billing', label: 'Billing & Pricing', icon: CreditCard },
    { id: 'settings', path: '/dashboard/settings', label: 'Settings', icon: Settings }
  ];

  const handleItemClick = (e, item) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (onSelectModule) {
      onSelectModule(item.id, item.path);
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="sidebar-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(12, 18, 13, 0.7)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1050
          }}
          aria-hidden="true"
        />
      )}
      <aside className={`app-sidebar ${isMobileOpen ? 'open mobile-open' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="sidebar-brand">
          <a
            href="/"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();
              if (onCloseMobile) onCloseMobile();
              if (onNavigate) {
                onNavigate('home');
              } else if (onSelectModule) {
                onSelectModule('home', '/');
              }
            }}
            style={{ cursor: 'pointer', textDecoration: 'none' }}
            title="KreazyAI"
          >
            <img src="/logo-dark.svg" alt="KREAZY AI" className="brand-logo-img" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
          </a>

          {onCloseMobile && (
            <button
              type="button"
              className="btn btn-icon btn-ghost mobile-sidebar-close"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

      {/* Workspace Selector */}
      <div className="sidebar-workspace-selector">
        <div className="workspace-badge">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
            <span className={`status-dot ${isDemo ? 'active' : ''}`}></span>
            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.storeName || (isDemo ? 'Kreazy Flagship Studio' : 'MyRetail Store')}
            </span>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Navigation</div>
        <a
          href="/"
          className="sidebar-link"
          onClick={(e) => {
            e.preventDefault();
            if (onCloseMobile) onCloseMobile();
            if (onNavigate) {
              onNavigate('home');
            } else if (onSelectModule) {
              onSelectModule('home', '/');
            }
          }}
          title="Return to Home"
        >
          <Home size={18} />
          <span>Home</span>
        </a>

        <div className="sidebar-section-title" style={{ marginTop: '0.75rem' }}>Core Management</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <a
              key={item.id}
              href={item.path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={(e) => handleItemClick(e, item)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="link-badge">{item.badge}</span>}
            </a>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="ai-engine-status">
          <Bot size={16} color={isDemo ? 'var(--bright-olive)' : 'var(--olive-700)'} />
          <div>
            <div style={{ lineHeight: 1.2 }}>{isDemo ? 'AI Engine Active' : 'AI Engine Ready'}</div>
            <small style={{ color: 'var(--text-muted)' }}>{isDemo ? 'Listening on 3 Channels' : 'Channels Standby'}</small>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            if (onLogout) onLogout();
          }} 
          className="btn btn-sm" 
          style={{
            justifyContent: 'flex-start',
            gap: '0.65rem',
            color: '#f87171',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.55rem 0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.18)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
    </>
  );
}
