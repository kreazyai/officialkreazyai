
import crypto from 'node:crypto';
import { knowledgeService } from './knowledgeService.js';

// STEP189-TENANT-DATASET
// Tenant-scoped, read-only, lexical retrieval foundation.
// Prices and stock must always be checked against the live database.

function clean(value, max = 3000) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, max);
}

function variantsOf(input) {
  let value = input;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); }
    catch { return []; }
  }
  if (!Array.isArray(value)) return [];
  return value.slice(0, 40)
    .map(v => typeof v === 'string'
      ? v
      : (v?.name || v?.label || v?.size || v?.color || ''))
    .map(v => clean(v, 80))
    .filter(Boolean);
}

function chunks(text, max = 650, overlap = 80) {
  const value = clean(text, 12000);
  if (!value) return [];
  if (value.length <= max) return [value];

  const result = [];
  const step = max - overlap;
  for (let at = 0; at < value.length; at += step) {
    result.push(value.slice(at, at + max));
    if (at + max >= value.length) break;
  }
  return result;
}

function tokenize(text) {
  return [...new Set(
    clean(text, 2000).toLowerCase()
      .match(/[\p{L}\p{M}\p{N}]+/gu) || []
  )].filter(t => t.length >= 2);
}

export function rankTenantDocuments(tenantId, documents, query, limit = 5) {
  if (!tenantId || !query?.trim()) return [];
  const q = tokenize(query);
  if (!q.length) return [];

  return documents
    .filter(d => d.tenantId === tenantId)
    .map(d => {
      const title = clean(d.title).toLowerCase();
      const body = clean(d.content).toLowerCase();
      const titleTokens = new Set(tokenize(title));
      const bodyTokens = new Set(tokenize(body));

      let score = 0;
      for (const t of q) {
        if (titleTokens.has(t)) score += 4;
        else if (bodyTokens.has(t)) score += 1;
      }

      if (title.includes(query.toLowerCase().trim())) score += 6;
      return { ...d, score };
    })
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(10, limit)));
}

export async function buildTenantKnowledgeDataset(tenantId) {
  if (typeof tenantId !== 'string' || !tenantId.trim()) {
    throw Error('Valid tenantId required');
  }

  const data = await knowledgeService.getTenantKnowledge(tenantId);

  const documents = [];

  function add(type, id, title, content) {
    const parts = chunks(content);
    for (let i = 0; i < parts.length; i++) {
      documents.push({
        tenantId,
        sourceType: type,
        sourceId: clean(id, 120),
        chunk: i,
        title: clean(title, 200),
        content: parts[i]
      });
    }
  }

  for (const p of (data.products || [])) {
    const variantNames = variantsOf(p.variants);
    const details = [
      'Product: ' + clean(p.name),
      'SKU: ' + clean(p.sku),
      'Category: ' + clean(p.category),
      clean(p.description),
      clean(p.ai_knowledge),
      variantNames.length
        ? 'Listed options (not verified stock): ' + variantNames.join(', ')
        : ''
    ].filter(Boolean).join('. ');

    // Never add dynamic price or stock to the RAG documents.
    add('product', p.id || p.sku, p.name, details);
  }

  for (const f of (data.faqs || [])) {
    add(
      'faq',
      f.id || f.question,
      f.question,
      'Question: ' + clean(f.question) +
      '. Answer: ' + clean(f.answer)
    );
  }

  for (const p of (data.policies || [])) {
    add(
      'policy',
      p.id || p.policy_type,
      p.policy_type,
      clean(p.content)
    );
  }

  const fingerprint = crypto.createHash('sha256')
    .update(JSON.stringify(documents))
    .digest('hex');

  return {
    tenantId,
    documents,
    fingerprint,
    counts: {
      products: (data.products || []).length,
      faqs: (data.faqs || []).length,
      policies: (data.policies || []).length,
      chunks: documents.length
    }
  };
}

export async function searchTenantKnowledge(tenantId, query, limit = 5) {
  const dataset = await buildTenantKnowledgeDataset(tenantId);

  return {
    tenantId,
    fingerprint: dataset.fingerprint,
    results: rankTenantDocuments(
      tenantId, dataset.documents, query, limit
    )
  };
}
