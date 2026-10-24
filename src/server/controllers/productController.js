import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';

export const productController = {
  async getAll(req, res, next) {
    try {
      const db = getDatabase();
      const businessId = req.businessId;

      const products = await db.prepare(`
        SELECT id, business_id, sku, name, category, price, stock, status, variants, image_url, ai_knowledge, created_at, updated_at
        FROM products
        WHERE business_id = ?
        ORDER BY created_at DESC
      `).all(businessId);

      const parsed = (products || []).map(p => ({
        ...p,
        variants: JSON.parse(p.variants || '[]')
      }));

      return successResponse(res, parsed);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const db = getDatabase();
      const { id } = req.params;
      const businessId = req.businessId;

      const product = await db.prepare(`
        SELECT id, business_id, sku, name, category, price, stock, status, variants, image_url, ai_knowledge, created_at, updated_at
        FROM products
        WHERE id = ? AND business_id = ?
      `).get(id, businessId);

      if (!product) {
        return errorResponse(res, 'Product not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(res, {
        ...product,
        variants: JSON.parse(product.variants || '[]')
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name, price, stock = 0, sku, category = 'General', variants = [], aiKnowledge = '', imageUrl = '' } = req.body;
      const businessId = req.businessId;

      if (!name || price === undefined || price === null) {
        return errorResponse(res, 'Product name and price are required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return errorResponse(res, 'Product price must be a non-negative number.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const parsedStock = parseInt(stock, 10);
      const safeStock = isNaN(parsedStock) || parsedStock < 0 ? 0 : parsedStock;
      const finalSku = (sku || `SKU-${Date.now().toString().slice(-6)}`).trim().toUpperCase();

      const db = getDatabase();

      // Check SKU collision within this tenant
      const existingSku = await db.prepare('SELECT id FROM products WHERE business_id = ? AND sku = ?').get(businessId, finalSku);
      if (existingSku) {
        return errorResponse(res, `A product with SKU "${finalSku}" already exists in your catalog.`, API_ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT);
      }

      const id = `prod-${Date.now()}`;
      const now = new Date().toISOString();
      const status = safeStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';

      await db.prepare(`
        INSERT INTO products (id, business_id, sku, name, category, price, stock, status, variants, image_url, ai_knowledge, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        businessId,
        finalSku,
        name.trim(),
        category.trim(),
        parsedPrice,
        safeStock,
        status,
        JSON.stringify(Array.isArray(variants) ? variants : [variants]),
        imageUrl.trim(),
        aiKnowledge.trim(),
        now,
        now
      );

      const created = await db.prepare('SELECT * FROM products WHERE id = ?').get(id);

      return successResponse(res, {
        ...created,
        variants: JSON.parse(created?.variants || '[]')
      }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const businessId = req.businessId;
      const db = getDatabase();

      const existing = await db.prepare('SELECT * FROM products WHERE id = ? AND business_id = ?').get(id, businessId);
      if (!existing) {
        return errorResponse(res, 'Product not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const { name, price, stock, sku, category, variants, aiKnowledge, imageUrl, status } = req.body;

      const finalName = name !== undefined ? name.trim() : existing.name;
      const finalPrice = price !== undefined ? parseFloat(price) : existing.price;
      const finalStock = stock !== undefined ? parseInt(stock, 10) : existing.stock;
      const finalSku = sku !== undefined ? sku.trim().toUpperCase() : existing.sku;
      const finalCategory = category !== undefined ? category.trim() : existing.category;
      const finalVariants = variants !== undefined ? JSON.stringify(Array.isArray(variants) ? variants : [variants]) : existing.variants;
      const finalKnowledge = aiKnowledge !== undefined ? aiKnowledge.trim() : existing.ai_knowledge;
      const finalImage = imageUrl !== undefined ? imageUrl.trim() : existing.image_url;
      const finalStatus = status !== undefined ? status : (finalStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK');
      const now = new Date().toISOString();

      // Check SKU uniqueness if changed
      if (finalSku !== existing.sku) {
        const skuCollision = await db.prepare('SELECT id FROM products WHERE business_id = ? AND sku = ? AND id != ?').get(businessId, finalSku, id);
        if (skuCollision) {
          return errorResponse(res, `Another product already uses SKU "${finalSku}".`, API_ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT);
        }
      }

      await db.prepare(`
        UPDATE products 
        SET name = ?, price = ?, stock = ?, sku = ?, category = ?, variants = ?, ai_knowledge = ?, image_url = ?, status = ?, updated_at = ?
        WHERE id = ? AND business_id = ?
      `).run(
        finalName,
        finalPrice,
        finalStock,
        finalSku,
        finalCategory,
        finalVariants,
        finalKnowledge,
        finalImage,
        finalStatus,
        now,
        id,
        businessId
      );

      const updated = await db.prepare('SELECT * FROM products WHERE id = ?').get(id);

      return successResponse(res, {
        ...updated,
        variants: JSON.parse(updated?.variants || '[]')
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const businessId = req.businessId;
      const db = getDatabase();

      const existing = await db.prepare('SELECT id FROM products WHERE id = ? AND business_id = ?').get(id, businessId);
      if (!existing) {
        return errorResponse(res, 'Product not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await db.prepare('DELETE FROM products WHERE id = ? AND business_id = ?').run(id, businessId);
      return successResponse(res, { deleted: true, id });
    } catch (err) {
      next(err);
    }
  }
};
