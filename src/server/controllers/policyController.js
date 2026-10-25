import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { knowledgeService } from '../services/whatsapp/knowledgeService.js';
import { getTenantId } from '../middleware/auth.js';

export const policyController = {
  /**
   * GET /api/v1/policies
   * Retrieves all policies for authenticated tenant
   */
  async getAll(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const db = getDatabase();

      const policies = await db.prepare(`
        SELECT id, tenant_id, policy_type, content, status, created_at, updated_at
        FROM policies
        WHERE tenant_id = ?
        ORDER BY created_at DESC
      `).all(tenantId);

      return successResponse(res, Array.isArray(policies) ? policies : []);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/policies
   * Creates a new Policy for authenticated tenant
   */
  async create(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const { policy_type, content, status = 'ACTIVE' } = req.body || {};

      if (!policy_type || !content) {
        return errorResponse(res, 'policy_type and content are required', API_ERROR_CODES.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST);
      }

      const db = getDatabase();
      const id = `pol-${tenantId}-${Date.now()}`;
      const now = new Date().toISOString();

      await db.prepare(`
        INSERT INTO policies (id, tenant_id, policy_type, content, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, tenantId, policy_type.toUpperCase(), content.trim(), status, now, now);

      knowledgeService.invalidateTenantCache(tenantId);

      const created = await db.prepare('SELECT * FROM policies WHERE id = ?').get(id);
      return successResponse(res, created, HTTP_STATUS.CREATED, { message: 'Policy created successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/policies/:id
   */
  async getById(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const { id } = req.params;
      const db = getDatabase();

      const policy = await db.prepare('SELECT * FROM policies WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!policy) {
        return errorResponse(res, 'Policy not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(res, policy);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/v1/policies/:id
   */
  async update(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const { id } = req.params;
      const { policy_type, content, status } = req.body || {};
      const db = getDatabase();

      const existing = await db.prepare('SELECT * FROM policies WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return errorResponse(res, 'Policy not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const now = new Date().toISOString();
      await db.prepare(`
        UPDATE policies SET
          policy_type = COALESCE(?, policy_type),
          content = COALESCE(?, content),
          status = COALESCE(?, status),
          updated_at = ?
        WHERE id = ? AND tenant_id = ?
      `).run(policy_type ? policy_type.toUpperCase() : null, content, status, now, id, tenantId);

      knowledgeService.invalidateTenantCache(tenantId);

      const updated = await db.prepare('SELECT * FROM policies WHERE id = ?').get(id);
      return successResponse(res, updated, HTTP_STATUS.OK, { message: 'Policy updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/policies/:id
   */
  async delete(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const { id } = req.params;
      const db = getDatabase();

      const existing = await db.prepare('SELECT * FROM policies WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return errorResponse(res, 'Policy not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await db.prepare('DELETE FROM policies WHERE id = ? AND tenant_id = ?').run(id, tenantId);
      knowledgeService.invalidateTenantCache(tenantId);

      return successResponse(res, { id, deleted: true }, HTTP_STATUS.OK, { message: 'Policy deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
