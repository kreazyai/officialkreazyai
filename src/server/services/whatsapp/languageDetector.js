/**
 * Language Detector for Kreazy AI WhatsApp Integration
 * Supports: BANGLA, BANGLISH, ENGLISH, MIXED
 *
 * Requirements:
 * - Detect language accurately for multilingual customer queries
 * - Normalizes user text while preserving original text for audit
 */

// Bengali Unicode regex block: \u0980 - \u09FF
const BANGLA_UNICODE_REGEX = /[\u0980-\u09FF]/;

// Common phonetic Banglish lexicon words and prefixes
const BANGLISH_KEYWORDS = new Set([
  'koto', 'dam', 'daam', 'ache', 'aache', 'ase', 'aseh', 'hobe', 'hobey',
  'korte', 'korbo', 'chai', 'chaai', 'dokan', 'dokaan', 'bhai', 'bhaiya', 'vai', 'vaiya',
  'apnader', 'amader', 'amar', 'apni', 'tumi', 'kobe', 'kothay', 'kothai',
  'ki', 'kibhabe', 'kemne', 'shob', 'sob', 'aro', 'kom', 'hobe',
  'pathaben', 'pathano', 'jabe', 'parbo', 'lagbe', 'dorkar', 'ektu',
  'dekhbo', 'dekhan', 'chobi', 'pic', 'shobdo', 'taka', 'tk', 'khujchi',
  'chole', 'geche', 'nibo', 'nebo', 'nite', 'order', 'delivery', 'charge'
]);

export const languageDetector = {
  /**
   * Detects whether text is BANGLA, BANGLISH, ENGLISH, or MIXED.
   * @param {string} text 
   * @returns {{ language: 'BANGLA' | 'BANGLISH' | 'ENGLISH' | 'MIXED', confidence: number, banglaScore: number, banglishScore: number }}
   */
  detect(text) {
    if (!text || typeof text !== 'string') {
      return { language: 'ENGLISH', confidence: 1.0, banglaScore: 0, banglishScore: 0 };
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return { language: 'ENGLISH', confidence: 1.0, banglaScore: 0, banglishScore: 0 };
    }

    // 1. Check for native Bengali script characters
    let banglaCharCount = 0;
    let latinCharCount = 0;

    for (const char of trimmed) {
      if (BANGLA_UNICODE_REGEX.test(char)) {
        banglaCharCount++;
      } else if (/[a-zA-Z]/.test(char)) {
        latinCharCount++;
      }
    }

    const totalAlpha = banglaCharCount + latinCharCount;

    // Case 1: Pure or predominantly native Bengali script
    if (banglaCharCount > 0 && latinCharCount === 0) {
      return { language: 'BANGLA', confidence: 0.99, banglaScore: 1.0, banglishScore: 0, isBanglaScript: true };
    }

    if (banglaCharCount > 0 && banglaCharCount / (totalAlpha || 1) >= 0.6) {
      return { language: 'BANGLA', confidence: 0.92, banglaScore: banglaCharCount / totalAlpha, banglishScore: 0, isBanglaScript: true };
    }

    // Case 2: Contains both Bengali script and English/Latin characters
    if (banglaCharCount > 0 && latinCharCount > 0) {
      return { language: 'MIXED', confidence: 0.95, banglaScore: banglaCharCount / totalAlpha, banglishScore: 0.5, isBanglaScript: true };
    }

    // Case 3: Latin script — analyze for Banglish vocabulary
    const tokens = trimmed.toLowerCase().split(/[\s,?.!/\\-]+/).filter(Boolean);
    let banglishWordCount = 0;

    for (const token of tokens) {
      if (BANGLISH_KEYWORDS.has(token)) {
        banglishWordCount++;
      }
    }

    const banglishRatio = tokens.length > 0 ? banglishWordCount / tokens.length : 0;

    if (banglishWordCount >= 2 || (tokens.length <= 4 && banglishWordCount >= 1 && banglishRatio >= 0.25)) {
      if (banglishRatio >= 0.5) {
        return { language: 'BANGLISH', confidence: 0.94, banglaScore: 0, banglishScore: banglishRatio, isBanglaScript: false };
      } else {
        return { language: 'MIXED', confidence: 0.90, banglaScore: 0, banglishScore: banglishRatio, isBanglaScript: false };
      }
    }

    return { language: 'ENGLISH', confidence: 0.95, banglaScore: 0, banglishScore: banglishRatio, isBanglaScript: false };
  },

  /**
   * Normalizes incoming text:
   * Strips harmful control characters, standardizes spacing, but retains original meaning.
   * @param {string} text 
   * @returns {string} Normalized text
   */
  normalize(text) {
    if (!text) return '';
    return text
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // remove invisible control chars
      .replace(/\s+/g, ' ')
      .trim();
  }
};
