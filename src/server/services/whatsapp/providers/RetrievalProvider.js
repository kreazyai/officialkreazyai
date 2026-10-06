import { getDatabase } from '../../../config/database.js';
import { logger } from '../../../utils/logger.js';
import { getEmbeddingProvider } from './EmbeddingProvider.js';

/**
 * Interface definition for Context & Knowledge Retrieval Providers
 */
export class RetrievalProvider {
  /**
   * @param {Object} options
   * @param {string} options.tenantId
   * @param {string} options.query
   * @param {Object} [options.filters]
   * @returns {Promise<{ products: Array, faqs: Array, policies: Array }>}
   */
  async retrieveContext(_options) {
    throw new Error('retrieveContext() must be implemented by RetrievalProvider subclass');
  }
}

/**
 * Tenant-scoped Multi-source Knowledge Retrieval Provider
 * Strictly enforces tenant_id filtering across all tables
 */
export class TenantRetrievalProvider extends RetrievalProvider {
  constructor() {
    super();
    this.embedder = getEmbeddingProvider();
  }

  async retrieveContext({ tenantId, query = '' }) {
    if (!tenantId) {
      throw new Error('TenantRetrievalProvider requires explicit tenantId. Cross-tenant queries are blocked.');
    }

    const db = getDatabase();
    logger.info(`[TenantRetrievalProvider] Fetching tenant-isolated context for tenant: ${tenantId}`);

    // 1. Tenant products
    const products = db.prepare(`
      SELECT id, name, description, price, currency, stock, category, attributes, status
      FROM products
      WHERE (tenant_id = ? OR business_id = ?)
        AND status = 'ACTIVE'
    `).all(tenantId, tenantId);

    // 2. Tenant FAQs
    const faqs = db.prepare(`
      SELECT id, question, answer, category, status
      FROM faqs
      WHERE tenant_id = ? AND status = 'ACTIVE'
    `).all(tenantId);

    // 3. Tenant Policies
    const policies = db.prepare(`
      SELECT id, policy_type, content, status
      FROM policies
      WHERE tenant_id = ? AND status = 'ACTIVE'
    `).all(tenantId);

    return {
      products,
      faqs,
      policies
    };
  }
}

export function getRetrievalProvider() {
  return new TenantRetrievalProvider();
}
