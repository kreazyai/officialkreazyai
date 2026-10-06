import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { knowledgeService } from '../services/whatsapp/knowledgeService.js';

export const faqController = {
  /**
   * GET /api/v1/faqs
   * Retrieves all FAQs for authenticated tenant
   */
  async getAll(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const db = getDatabase();

      const faqs = db.prepare(`
        SELECT id, tenant_id, question, answer, category, status, created_at, updated_at
        FROM faqs
        WHERE tenant_id = ?
        ORDER BY created_at DESC
      `).all(tenantId);

      return successResponse(res, faqs);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/v1/faqs
   * Creates a new FAQ for authenticated tenant
   */
  async create(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { question, answer, category = 'General', status = 'ACTIVE' } = req.body || {};

      if (!question || !answer) {
        return errorResponse(res, 'Question and answer are required', HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
      }

      const db = getDatabase();
      const id = `faq-${tenantId}-${Date.now()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO faqs (id, tenant_id, question, answer, category, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, tenantId, question.trim(), answer.trim(), category, status, now, now);

      // Invalidate live knowledge index
      knowledgeService.invalidateTenantCache(tenantId);

      const created = db.prepare('SELECT * FROM faqs WHERE id = ?').get(id);
      return successResponse(res, created, 'FAQ created successfully', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/faqs/:id
   */
  async getById(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { id } = req.params;
      const db = getDatabase();

      const faq = db.prepare('SELECT * FROM faqs WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!faq) {
        return errorResponse(res, 'FAQ not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
      }

      return successResponse(res, faq);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/v1/faqs/:id
   */
  async update(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { id } = req.params;
      const { question, answer, category, status } = req.body || {};
      const db = getDatabase();

      const existing = db.prepare('SELECT * FROM faqs WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return errorResponse(res, 'FAQ not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
      }

      db.prepare(`
        UPDATE faqs SET
          question = COALESCE(?, question),
          answer = COALESCE(?, answer),
          category = COALESCE(?, category),
          status = COALESCE(?, status),
          updated_at = datetime('now')
        WHERE id = ? AND tenant_id = ?
      `).run(question, answer, category, status, id, tenantId);

      knowledgeService.invalidateTenantCache(tenantId);

      const updated = db.prepare('SELECT * FROM faqs WHERE id = ?').get(id);
      return successResponse(res, updated, 'FAQ updated successfully');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/faqs/:id
   */
  async delete(req, res, next) {
    try {
      const tenantId = req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { id } = req.params;
      const db = getDatabase();

      const existing = db.prepare('SELECT * FROM faqs WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return errorResponse(res, 'FAQ not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
      }

      db.prepare('DELETE FROM faqs WHERE id = ? AND tenant_id = ?').run(id, tenantId);
      knowledgeService.invalidateTenantCache(tenantId);

      return successResponse(res, { id, deleted: true }, 'FAQ deleted successfully');
    } catch (err) {
      next(err);
    }
  }
};
