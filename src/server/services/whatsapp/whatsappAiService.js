import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { getDatabase } from '../../config/database.js';

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
        const price = `$${Number(p.price || 0).toFixed(2)}`;
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

STRICT OPERATIONAL RULES:
1. TRUTHFULNESS & ANTI-HALLUCINATION:
   - ONLY provide prices, availability, and products explicitly listed in the STORE CATALOG below.
   - If an item is OUT OF STOCK (stock = 0), explicitly state that it is currently out of stock.
   - If a customer asks for a specific color, style, or product NOT in the catalog (e.g. asking for "black shirts" when no black shirt is listed), clearly state that we do not currently have that specific item or color in stock.
   - NEVER substitute or recommend an unrelated product as if it were what the customer asked for.
   - NEVER invent or guess discounts, delivery dates, or prices.
2. HUMAN ASSISTANCE & ORDER LIMITATION:
   - If you cannot answer or the customer asks for a human/manager/agent, politely offer to connect them with a human team member.
   - You cannot directly charge cards or finalize orders in chat. Guide the customer to complete payment or provide address for COD.
3. CONCISENESS & DIRECTNESS:
   - Keep answers concise, clear, and direct (1 to 2 sentences max).
   - Directly answer the customer's question first.
   - Be courteous, warm, and professional.
   - Do NOT output your internal thoughts, instructions, or <think> tags.

STORE POLICIES:
${policySummary || 'Standard delivery in 2-4 business days. Returns accepted within 14 days in original condition.'}

FREQUENTLY ASKED QUESTIONS:
${faqSummary || 'Contact our support team for specialized assistance.'}

CURRENT VERIFIED STORE CATALOG:
${catalogSummary || 'No products currently listed.'}`;
  },

  /**
   * Fetches recent conversation history for a specific conversation
   * @param {string} conversationId
   * @param {number} limit
   * @returns {Array<{ role: 'user' | 'assistant', content: string }>}
   */
  getConversationHistory(conversationId, limit = 6) {
    if (!conversationId) return [];
    try {
      const db = getDatabase();
      const rows = db.prepare(`
        SELECT sender, text, is_ai, direction FROM messages
        WHERE conversation_id = ? AND text IS NOT NULL AND text != ''
        ORDER BY created_at DESC
        LIMIT ?
      `).all(conversationId, limit);

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

      // Retrieve business profile
      const business = db.prepare('SELECT id, name FROM businesses WHERE id = ?').get(businessId) || {
        id: businessId,
        name: 'Kreazy Store'
      };

      // Retrieve knowledge if not pre-provided
      let products = knowledge?.products;
      let policies = knowledge?.policies;
      let faqs = knowledge?.faqs;

      if (!products) {
        products = db.prepare(`
          SELECT id, sku, name, category, price, stock, status, variants, ai_knowledge 
          FROM products 
          WHERE (business_id = ? OR tenant_id = ?) AND status != 'DISCONTINUED'
          LIMIT 25
        `).all(businessId, businessId);
      }

      if (!policies) {
        policies = db.prepare(`
          SELECT policy_type, content FROM policies 
          WHERE tenant_id = ? AND status = 'ACTIVE'
        `).all(businessId);
      }

      if (!faqs) {
        faqs = db.prepare(`
          SELECT question, answer, category FROM faqs 
          WHERE tenant_id = ? AND status = 'ACTIVE'
        `).all(businessId);
      }

      const systemPrompt = this.buildGroundedSystemPrompt({
        business,
        products,
        policies,
        faqs,
        language
      });

      // Load previous messages in this conversation for multi-turn coherence
      const priorHistory = this.getConversationHistory(conversationId, 6);

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
