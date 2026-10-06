import { logger } from '../../utils/logger.js';
import { config } from '../../config/env.js';

/**
 * Multimodal / Vision Provider Abstraction
 * Supports replaceable backends (Gemini Vision, OpenAI Vision, or Local heuristic vision encoder).
 */
export const visionService = {
  /**
   * Analyzes an image message or media reference to extract product visual traits.
   * @param {{ url?: string, mimeType?: string, id?: string, base64?: string }} media
   * @param {string} captionText Optional user caption accompanying image
   * @returns {Promise<{ tags: string[], category: string, primaryColor: string, styleKeywords: string[], confidence: number }>}
   */
  async extractProductCharacteristics(media, captionText = '') {
    if (!media) {
      return { tags: [], category: 'unknown', primaryColor: '', styleKeywords: [], confidence: 0 };
    }

    logger.info(`Extracting visual characteristics from WhatsApp media [type: ${media.mimeType || 'image'}]...`);

    // 1. If Gemini Vision API key is configured
    if (config.ai.geminiKey) {
      try {
        const traits = await this._callGeminiVision(media, captionText);
        if (traits) return traits;
      } catch (err) {
        logger.warn('Gemini Vision extraction failed, using modular fallback:', err.message);
      }
    }

    // 2. Modular fallback / heuristic image descriptor
    return this._heuristicImageAnalysis(media, captionText);
  },

  /**
   * Gemini Multimodal Vision analysis
   */
  async _callGeminiVision(media, captionText) {
    const apiKey = config.ai.geminiKey;
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const promptText = `Analyze this product image sent by a shopper. Identify:
1. Exact product category (e.g. "Apparel", "Footwear", "Accessories", "Shirt", "Trouser", "Shoe", "Bag").
2. Key visual attributes (color, pattern, material, style).
3. Specific descriptive keywords for searching an inventory catalog.
Reply strictly in JSON format with keys: "category", "tags" (array of strings), "primaryColor", "confidence" (number 0.0 - 1.0).`;

    const parts = [{ text: promptText }];
    if (media.base64 && media.mimeType) {
      parts.push({
        inlineData: {
          mimeType: media.mimeType,
          data: media.base64
        }
      });
    } else {
      // If no raw image data available in simulation/test
      return null;
    }

    const payload = {
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) return null;
    const data = await res.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      return {
        tags: parsed.tags || [],
        category: parsed.category || 'General',
        primaryColor: parsed.primaryColor || '',
        styleKeywords: parsed.tags || [],
        confidence: parsed.confidence || 0.90
      };
    }
    return null;
  },

  /**
   * Heuristic/Rule-based analyzer for testing and offline execution
   */
  _heuristicImageAnalysis(media, captionText = '') {
    const captionLower = (captionText || '').toLowerCase();
    const tags = [];
    let category = 'Apparel';
    let primaryColor = '';

    // Color detection in caption or filename
    const colors = ['black', 'white', 'blue', 'brown', 'chestnut', 'green', 'olive', 'red', 'navy', 'grey'];
    for (const c of colors) {
      if (captionLower.includes(c) || (media.url && media.url.toLowerCase().includes(c))) {
        primaryColor = c;
        tags.push(c);
        break;
      }
    }

    // Category detection in caption
    if (captionLower.includes('shoe') || captionLower.includes('sneaker') || captionLower.includes('boot')) {
      category = 'Footwear';
      tags.push('shoe', 'footwear');
    } else if (captionLower.includes('bag') || captionLower.includes('crossbody') || captionLower.includes('wallet')) {
      category = 'Accessories';
      tags.push('bag', 'leather', 'accessories');
    } else if (captionLower.includes('trouser') || captionLower.includes('pant')) {
      category = 'Apparel';
      tags.push('trouser', 'pants', 'apparel');
    } else if (captionLower.includes('shirt') || captionLower.includes('linen') || captionLower.includes('overshirt')) {
      category = 'Apparel';
      tags.push('shirt', 'linen', 'overshirt');
    } else {
      tags.push('product', 'catalog-item');
    }

    return {
      tags,
      category,
      primaryColor,
      styleKeywords: tags,
      confidence: 0.85
    };
  }
};
