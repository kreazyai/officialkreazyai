import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { apiClient } from '../api/client';

/**
 * KreazyAI Centralized Authentication Context
 * 
 * Provides consistent, single-source-of-truth session management across:
 * - Route transitions
 * - Browser refresh
 * - Cross-tab storage updates
 * - Landing Page <-> Dashboard navigation
 * 
 * State model:
 * authStatus: 'loading' | 'authenticated' | 'unauthenticated'
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Synchronous initialization prevents flash of unauthenticated content on refresh
  const [user, setUser] = useState(() => {
    try {
      return authService.getCurrentUser();
    } catch {
      return null;
    }
  });

  const [authStatus, setAuthStatus] = useState(() => {
    try {
      const initial = authService.getCurrentUser();
      return initial ? 'authenticated' : 'unauthenticated';
    } catch {
      return 'unauthenticated';
    }
  });

  // Background server-side session verification on mount
  useEffect(() => {
    let active = true;
    const verify = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.isDemo) {
        return;
      }
      const token = apiClient.getAuthToken();
      if (!token) {
        if (currentUser) {
          authService.logout();
          if (active) {
            setUser(null);
            setAuthStatus('unauthenticated');
          }
        }
        return;
      }

      try {
        const verifiedUser = await authService.verifySession();
        if (active) {
          if (verifiedUser) {
            setUser(verifiedUser);
            setAuthStatus('authenticated');
          } else {
            setUser(null);
            setAuthStatus('unauthenticated');
          }
        }
      } catch (err) {
        if ((err?.status === 401 || err?.status === 403) && active) {
          authService.logout();
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      }
    };

    verify();
    return () => { active = false; };
  }, []);

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'kreazy_auth_user' || e.key === 'kreazy_auth_token' || !e.key) {
        try {
          const fresh = authService.getCurrentUser();
          if (fresh) {
            setUser(fresh);
            setAuthStatus('authenticated');
          } else {
            setUser(null);
            setAuthStatus('unauthenticated');
          }
        } catch {
          // preserve state on transient parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('kreazy_auth_sync', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('kreazy_auth_sync', handleStorageChange);
    };
  }, []);

  const login = useCallback(async (email, password, isDemo = false) => {
    const loggedInUser = await authService.login(email, password, isDemo);
    setUser(loggedInUser);
    setAuthStatus('authenticated');
    return loggedInUser;
  }, []);

  const register = useCallback(async (payload) => {
    const newUser = await authService.registerWorkspace(payload);
    setUser(newUser);
    setAuthStatus('authenticated');
    return newUser;
  }, []);

  const loginWithGoogle = useCallback(async (googleData) => {
    const authedUser = await authService.loginWithGoogle(googleData);
    setUser(authedUser);
    setAuthStatus('authenticated');
    return authedUser;
  }, []);

  const logout = useCallback(() => {
    try {
      authService.logout();
    } catch (err) {
      console.warn('Logout exception caught safely:', err);
    }
    setUser(null);
    setAuthStatus('unauthenticated');
  }, []);

  const refreshUser = useCallback(() => {
    try {
      const fresh = authService.getCurrentUser();
      if (fresh) {
        setUser(fresh);
        setAuthStatus('authenticated');
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
      return fresh;
    } catch {
      return null;
    }
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser(prev => {
      const merged = { ...(prev || {}), ...updatedFields };
      try {
        localStorage.setItem('kreazy_auth_user', JSON.stringify(merged));
      } catch (err) {
        console.warn('Storage sync failed:', err);
      }
      return merged;
    });
  }, []);

  const value = {
    user,
    authStatus,
    isAuthenticated: authStatus === 'authenticated' && !!user,
    isLoading: authStatus === 'loading',
    login,
    loginWithGoogle,
    register,
    sendOtp: authService.sendOtp,
    verifyOtp: authService.verifyOtp,
    logout,
    refreshUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
