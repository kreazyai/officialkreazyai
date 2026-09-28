import React, { useState, useEffect } from 'react';
import { Navbar } from './components/website/Navbar';
import { Footer } from './components/website/Footer';
import { HomePage } from './pages/website/HomePage';
import { HowItWorksPage } from './pages/website/HowItWorksPage';
import { FeaturesPage } from './pages/website/FeaturesPage';
import { PricingPage } from './pages/website/PricingPage';
import { AboutPage } from './pages/website/AboutPage';
import { ContactPage } from './pages/website/ContactPage';
import { BookDemoPage } from './pages/website/BookDemoPage';
import { FounderMeetingPage } from './pages/website/FounderMeetingPage';
import { FaqPage } from './pages/website/FaqPage';
import { LegalPage } from './pages/website/LegalPage';

// Auth & Onboarding
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';

// Merchant Dashboard Components & Pages
import { Sidebar } from './components/dashboard/Sidebar';
import { TopHeader } from './components/dashboard/TopHeader';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { MessagesPage } from './pages/dashboard/MessagesPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { ProductsPage } from './pages/dashboard/ProductsPage';
import { CustomersPage } from './pages/dashboard/CustomersPage';
import { IntegrationsPage } from './pages/dashboard/IntegrationsPage';
import { AiAssistantPage } from './pages/dashboard/AiAssistantPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

// Dedicated Platform Admin Portal (Protected Gateway)
import { AdminPortal } from './pages/admin/AdminPortal';

import { authService } from './services/api';

export default function App() {
  // Check if running on dedicated admin port 5174 or /admin pathname
  const isDedicatedAdminPort = window.location.port === '5174' || window.location.pathname.startsWith('/admin');

  // Navigation State
  const [currentPage, setCurrentPage] = useState(() => {
    if (isDedicatedAdminPort) return 'admin';
    return 'home';
  });

  // Dashboard Sub-module state:
  const [currentDashboardModule, setCurrentDashboardModule] = useState('overview');

  // Mobile state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authenticated merchant user state
  const [user, setUser] = useState(null);

  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    setUser(activeUser);

    // Sync with browser history/popstate
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path.startsWith('admin') || window.location.port === '5174') {
        setCurrentPage('admin');
      } else if (path === 'founder-meeting') {
        setCurrentPage('founder-meeting');
      } else if (path === 'book-demo') {
        setCurrentPage('book-demo');
      } else if (path === 'services' || path === 'features') {
        setCurrentPage('features');
      } else if (path === 'pricing') {
        setCurrentPage('pricing');
      } else if (path === 'about') {
        setCurrentPage('about');
      } else if (path === 'contact') {
        setCurrentPage('contact');
      } else if (path === 'login') {
        setCurrentPage('login');
      } else if (path === 'register' || path === 'signup') {
        setCurrentPage('signup');
      } else if (path === 'dashboard') {
        setCurrentPage('dashboard');
      }
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const urlMap = {
      home: '/',
      admin: '/admin',
      dashboard: '/dashboard',
      pricing: '/pricing',
      about: '/about',
      contact: '/contact',
      services: '/services',
      features: '/services',
      'book-demo': '/book-demo',
      'founder-meeting': '/founder-meeting',
      login: '/login',
      signup: '/register',
      register: '/register',
      faq: '/faq',
      'legal-privacy': '/legal-privacy',
      'legal-terms': '/legal-terms'
    };
    const targetUrl = urlMap[page] || '/';
    window.history.pushState({}, '', targetUrl);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('home');
  };

  // If on Admin Port (5174) or /admin route, serve the isolated Admin Portal
  if (currentPage === 'admin' || isDedicatedAdminPort) {
    return <AdminPortal onNavigate={handleNavigate} />;
  }

  const isDashboardView = currentPage === 'dashboard';
  const isAuthView = ['login', 'signup', 'register', 'forgot-password', 'onboarding'].includes(currentPage);

  return (
    <div className="app-root">
      {/* -------------------------------------------------------------
          1. MERCHANT WORKSPACE DASHBOARD
          ------------------------------------------------------------- */}
      {isDashboardView ? (
        <div className="app-shell">
          <Sidebar
            currentModule={currentDashboardModule}
            onSelectModule={(mod) => setCurrentDashboardModule(mod)}
            onLogout={handleLogout}
            onVisitWebsite={() => setCurrentPage('home')}
            isMobileOpen={mobileSidebarOpen}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            user={user}
          />

          <main className="app-main">
            <TopHeader
              user={user}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onNavigateModule={(mod) => setCurrentDashboardModule(mod)}
              onLogout={handleLogout}
            />

            {currentDashboardModule === 'overview' && (
              <DashboardOverview user={user} onNavigateModule={(mod) => setCurrentDashboardModule(mod)} />
            )}

            {currentDashboardModule === 'messages' && (
              <MessagesPage />
            )}

            {currentDashboardModule === 'orders' && (
              <OrdersPage onOpenConversation={() => setCurrentDashboardModule('messages')} />
            )}

            {currentDashboardModule === 'products' && (
              <ProductsPage />
            )}

            {currentDashboardModule === 'customers' && (
              <CustomersPage onOpenMessages={() => setCurrentDashboardModule('messages')} />
            )}

            {currentDashboardModule === 'integrations' && (
              <IntegrationsPage />
            )}

            {currentDashboardModule === 'ai-assistant' && (
              <AiAssistantPage />
            )}

            {(currentDashboardModule === 'analytics' || currentDashboardModule === 'revenue') && (
              <AnalyticsPage />
            )}

            {currentDashboardModule === 'settings' && (
              <SettingsPage user={user} />
            )}
          </main>
        </div>
      ) : isAuthView ? (
        /* -------------------------------------------------------------
           2. AUTHENTICATION & ONBOARDING VIEWS
           ------------------------------------------------------------- */
        <div>
          {currentPage === 'login' && (
            <LoginPage 
              onNavigate={handleNavigate} 
              onLoginSuccess={handleLoginSuccess} 
            />
          )}

          {(currentPage === 'signup' || currentPage === 'register') && (
            <SignUpPage 
              onNavigate={handleNavigate} 
              onLoginSuccess={handleLoginSuccess} 
            />
          )}

          {currentPage === 'forgot-password' && (
            <ForgotPasswordPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'onboarding' && (
            <OnboardingPage onNavigate={handleNavigate} user={user} />
          )}
        </div>
      ) : (
        /* -------------------------------------------------------------
           3. PUBLIC MARKETING WEBSITE
           ------------------------------------------------------------- */
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
          />

          <main style={{ flexGrow: 1 }}>
            {currentPage === 'home' && (
              <HomePage onNavigate={handleNavigate} />
            )}

            {currentPage === 'how-it-works' && (
              <HowItWorksPage onNavigate={handleNavigate} />
            )}

            {(currentPage === 'features' || currentPage === 'services') && (
              <FeaturesPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'pricing' && (
              <PricingPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'about' && (
              <AboutPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'contact' && (
              <ContactPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'book-demo' && (
              <BookDemoPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'founder-meeting' && (
              <FounderMeetingPage onNavigate={handleNavigate} />
            )}

            {currentPage === 'faq' && (
              <FaqPage />
            )}

            {currentPage === 'legal-privacy' && (
              <LegalPage initialTab="privacy" />
            )}

            {currentPage === 'legal-terms' && (
              <LegalPage initialTab="terms" />
            )}
          </main>

          <Footer onNavigate={handleNavigate} />
        </div>
      )}
    </div>
  );
}
