import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

/**
 * Interface definition for LLM providers
 * Ensures business logic is decoupled from underlying AI models/vendors.
 */
export class LLMProvider {
  /**
   * @param {Object} options
   * @param {string} options.prompt - Prompt or user query
   * @param {string} [options.systemPrompt] - System instructions
   * @param {Object} [options.context] - Tenant-authorized context
   * @param {number} [options.temperature=0.3]
   * @returns {Promise<{ text: string, confidence: number, provider: string }>}
   */
  async generateResponse(_options) {
    throw new Error('generateResponse() must be implemented by LLMProvider subclass');
  }
}

/**
 * Local / Self-hosted / Rule-based LLM Provider
 * Fallback and self-contained zero-external-dependency execution
 */
export class LocalLLMProvider extends LLMProvider {
  async generateResponse({ prompt, systemPrompt, context = {} }) {
    logger.info('[LocalLLMProvider] Generating response using tenant-scoped context');
    
    // If context has authoritative products
    if (context.matchedProduct) {
      const p = context.matchedProduct;
      const currency = p.currency || 'USD';
      if (p.stock <= 0) {
        return {
          text: `We are currently out of stock for "${p.name}". Please check back soon or let us know if you would like an alternative!`,
          confidence: 0.95,
          provider: 'local-authoritative'
        };
      }
      return {
        text: `The ${p.name} is currently available for ${currency} ${Number(p.price).toFixed(2)}. We have ${p.stock} units in stock. Would you like to place an order?`,
        confidence: 0.95,
        provider: 'local-authoritative'
      };
    }

    if (context.matchedFaq) {
      return {
        text: context.matchedFaq.answer,
        confidence: 0.92,
        provider: 'local-faq'
      };
    }

    if (context.matchedPolicy) {
      return {
        text: context.matchedPolicy.content,
        confidence: 0.90,
        provider: 'local-policy'
      };
    }

    return {
      text: "Thank you for reaching out! A member of our support team will assist you shortly.",
      confidence: 0.70,
      provider: 'local-fallback'
    };
  }
}

/**
 * Google Gemini Cloud LLM Provider
 */
export class GeminiLLMProvider extends LLMProvider {
  constructor(apiKey = config.ai.geminiKey) {
    super();
    this.apiKey = apiKey;
  }

  async generateResponse({ prompt, systemPrompt, context = {}, temperature = 0.2 }) {
    if (!this.apiKey) {
      logger.warn('[GeminiLLMProvider] No Gemini API key found, delegating to LocalLLMProvider');
      const fallback = new LocalLLMProvider();
      return fallback.generateResponse({ prompt, systemPrompt, context });
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
      const fullSystem = `${systemPrompt || ''}\n\n[AUTHORITATIVE TENANT DATA]\n${JSON.stringify(context, null, 2)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${fullSystem}\n\nUser Question: ${prompt}` }] }
          ],
          generationConfig: { temperature, maxOutputTokens: 500 }
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error?.message || `Gemini API returned status ${res.status}`);
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return {
        text: generatedText || "Thank you for contacting us. How may we assist you?",
        confidence: 0.96,
        provider: 'gemini-cloud'
      };
    } catch (err) {
      logger.warn(`[GeminiLLMProvider] Error: ${err.message}. Falling back to LocalLLMProvider.`);
      const fallback = new LocalLLMProvider();
      return fallback.generateResponse({ prompt, systemPrompt, context });
    }
  }
}

/**
 * Factory helper to get configured LLM provider
 */
export function getLLMProvider() {
  if (config.ai.geminiKey && config.ai.provider !== 'local') {
    return new GeminiLLMProvider(config.ai.geminiKey);
  }
  return new LocalLLMProvider();
}
