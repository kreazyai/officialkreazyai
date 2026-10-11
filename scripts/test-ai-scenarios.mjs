/**
 * scripts/test-ai-scenarios.mjs
 * 
 * Comprehensive Verification of Real Ollama AI Inquiries via Live Server
 */

const testCases = [
  {
    name: '1. Black Shirts Availability (Non-existent item/color test)',
    question: 'Hello, do you have black shirts available?',
    expectedKeyword: 'not', // Must state NOT available / don't have
    forbiddenKeyword: 'Artisan Linen Overshirt in stock' // Must NOT claim Artisan Linen Overshirt matches
  },
  {
    name: '2. Exact Product In-Stock & Price Check',
    question: 'Do you have Artisan Linen Overshirt in stock? What is the price?',
    expectedKeyword: '89', // Price $89.00
    forbiddenKeyword: null
  },
  {
    name: '3. Bengali Black Shirt Availability Check',
    question: 'Hello, আপনাদের কাছে কি কালো শার্ট আছে?',
    expectedKeywords: ['নেই', 'নাই', 'আছে না', 'পাওয়া যাবে না', 'উপলব্ধ নেই'], // Not available in Bengali
    forbiddenKeyword: 'স্টকে আছে'
  },
  {
    name: '4. Store Policy (Return & Refund Policy)',
    question: 'What is your return and refund policy?',
    expectedKeyword: '14', // 14 days
    forbiddenKeyword: null
  },
  {
    name: '5. Human Escalation Handoff',
    question: 'I need to talk to a human manager immediately about an issue!',
    expectedKeyword: 'team member',
    forbiddenKeyword: null
  }
];

async function runTests() {
  console.log('================================================================');
  console.log('KREAZYAI LIVE SERVER - AI PIPELINE VERIFICATION SUITE');
  console.log('Host: http://localhost:5000 | Model: Ollama qwen3:1.7b');
  console.log('================================================================\n');

  // Verify health first
  const healthRes = await fetch('http://localhost:5000/api/v1/whatsapp/ai-health');
  const healthJson = await healthRes.json();
  console.log('LIVE AI HEALTH:', JSON.stringify(healthJson.data, null, 2));

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`TEST: ${tc.name}`);
    console.log(`Query: "${tc.question}"`);
    console.log(`----------------------------------------------------------------`);

    const start = Date.now();
    const res = await fetch('http://localhost:5000/api/v1/whatsapp/test-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageText: tc.question,
        senderPhone: '+88017' + Math.floor(10000000 + Math.random() * 90000000),
        senderName: 'Live Tester'
      })
    });

    const json = await res.json();
    const elapsed = Date.now() - start;
    const result = json?.data?.result || {};

    console.log(`Response Time: ${elapsed}ms (Pipeline reported: ${result.executionTimeMs}ms)`);
    console.log(`Source Type:   ${result.sourceType || 'UNKNOWN'}`);
    console.log(`Source:        ${result.retrievalSource || 'UNKNOWN'}`);
    console.log(`Intent:        ${result.intent}`);
    console.log(`AI Reply:      "${result.replyText}"`);

    let ok = true;
    if (tc.expectedKeyword && !result.replyText?.toLowerCase().includes(tc.expectedKeyword.toLowerCase())) {
      console.error(`  ✕ FAILED: Expected response to include "${tc.expectedKeyword}"`);
      ok = false;
    }
    if (tc.expectedKeywords && !tc.expectedKeywords.some(kw => result.replyText?.toLowerCase().includes(kw.toLowerCase()))) {
      console.error(`  ✕ FAILED: Expected response to include one of [${tc.expectedKeywords.join(', ')}]`);
      ok = false;
    }
    if (tc.forbiddenKeyword && result.replyText?.toLowerCase().includes(tc.forbiddenKeyword.toLowerCase())) {
      console.error(`  ✕ FAILED: Response falsely included forbidden text "${tc.forbiddenKeyword}"`);
      ok = false;
    }

    if (ok) {
      console.log(`  ✓ PASSED: Response accurately grounded in business reality!`);
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 ALL LIVE AI PIPELINE SCENARIOS FULLY VERIFIED!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
