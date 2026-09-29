import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { aiService } from '../services/aiService.js';

export const conversationController = {
  async getAll(req, res, next) {
    try {
      const db = getDatabase();
      const businessId = req.businessId;

      const conversations = db.prepare(`
        SELECT id, business_id, customer_id, customer_name, customer_avatar, channel, unread, status, last_message_time, created_at, updated_at
        FROM conversations
        WHERE business_id = ?
        ORDER BY updated_at DESC
      `).all(businessId);

      const getMessages = db.prepare(`
        SELECT id, conversation_id, sender, sender_name, text, is_ai, channel, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
      `);

      const result = conversations.map(c => ({
        ...c,
        messages: getMessages.all(c.id).map(m => ({
          ...m,
          isAi: Boolean(m.is_ai),
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      }));

      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const businessId = req.businessId;
      const db = getDatabase();

      const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND business_id = ?').get(id, businessId);
      if (!conversation) {
        return errorResponse(res, 'Conversation not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(id);

      return successResponse(res, {
        ...conversation,
        messages: messages.map(m => ({
          ...m,
          isAi: Boolean(m.is_ai),
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      });
    } catch (err) {
      next(err);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { text, triggerAi = true } = req.body;
      const businessId = req.businessId;

      if (!text || !text.trim()) {
        return errorResponse(res, 'Message text is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const conversation = db.prepare('SELECT * FROM conversations WHERE id = ? AND business_id = ?').get(id, businessId);

      if (!conversation) {
        return errorResponse(res, 'Conversation not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const now = new Date().toISOString();
      const userMsgId = `msg-${Date.now()}`;

      db.prepare(`
        INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `).run(userMsgId, id, 'merchant', req.user.name || 'Merchant', text.trim(), conversation.channel, now);

      db.prepare('UPDATE conversations SET last_message_time = ?, updated_at = ? WHERE id = ?').run('Just now', now, id);

      let aiReply = null;
      if (triggerAi) {
        aiReply = await aiService.processMessage(businessId, text.trim(), {
          conversationId: id,
          customerName: conversation.customer_name
        });

        if (aiReply && aiReply.reply) {
          const aiMsgId = `msg-${Date.now() + 1}`;
          db.prepare(`
            INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
            VALUES (?, ?, 'ai', 'Kreazy AI', ?, 1, ?, ?)
          `).run(aiMsgId, id, aiReply.reply, conversation.channel, new Date().toISOString());
        }
      }

      const messages = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(id);

      return successResponse(res, {
        conversationId: id,
        messages: messages.map(m => ({
          ...m,
          isAi: Boolean(m.is_ai),
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })),
        aiResult: aiReply
      }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async receiveIncoming(req, res, next) {
    try {
      const { 
        businessId, 
        customerName, 
        text, 
        channel = 'WHATSAPP', 
        phone = '', 
        email = '' 
      } = req.body;

      const targetBusinessId = businessId || req.businessId;
      if (!targetBusinessId || !text || !customerName) {
        return errorResponse(res, 'businessId, customerName, and text are required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const now = new Date().toISOString();

      // Find or create customer
      let customer = db.prepare('SELECT id FROM customers WHERE business_id = ? AND (email = ? OR phone = ?)').get(targetBusinessId, email.trim(), phone.trim());
      let customerId = customer ? customer.id : null;

      if (!customerId) {
        customerId = `c-${Date.now()}`;
        db.prepare(`
          INSERT INTO customers (id, business_id, full_name, email, phone, source, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(customerId, targetBusinessId, customerName.trim(), email.trim(), phone.trim(), channel, now, now);
      }

      // Find or create conversation
      let conversation = db.prepare('SELECT id FROM conversations WHERE business_id = ? AND customer_id = ?').get(targetBusinessId, customerId);
      let convId = conversation ? conversation.id : null;

      if (!convId) {
        convId = `conv-${Date.now()}`;
        db.prepare(`
          INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, unread, status, last_message_time, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, 'ACTIVE', 'Just now', ?, ?)
        `).run(convId, targetBusinessId, customerId, customerName.trim(), channel, now, now);
      }

      // Insert customer message
      const msgId = `msg-${Date.now()}`;
      db.prepare(`
        INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
        VALUES (?, ?, 'customer', ?, ?, 0, ?, ?)
      `).run(msgId, convId, customerName.trim(), text.trim(), channel, now);

      // Trigger AI reasoning
      const aiReply = await aiService.processMessage(targetBusinessId, text.trim(), {
        conversationId: convId,
        customerName: customerName.trim()
      });

      if (aiReply && aiReply.reply) {
        const aiMsgId = `msg-${Date.now() + 1}`;
        db.prepare(`
          INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
          VALUES (?, ?, 'ai', 'Kreazy AI', ?, 1, ?, ?)
        `).run(aiMsgId, convId, aiReply.reply, channel, new Date().toISOString());
      }

      const allMsgs = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId);

      return successResponse(res, {
        conversationId: convId,
        customerId,
        messages: allMsgs,
        aiResponse: aiReply
      }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }
};
