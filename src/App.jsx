import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { AlertCircle, LayoutDashboard } from 'lucide-react';
import { Button } from './components/common/Button';

// ─── Eagerly loaded (small, always needed) ───────────────────────────────────
import { Navbar } from './components/website/Navbar';
import { Footer } from './components/website/Footer';
import { WebsiteChatWidget } from './components/website/WebsiteChatWidget';
import { Sidebar } from './components/dashboard/Sidebar';
import { TopHeader } from './components/dashboard/TopHeader';
import { AuthProvider, useAuth } from './context/AuthContext';

// ─── Website pages (lazy-loaded on first navigation) ─────────────────────────
const HomePage            = lazy(() => import('./pages/website/HomePage').then(m => ({ default: m.HomePage })));
const SolutionsPage       = lazy(() => import('./pages/website/SolutionsPage').then(m => ({ default: m.SolutionsPage })));
const AiAgentsPage        = lazy(() => import('./pages/website/AiAgentsPage').then(m => ({ default: m.AiAgentsPage })));
const WebsiteIntegrationsPage = lazy(() => import('./pages/website/WebsiteIntegrationsPage').then(m => ({ default: m.WebsiteIntegrationsPage })));
const HowItWorksPage      = lazy(() => import('./pages/website/HowItWorksPage').then(m => ({ default: m.HowItWorksPage })));
const FeaturesPage        = lazy(() => import('./pages/website/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const PricingPage         = lazy(() => import('./pages/website/PricingPage').then(m => ({ default: m.PricingPage })));
const AboutPage           = lazy(() => import('./pages/website/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage         = lazy(() => import('./pages/website/ContactPage').then(m => ({ default: m.ContactPage })));
const BookDemoPage        = lazy(() => import('./pages/website/BookDemoPage').then(m => ({ default: m.BookDemoPage })));
const FounderMeetingPage  = lazy(() => import('./pages/website/FounderMeetingPage').then(m => ({ default: m.FounderMeetingPage })));
const FaqPage             = lazy(() => import('./pages/website/FaqPage').then(m => ({ default: m.FaqPage })));
const LegalPage           = lazy(() => import('./pages/website/LegalPage').then(m => ({ default: m.LegalPage })));

// ─── Auth & Onboarding pages (lazy-loaded) ───────────────────────────────────
const LoginPage           = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const SignUpPage          = lazy(() => import('./pages/auth/SignUpPage').then(m => ({ default: m.SignUpPage })));
const ForgotPasswordPage  = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const OnboardingPage      = lazy(() => import('./pages/auth/OnboardingPage').then(m => ({ default: m.OnboardingPage })));

// ─── Merchant Dashboard modules (largest files — aggressive code-splitting) ──
const DashboardOverview   = lazy(() => import('./pages/dashboard/DashboardOverview').then(m => ({ default: m.DashboardOverview })));
const MessagesPage        = lazy(() => import('./pages/dashboard/MessagesPage').then(m => ({ default: m.MessagesPage })));
const OrdersPage          = lazy(() => import('./pages/dashboard/OrdersPage').then(m => ({ default: m.OrdersPage })));
const ProductsPage        = lazy(() => import('./pages/dashboard/ProductsPage').then(m => ({ default: m.ProductsPage })));
const CustomersPage       = lazy(() => import('./pages/dashboard/CustomersPage').then(m => ({ default: m.CustomersPage })));
const IntegrationsPage    = lazy(() => import('./pages/dashboard/IntegrationsPage').then(m => ({ default: m.IntegrationsPage })));
const AiAssistantPage     = lazy(() => import('./pages/dashboard/AiAssistantPage').then(m => ({ default: m.AiAssistantPage })));
const AnalyticsPage       = lazy(() => import('./pages/dashboard/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const RevenuePage         = lazy(() => import('./pages/dashboard/RevenuePage').then(m => ({ default: m.RevenuePage })));
const BillingPage         = lazy(() => import('./pages/dashboard/BillingPage').then(m => ({ default: m.BillingPage })));
const SettingsPage        = lazy(() => import('./pages/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })));

// ─── Admin Portal (largest single view — isolated chunk) ─────────────────────
const AdminPortal         = lazy(() => import('./pages/admin/AdminPortal').then(m => ({ default: m.AdminPortal })));

// ─── Shared loading fallback ──────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '14px',
      color: 'var(--primary-accent)',
      fontFamily: 'var(--font-sans, system-ui)'
    }}>
      <img src="/logo-dark.svg" alt="KreazyAI" style={{ height: '26px', width: 'auto', opacity: 0.9, marginBottom: '4px' }} />
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid rgba(189, 211, 148, 0.2)',
        borderTop: '3px solid var(--primary-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Loading…</span>
    </div>
  );
}

export const VALID_DASHBOARD_MODULES = [
  'overview',
  'messages',
  'orders',
  'products',
  'customers',
  'integrations',
  'ai-assistant',
  'analytics',
  'revenue',
  'billing',
  'settings'
];

function getRouteStateFromUrl() {
  if (typeof window === 'undefined') {
    return { page: 'home', dashboardModule: 'overview', rawPath: '/' };
  }

  const isDedicatedAdminPort = window.location.port === '5174' || window.location.pathname.startsWith('/admin');
  if (isDedicatedAdminPort) {
    return { page: 'admin', dashboardModule: null, rawPath: window.location.pathname };
  }

  const pathname = window.location.pathname;
  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    return { page: 'home', dashboardModule: null, rawPath: '/' };
  }

  const root = segments[0].toLowerCase();

  if (root === 'admin') {
    return { page: 'admin', dashboardModule: null, rawPath: pathname };
  }

  if (root === 'dashboard') {
    const sub = segments[1] ? segments[1].toLowerCase() : null;
    if (!sub) {
      // /dashboard -> redirect to /dashboard/overview
      return {
        page: 'dashboard',
        dashboardModule: 'overview',
        shouldRedirectToOverview: true,
        rawPath: pathname
      };
    }
    if (VALID_DASHBOARD_MODULES.includes(sub)) {
      return {
        page: 'dashboard',
        dashboardModule: sub,
        subRoute: segments[2] ? segments[2].toLowerCase() : null,
        shouldRedirectToOverview: false,
        rawPath: pathname
      };
    }
    // Invalid dashboard module -> 404
    return {
      page: 'dashboard',
      dashboardModule: 'not-found',
      invalidModule: sub,
      shouldRedirectToOverview: false,
      rawPath: pathname
    };
  }

  // Auth & Onboarding
  if (root === 'login') return { page: 'login', dashboardModule: null, rawPath: pathname };
  if (root === 'signup' || root === 'register') return { page: 'signup', dashboardModule: null, rawPath: pathname };
  if (root === 'forgot-password') return { page: 'forgot-password', dashboardModule: null, rawPath: pathname };
  if (root === 'onboarding') return { page: 'onboarding', dashboardModule: null, rawPath: pathname };

  // Website marketing pages
  if (root === 'solutions' || root === 'services' || root === 'features') return { page: 'solutions', dashboardModule: null, rawPath: pathname };
  if (root === 'ai-agents' || root === 'agents') return { page: 'ai-agents', dashboardModule: null, rawPath: pathname };
  if (root === 'integrations') return { page: 'integrations', dashboardModule: null, rawPath: pathname };
  if (root === 'pricing') return { page: 'pricing', dashboardModule: null, rawPath: pathname };
  if (root === 'about') return { page: 'about', dashboardModule: null, rawPath: pathname };
  if (root === 'contact') return { page: 'contact', dashboardModule: null, rawPath: pathname };
  if (root === 'how-it-works') return { page: 'how-it-works', dashboardModule: null, rawPath: pathname };
  if (root === 'book-demo') return { page: 'book-demo', dashboardModule: null, rawPath: pathname };
  if (root === 'founder-meeting') return { page: 'founder-meeting', dashboardModule: null, rawPath: pathname };
  if (root === 'faq' || root === 'resources') return { page: 'faq', dashboardModule: null, rawPath: pathname };
  if (root === 'legal-privacy') return { page: 'legal-privacy', dashboardModule: null, rawPath: pathname };
  if (root === 'legal-terms') return { page: 'legal-terms', dashboardModule: null, rawPath: pathname };

  return { page: 'home', dashboardModule: null, rawPath: pathname };
}

function DashboardNotFound({ invalidModule, onNavigateOverview }) {
  return (
    <div className="dashboard-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        maxWidth: '520px',
        width: '100%',
        textAlign: 'center',
        padding: '2.5rem 2rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <AlertCircle size={28} color="#f87171" />
        </div>
        <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
          Dashboard Route Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          The requested dashboard section <strong style={{ color: 'var(--soft-olive)' }}>"{invalidModule}"</strong> does not exist. Please check the URL or return to Overview.
        </p>
        <Button
          variant="primary"
          size="md"
          onClick={onNavigateOverview}
          icon={LayoutDashboard}
          style={{ margin: '0 auto' }}
        >
          Return to Dashboard Overview
        </Button>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, authStatus, isAuthenticated, isLoading, logout } = useAuth();

  // Check if running on dedicated admin port 5174 or /admin pathname
  const isDedicatedAdminPort = typeof window !== 'undefined' && (window.location.port === '5174' || window.location.pathname.startsWith('/admin'));

  // Route state initialized directly from URL (Single source of truth)
  const [routeState, setRouteState] = useState(() => getRouteStateFromUrl());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync with browser history/popstate (Back/Forward buttons)
  useEffect(() => {
    const handleLocationChange = () => {
      setRouteState(getRouteStateFromUrl());
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Handle /dashboard -> /dashboard/overview auto-redirect
  useEffect(() => {
    if (routeState.page === 'dashboard' && routeState.shouldRedirectToOverview) {
      window.history.replaceState({}, '', '/dashboard/overview');
      setRouteState(getRouteStateFromUrl());
    }
  }, [routeState.page, routeState.shouldRedirectToOverview]);

  // Protected & Auth Route guards:
  // - If user visits dashboard while unauthenticated (and not loading), redirect to login
  // - If user visits login/signup while authenticated, redirect to dashboard/overview
  useEffect(() => {
    if (isLoading) return; // Wait until authentication resolution is complete

    if (routeState.page === 'dashboard' && !isAuthenticated) {
      window.history.replaceState({}, '', '/login');
      setRouteState(getRouteStateFromUrl());
    } else if ((routeState.page === 'login' || routeState.page === 'signup') && isAuthenticated) {
      window.history.replaceState({}, '', '/dashboard/overview');
      setRouteState(getRouteStateFromUrl());
    }
  }, [routeState.page, isAuthenticated, isLoading]);

  const navigateTo = useCallback((targetPath) => {
    if (window.location.pathname === targetPath) return;
    window.history.pushState({}, '', targetPath);
    setRouteState(getRouteStateFromUrl());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigate = useCallback((pageOrPath) => {
    const urlMap = {
      home: '/',
      admin: '/admin',
      dashboard: '/dashboard/overview',
      solutions: '/solutions',
      services: '/solutions',
      features: '/solutions',
      'ai-agents': '/ai-agents',
      agents: '/ai-agents',
      integrations: '/integrations',
      'how-it-works': '/how-it-works',
      pricing: '/pricing',
      about: '/about',
      contact: '/contact',
      'book-demo': '/book-demo',
      'founder-meeting': '/founder-meeting',
      login: '/login',
      signup: '/register',
      register: '/register',
      faq: '/faq',
      resources: '/faq',
      'forgot-password': '/forgot-password',
      onboarding: '/onboarding',
      'legal-privacy': '/legal-privacy',
      'legal-terms': '/legal-terms'
    };

    let targetUrl;
    if (typeof pageOrPath === 'string' && pageOrPath.startsWith('/')) {
      targetUrl = pageOrPath;
    } else if (urlMap[pageOrPath]) {
      targetUrl = urlMap[pageOrPath];
    } else if (VALID_DASHBOARD_MODULES.includes(pageOrPath)) {
      targetUrl = `/dashboard/${pageOrPath}`;
    } else {
      targetUrl = `/${pageOrPath || ''}`;
    }

    navigateTo(targetUrl);
  }, [navigateTo]);

  const handleNavigateModule = useCallback((mod) => {
    const cleanMod = mod.startsWith('/dashboard/') ? mod.replace('/dashboard/', '') : mod.replace(/^\//, '');
    navigateTo(`/dashboard/${cleanMod}`);
  }, [navigateTo]);

  const handleLogout = () => {
    logout();
    setMobileSidebarOpen(false);
    navigateTo('/');
  };

  // If on Admin Port (5174) or /admin route, serve the isolated Admin Portal
  if (routeState.page === 'admin' || isDedicatedAdminPort) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminPortal onNavigate={handleNavigate} />
      </Suspense>
    );
  }

  // If viewing dashboard while session is loading, show page loader
  if (routeState.page === 'dashboard' && isLoading) {
    return <PageLoader />;
  }

  const isDashboardView = routeState.page === 'dashboard';
  const isAuthView = ['login', 'signup', 'register', 'forgot-password', 'onboarding'].includes(routeState.page);
  const currentDashboardModule = routeState.dashboardModule;

  return (
    <div className="app-root">
      {/* -------------------------------------------------------------
          1. MERCHANT WORKSPACE DASHBOARD (PERSISTENT LAYOUT)
          ------------------------------------------------------------- */}
      {isDashboardView ? (
        <div className="app-shell">
          <Sidebar
            currentModule={currentDashboardModule}
            onSelectModule={(id, path) => navigateTo(path || `/dashboard/${id}`)}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            isMobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            user={user}
          />

          <main className="app-main">
            <TopHeader
              user={user}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onNavigateModule={handleNavigateModule}
              onNavigate={handleNavigate}
              onLogout={handleLogout}
            />

            <Suspense fallback={<PageLoader />}>
              {currentDashboardModule === 'overview' && (
                <DashboardOverview user={user} onNavigateModule={handleNavigateModule} />
              )}

              {currentDashboardModule === 'messages' && (
                <MessagesPage user={user} onNavigateModule={handleNavigateModule} />
              )}

              {currentDashboardModule === 'orders' && (
                <OrdersPage
                  user={user}
                  onOpenConversation={() => navigateTo('/dashboard/messages')}
                  onNavigateModule={handleNavigateModule}
                />
              )}

              {currentDashboardModule === 'products' && (
                <ProductsPage
                  user={user}
                  onNavigateModule={handleNavigateModule}
                />
              )}

              {currentDashboardModule === 'customers' && (
                <CustomersPage
                  user={user}
                  onOpenMessages={() => navigateTo('/dashboard/messages')}
                  onNavigateModule={handleNavigateModule}
                />
              )}

              {currentDashboardModule === 'integrations' && (
                <IntegrationsPage
                  subRoute={routeState.subRoute}
                  onNavigateSubRoute={(sub) => {
                    navigateTo(sub ? `/dashboard/integrations/${sub}` : '/dashboard/integrations');
                  }}
                />
              )}

              {currentDashboardModule === 'ai-assistant' && (
                <AiAssistantPage />
              )}

              {currentDashboardModule === 'analytics' && (
                <AnalyticsPage user={user} />
              )}

              {currentDashboardModule === 'revenue' && (
                <RevenuePage user={user} />
              )}

              {currentDashboardModule === 'billing' && (
                <BillingPage user={user} />
              )}

              {currentDashboardModule === 'settings' && (
                <SettingsPage user={user} onLogout={handleLogout} />
              )}

              {currentDashboardModule === 'not-found' && (
                <DashboardNotFound
                  invalidModule={routeState.invalidModule}
                  onNavigateOverview={() => navigateTo('/dashboard/overview')}
                />
              )}
            </Suspense>
          </main>
        </div>
      ) : isAuthView ? (
        /* -------------------------------------------------------------
           2. AUTHENTICATION & ONBOARDING VIEWS
           ------------------------------------------------------------- */
        <Suspense fallback={<PageLoader />}>
          {routeState.page === 'login' && (
            <LoginPage
              onNavigate={handleNavigate}
            />
          )}

          {(routeState.page === 'signup' || routeState.page === 'register') && (
            <SignUpPage
              onNavigate={handleNavigate}
            />
          )}

          {routeState.page === 'forgot-password' && (
            <ForgotPasswordPage onNavigate={handleNavigate} />
          )}

          {routeState.page === 'onboarding' && (
            <OnboardingPage onNavigate={handleNavigate} user={user} />
          )}
        </Suspense>
      ) : (
        /* -------------------------------------------------------------
           3. PUBLIC MARKETING WEBSITE
           ------------------------------------------------------------- */
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar
            currentPage={routeState.page}
            onNavigate={handleNavigate}
            user={user}
            onLogout={handleLogout}
          />

          <main style={{ flexGrow: 1 }}>
            <Suspense fallback={<PageLoader />}>
              {routeState.page === 'home' && (
                <HomePage onNavigate={handleNavigate} user={user} />
              )}

              {routeState.page === 'solutions' && (
                <SolutionsPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'ai-agents' && (
                <AiAgentsPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'integrations' && (
                <WebsiteIntegrationsPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'how-it-works' && (
                <HowItWorksPage onNavigate={handleNavigate} />
              )}

              {(routeState.page === 'features' || routeState.page === 'services') && (
                <SolutionsPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'pricing' && (
                <PricingPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'about' && (
                <AboutPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'contact' && (
                <ContactPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'book-demo' && (
                <BookDemoPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'founder-meeting' && (
                <FounderMeetingPage onNavigate={handleNavigate} />
              )}

              {routeState.page === 'faq' && (
                <FaqPage />
              )}

              {routeState.page === 'legal-privacy' && (
                <LegalPage initialTab="privacy" />
              )}

              {routeState.page === 'legal-terms' && (
                <LegalPage initialTab="terms" />
              )}
            </Suspense>
          </main>

          <Footer onNavigate={handleNavigate} />
          <WebsiteChatWidget />
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
