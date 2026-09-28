import React, { useState, useEffect } from 'react';
import { AdminLoginPage } from './AdminLoginPage';
import { AdminDashboard } from './AdminDashboard';

export function AdminPortal({ onNavigate }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const authStatus = localStorage.getItem('kreazy_superadmin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
    setChecking(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
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

  // Logged in as Super Admin -> Render full Platform Admin Dashboard
  const adminUser = {
    name: "Kreazy Master Admin",
    email: "kreazyai@gmail.com",
    role: "SUPER_ADMIN",
    is_super_admin: true
  };

  return (
    <AdminDashboard
      user={adminUser}
      onNavigate={onNavigate}
      onLogout={handleLogout}
    />
  );
}
