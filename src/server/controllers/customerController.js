import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';

export const customerController = {
  async getAll(req, res, next) {
    try {
      const db = getDatabase();
      const businessId = req.businessId;

      const customers = db.prepare(`
        SELECT id, business_id, first_name, last_name, full_name, email, phone, customer_status, customer_type, source, total_orders, total_spent, contacts, addresses, social_accounts, tags, notes, created_at, updated_at
        FROM customers
        WHERE business_id = ?
        ORDER BY created_at DESC
      `).all(businessId);

      const parsed = customers.map(c => ({
        ...c,
        contacts: JSON.parse(c.contacts || '[]'),
        addresses: JSON.parse(c.addresses || '[]'),
        social_accounts: JSON.parse(c.social_accounts || '[]'),
        tags: JSON.parse(c.tags || '[]'),
        notes: JSON.parse(c.notes || '[]')
      }));

      return successResponse(res, parsed);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const businessId = req.businessId;
      const db = getDatabase();

      const customer = db.prepare(`
        SELECT * FROM customers WHERE id = ? AND business_id = ?
      `).get(id, businessId);

      if (!customer) {
        return errorResponse(res, 'Customer not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Fetch customer orders
      const orders = db.prepare(`
        SELECT id, status, total, created_at FROM orders 
        WHERE business_id = ? AND (customer_id = ? OR customer_email = ? OR customer_phone = ?)
        ORDER BY created_at DESC
      `).all(businessId, id, customer.email, customer.phone);

      return successResponse(res, {
        ...customer,
        contacts: JSON.parse(customer.contacts || '[]'),
        addresses: JSON.parse(customer.addresses || '[]'),
        social_accounts: JSON.parse(customer.social_accounts || '[]'),
        tags: JSON.parse(customer.tags || '[]'),
        notes: JSON.parse(customer.notes || '[]'),
        orders
      });
    } catch (err) {
      next(err);
    }
  },

  async addNote(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const businessId = req.businessId;
      const author = req.user.name || 'Store Staff';

      if (!content || !content.trim()) {
        return errorResponse(res, 'Note content cannot be empty.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const customer = db.prepare('SELECT * FROM customers WHERE id = ? AND business_id = ?').get(id, businessId);

      if (!customer) {
        return errorResponse(res, 'Customer not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const existingNotes = JSON.parse(customer.notes || '[]');
      const newNote = {
        id: `nt-${Date.now()}`,
        author,
        content: content.trim(),
        created_at: new Date().toISOString()
      };

      const updatedNotes = [newNote, ...existingNotes];

      db.prepare(`
        UPDATE customers SET notes = ?, updated_at = ? WHERE id = ? AND business_id = ?
      `).run(JSON.stringify(updatedNotes), new Date().toISOString(), id, businessId);

      return successResponse(res, updatedNotes, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }
};
