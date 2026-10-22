import assert from 'node:assert/strict';
import { getDatabase, ensureBillingData, ensureCreditWallet } from '../src/server/config/database.js';
import { creditWalletService } from '../src/server/services/billing/creditWalletService.js';
import { billingController } from '../src/server/controllers/billingController.js';
import { PLAN_CONFIG } from '../src/server/services/billing/planConfig.js';

console.log('--- STARTING BILLING REDESIGN VERIFICATION ---');

const db = getDatabase();
const testTenantA = `test-billing-tenantA-${Date.now()}`;
const testTenantB = `test-billing-tenantB-${Date.now()}`;

// Setup mock request and response helpers
function createMockReqRes(tenantId, body = {}) {
  const req = {
    businessId: tenantId,
    headers: { 'x-workspace-id': tenantId },
    user: { business_id: tenantId, role: 'owner' },
    body
  };

  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };

  const next = (err) => {
    if (err) throw err;
  };

  return { req, res, next };
}

// 1. Seed two test businesses for tenant isolation
const now = new Date().toISOString();
db.prepare(`
  INSERT INTO businesses (id, name, slug, plan, status, created_at, updated_at)
  VALUES (?, 'Tenant A Boutique', ?, 'Growth', 'active', ?, ?),
         (?, 'Tenant B Crafts', ?, 'Starter', 'active', ?, ?)
`).run(testTenantA, `slug-${testTenantA}`, now, now, testTenantB, `slug-${testTenantB}`, now, now);

// Seed 3 conversations for Tenant A, and 1 for Tenant B
db.prepare(`
  INSERT INTO conversations (id, business_id, tenant_id, customer_name, channel, status, created_at, updated_at)
  VALUES (?, ?, ?, 'Shopper 1', 'WHATSAPP', 'ACTIVE', ?, ?),
         (?, ?, ?, 'Shopper 2', 'MESSENGER', 'ACTIVE', ?, ?),
         (?, ?, ?, 'Shopper 3', 'INSTAGRAM', 'ACTIVE', ?, ?)
`).run(
  `conv-a-1-${Date.now()}`, testTenantA, testTenantA, now, now,
  `conv-a-2-${Date.now()}`, testTenantA, testTenantA, now, now,
  `conv-a-3-${Date.now()}`, testTenantA, testTenantA, now, now
);

db.prepare(`
  INSERT INTO conversations (id, business_id, tenant_id, customer_name, channel, status, created_at, updated_at)
  VALUES (?, ?, ?, 'Shopper B1', 'WHATSAPP', 'ACTIVE', ?, ?)
`).run(`conv-b-1-${Date.now()}`, testTenantB, testTenantB, now, now);

// Seed subscription for Tenant A (Growth Plan, $119)
ensureCreditWallet(db, testTenantA);
ensureBillingData(db, testTenantA);

// Seed subscription for Tenant B (Starter Plan, $49)
ensureCreditWallet(db, testTenantB);
creditWalletService.upgradeSubscription(testTenantB, 'starter', 'MONTHLY', 'BKASH');

// TEST 1: Verify getDetails returns exactly the 4 Sections with correct data
console.log('\n[TEST 1] Verifying getDetails returns 4 sections with accurate quota & masking...');
const { req: req1, res: res1, next: next1 } = createMockReqRes(testTenantA);
await billingController.getDetails(req1, res1, next1);

assert.strictEqual(res1.statusCode, 200, 'Status should be 200');
const detailsA = res1.data.data;

// Section 1: Your Plan
assert.ok(detailsA.plan, 'Section 1 (plan) must exist');
assert.strictEqual(detailsA.plan.name, 'Growth Plan', 'Plan name should be Growth Plan');
assert.strictEqual(detailsA.plan.status, 'Active', 'Plan status should be Active');
assert.strictEqual(detailsA.plan.amount, 119, 'Amount should be 119');
assert.strictEqual(detailsA.plan.currency, 'USD', 'Currency should be USD');
assert.strictEqual(detailsA.plan.formattedPrice, '$119 / month', 'Formatted price should be $119 / month');
assert.ok(detailsA.plan.nextPayment, 'Next payment date must be provided');
console.log('✓ Section 1 (Your Plan) validated:', detailsA.plan);

// Section 2: Monthly AI Conversations
assert.ok(detailsA.conversations, 'Section 2 (conversations) must exist');
assert.strictEqual(detailsA.conversations.used, 3, 'Used conversations should be 3');
assert.strictEqual(detailsA.conversations.limit, 5000, 'Growth plan conversation limit should be 5000');
assert.strictEqual(detailsA.conversations.remaining, 4997, 'Remaining conversations should be 4997');
assert.ok(detailsA.conversations.resetDate, 'Reset date should be provided');
console.log('✓ Section 2 (Monthly AI Conversations) validated:', detailsA.conversations);

// Section 3: Payment Method
assert.ok(detailsA.paymentMethod, 'Section 3 (paymentMethod) must exist');
assert.strictEqual(detailsA.paymentMethod.provider, 'bKash', 'Provider should be bKash');
assert.strictEqual(detailsA.paymentMethod.accountNumber, '016****2804', 'Sender account must be masked');
assert.strictEqual(detailsA.paymentMethod.verificationStatus, 'Confirmed', 'Verification status should be Confirmed');
console.log('✓ Section 3 (Payment Method) validated:', detailsA.paymentMethod);

// Section 4: Payment History
assert.ok(Array.isArray(detailsA.invoices), 'Section 4 (invoices) must be an array');
assert.ok(detailsA.invoices.length >= 1, 'Invoices should contain at least 1 record');
assert.strictEqual(detailsA.invoices[0].status, 'Confirmed', 'Invoice status should be Confirmed');
assert.ok(detailsA.invoices[0].date, 'Invoice date must exist');
assert.ok(detailsA.invoices[0].amount, 'Invoice amount must exist');
console.log('✓ Section 4 (Payment History) validated:', detailsA.invoices[0]);

// TEST 2: Strict Tenant Isolation
console.log('\n[TEST 2] Verifying strict tenant isolation...');
const { req: req2, res: res2, next: next2 } = createMockReqRes(testTenantB);
await billingController.getDetails(req2, res2, next2);
const detailsB = res2.data.data;

assert.strictEqual(detailsB.plan.name, 'Starter Plan', 'Tenant B should be Starter Plan');
assert.strictEqual(detailsB.conversations.used, 1, 'Tenant B should have used 1 conversation');
assert.strictEqual(detailsB.conversations.limit, 1000, 'Starter plan limit should be 1000');
assert.strictEqual(detailsB.conversations.remaining, 999, 'Remaining should be 999');
console.log('✓ Strict Tenant Isolation verified between Tenant A and Tenant B');

// TEST 3: Change Plan Functionality
console.log('\n[TEST 3] Testing Change Plan functionality...');
const { req: req3, res: res3, next: next3 } = createMockReqRes(testTenantA, {
  planId: 'scale',
  billingCycle: 'MONTHLY',
  provider: 'BKASH'
});
await billingController.changePlan(req3, res3, next3);
assert.strictEqual(res3.statusCode, 200, 'Change plan should return 200');

// Verify updated plan in getDetails
const { req: req3Check, res: res3Check, next: next3Check } = createMockReqRes(testTenantA);
await billingController.getDetails(req3Check, res3Check, next3Check);
const updatedDetailsA = res3Check.data.data;
assert.strictEqual(updatedDetailsA.plan.name, 'Scale Plan', 'Tenant A plan should now be Scale Plan');
assert.strictEqual(updatedDetailsA.conversations.limit, 25000, 'Scale plan limit should be 25,000');
console.log('✓ Change Plan verified: Upgraded to Scale Plan with 25,000 quota');

// TEST 4: Submit Payment & Invoice Generation
console.log('\n[TEST 4] Testing Submit Payment functionality with new invoice generation...');
const { req: req4, res: res4, next: next4 } = createMockReqRes(testTenantA, {
  planId: 'growth',
  provider: 'Nagad',
  senderNumber: '01899123456',
  trxId: 'NGD987654321',
  screenshotUrl: 'data:image/png;base64,mockPaymentProof'
});
await billingController.submitPayment(req4, res4, next4);
assert.strictEqual(res4.statusCode, 200, 'Submit payment should return 200');

const { req: req4Check, res: res4Check, next: next4Check } = createMockReqRes(testTenantA);
await billingController.getDetails(req4Check, res4Check, next4Check);
const postPaymentDetails = res4Check.data.data;
assert.strictEqual(postPaymentDetails.paymentMethod.provider, 'Nagad', 'Provider should be updated to Nagad');
assert.strictEqual(postPaymentDetails.paymentMethod.accountNumber, '018****3456', 'Sender number should be masked 018****3456');
assert.strictEqual(postPaymentDetails.invoices[0].trxId, 'NGD987654321', 'Latest invoice TrxID should match');
assert.strictEqual(postPaymentDetails.invoices[0].status, 'Confirmed', 'Invoice status should be Confirmed');
console.log('✓ Submit payment verified: generated invoice and updated payment method');

// TEST 5: Cancel Plan Functionality
console.log('\n[TEST 5] Testing Cancel Plan functionality...');
const { req: req5, res: res5, next: next5 } = createMockReqRes(testTenantA);
await billingController.cancelPlan(req5, res5, next5);
assert.strictEqual(res5.statusCode, 200, 'Cancel plan should return 200');

const { req: req5Check, res: res5Check, next: next5Check } = createMockReqRes(testTenantA);
await billingController.getDetails(req5Check, res5Check, next5Check);
const cancelledDetails = res5Check.data.data;
assert.strictEqual(cancelledDetails.plan.status, 'Inactive', 'Plan status should be Inactive');
console.log('✓ Cancel plan verified: subscription status updated to Inactive');

console.log('\n======================================================');
console.log('ALL BILLING REDESIGN VERIFICATION TESTS PASSED (5/5)!');
console.log('======================================================');
process.exit(0);
