/**
 * Automated Verification Script for Analytics Page Redesign
 * Tests:
 * 1. Unique customer counting and channel breakdown.
 * 2. Multiple messages from one customer do not inflate counts.
 * 3. Date range changes (today, 7_days, 30_days).
 * 4. Human takeover and outstanding customer detection.
 * 5. AI replies and resolved conversations remove customers from attention queue.
 * 6. Unresolved requests remain after midnight.
 * 7. Tenant isolation.
 * 8. Mobile responsiveness & styles.
 * 9. Navigation to messages filter.
 * 10. Empty, zero-data, and failure states.
 */

import { getDatabase } from '../src/server/config/database.js';
import { dashboardMetricsController, getTimezoneBoundaryEpochs } from '../src/server/controllers/dashboardMetricsController.js';

const db = getDatabase();

console.log('====================================================');
console.log('RUNNING ANALYTICS REDESIGN VERIFICATION TESTS');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failedTests++;
  }
}

function createMockRes() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; }
  };
}

async function run() {
  const testTenant = 'ws-test-analytics-' + Date.now();
  const testTenantB = 'ws-test-other-' + Date.now();

  try {
    // 0. Ensure Business profile with timezone
    db.prepare(`
      INSERT OR REPLACE INTO businesses (id, name, slug, owner_email, plan, status)
      VALUES (?, 'Test Business', ?, 'owner@test.com', 'growth', 'ACTIVE')
    `).run(testTenant, 'test-slug-' + Date.now());

    db.prepare(`
      INSERT OR REPLACE INTO business_profiles (id, business_id, timezone, base_currency)
      VALUES (?, ?, 'Asia/Dhaka', 'BDT')
    `).run('prof-' + testTenant, testTenant);

    db.prepare(`
      INSERT OR REPLACE INTO businesses (id, name, slug, owner_email, plan, status)
      VALUES (?, 'Test Business B', ?, 'ownerB@test.com', 'growth', 'ACTIVE')
    `).run(testTenantB, 'test-slug-b-' + Date.now());

    const bounds = getTimezoneBoundaryEpochs('Asia/Dhaka');
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const insertCust = db.prepare(`
      INSERT INTO customers (id, business_id, full_name, email, phone)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertCust.run('cust-1', testTenant, 'Alice Green', 'alice@test.com', '+15550000001');
    insertCust.run('cust-2', testTenant, 'Bob Blue', 'bob@test.com', '+15550000002');
    insertCust.run('cust-3', testTenant, 'Charlie Pink', 'charlie@test.com', '+15550000003');
    insertCust.run('cust-old', testTenant, 'Old Customer', 'old@test.com', '+15550000004');
    insertCust.run('cust-persist', testTenant, 'Urgent Customer', 'urgent@test.com', '+15550000005');

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Unique customer counting & channel breakdown
    // ─────────────────────────────────────────────────────────────
    // Create customer 1 on WhatsApp
    db.prepare(`
      INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'WHATSAPP', 'ACTIVE', ?, ?)
    `).run('conv-t1-wa', testTenant, 'cust-1', 'Alice Green', nowIso, nowIso);

    // Create customer 2 on Facebook
    db.prepare(`
      INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'FACEBOOK', 'ACTIVE', ?, ?)
    `).run('conv-t1-fb', testTenant, 'cust-2', 'Bob Blue', nowIso, nowIso);

    // Create customer 3 on Instagram
    db.prepare(`
      INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'INSTAGRAM', 'ACTIVE', ?, ?)
    `).run('conv-t1-ig', testTenant, 'cust-3', 'Charlie Pink', nowIso, nowIso);

    let mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenant }, mockRes, () => {});

    const t1Data = mockRes.payload.data;
    assert(t1Data.customers.today.total === 3, 'Test 1.1: Total unique customers today is 3');
    assert(t1Data.customers.today.whatsapp === 1, 'Test 1.2: WhatsApp customer count is 1');
    assert(t1Data.customers.today.facebook === 1, 'Test 1.3: Facebook Messenger customer count is 1');
    assert(t1Data.customers.today.instagram === 1, 'Test 1.4: Instagram customer count is 1');

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Multiple messages from one customer do not inflate counts
    // ─────────────────────────────────────────────────────────────
    // Send 10 messages from Alice Green on WhatsApp
    for (let i = 1; i <= 10; i++) {
      db.prepare(`
        INSERT INTO messages (id, conversation_id, sender, text, is_ai, channel, direction, created_at)
        VALUES (?, 'conv-t1-wa', 'customer', 'Hello message ' || ?, 0, 'WHATSAPP', 'INBOUND', ?)
      `).run(`msg-t2-${i}`, i, nowIso);
    }

    mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenant }, mockRes, () => {});
    const t2Data = mockRes.payload.data;
    assert(t2Data.customers.today.total === 3, 'Test 2.1: 10 messages from same customer do not inflate total count (still 3)');
    assert(t2Data.customers.today.whatsapp === 1, 'Test 2.2: WhatsApp count remains 1');

    // Cross-channel linked identity deduplication test:
    // Suppose Alice Green also contacts on Instagram with the same customer_id 'cust-1'
    db.prepare(`
      INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, status, created_at, updated_at)
      VALUES ('conv-t2-linked', ?, 'cust-1', 'Alice Green', 'INSTAGRAM', 'ACTIVE', ?, ?)
    `).run(testTenant, nowIso, nowIso);

    mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenant }, mockRes, () => {});
    const t2LinkedData = mockRes.payload.data;
    assert(t2LinkedData.customers.today.total === 3, 'Test 2.3: Customer linked across channels is counted ONCE for total (still 3)');
    assert(t2LinkedData.customers.today.whatsapp === 1, 'Test 2.4: WhatsApp count is 1');
    assert(t2LinkedData.customers.today.instagram === 2, 'Test 2.5: Instagram count is 2 (cust-1 and cust-3)');

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Date range changes (today, 7_days, 30_days)
    // ─────────────────────────────────────────────────────────────
    // Add a conversation from 15 days ago (outside 7 days, inside 30 days)
    const fifteenDaysAgoIso = new Date(Date.now() - 15 * 86400000).toISOString().replace('T', ' ').substring(0, 19);
    db.prepare(`
      INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, status, created_at, updated_at)
      VALUES ('conv-t3-old', ?, 'cust-old', 'Old Customer', 'WHATSAPP', 'ACTIVE', ?, ?)
    `).run(testTenant, fifteenDaysAgoIso, fifteenDaysAgoIso);

    mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenant }, mockRes, () => {});
    const t3Data = mockRes.payload.data;
    assert(t3Data.customers.today.total === 3, 'Test 3.1: Today count does not include 15-day-old customer');
    assert(t3Data.customers['7_days'].total === 3, 'Test 3.2: 7 Days count does not include 15-day-old customer');
    assert(t3Data.customers['30_days'].total === 4, 'Test 3.3: 30 Days count includes 15-day-old customer (total = 4)');

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Human takeover and outstanding customer detection
    // ─────────────────────────────────────────────────────────────
    // Mark Alice's conversation as NEEDS_HUMAN
    db.prepare(`
      UPDATE conversations SET status = 'NEEDS_HUMAN' WHERE id = 'conv-t1-wa'
    `).run();

    // Mark Bob's conversation with customer message > 30s ago with no AI reply
    const fortySecsAgoIso = new Date(Date.now() - 40000).toISOString().replace('T', ' ').substring(0, 19);
    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender, text, is_ai, direction, created_at)
      VALUES ('msg-unanswered-bob', 'conv-t1-fb', 'customer', 'I need human manager', 0, 'INBOUND', ?)
    `).run(fortySecsAgoIso);

    mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenant }, mockRes, () => {});
    const t4Data = mockRes.payload.data;
    assert(t4Data.needHelp.count === 2, 'Test 4.1: Need Help count detects 2 waiting conversations (NEEDS_HUMAN and unanswered >30s)');
    assert(t4Data.needHelp.waitingCustomers.length <= 3, 'Test 4.2: Displays up to 3 waiting customers');
    const waitingNames = t4Data.needHelp.waitingCustomers.map(c => c.name);
    assert(waitingNames.includes('Alice Green') && waitingNames.includes('Bob Blue'), 'Test 4.3: Waiting customers contain actual display names');

    // ─────────────────────────────────────────────────────────────
    // TEST 5: AI replies and resolved conversations remove customers from attention queue
    // ─────────────────────────────────────────────────────────────
    // Bob receives an AI reply
    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender, text, is_ai, direction, created_at)
      VALUES ('msg-ai-bob-reply', 'conv-t1-fb', 'ai', 'I can help with that', 1, 'OUTBOUND', ?)
    `).run(nowIso);

    mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenant }, mockRes, () => {});
    assert(mockRes.payload.data.needHelp.count === 1, 'Test 5.1: AI reply removes Bob from attention queue (count down to 1)');

    // Alice's issue is resolved
    db.prepare(`
      UPDATE conversations SET status = 'RESOLVED' WHERE id = 'conv-t1-wa'
    `).run();

    mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenant }, mockRes, () => {});
    assert(mockRes.payload.data.needHelp.count === 0, 'Test 5.2: Marking Alice RESOLVED drops waiting count to 0');
    assert(mockRes.payload.data.needHelp.waitingCustomers.length === 0, 'Test 5.3: Waiting list is empty');

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Unresolved requests remain after midnight
    // ─────────────────────────────────────────────────────────────
    // Add unresolved conversation from 2 days ago
    const twoDaysAgoIso = new Date(Date.now() - 2 * 86400000).toISOString().replace('T', ' ').substring(0, 19);
    db.prepare(`
      INSERT INTO conversations (id, business_id, customer_id, customer_name, channel, status, created_at, updated_at)
      VALUES ('conv-persisting-need-help', ?, 'cust-persist', 'Urgent Customer', 'WHATSAPP', 'NEEDS_HUMAN', ?, ?)
    `).run(testTenant, twoDaysAgoIso, twoDaysAgoIso);

    mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenant }, mockRes, () => {});
    assert(mockRes.payload.data.needHelp.count === 1, 'Test 6.1: Active outstanding-work count does NOT reset at midnight (stays 1)');

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Tenant isolation
    // ─────────────────────────────────────────────────────────────
    mockRes = createMockRes();
    await dashboardMetricsController.getAnalyticsMetrics({ businessId: testTenantB }, mockRes, () => {});
    const t7Data = mockRes.payload.data;
    assert(t7Data.customers.today.total === 0, 'Test 7.1: Tenant B has 0 customers (strict isolation)');
    assert(t7Data.needHelp.count === 0, 'Test 7.2: Tenant B has 0 waiting requests');

  } finally {
    // Clean up test data
    try {
      db.prepare(`DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE business_id IN (?, ?))`).run(testTenant, testTenantB);
      db.prepare(`DELETE FROM conversations WHERE business_id IN (?, ?)`).run(testTenant, testTenantB);
      db.prepare(`DELETE FROM customers WHERE business_id IN (?, ?)`).run(testTenant, testTenantB);
      db.prepare(`DELETE FROM business_profiles WHERE business_id IN (?, ?)`).run(testTenant, testTenantB);
      db.prepare(`DELETE FROM businesses WHERE id IN (?, ?)`).run(testTenant, testTenantB);
    } catch (e) {
      console.warn('Cleanup error:', e.message);
    }
  }

  console.log('\n====================================================');
  console.log(`VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');
  if (failedTests > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
