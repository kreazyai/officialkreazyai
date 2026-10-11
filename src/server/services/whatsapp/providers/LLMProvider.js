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

import { whatsappAiService } from '../whatsappAiService.js';

/**
 * Local Ollama Qwen3 LLM Provider
 * Grounded in local Ollama runtime without any paid cloud AI APIs.
 */
export class OllamaQwenLLMProvider extends LLMProvider {
  async generateResponse({ prompt, systemPrompt, context = {}, conversationId = 'default_conv' }) {
    logger.info('[OllamaQwenLLMProvider] Invoking local Ollama Qwen3 runtime');

    const result = await whatsappAiService.generateCustomerReply({
      businessId: context.businessId || context.tenantId || 'ws-flagship-01',
      conversationId,
      customerMessage: prompt,
      knowledge: {
        products: context.matchedProduct ? [context.matchedProduct] : [],
        faqs: context.matchedFaq ? [context.matchedFaq] : [],
        policies: context.matchedPolicy ? [context.matchedPolicy] : []
      }
    });

    if (result.success && result.replyText) {
      return {
        text: result.replyText,
        confidence: 0.96,
        provider: `ollama-${result.model}`
      };
    }

    // Graceful fallback to local authoritative handler
    const fallback = new LocalLLMProvider();
    return fallback.generateResponse({ prompt, systemPrompt, context });
  }
}

/**
 * Factory helper to get configured LLM provider (Defaults strictly to local Ollama Qwen3)
 */
export function getLLMProvider() {
  return new OllamaQwenLLMProvider();
}

