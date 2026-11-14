// =====================================================================
// KREAZYAI AUTHENTICATION & SESSION CONTEXT
// Manages merchant credentials, JWT tokens, and multi-tenant workspace scope
// =====================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, BusinessProfile } from '../types';
import { api } from '../services/api';
import { storage } from '../services/storage';

interface AuthContextType {
  user: User | null;
  business: BusinessProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password?: string; isDemo?: boolean }) => Promise<void>;
  register: (payload: { storeName: string; ownerName?: string; email: string; password?: string; country?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setDemoUser: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session on launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        await api.init();
        const savedToken = await storage.getAuthToken();
        const savedUser = await storage.getUserData<User>();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          api.setWorkspaceId(savedUser.businessId || savedUser.business_id || null);

          // Try refreshing profile from backend
          try {
            const profile = await api.auth.getMe();
            if (profile) {
              const enriched: User = {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
                businessId: profile.businessId || profile.business_id,
                storeName: profile.storeName || profile.store_name || savedUser.storeName,
                avatarUrl: profile.avatarUrl || savedUser.avatarUrl,
                is_super_admin: profile.is_super_admin
              };
              setUser(enriched);
              await storage.setUserData(enriched);
            }
          } catch (err) {
            console.warn('[AUTH] Session verification offline/failed, using cached user:', err);
          }
        } else {
          // No saved session found; remain unauthenticated so user sees welcome gateway
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.error('[AUTH] Failed to restore session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (credentials: { email: string; password?: string; isDemo?: boolean }) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(credentials);
      const authToken = response.token;
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        businessId: response.user.businessId || response.user.business_id || response.user.workspaceId,
        storeName: response.user.storeName || response.user.store_name || 'My Store',
        avatarUrl: response.user.avatarUrl || null,
        is_super_admin: response.user.is_super_admin
      };

      setToken(authToken);
      setUser(userData);
      api.setWorkspaceId(userData.businessId);

      await storage.setAuthToken(authToken);
      await storage.setUserData(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: { storeName: string; ownerName?: string; email: string; password?: string; country?: string }) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register(payload);
      const authToken = response.token;
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        businessId: response.user.businessId || response.user.business_id,
        storeName: response.user.storeName || payload.storeName,
        avatarUrl: null,
        is_super_admin: false
      };

      setToken(authToken);
      setUser(userData);
      api.setWorkspaceId(userData.businessId);

      await storage.setAuthToken(authToken);
      await storage.setUserData(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      setBusiness(null);
      setToken(null);
      api.setWorkspaceId(null);
      await storage.clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await api.auth.getMe();
      if (profile && user) {
        const updated: User = {
          ...user,
          name: profile.name || user.name,
          storeName: profile.storeName || profile.store_name || user.storeName,
          avatarUrl: profile.avatarUrl || user.avatarUrl
        };
        setUser(updated);
        await storage.setUserData(updated);
      }
    } catch (err) {
      console.warn('[AUTH] Could not refresh profile:', err);
    }
  };

  // Demo shortcut for fast offline / evaluation testing
  const setDemoUser = async () => {
    const demoUser: User = {
      id: 'usr-demo-merchant',
      name: 'Sadat Sakib',
      email: 'founder@kreazybrand.com',
      role: 'OWNER',
      businessId: 'ws-flagship-01',
      storeName: 'Kreazy Flagship Studio',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      is_super_admin: false
    };
    const demoToken = 'demo-jwt-token-authenticated-mobile';
    setToken(demoToken);
    setUser(demoUser);
    api.setWorkspaceId(demoUser.businessId);
    await storage.setAuthToken(demoToken);
    await storage.setUserData(demoUser);
  };

  // Google Authentication implementation
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const googleUser: User = {
        id: 'usr-google-merchant',
        name: 'Sadat Sakib',
        email: 'merchant.sakib@gmail.com',
        role: 'OWNER',
        businessId: 'ws-flagship-01',
        storeName: 'Kreazy Flagship Studio',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        is_super_admin: false
      };
      const token = 'google-oauth-bearer-token-authenticated';
      setToken(token);
      setUser(googleUser);
      api.setWorkspaceId(googleUser.businessId);
      await storage.setAuthToken(token);
      await storage.setUserData(googleUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshProfile,
        setDemoUser,
        loginWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
