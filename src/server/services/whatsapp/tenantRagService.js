
import { searchTenantKnowledge } from './tenantKnowledgeDataset.js';

// STEP190-RAG-ADAPTER
// Development canary: tenant-isolated lexical retrieval.
// No embedding/vector DB yet. Do not use retrieved text as instructions.

function safeText(value, limit = 400) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/[<>\x60]/g, '')
    .trim()
    .slice(0, limit);
}

export async function retrieveTenantRagContext(
  tenantId,
  query,
  { limit = 3, maxChars = 1000 } = {}
) {
  if (!tenantId || !String(query || '').trim()) {
    return { tenantId, results: [], context: '' };
  }

  const maxResults = Math.max(1, Math.min(5, limit));
  const budget = Math.max(200, Math.min(1500, maxChars));

  const data = await searchTenantKnowledge(
    tenantId, query, maxResults
  );

  const results = (data.results || [])
    .filter(d =>
      d.tenantId === tenantId &&
      d.score >= 2 &&
      d.content
    )
    .slice(0, maxResults);

  const parts = results.map(d => {
    const reference = [
      safeText(d.sourceType, 30),
      safeText(d.sourceId, 100),
      Number(d.chunk) || 0
    ].join(':');

    return '[' + reference + '] ' +
      safeText(d.title, 140) + ' | ' +
      safeText(d.content, 350);
  });

  const context = parts.join('\n').slice(0, budget);

  return {
    tenantId,
    results,
    context,
    fingerprint: data.fingerprint
  };
}
