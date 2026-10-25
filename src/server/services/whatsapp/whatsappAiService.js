import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { getDatabase } from '../../config/database.js';
import { knowledgeService } from './knowledgeService.js';

/**
 * Lightweight in-process async queue for controlling Ollama inference concurrency.
 * Essential for 8 GB RAM machines to prevent memory spikes and inference thrashing.
 */
class InferenceQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async run(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.dequeue();
    });
  }

  dequeue() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const { task, resolve, reject } = this.queue.shift();
    this.running++;

    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running--;
        this.dequeue();
      });
  }

  get stats() {
    return {
      running: this.running,
      queued: this.queue.length,
      concurrency: this.concurrency
    };
  }
}

// Global inference queue with concurrency 1 for 8 GB RAM stability
const aiInferenceQueue = new InferenceQueue(1);

export const whatsappAiService = {
  /**
   * Check Ollama connectivity and model availability
   * @returns {Promise<{ ok: boolean, status: string, model: string, details?: object }>}
   */
  async checkHealth() {
    const baseUrl = (config.ai.ollamaBaseUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '');
    const targetModel = config.ai.ollamaModel || 'qwen3:1.7b';

    try {
      const res = await fetch(`${baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(4000)
      });

      if (!res.ok) {
        return {
          ok: false,
          status: 'DOWN',
          model: targetModel,
          error: `Ollama HTTP ${res.status}: ${res.statusText}`
        };
      }

      const data = await res.json();
      const models = data?.models || [];
      const hasModel = models.some(
        m => m.name === targetModel || m.name?.startsWith(`${targetModel}:`) || m.model === targetModel
      );

      return {
        ok: true,
        status: hasModel ? 'READY' : 'MODEL_NOT_FOUND',
        model: targetModel,
        installedModels: models.map(m => m.name),
        queue: aiInferenceQueue.stats
      };
    } catch (err) {
      return {
        ok: false,
        status: 'DOWN',
        model: targetModel,
        error: err.message
      };
    }
  },

  /**
   * Strips internal reasoning monologue and thinking tokens from generated text.
   * Qwen3 models output reasoning either in message.thinking or <think>...</think> blocks.
   * @param {string} text
   * @returns {string}
   */

  // STEP187: LLM output safety validation
  validateCustomerOutput(answer, question = '') {
    const text = String(answer || '').trim();
    const lower = text.toLowerCase();

    if (!text) return { safe: false, reason: 'EMPTY' };
    if (text.length > 650) {
      return { safe: false, reason: 'EXCESSIVE_LENGTH' };
    }

    const q = String(question || '').trim().toLowerCase();
    if (q.length >= 12 && lower === q) {
      return { safe: false, reason: 'QUESTION_REPEATED' };
    }

    // Detect repeated long fragments, including Banglish loops.
    if (/(.{15,100}?)\s*\1\s*\1/i.test(text)) {
      return { safe: false, reason: 'REPETITION_LOOP' };
    }

    // Only verified database/policy handlers should state these facts.
    const unsupportedClaims = [
      /\b(?:free shipping|free delivery|no delivery fee)\b/i,
      /\b(?:we do not offer|we don't offer|we never accept)\s+(?:returns|refunds)\b/i,
      /\b(?:cash on delivery|cod)\s+(?:is|isn't|is not)\s+(?:available|unavailable)\b/i,
      /\b(?:i have|we have|i've|we've)\s+(?:cancelled|canceled|refunded|placed|confirmed)\s+(?:your|the)\s+order\b/i,
      /\b(?:your order has been|your refund has been)\s+(?:cancelled|canceled|approved|processed|confirmed)\b/i,
      /\b(?:discount|coupon)\s+(?:has been|is)\s+(?:approved|activated|applied)\b/i,
      /(?:\$|৳|€|£)\s*\d+(?:\.\d+)?/i,
      /\b\d+(?:\.\d+)?\s*(?:USD|BDT|taka)\b/i
    ];

    if (unsupportedClaims.some(re => re.test(text))) {
      return { safe: false, reason: 'UNVERIFIED_CLAIM' };
    }

    return { safe: true, reason: 'OK' };
  },

  cleanAiOutput(text) {
    if (!text) return '';
    return text
      .replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove <think>...</think>
      .replace(/^[\s\r\n]+/, '')
      .replace(/[\s\r\n]+$/, '')
      .trim();
  },

  /**
   * Builds the grounding system prompt with authoritative business knowledge.
   * Restricts context for 8 GB RAM and enforces strict anti-hallucination.
   */
  buildGroundedSystemPrompt({ business, products, policies, faqs, aiSettings, language = 'ENGLISH' }) {
    const bizName = business?.name || 'Our Store';
    const storeDesc = business?.description || 'Quality online retail and customer service';

    // Limit products to active items and limit total characters for 8 GB RAM token efficiency
    const catalogSummary = (products || [])
      .slice(0, 15)
      .map(p => {
        const stockStatus = p.stock > 0 ? `${p.stock} units in stock` : 'OUT OF STOCK';
        const price =
  p.price == null
    ? 'Price not provided'
    : `${Number(p.price).toFixed(2)} ${p.currency || '(currency not provided)'}`;
  p.price == null
    ? 'Price not provided'
    : `${Number(p.price).toFixed(2)} ${p.currency || '(currency not provided)'}`;
        const sku = p.sku ? `[SKU: ${p.sku}]` : '';
        const cat = p.category ? `(${p.category})` : '';
        return `• ${p.name} ${sku} ${cat}: Price ${price}, Stock: ${stockStatus}`;
      })
      .join('\n');

    const policySummary = (policies || [])
      .slice(0, 4)
      .map(pol => `• ${pol.policy_type || 'POLICY'}: ${pol.content}`)
      .join('\n');

    const faqSummary = (faqs || [])
      .slice(0, 6)
      .map(f => `• Q: ${f.question}\n  A: ${f.answer}`)
      .join('\n');

    const langInstruction =
      language === 'BANGLA'
        ? 'Customer speaks Bengali. You MUST reply in natural, polite Bengali (বাংলা).'
        : language === 'BANGLISH'
        ? 'Customer speaks Banglish (Bengali in English alphabet). Respond naturally in polite Banglish or Bengali.'
        : 'Respond in polite, professional English.';

    return `You are the official AI Customer Support Assistant for "${bizName}" (${storeDesc}).

LANGUAGE RULE:
${langInstruction}

PRODUCT DATA ACCURACY RULES:
- Keep product names EXACTLY as written in the verified catalog.
- Never translate, transliterate, shorten, or change product names.
- Reply in the customer's language, but preserve original product names.
- Never copy a price or stock quantity from one product to another.
- If the requested product is missing, say its price and availability are unknown.
- Never invent currency, prices, stock, discounts, or delivery charges.

STORE POLICIES:
${policySummary || 'No verified delivery or return policy provided. Do not invent policy details.'}

FREQUENTLY ASKED QUESTIONS:
${faqSummary || 'Contact our support team for specialized assistance.'}

CURRENT VERIFIED STORE CATALOG:
${catalogSummary || 'No products currently listed.'}`;
  },

  /**
   * Fetches recent conversation history for a specific conversation
   * @param {string} conversationId
   * @param {number} limit
   * @returns {Promise<Array<{ role: 'user' | 'assistant', content: string }>>}
   */
  async getConversationHistory(conversationId, tenantId, limit = 6) {
    if (!conversationId || !tenantId) return [];
    try {
      const db = getDatabase();

      const rows = (await db.prepare(`
        SELECT sender, text, is_ai, direction FROM messages
        WHERE conversation_id = ? AND tenant_id = ? AND text IS NOT NULL AND text != ''
        ORDER BY created_at DESC
        LIMIT ?
      `).all(conversationId, tenantId, limit)) || [];

      // Order chronological (oldest to newest)
      return rows.reverse().map(r => ({
        role: r.direction === 'INBOUND' || r.sender === 'customer' ? 'user' : 'assistant',
        content: r.text
      }));
    } catch (err) {
      logger.warn(`Could not load conversation history for ${conversationId}:`, err.message);
      return [];
    }
  },

  /**
   * Generate a grounded response using local Ollama Qwen3
   * Runs inside the controlled concurrency queue.
   */
  async generateCustomerReply({
    businessId,
    conversationId,
    customerMessage,
    language = 'ENGLISH',
    knowledge = null
  }) {
    return aiInferenceQueue.run(async () => {
      const startTime = Date.now();
      const baseUrl = (config.ai.ollamaBaseUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '');
      const model = config.ai.ollamaModel || 'qwen3:1.7b';
      const timeoutMs = config.ai.ollamaTimeoutMs || 45000;

      const db = getDatabase();
      
      
      
      // STEP179: Verified delivery-fee guard
      const isDeliveryFeeQuestion =
        /(?:delivery|shipping)\s*(?:charge|fee|cost|price)|(?:charge|fee|cost)\s*(?:for\s*)?(?:delivery|shipping)|ডেলিভারি\s*(?:চার্জ|খরচ|ফি)|শিপিং\s*(?:চার্জ|খরচ|ফি)/i
          .test(customerMessage);

      if (isDeliveryFeeQuestion) {
        const policy = await knowledgeService.getPolicy(
          businessId, 'SHIPPING_POLICY'
        );

        const bn = language === 'BANGLA';
        const bng = language === 'BANGLISH';

        // Do not treat a general shipping policy as a verified fee.
        // An explicit fee field should be implemented separately.
        const replyText = bn
          ? 'ডেলিভারি চার্জের নিশ্চিত তথ্য পাওয়া যায়নি। সঠিক চার্জ জানতে দোকানের প্রতিনিধির সঙ্গে যোগাযোগ করুন।'
          : bng
            ? 'Delivery charge er confirmed information nei. Exact charge jante store support er sathe jogajog korun.'
            : 'I cannot confirm the delivery charge. Please contact store support for the exact fee.';

        return {
          success: true,
          replyText,
          model: 'verified-policy',
          tokensGenerated: 0,
          durationMs: Date.now() - startTime,
          groundedIn: {
            productCount: 0,
            faqCount: 0,
            policyCount: policy ? 1 : 0
          }
        };
      }

      
      // STEP182: Safe commerce intent handling
      const message = String(customerMessage || '').toLowerCase();
      const bn = language === 'BANGLA';
      const bng = language === 'BANGLISH';

      const safeReply = (replyText, productCount = 0) => ({
        success: true,
        replyText,
        model: 'verified-commerce',
        tokensGenerated: 0,
        durationMs: Date.now() - startTime,
        groundedIn: {
          productCount,
          faqCount: 0,
          policyCount: 0
        }
      });

      // Catalog overview: preserve exact database product names.
      const asksCatalog =
        /what do you sell|what products|show.*products|কি কি পণ্য|কী কী পণ্য|কি কি প্রোডাক্ট|কি product ache|ki ki product ache|ki ki product|product list/i
          .test(message);

      if (asksCatalog) {
        const catalog = await knowledgeService.getTenantKnowledge(businessId);
        const products = (catalog.products || []).slice(0, 8);

        if (!products.length) {
          return safeReply(
            bn ? 'এই মুহূর্তে পণ্যের তালিকা পাওয়া যাচ্ছে না।' :
            bng ? 'Ekhon product list pawa jacche na.' :
            'The product catalog is currently unavailable.'
          );
        }

        const names = products.map(p => p.name).join(', ');

        return safeReply(
          bn ? 'আমাদের পণ্যগুলো হলো: ' + names + '।' :
          bng ? 'Amader products: ' + names + '.' :
          'Our products include: ' + names + '.',
          products.length
        );
      }

      // Cancellation: do not promise an action that wasn't performed.
      if (/cancel|বাতিল/i.test(message) &&
          /order|অর্ডার/i.test(message)) {
        return safeReply(
          bn
            ? 'অর্ডার বাতিলের অনুরোধ করতে অর্ডার নম্বর দিন। বাতিল নিশ্চিত করতে আমাদের টিম যাচাই করবে।'
            : bng
              ? 'Order cancel request er jonno order number din. Amader team verify korbe.'
              : 'Please share your order number so our team can review your cancellation request. The order has not been cancelled yet.'
        );
      }

      // Cash on delivery: do not invent payment methods.
      if (/cash on delivery|ক্যাশ অন ডেলিভারি|\bcod\b/i.test(message)) {
        return safeReply(
          bn
            ? 'ক্যাশ অন ডেলিভারি সুবিধা আছে কি না নিশ্চিত তথ্য পাওয়া যায়নি। অনুগ্রহ করে দোকানের প্রতিনিধির সঙ্গে যোগাযোগ করুন।'
            : bng
              ? 'Cash on delivery available kina confirm kora jayni. Store support er sathe jogajog korun.'
              : 'Cash on delivery availability is not verified. Please contact store support.'
        );
      }

      // Discount requests: never issue or approve discounts.
      if (/discount|ছাড়|ডিসকাউন্ট|coupon|promo code/i.test(message)) {
        return safeReply(
          bn
            ? 'আপনার অনুরোধটি বুঝেছি। কোনো ছাড় বা কুপন অনুমোদন করতে পারছি না। বর্তমান অফার জানতে দোকানের টিমের সঙ্গে যোগাযোগ করুন।'
            : bng
              ? 'Discount ba coupon approve korte parchi na. Current offer jante store team er sathe jogajog korun.'
              : 'I cannot approve a discount or issue a coupon. Please contact the store team to verify current offers.'
        );
      }

      // Return eligibility: do not invent return windows.
      if (/return|refund|রিটার্ন|ফেরত/i.test(message)) {
        const policy = await knowledgeService.getPolicy(
          businessId, 'RETURN_POLICY'
        );

        if (policy?.content) {
          return {
            ...safeReply(String(policy.content)),
            model: 'verified-policy',
            groundedIn: {
              productCount: 0,
              faqCount: 0,
              policyCount: 1
            }
          };
        }

        return safeReply(
          bn
            ? 'রিটার্ন বা রিফান্ডের নিশ্চিত নীতিমালা পাওয়া যায়নি। দোকানের প্রতিনিধির সঙ্গে যোগাযোগ করুন।'
            : bng
              ? 'Return/refund policy confirm kora jayni. Store support er sathe jogajog korun.'
              : 'I cannot verify the return or refund policy. Please contact store support.'
        );
      }

      // Verified catalog facts must not be generated by the LLM.
      const productMatch = await knowledgeService.findProduct(
        businessId,
        { queryText: customerMessage }
      );

      const asksPrice =
        /দাম|মূল্য|price|cost|how much|dam koto|daam/i.test(customerMessage);
      const asksStock =
        /স্টক|stock|available|availability|do you have|আছে|পাওয়া যাবে/i
          .test(customerMessage);

      const bangla = language === 'BANGLA';
      const banglish = language === 'BANGLISH';

      const verifiedReply = (replyText, count = 0) => ({
        success: true,
        replyText,
        model: 'verified-database',
        tokensGenerated: 0,
        durationMs: Date.now() - startTime,
        groundedIn: { productCount: count, faqCount: 0, policyCount: 0 }
      });

      if (productMatch.ambiguous) {
        const names = (productMatch.candidates || [])
          .map(p => p.name).join(', ');
        return verifiedReply(
          bangla
            ? 'একাধিক পণ্য মিলেছে: ' + names + '। কোনটি জানতে চান?'
            : banglish
              ? 'Ekadhik product match koreche: ' + names +
                '. Kon product ta jante chan?'
              : 'I found multiple matching products: ' + names +
                '. Which one do you mean?'
        );
      }

      if (productMatch.matched &&
          productMatch.confidence >= 0.95 &&
          (asksPrice || asksStock)) {

        const p = productMatch.product;
        const parts = [];

        if (asksPrice) {
          const price = p.price == null || !Number.isFinite(Number(p.price))
            ? null
            : Number(p.price).toFixed(2) +
              (p.currency ? ' ' + p.currency : '');

          parts.push(
            price == null
              ? (bangla ? 'দাম নিশ্চিত নয়' :
                 banglish ? 'Dam confirm kora jayni' :
                 'Price is not confirmed')
              : (bangla ? 'দাম ' :
                 banglish ? 'Dam ' : 'Price: ') + price
          );
        }

        if (asksStock) {
          const quantity = Number(p.stock);

          if (p.stock == null || !Number.isFinite(quantity)) {
            parts.push(
              bangla ? 'স্টক নিশ্চিত নয়' :
              banglish ? 'Stock confirm kora jayni' :
              'Stock is not confirmed'
            );
          } else if (quantity <= 0) {
            parts.push(
              bangla ? 'বর্তমানে স্টকে নেই' :
              banglish ? 'Ekhon out of stock' :
              'Currently out of stock'
            );
          } else {
            parts.push(
              bangla ? 'স্টকে ' + quantity + 'টি আছে' :
              banglish ? quantity + ' pcs stock e ache' :
              quantity + ' units in stock'
            );
          }
        }

        return verifiedReply(
          p.name + ': ' +
          parts.join(bangla ? ' এবং ' : ', ') +
          (bangla ? '।' : '.'),
          1
        );
      }

      if (!productMatch.matched &&
          !productMatch.ambiguous &&
          (asksPrice || asksStock) &&
          /[A-Za-z0-9]{3,}/.test(customerMessage)) {

        return verifiedReply(
          bangla
            ? 'এই পণ্যের দাম বা স্টক নিশ্চিত করা যায়নি। সঠিক নাম বা SKU দিন।'
            : banglish
              ? 'Ei product er price ba stock confirm kora jayni. Name ba SKU din.'
              : 'I could not verify this product in our catalog. Please share its exact name or SKU.'
        );
      }

      // Retrieve business profile
      const business = (await db.prepare('SELECT id, name FROM businesses WHERE id = ?').get(businessId)) || {
        id: businessId,
        name: 'Kreazy Store'
      };

      // Retrieve knowledge if not pre-provided
      let products = knowledge?.products;
      let policies = knowledge?.policies;
      let faqs = knowledge?.faqs;

      if (!products) {
        products = (await db.prepare(`
          SELECT id, sku, name, category, price, currency, stock, status, variants, ai_knowledge
          FROM products
          WHERE (business_id = ? OR tenant_id = ?) AND status != 'DISCONTINUED'
          LIMIT 25
        `).all(businessId, businessId)) || [];
      }

      if (!policies) {
        policies = (await db.prepare(`
          SELECT policy_type, content FROM policies
          WHERE tenant_id = ? AND status = 'ACTIVE'
        `).all(businessId)) || [];
      }

      if (!faqs) {
        faqs = (await db.prepare(`
          SELECT question, answer, category FROM faqs
          WHERE tenant_id = ? AND status = 'ACTIVE'
        `).all(businessId)) || [];
      }

      const systemPrompt = this.buildGroundedSystemPrompt({
        business,
        products,
        policies,
        faqs,
        language
      });

      // Load previous messages in this conversation for multi-turn coherence
      const priorHistory = await this.getConversationHistory(conversationId, businessId, 6);

      // Build message payload
      const messages = [
        { role: 'system', content: systemPrompt },
        ...priorHistory,
        { role: 'user', content: customerMessage }
      ];

      logger.info(`[WhatsApp AI] Submitting grounded prompt to Ollama (${model}) for conversation ${conversationId}`);

      let response;
      try {
        response = await fetch(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            messages,
            stream: false,
            think: false,
            options: {
              temperature: 0.2,
              num_predict: 256, // Enforce bounded response length to save RAM and time
              num_ctx: 2048     // Safe context limit for 8 GB RAM machines
            }
          }),
          signal: AbortSignal.timeout(timeoutMs)
        });
      } catch (err) {
        const elapsedMs = Date.now() - startTime;
        logger.error(`[WhatsApp AI] Ollama request failed after ${elapsedMs}ms:`, err.message);

        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          return {
            success: false,
            error: 'AI_TIMEOUT',
            fallbackText: language === 'BANGLA'
              ? 'ধন্যবাদ আমাদের সাথে যোগাযোগ করার জন্য। আমাদের একজন প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।'
              : 'Thank you for messaging. A support representative will be with you shortly.',
            model,
            durationMs: elapsedMs
          };
        }

        return {
          success: false,
          error: 'AI_UNAVAILABLE',
          fallbackText: language === 'BANGLA'
            ? 'ধন্যবাদ! আমাদের কাস্টমার সাপোর্ট টিম আপনার মেসেজটি পেয়েছে এবং দ্রুত উত্তর দেবে।'
            : 'Thank you for reaching out! A support team member has received your message.',
          model,
          durationMs: elapsedMs
        };
      }

      const elapsedMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        logger.error(`[WhatsApp AI] Ollama HTTP ${response.status}: ${errorText}`);
        return {
          success: false,
          error: `HTTP_${response.status}`,
          fallbackText: 'Thank you for contacting us. A team member will assist you shortly.',
          model,
          durationMs: elapsedMs
        };
      }

      const data = await response.json();
      const rawContent = data?.message?.content || '';
      const cleanedReply = this.cleanAiOutput(rawContent);

      // STEP187: validate only free-form model output, not verified DB replies.
      const outputCheck = this.validateCustomerOutput(
        cleanedReply,
        customerMessage
      );

      if (!outputCheck.safe) {
        return {
          success: true,
          replyText:
            language === 'BANGLA'
              ? 'এই বিষয়ে নিশ্চিত তথ্য দিতে পারছি না। অনুগ্রহ করে দোকানের প্রতিনিধির সঙ্গে যোগাযোগ করুন।'
              : language === 'BANGLISH'
                ? 'Ei bishoye confirmed information nei. Doya kore store support er sathe jogajog korun.'
                : 'I cannot verify that information. Please contact store support for confirmation.',
          model: 'safe-fallback',
          tokensGenerated: 0,
          durationMs: Date.now() - startTime,
          groundedIn: {
            productCount: 0,
            faqCount: 0,
            policyCount: 0
          },
          safetyReason: outputCheck.reason
        };
      }



      if (!cleanedReply) {
        logger.warn('[WhatsApp AI] Ollama returned empty content');
        return {
          success: false,
          error: 'EMPTY_CONTENT',
          fallbackText: 'Thank you for reaching out. How may we assist you today?',
          model,
          durationMs: elapsedMs
        };
      }

      logger.info(`[WhatsApp AI] Successfully generated response in ${elapsedMs}ms (${cleanedReply.length} chars)`);

      return {
        success: true,
        replyText: cleanedReply,
        model,
        tokensGenerated: data.eval_count || null,
        durationMs: elapsedMs,
        groundedIn: {
          productCount: products.length,
          faqCount: faqs.length,
          policyCount: policies.length
        }
      };
    });
  }
};

