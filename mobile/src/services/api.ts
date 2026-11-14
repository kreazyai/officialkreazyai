// =====================================================================
// KREAZYAI MOBILE API CLIENT
// Securely connects to the Node.js/Express backend
// Implements multi-tenant headers, Bearer tokens, and resilient fallbacks
// =====================================================================

import { Platform } from 'react-native';
import { storage } from './storage';

// Default backend endpoint:
// Production: https://kreazyai.onrender.com/api/v1
// Android Emulator: http://10.0.2.2:5000/api/v1
// Physical phones can configure their computer's local Wi-Fi IP (e.g. http://192.168.x.x:5000/api/v1) via Settings
const DEFAULT_PROD_URL = 'https://kreazyai.onrender.com/api/v1';
const DEFAULT_DEV_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: any;

  constructor(message: string, code = 'API_ERROR', status = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class ApiService {
  private customBaseUrl: string | null = null;
  private currentWorkspaceId: string | null = null;

  async init(): Promise<void> {
    const savedUrl = await storage.getCustomApiUrl();
    if (savedUrl) {
      this.customBaseUrl = savedUrl;
    }
  }

  setWorkspaceId(workspaceId: string | null) {
    this.currentWorkspaceId = workspaceId;
  }

  async setBaseUrl(url: string) {
    let clean = url.trim().replace(/\/+$/, '');
    if (!clean.endsWith('/api/v1')) {
      if (clean.endsWith('/api')) {
        clean = `${clean}/v1`;
      } else {
        clean = `${clean}/api/v1`;
      }
    }
    this.customBaseUrl = clean;
    await storage.setCustomApiUrl(clean);
  }

  getBaseUrl(): string {
    if (this.customBaseUrl) return this.customBaseUrl;
    if (process.env.EXPO_PUBLIC_API_URL) {
      let envUrl = process.env.EXPO_PUBLIC_API_URL.trim().replace(/\/+$/, '');
      if (!envUrl.endsWith('/api/v1')) envUrl = `${envUrl}/api/v1`;
      return envUrl;
    }
    return __DEV__ ? DEFAULT_DEV_URL : DEFAULT_PROD_URL;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${baseUrl}${cleanEndpoint}`;

    const token = await storage.getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (this.currentWorkspaceId) {
      headers['X-Workspace-Id'] = this.currentWorkspaceId;
      headers['X-Tenant-Id'] = this.currentWorkspaceId;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorData = json?.error || {};
        const message = errorData.message || json?.message || `Request failed with status ${response.status}`;
        const code = errorData.code || 'UNKNOWN_ERROR';
        throw new ApiError(message, code, response.status, errorData.details);
      }

      // Backend wraps responses in { success: true, data: ... }
      if (json && typeof json === 'object' && 'data' in json) {
        return json.data as T;
      }

      return json as T;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        err.message || 'Network request failed. Please check your connection or backend address.',
        'NETWORK_ERROR',
        0
      );
    }
  }

  // HTTP Helpers
  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // ── Authentication Endpoints ──────────────────────────────────────────────
  auth = {
    login: (credentials: { email: string; password?: string; isDemo?: boolean }) =>
      this.post<{ token: string; user: any }>('/auth/login', credentials),
    
    register: (payload: { storeName: string; ownerName?: string; email: string; password?: string; country?: string }) =>
      this.post<{ token: string; user: any }>('/auth/register', payload),

    getMe: () =>
      this.get<any>('/auth/me')
  };

  // ── Orders Endpoints ──────────────────────────────────────────────────────
  orders = {
    getAll: () => this.get<any[]>('/orders'),
    getById: (id: string) => this.get<any>(`/orders/${id}`),
    create: (data: any) => this.post<any>('/orders', data),
    updateStatus: (id: string, status: string) => this.patch<any>(`/orders/${id}/status`, { status })
  };

  // ── Products Endpoints ────────────────────────────────────────────────────
  products = {
    getAll: () => this.get<any[]>('/products'),
    getById: (id: string) => this.get<any>(`/products/${id}`),
    create: (data: any) => this.post<any>('/products', data),
    update: (id: string, data: any) => this.put<any>(`/products/${id}`, data),
    delete: (id: string) => this.delete<any>(`/products/${id}`)
  };

  // ── Customers (CRM) Endpoints ─────────────────────────────────────────────
  customers = {
    getAll: () => this.get<any[]>('/customers'),
    getById: (id: string) => this.get<any>(`/customers/${id}`),
    addNote: (id: string, note: string) => this.post<any>(`/customers/${id}/notes`, { note })
  };

  // ── Conversations (Inbox) Endpoints ───────────────────────────────────────
  conversations = {
    getAll: () => this.get<any[]>('/conversations'),
    getById: (id: string) => this.get<any>(`/conversations/${id}`),
    sendMessage: (id: string, text: string) => this.post<any>(`/conversations/${id}/messages`, { text }),
    updateStatus: (id: string, status: string) => this.patch<any>(`/conversations/${id}`, { status }),
    getAiSuggest: (id: string) => this.post<any>(`/conversations/${id}/ai-suggest`)
  };

  // ── Dashboard Metrics Endpoints ───────────────────────────────────────────
  dashboard = {
    getOverviewMetrics: () => this.get<any>('/dashboard/overview-metrics'),
    getAnalytics: () => this.get<any>('/analytics/summary'),
    getRevenue: () => this.get<any>('/revenue/summary')
  };

  // ── AI Flows & Recovery Endpoints ─────────────────────────────────────────
  recovery = {
    getOverview: () => this.get<any>('/recovery/overview'),
    getCandidates: () => this.get<any[]>('/recovery/candidates'),
    retryCandidate: (id: string) => this.post<any>(`/recovery/candidates/${id}/retry`),
    cancelCandidate: (id: string, reason?: string) => this.post<any>(`/recovery/candidates/${id}/cancel`, { reason }),
    getSettings: () => this.get<any>('/recovery/settings'),
    updateSettings: (settings: any) => this.put<any>('/recovery/settings', settings)
  };

  // ── AI Messages, Knowledge, FAQs, Policies ────────────────────────────────
  ai = {
    getConfig: () => this.get<any>('/ai/config'),
    updateConfig: (data: any) => this.put<any>('/ai/config', data),
    getSettings: () => this.get<any>('/ai/settings'),
    updateSettings: (data: any) => this.put<any>('/ai/settings', data),
    simulateChat: (message: string) => this.post<any>('/ai/chat', { message })
  };

  faqs = {
    getAll: () => this.get<any[]>('/faqs'),
    create: (data: any) => this.post<any>('/faqs', data),
    update: (id: string, data: any) => this.put<any>(`/faqs/${id}`, data),
    delete: (id: string) => this.delete<any>(`/faqs/${id}`)
  };

  policies = {
    getAll: () => this.get<any[]>('/policies'),
    create: (data: any) => this.post<any>('/policies', data),
    update: (id: string, data: any) => this.put<any>(`/policies/${id}`, data),
    delete: (id: string) => this.delete<any>(`/policies/${id}`)
  };

  // ── Integrations (WhatsApp, Meta) ─────────────────────────────────────────
  integrations = {
    getWhatsAppConnection: () => this.get<any>('/whatsapp/connection'),
    getWhatsAppWallet: () => this.get<any>('/whatsapp/wallet'),
    getWhatsAppHealth: () => this.get<any>('/whatsapp/ai-health')
  };

  // ── Settings Endpoints ────────────────────────────────────────────────────
  settings = {
    getProfile: () => this.get<any>('/settings/profile'),
    updateProfile: (data: any) => this.patch<any>('/settings/profile', data),
    getBusiness: () => this.get<any>('/settings/business'),
    // Note: Business identity fields (storeName, slug) are locked against self-service modifications
    getNotifications: () => this.get<any>('/settings/notifications'),
    updateNotifications: (data: any) => this.patch<any>('/settings/notifications', data)
  };

  // ── Billing Endpoints ─────────────────────────────────────────────────────
  billing = {
    getDetails: () => this.get<any>('/billing/details')
  };
}

export const api = new ApiService();
export default api;
