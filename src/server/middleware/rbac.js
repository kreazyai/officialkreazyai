import { errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    if (req.user.is_super_admin) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role "${req.user.role}" does not have required permissions: [${allowedRoles.join(', ')}].`,
        API_ERROR_CODES.FORBIDDEN,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 'Authentication required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  if (!req.user.is_super_admin && req.user.role !== 'SUPER_ADMIN') {
    return errorResponse(
      res,
      'Access Denied: Administrative privileges required.',
      API_ERROR_CODES.FORBIDDEN,
      HTTP_STATUS.FORBIDDEN
    );
  }

  next();
}

/**
 * Strict Tenant Isolation Guard:
 * Ensures the authenticated user can only access resources belonging to their own business.
 */
export function requireTenantAccess(paramName = 'businessId') {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
    }

    if (req.user.is_super_admin) {
      return next();
    }

    const requestedTenantId = req.params[paramName] || req.body[paramName] || req.query[paramName] || req.businessId;

    if (!requestedTenantId || requestedTenantId !== req.user.business_id) {
      return errorResponse(
        res,
        'Access denied: Cross-tenant resource access is strictly prohibited.',
        API_ERROR_CODES.TENANT_MISMATCH,
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
}
