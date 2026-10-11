import React, { useState, useEffect, useCallback } from 'react';
import { IntegrationsOverview } from './integrations/IntegrationsOverview';
import { WhatsAppIntegrationPage } from './integrations/WhatsAppIntegrationPage';
import { whatsappApiService } from '../../services/api';

/**
 * KreazyAI Integrations Hub
 * Orchestrates the 3-card macOS-inspired overview and the dedicated WhatsApp Automation page.
 */
export function IntegrationsPage({ subRoute, onNavigateSubRoute }) {
  // Determine initial view from prop or URL
  const determineView = useCallback(() => {
    if (subRoute === 'whatsapp') return 'whatsapp';
    if (typeof window !== 'undefined' && window.location.pathname.includes('/whatsapp')) {
      return 'whatsapp';
    }
    return 'overview';
  }, [subRoute]);

  const [activeView, setActiveView] = useState(determineView);
  const [connection, setConnection] = useState(null);

  // Sync with subRoute prop changes
  useEffect(() => {
    setActiveView(determineView());
  }, [subRoute, determineView]);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setActiveView(determineView());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [determineView]);

  // Fetch connection state for live status indicators on overview
  const fetchOverviewStatus = useCallback(async () => {
    try {
      const data = await whatsappApiService.getConnection();
      const conn = data?.connection || data;
      setConnection(conn);
    } catch (err) {
      console.error('Failed to load overview connection status:', err);
    }
  }, []);

  useEffect(() => {
    fetchOverviewStatus();
  }, [fetchOverviewStatus]);

  // Navigation handlers
  const handleSelectIntegration = (integrationId) => {
    if (integrationId === 'whatsapp') {
      setActiveView('whatsapp');
      if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard/integrations/whatsapp') {
        window.history.pushState({}, '', '/dashboard/integrations/whatsapp');
      }
      if (onNavigateSubRoute) {
        onNavigateSubRoute('whatsapp');
      }
    }
  };

  const handleBackToOverview = () => {
    setActiveView('overview');
    if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard/integrations') {
      window.history.pushState({}, '', '/dashboard/integrations');
    }
    if (onNavigateSubRoute) {
      onNavigateSubRoute(null);
    }
    fetchOverviewStatus();
  };

  if (activeView === 'whatsapp') {
    return <WhatsAppIntegrationPage onBack={handleBackToOverview} />;
  }

  return (
    <IntegrationsOverview
      connection={connection}
      onSelectIntegration={handleSelectIntegration}
    />
  );
}

export default IntegrationsPage;
