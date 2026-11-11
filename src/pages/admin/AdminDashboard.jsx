import { apiClient } from '../../api/client';
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
  FileText,
  Package,
  Calendar,
  UserPlus,
  Smartphone,
  DollarSign,
  LogIn,
  Eye,
  Check,
  AlertTriangle,
  ExternalLink,
  Globe,
  Laptop,
  Clock,
  ShieldCheck,
  CreditCard,
  GraduationCap
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

  // Multi-Tenant Inventory States
  const [tenantsInventory, setTenantsInventory] = useState([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [selectedTenantProducts, setSelectedTenantProducts] = useState(null);
  const [loadingTenantProducts, setLoadingTenantProducts] = useState(false);

  // Schedule & Bookings States
  const [scheduleData, setScheduleData] = useState({ totalBookings: 0, pendingCount: 0, confirmedCount: 0, completedCount: 0, bookings: [] });
  const [scheduleFilter, setScheduleFilter] = useState('ALL');

  // Sign-Up Records States
  const [signupsData, setSignupsData] = useState({ totalSignups: 0, page: 1, limit: 20, totalPages: 1, signups: [] });
  const [signupSearch, setSignupSearch] = useState('');

  // AI Bootcamp (Sadat Sakib) States
  const [bootcampData, setBootcampData] = useState({ totalRegistrations: 0, confirmedSeats: 0, page: 1, limit: 25, totalPages: 1, registrations: [] });
  const [bootcampSearch, setBootcampSearch] = useState('');
  const [bootcampStatusFilter, setBootcampStatusFilter] = useState('ALL');

  // Login Sessions States
  const [loginSessionsData, setLoginSessionsData] = useState({ totalSessions: 0, activeDevicesCount: 0, page: 1, limit: 25, totalPages: 1, sessions: [] });

  // Invoices & Finances States
  const [invoicesList, setInvoicesList] = useState([]);


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
  
  // Load Multi-Tenant Inventory
  const loadTenantsInventory = async () => {
    try {
      const res = await adminService.getTenantsInventory({ search: inventorySearch });
      if (res && res.success && res.data) {
        setTenantsInventory(res.data.tenants || []);
      }
    } catch (err) {
      console.error('Failed to load tenants inventory:', err);
    }
  };

  // Inspect Tenant Products
  const handleInspectTenantProducts = async (businessId) => {
    setLoadingTenantProducts(true);
    setSelectedTenantProducts(null);
    try {
      const res = await adminService.getTenantProducts(businessId);
      if (res && res.success && res.data) {
        setSelectedTenantProducts(res.data);
      }
    } catch (err) {
      showToast('Failed to load tenant products');
    } finally {
      setLoadingTenantProducts(false);
    }
  };

  // Load Schedule Bookings
  const loadSchedule = async () => {
    try {
      const res = await adminService.getScheduleBookings();
      if (res && res.success && res.data) {
        setScheduleData(res.data);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    }
  };

  // Update Schedule Status
  const handleUpdateScheduleStatus = async (type, id, status) => {
    try {
      const res = await adminService.updateScheduleStatus(type, id, status);
      if (res && res.success) {
        showToast(`Session marked as ${status.toLowerCase()}`);
        loadSchedule();
      }
    } catch (err) {
      showToast('Failed to update session');
    }
  };

  // Load Signups
  const loadSignups = async (page = 1) => {
    try {
      const res = await adminService.getSignups({ page, limit: 20, search: signupSearch });
      if (res && res.success && res.data) {
        setSignupsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load signups:', err);
    }
  };

  // Load AI Bootcamp Registrations
  const loadBootcampRegistrations = async (page = 1, search = bootcampSearch, status = bootcampStatusFilter) => {
    try {
      const res = await adminService.getBootcampRegistrations({ page, limit: 25, search, status });
      if (res && res.success && res.data) {
        setBootcampData(res.data);
      }
    } catch (err) {
      console.error('Failed to load bootcamp registrations:', err);
    }
  };

  const handleUpdateBootcampStatus = async (id, status) => {
    try {
      await adminService.updateBootcampStatus(id, status);
      showToast('Attendee status updated to ' + status);
      loadBootcampRegistrations(bootcampData.page, bootcampSearch, bootcampStatusFilter);
    } catch (err) {
      showToast('Failed to update: ' + err.message);
    }
  };

  const handleDeleteBootcampRegistration = async (id) => {
    if (!window.confirm('Delete this attendee registration?')) return;
    try {
      await adminService.deleteBootcampRegistration(id);
      showToast('Registration deleted');
      loadBootcampRegistrations(bootcampData.page, bootcampSearch, bootcampStatusFilter);
    } catch (err) {
      showToast('Failed to delete: ' + err.message);
    }
  };

  // Load Login Sessions
  const loadLoginSessions = async (page = 1) => {
    try {
      const res = await adminService.getLoginSessions({ page, limit: 25 });
      if (res && res.success && res.data) {
        setLoginSessionsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load login sessions:', err);
    }
  };

  // Impersonate Customer: Route from Admin Panel into Customer Dashboard
  const handleEnterCustomerDashboard = async (targetId) => {
    try {
      showToast('Generating secure customer workspace token...');
      const res = await adminService.impersonateUser(targetId);
      if (res && res.success && res.data) {
        const currentAdminToken = apiClient.getAuthToken();
        const currentAdminUser = localStorage.getItem('kreazy_auth_user');
        sessionStorage.setItem('kreazy_superadmin_auth_backup', currentAdminToken);
        localStorage.setItem('kreazy_superadmin_auth_backup', currentAdminToken);
        if (currentAdminUser) {
          sessionStorage.setItem('kreazy_superadmin_user_backup', currentAdminUser);
          localStorage.setItem('kreazy_superadmin_user_backup', currentAdminUser);
        }
        
        apiClient.setAuthToken(res.data.token);
        if (res.data.workspace && res.data.workspace.id) {
          apiClient.setWorkspace(res.data.workspace.id);
        }

        const impersonatedUser = {
          ...(res.data.user || {}),
          isImpersonated: true,
          is_impersonated: true
        };
        localStorage.setItem('kreazy_auth_user', JSON.stringify(impersonatedUser));
        window.dispatchEvent(new CustomEvent('kreazy_auth_sync', { detail: impersonatedUser }));
        window.dispatchEvent(new Event('storage'));

        if (onNavigate) {
          onNavigate('dashboard');
        } else {
          window.location.href = '/dashboard/overview';
        }
      } else {
        showToast(res?.error?.message || 'Failed to enter customer dashboard');
      }
    } catch (err) {
      showToast('Error entering customer workspace: ' + (err.message || 'Unknown error'));
    }
  };

  const refreshAllData = async () => {
    setIsSyncing(true);
    await Promise.all([
      loadMetrics(),
      loadUsers(usersPagination.page),
      loadBusinesses(businessesPagination.page),
      loadIntegrations(),
      loadAutomations(),
      loadActivity(activityPagination.page),
      loadSystemHealth(),
      loadTenantsInventory(),
      loadSchedule(),
      loadSignups(signupsData.page),
      loadLoginSessions(loginSessionsData.page),
      loadBootcampRegistrations(1)
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


  // Debounced search for inventory
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTenantsInventory();
    }, 280);
    return () => clearTimeout(timer);
  }, [inventorySearch]);

  // Debounced search for signups
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSignups(1);
    }, 280);
    return () => clearTimeout(timer);
  }, [signupSearch]);

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
    { id: 'overview', label: 'Overview & Telemetry', icon: LayoutDashboard },
    { id: 'bootcamp', label: 'AI Bootcamp (Sadat)', icon: GraduationCap, badge: bootcampData?.totalRegistrations },
    { id: 'inventory', label: 'Tenants & Inventory', icon: Package, badge: metrics?.totalProducts },
    { id: 'schedule', label: 'Schedule & Bookings', icon: Calendar, badge: scheduleData?.pendingCount },
    { id: 'signups', label: 'Sign-Up Records', icon: UserPlus, badge: signupsData?.totalSignups },
    { id: 'logins', label: 'Login Sessions & Devices', icon: Smartphone, badge: loginSessionsData?.activeDevicesCount },
    { id: 'finances', label: 'Finances & Invoices', icon: DollarSign },
    { id: 'businesses', label: 'Businesses & Workspaces', icon: Building2, badge: metrics?.totalBusinesses },
    { id: 'users', label: 'Users & Roles', icon: Users, badge: metrics?.totalUsers },
    { id: 'integrations', label: 'Integrations', icon: Network, badge: metrics?.activeIntegrations },
    { id: 'automations', label: 'Automations', icon: Cpu, badge: metrics?.activeAutomations },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'settings', label: 'System Settings', icon: SlidersHorizontal }
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
            <img src="/logo-white.svg" alt="KREAZY AI" className="mac-sidebar-logo" />
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
                background: 'rgba(34, 197, 94, 0.14)',
                color: '#4ADE80',
                border: '1px solid rgba(34, 197, 94, 0.35)',
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

                    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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

          {/* AI BOOTCAMP WITH SADAT SAKIB: REGISTRATIONS MANAGEMENT */}
          {activeTab === 'bootcamp' && (
            <div className="mac-view-container">
              {/* Top Banner Notice */}
              <div style={{
                background: 'linear-gradient(135deg, #1C1917 0%, #291811 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                color: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #FF334B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF'
                  }}>
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                      AI Bootcamp Career Masterclass with Sadat Sakib
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#D6D3D1' }}>
                      Real-time attendee registrations for the 90-minute live interactive career masterclass.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <a
                    href="/aibootcampwithsadat"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 650,
                      color: '#FFFFFF',
                      textDecoration: 'none'
                    }}
                  >
                    <span>View Public Page</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              {/* KPI Metrics Grid */}
              <div className="mac-metrics-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-label">Total Registrations</span>
                    <div className="mac-metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                      <Users size={16} />
                    </div>
                  </div>
                  <div className="mac-metric-value">{bootcampData.totalRegistrations || 0}</div>
                  <div className="mac-metric-trend positive">
                    <span>100% Verified Submissions</span>
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-label">Confirmed Seats</span>
                    <div className="mac-metric-icon-wrap" style={{ background: 'rgba(15, 169, 104, 0.15)', color: '#0FA968' }}>
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="mac-metric-value">{bootcampData.confirmedSeats || 0}</div>
                  <div className="mac-metric-trend positive">
                    <span>Batch Capacity: 50 Max</span>
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-label">Primary Target Goal</span>
                    <div className="mac-metric-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' }}>
                      <Zap size={16} />
                    </div>
                  </div>
                  <div className="mac-metric-value" style={{ fontSize: '1.25rem' }}>AI Career & Agency</div>
                  <div className="mac-metric-trend positive">
                    <span>High-Income Transitions</span>
                  </div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-label">Lead Mentor</span>
                    <div className="mac-metric-icon-wrap" style={{ background: 'rgba(255, 51, 75, 0.15)', color: '#FF334B' }}>
                      <GraduationCap size={16} />
                    </div>
                  </div>
                  <div className="mac-metric-value" style={{ fontSize: '1.25rem' }}>Sadat Sakib</div>
                  <div className="mac-metric-trend positive">
                    <span>Founder @ Kreazy AI</span>
                  </div>
                </div>
              </div>

              {/* Registrations Table Panel */}
              <div className="mac-panel-card">
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">Masterclass Attendees ({bootcampData.totalRegistrations} Registered)</span>
                  </div>

                  <div className="mac-panel-tools">
                    <div className="mac-search-input-wrap">
                      <Search size={14} className="mac-search-icon" />
                      <input
                        type="text"
                        className="mac-search-input"
                        placeholder="Search attendee name, email, phone, role..."
                        value={bootcampSearch}
                        onChange={(e) => {
                          setBootcampSearch(e.target.value);
                          loadBootcampRegistrations(1, e.target.value, bootcampStatusFilter);
                        }}
                      />
                      {bootcampSearch && (
                        <button
                          type="button"
                          className="mac-search-clear"
                          onClick={() => {
                            setBootcampSearch('');
                            loadBootcampRegistrations(1, '', bootcampStatusFilter);
                          }}
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <select
                      className="mac-panel-select"
                      value={bootcampStatusFilter}
                      onChange={(e) => {
                        setBootcampStatusFilter(e.target.value);
                        loadBootcampRegistrations(1, bootcampSearch, e.target.value);
                      }}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="WAITLISTED">Waitlisted</option>
                      <option value="ATTENDED">Attended</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      className="mac-icon-btn"
                      onClick={() => loadBootcampRegistrations(bootcampData.page, bootcampSearch, bootcampStatusFilter)}
                      title="Refresh attendees"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>

                <div className="mac-table-container">
                  <table className="mac-data-table">
                    <thead>
                      <tr>
                        <th>Attendee Name</th>
                        <th>WhatsApp & Email</th>
                        <th>Professional Background</th>
                        <th>Primary Goal</th>
                        <th>Preferred Slot</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bootcampData.registrations.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                            <GraduationCap size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
                            <div>No bootcamp registrations found. Submissions from <code>/aibootcampwithsadat</code> will appear here automatically.</div>
                          </td>
                        </tr>
                      ) : (
                        bootcampData.registrations.map((attendee) => {
                          const cleanPhone = (attendee.phone || '').replace(/[^0-9]/g, '');
                          const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(attendee.full_name)},%20this%20is%20from%20Sadat%20Sakib's%20AI%20Bootcamp%20team!` : null;

                          return (
                            <tr key={attendee.id}>
                              <td>
                                <strong style={{ color: '#F8FAFC', fontSize: '13.5px', fontWeight: 650 }}>{attendee.full_name}</strong>
                                {attendee.questions && (
                                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={attendee.questions}>
                                    Q: "{attendee.questions}"
                                  </div>
                                )}
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <span style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '12px' }}>{attendee.email}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '12px' }}>{attendee.phone}</span>
                                    {waUrl && (
                                      <a
                                        href={waUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          background: '#25D366',
                                          color: '#FFFFFF',
                                          borderRadius: '4px',
                                          padding: '1px 5px',
                                          fontSize: '10px',
                                          fontWeight: 700,
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '2px'
                                        }}
                                        title="Send direct WhatsApp message"
                                      >
                                        WhatsApp
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  background: 'rgba(255, 255, 255, 0.08)',
                                  color: '#F1F5F9',
                                  border: '1px solid rgba(255, 255, 255, 0.12)',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: 600
                                }}>
                                  {attendee.current_role || 'Attendee'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '12px', color: '#F8FAFC', fontWeight: 550 }}>
                                  {attendee.primary_goal}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontSize: '11.5px', color: '#CBD5E1' }}>
                                  {attendee.preferred_slot || 'Next Saturday'}
                                </span>
                              </td>
                              <td>
                                <select
                                  value={attendee.status}
                                  onChange={(e) => handleUpdateBootcampStatus(attendee.id, e.target.value)}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    background: attendee.status === 'CONFIRMED' ? '#DEF7EC' : attendee.status === 'ATTENDED' ? '#E1EFFE' : '#FDF2E9',
                                    color: attendee.status === 'CONFIRMED' ? '#03543F' : attendee.status === 'ATTENDED' ? '#1E429F' : '#9F580A',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="WAITLISTED">WAITLISTED</option>
                                  <option value="ATTENDED">ATTENDED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBootcampRegistration(attendee.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#EF4444',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    padding: '2px 6px'
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              TENANTS & INVENTORY VIEW (MULTI-TENANT INVENTORY INSPECTOR)
              ========================================================== */}
          {activeTab === 'inventory' && (
            <div className="mac-view-container">
              <div className="mac-panel-card">
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">Multi-Tenant Customer Accounts & Live Inventory</span>
                  </div>

                  <div className="mac-panel-tools">
                    <div className="mac-search-input-wrap">
                      <Search size={14} className="mac-search-icon" />
                      <input
                        type="text"
                        className="mac-search-input"
                        placeholder="Search store name, customer owner, or email..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                      />
                      {inventorySearch && (
                        <button type="button" className="mac-clear-search-btn" onClick={() => setInventorySearch('')}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mac-table-container">
                  <table className="mac-data-table">
                    <thead>
                      <tr>
                        <th>CUSTOMER / STORE NAME</th>
                        <th>OWNER DETAILS</th>
                        <th>SUBSCRIPTION</th>
                        <th>TOTAL PRODUCTS</th>
                        <th>STOCK HEALTH</th>
                        <th>CATALOG VALUATION</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenantsInventory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="mac-empty-table-cell">
                            No merchant account holders found matching criteria.
                          </td>
                        </tr>
                      ) : (
                        tenantsInventory.map((tenant) => (
                          <tr key={tenant.businessId}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ color: '#F8FAFC', fontSize: '13.5px' }}>{tenant.businessName}</strong>
                                <span style={{ color: '#94A3B8', fontSize: '11.5px', fontFamily: 'monospace' }}>
                                  {tenant.slug || tenant.businessId}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{tenant.ownerName}</span>
                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>{tenant.ownerEmail}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: tenant.plan === 'Scale' ? 'rgba(56, 189, 248, 0.15)' : tenant.plan === 'Growth' ? 'rgba(192, 132, 252, 0.15)' : '#F3F4F6',
                                color: tenant.plan === 'Scale' ? '#1D4ED8' : tenant.plan === 'Growth' ? '#6D28D9' : '#374151'
                              }}>
                                {tenant.plan || 'Starter'}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#F8FAFC', fontSize: '13.5px' }}>
                                {tenant.totalProducts} {tenant.totalProducts === 1 ? 'Product' : 'Products'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', fontSize: '11.5px', flexWrap: 'wrap' }}>
                                <span style={{ color: '#059669', background: 'rgba(34, 197, 94, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                  {tenant.inStockCount} In Stock
                                </span>
                                {tenant.lowStockCount > 0 && (
                                  <span style={{ color: '#D97706', background: '#FFFBEB', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                    {tenant.lowStockCount} Low
                                  </span>
                                )}
                                {tenant.outOfStockCount > 0 && (
                                  <span style={{ color: '#DC2626', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                    {tenant.outOfStockCount} Out
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#059669' }}>
                                ${tenant.totalCatalogValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleInspectTenantProducts(tenant.businessId)}
                                  className="mac-action-btn"
                                  style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                                  title="Inspect product inventory details"
                                >
                                  <Eye size={13} />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEnterCustomerDashboard(tenant.businessId)}
                                  className="mac-action-btn"
                                  style={{ background: 'linear-gradient(135deg, #FF334B 0%, #D91D34 100%)', color: '#FFFFFF', border: 'none' }}
                                  title="Route directly into this customer's workspace dashboard"
                                >
                                  <LogIn size={13} />
                                  <span>Enter Dashboard</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              SCHEDULE & BOOKINGS VIEW (DEMO & FOUNDER SESSIONS)
              ========================================================== */}
          {activeTab === 'schedule' && (
            <div className="mac-view-container">
              {/* Summary KPIs */}
              <div className="mac-metrics-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">TOTAL SESSIONS</span>
                    <Calendar size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">{scheduleData.totalBookings}</div>
                  <div className="mac-metric-sub">Demo & strategy walkthroughs</div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">PENDING REVIEW</span>
                    <Clock size={16} className="mac-metric-icon" style={{ color: '#D97706' }} />
                  </div>
                  <div className="mac-metric-value" style={{ color: '#D97706' }}>{scheduleData.pendingCount}</div>
                  <div className="mac-metric-sub">Requires confirmation</div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">CONFIRMED ACTIVE</span>
                    <CheckCircle2 size={16} className="mac-metric-icon" style={{ color: '#059669' }} />
                  </div>
                  <div className="mac-metric-value" style={{ color: '#059669' }}>{scheduleData.confirmedCount}</div>
                  <div className="mac-metric-sub">Google Meet link generated</div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">COMPLETED SESSIONS</span>
                    <ShieldCheck size={16} className="mac-metric-icon" style={{ color: '#C084FC' }} />
                  </div>
                  <div className="mac-metric-value" style={{ color: '#C084FC' }}>{scheduleData.completedCount}</div>
                  <div className="mac-metric-sub">Consultations finalized</div>
                </div>
              </div>

              {/* Booking List Table */}
              <div className="mac-panel-card">
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">Client Bookings & Schedule Calendar</span>
                  </div>

                  <div className="mac-panel-tools">
                    <div className="mac-filter-tabs">
                      {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED'].map((filterKey) => (
                        <button
                          key={filterKey}
                          type="button"
                          className={`mac-filter-btn ${scheduleFilter === filterKey ? 'active' : ''}`}
                          onClick={() => setScheduleFilter(filterKey)}
                        >
                          {filterKey}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mac-table-container">
                  <table className="mac-data-table">
                    <thead>
                      <tr>
                        <th>CLIENT & STORE</th>
                        <th>CONTACT (EMAIL / PHONE)</th>
                        <th>CHANNEL & GOALS</th>
                        <th>PREFERRED TIME WINDOW</th>
                        <th>TYPE</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleData.bookings
                        .filter(b => scheduleFilter === 'ALL' || b.status === scheduleFilter)
                        .map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ color: '#F8FAFC', fontSize: '13.5px' }}>{booking.clientName}</strong>
                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>{booking.companyName}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: '#F8FAFC' }}>{booking.email}</span>
                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>{booking.phone}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{ fontSize: '12.5px', color: '#CBD5E1' }}>{booking.channel}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '12.5px', color: '#F8FAFC' }}>{booking.preferredDate}</strong>
                                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>{booking.preferredTime}</span>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: booking.type === 'FOUNDER' ? '#FEF3C7' : 'rgba(56, 189, 248, 0.15)',
                                color: booking.type === 'FOUNDER' ? '#B45309' : '#1D4ED8'
                              }}>
                                {booking.type === 'FOUNDER' ? 'Founder Call' : 'Live Demo'}
                              </span>
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: booking.status === 'CONFIRMED' ? 'rgba(34, 197, 94, 0.15)' : booking.status === 'COMPLETED' ? '#F3F4F6' : '#FFFBEB',
                                color: booking.status === 'CONFIRMED' ? '#059669' : booking.status === 'COMPLETED' ? '#4B5563' : '#D97706'
                              }}>
                                {booking.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                                {booking.status === 'PENDING' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateScheduleStatus(booking.type, booking.id, 'CONFIRMED')}
                                    className="mac-action-btn"
                                    style={{ background: '#059669', color: '#FFFFFF', border: 'none' }}
                                  >
                                    <Check size={12} />
                                    <span>Confirm</span>
                                  </button>
                                )}
                                <a
                                  href={booking.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mac-action-btn"
                                  style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#1D4ED8', border: '1px solid #BFDBFE', textDecoration: 'none' }}
                                >
                                  <ExternalLink size={12} />
                                  <span>Meet Link</span>
                                </a>
                                {booking.status !== 'COMPLETED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateScheduleStatus(booking.type, booking.id, 'COMPLETED')}
                                    className="mac-action-btn"
                                    style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', border: '1px solid rgba(255, 255, 255, 0.12)' }}
                                  >
                                    <span>Complete</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              SIGN-UP RECORDS VIEW (ALL REGISTERED USERS)
              ========================================================== */}
          {activeTab === 'signups' && (
            <div className="mac-view-container">
              {/* Regional Guarantee Notice Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #1E1B4B 0%, #311042 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Globe size={22} style={{ color: '#10B981' }} />
                  <div>
                    <strong style={{ fontSize: '14.5px', display: 'block' }}>Worldwide Merchant Registration Range</strong>
                    <span style={{ fontSize: '12.5px', color: '#D1D5DB' }}>
                      Users from USA, UK, Canada, Bangladesh, EU, UAE, Australia, and worldwide regions can register. India & Pakistan are strictly restricted.
                    </span>
                  </div>
                </div>
                <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10B981', border: '1px solid #10B981', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                  Active Filter: IN & PK Blocked
                </span>
              </div>

              <div className="mac-panel-card">
                <div className="mac-panel-header">
                  <div className="mac-panel-header-left">
                    <div className="mac-mini-traffic" aria-hidden="true">
                      <span className="mac-traffic-dot mac-dot-close" />
                      <span className="mac-traffic-dot mac-dot-minimize" />
                      <span className="mac-traffic-dot mac-dot-maximize" />
                    </div>
                    <span className="mac-panel-title">Merchant Sign-Up Records ({signupsData.totalSignups} Accounts)</span>
                  </div>

                  <div className="mac-panel-tools">
                    <div className="mac-search-input-wrap">
                      <Search size={14} className="mac-search-icon" />
                      <input
                        type="text"
                        className="mac-search-input"
                        placeholder="Search merchant name, email, or store..."
                        value={signupSearch}
                        onChange={(e) => setSignupSearch(e.target.value)}
                      />
                      {signupSearch && (
                        <button type="button" className="mac-clear-search-btn" onClick={() => setSignupSearch('')}>
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mac-table-container">
                  <table className="mac-data-table">
                    <thead>
                      <tr>
                        <th>CUSTOMER NAME</th>
                        <th>STORE / WORKSPACE</th>
                        <th>EMAIL</th>
                        <th>COUNTRY / REGION</th>
                        <th>SIGN-UP DATE</th>
                        <th>PLAN STATUS</th>
                        <th>VERIFICATION</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {signupsData.signups.map((signup) => (
                        <tr key={signup.id}>
                          <td>
                            <strong style={{ color: '#F8FAFC', fontSize: '13.5px' }}>{signup.name}</strong>
                          </td>
                          <td>
                            <span style={{ color: '#C084FC', fontWeight: 600 }}>{signup.businessName}</span>
                          </td>
                          <td>
                            <span style={{ color: '#94A3B8', fontFamily: 'monospace', fontSize: '12px' }}>{signup.email}</span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#1F2937'
                            }}>
                              <span>🌐</span>
                              <span>{signup.country}</span>
                            </span>
                          </td>
                          <td>
                            <span style={{ color: '#94A3B8', fontSize: '12px' }}>{formatDateTime(signup.createdAt)}</span>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: 'rgba(192, 132, 252, 0.15)',
                              color: '#6D28D9'
                            }}>
                              {signup.plan}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: signup.emailVerified ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: signup.emailVerified ? '#059669' : '#DC2626'
                            }}>
                              {signup.emailVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => handleEnterCustomerDashboard(signup.businessId || signup.id)}
                              className="mac-action-btn"
                              style={{ background: 'linear-gradient(135deg, #FF334B 0%, #D91D34 100%)', color: '#FFFFFF', border: 'none' }}
                            >
                              <LogIn size={12} />
                              <span>Enter Dashboard</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              LOGIN SESSIONS & ACTIVE DEVICES VIEW
              ========================================================== */}
          {activeTab === 'logins' && (
            <div className="mac-view-container">
              {/* Session KPIs */}
              <div className="mac-metrics-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">TOTAL RECORDED LOGINS</span>
                    <Smartphone size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">{loginSessionsData.totalSessions}</div>
                  <div className="mac-metric-sub">Historical authentication records</div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">ACTIVE ONLINE DEVICES</span>
                    <Radio size={16} className="mac-metric-icon" style={{ color: '#059669' }} />
                  </div>
                  <div className="mac-metric-value" style={{ color: '#059669' }}>
                    {loginSessionsData.activeDevicesCount || 1}
                  </div>
                  <div className="mac-metric-sub">Real-time connected sessions</div>
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
                    <span className="mac-panel-title">Login Authentication Records & Active Devices</span>
                  </div>
                </div>

                <div className="mac-table-container">
                  <table className="mac-data-table">
                    <thead>
                      <tr>
                        <th>USER & STORE</th>
                        <th>DEVICE & PLATFORM</th>
                        <th>BROWSER</th>
                        <th>IP ADDRESS</th>
                        <th>COUNTRY / REGION</th>
                        <th>LOGIN TIMESTAMP</th>
                        <th>SESSION STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loginSessionsData.sessions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="mac-empty-table-cell">
                            No active login sessions recorded in current database yet.
                          </td>
                        </tr>
                      ) : (
                        loginSessionsData.sessions.map((sess) => (
                          <tr key={sess.id}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ color: '#F8FAFC', fontSize: '13.5px' }}>{sess.user_name || sess.email}</strong>
                                <span style={{ color: '#94A3B8', fontSize: '12px' }}>{sess.business_name} ({sess.email})</span>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                background: 'rgba(255, 255, 255, 0.08)',
                                fontWeight: 600
                              }}>
                                <Laptop size={13} />
                                <span>{sess.device_type} • {sess.os}</span>
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12.5px', color: '#CBD5E1' }}>{sess.browser}</span>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94A3B8' }}>{sess.ip_address}</span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12.5px', color: '#F8FAFC', fontWeight: 500 }}>{sess.country}</span>
                            </td>
                            <td>
                              <span style={{ color: '#94A3B8', fontSize: '12px' }}>{formatDateTime(sess.created_at)}</span>
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: sess.is_active ? 'rgba(34, 197, 94, 0.15)' : '#F3F4F6',
                                color: sess.is_active ? '#059669' : '#6B7280'
                              }}>
                                {sess.is_active ? 'Active Session' : 'Expired'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================================
              FINANCES & INVOICES VIEW
              ========================================================== */}
          {activeTab === 'finances' && (
            <div className="mac-view-container">
              {/* Financial KPIs */}
              <div className="mac-metrics-grid" style={{ marginBottom: '1.25rem' }}>
                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">TOTAL PLATFORM REVENUE</span>
                    <DollarSign size={16} className="mac-metric-icon" style={{ color: '#059669' }} />
                  </div>
                  <div className="mac-metric-value" style={{ color: '#059669' }}>
                    ${Number(metrics?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="mac-metric-sub">Cumulative confirmed subscriptions & orders</div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">ESTIMATED MRR</span>
                    <Zap size={16} className="mac-metric-icon" style={{ color: '#6D28D9' }} />
                  </div>
                  <div className="mac-metric-value" style={{ color: '#6D28D9' }}>
                    ${(Number(metrics?.activeBusinesses || 1) * 119).toLocaleString()}
                  </div>
                  <div className="mac-metric-sub">Monthly Recurring Revenue projection</div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">ACTIVE SUBSCRIPTIONS</span>
                    <CreditCard size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">{metrics?.activeBusinesses || 0}</div>
                  <div className="mac-metric-sub">Active billing accounts</div>
                </div>

                <div className="mac-metric-card">
                  <div className="mac-metric-top">
                    <span className="mac-metric-title">PROJECTED ARR</span>
                    <DollarSign size={16} className="mac-metric-icon" />
                  </div>
                  <div className="mac-metric-value">
                    ${(Number(metrics?.activeBusinesses || 1) * 119 * 12).toLocaleString()}
                  </div>
                  <div className="mac-metric-sub">Annual Recurring Revenue baseline</div>
                </div>
              </div>

              {/* Plans Tier Breakdown */}
              <div className="mac-plans-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div className="mac-panel-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1' }}>STARTER TIER</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>$49 / mo</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 12px 0' }}>
                    1,000 automated conversations • 1 WhatsApp Business line • Real-time stock sync
                  </p>
                  <span style={{ fontSize: '11px', color: '#059669', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    ~৳5,880 BDT / month
                  </span>
                </div>

                <div className="mac-panel-card" style={{ padding: '20px', border: '1.5px solid #FF334B' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#C084FC' }}>GROWTH TIER (MOST POPULAR)</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#C084FC' }}>$119 / mo</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 12px 0' }}>
                    5,000 automated conversations • WhatsApp + Instagram + Messenger • Automated checkout
                  </p>
                  <span style={{ fontSize: '11px', color: '#C084FC', background: 'rgba(192, 132, 252, 0.15)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    ~৳14,280 BDT / month
                  </span>
                </div>

                <div className="mac-panel-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8' }}>SCALE ENTERPRISE</span>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>$299 / mo</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 12px 0' }}>
                    25,000 automated conversations • Dedicated AI model training • Multi-agent handoff
                  </p>
                  <span style={{ fontSize: '11px', color: '#1D4ED8', background: 'rgba(56, 189, 248, 0.15)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    ~৳35,880 BDT / month
                  </span>
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
    
      {/* ==============================================================
          TENANT PRODUCTS INSPECTOR MODAL
          ============================================================== */}
      {selectedTenantProducts && (
        <div className="mac-modal-backdrop" onClick={() => setSelectedTenantProducts(null)}>
          <div className="mac-modal-window" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="mac-modal-titlebar">
              <div className="mac-mini-traffic" aria-hidden="true">
                <span className="mac-traffic-dot mac-dot-close" onClick={() => setSelectedTenantProducts(null)} style={{ cursor: 'pointer' }} />
                <span className="mac-traffic-dot mac-dot-minimize" />
                <span className="mac-traffic-dot mac-dot-maximize" />
              </div>
              <span className="mac-modal-window-title">
                Customer Inventory: {selectedTenantProducts.business?.name} ({selectedTenantProducts.productsCount} SKUs)
              </span>
              <button
                type="button"
                className="mac-modal-close-icon-btn"
                onClick={() => setSelectedTenantProducts(null)}
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mac-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '14px',
                borderBottom: '1px solid #ECECF0',
                marginBottom: '16px'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#F8FAFC' }}>
                    {selectedTenantProducts.business?.name} Product Catalog
                  </h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                    Managed by {selectedTenantProducts.business?.ownerName} ({selectedTenantProducts.business?.ownerEmail}) • Plan: {selectedTenantProducts.business?.plan}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const bId = selectedTenantProducts.business?.id;
                    setSelectedTenantProducts(null);
                    handleEnterCustomerDashboard(bId);
                  }}
                  className="mac-action-btn"
                  style={{ background: 'linear-gradient(135deg, #FF334B 0%, #D91D34 100%)', color: '#FFFFFF', border: 'none', padding: '6px 12px' }}
                >
                  <LogIn size={13} />
                  <span>Enter Dashboard to Edit</span>
                </button>
              </div>

              {selectedTenantProducts.products.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94A3B8', padding: '30px 0' }}>
                  No products cataloged in this customer store yet.
                </p>
              ) : (
                <table className="mac-data-table">
                  <thead>
                    <tr>
                      <th>PRODUCT NAME</th>
                      <th>SKU</th>
                      <th>CATEGORY</th>
                      <th>PRICE</th>
                      <th>STOCK</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTenantProducts.products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                <Package size={16} />
                              </div>
                            )}
                            <strong style={{ color: '#F8FAFC', fontSize: '13px' }}>{p.name}</strong>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94A3B8' }}>{p.sku}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#94A3B8' }}>{p.category}</span>
                        </td>
                        <td>
                          <strong style={{ color: '#059669', fontSize: '13px' }}>${p.price.toFixed(2)}</strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: p.stock > 0 ? '#111827' : '#DC2626' }}>
                            {p.stock}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: p.stock > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: p.stock > 0 ? '#059669' : '#DC2626'
                          }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
