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
  TENANT_MISMATCH: 'TENANT_MISMATCH',
  SUPER_ADMIN_PORTAL_REQUIRED: 'SUPER_ADMIN_PORTAL_REQUIRED'
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
  } catch { }
  return def;
}

function safeSet(key, val) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, val);
    }
  } catch { }
}

function safeRemove(key) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
      localStorage.removeItem(key);
    }
  } catch { }
}

/**
 * Normalizes an API base URL ensuring no trailing slashes and proper /api/v1 prefix.
 * e.g. 'https://kreazyai.onrender.com' -> 'https://kreazyai.onrender.com/api/v1'
 *      'https://kreazyai.onrender.com/' -> 'https://kreazyai.onrender.com/api/v1'
 *      'https://kreazyai.onrender.com/api/v1' -> 'https://kreazyai.onrender.com/api/v1'
 *      '/api/v1' -> '/api/v1'
 */
export function normalizeApiBaseUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean) return '';

  if (clean.endsWith('/api/v1')) {
    return clean;
  }
  if (clean.endsWith('/api')) {
    return `${clean}/v1`;
  }
  // If it's relative like '/'
  if (clean === '/') {
    return '/api/v1';
  }
  return `${clean}/api/v1`;
}

/**
 * Resolves the appropriate API base URL for the current runtime environment.
 * Priority:
 * 1. Build-time Vite env vars: VITE_API_URL, VITE_API_BASE_URL, VITE_BACKEND_URL
 * 2. Process env fallback (Node/SSR/testing): process.env.VITE_API_URL, etc.
 * 3. Browser runtime detection:
 *    - Localhost / 127.0.0.1 / private LAN: relative '/api/v1' (Vite dev proxy)
 *    - Production website (kreazyai.com / CloudFront / S3): defaults to production Render backend
 * 4. Node fallback: 'http://localhost:5000/api/v1'
 */
export function resolveApiBaseUrl() {
  let envUrl = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envUrl = import.meta.env.VITE_API_URL || 
               import.meta.env.VITE_API_BASE_URL || 
               import.meta.env.VITE_BACKEND_URL || '';
    }
  } catch {}

  if (!envUrl) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        envUrl = process.env.VITE_API_URL || 
                 process.env.VITE_API_BASE_URL || 
                 process.env.VITE_BACKEND_URL || 
                 process.env.API_URL || 
                 process.env.BACKEND_URL || '';
      }
    } catch {}
  }

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return normalizeApiBaseUrl(envUrl);
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname || '';
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const isLan = /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

    // In local development, use relative '/api/v1' which is proxied by Vite
    if (isLocal || isLan) {
      return '/api/v1';
    }

    // In production on CloudFront / S3 (kreazyai.com), default to the Render backend:
    return 'https://kreazyai.onrender.com/api/v1';
  }

  return 'http://localhost:5000/api/v1';
}

/**
 * Production API Client with Real HTTP Network Transport,
 * JWT Auth, Multi-Tenant Headers & Graceful Fallback
 */
class ApiClient {
  constructor() {
    this.workspaceId = safeGet('kreazy_active_workspace', null);
    this.token = safeGet('kreazy_auth_token', null);
    this.baseUrl = resolveApiBaseUrl();
  }

  setBaseUrl(url) {
    this.baseUrl = normalizeApiBaseUrl(url);
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  setWorkspace(id) {
    this.workspaceId = id || null;
    if (id) {
      safeSet('kreazy_active_workspace', id);
    } else {
      safeRemove('kreazy_active_workspace');
    }
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
    this.setWorkspace(null);
  }

  getAuthToken() {
    return this.token || safeGet('kreazy_auth_token', null);
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.workspaceId) {
      headers['X-Workspace-Id'] = this.workspaceId;
    }
    const activeToken = this.getAuthToken();
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    return headers;
  }

  /**
   * Resolves a relative or full endpoint to the full target API URL,
   * stripping duplicate /api/v1 prefixes and preventing trailing slash 301 redirects.
   */
  resolveUrl(endpoint) {
    if (!endpoint) return this.baseUrl;
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    let clean = String(endpoint).trim();
    // Normalize leading /api/v1 to avoid duplicate segments
    if (clean.startsWith('/api/v1/')) {
      clean = clean.slice('/api/v1'.length);
    } else if (clean.startsWith('api/v1/')) {
      clean = clean.slice('api/v1'.length);
    } else if (clean === '/api/v1' || clean === 'api/v1') {
      clean = '';
    }

    // Strip trailing slashes on endpoints to avoid CloudFront / S3 301 redirects
    if (clean.length > 1 && clean.endsWith('/')) {
      clean = clean.replace(/\/+$/, '');
    }

    const slash = clean.startsWith('/') || !clean ? '' : '/';
    return `${this.baseUrl}${slash}${clean}`;
  }

  async request(endpoint, options = {}) {
    const url = this.resolveUrl(endpoint);
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {})
    };

    // Resilient timeout for mobile cellular networks (prevents silent hanging on dropped packets)
    const timeoutMs = options.timeoutMs || 45000;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    let timeoutId = null;

    if (controller && !options.signal) {
      timeoutId = setTimeout(() => {
        controller.abort(new Error(`Network request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }

    try {
      let response;
      try {
        response = await fetch(url, {
          ...options,
          headers,
          signal: options.signal || controller?.signal
        });
      } catch (fetchErr) {
        // Fall back to direct backend port 5000 ONLY when running on local machine or LAN.
        // On mobile data (public domain / tunnel), attempting 'localhost:5000' triggers
        // Mixed Content HTTPS->HTTP blocks and reaches the phone loopback instead of the server.
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname || '';
          const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
          const isLan = /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

          if ((isLocal || isLan) && !url.includes(':5000')) {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const directPort = window.location.port === '5000' ? '' : ':5000';
            const directUrl = `${window.location.protocol}//${hostname}${directPort}/api/v1${cleanEndpoint}`;
            try {
              response = await fetch(directUrl, {
                ...options,
                headers,
                signal: options.signal || controller?.signal
              });
            } catch {
              throw fetchErr;
            }
          } else {
            throw fetchErr;
          }
        } else {
          throw fetchErr;
        }
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 502 && typeof window !== 'undefined' && !url.includes(':5000')) {
          const hostname = window.location.hostname || '';
          const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
          const isLan = /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
          if (isLocal || isLan) {
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
            const directUrl = `${window.location.protocol}//${hostname}:5000/api/v1${cleanEndpoint}`;
            try {
              const retryRes = await fetch(directUrl, {
                ...options,
                headers,
                signal: options.signal || controller?.signal
              });
              if (retryRes.ok) {
                const retryJson = await retryRes.json().catch(() => null);
                return retryJson?.data !== undefined ? retryJson.data : retryJson;
              }
            } catch { }
          }
        }

        const errorMsg = json?.error?.message || `HTTP ${response.status}: Request failed`;
        const err = new Error(errorMsg);
        err.status = response.status;
        err.code = json?.error?.code || (response.status === 429 ? 'RATE_LIMITED' : 'HTTP_ERROR');
        const retryHeader = response.headers?.get('Retry-After') || response.headers?.get('retry-after');
        err.retryAfter = response.status === 429
          ? parseInt(retryHeader || json?.error?.retryAfter || '60', 10)
          : (retryHeader ? parseInt(retryHeader, 10) : null);
        err.data = json;
        throw err;
      }

      return json?.data !== undefined ? json.data : json;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
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
