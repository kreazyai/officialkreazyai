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

// Responsive Device Preview System (Clean Architecture)
import { DevicePreview } from './components/DevicePreview/DevicePreview';
import { FloatingPreviewLauncher } from './components/DevicePreview/FloatingPreviewLauncher';

import { authService } from './services/api';

export default function App() {
  // Check if running on dedicated admin port 5174 or /admin pathname
  const isDedicatedAdminPort = window.location.port === '5174' || window.location.pathname.startsWith('/admin');

  // Check URL parameters for embedded preview or preview route
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedded = urlParams.get('embedded') === 'true';
  const previewRoute = urlParams.get('preview_route');
  const isPreviewParam = urlParams.get('preview') === 'true' || window.location.pathname.startsWith('/preview');

  // Navigation State
  const [currentPage, setCurrentPage] = useState(() => {
    if (isDedicatedAdminPort) return 'admin';
    if (isEmbedded && previewRoute) return previewRoute;
    if (isPreviewParam) return 'preview';
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
      const params = new URLSearchParams(window.location.search);
      if (window.location.pathname.startsWith('/admin') || window.location.port === '5174') {
        setCurrentPage('admin');
      } else if (window.location.pathname.startsWith('/preview') || params.get('preview') === 'true') {
        setCurrentPage('preview');
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else if (page === 'preview') {
      window.history.pushState({}, '', '/preview');
    } else if (page === 'home') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('home');
  };

  // If in Device Preview Mode, render the full-screen interactive device preview workspace
  if (currentPage === 'preview') {
    return (
      <DevicePreview 
        onClose={() => handleNavigate('home')} 
        initialRoute="home"
      />
    );
  }

  // If on Admin Port (5174) or /admin route, serve the isolated Admin Portal
  if (currentPage === 'admin' || isDedicatedAdminPort) {
    return <AdminPortal onNavigate={handleNavigate} />;
  }

  const isDashboardView = currentPage === 'dashboard';
  const isAuthView = ['login', 'signup', 'forgot-password', 'onboarding'].includes(currentPage);

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
          />

          <main className="app-main">
            <TopHeader
              user={user}
              onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              onNavigateModule={(mod) => setCurrentDashboardModule(mod)}
              onLogout={handleLogout}
            />

            {currentDashboardModule === 'overview' && (
              <DashboardOverview onNavigateModule={(mod) => setCurrentDashboardModule(mod)} />
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

          {currentPage === 'signup' && (
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

            {currentPage === 'features' && (
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

      {/* Floating Device Preview Launcher (accessible across all pages unless embedded in iframe) */}
      {!isEmbedded && !isDedicatedAdminPort && (
        <FloatingPreviewLauncher onClick={() => handleNavigate('preview')} />
      )}
    </div>
  );
}
