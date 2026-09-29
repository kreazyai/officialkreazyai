import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { getDatabase } from '../config/database.js';
import { errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';

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
    req.businessId = user.business_id;
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
      req.businessId = user.business_id;
    }
  } catch {}
  next();
}
