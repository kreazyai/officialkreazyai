import { languageDetector } from '../whatsapp/languageDetector.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';

export const RECOVERY_INTENT_CATEGORIES = {
  PURCHASE_INTENT: 'PURCHASE_INTENT',
  PRODUCT_INQUIRY: 'PRODUCT_INQUIRY',
  PRICE_INQUIRY: 'PRICE_INQUIRY',
  SIZE_SELECTION: 'SIZE_SELECTION',
  DELIVERY_INQUIRY: 'DELIVERY_INQUIRY',
  CHECKOUT_ABANDONED: 'CHECKOUT_ABANDONED',
  LOW_INTENT: 'LOW_INTENT'
};

// Exclusion regex: greetings, complaints, refunds, escalation, opt-outs
const CASUAL_GREETINGS_REGEX = /(?:^|[^\p{L}\p{N}])(hi|hello|hey|hola|assalamu\s*alaikum|salam|good\s*(morning|afternoon|evening)|kemon\s*achen|ki\s*khobor)(?:$|[^\p{L}\p{N}])/iu;
const ESCALATION_REGEX = /(?:^|[^\p{L}\p{N}])(human|agent|talk\s*to\s*human|person|representative|support\s*person|manush|agent\s*please)(?:$|[^\p{L}\p{N}])/iu;
const COMPLAINT_OR_REFUND_REGEX = /(?:^|[^\p{L}\p{N}])(complaint|complain|scam|fraud|cheat|refund|broken|damaged|wrong\s*item|kharap|foul|cheat\s*korso|police|defective)(?:$|[^\p{L}\p{N}])/iu;
const OPTOUT_REGEX = /^(stop|unsubscribe|cancel|optout|quit|block)$/i;

// Buying signal regexes across English, Bangla, and Banglish (Unicode-aware)
const PURCHASE_SIGNALS_REGEX = /(?:^|[^\p{L}\p{N}])(buy|order|purchase|i\s*want\s*to\s*buy|want\s*to\s*order|order\s*korte\s*chai|korte\s*chai|nite\s*chai|অর্ডার\s*করতে\s*চাই|অর্ডার\s*চাই|কিনতে\s*চাই|নিব|অর্ডার\s*দিব|how\s*to\s*order|kivabe\s*order\s*korbo|cash\s*on\s*delivery|cod\s*hobe)(?:$|[^\p{L}\p{N}])/iu;
const PRICE_SIGNALS_REGEX = /(?:^|[^\p{L}\p{N}])(price|cost|how\s*much|rate|dam|dam\s*koto|taka|koto\s*taka|দাম\s*কত|দাম|মূল্য\s*কত|মূল্য|টাকা|প্রাইস\s*কত|প্রাইস|price\s*koto|discount\s*hobe|discount\s*ache|discount)(?:$|[^\p{L}\p{N}])/iu;
const PRODUCT_AVAILABILITY_REGEX = /(?:^|[^\p{L}\p{N}])(available|in\s*stock|stock\s*e\s*ache|stock|ache\s*ki|paoya\s*jabe|স্টকে\s*আছে|স্টকে|স্টক\s*আছে|স্টক|পাওয়া\s*যাবে|have\s*this|do\s*you\s*have|restock)(?:$|[^\p{L}\p{N}])/iu;
const SIZE_COLOR_REGEX = /(?:^|[^\p{L}\p{N}])(size\s*(xs|s|m|l|xl|xxl|small|medium|large|[0-9]{2})|black|white|red|blue|green|yellow|pink|colour|color|সাইজ|রং|কালার)(?:$|[^\p{L}\p{N}])/iu;
const DELIVERY_SIGNALS_REGEX = /(?:^|[^\p{L}\p{N}])(delivery|shipping|courier|charge|delivery\s*fee|delivery\s*charge|কুরিয়ার\s*চার্জ|ডেলিভারি\s*চার্জ|কত\s*দিন\s*লাগবে|how\s*many\s*days|delivery\s*time)(?:$|[^\p{L}\p{N}])/iu;

export const highIntentDetector = {
  /**
   * Sanitizes untrusted user input against prompt injection.
   * Disarms markdown control blocks, system prompt overrides, and excessive delimiters.
   * @param {string} text
   * @returns {string}
   */
  sanitizeCustomerMessage(text) {
    if (!text || typeof text !== 'string') return '';
    return text
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // remove control chars
      .replace(/```[\s\S]*?```/g, '[code block removed]')
      .replace(/(ignore\s+all\s+previous\s+instructions|system\s+prompt|system\s*:|assistant\s*:)/gi, '[disarmed]')
      .trim()
      .slice(0, 1000); // bounded length for safety
  },

  /**
   * Evaluates deterministic heuristics first before calling any model.
   * @param {string} rawText
   * @param {object} [context]
   * @returns {{ matched: boolean, result?: object }}
   */
  evaluateDeterministicHeuristics(rawText, context = {}) {
    const text = this.sanitizeCustomerMessage(rawText);
    if (!text) {
      return {
        matched: true,
        result: {
          intentCategory: RECOVERY_INTENT_CATEGORIES.LOW_INTENT,
          intentScore: 0.0,
          productIdentifiers: [],
          language: 'en',
          buyingSignals: [],
          explanation: 'Empty or blank message',
          eligibleForRecovery: false
        }
      };
    }

    // 1. Check exclusions (never recover complaints, greetings, opt-outs, escalations)
    if (OPTOUT_REGEX.test(text.trim())) {
      return {
        matched: true,
        result: {
          intentCategory: RECOVERY_INTENT_CATEGORIES.LOW_INTENT,
          intentScore: 0.0,
          productIdentifiers: [],
          language: 'en',
          buyingSignals: ['OPTOUT_COMMAND'],
          explanation: 'Customer requested opt-out / STOP',
          eligibleForRecovery: false
        }
      };
    }

    if (ESCALATION_REGEX.test(text)) {
      return {
        matched: true,
        result: {
          intentCategory: RECOVERY_INTENT_CATEGORIES.LOW_INTENT,
          intentScore: 0.0,
          productIdentifiers: [],
          language: languageDetector.detect(text).language.toLowerCase(),
          buyingSignals: ['HUMAN_ESCALATION_REQUEST'],
          explanation: 'Customer requested human support agent',
          eligibleForRecovery: false
        }
      };
    }

    if (COMPLAINT_OR_REFUND_REGEX.test(text)) {
      return {
        matched: true,
        result: {
          intentCategory: RECOVERY_INTENT_CATEGORIES.LOW_INTENT,
          intentScore: 0.0,
          productIdentifiers: [],
          language: languageDetector.detect(text).language.toLowerCase(),
          buyingSignals: ['COMPLAINT_OR_REFUND'],
          explanation: 'Complaint, refund, or dissatisfaction signal',
          eligibleForRecovery: false
        }
      };
    }

    const detectedLang = languageDetector.detect(text).language.toLowerCase();
    const buyingSignals = [];
    const productIdentifiers = [];

    // Extract product mentions from known catalog or SKU hints
    if (context.catalog && Array.isArray(context.catalog)) {
      const lowerText = text.toLowerCase();
      for (const prod of context.catalog) {
        if (prod.name && lowerText.includes(prod.name.toLowerCase())) {
          productIdentifiers.push(prod.name);
        } else if (prod.sku && lowerText.includes(prod.sku.toLowerCase())) {
          productIdentifiers.push(prod.sku);
        }
      }
    }

    // Also look for SKU pattern like SKU-123 or #123
    const skuMatch = text.match(/\b(sku[-_]?[0-9a-z]+|#[0-9a-z]+)\b/i);
    if (skuMatch && !productIdentifiers.includes(skuMatch[1])) {
      productIdentifiers.push(skuMatch[1]);
    }

    let intentCategory = null;
    let intentScore = 0.0;

    // Check purchase intent
    if (PURCHASE_SIGNALS_REGEX.test(text)) {
      buyingSignals.push('DIRECT_PURCHASE_INTENT');
      intentCategory = RECOVERY_INTENT_CATEGORIES.PURCHASE_INTENT;
      intentScore = 0.95;
    }

    // Check price inquiry
    if (PRICE_SIGNALS_REGEX.test(text)) {
      buyingSignals.push('PRICE_OR_DISCOUNT_INQUIRY');
      if (!intentCategory || intentScore < 0.85) {
        intentCategory = RECOVERY_INTENT_CATEGORIES.PRICE_INQUIRY;
        intentScore = 0.88;
      }
    }

    // Check size or color selection
    if (SIZE_COLOR_REGEX.test(text)) {
      buyingSignals.push('SIZE_OR_COLOR_SPECIFIED');
      if (!intentCategory || intentScore < 0.80) {
        intentCategory = RECOVERY_INTENT_CATEGORIES.SIZE_SELECTION;
        intentScore = 0.84;
      }
    }

    // Check delivery inquiry
    if (DELIVERY_SIGNALS_REGEX.test(text)) {
      buyingSignals.push('DELIVERY_OR_SHIPPING_INQUIRY');
      if (!intentCategory || intentScore < 0.75) {
        intentCategory = RECOVERY_INTENT_CATEGORIES.DELIVERY_INQUIRY;
        intentScore = 0.80;
      }
    }

    // Check product availability
    if (PRODUCT_AVAILABILITY_REGEX.test(text)) {
      buyingSignals.push('STOCK_AVAILABILITY_INQUIRY');
      if (!intentCategory || intentScore < 0.75) {
        intentCategory = RECOVERY_INTENT_CATEGORIES.PRODUCT_INQUIRY;
        intentScore = 0.82;
      }
    }

    if (intentCategory && intentScore >= 0.70) {
      return {
        matched: true,
        result: {
          intentCategory,
          intentScore,
          productIdentifiers,
          language: detectedLang,
          buyingSignals,
          explanation: `High intent matched deterministically via signals: ${buyingSignals.join(', ')}`,
          eligibleForRecovery: true
        }
      };
    }

    // Check casual greeting (only if no high buying intent was present)
    if (CASUAL_GREETINGS_REGEX.test(text.trim())) {
      return {
        matched: true,
        result: {
          intentCategory: RECOVERY_INTENT_CATEGORIES.LOW_INTENT,
          intentScore: 0.1,
          productIdentifiers: [],
          language: detectedLang,
          buyingSignals: ['CASUAL_GREETING'],
          explanation: 'Casual greeting without product or purchase intent',
          eligibleForRecovery: false
        }
      };
    }

    // If ambiguous (has some product mention or partial question but doesn't meet confidence)
    return {
      matched: false,
      partialSignals: buyingSignals,
      detectedLang
    };
  },

  /**
   * Complete Classification Pipeline: Deterministic first, structured LLM second if ambiguous.
   * @param {string} messageText
   * @param {object} [context]
   * @returns {Promise<{ intentCategory: string, intentScore: number, productIdentifiers: string[], language: string, buyingSignals: string[], explanation: string, eligibleForRecovery: boolean }>}
   */
  async classifyMessage(messageText, context = {}) {
    const sanitized = this.sanitizeCustomerMessage(messageText);

    // 1. Try Deterministic First
    const det = this.evaluateDeterministicHeuristics(sanitized, context);
    if (det.matched) {
      logger.info(`[RECOVERY DETECTOR] Deterministic match: ${det.result.intentCategory} (Score: ${det.result.intentScore})`);
      return det.result;
    }

    // 2. Structured LLM Classification (only when ambiguous)
    try {
      const llmResult = await this.callStructuredLlmClassifier(sanitized, context);
      return this.validateRuntimeSchema(llmResult, det.detectedLang || 'en');
    } catch (llmErr) {
      logger.warn('[RECOVERY DETECTOR] LLM classification error or timeout, safely falling back:', llmErr.message);
      // Safe fallback: If not confidently high intent, treat as low intent
      return {
        intentCategory: RECOVERY_INTENT_CATEGORIES.LOW_INTENT,
        intentScore: 0.3,
        productIdentifiers: [],
        language: det.detectedLang || 'en',
        buyingSignals: det.partialSignals || [],
        explanation: 'Fell back to low-intent due to ambiguous text and unavailable classifier',
        eligibleForRecovery: false
      };
    }
  },

  /**
   * Calls LLM with structured JSON output instructions.
   */
  async callStructuredLlmClassifier(sanitizedText, context = {}) {
    const baseUrl = (config.ai.ollamaBaseUrl || 'http://127.0.0.1:11434').replace(/\/+$/, '');
    const model = config.ai.ollamaModel || 'qwen3:1.7b';

    const systemPrompt = `You are a high-intent sales detector for an e-commerce messaging platform.
Analyze customer message and return ONLY a valid JSON object with EXACTLY these fields:
{
  "intentCategory": "PURCHASE_INTENT" | "PRODUCT_INQUIRY" | "PRICE_INQUIRY" | "SIZE_SELECTION" | "DELIVERY_INQUIRY" | "CHECKOUT_ABANDONED" | "LOW_INTENT",
  "intentScore": <number between 0.0 and 1.0>,
  "productIdentifiers": [<strings of product names or SKUs mentioned>],
  "language": "bn" | "en" | "banglish",
  "buyingSignals": [<strings of specific buying keywords or questions>],
  "explanation": "<brief sentence>",
  "eligibleForRecovery": <true if intentScore >= 0.70 and NOT low intent, else false>
}
RULES:
- Greetings, complaints, return requests, and generic questions MUST be categorized as LOW_INTENT with eligibleForRecovery: false.
- Do NOT output markdown fences or commentary. Return ONLY the raw JSON string.`;

    const userPrompt = `CUSTOMER MESSAGE TO EVALUATE:
"""
${sanitizedText}
"""`;

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
          temperature: 0.1,
          num_predict: 180
        }
      }),
      signal: AbortSignal.timeout(4000)
    });

    if (!res.ok) {
      throw new Error(`Classifier HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    let content = data?.message?.content || '';
    content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    // Strip markdown code fences if present
    content = content.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

    return JSON.parse(content);
  },

  /**
   * Enforces strict runtime validation on LLM output.
   */
  validateRuntimeSchema(obj, fallbackLang = 'en') {
    if (!obj || typeof obj !== 'object') {
      throw new Error('LLM output is not an object.');
    }

    const validCategories = Object.values(RECOVERY_INTENT_CATEGORIES);
    const intentCategory = validCategories.includes(obj.intentCategory)
      ? obj.intentCategory
      : RECOVERY_INTENT_CATEGORIES.LOW_INTENT;

    let intentScore = typeof obj.intentScore === 'number' ? obj.intentScore : 0.0;
    intentScore = Math.max(0.0, Math.min(1.0, intentScore));

    const productIdentifiers = Array.isArray(obj.productIdentifiers)
      ? obj.productIdentifiers.map(String).filter(Boolean)
      : [];

    const language = typeof obj.language === 'string' && ['bn', 'en', 'banglish'].includes(obj.language.toLowerCase())
      ? obj.language.toLowerCase()
      : fallbackLang;

    const buyingSignals = Array.isArray(obj.buyingSignals)
      ? obj.buyingSignals.map(String)
      : [];

    const explanation = typeof obj.explanation === 'string' ? obj.explanation.slice(0, 200) : 'Classified by model';
    const eligibleForRecovery = Boolean(obj.eligibleForRecovery) && intentScore >= 0.70 && intentCategory !== RECOVERY_INTENT_CATEGORIES.LOW_INTENT;

    return {
      intentCategory,
      intentScore,
      productIdentifiers,
      language,
      buyingSignals,
      explanation,
      eligibleForRecovery
    };
  }
};
