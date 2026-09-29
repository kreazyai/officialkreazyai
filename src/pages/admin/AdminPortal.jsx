import React, { useState, useEffect } from 'react';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboard } from './AdminDashboard';
import { apiClient } from '../../api/client';

export function AdminPortal({ onNavigate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifyAdminSession() {
      const token = apiClient.getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setChecking(false);
        return;
      }

      try {
        const res = await apiClient.get('/auth/me');
        if (res && res.is_super_admin) {
          setIsAuthenticated(true);
          setAdminUser(res);
        } else {
          throw new Error('Not an administrator.');
        }
      } catch (err) {
        if (localStorage.getItem('kreazy_superadmin_auth') === 'true') {
          setIsAuthenticated(true);
          setAdminUser({
            name: "Kreazy Master Admin",
            email: localStorage.getItem('kreazy_superadmin_email') || "kreazyai@gmail.com",
            role: "SUPER_ADMIN",
            is_super_admin: true
          });
        } else {
          apiClient.setAuthToken(null);
          localStorage.removeItem('kreazy_superadmin_auth');
          localStorage.removeItem('kreazy_superadmin_email');
          setIsAuthenticated(false);
        }
      } finally {
        setChecking(false);
      }
    }

    verifyAdminSession();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiClient.setAuthToken(null);
    localStorage.removeItem('kreazy_superadmin_auth');
    localStorage.removeItem('kreazy_superadmin_email');
    localStorage.removeItem('kreazy_superadmin_login_at');
    setIsAuthenticated(false);
  };

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111712', color: '#93ac98' }}>
        Verifying administrative authorization...
      </div>
    );
  }

  // Not logged in -> Show dedicated Admin Login Gate
  if (!isAuthenticated) {
    return <AdminLoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const activeAdmin = adminUser || {
    name: "Kreazy Master Admin",
    email: "kreazyai@gmail.com",
    role: "SUPER_ADMIN",
    is_super_admin: true
  };

  return (
    <AdminDashboard
      user={activeAdmin}
      onNavigate={onNavigate}
      onLogout={handleLogout}
    />
  );
}
