import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { recoveryAttributionService } from '../services/recovery/recoveryAttributionService.js';

export const orderController = {
  async getAll(req, res, next) {
    try {
      const db = getDatabase();
      const businessId = req.businessId;

      const orders = await db.prepare(`
        SELECT id, business_id, customer_id, customer_name, customer_email, customer_phone, status, channel, subtotal, discount, total, shipping_address, created_at, updated_at
        FROM orders
        WHERE business_id = ?
        ORDER BY created_at DESC
      `).all(businessId);

      const parsed = await Promise.all((orders || []).map(async o => {
        const items = (await db.prepare(`
          SELECT id, product_id, product_name, product_sku, quantity, unit_price, total_price
          FROM order_items
          WHERE order_id = ?
        `).all(o.id)) || [];

        return {
          ...o,
          customer: {
            name: o.customer_name || 'Customer',
            email: o.customer_email || '',
            phone: o.customer_phone || '',
            handle: o.customer_phone || o.customer_email || '+15550000000',
            channel: o.channel || 'whatsapp'
          },
          email: o.customer_email,
          phone: o.customer_phone,
          date: o.created_at,
          createdAt: o.created_at,
          paymentMethod: 'COD / Direct Chat',
          shippingAddress: JSON.parse(o.shipping_address || '{}'),
          items
        };
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

      const order = await db.prepare(`
        SELECT * FROM orders WHERE id = ? AND business_id = ?
      `).get(id, businessId);

      if (!order) {
        return errorResponse(res, 'Order not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const items = (await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id)) || [];

      return successResponse(res, {
        ...order,
        customer: {
          name: order.customer_name || 'Customer',
          email: order.customer_email || '',
          phone: order.customer_phone || '',
          handle: order.customer_phone || order.customer_email || '+15550000000',
          channel: order.channel || 'whatsapp'
        },
        email: order.customer_email,
        phone: order.customer_phone,
        date: order.created_at,
        createdAt: order.created_at,
        paymentMethod: 'COD / Direct Chat',
        shippingAddress: JSON.parse(order.shipping_address || '{}'),
        items
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const {
        customerName,
        customerEmail = '',
        customerPhone = '',
        channel = 'DIRECT',
        items = [],
        discount = 0.0,
        shippingAddress = {}
      } = req.body;

      const businessId = req.businessId;

      if (!customerName || !items || !items.length) {
        return errorResponse(
          res,
          'Customer name and at least one order line item are required.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const db = getDatabase();
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      const now = new Date().toISOString();

      let subtotal = 0.0;
      const verifiedItems = [];

      // Atomic Transaction: Stock check & deduction
      const orderTransaction = db.transaction(async () => {
        for (const item of items) {
          const qty = parseInt(item.quantity || 1, 10);
          if (qty <= 0) {
            throw new Error(`Invalid quantity ${qty} for item.`);
          }

          let product = null;
          if (item.productId) {
            product = await db.prepare('SELECT * FROM products WHERE id = ? AND business_id = ?').get(item.productId, businessId);
          } else if (item.sku) {
            product = await db.prepare('SELECT * FROM products WHERE sku = ? AND business_id = ?').get(item.sku, businessId);
          } else if (item.name) {
            product = await db.prepare('SELECT * FROM products WHERE name LIKE ? AND business_id = ?').get(`%${item.name}%`, businessId);
          }

          const unitPrice = product ? product.price : parseFloat(item.price || item.unitPrice || 0);
          const lineTotal = unitPrice * qty;
          subtotal += lineTotal;

          if (product) {
            if (product.stock < qty) {
              throw new Error(`Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${qty}.`);
            }

            // Deduct stock
            const newStock = product.stock - qty;
            const newStatus = newStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';
            await db.prepare('UPDATE products SET stock = ?, status = ?, updated_at = ? WHERE id = ?').run(newStock, newStatus, now, product.id);
          }

          verifiedItems.push({
            id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            productId: product ? product.id : null,
            name: product ? product.name : (item.name || 'Custom Item'),
            sku: product ? product.sku : (item.sku || 'CUSTOM'),
            quantity: qty,
            unitPrice,
            totalPrice: lineTotal
          });
        }

        const safeDiscount = Math.max(0, parseFloat(discount) || 0);
        const finalTotal = Math.max(0, subtotal - safeDiscount);

        // Insert Order
        await db.prepare(`
          INSERT INTO orders (id, business_id, customer_name, customer_email, customer_phone, status, channel, subtotal, discount, total, shipping_address, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          orderId,
          businessId,
          customerName.trim(),
          customerEmail.trim(),
          customerPhone.trim(),
          'CONFIRMED',
          channel,
          subtotal,
          safeDiscount,
          finalTotal,
          JSON.stringify(shippingAddress),
          now,
          now
        );

        // Insert Line Items
        const insertItem = db.prepare(`
          INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const vi of verifiedItems) {
          await insertItem.run(vi.id, orderId, vi.productId, vi.name, vi.sku, vi.quantity, vi.unitPrice, vi.totalPrice);
        }

        // Update customer statistics if matching customer exists or auto-upsert customer
        const customer = await db.prepare(`
          SELECT id, total_spent, total_orders FROM customers 
          WHERE business_id = ? AND (email = ? OR phone = ?)
        `).get(businessId, customerEmail.trim(), customerPhone.trim());

        if (customer) {
          await db.prepare(`
            UPDATE customers 
            SET total_spent = total_spent + ?, total_orders = total_orders + 1, updated_at = ?
            WHERE id = ?
          `).run(finalTotal, now, customer.id);
        } else if (customerName) {
          // Auto create customer in CRM
          const newCustId = `c-${Date.now()}`;
          await db.prepare(`
            INSERT INTO customers (id, business_id, full_name, email, phone, source, total_orders, total_spent, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
          `).run(newCustId, businessId, customerName.trim(), customerEmail.trim(), customerPhone.trim(), channel, finalTotal, now, now);
        }
      });

      try {
        await orderTransaction();
      } catch (txnError) {
        return errorResponse(res, txnError.message, API_ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT);
      }

      const createdOrder = await db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

      // Attribute confirmed order to any active/recent recovery attempt
      try {
        const custRecord = await db.prepare('SELECT id FROM customers WHERE business_id = ? AND (email = ? OR phone = ?)').get(businessId, customerEmail.trim(), customerPhone.trim());
        await recoveryAttributionService.attributeOrder({
          tenantId: businessId,
          orderId,
          orderValue: createdOrder.total,
          currency: 'USD',
          customerId: custRecord ? custRecord.id : null,
          customerPhone: customerPhone.trim()
        });
      } catch (attrErr) {
        logger.warn('[ORDER CONTROLLER] Recovery attribution error:', attrErr.message);
      }
      const itemsCreated = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

      logger.info(`Order ${orderId} created for ${customerName} (Total: $${createdOrder.total})`);

      return successResponse(res, {
        ...createdOrder,
        customer: createdOrder.customer_name,
        email: createdOrder.customer_email,
        phone: createdOrder.customer_phone,
        shippingAddress: JSON.parse(createdOrder.shipping_address || '{}'),
        items: itemsCreated
      }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const businessId = req.businessId;

      const allowedStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!status || !allowedStatuses.includes(status.toUpperCase())) {
        return errorResponse(
          res,
          `Status must be one of: ${allowedStatuses.join(', ')}`,
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const db = getDatabase();
      const order = await db.prepare('SELECT * FROM orders WHERE id = ? AND business_id = ?').get(id, businessId);

      if (!order) {
        return errorResponse(res, 'Order not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const targetStatus = status.toUpperCase();
      const now = new Date().toISOString();

      // If cancelling an order, automatically restore product stock
      if (targetStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
        const items = await db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id);
        for (const it of items) {
          if (it.product_id) {
            await db.prepare("UPDATE products SET stock = stock + ?, status = 'IN_STOCK', updated_at = ? WHERE id = ?").run(it.quantity, now, it.product_id);
          }
        }
      }

      await db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND business_id = ?').run(targetStatus, now, id, businessId);

      const updated = await db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
      const items = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id);

      return successResponse(res, {
        ...updated,
        customer: updated.customer_name,
        items
      });
    } catch (err) {
      next(err);
    }
  }
};
