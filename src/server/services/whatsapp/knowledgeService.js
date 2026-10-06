import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { visionService } from './visionService.js';

// In-memory tenant knowledge cache for instantaneous retrieval
const tenantCache = new Map();

export const knowledgeService = {
  /**
   * Invalidates or warms up the in-memory knowledge cache for a tenant.
   * Called immediately when FAQs, policies, or products change.
   * @param {string} tenantId 
   */
  invalidateTenantCache(tenantId) {
    if (!tenantId) return;
    tenantCache.delete(tenantId);
    logger.info(`Invalidated live knowledge index for tenant: ${tenantId}`);
  },

  /**
   * Retrieves all authoritative knowledge assets strictly isolated for a single tenant.
   * Cross-tenant leakage is strictly prevented.
   * @param {string} tenantId
   */
  getTenantKnowledge(tenantId) {
    if (!tenantId) return { faqs: [], policies: [], products: [] };
    const db = getDatabase();
    try {
      const faqs = db.prepare("SELECT * FROM faqs WHERE tenant_id = ? AND status = 'ACTIVE'").all(tenantId);
      const policies = db.prepare("SELECT * FROM policies WHERE tenant_id = ? AND status = 'ACTIVE'").all(tenantId);
      const products = db.prepare("SELECT * FROM products WHERE (tenant_id = ? OR business_id = ?) AND status != 'DISCONTINUED'").all(tenantId, tenantId);
      return { faqs, policies, products };
    } catch (err) {
      logger.error(`Error loading knowledge for tenant ${tenantId}:`, err.message);
      return { faqs: [], policies: [], products: [] };
    }
  },

  /**
   * Retrieves tenant AI Settings (system prompt, tone, threshold, handoff rules)
   * with platform security guardrails enforced.
   * @param {string} tenantId 
   */
  getTenantAiSettings(tenantId) {
    if (!tenantId) return this._getDefaultAiSettings('unknown');
    const db = getDatabase();

    try {
      const row = db.prepare(`
        SELECT * FROM ai_settings WHERE tenant_id = ?
      `).get(tenantId);

      if (row) {
        return {
          id: row.id,
          tenant_id: row.tenant_id,
          system_instructions: row.system_instructions || 'Assist shoppers professionally with store products and policies.',
          tone: row.tone || 'professional, courteous',
          language_settings: JSON.parse(row.language_settings || '["bn","en","banglish"]'),
          confidence_threshold: row.confidence_threshold !== undefined ? row.confidence_threshold : 0.75,
          handoff_rules: JSON.parse(row.handoff_rules || '{}')
        };
      }
    } catch (err) {
      logger.warn(`Could not load ai_settings for tenant ${tenantId}:`, err.message);
    }

    return this._getDefaultAiSettings(tenantId);
  },

  _getDefaultAiSettings(tenantId) {
    return {
      id: `aisett-${tenantId}`,
      tenant_id: tenantId,
      system_instructions: 'Assist shoppers with store products, stock checks, and store policies.',
      tone: 'professional, helpful, concise',
      language_settings: ['bn', 'en', 'banglish'],
      confidence_threshold: 0.75,
      handoff_rules: { escalateKeywords: ['agent', 'human', 'manager'] }
    };
  },

  /**
   * Tenant-isolated FAQ retrieval.
   * Matches question against tenant's FAQs only.
   * @param {string} tenantId 
   * @param {string} queryText 
   * @returns {{ matched: boolean, faq?: object, score: number }}
   */
  findMatchingFaq(tenantId, queryText) {
    if (!tenantId || !queryText) return { matched: false, score: 0 };
    const db = getDatabase();
    const cleanQuery = queryText.toLowerCase().trim();

    try {
      const faqs = db.prepare(`
        SELECT id, question, answer, category FROM faqs
        WHERE tenant_id = ? AND status = 'ACTIVE'
      `).all(tenantId);

      let bestMatch = null;
      let highestScore = 0;

      for (const f of faqs) {
        const qLower = f.question.toLowerCase();
        let score = 0;

        // Exact or strong substring match
        if (cleanQuery.includes(qLower) || qLower.includes(cleanQuery)) {
          score = 0.95;
        } else {
          // Token overlap score
          const queryTokens = cleanQuery.split(/\s+/).filter(w => w.length > 2);
          const faqTokens = qLower.split(/\s+/).filter(w => w.length > 2);
          const matches = queryTokens.filter(t => faqTokens.includes(t));
          score = matches.length / Math.max(queryTokens.length, 1);
        }

        if (score > highestScore && score >= 0.5) {
          highestScore = score;
          bestMatch = f;
        }
      }

      if (bestMatch) {
        return { matched: true, faq: bestMatch, score: highestScore };
      }
    } catch (err) {
      logger.error('Error finding matching FAQ:', err.message);
    }

    return { matched: false, score: 0 };
  },

  /**
   * Tenant-isolated Policy retrieval.
   * @param {string} tenantId 
   * @param {string} policyType 'RETURN_POLICY' | 'SHIPPING_POLICY' | etc.
   */
  getPolicy(tenantId, policyType) {
    if (!tenantId) return null;
    const db = getDatabase();

    try {
      const row = db.prepare(`
        SELECT id, policy_type, content FROM policies
        WHERE tenant_id = ? AND policy_type = ? AND status = 'ACTIVE'
        LIMIT 1
      `).get(tenantId, policyType.toUpperCase());

      return row || null;
    } catch (err) {
      logger.error('Error fetching policy:', err.message);
      return null;
    }
  },

  /**
   * Product Search & Intelligence:
   * Supports text-to-product and image-to-product matching.
   * ALWAYS validates price and stock from the authoritative DB record.
   * @param {string} tenantId 
   * @param {{ queryText?: string, media?: object }} input 
   * @returns {Promise<{ matched: boolean, product?: object, confidence: number, reason: string }>}
   */
  async findProduct(tenantId, { queryText = '', media = null }) {
    if (!tenantId) return { matched: false, confidence: 0, reason: 'Missing tenant ID' };
    const db = getDatabase();

    // 1. Fetch only this tenant's authoritative product catalog
    const products = db.prepare(`
      SELECT id, sku, name, description, price, currency, stock, category, attributes, ai_knowledge
      FROM products
      WHERE (business_id = ? OR tenant_id = ?) AND status != 'DISCONTINUED'
    `).all(tenantId, tenantId);

    if (products.length === 0) {
      return { matched: false, confidence: 0, reason: 'No products in tenant catalog' };
    }

    // 2. Case A: Multimodal / Image-to-Product query
    if (media && (media.url || media.id || media.mimeType)) {
      const visualTraits = await visionService.extractProductCharacteristics(media, queryText);
      logger.info(`Vision extracted traits for tenant ${tenantId}:`, visualTraits);

      let bestProduct = null;
      let highestRank = 0;

      for (const prod of products) {
        const prodName = prod.name.toLowerCase();
        const prodCat = (prod.category || '').toLowerCase();
        let matchPoints = 0;

        // Check category match
        if (visualTraits.category && prodCat.includes(visualTraits.category.toLowerCase())) {
          matchPoints += 0.4;
        }

        // Check visual tags match
        for (const tag of visualTraits.tags) {
          if (prodName.includes(tag.toLowerCase())) matchPoints += 0.3;
          if (prodCat.includes(tag.toLowerCase())) matchPoints += 0.2;
        }

        // Check primary color
        if (visualTraits.primaryColor && prodName.includes(visualTraits.primaryColor.toLowerCase())) {
          matchPoints += 0.3;
        }

        if (matchPoints > highestRank) {
          highestRank = matchPoints;
          bestProduct = prod;
        }
      }

      if (bestProduct && highestRank >= 0.4) {
        // Authoritative database check
        const authoritative = db.prepare('SELECT price, stock, status FROM products WHERE id = ?').get(bestProduct.id);
        bestProduct.price = authoritative.price;
        bestProduct.stock = authoritative.stock;

        return {
          matched: true,
          product: bestProduct,
          confidence: Math.min(0.95, highestRank),
          reason: 'Matched via Multimodal Vision Analysis'
        };
      }
    }

    // 3. Case B: Text-to-Product query
    const qLower = (queryText || '').toLowerCase();
    for (const prod of products) {
      const prodName = prod.name.toLowerCase();
      const sku = (prod.sku || '').toLowerCase();

      const isNameMatch = qLower.includes(prodName) || (prodName.length > 5 && qLower.includes(prodName.slice(0, 8)));
      const isSkuMatch = sku && qLower.includes(sku);
      const isKeywordMatch =
        (qLower.includes('shirt') && prodName.includes('overshirt')) ||
        (qLower.includes('trouser') && prodName.includes('trouser')) ||
        (qLower.includes('mockneck') && prodName.includes('mockneck')) ||
        (qLower.includes('crossbody') && prodName.includes('crossbody'));

      if (isNameMatch || isSkuMatch || isKeywordMatch) {
        // Authoritative record verification
        const authoritative = db.prepare('SELECT price, stock, status FROM products WHERE id = ?').get(prod.id);
        prod.price = authoritative.price;
        prod.stock = authoritative.stock;

        return {
          matched: true,
          product: prod,
          confidence: isSkuMatch ? 0.99 : (isNameMatch ? 0.96 : 0.88),
          reason: isSkuMatch ? 'Exact SKU Match' : 'Catalog Name/Keyword Match'
        };
      }
    }

    return { matched: false, confidence: 0, reason: 'No product matched in tenant catalog' };
  }
};
