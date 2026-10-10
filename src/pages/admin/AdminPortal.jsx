import React, { useState, useEffect } from 'react';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboard } from './AdminDashboard';
import { apiClient } from '../../api/client';

export function AdminPortal({ onNavigate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const verifyAdminSession = async () => {
    const token = apiClient.getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setAdminUser(null);
      setChecking(false);
      return;
    }

    try {
      const res = await apiClient.get('/auth/me');
      if (res && (res.is_super_admin === true || res.role === 'SUPER_ADMIN')) {
        setIsAuthenticated(true);
        setAdminUser(res);
      } else {
        throw new Error('Access denied: administrative role required.');
      }
    } catch {
      apiClient.setAuthToken(null);
      localStorage.removeItem('kreazy_superadmin_auth');
      localStorage.removeItem('kreazy_superadmin_email');
      sessionStorage.removeItem('kreazy_superadmin_auth');
      sessionStorage.removeItem('kreazy_superadmin_email');
      setIsAuthenticated(false);
      setAdminUser(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    verifyAdminSession();
  }, []);

  const handleLoginSuccess = async () => {
    setChecking(true);
    await verifyAdminSession();
  };

  const handleLogout = () => {
    apiClient.setAuthToken(null);
    localStorage.removeItem('kreazy_superadmin_auth');
    localStorage.removeItem('kreazy_superadmin_email');
    localStorage.removeItem('kreazy_superadmin_login_at');
    sessionStorage.removeItem('kreazy_superadmin_auth');
    sessionStorage.removeItem('kreazy_superadmin_email');
    setIsAuthenticated(false);
    setAdminUser(null);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', '/admin');
    }
  };

  if (checking) {
    return (
      <div className="mac-admin-loading-screen">
        <div className="mac-admin-spinner" />
        <span className="mac-admin-loading-text">Verifying administrative authorization...</span>
      </div>
    );
  }

  // Not logged in -> Show dedicated MacOS Admin Login Gate
  if (!isAuthenticated || !adminUser) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminDashboard
      user={adminUser}
      onNavigate={onNavigate}
      onLogout={handleLogout}
    />
  );
}
