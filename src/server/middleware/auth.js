import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { getDatabase } from '../config/database.js';
import { errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Resolves the authorized tenant/business ID for the request.
 * - For normal users: always derived from the authenticated session (user.business_id).
 * - For super-admins: allows inspecting a targeted workspace via header or query.
 * - In dev/test: permits explicit header for test harness scripts.
 * - Never falls back to a hardcoded tenant ID in production.
 */
export function getTenantId(req) {
  if (req.user) {
    if (req.user.is_super_admin) {
      return req.headers['x-workspace-id'] || 
             req.headers['x-tenant-id'] || 
             req.query.businessId || 
             req.businessId || 
             null;
    }
    return req.user.business_id || req.businessId || null;
  }
  // Permit explicit workspace header in non-production environments for automated integration scripts
  if ((config.isDev || config.isTest) && (req.headers['x-workspace-id'] || req.headers['x-tenant-id'])) {
    return req.headers['x-workspace-id'] || req.headers['x-tenant-id'];
  }
  return null;
}

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(
      res,
      'Authentication required: missing or malformed Bearer token.',
      API_ERROR_CODES.UNAUTHORIZED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const db = getDatabase();

    const user = db.prepare(`
      SELECT id, business_id, email, name, role, is_super_admin 
      FROM users 
      WHERE id = ?
    `).get(decoded.userId);

    if (!user) {
      return errorResponse(
        res,
        'User account no longer exists or session has been revoked.',
        API_ERROR_CODES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    req.user = user;

    // Strict Tenant Context Validation:
    // Normal users MUST NOT access or spoof a workspace outside their assigned business.
    const requestedWorkspace = req.headers['x-workspace-id'] || req.headers['x-tenant-id'];
    if (!user.is_super_admin) {
      if (requestedWorkspace && requestedWorkspace !== user.business_id) {
        logger.warn(`Tenant isolation breach attempt blocked: User ${user.email} (assigned ${user.business_id}) requested workspace "${requestedWorkspace}"`);
        return errorResponse(
          res,
          'Access denied: You do not have permission to access this workspace.',
          API_ERROR_CODES.TENANT_MISMATCH,
          HTTP_STATUS.FORBIDDEN
        );
      }
      req.businessId = user.business_id;
    } else {
      // Super Admin: may target an explicit workspace for administrative review
      req.businessId = requestedWorkspace || null;
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(
        res,
        'Session expired. Please log in again.',
        API_ERROR_CODES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED
      );
    }
    return errorResponse(
      res,
      'Invalid authentication token.',
      API_ERROR_CODES.UNAUTHORIZED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }
}

/**
 * Optional authentication: populates req.user if valid token provided, but doesn't reject if not
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    const db = getDatabase();
    const user = db.prepare('SELECT id, business_id, email, name, role, is_super_admin FROM users WHERE id = ?').get(decoded.userId);
    if (user) {
      req.user = user;
      const requestedWorkspace = req.headers['x-workspace-id'] || req.headers['x-tenant-id'];
      if (!user.is_super_admin) {
        if (requestedWorkspace && requestedWorkspace !== user.business_id) {
          return errorResponse(
            res,
            'Access denied: You do not have permission to access this workspace.',
            API_ERROR_CODES.TENANT_MISMATCH,
            HTTP_STATUS.FORBIDDEN
          );
        }
        req.businessId = user.business_id;
      } else {
        req.businessId = requestedWorkspace || null;
      }
    }
  } catch {}
  next();
}
