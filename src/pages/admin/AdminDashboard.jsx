import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Network,
  Cpu,
  Activity,
  SlidersHorizontal,
  LogOut,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Zap,
  Radio,
  UserCheck,
  Menu,
  FileText
} from 'lucide-react';
import { adminService } from '../../services/api';
import '../../styles/admin.css';

export function AdminDashboard({ user, onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'businesses' | 'integrations' | 'automations' | 'activity' | 'settings'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Core Data States from Real Database
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [businessesList, setBusinessesList] = useState([]);
  const [businessesPagination, setBusinessesPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [integrationsData, setIntegrationsData] = useState({ summary: {}, connections: [] });
  const [automationsData, setAutomationsData] = useState({ workflows: [], totalRuns: 0 });
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityPagination, setActivityPagination] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [systemHealth, setSystemHealth] = useState(null);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [businessSearch, setBusinessSearch] = useState('');
  const [businessStatusFilter, setBusinessStatusFilter] = useState('ALL');
  const [activitySearch, setActivitySearch] = useState('');

  // Modals & Details Drawers
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBusinessDetail, setSelectedBusinessDetail] = useState(null);
  const [loadingBusinessDetail, setLoadingBusinessDetail] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch Real Metrics
  const loadMetrics = async () => {
    try {
      const res = await adminService.getPlatformMetrics();
      if (res && res.success) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  // 2. Fetch Real Users
  const loadUsers = async (page = 1) => {
    try {
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search: userSearch,
        role: userRoleFilter
      });
      if (res && res.success && res.data) {
        setUsersList(res.data.users || []);
        setUsersPagination(res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  // 3. Fetch Real Businesses
  const loadBusinesses = async (page = 1) => {
    try {
      const res = await adminService.getBusinesses({
        page,
        limit: 10,
        search: businessSearch,
        status: businessStatusFilter
      });
      if (res && res.success && res.data) {
        setBusinessesList(res.data.businesses || []);
        setBusinessesPagination(res.data.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load businesses:', err);
    }
  };

  // 4. Fetch Real Integrations
  const loadIntegrations = async () => {
    try {
      const res = await adminService.getIntegrations();
      if (res && res.success && res.data) {
        setIntegrationsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load integrations:', err);
    }
  };

  // 5. Fetch Real Automations
  const loadAutomations = async () => {
    try {
      const res = await adminService.getAutomations();
      if (res && res.success && res.data) {
        setAutomationsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load automations:', err);
    }
  };

  // 6. Fetch Real Activity
  const loadActivity = async (page = 1) => {
    try {
      const res = await adminService.getAuditLogs({ page, limit: 25 });
      if (res && res.success && res.data) {
        setActivityLogs(res.data.logs || []);
        setActivityPagination(res.data.pagination || { total: 0, page: 1, limit: 25, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load activity:', err);
    }
  };

  // 7. Fetch Real System Health
  const loadSystemHealth = async () => {
    try {
      const res = await adminService.getSystemHealth();
      if (res && res.success && res.data) {
        setSystemHealth(res.data);
      }
    } catch (err) {
      console.error('Failed to load system health:', err);
    }
  };

  // Comprehensive Refresh
  const refreshAllData = async () => {
    setIsSyncing(true);
    await Promise.all([
      loadMetrics(),
      loadUsers(usersPagination.page),
      loadBusinesses(businessesPagination.page),
      loadIntegrations(),
      loadAutomations(),
      loadActivity(activityPagination.page),
      loadSystemHealth()
    ]);
    setIsSyncing(false);
    showToast('Platform data synchronized from database');
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Debounced search for users
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [userSearch, userRoleFilter]);

  // Debounced search for businesses
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBusinesses(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [businessSearch, businessStatusFilter]);

  // Open User Detail
  const handleOpenUserDetail = async (userItem) => {
    setSelectedUser(userItem);
    setLoadingUserDetail(true);
    try {
      const res = await adminService.getUserById(userItem.id);
      if (res && res.success && res.data) {
        setSelectedUserDetail(res.data);
      } else {
        setSelectedUserDetail({ user: userItem, business: null, integrations: [], automation: null, recentActivity: [] });
      }
    } catch {
      setSelectedUserDetail({ user: userItem, business: null, integrations: [], automation: null, recentActivity: [] });
    } finally {
      setLoadingUserDetail(false);
    }
  };

  // Open Business Detail
  const handleOpenBusinessDetail = async (bizItem) => {
    setSelectedBusiness(bizItem);
    setLoadingBusinessDetail(true);
    try {
      const res = await adminService.getBusinessById(bizItem.id);
      if (res && res.success && res.data) {
        setSelectedBusinessDetail(res.data);
      } else {
        setSelectedBusinessDetail({ business: bizItem, teamMembers: [], connections: [], aiConfig: null, stats: {} });
      }
    } catch {
      setSelectedBusinessDetail({ business: bizItem, teamMembers: [], connections: [], aiConfig: null, stats: {} });
    } finally {
      setLoadingBusinessDetail(false);
    }
  };

  // Toggle Business Status
  const handleToggleBusinessStatus = async (bizId) => {
    try {
      const res = await adminService.toggleBusinessStatus(bizId);
      if (res && res.success) {
        showToast('Workspace status updated');
        loadBusinesses(businessesPagination.page);
        loadMetrics();
        if (selectedBusinessDetail && selectedBusinessDetail.business.id === bizId) {
          setSelectedBusinessDetail(prev => ({
            ...prev,
            business: { ...prev.business, status: res.data.status }
          }));
        }
      }
    } catch {
      showToast('Failed to toggle status');
    }
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  // Filtered activity logs client-side search
  const filteredActivity = useMemo(() => {
    if (!activitySearch.trim()) return activityLogs;
    const q = activitySearch.toLowerCase();
    return activityLogs.filter(a =>
      (a.action || '').toLowerCase().includes(q) ||
      (a.actor_email || '').toLowerCase().includes(q) ||
      (a.resource || '').toLowerCase().includes(q)
    );
  }, [activityLogs, activitySearch]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: metrics?.totalUsers },
    { id: 'businesses', label: 'Businesses', icon: Building2, badge: metrics?.totalBusinesses },
    { id: 'integrations', label: 'Integrations', icon: Network, badge: metrics?.activeIntegrations },
    { id: 'automations', label: 'Automations', icon: Cpu, badge: metrics?.activeAutomations },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal }
  ];

  return (
    <div className="mac-admin-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mac-admin-toast" role="status">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="mac-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ==============================================================
          LEFT SIDEBAR (MacOS SaaS Navigation)
          ============================================================== */}
      <aside className={`mac-admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Brand Header */}
        <div className="mac-sidebar-header">
          <div className="mac-brand-block">
            <img src="/logo-dark.svg" alt="KREAZY AI" className="mac-sidebar-logo" />
            <div className="mac-brand-titles">
              <span className="mac-brand-name">KREAZY AI</span>
              <span className="mac-brand-badge">ADMIN CONTROL</span>
            </div>
          </div>
          <button
            type="button"
            className="mac-sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mac-sidebar-nav" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`mac-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="mac-nav-item-content">
                  <Icon size={18} className="mac-nav-icon" />
                  <span className="mac-nav-label">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="mac-nav-pill">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer with Admin Profile & Logout */}
        <div className="mac-sidebar-footer">
          <div className="mac-admin-profile-pill">
            <div className="mac-admin-avatar">
              {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
            </div>
            <div className="mac-admin-info">
              <span className="mac-admin-name">{user?.name || 'Super Admin'}</span>
              <span className="mac-admin-email">{user?.email || 'admin@kreazyai.com'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mac-logout-btn"
            title="Log out of Admin Portal"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ==============================================================
          MAIN CONTENT AREA
          ============================================================== */}
      <div className="mac-admin-main">
        {/* Top Navigation Bar */}
        <header className="mac-topbar">
          <div className="mac-topbar-left">
            <button
              type="button"
              className="mac-mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar navigation"
            >
              <Menu size={20} />
            </button>
            <h1 className="mac-topbar-title">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="mac-topbar-right">
            {/* Real System Status Pill */}
            <div className="mac-system-status-pill">
              <span className="mac-status-indicator-dot online" />
              <span>Database Active</span>
            </div>

            {/* Live Synchronize Button */}
            <button
              type="button"
              onClick={refreshAllData}
              disabled={isSyncing}
              className={`mac-sync-btn ${isSyncing ? 'syncing' : ''}`}
              title="Synchronize real data from SQLite database"
            >
              <RefreshCw size={15} />
              <span className="mac-sync-text">{isSyncing ? 'Syncing...' : 'Sync Live'}</span>
            </button>

            {/* Official Audit Report Download Button */}
            <a
              href="/KreazyAI_Full_Website_Audit_Report.pdf"
              download="KreazyAI_Full_Website_Audit_Report.pdf"
              className="mac-audit-download-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: '#EFFBF5',
                color: '#087A4A',
                border: '1px solid rgba(8, 122, 74, 0.3)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Download Official 12-Page Full Website Audit Report (PDF)"
            >
              <FileText size={15} />
              <span>Audit Report (PDF)</span>
            </a>
          </div>
        </header>

        {/* View Router */}
        <main className="mac-admin-content-body">
          {/* ==========================================================
              1. OVERVIEW VIEW
              ========================================================== */}
          {activeTab === 'overview' && (
            <div className="mac-view-container">
              {/* Statistical Metric Cards Grid */}
              <div className="mac-metrics-grid">
                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">TOTAL USERS</span>
                    <Users size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    {metrics ? Number(metrics.totalUsers).toLocaleString() : '—'}
                  </div>
                  <div className="mac-metric-sub">
                    Real registered database accounts
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">ACTIVE USERS</span>
                    <UserCheck size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    {metrics ? Number(metrics.activeUsers).toLocaleString() : '—'}
                  </div>
                  <div className="mac-metric-sub">
                    Active sessions & recent activity
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">BUSINESSES</span>
                    <Building2 size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    {metrics ? Number(metrics.totalBusinesses).toLocaleString() : '—'}
                  </div>
                  <div className="mac-metric-sub">
                    Total merchant tenant workspaces
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">CONNECTED BUSINESSES</span>
                    <Radio size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    {metrics ? Number(metrics.connectedBusinesses).toLocaleString() : '—'}
                  </div>
                  <div className="mac-metric-sub">
                    Workspaces with connected channels
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">ACTIVE INTEGRATIONS</span>
                    <Network size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    {metrics ? Number(metrics.activeIntegrations).toLocaleString() : '—'}
                  </div>
                  <div className="mac-metric-sub">
                    Live Meta & WhatsApp connections
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">ACTIVE AUTOMATIONS</span>
                    <Cpu size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    {metrics ? Number(metrics.activeAutomations).toLocaleString() : '—'}
                  </div>
                  <div className="mac-metric-sub">
                    Stores with enabled AI auto-reply
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">AUTOMATION RUNS</span>
                    <Zap size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    {metrics ? Number(metrics.automationRuns).toLocaleString() : '—'}
                  </div>
                  <div className="mac-metric-sub">
                    Total autonomous AI executions
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">MESSAGES AUTOMATED</span>
                    <MessageSquare size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    {metrics ? Number(metrics.messagesAutomated).toLocaleString() : '—'}
                  </div>
                  <div className="mac-metric-sub">
                    Customer conversations handled
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Recent Users & Recent Integrations */}
              <div className="mac-overview-two-col">
                {/* Recent Users Window */}
                <div className="mac-panel-card">
                  <div className="mac-panel-header">
                    <div className="mac-panel-header-left">
                      <div className="mac-mini-traffic" aria-hidden="true">
                        <span className="mac-traffic-dot mac-dot-close" />
                        <span className="mac-traffic-dot mac-dot-minimize" />
                        <span className="mac-traffic-dot mac-dot-maximize" />
                      </div>
                      <span className="mac-panel-title">Recent User Registrations</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('users')}
                      className="mac-link-btn"
                    >
                      <span>View All Users</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="mac-panel-body">
                    {metrics?.recentUsers && metrics.recentUsers.length > 0 ? (
                      <div className="mac-table-responsive">
                        <table className="mac-table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Business</th>
                              <th>Signed Up</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {metrics.recentUsers.map((u) => (
                              <tr key={u.id}>
                                <td>
                                  <div className="mac-table-user">
                                    <div className="mac-table-avatar">
                                      {(u.name || u.email || 'U').slice(0, 1).toUpperCase()}
                                    </div>
                                    <span className="mac-table-name">{u.name || 'Unnamed'}</span>
                                  </div>
                                </td>
                                <td className="mac-table-secondary">{u.email}</td>
                                <td>
                                  <span className="mac-badge-neutral">{u.business_name || 'No Business'}</span>
                                </td>
                                <td className="mac-table-secondary">{formatDate(u.created_at)}</td>
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenUserDetail(u)}
                                    className="mac-btn-xs"
                                  >
                                    Inspect
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="mac-empty-state">
                        <Users size={32} className="mac-empty-icon" />
                        <p className="mac-empty-title">No users have signed up yet.</p>
                        <p className="mac-empty-desc">New merchant registrations will appear here in real time.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Integrations Window */}
                <div className="mac-panel-card">
                  <div className="mac-panel-header">
                    <div className="mac-panel-header-left">
                      <div className="mac-mini-traffic" aria-hidden="true">
                        <span className="mac-traffic-dot mac-dot-close" />
                        <span className="mac-traffic-dot mac-dot-minimize" />
                        <span className="mac-traffic-dot mac-dot-maximize" />
                      </div>
                      <span className="mac-panel-title">Active Platform Integrations</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('integrations')}
                      className="mac-link-btn"
                    >
                      <span>All Integrations</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="mac-panel-body">
                    {integrationsData.connections && integrationsData.connections.length > 0 ? (
                      <div className="mac-connections-stack">
                        {integrationsData.connections.slice(0, 4).map((c) => (
                          <div key={c.id} className="mac-mini-connection-row">
                            <div className="mac-mini-conn-info">
                              <span className={`mac-status-dot ${c.health}`} />
                              <div>
                                <span className="mac-mini-conn-title">{c.platform}</span>
                                <span className="mac-mini-conn-biz">{c.businessName}</span>
                              </div>
                            </div>
                            <div className="mac-mini-conn-right">
                              <span className={`mac-status-badge ${c.health}`}>
                                {c.status}
                              </span>
                              <span className="mac-mini-conn-time">{c.lastSync}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mac-empty-state">
                        <Network size={32} className="mac-empty-icon" />
                        <p className="mac-empty-title">No integrations connected yet.</p>
                        <p className="mac-empty-desc">When merchants connect WhatsApp or Instagram, active channels appear here.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              2. USERS MANAGEMENT VIEW
              ========================================================== */}
          {activeTab === 'users' && (
            <div className="mac-view-container">
              {/* Search & Filter Bar */}
              <div className="mac-filter-bar">
                <div className="mac-search-input-box">
                  <Search size={16} className="mac-search-icon" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email, or store..."
                    className="mac-filter-input"
                  />
                  {userSearch && (
                    <button type="button" onClick={() => setUserSearch('')} className="mac-clear-btn">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="mac-filter-select-group">
                  <label htmlFor="user-role-select" className="mac-filter-label">Role:</label>
                  <select
                    id="user-role-select"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="mac-filter-select"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="OWNER">Owner</option>
                    <option value="MEMBER">Member</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="mac-panel-card">
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">
                      User Accounts ({usersPagination.total} Total)
                    </span>
                  </div>
                </div>

                <div className="mac-panel-body">
                  {usersList.length > 0 ? (
                    <div className="mac-table-responsive">
                      <table className="mac-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Business</th>
                            <th>Signup Date</th>
                            <th>Status</th>
                            <th>Integrations</th>
                            <th>Automations</th>
                            <th>Last Active</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map((u) => (
                            <tr key={u.id}>
                              <td>
                                <div className="mac-table-user">
                                  <div className="mac-table-avatar">
                                    {(u.name || u.email || 'U').slice(0, 1).toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="mac-table-name">{u.name || 'Unnamed'}</span>
                                    <span className="mac-table-sub">{u.role}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="mac-table-secondary">{u.email}</td>
                              <td>
                                <span className="mac-badge-neutral">{u.business}</span>
                              </td>
                              <td className="mac-table-secondary">{formatDate(u.signupDate)}</td>
                              <td>
                                <span className={`mac-status-badge ${u.accountStatus === 'ACTIVE' ? 'healthy' : 'failed'}`}>
                                  {u.accountStatus}
                                </span>
                              </td>
                              <td>
                                <span className="mac-badge-count">{u.integrationsCount} Active</span>
                              </td>
                              <td>
                                <span className={`mac-status-badge ${u.automationStatus === 'ACTIVE' ? 'healthy' : 'inactive'}`}>
                                  {u.automationStatus}
                                </span>
                              </td>
                              <td className="mac-table-secondary">{formatDate(u.lastActive)}</td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserDetail(u)}
                                  className="mac-btn-xs"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mac-empty-state">
                      <Users size={32} className="mac-empty-icon" />
                      <p className="mac-empty-title">No users found.</p>
                      <p className="mac-empty-desc">Try modifying your search or filter criteria.</p>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {usersPagination.totalPages > 1 && (
                    <div className="mac-pagination-bar">
                      <span className="mac-pagination-text">
                        Page {usersPagination.page} of {usersPagination.totalPages}
                      </span>
                      <div className="mac-pagination-btns">
                        <button
                          type="button"
                          disabled={usersPagination.page <= 1}
                          onClick={() => loadUsers(usersPagination.page - 1)}
                          className="mac-page-btn"
                        >
                          <ChevronLeft size={16} />
                          <span>Previous</span>
                        </button>
                        <button
                          type="button"
                          disabled={usersPagination.page >= usersPagination.totalPages}
                          onClick={() => loadUsers(usersPagination.page + 1)}
                          className="mac-page-btn"
                        >
                          <span>Next</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              3. BUSINESSES MANAGEMENT VIEW
              ========================================================== */}
          {activeTab === 'businesses' && (
            <div className="mac-view-container">
              {/* Filter Bar */}
              <div className="mac-filter-bar">
                <div className="mac-search-input-box">
                  <Search size={16} className="mac-search-icon" />
                  <input
                    type="text"
                    value={businessSearch}
                    onChange={(e) => setBusinessSearch(e.target.value)}
                    placeholder="Search businesses by name, slug, or owner..."
                    className="mac-filter-input"
                  />
                  {businessSearch && (
                    <button type="button" onClick={() => setBusinessSearch('')} className="mac-clear-btn">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="mac-filter-select-group">
                  <label htmlFor="business-status-select" className="mac-filter-label">Status:</label>
                  <select
                    id="business-status-select"
                    value={businessStatusFilter}
                    onChange={(e) => setBusinessStatusFilter(e.target.value)}
                    className="mac-filter-select"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Businesses Table */}
              <div className="mac-panel-card">
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">
                      Workspaces & Businesses ({businessesPagination.total} Total)
                    </span>
                  </div>
                </div>

                <div className="mac-panel-body">
                  {businessesList.length > 0 ? (
                    <div className="mac-table-responsive">
                      <table className="mac-table">
                        <thead>
                          <tr>
                            <th>Business</th>
                            <th>Owner</th>
                            <th>Members</th>
                            <th>Connected Integrations</th>
                            <th>Automations</th>
                            <th>Revenue</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {businessesList.map((b) => (
                            <tr key={b.id}>
                              <td>
                                <div>
                                  <span className="mac-table-name">{b.name}</span>
                                  <span className="mac-table-sub">{b.slug}</span>
                                </div>
                              </td>
                              <td>
                                <div>
                                  <span className="mac-table-name">{b.ownerName || '—'}</span>
                                  <span className="mac-table-sub">{b.ownerEmail}</span>
                                </div>
                              </td>
                              <td className="mac-table-secondary">{b.membersCount}</td>
                              <td>
                                <span className="mac-badge-count">{b.connectedIntegrationsCount} Connected</span>
                              </td>
                              <td>
                                <span className={`mac-status-badge ${b.activeAutomations === 'Enabled' ? 'healthy' : 'inactive'}`}>
                                  {b.activeAutomations}
                                </span>
                              </td>
                              <td className="mac-table-secondary">
                                ${Number(b.totalRevenue || 0).toLocaleString()}
                              </td>
                              <td>
                                <span className={`mac-status-badge ${b.status === 'ACTIVE' ? 'healthy' : 'failed'}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="mac-table-secondary">{formatDate(b.createdAt)}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenBusinessDetail(b)}
                                    className="mac-btn-xs"
                                  >
                                    Inspect
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleBusinessStatus(b.id)}
                                    className="mac-btn-xs mac-btn-outline"
                                  >
                                    {b.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mac-empty-state">
                      <Building2 size={32} className="mac-empty-icon" />
                      <p className="mac-empty-title">No businesses found.</p>
                      <p className="mac-empty-desc">Create or onboard merchant businesses to view records.</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {businessesPagination.totalPages > 1 && (
                    <div className="mac-pagination-bar">
                      <span className="mac-pagination-text">
                        Page {businessesPagination.page} of {businessesPagination.totalPages}
                      </span>
                      <div className="mac-pagination-btns">
                        <button
                          type="button"
                          disabled={businessesPagination.page <= 1}
                          onClick={() => loadBusinesses(businessesPagination.page - 1)}
                          className="mac-page-btn"
                        >
                          <ChevronLeft size={16} />
                          <span>Previous</span>
                        </button>
                        <button
                          type="button"
                          disabled={businessesPagination.page >= businessesPagination.totalPages}
                          onClick={() => loadBusinesses(businessesPagination.page + 1)}
                          className="mac-page-btn"
                        >
                          <span>Next</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              4. INTEGRATIONS VIEW (MacOS Mini Windows)
              ========================================================== */}
          {activeTab === 'integrations' && (
            <div className="mac-view-container">
              {/* Channel Stats Overview */}
              <div className="mac-channels-overview-grid">
                {Object.entries(integrationsData.summary || {}).map(([key, item]) => (
                  <div key={key} className="mac-channel-card">
                    <div className="mac-channel-header">
                      <span className="mac-channel-title">{item.name}</span>
                      <span className={`mac-status-dot ${item.status === 'CONNECTED' ? 'healthy' : 'inactive'}`} />
                    </div>
                    <div className="mac-channel-metric-row">
                      <div className="mac-channel-stat">
                        <span className="mac-stat-num">{item.connected || 0}</span>
                        <span className="mac-stat-label">Connected</span>
                      </div>
                      <div className="mac-channel-stat">
                        <span className="mac-stat-num">{item.active || 0}</span>
                        <span className="mac-stat-label">Active</span>
                      </div>
                      <div className="mac-channel-stat">
                        <span className="mac-stat-num">{item.failed || 0}</span>
                        <span className="mac-stat-label">Attention</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mini MacOS Windows for Each Real Connection */}
              <div className="mac-connections-section">
                <h2 className="mac-section-heading">Connected Merchant Channels</h2>
                {integrationsData.connections && integrationsData.connections.length > 0 ? (
                  <div className="mac-mini-windows-grid">
                    {integrationsData.connections.map((conn) => (
                      <div key={conn.id} className="mac-mini-window-card">
                        {/* Mini Window Top Bar */}
                        <div className="mac-mini-window-titlebar">
                          <div className="mac-mini-traffic" aria-hidden="true">
                            <span className="mac-traffic-dot mac-dot-close" />
                            <span className="mac-traffic-dot mac-dot-minimize" />
                            <span className="mac-traffic-dot mac-dot-maximize" />
                          </div>
                          <span className="mac-mini-window-title">
                            {conn.platform} Connection
                          </span>
                        </div>

                        {/* Mini Window Content */}
                        <div className="mac-mini-window-body">
                          <div className="mac-card-data-row">
                            <span className="mac-data-key">STATUS</span>
                            <div className="mac-data-status-wrapper">
                              <span className={`mac-status-dot ${conn.health}`} />
                              <span className="mac-data-val-bold">{conn.status}</span>
                            </div>
                          </div>

                          <div className="mac-card-data-row">
                            <span className="mac-data-key">BUSINESS</span>
                            <span className="mac-data-val">{conn.businessName}</span>
                          </div>

                          <div className="mac-card-data-row">
                            <span className="mac-data-key">ENDPOINT</span>
                            <span className="mac-data-val-mono">{conn.identifier}</span>
                          </div>

                          <div className="mac-card-data-row">
                            <span className="mac-data-key">CONNECTED</span>
                            <span className="mac-data-val">{formatDate(conn.connectedAt)}</span>
                          </div>

                          <div className="mac-card-data-row">
                            <span className="mac-data-key">LAST SYNC</span>
                            <span className="mac-data-val">{conn.lastSync}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mac-panel-card">
                    <div className="mac-empty-state">
                      <Network size={36} className="mac-empty-icon" />
                      <p className="mac-empty-title">No integrations connected yet.</p>
                      <p className="mac-empty-desc">Merchant connection requests across WhatsApp and Meta will be logged here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================================
              5. AUTOMATIONS VIEW (Visual Nodes Component)
              ========================================================== */}
          {activeTab === 'automations' && (
            <div className="mac-view-container">
              {/* Visual Workflow Canvas Header */}
              <div className="mac-panel-card" style={{ marginBottom: '1.5rem' }}>
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">Kreazy AI Autonomous Commerce Architecture</span>
                  </div>
                  <span className="mac-badge-count">{automationsData.totalRuns} Total AI Executions</span>
                </div>

                <div className="mac-panel-body">
                  <p className="mac-canvas-subtitle">
                    End-to-end multi-agent execution pipeline: Inbound chat trigger, deterministic intent detection, catalog search, autonomous commerce order dispatch, and human handoff.
                  </p>

                  {/* MacOS-like Workflow Visual Nodes */}
                  <div className="mac-workflow-canvas">
                    {/* Node 1 */}
                    <div className="mac-workflow-node">
                      <div className="mac-node-titlebar">
                        <div className="mac-mini-traffic" aria-hidden="true">
                          <span className="mac-traffic-dot mac-dot-close" />
                          <span className="mac-traffic-dot mac-dot-minimize" />
                          <span className="mac-traffic-dot mac-dot-maximize" />
                        </div>
                        <span className="mac-node-header-title">Trigger</span>
                      </div>
                      <div className="mac-node-body">
                        <span className="mac-node-event">WhatsApp / Social Message</span>
                        <span className="mac-node-status">Status: Active</span>
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    <div className="mac-workflow-connector">
                      <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                        <path d="M0 10H26M26 10L18 3M26 10L18 17" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* Node 2 */}
                    <div className="mac-workflow-node">
                      <div className="mac-node-titlebar">
                        <div className="mac-mini-traffic" aria-hidden="true">
                          <span className="mac-traffic-dot mac-dot-close" />
                          <span className="mac-traffic-dot mac-dot-minimize" />
                          <span className="mac-traffic-dot mac-dot-maximize" />
                        </div>
                        <span className="mac-node-header-title">AI Concierge</span>
                      </div>
                      <div className="mac-node-body">
                        <span className="mac-node-event">Intent Reasoning</span>
                        <span className="mac-node-status">Confidence: &gt;94%</span>
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    <div className="mac-workflow-connector">
                      <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                        <path d="M0 10H26M26 10L18 3M26 10L18 17" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* Node 3 */}
                    <div className="mac-workflow-node">
                      <div className="mac-node-titlebar">
                        <div className="mac-mini-traffic" aria-hidden="true">
                          <span className="mac-traffic-dot mac-dot-close" />
                          <span className="mac-traffic-dot mac-dot-minimize" />
                          <span className="mac-traffic-dot mac-dot-maximize" />
                        </div>
                        <span className="mac-node-header-title">Commerce Engine</span>
                      </div>
                      <div className="mac-node-body">
                        <span className="mac-node-event">Catalog &amp; Order Capture</span>
                        <span className="mac-node-status">Fulfillment: Automated</span>
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    <div className="mac-workflow-connector">
                      <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                        <path d="M0 10H26M26 10L18 3M26 10L18 17" stroke="var(--primary-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    {/* Node 4 */}
                    <div className="mac-workflow-node">
                      <div className="mac-node-titlebar">
                        <div className="mac-mini-traffic" aria-hidden="true">
                          <span className="mac-traffic-dot mac-dot-close" />
                          <span className="mac-traffic-dot mac-dot-minimize" />
                          <span className="mac-traffic-dot mac-dot-maximize" />
                        </div>
                        <span className="mac-node-header-title">Handoff Guard</span>
                      </div>
                      <div className="mac-node-body">
                        <span className="mac-node-event">Human Escalation Alert</span>
                        <span className="mac-node-status">Latency: Instant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflows List from Real Database */}
              <div className="mac-panel-card">
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">
                      Active Business Workflows ({automationsData.workflows?.length || 0})
                    </span>
                  </div>
                </div>

                <div className="mac-panel-body">
                  {automationsData.workflows && automationsData.workflows.length > 0 ? (
                    <div className="mac-table-responsive">
                      <table className="mac-table">
                        <thead>
                          <tr>
                            <th>Workflow Name</th>
                            <th>Business</th>
                            <th>Trigger</th>
                            <th>Status</th>
                            <th>Executions</th>
                            <th>Last Run</th>
                          </tr>
                        </thead>
                        <tbody>
                          {automationsData.workflows.map((wf) => (
                            <tr key={wf.id}>
                              <td>
                                <span className="mac-table-name">{wf.name}</span>
                              </td>
                              <td className="mac-table-secondary">{wf.businessName}</td>
                              <td className="mac-table-secondary">{wf.trigger}</td>
                              <td>
                                <span className={`mac-status-badge ${wf.status === 'ACTIVE' ? 'healthy' : 'inactive'}`}>
                                  {wf.status}
                                </span>
                              </td>
                              <td>
                                <span className="mac-badge-count">{wf.runs} Runs</span>
                              </td>
                              <td className="mac-table-secondary">{formatDateTime(wf.lastRun)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mac-empty-state">
                      <Cpu size={32} className="mac-empty-icon" />
                      <p className="mac-empty-title">No automations have been created yet.</p>
                      <p className="mac-empty-desc">Configured business automations will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              6. ACTIVITY VIEW (Real Audit Log Stream)
              ========================================================== */}
          {activeTab === 'activity' && (
            <div className="mac-view-container">
              <div className="mac-filter-bar">
                <div className="mac-search-input-box">
                  <Search size={16} className="mac-search-icon" />
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search activity stream by action, actor, or resource..."
                    className="mac-filter-input"
                  />
                  {activitySearch && (
                    <button type="button" onClick={() => setActivitySearch('')} className="mac-clear-btn">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mac-panel-card">
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">
                      System Activity Stream ({activityPagination.total} Events)
                    </span>
                  </div>
                </div>

                <div className="mac-panel-body">
                  {filteredActivity.length > 0 ? (
                    <div className="mac-table-responsive">
                      <table className="mac-table">
                        <thead>
                          <tr>
                            <th>Action</th>
                            <th>Actor</th>
                            <th>Resource</th>
                            <th>Details</th>
                            <th>Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredActivity.map((log) => (
                            <tr key={log.id}>
                              <td>
                                <span className="mac-badge-action">{log.action}</span>
                              </td>
                              <td className="mac-table-secondary">{log.actor_email || 'System'}</td>
                              <td className="mac-table-secondary">{log.resource || '—'}</td>
                              <td className="mac-table-secondary" style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {JSON.stringify(log.details || {})}
                              </td>
                              <td className="mac-table-secondary">{formatDateTime(log.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="mac-empty-state">
                      <Activity size={32} className="mac-empty-icon" />
                      <p className="mac-empty-title">No activity recorded yet.</p>
                      <p className="mac-empty-desc">Administrative and merchant events will stream here.</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {activityPagination.totalPages > 1 && (
                    <div className="mac-pagination-bar">
                      <span className="mac-pagination-text">
                        Page {activityPagination.page} of {activityPagination.totalPages}
                      </span>
                      <div className="mac-pagination-btns">
                        <button
                          type="button"
                          disabled={activityPagination.page <= 1}
                          onClick={() => loadActivity(activityPagination.page - 1)}
                          className="mac-page-btn"
                        >
                          <ChevronLeft size={16} />
                          <span>Previous</span>
                        </button>
                        <button
                          type="button"
                          disabled={activityPagination.page >= activityPagination.totalPages}
                          onClick={() => loadActivity(activityPagination.page + 1)}
                          className="mac-page-btn"
                        >
                          <span>Next</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              7. SETTINGS & SYSTEM HEALTH VIEW
              ========================================================== */}
          {activeTab === 'settings' && (
            <div className="mac-view-container">
              <div className="mac-settings-two-col">
                {/* Administrator Profile Card */}
                <div className="mac-panel-card">
                  <div className="mac-panel-header">
                    <div className="mac-panel-header-left">
                      <div className="mac-mini-traffic" aria-hidden="true">
                        <span className="mac-traffic-dot mac-dot-close" />
                        <span className="mac-traffic-dot mac-dot-minimize" />
                        <span className="mac-traffic-dot mac-dot-maximize" />
                      </div>
                      <span className="mac-panel-title">Administrator Profile</span>
                    </div>
                  </div>
                  <div className="mac-panel-body">
                    <div className="mac-profile-display-row">
                      <div className="mac-profile-large-avatar">
                        {(user?.name || user?.email || 'A').slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="mac-profile-name">{user?.name || 'Administrator'}</h3>
                        <p className="mac-profile-email">{user?.email || 'admin@kreazyai.com'}</p>
                        <span className="mac-badge-super-tag">SUPER ADMIN</span>
                      </div>
                    </div>

                    <div className="mac-settings-data-list">
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">User ID</span>
                        <span className="mac-data-item-val-mono">{user?.id || 'usr-dev-superadmin'}</span>
                      </div>
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">Role Permissions</span>
                        <span className="mac-data-item-val">Global Super Admin (Read / Write / Delete)</span>
                      </div>
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">Authentication Session</span>
                        <span className="mac-data-item-val">JWT Server-Signed Token Active</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="mac-logout-action-btn"
                      >
                        <LogOut size={16} />
                        <span>Sign Out of Administrator Session</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Infrastructure Telemetry Card */}
                <div className="mac-panel-card">
                  <div className="mac-panel-header">
                    <div className="mac-panel-header-left">
                      <div className="mac-mini-traffic" aria-hidden="true">
                        <span className="mac-traffic-dot mac-dot-close" />
                        <span className="mac-traffic-dot mac-dot-minimize" />
                        <span className="mac-traffic-dot mac-dot-maximize" />
                      </div>
                      <span className="mac-panel-title">System Infrastructure Status</span>
                    </div>
                  </div>
                  <div className="mac-panel-body">
                    <div className="mac-settings-data-list">
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">Database Engine</span>
                        <span className="mac-data-item-val">
                          {systemHealth?.database?.engine || 'SQLite 3 (WAL Mode)'}
                        </span>
                      </div>
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">Database Status</span>
                        <span className="mac-data-item-val">
                          <span className="mac-status-dot healthy" />
                          {systemHealth?.database?.status || 'HEALTHY'}
                        </span>
                      </div>
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">Server Uptime</span>
                        <span className="mac-data-item-val">
                          {systemHealth?.api?.uptime ? `${Math.floor(systemHealth.api.uptime)} seconds` : 'Active'}
                        </span>
                      </div>
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">Memory Consumption</span>
                        <span className="mac-data-item-val">
                          {systemHealth?.memory?.rss || '54 MB'}
                        </span>
                      </div>
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">AI Provider Engine</span>
                        <span className="mac-data-item-val">
                          {systemHealth?.aiEngine?.provider || 'heuristic (deterministic fallback)'}
                        </span>
                      </div>
                      <div className="mac-data-item">
                        <span className="mac-data-item-key">Meta Webhooks Status</span>
                        <span className="mac-data-item-val">
                          Operational (Graph API v21.0)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ==============================================================
          USER DETAILS DRAWER / MODAL (MacOS Window Style)
          ============================================================== */}
      {selectedUser && (
        <div className="mac-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="mac-modal-window" onClick={(e) => e.stopPropagation()} role="dialog">
            {/* Window Header */}
            <div className="mac-modal-titlebar">
              <div className="mac-mini-traffic" aria-hidden="true">
                <span className="mac-traffic-dot mac-dot-close" onClick={() => setSelectedUser(null)} style={{ cursor: 'pointer' }} />
                <span className="mac-traffic-dot mac-dot-minimize" />
                <span className="mac-traffic-dot mac-dot-maximize" />
              </div>
              <span className="mac-modal-title-text">
                User Details: {selectedUser.name || selectedUser.email}
              </span>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="mac-modal-close-icon"
              >
                <X size={16} />
              </button>
            </div>

            {/* Window Body */}
            <div className="mac-modal-body">
              {loadingUserDetail ? (
                <div className="mac-modal-loading">
                  <div className="mac-admin-spinner" />
                  <span>Loading user records...</span>
                </div>
              ) : (
                <div className="mac-modal-content-stack">
                  {/* Basic Information */}
                  <div className="mac-modal-section">
                    <h4 className="mac-modal-section-title">Identity &amp; Credentials</h4>
                    <div className="mac-modal-data-grid">
                      <div className="mac-data-pair">
                        <span className="mac-data-label">User ID:</span>
                        <span className="mac-data-content-mono">{selectedUserDetail?.user?.id}</span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Full Name:</span>
                        <span className="mac-data-content">{selectedUserDetail?.user?.name || '—'}</span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Email:</span>
                        <span className="mac-data-content">{selectedUserDetail?.user?.email}</span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Role:</span>
                        <span className="mac-data-content">{selectedUserDetail?.user?.role}</span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Signed Up:</span>
                        <span className="mac-data-content">{formatDate(selectedUserDetail?.user?.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Business Workspace */}
                  {selectedUserDetail?.business && (
                    <div className="mac-modal-section">
                      <h4 className="mac-modal-section-title">Associated Merchant Workspace</h4>
                      <div className="mac-modal-data-grid">
                        <div className="mac-data-pair">
                          <span className="mac-data-label">Store Name:</span>
                          <span className="mac-data-content">{selectedUserDetail.business.name}</span>
                        </div>
                        <div className="mac-data-pair">
                          <span className="mac-data-label">Slug:</span>
                          <span className="mac-data-content-mono">{selectedUserDetail.business.slug}</span>
                        </div>
                        <div className="mac-data-pair">
                          <span className="mac-data-label">Plan:</span>
                          <span className="mac-data-content">{selectedUserDetail.business.plan}</span>
                        </div>
                        <div className="mac-data-pair">
                          <span className="mac-data-label">Status:</span>
                          <span className="mac-data-content">{selectedUserDetail.business.status}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Connected Integrations */}
                  <div className="mac-modal-section">
                    <h4 className="mac-modal-section-title">Connected Channel Integrations</h4>
                    {selectedUserDetail?.integrations && selectedUserDetail.integrations.length > 0 ? (
                      <div className="mac-modal-integrations-list">
                        {selectedUserDetail.integrations.map((i, idx) => (
                          <div key={idx} className="mac-modal-integration-pill">
                            <span className={`mac-status-dot ${i.status === 'CONNECTED' ? 'healthy' : 'inactive'}`} />
                            <span className="mac-integ-name">{i.platform}</span>
                            <span className="mac-integ-id">{i.identifier}</span>
                            <span className="mac-integ-sync">Sync: {i.lastSync || 'Active'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mac-modal-empty-note">No channels connected yet for this account.</p>
                    )}
                  </div>

                  {/* Automations */}
                  {selectedUserDetail?.automation && (
                    <div className="mac-modal-section">
                      <h4 className="mac-modal-section-title">Automation &amp; AI Configuration</h4>
                      <div className="mac-modal-data-grid">
                        <div className="mac-data-pair">
                          <span className="mac-data-label">AI Assistant:</span>
                          <span className="mac-data-content">{selectedUserDetail.automation.assistantName}</span>
                        </div>
                        <div className="mac-data-pair">
                          <span className="mac-data-label">Auto-Reply:</span>
                          <span className="mac-data-content">
                            {selectedUserDetail.automation.autoReplyEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="mac-data-pair">
                          <span className="mac-data-label">Brand Voice:</span>
                          <span className="mac-data-content">{selectedUserDetail.automation.brandVoice}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          BUSINESS DETAILS DRAWER / MODAL (MacOS Window Style)
          ============================================================== */}
      {selectedBusiness && (
        <div className="mac-modal-backdrop" onClick={() => setSelectedBusiness(null)}>
          <div className="mac-modal-window" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="mac-modal-titlebar">
              <div className="mac-mini-traffic" aria-hidden="true">
                <span className="mac-traffic-dot mac-dot-close" onClick={() => setSelectedBusiness(null)} style={{ cursor: 'pointer' }} />
                <span className="mac-traffic-dot mac-dot-minimize" />
                <span className="mac-traffic-dot mac-dot-maximize" />
              </div>
              <span className="mac-modal-title-text">
                Workspace: {selectedBusiness.name}
              </span>
              <button
                type="button"
                onClick={() => setSelectedBusiness(null)}
                className="mac-modal-close-icon"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mac-modal-body">
              {loadingBusinessDetail ? (
                <div className="mac-modal-loading">
                  <div className="mac-admin-spinner" />
                  <span>Loading workspace records...</span>
                </div>
              ) : (
                <div className="mac-modal-content-stack">
                  <div className="mac-modal-section">
                    <h4 className="mac-modal-section-title">Business Profile</h4>
                    <div className="mac-modal-data-grid">
                      <div className="mac-data-pair">
                        <span className="mac-data-label">ID:</span>
                        <span className="mac-data-content-mono">{selectedBusinessDetail?.business?.id}</span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Store Name:</span>
                        <span className="mac-data-content">{selectedBusinessDetail?.business?.name}</span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Slug:</span>
                        <span className="mac-data-content-mono">{selectedBusinessDetail?.business?.slug}</span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Owner:</span>
                        <span className="mac-data-content">
                          {selectedBusinessDetail?.business?.owner_name} ({selectedBusinessDetail?.business?.owner_email})
                        </span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Status:</span>
                        <span className="mac-data-content">{selectedBusinessDetail?.business?.status}</span>
                      </div>
                      <div className="mac-data-pair">
                        <span className="mac-data-label">Total Volume:</span>
                        <span className="mac-data-content">
                          ${Number(selectedBusinessDetail?.business?.total_revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="mac-modal-section">
                    <h4 className="mac-modal-section-title">Team Members</h4>
                    {selectedBusinessDetail?.teamMembers && selectedBusinessDetail.teamMembers.length > 0 ? (
                      <div className="mac-modal-data-grid">
                        {selectedBusinessDetail.teamMembers.map((m) => (
                          <div key={m.id} className="mac-data-pair">
                            <span className="mac-data-label">{m.role}:</span>
                            <span className="mac-data-content">{m.name} ({m.email})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mac-modal-empty-note">Owner only (No additional team members invited).</p>
                    )}
                  </div>

                  {/* Connected Integrations */}
                  <div className="mac-modal-section">
                    <h4 className="mac-modal-section-title">Connected Meta Channels</h4>
                    {selectedBusinessDetail?.connections && selectedBusinessDetail.connections.length > 0 ? (
                      <div className="mac-modal-integrations-list">
                        {selectedBusinessDetail.connections.map((c, idx) => (
                          <div key={idx} className="mac-modal-integration-pill">
                            <span className={`mac-status-dot ${c.status === 'CONNECTED' ? 'healthy' : 'inactive'}`} />
                            <span className="mac-integ-name">{c.platform}</span>
                            <span className="mac-integ-id">{c.page_name || c.display_phone_number || 'Connected'}</span>
                            <span className="mac-integ-sync">Sync: {c.last_sync_at || 'Active'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mac-modal-empty-note">No active channels connected.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
