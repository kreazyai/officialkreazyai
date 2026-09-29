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
      const response = await fetch(url, {
        ...options,
        headers
      });

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.error?.message || `HTTP ${response.status}: Request failed`;
        const errorCode = json?.error?.code || 'NETWORK_ERROR';
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
