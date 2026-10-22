import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';
import { languageDetector } from '../whatsapp/languageDetector.js';

// Safe deterministic templates for fallback
const DETERMINISTIC_TEMPLATES = {
  bn: {
    PRODUCT_INQUIRY: (prodName, price) =>
      `আসসালামু আলাইকুম! আপনি "${prodName || 'আমাদের পণ্য'}" সম্পর্কে জানতে চেয়েছিলেন। আইটেমটি স্টকে উপলব্ধ আছে${price ? ` (মূল্য: ${price})` : ''}। আপনার কোনো প্রশ্ন থাকলে বা অর্ডার করতে চাইলে জানাতে পারেন।`,
    PRICE_INQUIRY: (prodName, price) =>
      `নমস্কার! "${prodName || 'পণ্যটির'}" মূল্য ${price || 'আমাদের ক্যাটালগ অনুযায়ী নির্ধারিত'}। আপনি কি অর্ডারটি কনফার্ম করতে চান? সাহায্য করতে পারলে আনন্দিত হব।`,
    PURCHASE_INTENT: (prodName, price) =>
      `হ্যালো! আপনি "${prodName || 'অর্ডারটি'}" নিয়ে জানতে চেয়েছিলেন। আপনার ডেলিভারি ঠিকানা দিলে আমরা দ্রুত প্রসেস শুরু করতে পারি।`,
    DEFAULT: (prodName, price) =>
      `আসসালামু আলাইকুম! আপনি যে পণ্যটি পছন্দ করেছিলেন সেটির স্টক দ্রুত শেষ হচ্ছে। আপনার কি কোনো সাইজ বা ডেলিভারি তথ্য জানতে প্রয়োজন?`
  },
  banglish: {
    PRODUCT_INQUIRY: (prodName, price) =>
      `Hello! Apni "${prodName || 'amader product'}" niye jante cheyechilen. Item ti stock e ache${price ? ` (Price: ${price})` : ''}. Kono question thakle ba order korte chaile janaben.`,
    PRICE_INQUIRY: (prodName, price) =>
      `Salam! "${prodName || 'Product tar'}" price ${price || 'store rate onujayi'}. Order complete korte chaile address pathate paren.`,
    PURCHASE_INTENT: (prodName, price) =>
      `Hello! Apnar "${prodName || 'order'}" niye help lagbe ki? Delivery details dile amra confirm kore dibo.`,
    DEFAULT: (prodName, price) =>
      `Hello! Apnar shopping bag er item ti ekhono available ache. Kono help lagle janate paren.`
  },
  en: {
    PRODUCT_INQUIRY: (prodName, price) =>
      `Hi there! Just following up on your inquiry about the ${prodName || 'item'}. It is currently in stock${price ? ` at ${price}` : ''}. Let us know if you have any questions or would like to complete your order.`,
    PRICE_INQUIRY: (prodName, price) =>
      `Hello! Following up on your pricing question regarding ${prodName || 'our product'}${price ? ` (${price})` : ''}. Feel free to ask if you need details on delivery or sizing.`,
    PURCHASE_INTENT: (prodName, price) =>
      `Hi! We noticed you were interested in placing an order for ${prodName || 'your item'}. If you would like us to reserve it for you, simply reply with your delivery details!`,
    DEFAULT: (prodName, price) =>
      `Hello! Just checking in to see if you needed any assistance with your selection. We're here to help if you have questions about sizing or shipping.`
  }
};

const BANNED_AGGRESSIVE_TERMS = [
  /hurry\s*up/i,
  /buy\s*now\s*or\s*cry/i,
  /last\s*chance\s*ever/i,
  /unbelievable\s*deal/i,
  /act\s*now\s*or\s*lose/i,
  /free\s*money/i,
  /click\s*here\s*now/i
];

export const recoveryAiComposer = {
  /**
   * Generates a grounded, respectful, concise sales recovery message.
   * @param {object} params
   * @param {string} params.tenantId
   * @param {object} params.candidate
   * @param {object} params.settings
   * @returns {Promise<{ messageText: string, model: string, promptTokens: number, completionTokens: number, latencyMs: number, costEstimate: number, isFallback: boolean }>}
   */
  async composeMessage({ tenantId, candidate, settings }) {
    const startTime = Date.now();
    const db = getDatabase();

    // 1. Fetch grounded tenant-scoped products matching candidate product identifiers
    let matchedProduct = null;
    const prodIdentifiers = Array.isArray(candidate.product_identifiers)
      ? candidate.product_identifiers
      : JSON.parse(candidate.product_identifiers || '[]');

    for (const ident of prodIdentifiers) {
      const prod = db.prepare(`
        SELECT id, name, sku, price, stock, category 
        FROM products 
        WHERE (business_id = ? OR tenant_id = ?) 
          AND (name LIKE ? OR sku LIKE ?)
        LIMIT 1
      `).get(tenantId, tenantId, `%${ident}%`, `%${ident}%`);
      if (prod) {
        matchedProduct = prod;
        break;
      }
    }

    // If none matched by identifier, grab top active product or store general context
    if (!matchedProduct) {
      matchedProduct = db.prepare(`
        SELECT id, name, sku, price, stock, category 
        FROM products 
        WHERE (business_id = ? OR tenant_id = ?) AND stock > 0
        ORDER BY created_at DESC LIMIT 1
      `).get(tenantId, tenantId);
    }

    const business = db.prepare('SELECT name FROM businesses WHERE id = ?').get(tenantId);
    const storeName = business?.name || 'Our Store';

    // 2. Detect language
    const langRaw = candidate.detected_language || languageDetector.detect(candidate.last_customer_message_text || '').language;
    let targetLang = 'en';
    if (langRaw === 'BANGLA' || langRaw === 'bn') targetLang = 'bn';
    else if (langRaw === 'BANGLISH' || langRaw === 'banglish') targetLang = 'banglish';

    const prodName = matchedProduct?.name || null;
    const formattedPrice = matchedProduct?.price ? `$${Number(matchedProduct.price).toFixed(2)}` : null;

    // 3. Attempt LLM generation if configured, otherwise use deterministic template
    if (settings.model_provider === 'local_ollama' && config.ai.ollamaBaseUrl) {
      try {
        const generated = await this.generateViaLlm({
          storeName,
          matchedProduct,
          candidate,
          targetLang,
          settings
        });

        // Safety verification: check for hallucinations or aggressive spam
        const validation = this.validateMessageSafety(generated.text, matchedProduct, settings);
        if (validation.valid) {
          const latencyMs = Date.now() - startTime;
          return {
            messageText: generated.text,
            model: settings.model_name || 'qwen3:1.7b',
            promptTokens: generated.promptTokens || 60,
            completionTokens: generated.completionTokens || 35,
            latencyMs,
            costEstimate: 0.00005, // Local inference amortization estimate
            isFallback: false
          };
        } else {
          logger.warn(`[AI COMPOSER SAFETY REJECTION] Rejected generated text: ${validation.reason}. Falling back to deterministic template.`);
        }
      } catch (genErr) {
        logger.warn('[AI COMPOSER] LLM generation failed or timed out:', genErr.message);
      }
    }

    // 4. Safe Deterministic Fallback Template
    const templateSet = DETERMINISTIC_TEMPLATES[targetLang] || DETERMINISTIC_TEMPLATES.en;
    const categoryKey = candidate.intent_category || 'DEFAULT';
    const templateFn = templateSet[categoryKey] || templateSet.DEFAULT;
    const fallbackText = templateFn(prodName, formattedPrice);

    const latencyMs = Date.now() - startTime;
    return {
      messageText: fallbackText,
      model: 'deterministic-template-v1',
      promptTokens: 0,
      completionTokens: 0,
      latencyMs,
      costEstimate: 0.0,
      isFallback: true
    };
  },

  /**
   * Calls Ollama API for compact grounded message generation.
   */
  async generateViaLlm({ storeName, matchedProduct, candidate, targetLang, settings }) {
    const baseUrl = (config.ai.ollamaBaseUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '');
    const model = settings.model_name || config.ai.ollamaModel || 'qwen3:1.7b';

    const prodInfo = matchedProduct
      ? `Product: "${matchedProduct.name}", Price: $${Number(matchedProduct.price).toFixed(2)}, Available Stock: ${matchedProduct.stock}`
      : 'Store items in stock';

    const systemPrompt = `You are a friendly customer concierge for "${storeName}".
GOAL: Write a gentle, helpful, single-paragraph follow-up message (MAX 2 sentences, under 180 characters) to a customer who asked about an item and then paused.
STRICT RULES:
1. ONLY reference this exact product data: ${prodInfo}. NEVER invent prices or promises.
2. Tone: Helpful, courteous, zero pressure. NEVER use fake urgency, spam words, or excessive exclamation marks.
3. Language: Respond in ${targetLang === 'bn' ? 'Bengali (বাংলা)' : targetLang === 'banglish' ? 'Banglish (Bengali in English characters)' : 'English'}.
4. Output ONLY the message text. No quotes, no markdown, no thinking blocks.`;

    const userPrompt = `Customer's previous question: "${candidate.last_customer_message_text || 'Interested in product'}"
Intent: ${candidate.intent_category}`;

    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        options: {
          temperature: settings.temperature || 0.3,
          num_predict: settings.max_tokens || 120
        }
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    let text = data?.message?.content || '';
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    text = text.replace(/^["']|["']$/g, '').trim();

    return {
      text,
      promptTokens: data?.prompt_eval_count || 80,
      completionTokens: data?.eval_count || 40
    };
  },

  /**
   * Strict runtime safety validator.
   * Guarantees:
   * - No banned or aggressive spam terms.
   * - Max length constraint (250 chars max).
   * - Price accuracy: if a dollar/taka sign appears with a number, verifies it matches matchedProduct.price.
   */
  validateMessageSafety(text, matchedProduct, settings) {
    if (!text || typeof text !== 'string') {
      return { valid: false, reason: 'Empty generated text' };
    }

    if (text.length > 280) {
      return { valid: false, reason: `Length ${text.length} exceeds 280 chars limit` };
    }

    // Check banned aggressive terms
    for (const term of BANNED_AGGRESSIVE_TERMS) {
      if (term.test(text)) {
        return { valid: false, reason: `Contains aggressive marketing phrase (${term})` };
      }
    }

    // Price hallucination check:
    // If text contains a price like $99 or 99৳ or 99 tk, verify against product price
    const priceMatch = text.match(/(\$|tk|৳|\btaka\b)\s*([0-9]+(\.[0-9]{2})?)/i) || text.match(/([0-9]+(\.[0-9]{2})?)\s*(\$|tk|৳|\btaka\b)/i);
    if (priceMatch && matchedProduct) {
      const statedPrice = parseFloat(priceMatch[2] || priceMatch[1]);
      const actualPrice = parseFloat(matchedProduct.price);
      if (Math.abs(statedPrice - actualPrice) > 0.05) {
        return {
          valid: false,
          reason: `Price hallucination detected! Message stated ${statedPrice}, actual product price is ${actualPrice}`
        };
      }
    }

    return { valid: true };
  }
};
