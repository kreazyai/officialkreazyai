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
  ExternalLink,
  LogOut,
  X,
  Smartphone
} from 'lucide-react';

export function Sidebar({ currentModule, onSelectModule, onLogout, onVisitWebsite, isMobileOpen, onCloseMobile }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '3' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: '5' },
    { id: 'products', label: 'Products', icon: Boxes },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'integrations', label: 'Integrations', icon: Network, badge: 'Meta' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, highlight: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleItemClick = (id) => {
    onSelectModule(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(20, 28, 21, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1050
          }}
          aria-hidden="true"
        />
      )}
      <aside className={`app-sidebar ${isMobileOpen ? 'open' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo" onClick={() => handleItemClick('overview')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <span>K</span>
            </div>
            <span>Kreazy<span className="ai">AI</span></span>
          </div>

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
            <span className="status-dot active"></span>
            <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              Kreazy Flagship Studio
            </span>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Core Management</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <div
              key={item.id}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="link-badge">{item.badge}</span>}
            </div>
          );
        })}

        <div className="sidebar-section-title" style={{ marginTop: '0.75rem' }}>Tools & External</div>
        <div className="sidebar-link" onClick={() => window.open('/?preview=true', '_blank')}>
          <Smartphone size={18} />
          <span>Device Preview</span>
          <span className="link-badge">New</span>
        </div>
        <div className="sidebar-link" onClick={onVisitWebsite}>
          <ExternalLink size={18} />
          <span>Public Website</span>
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div className="ai-engine-status">
          <Bot size={16} color="var(--olive-700)" />
          <div>
            <div style={{ lineHeight: 1.2 }}>AI Engine Active</div>
            <small style={{ color: 'var(--text-muted)' }}>Listening on 3 Channels</small>
          </div>
        </div>

        <button 
          type="button" 
          onClick={onLogout} 
          className="btn btn-sm btn-ghost" 
          style={{ justifyContent: 'flex-start', color: 'var(--text-muted)' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
    </>
  );
}
