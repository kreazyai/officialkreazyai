import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { knowledgeService } from '../services/whatsapp/knowledgeService.js';

export const policyController = {
  /**
   * GET /api/v1/policies
   * Retrieves all policies for authenticated tenant
   */
  async getAll(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const db = getDatabase();

      const policies = db.prepare(`
        SELECT id, tenant_id, policy_type, content, status, created_at, updated_at
        FROM policies
        WHERE tenant_id = ?
        ORDER BY created_at DESC
      `).all(tenantId);

      return successResponse(res, policies);
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
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { policy_type, content, status = 'ACTIVE' } = req.body || {};

      if (!policy_type || !content) {
        return errorResponse(res, 'policy_type and content are required', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
      }

      const db = getDatabase();
      const id = `pol-${tenantId}-${Date.now()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO policies (id, tenant_id, policy_type, content, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, tenantId, policy_type.toUpperCase(), content.trim(), status, now, now);

      knowledgeService.invalidateTenantCache(tenantId);

      const created = db.prepare('SELECT * FROM policies WHERE id = ?').get(id);
      return successResponse(res, created, 'Policy created successfully', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/policies/:id
   */
  async getById(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { id } = req.params;
      const db = getDatabase();

      const policy = db.prepare('SELECT * FROM policies WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!policy) {
        return errorResponse(res, 'Policy not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
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
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { id } = req.params;
      const { policy_type, content, status } = req.body || {};
      const db = getDatabase();

      const existing = db.prepare('SELECT * FROM policies WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return errorResponse(res, 'Policy not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
      }

      db.prepare(`
        UPDATE policies SET
          policy_type = COALESCE(?, policy_type),
          content = COALESCE(?, content),
          status = COALESCE(?, status),
          updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?
      `).run(policy_type ? policy_type.toUpperCase() : null, content, status, id, tenantId);

      knowledgeService.invalidateTenantCache(tenantId);

      const updated = db.prepare('SELECT * FROM policies WHERE id = ?').get(id);
      return successResponse(res, updated, 'Policy updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/policies/:id
   */
  async delete(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { id } = req.params;
      const db = getDatabase();

      const existing = db.prepare('SELECT * FROM policies WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return errorResponse(res, 'Policy not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
      }

      db.prepare('DELETE FROM policies WHERE id = ? AND tenant_id = ?').run(id, tenantId);
      knowledgeService.invalidateTenantCache(tenantId);

      return successResponse(res, { id, deleted: true }, 'Policy deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
