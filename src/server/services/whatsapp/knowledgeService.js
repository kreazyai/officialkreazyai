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
   * Compatible with both synchronous SQLite calls and asynchronous PostgreSQL queries.
   * @param {string} tenantId
   */
  getTenantKnowledge(tenantId) {
    if (!tenantId) return { faqs: [], policies: [], products: [] };
    const db = getDatabase();
    try {
      const faqsRaw = db.prepare("SELECT * FROM faqs WHERE tenant_id = ? AND status = 'ACTIVE'").all(tenantId);
      if (faqsRaw instanceof Promise) {
        return (async () => {
          const faqs = (await faqsRaw) || [];
          const policies = (await db.prepare("SELECT * FROM policies WHERE tenant_id = ? AND status = 'ACTIVE'").all(tenantId)) || [];
          const products = (await db.prepare("SELECT * FROM products WHERE (tenant_id = ? OR business_id = ?) AND status != 'DISCONTINUED'").all(tenantId, tenantId)) || [];
          return { faqs, policies, products };
        })();
      }
      const faqs = faqsRaw || [];
      const policies = db.prepare("SELECT * FROM policies WHERE tenant_id = ? AND status = 'ACTIVE'").all(tenantId) || [];
      const products = db.prepare("SELECT * FROM products WHERE (tenant_id = ? OR business_id = ?) AND status != 'DISCONTINUED'").all(tenantId, tenantId) || [];
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
      const raw = db.prepare(`
        SELECT * FROM ai_settings WHERE tenant_id = ?
      `).get(tenantId);

      if (raw instanceof Promise) {
        return (async () => {
          const row = await raw;
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
          return this._getDefaultAiSettings(tenantId);
        })();
      }

      if (raw) {
        return {
          id: raw.id,
          tenant_id: raw.tenant_id,
          system_instructions: raw.system_instructions || 'Assist shoppers professionally with store products and policies.',
          tone: raw.tone || 'professional, courteous',
          language_settings: JSON.parse(raw.language_settings || '["bn","en","banglish"]'),
          confidence_threshold: raw.confidence_threshold !== undefined ? raw.confidence_threshold : 0.75,
          handoff_rules: JSON.parse(raw.handoff_rules || '{}')
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
   */
  findMatchingFaq(tenantId, queryText) {
    if (!tenantId || !queryText) return { matched: false, score: 0 };
    const db = getDatabase();
    const cleanQuery = queryText.toLowerCase().trim();

    try {
      const raw = db.prepare(`
        SELECT id, question, answer, category FROM faqs
        WHERE tenant_id = ? AND status = 'ACTIVE'
      `).all(tenantId);

      const computeMatch = (faqs) => {
        let bestMatch = null;
        let highestScore = 0;

        for (const f of faqs || []) {
          const qLower = (f.question || '').toLowerCase();
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
        return { matched: false, score: 0 };
      };

      if (raw instanceof Promise) {
        return (async () => {
          const faqs = (await raw) || [];
          return computeMatch(faqs);
        })();
      }

      return computeMatch(raw || []);
    } catch (err) {
      logger.error('Error finding matching FAQ:', err.message);
      return { matched: false, score: 0 };
    }
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
      const raw = db.prepare(`
        SELECT id, policy_type, content FROM policies
        WHERE tenant_id = ? AND policy_type = ? AND status = 'ACTIVE'
        LIMIT 1
      `).get(tenantId, policyType.toUpperCase());

      if (raw instanceof Promise) {
        return (async () => {
          return (await raw) || null;
        })();
      }

      return raw || null;
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
    const products = (await db.prepare(`
      SELECT id, sku, name, description, price, currency, stock, category, attributes, ai_knowledge
      FROM products
      WHERE (business_id = ? OR tenant_id = ?) AND status != 'DISCONTINUED'
    `).all(tenantId, tenantId)) || [];

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
        const prodName = (prod.name || '').toLowerCase();
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
        const authoritative = await db.prepare('SELECT price, stock, status FROM products WHERE id = ? AND (business_id = ? OR tenant_id = ?) AND status != \'DISCONTINUED\'').get(bestProduct.id, tenantId, tenantId);
        if (!authoritative) {
          return { matched: false, confidence: 0, reason: 'Product verification failed' };
        }
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

        // 3. Case B: Tenant-scoped text-to-product matching
    const query = String(queryText || '').toLowerCase().trim();
    const queryWords = new Set(query.match(/[\p{L}\p{N}]+/gu) || []);

    const fullMatches = products.filter(p => {
      const name = String(p.name || '').toLowerCase().trim();
      return name.length > 0 && query.includes(name);
    });

    const skuMatches = products.filter(p => {
      const sku = String(p.sku || '').toLowerCase().trim();
      return sku.length > 0 && queryWords.has(sku);
    });

    const partialMatches = products.filter(p => {
      const words = String(p.name || '').toLowerCase()
        .match(/[\p{L}\p{N}]+/gu) || [];
      return words.some(word => word.length >= 4 && queryWords.has(word));
    });

    const matches = skuMatches.length ? skuMatches
      : fullMatches.length ? fullMatches
      : partialMatches;

    if (matches.length > 1) {
      return {
        matched: false,
        ambiguous: true,
        confidence: 0,
        reason: 'Multiple products matched',
        candidates: matches.slice(0, 5).map(p => ({ id: p.id, name: p.name }))
      };
    }

    if (matches.length === 1) {
      const product = matches[0];

      const authoritative = await db.prepare(`
        SELECT price, currency, stock, status
        FROM products
        WHERE id = ?
          AND (business_id = ? OR tenant_id = ?)
          AND status != 'DISCONTINUED'
      `).get(product.id, tenantId, tenantId);

      if (!authoritative) {
        return { matched: false, confidence: 0, reason: 'Product verification failed' };
      }

      return {
        matched: true,
        product: { ...product, ...authoritative },
        confidence: skuMatches.length ? 0.99 : fullMatches.length ? 0.98 : 0.96,
        reason: skuMatches.length ? 'SKU Match' : fullMatches.length ? 'Full Name Match' : 'Partial Name Match'
      };
    }

    return { matched: false, confidence: 0, reason: 'No product matched in tenant catalog' };
  }
};


