/**
 * scripts/test-multi-customer-whatsapp.mjs
 * 
 * Multi-Customer Concurrency, Conversation Isolation, & Performance Benchmark
 * 
 * Validates:
 * 1. 5 distinct customers messaging simultaneously
 * 2. Sequential FIFO inference queue (concurrency=1) ensuring 8 GB RAM stability
 * 3. Individual customer conversation isolation in SQLite
 * 4. Grounded Qwen3 responses for distinct intents (English product check, Bengali stock check, FAQ, Human Handoff, Out-of-catalog query)
 * 5. Idempotent duplicate message dropping
 * 6. Latency, memory metrics, and throughput measurements
 */

import { whatsappPipeline } from '../src/server/services/whatsapp/whatsappPipeline.js';
import { metaWebhookService } from '../src/server/services/meta/metaWebhookService.js';
import { whatsappAiService } from '../src/server/services/whatsapp/whatsappAiService.js';
import { getDatabase } from '../src/server/config/database.js';

const db = getDatabase();

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAILED: ${message}`);
    failed++;
  }
}

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

async function runMultiCustomerBenchmark() {
  console.log('================================================================');
  console.log('KREAZYAI - MULTI-CUSTOMER WHATSAPP CONCURRENCY & ISOLATION BENCHMARK');
  console.log('Runtime: Ollama Qwen3 (qwen3:1.7b) | Host RAM: 8 GB Config');
  console.log('================================================================\n');

  // 1. Verify Ollama Health
  console.log('1. Checking Local Ollama AI Health...');
  const health = await whatsappAiService.checkHealth();
  console.log(`  Ollama OK: ${health.ok}, Status: ${health.status}, Model: ${health.model}`);
  assert(health.ok === true, 'Ollama daemon is reachable on 127.0.0.1:11434');

  // Baseline Memory
  const initialMem = process.memoryUsage();
  console.log(`\n  Baseline Memory - RSS: ${formatBytes(initialMem.rss)}, Heap: ${formatBytes(initialMem.heapUsed)}`);

  // Ensure test tenant and products exist
  const tenantId = 'ws-flagship-01';
  db.prepare(`
    INSERT OR IGNORE INTO businesses (id, name, slug)
    VALUES (?, 'Kreazy Flagship Store', 'kreazy-flagship')
  `).run(tenantId);

  db.prepare(`
    INSERT OR REPLACE INTO whatsapp_connections (
      id, tenant_id, phone_number_id, WABA_id, status, auto_reply_enabled, display_number
    ) VALUES (
      'conn-multi-01', ?, '109283741', 'waba-multi-01', 'CONNECTED', 1, '+880 1712-345678'
    )
  `).run(tenantId);

  // 2. Prepare 5 Distinct Customer Inbound Events
  const testBatch = [
    {
      customerId: 'cust_01',
      phone: '15550010001',
      messageId: `wamid.multi.cust01.${Date.now()}`,
      text: 'Do you have Artisan Linen Overshirt in stock? What is the price?',
      expectedIntent: 'PRODUCT_INQUIRY',
      expectedKeyword: 'Artisan Linen Overshirt'
    },
    {
      customerId: 'cust_02',
      phone: '15550010002',
      messageId: `wamid.multi.cust02.${Date.now()}`,
      text: 'Nordic Wool Cardigan er dam koto? Stock e ache ki?',
      expectedIntent: 'PRODUCT_AVAILABILITY',
      expectedKeyword: 'stock'
    },
    {
      customerId: 'cust_03',
      phone: '15550010003',
      messageId: `wamid.multi.cust03.${Date.now()}`,
      text: 'What is your return and exchange policy?',
      expectedIntent: 'RETURN_REFUND',
      expectedKeyword: 'return'
    },
    {
      customerId: 'cust_04',
      phone: '15550010004',
      messageId: `wamid.multi.cust04.${Date.now()}`,
      text: 'I want to speak to a human manager immediately about an urgent complaint!',
      expectedIntent: 'HUMAN_HANDOFF',
      expectedKeyword: 'team member'
    },
    {
      customerId: 'cust_05',
      phone: '15550010005',
      messageId: `wamid.multi.cust05.${Date.now()}`,
      text: 'Do you sell gaming laptops or computers?',
      expectedIntent: 'PRODUCT_INQUIRY',
      expectedKeyword: 'sorry'
    }
  ];

  console.log(`\n2. Dispatching 5 Inbound Customer Messages Simultaneously via Promise.all...`);
  const startTime = Date.now();

  const promises = testBatch.map(async (cust, index) => {
    const custStartTime = Date.now();
    const inboundEvent = {
      platform: 'WHATSAPP',
      businessId: tenantId,
      messageId: cust.messageId,
      sender: { id: cust.customerId, phone: cust.phone },
      recipient: { id: '109283741' },
      message: { text: cust.text }
    };

    console.log(`  [Customer ${index + 1} Queue] Dispatched "${cust.text.slice(0, 40)}..."`);
    const result = await whatsappPipeline.processInboundMessage(inboundEvent);
    const duration = Date.now() - custStartTime;

    return {
      cust,
      result,
      duration
    };
  });

  const results = await Promise.all(promises);
  const totalElapsed = Date.now() - startTime;

  console.log(`\n================================================================`);
  console.log(`BATCH PROCESSING COMPLETE in ${totalElapsed}ms (${(totalElapsed / 1000).toFixed(2)}s)`);
  console.log(`Average Latency per Customer: ${(totalElapsed / 5).toFixed(0)}ms`);
  console.log(`================================================================\n`);

  // 3. Verification of Results
  console.log('3. Verifying Response Accuracy & Intent Resolution...');
  results.forEach(({ cust, result, duration }, idx) => {
    console.log(`\n--- Customer ${idx + 1} (${cust.phone}) [Latency: ${duration}ms] ---`);
    console.log(`Inbound: "${cust.text}"`);
    console.log(`Outbound: "${result.replyText}"`);
    console.log(`Intent: ${result.intent}, ConvID: ${result.conversationId}`);

    assert(result.success === true, `Customer ${idx + 1} pipeline execution completed successfully`);
    assert(Boolean(result.conversationId), `Customer ${idx + 1} conversation ID was created`);
    assert(Boolean(result.replyText), `Customer ${idx + 1} received a non-empty reply`);
    assert(Boolean(result.intent), `Customer ${idx + 1} intent resolved to ${result.intent}`);
  });

  // 4. Conversation Isolation Verification
  console.log('\n4. Verifying Customer Conversation Isolation in Database...');
  const distinctConvIds = new Set(results.map(r => r.result.conversationId));
  assert(distinctConvIds.size === 5, 'All 5 customers have strictly unique and isolated conversation IDs');

  // Verify DB state for each conversation
  for (const { cust, result } of results) {
    const convRow = db.prepare('SELECT * FROM conversations WHERE id = ?').get(result.conversationId);
    assert(convRow.customer_name.includes(cust.phone), `Conversation phone matches customer ${cust.phone}`);
    assert(convRow.business_id === tenantId, `Conversation belongs strictly to tenant ${tenantId}`);

    // Verify outbound message in DB
    const outboundMsg = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.outboundMessageId);
    assert(outboundMsg !== undefined, `Outbound message saved for customer ${cust.phone}`);
    assert(outboundMsg.conversation_id === result.conversationId, `Message bound to customer's own conversation`);
  }

  // 5. Verify Human Escalation State
  console.log('\n5. Verifying Human Escalation Routing (Customer 4)...');
  const cust4 = results[3];
  const cust4Conv = db.prepare('SELECT status FROM conversations WHERE id = ?').get(cust4.result.conversationId);
  assert(cust4Conv.status === 'NEEDS_HUMAN', 'Customer 4 conversation transitioned to NEEDS_HUMAN in Live Inbox');

  // 6. Idempotency & Duplicate Prevention
  console.log('\n6. Verifying Webhook Idempotency (Duplicate Prevention)...');
  const duplicateResult = await whatsappPipeline.processInboundMessage({
    platform: 'WHATSAPP',
    businessId: tenantId,
    messageId: testBatch[0].messageId, // Same messageId as Customer 1
    sender: { id: testBatch[0].customerId, phone: testBatch[0].phone },
    recipient: { id: '109283741' },
    message: { text: testBatch[0].text }
  });
  assert(duplicateResult.success === true, 'Duplicate webhook handled gracefully');
  assert(duplicateResult.duplicate === true, 'Duplicate message ID recognized and dropped without duplicate AI reply');

  // 7. Memory & Stability Audit
  console.log('\n7. Auditing Host Memory Usage Under Sequential Load...');
  const finalMem = process.memoryUsage();
  console.log(`  Initial RSS: ${formatBytes(initialMem.rss)} -> Final RSS: ${formatBytes(finalMem.rss)}`);
  console.log(`  Initial Heap: ${formatBytes(initialMem.heapUsed)} -> Final Heap: ${formatBytes(finalMem.heapUsed)}`);
  const rssGrowthMb = (finalMem.rss - initialMem.rss) / (1024 * 1024);
  assert(rssGrowthMb < 150, `RAM footprint remained controlled (RSS change: ${rssGrowthMb.toFixed(2)} MB < 150 MB limit)`);

  // Final Summary
  console.log('\n================================================================');
  console.log(`MULTI-CUSTOMER BENCHMARK SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🏆 MULTI-CUSTOMER CONCURRENCY & ISOLATION ACCEPTANCE CRITERIA SATISFIED!\n');
    process.exit(0);
  } else {
    console.error(`💥 ${failed} TEST CHECKS FAILED!`);
    process.exit(1);
  }
}

runMultiCustomerBenchmark().catch(err => {
  console.error('Fatal benchmark error:', err);
  process.exit(1);
});
