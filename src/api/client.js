// =====================================================================
// KREAZYAI STANDARDIZED API CLIENT & ERROR ENVELOPE
// =====================================================================

export const API_ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  TENANT_MISMATCH: 'TENANT_MISMATCH'
};

export function successResponse(data, meta = {}) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

export function errorResponse(code, message, details = {}) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    }
  };
}

function safeGet(key, def = null) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key) || def;
    }
  } catch {}
  return def;
}

function safeSet(key, val) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, val);
    }
  } catch {}
}

function safeRemove(key) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(key);
    }
  } catch {}
}

/**
 * Production API Client with Real HTTP Network Transport,
 * JWT Auth, Multi-Tenant Headers & Graceful Fallback
 */
class ApiClient {
  constructor() {
    this.workspaceId = safeGet('kreazy_active_workspace', 'ws-flagship-01');
    this.token = safeGet('kreazy_auth_token', null);
    this.baseUrl = typeof window !== 'undefined' ? '/api/v1' : 'http://localhost:5000/api/v1';
  }

  setWorkspace(id) {
    this.workspaceId = id;
    safeSet('kreazy_active_workspace', id);
  }

  getWorkspaceId() {
    return this.workspaceId;
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      safeSet('kreazy_auth_token', token);
    } else {
      safeRemove('kreazy_auth_token');
    }
  }

  setToken(token) {
    this.setAuthToken(token);
  }

  clearToken() {
    this.setAuthToken(null);
  }

  getAuthToken() {
    return this.token || safeGet('kreazy_auth_token', null);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-Workspace-Id': this.workspaceId || ''
    };
    const activeToken = this.getAuthToken();
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {})
    };

    try {
      let response;
      try {
        response = await fetch(url, {
          ...options,
          headers
        });
      } catch (fetchErr) {
        // If relative /api/v1 fetch fails (e.g. Vite dev proxy timeout), fall back to direct backend on port 5000
        if (typeof window !== 'undefined' && !url.startsWith('http://localhost:5000') && !url.startsWith('http://127.0.0.1:5000')) {
          const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
          const directUrl = `http://localhost:5000/api/v1${cleanEndpoint}`;
          try {
            response = await fetch(directUrl, {
              ...options,
              headers
            });
          } catch {
            throw fetchErr;
          }
        } else {
          throw fetchErr;
        }
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.error?.message || `HTTP ${response.status}: Request failed`;
        throw new Error(errorMsg);
      }

      return json?.data !== undefined ? json.data : json;
    } catch (err) {
      // Re-throw for caller handling
      throw err;
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
