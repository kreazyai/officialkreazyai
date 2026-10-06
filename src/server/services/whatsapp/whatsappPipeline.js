import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';
import { languageDetector } from './languageDetector.js';
import { knowledgeService } from './knowledgeService.js';
import { whatsappService } from '../meta/whatsappService.js';
import { metaConnectionService } from '../meta/metaConnectionService.js';

export const WHATSAPP_INTENTS = {
  PRODUCT_INQUIRY: 'PRODUCT_INQUIRY',
  PRODUCT_AVAILABILITY: 'PRODUCT_AVAILABILITY',
  FAQ: 'FAQ',
  DELIVERY: 'DELIVERY',
  RETURN_REFUND: 'RETURN_REFUND',
  ORDER_STATUS: 'ORDER_STATUS',
  GENERAL_INQUIRY: 'GENERAL_INQUIRY',
  HUMAN_HANDOFF: 'HUMAN_HANDOFF',
  OTHER: 'OTHER'
};

export const whatsappPipeline = {
  /**
   * Complete 14-step End-to-End WhatsApp Messaging Pipeline
   * @param {object} inboundEvent Normalized event from webhook
   * @returns {Promise<object>} Processing result and decision metadata
   */
  async processInboundMessage(inboundEvent) {
    const startTime = Date.now();
    const db = getDatabase();

    const {
      businessId, // tenant_id
      externalConversationId,
      externalMessageId,
      sender,
      recipient
    } = inboundEvent;

    const rawMessageText = inboundEvent.messageText || inboundEvent.message?.text || inboundEvent.text || '';
    const messageType = inboundEvent.messageType || inboundEvent.message?.type || 'text';
    const attachments = inboundEvent.attachments || inboundEvent.message?.attachments || [];

    // ─────────────────────────────────────────────────────────────────
    // STEP 1: TENANT RESOLUTION & VALIDATION
    // ─────────────────────────────────────────────────────────────────
    if (!businessId) {
      logger.warn('[PIPELINE] Inbound message dropped: Unresolved tenant.');
      return { success: false, reason: 'TENANT_UNRESOLVED' };
    }

    const tenantId = businessId;

    // Verify tenant exists and connection is active
    let conn = metaConnectionService.getConnectionWithToken(tenantId, 'WHATSAPP');
    if (!conn) {
      try {
        const waConn = db.prepare('SELECT * FROM whatsapp_connections WHERE tenant_id = ?').get(tenantId);
        if (waConn && waConn.status === 'CONNECTED') {
          conn = {
            ...waConn,
            decryptedAccessToken: config.meta.whatsappAccessToken || 'simulated_wa_token',
            auto_reply_enabled: waConn.auto_reply_enabled !== undefined ? waConn.auto_reply_enabled : 1
          };
        }
      } catch {
        // Safe fallback
      }
    }

    if (!conn) {
      logger.info(`[PIPELINE] No WhatsApp connection found for tenant ${tenantId}`);
      return { success: false, reason: 'WHATSAPP_NOT_CONNECTED' };
    }

    if (conn.auto_reply_enabled === 0) {
      logger.info(`[PIPELINE] Auto-reply is disabled for tenant ${tenantId}`);
      return { success: false, reason: 'AUTO_REPLY_DISABLED' };
    }

    const aiSettings = knowledgeService.getTenantAiSettings(tenantId);
    const confidenceThreshold = aiSettings.confidence_threshold || 0.75;

    // ─────────────────────────────────────────────────────────────────
    // STEP 2: CUSTOMER RESOLUTION (Tenant-Scoped)
    // ─────────────────────────────────────────────────────────────────
    const rawPhone = sender?.phone || sender?.id;
    const cleanPhone = rawPhone ? String(rawPhone).replace(/[^0-9]/g, '') : null;
    let customer = null;

    if (cleanPhone) {
      customer = db.prepare(`
        SELECT id, full_name, phone FROM customers 
        WHERE (business_id = ? OR tenant_id = ?) AND phone = ?
        LIMIT 1
      `).get(tenantId, tenantId, cleanPhone);
    }

    if (!customer) {
      const custId = `cust-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const fullName = sender?.name || (cleanPhone ? `Customer +${cleanPhone}` : 'WhatsApp Shopper');
      db.prepare(`
        INSERT INTO customers (id, business_id, tenant_id, full_name, phone, source, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'WHATSAPP', datetime('now'), datetime('now'))
      `).run(custId, tenantId, tenantId, fullName, cleanPhone);
      customer = { id: custId, full_name: fullName, phone: cleanPhone };
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 3: CONVERSATION RESOLUTION (Tenant-Scoped)
    // ─────────────────────────────────────────────────────────────────
    const convId = externalConversationId || `wa_conv_${cleanPhone || Date.now()}`;
    let conversation = db.prepare(`
      SELECT id, status FROM conversations 
      WHERE (business_id = ? OR tenant_id = ?) AND id = ?
      LIMIT 1
    `).get(tenantId, tenantId, convId);

    if (!conversation) {
      db.prepare(`
        INSERT INTO conversations (
          id, business_id, tenant_id, customer_id, customer_name,
          channel, status, unread, last_message_time, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'WHATSAPP', 'ACTIVE', 1, datetime('now'), datetime('now'), datetime('now'))
      `).run(convId, tenantId, tenantId, customer.id, customer.full_name);
      conversation = { id: convId, status: 'ACTIVE' };
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 4: MESSAGE PERSISTENCE (Inbound Saved)
    // ─────────────────────────────────────────────────────────────────
    const inMsgId = `msg-in-${externalMessageId ? externalMessageId.replace(/[^a-zA-Z0-9_-]/g, '_') : Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const mediaRef = attachments.length > 0 ? JSON.stringify(attachments) : null;

    db.prepare(`
      INSERT OR IGNORE INTO messages (
        id, conversation_id, sender, sender_name, text, is_ai, channel,
        tenant_id, direction, message_type, media_reference, external_message_id, created_at
      ) VALUES (?, ?, 'customer', ?, ?, 0, 'WHATSAPP', ?, 'INBOUND', ?, ?, ?, datetime('now'))
    `).run(
      inMsgId,
      convId,
      customer.full_name,
      rawMessageText || (messageType === 'image' ? '[Image Attachment]' : ''),
      tenantId,
      messageType,
      mediaRef,
      externalMessageId || null
    );

    // ─────────────────────────────────────────────────────────────────
    // STEP 5: LANGUAGE DETECTION (Bangla, English, Banglish, Mixed)
    // ─────────────────────────────────────────────────────────────────
    const langResult = languageDetector.detect(rawMessageText);
    const normalizedText = languageDetector.normalize(rawMessageText);

    logger.info(`[PIPELINE] Language detected: ${langResult.language} (Confidence: ${langResult.confidence}) for "${normalizedText}"`);

    // ─────────────────────────────────────────────────────────────────
    // STEP 6: INTENT CLASSIFICATION
    // ─────────────────────────────────────────────────────────────────
    const classification = this.classifyIntent(normalizedText, attachments, langResult.language);
    const intent = classification.intent;
    let initialConfidence = classification.confidence;

    logger.info(`[PIPELINE] Intent classified: ${intent} (Confidence: ${initialConfidence})`);

    // ─────────────────────────────────────────────────────────────────
    // STEP 7: KNOWLEDGE RETRIEVAL & GROUNDING
    // ─────────────────────────────────────────────────────────────────
    let replyText = null;
    let confidence = initialConfidence;
    let retrievalSource = 'AI Reasoning';
    let isEscalated = false;
    let matchedProduct = null;

    // Handle Human Escalation Intent
    if (intent === WHATSAPP_INTENTS.HUMAN_HANDOFF) {
      isEscalated = true;
      replyText = langResult.language === 'BANGLA'
        ? 'আমি আপনাকে অবিলম্বে একজন টিম মেম্বারের সাথে যুক্ত করছি।'
        : 'Let me connect you with a team member who can help right away.';
      retrievalSource = 'Human Escalation Rule';
      confidence = 0.99;
    }

    // Handle Order Status
    else if (intent === WHATSAPP_INTENTS.ORDER_STATUS) {
      const orderSearch = normalizedText.match(/order\s*#?([a-z0-9-]+)/i);
      const searchId = orderSearch ? orderSearch[1] : null;
      let order = null;

      if (searchId) {
        order = db.prepare(`
          SELECT * FROM orders 
          WHERE (business_id = ? OR tenant_id = ?) AND (id LIKE ? OR id = ?)
          LIMIT 1
        `).get(tenantId, tenantId, `%${searchId}%`, searchId);
      } else if (cleanPhone) {
        order = db.prepare(`
          SELECT * FROM orders 
          WHERE (business_id = ? OR tenant_id = ?) AND customer_phone = ?
          ORDER BY created_at DESC LIMIT 1
        `).get(tenantId, tenantId, cleanPhone);
      }

      if (order) {
        replyText = langResult.language === 'BANGLA'
          ? `আপনার অর্ডার #${order.id} বর্তমানে ${order.status} অবস্থায় আছে (মোট: $${order.total.toFixed(2)})।`
          : `Order #${order.id} is currently ${order.status.toUpperCase()} (Total: $${order.total.toFixed(2)}).`;
        retrievalSource = 'Authoritative Orders Database';
        confidence = 0.98;
      } else {
        replyText = langResult.language === 'BANGLA'
          ? 'অনুগ্রহ করে আপনার সঠিক অর্ডার নম্বরটি লিখুন (যেমন: order-101)।'
          : 'Please provide your order ID (e.g. order-101) so I can retrieve live tracking details.';
        confidence = 0.85;
      }
    }

    // Handle Delivery & Shipping Policy
    else if (intent === WHATSAPP_INTENTS.DELIVERY) {
      const pol = knowledgeService.getPolicy(tenantId, 'SHIPPING_POLICY');
      const faqMatch = knowledgeService.findMatchingFaq(tenantId, normalizedText);

      if (faqMatch.matched) {
        replyText = faqMatch.faq.answer;
        retrievalSource = `Tenant FAQ (${faqMatch.faq.id})`;
        confidence = 0.96;
      } else if (pol) {
        replyText = pol.content;
        retrievalSource = 'Tenant Shipping Policy';
        confidence = 0.95;
      } else {
        replyText = 'Standard delivery arrives in 2-4 business days. Free shipping on orders over $75.';
        confidence = 0.88;
      }
    }

    // Handle Return & Refund Policy
    else if (intent === WHATSAPP_INTENTS.RETURN_REFUND) {
      const pol = knowledgeService.getPolicy(tenantId, 'RETURN_POLICY');
      const faqMatch = knowledgeService.findMatchingFaq(tenantId, normalizedText);

      if (faqMatch.matched) {
        replyText = faqMatch.faq.answer;
        retrievalSource = `Tenant FAQ (${faqMatch.faq.id})`;
        confidence = 0.96;
      } else if (pol) {
        replyText = pol.content;
        retrievalSource = 'Tenant Return Policy';
        confidence = 0.95;
      } else {
        replyText = 'Items in original unworn condition with tags may be returned or exchanged within 14 days.';
        confidence = 0.88;
      }
    }

    // Handle General FAQ
    else if (intent === WHATSAPP_INTENTS.FAQ) {
      const faqMatch = knowledgeService.findMatchingFaq(tenantId, normalizedText);
      if (faqMatch.matched) {
        replyText = faqMatch.faq.answer;
        retrievalSource = `Tenant FAQ (${faqMatch.faq.id})`;
        confidence = 0.95;
      }
    }

    // Handle Product Inquiry & Availability (Text or Multimodal Image)
    if (!replyText && (intent === WHATSAPP_INTENTS.PRODUCT_INQUIRY || intent === WHATSAPP_INTENTS.PRODUCT_AVAILABILITY || messageType === 'image' || attachments.length > 0)) {
      const mediaItem = attachments.find(a => a.type === 'image') || null;
      const prodResult = await knowledgeService.findProduct(tenantId, {
        queryText: normalizedText,
        media: mediaItem
      });

      if (prodResult.matched) {
        matchedProduct = prodResult.product;
        confidence = prodResult.confidence;
        retrievalSource = `Authoritative Catalog (${matchedProduct.sku})`;

        const inStock = matchedProduct.stock > 0;
        const priceFmt = `$${Number(matchedProduct.price).toFixed(2)}`;

        if (langResult.language === 'BANGLA') {
          replyText = inStock
            ? `হ্যাঁ! "${matchedProduct.name}" স্টকে আছে। মূল্য: ${priceFmt} (${matchedProduct.stock} টি উপলব্ধ)। আপনি কি অর্ডার করতে চান?`
            : `দুঃখিত, "${matchedProduct.name}" বর্তমানে আউট অফ স্টক। শীঘ্রই নতুন স্টক আসবে।`;
        } else if (langResult.language === 'BANGLISH') {
          replyText = inStock
            ? `Haa! "${matchedProduct.name}" stock e ache. Price ${priceFmt} (${matchedProduct.stock} pcs available). Order korte chan?`
            : `Sorry, "${matchedProduct.name}" ekhon stock e nei. Khub shighroi restock hobe.`;
        } else {
          const sizeMatch = normalizedText.match(/\b(xs|s|m|l|xl|xxl|small|medium|large)\b/i);
          const sizeStr = sizeMatch ? ` in size ${sizeMatch[1].toUpperCase()}` : '';
          replyText = inStock
            ? `Yes, we have the ${matchedProduct.name}${sizeStr} in stock! It is priced at ${priceFmt}. Would you like me to reserve one or create an order for you?`
            : `The ${matchedProduct.name} is currently out of stock. We expect a restock shortly!`;
        }
      } else if (mediaItem) {
        // Low confidence on image match — do NOT fabricate!
        replyText = langResult.language === 'BANGLA'
          ? 'আমরা এই ছবিটি দিয়ে নির্দিষ্ট পণ্যটি চিহ্নিত করতে পারিনি। অনুগ্রহ করে পণ্যের নাম বা কোড লিখবেন?'
          : 'Could not match this image with confidence. Could you share the product name or style you are looking for?';
        confidence = 0.60;
      }
    }

    // Handle Greeting / General Inquiry
    if (!replyText && intent === WHATSAPP_INTENTS.GENERAL_INQUIRY) {
      replyText = langResult.language === 'BANGLA'
        ? 'আসসালামু আলাইকুম! Kreazy AI অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম। আপনি পণ্যের স্টক, মূল্য, বা ডেলিভারি সম্পর্কে জানতে পারেন।'
        : 'Hello! Welcome to our store. How can I help you today with products, sizing, or order status?';
      confidence = 0.95;
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 8: CONFIDENCE CHECK & HUMAN HANDOFF
    // ─────────────────────────────────────────────────────────────────
    if (!replyText || confidence < confidenceThreshold) {
      isEscalated = true;
      replyText = langResult.language === 'BANGLA'
        ? 'আপনার প্রশ্নের সঠিক উত্তরের জন্য আমাদের একজন প্রতিনিধির সাথে সংযুক্ত করা হচ্ছে।'
        : 'Let me connect you with a team member who can help right away.';
      retrievalSource = 'Safety Guardrail & Low Confidence Fallback';
    }

    if (isEscalated) {
      db.prepare(`
        UPDATE conversations SET status = 'NEEDS_HUMAN', updated_at = datetime('now')
        WHERE id = ?
      `).run(convId);
      logger.info(`[PIPELINE] Conversation ${convId} marked as NEEDS_HUMAN in Live Inbox`);
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 9: OUTBOUND WHATSAPP DISPATCH VIA CLOUD API
    // ─────────────────────────────────────────────────────────────────
    const decryptedToken = conn.decryptedAccessToken;
    const outboundPhoneId = conn.phone_number_id;
    let dispatchResult = { success: false };

    if (cleanPhone && decryptedToken && outboundPhoneId) {
      dispatchResult = await whatsappService.sendTextMessage(
        outboundPhoneId,
        decryptedToken,
        cleanPhone,
        replyText,
        3 // Bounded retry up to 3 times
      );
    } else {
      logger.warn('[PIPELINE] Outbound dispatch skipped: Missing token or phone number');
    }

    // ─────────────────────────────────────────────────────────────────
    // STEP 10: DELIVERY / RESULT PERSISTENCE
    // ─────────────────────────────────────────────────────────────────
    const outMsgId = `msg-out-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    db.prepare(`
      INSERT INTO messages (
        id, conversation_id, sender, sender_name, text, is_ai, channel,
        tenant_id, direction, message_type, status, created_at
      ) VALUES (?, ?, 'ai', 'Kreazy AI Assistant', ?, 1, 'WHATSAPP', ?, 'OUTBOUND', 'text', ?, datetime('now'))
    `).run(
      outMsgId,
      convId,
      replyText,
      tenantId,
      dispatchResult.success ? 'DELIVERED' : 'FAILED'
    );

    // Update conversation timestamp
    db.prepare(`
      UPDATE conversations 
      SET last_message_time = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(convId);

    // Update WhatsApp connection timestamp & event tracking
    try {
      db.prepare(`
        UPDATE whatsapp_connections 
        SET last_event_at = datetime('now'), webhook_status = 'ACTIVE', updated_at = datetime('now')
        WHERE tenant_id = ?
      `).run(tenantId);
    } catch {}

    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      replied: true,
      tenantId,
      conversationId: convId,
      outboundMessageId: outMsgId,
      status: isEscalated ? 'NEEDS_HUMAN' : 'RESOLVED',
      replyText,
      intent,
      language: langResult.language,
      confidence,
      retrievalSource,
      isEscalated,
      matchedProduct: matchedProduct?.sku || null,
      dispatchSuccess: dispatchResult.success,
      executionTimeMs
    };
  },

  /**
   * Intent Classification supporting English, Bangla, and Banglish
   */
  classifyIntent(text, attachments, language) {
    const lower = (text || '').toLowerCase();

    // 1. Image presence triggers product inquiry
    if (attachments && attachments.some(a => a.type === 'image')) {
      return { intent: WHATSAPP_INTENTS.PRODUCT_INQUIRY, confidence: 0.90 };
    }

    // 2. Human escalation keywords
    if (
      lower.includes('human') || lower.includes('agent') || lower.includes('operator') ||
      lower.includes('manager') || lower.includes('representative') ||
      lower.includes('manush') || lower.includes('bhai kotha bolbo') ||
      lower.includes('মানুষ') || lower.includes('কথা বলতে চাই')
    ) {
      return { intent: WHATSAPP_INTENTS.HUMAN_HANDOFF, confidence: 0.98 };
    }

    // 3. Order status keywords
    if (
      lower.includes('order status') || lower.includes('track order') || lower.includes('order #') ||
      lower.includes('amar order') || lower.includes('অর্ডার স্ট্যাটাস') || lower.includes('অর্ডার কোথায়')
    ) {
      return { intent: WHATSAPP_INTENTS.ORDER_STATUS, confidence: 0.96 };
    }

    // 4. Return / Refund policy
    if (
      lower.includes('return') || lower.includes('refund') || lower.includes('exchange') ||
      lower.includes('ferot') || lower.includes('change korte') ||
      lower.includes('ফেরত') || lower.includes('রিফান্ড')
    ) {
      return { intent: WHATSAPP_INTENTS.RETURN_REFUND, confidence: 0.95 };
    }

    // 5. Shipping / Delivery
    if (
      lower.includes('delivery') || lower.includes('shipping') || lower.includes('courier') ||
      lower.includes('delivery fee') || lower.includes('charge koto') || lower.includes('kobe pabo') ||
      lower.includes('ডেলিভারি') || lower.includes('শিপিং') || lower.includes('কবে পাব')
    ) {
      return { intent: WHATSAPP_INTENTS.DELIVERY, confidence: 0.95 };
    }

    // 6a. Product Availability & Stock Check
    if (
      lower.includes('available') || lower.includes('in stock') || lower.includes('have this') ||
      lower.includes('have the') || lower.includes('do you have') || lower.includes('stock ache') ||
      lower.includes('size') || lower.includes('xl') || lower.includes('medium') || lower.includes('large') ||
      lower.includes('আছে কি') || lower.includes('সাইজ')
    ) {
      return { intent: WHATSAPP_INTENTS.PRODUCT_AVAILABILITY, confidence: 0.96 };
    }

    // 6b. General Product Inquiry / Pricing
    if (
      lower.includes('price') || lower.includes('cost') || lower.includes('how much') ||
      lower.includes('dam koto') || lower.includes('daam') || lower.includes('ache kina') ||
      lower.includes('shirt') || lower.includes('trouser') || lower.includes('bag') ||
      lower.includes('দাম কত')
    ) {
      return { intent: WHATSAPP_INTENTS.PRODUCT_INQUIRY, confidence: 0.94 };
    }

    // 7. General Greetings
    if (
      lower.includes('hi') || lower.includes('hello') || lower.includes('hey') ||
      lower.includes('assalamu') || lower.includes('salam') || lower.includes('kemon achen') ||
      lower.includes('সালাম') || lower.includes('হ্যালো')
    ) {
      return { intent: WHATSAPP_INTENTS.GENERAL_INQUIRY, confidence: 0.95 };
    }

    return { intent: WHATSAPP_INTENTS.OTHER, confidence: 0.70 };
  }
};
