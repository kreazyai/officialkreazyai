import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { knowledgeService } from '../services/whatsapp/knowledgeService.js';
import { getTenantId } from '../middleware/auth.js';

export const faqController = {
  /**
   * GET /api/v1/faqs
   * Retrieves all FAQs for authenticated tenant
   */
  async getAll(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const db = getDatabase();

      const faqs = await db.prepare(`
        SELECT id, tenant_id, question, answer, category, status, created_at, updated_at
        FROM faqs
        WHERE tenant_id = ?
        ORDER BY created_at DESC
      `).all(tenantId);

      return successResponse(res, Array.isArray(faqs) ? faqs : []);
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
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const { question, answer, category = 'General', status = 'ACTIVE' } = req.body || {};

      if (!question || !answer) {
        return errorResponse(res, 'Question and answer are required', API_ERROR_CODES.BAD_REQUEST, HTTP_STATUS.BAD_REQUEST);
      }

      const db = getDatabase();
      const id = `faq-${tenantId}-${Date.now()}`;
      const now = new Date().toISOString();

      await db.prepare(`
        INSERT INTO faqs (id, tenant_id, question, answer, category, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, tenantId, question.trim(), answer.trim(), category, status, now, now);

      // Invalidate live knowledge index
      knowledgeService.invalidateTenantCache(tenantId);

      const created = await db.prepare('SELECT * FROM faqs WHERE id = ?').get(id);
      return successResponse(res, created, HTTP_STATUS.CREATED, { message: 'FAQ created successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/v1/faqs/:id
   */
  async getById(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const { id } = req.params;
      const db = getDatabase();

      const faq = await db.prepare('SELECT * FROM faqs WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!faq) {
        return errorResponse(res, 'FAQ not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
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
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const { id } = req.params;
      const { question, answer, category, status } = req.body || {};
      const db = getDatabase();

      const existing = await db.prepare('SELECT * FROM faqs WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return errorResponse(res, 'FAQ not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const now = new Date().toISOString();
      await db.prepare(`
        UPDATE faqs SET
          question = COALESCE(?, question),
          answer = COALESCE(?, answer),
          category = COALESCE(?, category),
          status = COALESCE(?, status),
          updated_at = ?
        WHERE id = ? AND tenant_id = ?
      `).run(question, answer, category, status, now, id, tenantId);

      knowledgeService.invalidateTenantCache(tenantId);

      const updated = await db.prepare('SELECT * FROM faqs WHERE id = ?').get(id);
      return successResponse(res, updated, HTTP_STATUS.OK, { message: 'FAQ updated successfully' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/v1/faqs/:id
   */
  async delete(req, res, next) {
    try {
      const tenantId = getTenantId(req);
      if (!tenantId) {
        return errorResponse(res, 'Tenant context required.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }
      const { id } = req.params;
      const db = getDatabase();

      const existing = await db.prepare('SELECT * FROM faqs WHERE id = ? AND tenant_id = ?').get(id, tenantId);
      if (!existing) {
        return errorResponse(res, 'FAQ not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await db.prepare('DELETE FROM faqs WHERE id = ? AND tenant_id = ?').run(id, tenantId);
      knowledgeService.invalidateTenantCache(tenantId);

      return successResponse(res, { id, deleted: true }, HTTP_STATUS.OK, { message: 'FAQ deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
