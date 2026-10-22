import { getDatabase } from '../src/server/config/database.js';
import { highIntentDetector, RECOVERY_INTENT_CATEGORIES } from '../src/server/services/recovery/highIntentDetector.js';
import { recoverySettingsService } from '../src/server/services/recovery/recoverySettingsService.js';
import { recoveryCandidateService } from '../src/server/services/recovery/recoveryCandidateService.js';
import { recoveryPolicyService } from '../src/server/services/recovery/recoveryPolicyService.js';
import { recoveryAiComposer } from '../src/server/services/recovery/recoveryAiComposer.js';
import { recoverySchedulerService } from '../src/server/services/recovery/recoverySchedulerService.js';
import { recoveryDeliveryService } from '../src/server/services/recovery/recoveryDeliveryService.js';
import { recoveryAttributionService } from '../src/server/services/recovery/recoveryAttributionService.js';
import { recoveryController } from '../src/server/controllers/recoveryController.js';

console.log("============================================================");
console.log("STARTING KREAZYAI SMART SALES RECOVERY PRODUCTION TEST SUITE");
console.log("============================================================\n");

const results = [];

function assert(condition, testName) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    results.push({ name: testName, passed: true });
  } else {
    console.error(`[FAIL] ${testName}`);
    results.push({ name: testName, passed: false, error: 'Assertion failed' });
  }
}

async function runTests() {
  const db = getDatabase();

  // Setup Test Tenants
  const tenantA = `test-tenant-A-${Date.now()}`;
  const tenantB = `test-tenant-B-${Date.now()}`;

  db.prepare(`
    INSERT INTO businesses (id, name, slug, status, created_at, updated_at)
    VALUES (?, 'Tenant A Store', ?, 'ACTIVE', datetime('now'), datetime('now'))
  `).run(tenantA, `slug-${tenantA}`);

  db.prepare(`
    INSERT INTO businesses (id, name, slug, status, created_at, updated_at)
    VALUES (?, 'Tenant B Store', ?, 'ACTIVE', datetime('now'), datetime('now'))
  `).run(tenantB, `slug-${tenantB}`);

  // Seed Product in Tenant A
  const prodA = `prod-a-${Date.now()}`;
  db.prepare(`
    INSERT INTO products (id, business_id, tenant_id, sku, name, price, stock, status, created_at, updated_at)
    VALUES (?, ?, ?, 'SKU-PANJABI', 'Cotton Panjabi', 45.00, 10, 'IN_STOCK', datetime('now'), datetime('now'))
  `).run(prodA, tenantA, tenantA);

  // --------------------------------------------------------------------------
  // TEST 1: High-Intent Lead Recognition (Bangla, Banglish, English)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 1: High-Intent Recognition ---");
  const banglaQuery = 'এই পাঞ্জাবিটার দাম কত? স্টকে আছে কি?';
  const res1 = await highIntentDetector.classifyMessage(banglaQuery);
  assert(res1.eligibleForRecovery === true, 'Bangla product & price query detected as eligible');
  assert(res1.intentScore >= 0.70, 'Bangla query has intent score >= 0.70');
  assert(res1.intentCategory === RECOVERY_INTENT_CATEGORIES.PRICE_INQUIRY || res1.intentCategory === RECOVERY_INTENT_CATEGORIES.PRODUCT_INQUIRY, 'Intent category correctly identified');

  const banglishQuery = 'Ami eta order korte chai. Delivery charge koto?';
  const res2 = await highIntentDetector.classifyMessage(banglishQuery);
  assert(res2.eligibleForRecovery === true, 'Banglish purchase intent query detected as eligible');
  assert(res2.intentCategory === RECOVERY_INTENT_CATEGORIES.PURCHASE_INTENT, 'Banglish purchase intent recognized');

  const englishQuery = 'Do you have size Large in stock? I want to buy one.';
  const res3 = await highIntentDetector.classifyMessage(englishQuery);
  assert(res3.eligibleForRecovery === true, 'English buying intent query detected as eligible');

  // --------------------------------------------------------------------------
  // TEST 2: Low-Intent Leads Ignored (Greetings, Complaints, Opt-Outs, Escalations)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: Low-Intent & Exclusions Ignored ---");
  const greeting = 'Hi, hello there!';
  const resGreeting = await highIntentDetector.classifyMessage(greeting);
  assert(resGreeting.eligibleForRecovery === false, 'Casual greeting ignored (not eligible for recovery)');
  assert(resGreeting.intentCategory === RECOVERY_INTENT_CATEGORIES.LOW_INTENT, 'Greeting classified as LOW_INTENT');

  const complaint = 'I received a damaged broken item! This is fraud.';
  const resComplaint = await highIntentDetector.classifyMessage(complaint);
  assert(resComplaint.eligibleForRecovery === false, 'Complaint ignored (not eligible for recovery)');

  const optout = 'STOP';
  const resOptout = await highIntentDetector.classifyMessage(optout);
  assert(resOptout.eligibleForRecovery === false, 'STOP / Opt-out command ignored');

  const escalation = 'Let me talk to a human agent please';
  const resEscalation = await highIntentDetector.classifyMessage(escalation);
  assert(resEscalation.eligibleForRecovery === false, 'Human escalation request ignored');

  // --------------------------------------------------------------------------
  // TEST 3: Settings Management & Quiet Hours
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: Settings & Quiet Hours ---");
  const settingsA = recoverySettingsService.getSettings(tenantA);
  assert(settingsA.enabled === false, 'New tenant recovery defaults to disabled (safety first)');
  assert(settingsA.dry_run === true, 'New tenant recovery defaults to dry-run = true');
  assert(settingsA.inactivity_minutes === 30, 'Default inactivity delay is 30 minutes');

  const updatedSettings = recoverySettingsService.updateSettings(tenantA, {
    enabled: true,
    dry_run: true,
    inactivity_minutes: 15,
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'Asia/Dhaka'
  });
  assert(updatedSettings.enabled === true, 'Tenant settings updated to enabled');
  assert(updatedSettings.inactivity_minutes === 15, 'Tenant inactivity delay updated');

  // Test quiet hours at 23:30 (should be quiet)
  const lateNight = new Date();
  lateNight.setHours(23, 30, 0, 0);
  // Test with local time calculation
  const isQuiet = recoverySettingsService.isQuietHour({
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'UTC'
  }, new Date('2026-10-22T23:30:00Z'));
  assert(isQuiet === true, 'Quiet hours active during late night (23:30 UTC)');

  const midday = recoverySettingsService.isQuietHour({
    quiet_hours_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    timezone: 'UTC'
  }, new Date('2026-10-22T14:30:00Z'));
  assert(midday === false, 'Quiet hours inactive during daytime (14:30 UTC)');

  // --------------------------------------------------------------------------
  // TEST 4: Candidate Creation, Inactivity Timer, Deduplication
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 4: Candidate Scheduling & Deduplication ---");
  const convId1 = `conv-test-1-${Date.now()}`;
  db.prepare(`
    INSERT INTO conversations (id, business_id, tenant_id, customer_name, channel, status, created_at, updated_at)
    VALUES (?, ?, ?, 'Rahim Ahmed', 'WHATSAPP', 'ACTIVE', datetime('now'), datetime('now'))
  `).run(convId1, tenantA, tenantA);

  const candidate1 = recoveryCandidateService.registerIntent({
    tenantId: tenantA,
    conversationId: convId1,
    channel: 'WHATSAPP',
    customerId: null,
    classification: res1,
    messageText: banglaQuery,
    messageTime: new Date().toISOString()
  });

  assert(candidate1 !== null, 'Candidate created successfully');
  assert(candidate1.stage === 'SCHEDULED', 'Candidate stage is SCHEDULED');
  assert(candidate1.intent_score === res1.intentScore, 'Intent score matches');

  // Duplicate intent on same conversation should update/refresh, not create duplicate row
  const candidate1Dup = recoveryCandidateService.registerIntent({
    tenantId: tenantA,
    conversationId: convId1,
    channel: 'WHATSAPP',
    customerId: null,
    classification: res2,
    messageText: banglishQuery,
    messageTime: new Date().toISOString()
  });
  assert(candidate1Dup.id === candidate1.id, 'Candidate updated without duplicate row creation');

  const candidatesCount = db.prepare('SELECT COUNT(*) as count FROM recovery_candidates WHERE conversation_id = ?').get(convId1).count;
  assert(candidatesCount === 1, 'Exactly one candidate exists for conversation');

  // --------------------------------------------------------------------------
  // TEST 5: Customer Reply Cancels Scheduled Recovery
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 5: Customer Reply Cancellation ---");
  const cancelledCount = recoveryCandidateService.cancelActiveCandidates(tenantA, convId1, 'CUSTOMER_REPLIED');
  assert(cancelledCount === 1, 'Active candidate cancelled upon customer reply');

  const refreshedCand1 = recoveryCandidateService.getById(tenantA, candidate1.id);
  assert(refreshedCand1.stage === 'CANCELLED', 'Candidate stage transitioned to CANCELLED');
  assert(refreshedCand1.cancel_reason === 'CUSTOMER_REPLIED', 'Cancel reason recorded as CUSTOMER_REPLIED');

  // --------------------------------------------------------------------------
  // TEST 6: Human Escalation / Needs Human Cancels Recovery
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 6: Human Escalation Cancellation ---");
  const convId2 = `conv-test-2-${Date.now()}`;
  db.prepare(`
    INSERT INTO conversations (id, business_id, tenant_id, customer_name, channel, status, created_at, updated_at)
    VALUES (?, ?, ?, 'Salma Begum', 'WHATSAPP', 'ACTIVE', datetime('now'), datetime('now'))
  `).run(convId2, tenantA, tenantA);

  const candidate2 = recoveryCandidateService.registerIntent({
    tenantId: tenantA,
    conversationId: convId2,
    channel: 'WHATSAPP',
    classification: res3,
    messageText: englishQuery,
    messageTime: new Date().toISOString()
  });
  assert(candidate2.stage === 'SCHEDULED', 'Candidate 2 scheduled');

  recoveryCandidateService.cancelActiveCandidates(tenantA, convId2, 'HUMAN_ESCALATION');
  const refreshedCand2 = recoveryCandidateService.getById(tenantA, candidate2.id);
  assert(refreshedCand2.stage === 'CANCELLED', 'Candidate cancelled on human escalation');

  // --------------------------------------------------------------------------
  // TEST 7: Meta Channel Policy (24h Window & Template Rules)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 7: Meta Channel Policy Evaluation ---");
  // A. WhatsApp within 24h
  const waPolicyInside24h = recoveryPolicyService.evaluate({
    tenantId: tenantA,
    channel: 'WHATSAPP',
    recipient: '+8801711223344',
    lastCustomerMessageAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    settings: updatedSettings
  });
  assert(waPolicyInside24h.allowed === true, 'WhatsApp within 24h is allowed');
  assert(waPolicyInside24h.messageMode === 'FREE_FORM', 'WhatsApp inside 24h uses FREE_FORM mode');

  // B. WhatsApp outside 24h requires approved marketing template
  const waPolicyOutside24h = recoveryPolicyService.evaluate({
    tenantId: tenantA,
    channel: 'WHATSAPP',
    recipient: '+8801711223344',
    lastCustomerMessageAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), // 26 hours ago
    settings: updatedSettings
  });
  assert(waPolicyOutside24h.allowed === true, 'WhatsApp outside 24h permitted with template');
  assert(waPolicyOutside24h.messageMode === 'TEMPLATE', 'WhatsApp outside 24h enforces TEMPLATE mode');
  assert(waPolicyOutside24h.templateRequirement !== null, 'Template requirement specified for outside 24h');

  // C. Messenger outside 24h (Meta standard messaging policy strictly prohibits proactive promotional messages)
  const messengerOutside24h = recoveryPolicyService.evaluate({
    tenantId: tenantA,
    channel: 'MESSENGER',
    recipient: 'fb-user-12345',
    lastCustomerMessageAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    settings: updatedSettings
  });
  assert(messengerOutside24h.allowed === false, 'Messenger outside 24h is BLOCKED for proactive sales follow-up');
  assert(messengerOutside24h.messageMode === 'BLOCKED', 'Messenger messageMode is BLOCKED');

  // D. Instagram outside 24h (Meta Instagram policy blocks proactive marketing DMs)
  const igOutside24h = recoveryPolicyService.evaluate({
    tenantId: tenantA,
    channel: 'INSTAGRAM',
    recipient: 'ig-user-67890',
    lastCustomerMessageAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    settings: updatedSettings
  });
  assert(igOutside24h.allowed === false, 'Instagram outside 24h is BLOCKED for proactive sales follow-up');

  // E. Recipient opt-out tag blocks sending
  const optOutCustomer = { tags: JSON.stringify(['optout']) };
  const optOutPolicy = recoveryPolicyService.evaluate({
    tenantId: tenantA,
    channel: 'WHATSAPP',
    recipient: '+8801711223344',
    lastCustomerMessageAt: new Date().toISOString(),
    settings: updatedSettings,
    customer: optOutCustomer
  });
  assert(optOutPolicy.allowed === false, 'Customer with opt-out tag is BLOCKED');
  assert(optOutPolicy.reason === 'RECIPIENT_OPTED_OUT', 'Opt-out reason recorded');

  // --------------------------------------------------------------------------
  // TEST 8: AI Composer Grounding & Price Hallucination Prevention
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 8: AI Grounding & Anti-Hallucination ---");
  const testCand3 = {
    id: 'cand-test-3',
    tenant_id: tenantA,
    intent_category: 'PRICE_INQUIRY',
    product_identifiers: ['Cotton Panjabi'],
    detected_language: 'bn',
    last_customer_message_text: 'পাঞ্জাবিটার দাম কত?'
  };

  const composition = await recoveryAiComposer.composeMessage({
    tenantId: tenantA,
    candidate: testCand3,
    settings: updatedSettings
  });
  assert(composition.messageText && composition.messageText.length > 10, 'Recovery message composed');
  assert(composition.messageText.includes('$45.00') || composition.messageText.includes('Cotton Panjabi'), 'Message grounded in actual product catalog');

  // Safety Validator: Check price hallucination detection
  const safeValidation = recoveryAiComposer.validateMessageSafety('Your item is available at $45.00.', { price: 45.00 }, updatedSettings);
  assert(safeValidation.valid === true, 'Matching price passes safety validation');

  const hallucinatedValidation = recoveryAiComposer.validateMessageSafety('Your item is available for only $10.00!', { price: 45.00 }, updatedSettings);
  assert(hallucinatedValidation.valid === false, 'Price hallucination rejected by safety validator');

  const spamValidation = recoveryAiComposer.validateMessageSafety('HURRY UP! BUY NOW OR CRY! LAST CHANCE EVER!', { price: 45.00 }, updatedSettings);
  assert(spamValidation.valid === false, 'Aggressive marketing spam rejected by safety validator');

  // --------------------------------------------------------------------------
  // TEST 9: Dry-Run Simulation Delivery (Safe Mode)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 9: Dry-Run Safe Execution ---");
  const custId4 = `cust-test-4-${Date.now()}`;
  db.prepare(`
    INSERT INTO customers (id, business_id, tenant_id, full_name, phone, created_at, updated_at)
    VALUES (?, ?, ?, 'Kamal Hossain', '+8801799887766', datetime('now'), datetime('now'))
  `).run(custId4, tenantA, tenantA);

  const convId4 = `conv-test-4-${Date.now()}`;
  db.prepare(`
    INSERT INTO conversations (id, business_id, tenant_id, customer_id, customer_name, channel, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'Kamal Hossain', 'WHATSAPP', 'ACTIVE', datetime('now'), datetime('now'))
  `).run(convId4, tenantA, tenantA, custId4);

  const candidate4 = recoveryCandidateService.registerIntent({
    tenantId: tenantA,
    conversationId: convId4,
    channel: 'WHATSAPP',
    customerId: custId4,
    classification: res1,
    messageText: banglaQuery,
    messageTime: new Date(Date.now() - 3600 * 1000).toISOString()
  });

  const dispatchResult = await recoveryDeliveryService.dispatch({
    tenantId: tenantA,
    candidate: candidate4,
    messageText: 'Test recovery message in dry run mode',
    composition: { model: 'test-model', promptTokens: 50, completionTokens: 20, latencyMs: 120, costEstimate: 0.0001 }
  });

  assert(dispatchResult.success === true, 'Dry-run dispatch succeeded');
  assert(dispatchResult.simulated === true, 'Dispatched in simulation mode without external send');
  assert(dispatchResult.outcome === 'SIMULATED_DRY_RUN', 'Outcome recorded as SIMULATED_DRY_RUN');

  const attemptRow = db.prepare('SELECT * FROM recovery_attempts WHERE id = ?').get(dispatchResult.attemptId);
  assert(attemptRow.outcome === 'SIMULATED_DRY_RUN', 'Attempt recorded in database as SIMULATED_DRY_RUN');
  assert(attemptRow.message_hash.length > 0, 'Message hash computed and recorded');

  // --------------------------------------------------------------------------
  // TEST 10: Order Attribution & Double Attribution Prevention
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 10: Order Attribution ---");
  const orderId1 = `ORD-REC-${Date.now()}`;

  // Insert real confirmed order into orders table to satisfy foreign key
  db.prepare(`
    INSERT INTO orders (id, business_id, customer_id, customer_name, customer_phone, status, subtotal, total, created_at, updated_at)
    VALUES (?, ?, ?, 'Kamal Hossain', '+8801799887766', 'CONFIRMED', 90.00, 90.00, datetime('now'), datetime('now'))
  `).run(orderId1, tenantA, custId4);

  const attr1 = recoveryAttributionService.attributeOrder({
    tenantId: tenantA,
    orderId: orderId1,
    orderValue: 90.00,
    currency: 'USD',
    customerId: custId4,
    customerPhone: '+8801799887766'
  });

  assert(attr1 !== null, 'Order attributed to candidate');
  assert(attr1.order_value === 90.00, 'Exact order value recorded');
  assert(attr1.candidate_id === candidate4.id, 'Attributed to correct candidate');

  const candidate4AfterOrder = recoveryCandidateService.getById(tenantA, candidate4.id);
  assert(candidate4AfterOrder.stage === 'CONVERTED', 'Candidate stage updated to CONVERTED');

  // Repeat order attribution attempt should not duplicate
  const attr1Repeat = recoveryAttributionService.attributeOrder({
    tenantId: tenantA,
    orderId: orderId1,
    orderValue: 90.00,
    currency: 'USD',
    customerId: custId4,
    customerPhone: '+8801799887766'
  });
  assert(attr1Repeat.id === attr1.id, 'Double attribution prevented (returns existing attribution)');

  const totalAttrCount = db.prepare('SELECT COUNT(*) as count FROM recovery_attributions WHERE order_id = ?').get(orderId1).count;
  assert(totalAttrCount === 1, 'Only 1 attribution record exists for order');

  // --------------------------------------------------------------------------
  // TEST 11: Multi-Tenant Data Isolation
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 11: Multi-Tenant Isolation ---");
  // Tenant B cannot see Tenant A's candidate
  const crossTenantCand = recoveryCandidateService.getById(tenantB, candidate4.id);
  assert(crossTenantCand === null, 'Tenant B cannot query Tenant A candidate');

  // Tenant B query list returns 0 for Tenant A's candidates
  const tenantBList = recoveryCandidateService.queryCandidates(tenantB);
  assert(tenantBList.total === 0, 'Tenant B candidate list is isolated (0 results)');

  // Tenant B cannot cancel Tenant A's candidate
  const cancelFromB = recoveryCandidateService.cancelActiveCandidates(tenantB, convId4, 'ATTEMPTED_CROSS_CANCEL');
  assert(cancelFromB === 0, 'Cross-tenant cancellation rejected (0 cancelled)');

  // --------------------------------------------------------------------------
  // TEST 12: Holdout Control Group
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 12: Holdout Control Group ---");
  const convIdControl = `conv-control-${Date.now()}`;
  db.prepare(`
    INSERT INTO conversations (id, business_id, tenant_id, customer_name, channel, status, created_at, updated_at)
    VALUES (?, ?, ?, 'Control Shopper', 'WHATSAPP', 'ACTIVE', datetime('now'), datetime('now'))
  `).run(convIdControl, tenantA, tenantA);

  const candControl = recoveryCandidateService.registerIntent({
    tenantId: tenantA,
    conversationId: convIdControl,
    channel: 'WHATSAPP',
    classification: res1,
    messageText: banglaQuery,
    messageTime: new Date(Date.now() - 3600 * 1000).toISOString()
  });

  // Temporarily disable quiet hours to test control group execution directly
  recoverySettingsService.updateSettings(tenantA, { quiet_hours_enabled: false });

  // Force control group flag
  db.prepare("UPDATE recovery_candidates SET is_control_group = 1, eligible_at = datetime('now') WHERE id = ?").run(candControl.id);
  const refreshedControl = db.prepare('SELECT * FROM recovery_candidates WHERE id = ?').get(candControl.id);

  const controlResult = await recoverySchedulerService.processCandidate(refreshedControl);
  assert(controlResult.controlGroup === true, 'Holdout control candidate processed without message dispatch');

  const controlAttempts = db.prepare('SELECT COUNT(*) as count FROM recovery_attempts WHERE candidate_id = ?').get(candControl.id).count;
  assert(controlAttempts === 0, 'Zero messages sent to control group');

  // --------------------------------------------------------------------------
  // TEST 13: Overview Metrics Calculation
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 13: Overview Metrics ---");
  const metricsA = recoveryAttributionService.getOverviewMetrics(tenantA);
  assert(metricsA.totalCandidates >= 3, 'Overview reports total candidate leads');
  assert(metricsA.attributedRevenue >= 90.00, 'Overview reports attributed revenue');
  assert(metricsA.attributedOrders >= 1, 'Overview reports attributed orders');

  console.log("\n============================================================");
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`Smart Sales Recovery Test Results: ${passed} Passed, ${failed} Failed`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution crashed:", err);
  process.exit(1);
});
