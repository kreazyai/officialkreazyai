import { config } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';

/**
 * Interface definition for Vision / Multimodal providers
 */
export class VisionProvider {
  /**
   * @param {Object} options
   * @param {string} [options.imageUrl]
   * @param {Buffer} [options.mediaBuffer]
   * @param {string} [options.mimeType]
   * @param {string} [options.prompt]
   * @returns {Promise<{ category: string, color: string, keywords: string[], rawDescription: string }>}
   */
  async analyzeImage(_options) {
    throw new Error('analyzeImage() must be implemented by VisionProvider subclass');
  }
}

/**
 * Local / Fallback Vision Provider
 * Extracts hints from image filename, metadata, or heuristics
 */
export class LocalVisionProvider extends VisionProvider {
  async analyzeImage({ imageUrl = '', prompt = '' }) {
    logger.info('[LocalVisionProvider] Analyzing image with local heuristic feature extraction');
    const lower = (imageUrl + ' ' + prompt).toLowerCase();

    let category = 'apparel';
    if (/shoe|sneaker|boot|loafer|sandal|running/i.test(lower)) category = 'shoes';
    else if (/watch|chronograph|rolex/i.test(lower)) category = 'watches';
    else if (/bag|backpack|purse|tote/i.test(lower)) category = 'accessories';
    else if (/shirt|kimono|hoodie|jacket|dress|silk/i.test(lower)) category = 'clothing';

    let color = 'unknown';
    if (/black|dark/i.test(lower)) color = 'black';
    else if (/white|ivory/i.test(lower)) color = 'white';
    else if (/blue|navy/i.test(lower)) color = 'blue';
    else if (/red|crimson/i.test(lower)) color = 'red';

    const keywords = [];
    if (/shoe|sneaker/i.test(lower)) keywords.push('shoe', 'sneakers', 'footwear');
    if (/kimono|silk/i.test(lower)) keywords.push('kimono', 'silk', 'japanese');
    if (/watch/i.test(lower)) keywords.push('watch', 'chronograph');

    return {
      category,
      color,
      keywords,
      rawDescription: `Local vision detected item categorized as ${category} (${color})`
    };
  }
}

/**
 * Gemini Multimodal Cloud Vision Provider
 */
export class GeminiVisionProvider extends VisionProvider {
  constructor(apiKey = config.ai.geminiKey) {
    super();
    this.apiKey = apiKey;
  }

  async analyzeImage({ imageUrl = '', mediaBuffer = null, mimeType = 'image/jpeg', prompt = '' }) {
    if (!this.apiKey) {
      logger.warn('[GeminiVisionProvider] No Gemini API key found, delegating to LocalVisionProvider');
      const fallback = new LocalVisionProvider();
      return fallback.analyzeImage({ imageUrl, prompt });
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;
      const contents = [];

      let base64Data = null;
      if (mediaBuffer) {
        base64Data = mediaBuffer.toString('base64');
      } else if (imageUrl && !imageUrl.startsWith('http')) {
        // Mock or local path
        const fallback = new LocalVisionProvider();
        return fallback.analyzeImage({ imageUrl, prompt });
      }

      if (base64Data) {
        contents.push({
          role: 'user',
          parts: [
            {
              text: 'Analyze this retail product image. Return a JSON object with: { "category": string, "color": string, "keywords": string[], "rawDescription": string }'
            },
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data
              }
            }
          ]
        });

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            return JSON.parse(match[0]);
          }
        }
      }

      const fallback = new LocalVisionProvider();
      return fallback.analyzeImage({ imageUrl, prompt });
    } catch (err) {
      logger.warn(`[GeminiVisionProvider] Analysis error: ${err.message}. Falling back to LocalVisionProvider.`);
      const fallback = new LocalVisionProvider();
      return fallback.analyzeImage({ imageUrl, prompt });
    }
  }
}

/**
 * Factory helper for Vision Provider
 */
export function getVisionProvider() {
  if (config.ai.geminiKey && config.ai.provider !== 'local') {
    return new GeminiVisionProvider(config.ai.geminiKey);
  }
  return new LocalVisionProvider();
}
