import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { aiService } from '../services/aiService.js';

export const conversationController = {
  async getAll(req, res, next) {
    try {
      const db = getDatabase();
      const businessId = req.businessId;

      const conversations = await db.prepare(`
        SELECT id, business_id, customer_id, customer_name, customer_avatar, channel, unread, status, last_message_time, created_at, updated_at
        FROM conversations
        WHERE business_id = ?
        ORDER BY updated_at DESC
      `).all(businessId);

      const convList = Array.isArray(conversations) ? conversations : [];

      const getMessages = db.prepare(`
        SELECT id, conversation_id, sender, sender_name, text, is_ai, channel, created_at
        FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        LIMIT 50
      `);

      const result = await Promise.all(convList.map(async c => {
        const msgs = await getMessages.all(c.id);
        const msgList = Array.isArray(msgs) ? msgs : [];
        return {
          ...c,
          messages: msgList.map(m => ({
            ...m,
            isAi: Boolean(m.is_ai),
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        };
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

      const conversation = await db.prepare('SELECT * FROM conversations WHERE id = ? AND business_id = ?').get(id, businessId);
      if (!conversation) {
        return errorResponse(res, 'Conversation not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const messages = await db.prepare(`
        SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 50
      `).all(id);

      const msgList = Array.isArray(messages) ? messages : [];

      return successResponse(res, {
        ...conversation,
        messages: msgList.map(m => ({
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
      const { text, sender = 'agent' } = req.body;
      const businessId = req.businessId;

      if (!text || !text.trim()) {
        return errorResponse(res, 'Message text is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const conversation = await db.prepare('SELECT * FROM conversations WHERE id = ? AND business_id = ?').get(id, businessId);
      if (!conversation) {
        return errorResponse(res, 'Conversation not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const now = new Date().toISOString();
      const msgId = `msg-${Date.now()}`;
      const senderName = req.user?.name || 'Agent';

      await db.prepare(`
        INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
      `).run(msgId, id, sender, senderName, text.trim(), conversation.channel, now);

      await db.prepare('UPDATE conversations SET last_message_time = ?, updated_at = ?, unread = 0 WHERE id = ?').run('Just now', now, id);

      const messages = await db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(id);
      const msgList = Array.isArray(messages) ? messages : [];

      return successResponse(res, {
        conversationId: id,
        messages: msgList.map(m => ({
          ...m,
          isAi: Boolean(m.is_ai),
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/conversations/:id — update status, unread
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, unread } = req.body;
      const businessId = req.businessId;
      const db = getDatabase();

      const conversation = await db.prepare('SELECT id FROM conversations WHERE id = ? AND business_id = ?').get(id, businessId);
      if (!conversation) {
        return errorResponse(res, 'Conversation not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const now = new Date().toISOString();
      const sets = [];
      const vals = [];

      if (status !== undefined) { sets.push('status = ?'); vals.push(status); }
      if (unread !== undefined) { sets.push('unread = ?'); vals.push(unread ? 1 : 0); }
      sets.push('updated_at = ?');
      vals.push(now, id);

      await db.prepare(`UPDATE conversations SET ${sets.join(', ')} WHERE id = ?`).run(...vals);

      const updated = await db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
      return successResponse(res, updated);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/conversations/:id/ai-suggest — suggest reply without sending
  async aiSuggest(req, res, next) {
    try {
      const { id } = req.params;
      const { userMessage } = req.body;
      const businessId = req.businessId;
      const db = getDatabase();

      const conversation = await db.prepare('SELECT * FROM conversations WHERE id = ? AND business_id = ?').get(id, businessId);
      if (!conversation) {
        return errorResponse(res, 'Conversation not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const lastMsg = await db.prepare(`
        SELECT text FROM messages WHERE conversation_id = ? AND sender = 'customer'
        ORDER BY created_at DESC LIMIT 1
      `).get(id);

      const input = userMessage || lastMsg?.text || 'Help the customer with their inquiry.';

      const aiReply = await aiService.processMessage(businessId, input, {
        conversationId: id,
        customerName: conversation.customer_name,
        mode: 'suggest'
      });

      return successResponse(res, {
        suggestion: aiReply?.reply || '',
        confidence: aiReply?.confidence || 0,
      });
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

      let customer = await db.prepare('SELECT id FROM customers WHERE business_id = ? AND (email = ? OR phone = ?)').get(targetBusinessId, email.trim(), phone.trim());
      let customerId = customer?.id;

      if (!customerId) {
        customerId = `c-${Date.now()}`;
        await db.prepare(`
          INSERT INTO customers (id, business_id, full_name, email, phone, source, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(customerId, targetBusinessId, customerName.trim(), email.trim(), phone.trim(), channel, now, now);
      }

      let conversation = await db.prepare('SELECT id FROM conversations WHERE business_id = ? AND customer_id = ?').get(targetBusinessId, customerId);
      let convId = conversation?.id;

      if (!convId) {
        convId = `conv-${Date.now()}`;
        await db.prepare(`
          INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, unread, status, last_message_time, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 1, 'ACTIVE', 'Just now', ?, ?)
        `).run(convId, targetBusinessId, customerId, customerName.trim(), channel, now, now);
      } else {
        await db.prepare('UPDATE conversations SET unread = unread + 1, last_message_time = ?, updated_at = ? WHERE id = ?').run('Just now', now, convId);
      }

      const msgId = `msg-${Date.now()}`;
      await db.prepare(`
        INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
        VALUES (?, ?, 'customer', ?, ?, 0, ?, ?)
      `).run(msgId, convId, customerName.trim(), text.trim(), channel, now);

      const aiReply = await aiService.processMessage(targetBusinessId, text.trim(), {
        conversationId: convId,
        customerName: customerName.trim()
      });

      if (aiReply?.reply) {
        const aiMsgId = `msg-${Date.now() + 1}`;
        await db.prepare(`
          INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
          VALUES (?, ?, 'ai', 'Kreazy AI', ?, 1, ?, ?)
        `).run(aiMsgId, convId, aiReply.reply, channel, new Date().toISOString());
      }

      const allMsgs = await db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(convId);
      const msgList = Array.isArray(allMsgs) ? allMsgs : [];
      return successResponse(res, { conversationId: convId, customerId, messages: msgList, aiResponse: aiReply }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }
};
