import { logger } from '../../../utils/logger.js';

/**
 * Interface definition for Embedding Providers
 */
export class EmbeddingProvider {
  /**
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embedQuery(_text) {
    throw new Error('embedQuery() must be implemented by EmbeddingProvider subclass');
  }

  /**
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async embedDocuments(_texts) {
    throw new Error('embedDocuments() must be implemented by EmbeddingProvider subclass');
  }
}

/**
 * Local Lightweight Embedding Provider (Sparse Bag-of-Words / Character N-Gram Hashing)
 * Zero external network dependency, deterministic and fast
 */
export class LocalEmbeddingProvider extends EmbeddingProvider {
  constructor(dimensions = 64) {
    super();
    this.dimensions = dimensions;
  }

  _vectorize(text) {
    const vec = new Array(this.dimensions).fill(0);
    const tokens = (text || '').toLowerCase().replace(/[^a-z0-9\u0980-\u09FF\s]/g, ' ').split(/\s+/).filter(Boolean);
    
    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % this.dimensions;
      vec[idx] += 1;
    }

    // L2 Normalize
    const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      return vec.map(v => v / norm);
    }
    return vec;
  }

  async embedQuery(text) {
    return this._vectorize(text);
  }

  async embedDocuments(texts) {
    return texts.map(t => this._vectorize(t));
  }
}

export function getEmbeddingProvider() {
  return new LocalEmbeddingProvider();
}
