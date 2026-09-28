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

/**
 * Creates standardized API success envelope
 */
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

/**
 * Creates standardized API error envelope
 */
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

/**
 * API Client with Multi-Tenant Context and Fallback Persistence
 */
class ApiClient {
  constructor() {
    this.workspaceId = localStorage.getItem('kreazy_active_workspace') || 'ws-flagship-01';
    this.token = localStorage.getItem('kreazy_auth_token') || null;
  }

  setWorkspace(id) {
    this.workspaceId = id;
    localStorage.setItem('kreazy_active_workspace', id);
  }

  getWorkspaceId() {
    return this.workspaceId;
  }

  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('kreazy_auth_token', token);
    } else {
      localStorage.removeItem('kreazy_auth_token');
    }
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Workspace-Id': this.workspaceId,
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
  }
}

export const apiClient = new ApiClient();
