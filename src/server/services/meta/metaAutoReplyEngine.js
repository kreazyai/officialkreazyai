import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { AiKnowledgeEngine, AI_INTENTS } from '../../../services/aiKnowledgeEngine.js';
import { metaConnectionService } from './metaConnectionService.js';
import { whatsappService } from './whatsappService.js';
import { instagramService } from './instagramService.js';
import { messengerService } from './messengerService.js';
import { whatsappPipeline } from '../whatsapp/whatsappPipeline.js';

export const metaAutoReplyEngine = {
  /**
   * Process a normalized incoming Meta message through the Rule-First, AI-Second pipeline
   * @param {object} normalizedEvent 
   * @returns {Promise<{ replied: boolean, replyText?: string, intent?: string, ruleMatched?: boolean, escalated?: boolean }>}
   */
  async processIncomingMessage(normalizedEvent) {
    const {
      platform,
      businessId,
      workspaceId,
      externalConversationId,
      externalMessageId,
      messageText,
      sender
    } = normalizedEvent;

    if (!messageText || !businessId) {
      return { replied: false, reason: 'Empty message or missing businessId' };
    }

    // ─────────────────────────────────────────────────────────────────
    // Route WhatsApp through dedicated Production Pipeline
    // ─────────────────────────────────────────────────────────────────
    if (platform === 'WHATSAPP') {
      const waResult = await whatsappPipeline.processInboundMessage(normalizedEvent);
      return {
        replied: Boolean(waResult.replied),
        dispatchSuccess: waResult.dispatchSuccess,
        replyText: waResult.replyText,
        intent: waResult.intent,
        ruleMatched: true,
        escalated: Boolean(waResult.isEscalated),
        language: waResult.language
      };
    }

    const db = getDatabase();

    // 1. Check if Connection exists and Auto-Reply is enabled
    const conn = metaConnectionService.getConnectionWithToken(businessId, platform);
    if (!conn) {
      logger.info(`Auto-reply skipped: No connection for ${platform} in workspace ${businessId}`);
      return { replied: false, reason: 'Channel not connected' };
    }

    if (conn.auto_reply_enabled === 0) {
      logger.info(`Auto-reply disabled by merchant for ${platform} in workspace ${businessId}`);
      return { replied: false, reason: 'Auto-reply toggled OFF' };
    }

    const confidenceThreshold = conn.ai_confidence_threshold || 0.75;

    // 2. Identify or Create Customer in CRM
    let customer = null;
    const cleanPhone = sender.phone ? sender.phone.replace(/[^0-9]/g, '') : null;
    if (cleanPhone) {
      customer = db.prepare('SELECT * FROM customers WHERE business_id = ? AND phone = ?').get(businessId, cleanPhone);
    }
    if (!customer) {
      const custId = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const fullName = sender.name || (cleanPhone ? `Customer +${cleanPhone}` : `Social User`);
      db.prepare(`
        INSERT INTO customers (id, business_id, full_name, phone, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(custId, businessId, fullName, cleanPhone, platform);
      customer = { id: custId, full_name: fullName, phone: cleanPhone };
    }

    // 3. Identify or Create Conversation Thread
    let conversation = db.prepare(`
      SELECT * FROM conversations WHERE business_id = ? AND id = ?
    `).get(businessId, externalConversationId);

    if (!conversation) {
      db.prepare(`
        INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, status, unread, last_message_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'ACTIVE', 1, datetime('now'), datetime('now'), datetime('now'))
      `).run(externalConversationId, businessId, customer.id, customer.full_name, platform);
      conversation = { id: externalConversationId, status: 'ACTIVE' };
    }

    // Record incoming customer message in DB
    const incomingMsgId = `msg-in-${externalMessageId ? externalMessageId.replace(/[^a-zA-Z0-9_-]/g, '_') : Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT OR IGNORE INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
      VALUES (?, ?, 'customer', ?, ?, 0, ?, datetime('now'))
    `).run(incomingMsgId, externalConversationId, customer.full_name, messageText, platform);

    // ─────────────────────────────────────────────────────────────────
    // STEP 4: RULE-FIRST ENGINE (Fast, Deterministic, Zero Cost)
    // ─────────────────────────────────────────────────────────────────
    const ruleResult = this.evaluateBusinessRules(messageText, businessId, customer);

    let replyText = null;
    let replyIntent = null;
    let ruleMatched = false;
    let escalated = false;

    if (ruleResult.matched) {
      replyText = ruleResult.reply;
      replyIntent = ruleResult.intent;
      ruleMatched = true;
      logger.info(`[RULE-FIRST MATCH] Intent: ${replyIntent} for "${messageText}"`);
    } else {
      // ─────────────────────────────────────────────────────────────────
      // STEP 5: AI-SECOND ENGINE (Heuristic/Gemini/OpenAI Knowledge Reasoning)
      // ─────────────────────────────────────────────────────────────────
      logger.info(`No exact business rule matched. Routing to AI Knowledge Engine...`);
      const aiResult = await AiKnowledgeEngine.processMessage(messageText, { businessId });
      const confidence = (aiResult.confidence || 80) / 100;
      replyIntent = aiResult.intent;

      // Check Human Escalation or Low Confidence
      if (aiResult.intent === AI_INTENTS.HUMAN_ESCALATION || confidence < confidenceThreshold) {
        escalated = true;
        replyText = "Let me connect you with a team member who can help right away.";
        db.prepare(`
          UPDATE conversations SET status = 'NEEDS_HUMAN', updated_at = datetime('now')
          WHERE id = ?
        `).run(externalConversationId);
        logger.info(`[HUMAN ESCALATION] Thread ${externalConversationId} assigned to Live Inbox (Confidence: ${confidence})`);
      } else {
        replyText = aiResult.reply;
      }
    }

    if (!replyText) {
      return { replied: false, reason: 'No response could be synthesized' };
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 6: RECORD AI OUTBOUND REPLY IN DATABASE
    // ─────────────────────────────────────────────────────────────────
    const aiMsgId = `msg-ai-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, created_at)
      VALUES (?, ?, 'ai', 'Kreazy AI Concierge', ?, 1, ?, datetime('now'))
    `).run(aiMsgId, externalConversationId, replyText, platform);

    db.prepare(`
      UPDATE conversations SET last_message_time = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(externalConversationId);

    // ─────────────────────────────────────────────────────────────────
    // STEP 7: DISPATCH OUTBOUND REPLY VIA OFFICIAL META API
    // ─────────────────────────────────────────────────────────────────
    const token = conn.decryptedAccessToken;
    let dispatchSuccess = false;

    if (platform === 'WHATSAPP') {
      const phoneNumberId = conn.phone_number_id;
      const res = await whatsappService.sendTextMessage(phoneNumberId, token, sender.phone || sender.id, replyText);
      dispatchSuccess = res.success;
    } else if (platform === 'INSTAGRAM') {
      const res = await instagramService.sendTextMessage(conn.instagram_account_id || conn.page_id, token, sender.id, replyText);
      dispatchSuccess = res.success;
    } else if (platform === 'MESSENGER') {
      const res = await messengerService.sendTextMessage(conn.page_id, token, sender.id, replyText);
      dispatchSuccess = res.success;
    }

    // Update last webhook timestamp on connection
    db.prepare(`
      UPDATE meta_connections SET last_webhook_at = datetime('now'), updated_at = datetime('now')
      WHERE business_id = ? AND platform = ?
    `).run(businessId, platform);

    return {
      replied: true,
      dispatchSuccess,
      replyText,
      intent: replyIntent,
      ruleMatched,
      escalated
    };
  },

  /**
   * Deterministic rule evaluation against merchant's live relational database
   */
  evaluateBusinessRules(message, businessId, customer) {
    const text = message.toLowerCase();
    const db = getDatabase();

    // 1. Return Policy Rule
    if (text.includes('return') || text.includes('exchange') || text.includes('refund policy')) {
      const config = db.prepare('SELECT return_policy, return_days FROM ai_configs WHERE business_id = ?').get(businessId);
      const policy = config?.return_policy || `Items can be exchanged within ${config?.return_days || 14} days with original tags attached.`;
      return {
        matched: true,
        intent: 'RETURN_POLICY',
        reply: `${policy} Would you like help initiating an exchange?`
      };
    }

    // 2. Shipping & Delivery Fee Rule
    if (text.includes('delivery') || text.includes('shipping') || text.includes('how much is delivery') || text.includes('delivery charge')) {
      const config = db.prepare('SELECT shipping_info FROM ai_configs WHERE business_id = ?').get(businessId);
      const shipping = config?.shipping_info || 'Delivery is $5 standard (2-4 business days), free on orders over $75.';
      return {
        matched: true,
        intent: 'DELIVERY_INQUIRY',
        reply: `${shipping}`
      };
    }

    // 3. Payment Methods Rule
    if (text.includes('payment method') || text.includes('accept card') || text.includes('cash on delivery') || text.includes('how to pay')) {
      return {
        matched: true,
        intent: 'PAYMENT_METHODS',
        reply: 'We accept Visa, Mastercard, American Express, Apple Pay, and Cash on Delivery (COD) in eligible delivery areas.'
      };
    }

    // 4. Order Status by Order ID (e.g. "order #1001", "status of order-101")
    const orderMatch = text.match(/order\s*#?([a-z0-9-]+)/i);
    if (orderMatch && orderMatch[1]) {
      const searchId = orderMatch[1];
      const order = db.prepare(`
        SELECT * FROM orders 
        WHERE business_id = ? AND (id LIKE ? OR id = ?)
        LIMIT 1
      `).get(businessId, `%${searchId}%`, searchId);

      if (order) {
        return {
          matched: true,
          intent: 'ORDER_STATUS',
          reply: `Order #${order.id} is currently ${order.status.toUpperCase()} (Total: $${order.total.toFixed(2)}). It was placed on ${new Date(order.created_at).toLocaleDateString()}.`
        };
      }
    }

    // 5. Product Availability & Stock Check (Live DB query)
    const products = db.prepare('SELECT sku, name, price, stock, variants FROM products WHERE business_id = ?').all(businessId);
    for (const prod of products) {
      const prodName = prod.name.toLowerCase();
      // Check if product name, SKU, or general clothing item is mentioned
      const isItemMatch = text.includes(prodName) ||
        text.includes(prod.sku.toLowerCase()) ||
        (text.includes('shirt') && prodName.includes('overshirt')) ||
        (text.includes('trouser') && prodName.includes('trouser')) ||
        (text.includes('mockneck') && prodName.includes('mockneck'));

      if (isItemMatch) {
        // Check size queries: S, M, L, XL, XXL
        const sizeMatch = text.match(/\b(xs|s|m|l|xl|xxl|small|medium|large)\b/i);
        if (sizeMatch) {
          const reqSize = sizeMatch[1].toUpperCase();
          if (prod.stock > 0) {
            return {
              matched: true,
              intent: 'PRODUCT_AVAILABILITY',
              reply: `Yes, we have the ${prod.name} in size ${reqSize} in stock! It is priced at $${prod.price.toFixed(2)}. Would you like me to reserve one or create an order for you?`
            };
          } else {
            return {
              matched: true,
              intent: 'PRODUCT_AVAILABILITY',
              reply: `The ${prod.name} in size ${reqSize} is currently out of stock. Would you like to be notified when it arrives or see a similar style?`
            };
          }
        }

        // General stock inquiry
        if (text.includes('available') || text.includes('in stock') || text.includes('have this')) {
          if (prod.stock > 0) {
            return {
              matched: true,
              intent: 'PRODUCT_AVAILABILITY',
              reply: `Yes! The ${prod.name} is available in stock at $${prod.price.toFixed(2)}. What size or color would you like?`
            };
          } else {
            return {
              matched: true,
              intent: 'PRODUCT_AVAILABILITY',
              reply: `The ${prod.name} is currently out of stock. We expect a restock next week!`
            };
          }
        }

        // Price inquiry
        if (text.includes('price') || text.includes('how much') || text.includes('cost')) {
          return {
            matched: true,
            intent: 'PRICING_INQUIRY',
            reply: `The ${prod.name} is $${prod.price.toFixed(2)}.`
          };
        }
      }
    }

    return { matched: false };
  }
};
