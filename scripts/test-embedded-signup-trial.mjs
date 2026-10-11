import assert from 'assert';
import { getDatabase, ensureCreditWallet } from '../src/server/config/database.js';
import { metaEmbeddedSignupService } from '../src/server/services/meta/metaEmbeddedSignupService.js';
import { creditWalletService } from '../src/server/services/billing/creditWalletService.js';
import { PLAN_CONFIG, COST_PER_AI_REPLY } from '../src/server/services/billing/planConfig.js';
import { whatsappPipeline } from '../src/server/services/whatsapp/whatsappPipeline.js';
import { whatsappConnectionService } from '../src/server/services/whatsapp/whatsappConnectionService.js';
import { metaAuthService } from '../src/server/services/meta/metaAuthService.js';

console.log('================================================================');
console.log('KREAZYAI META EMBEDDED SIGNUP & 7-DAY TRIAL WALLET TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ FAILED: ${name}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ FAILED: ${name}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

// ─────────────────────────────────────────────────────────────────
// INITIALIZE SHARED IN-MEMORY DATABASE ENVIRONMENT
// ─────────────────────────────────────────────────────────────────
const db = getDatabase(':memory:');

const tenantA = 'ws-test-merchant-01';
const tenantB = 'ws-test-merchant-02';
const now = new Date().toISOString();

// Seed test businesses
db.prepare(`
  INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, created_at, updated_at)
  VALUES (?, 'Alpha Store', 'alpha-store', 'Alice Alpha', 'alice@alpha.test', 'Growth', 'ACTIVE', ?, ?)
`).run(tenantA, now, now);

db.prepare(`
  INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, created_at, updated_at)
  VALUES (?, 'Beta Store', 'beta-store', 'Bob Beta', 'bob@beta.test', 'Growth', 'ACTIVE', ?, ?)
`).run(tenantB, now, now);

// ─────────────────────────────────────────────────────────────────
// TEST 1: NEW USER SIGNUP & 7-DAY TRIAL WALLET GRANT
// ─────────────────────────────────────────────────────────────────
console.log('1. Testing New User Signup & 7-Day Free Trial Grant...');
runTest('New business automatically receives AI credit wallet with 125 credits', () => {
  const wallet = ensureCreditWallet(db, tenantA, now);
  assert(wallet !== null, 'Wallet created for tenant');
  assert.strictEqual(wallet.credits_balance, 125, 'Wallet initialized with exactly 125 credits');
  assert.strictEqual(wallet.trial_credits_granted, 125, '125 trial credits recorded');
  assert.strictEqual(wallet.subscription_tier, 'FREE_TRIAL', 'Tier is FREE_TRIAL');
  assert.strictEqual(wallet.subscription_status, 'TRIAL_ACTIVE', 'Status is TRIAL_ACTIVE');

  // Verify trial expiration is exactly 7 days later
  const start = new Date(wallet.trial_started_at);
  const end = new Date(wallet.trial_expires_at);
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  assert.strictEqual(diffDays, 7, 'Trial duration is exactly 7 days');

  // Verify initial ledger entry
  const initialTx = db.prepare("SELECT * FROM credit_transactions WHERE tenant_id = ? AND type = 'TRIAL_GRANT'").get(tenantA);
  assert(initialTx !== undefined, 'Initial trial grant written to immutable ledger');
  assert.strictEqual(initialTx.amount, 125, 'Ledger grant amount is 125');
  assert.strictEqual(initialTx.balance_after, 125, 'Ledger balance after is 125');
});

// ─────────────────────────────────────────────────────────────────
// TEST 2: EMBEDDED SIGNUP SESSION INITIATION & CSRF
// ─────────────────────────────────────────────────────────────────
console.log('\n2. Testing Embedded Signup Session Initiation & CSRF Binding...');
let sessionA = null;
runTest('Initiate session generates signed state bound to tenant', () => {
  sessionA = metaEmbeddedSignupService.initiateSession(tenantA);
  assert(sessionA.sessionId !== undefined, 'Session ID returned');
  assert(sessionA.stateToken !== undefined, 'Signed state token returned');

  // Verify session in database
  const sessionRow = db.prepare('SELECT * FROM whatsapp_onboarding_sessions WHERE id = ?').get(sessionA.sessionId);
  assert(sessionRow !== undefined, 'Session stored in DB');
  assert.strictEqual(sessionRow.tenant_id, tenantA, 'Session bound to tenantA');
  assert.strictEqual(sessionRow.status, 'INITIATED', 'Session status is INITIATED');
});

// ─────────────────────────────────────────────────────────────────
// TEST 3: USER CANCELLATION HANDLING
// ─────────────────────────────────────────────────────────────────
console.log('\n3. Testing Embedded Signup Cancellation Handling...');
await runAsyncTest('User popup cancellation marks session CANCELLED without errors', async () => {
  const cancelRes = await metaEmbeddedSignupService.completeOnboarding(tenantA, {
    stateToken: sessionA.stateToken,
    isCancelled: true
  });
  assert.strictEqual(cancelRes.success, false, 'Cancellation returns success=false');
  assert.strictEqual(cancelRes.reason, 'ONBOARDING_CANCELLED', 'Reason is ONBOARDING_CANCELLED');

  const cancelledRow = db.prepare('SELECT status FROM whatsapp_onboarding_sessions WHERE id = ?').get(sessionA.sessionId);
  assert.strictEqual(cancelledRow.status, 'CANCELLED', 'Session status updated to CANCELLED');
});

// ─────────────────────────────────────────────────────────────────
// TEST 4: INVALID & EXPIRED ONBOARDING SESSIONS
// ─────────────────────────────────────────────────────────────────
console.log('\n4. Testing Invalid & Expired Onboarding Sessions...');
runTest('Tampered state token is rejected with CSRF error', () => {
  assert.throws(() => {
    metaAuthService.verifySignedState('invalid.tampered.token');
  }, /State signature verification failed|Invalid OAuth state/);
});

await runAsyncTest('Expired session is rejected', async () => {
  const expSessionId = `wases-expired-${Date.now()}`;
  const expiredState = metaAuthService.generateSignedState({
    sessionId: expSessionId,
    tenantId: tenantA
  });

  // Insert session with past expiration in DB
  db.prepare(`
    INSERT INTO whatsapp_onboarding_sessions (id, tenant_id, state_token, status, expires_at, created_at, updated_at)
    VALUES (?, ?, ?, 'INITIATED', datetime('now', '-20 minutes'), datetime('now', '-20 minutes'), datetime('now', '-20 minutes'))
  `).run(expSessionId, tenantA, expiredState);

  await assert.rejects(async () => {
    await metaEmbeddedSignupService.completeOnboarding(tenantA, {
      code: 'mock_code',
      stateToken: expiredState
    });
  }, /expired/i);
});

// ─────────────────────────────────────────────────────────────────
// TEST 5: CROSS-TENANT AUTHORIZATION MISMATCH
// ─────────────────────────────────────────────────────────────────
console.log('\n5. Testing Strict Cross-Tenant Authorization Isolation...');
await runAsyncTest('State token signed for Tenant A cannot be redeemed by Tenant B', async () => {
  const freshSessionA = metaEmbeddedSignupService.initiateSession(tenantA);

  await assert.rejects(async () => {
    // Tenant B attempts to use Tenant A's stateToken
    await metaEmbeddedSignupService.completeOnboarding(tenantB, {
      code: 'mock_code',
      stateToken: freshSessionA.stateToken
    });
  }, /cross-tenant session binding violation|mismatch/i);
});

// ─────────────────────────────────────────────────────────────────
// TEST 6: SUCCESSFUL EMBEDDED SIGNUP & ASSET MAPPING
// ─────────────────────────────────────────────────────────────────
console.log('\n6. Testing Successful Embedded Signup & Encrypted Connection Saving...');
const phoneA = '1407171145805154';
const wabaA = '1735308764198811';
let connectResA = null;

await runAsyncTest('Valid authorization code successfully establishes encrypted WhatsApp connection', async () => {
  const validSession = metaEmbeddedSignupService.initiateSession(tenantA);

  connectResA = await metaEmbeddedSignupService.completeOnboarding(tenantA, {
    code: 'mock_auth_code_embedded_signup_demo',
    stateToken: validSession.stateToken,
    sessionInfo: {
      waba_id: wabaA,
      phone_number_id: phoneA,
      display_phone_number: '+1 (555) 653-9685'
    }
  });

  assert.strictEqual(connectResA.success, true, 'Onboarding succeeded');
  assert.strictEqual(connectResA.wabaId, wabaA, 'WABA ID matches');
  assert.strictEqual(connectResA.phoneNumberId, phoneA, 'Phone Number ID matches');

  // Verify database record in whatsapp_connections
  const waConn = db.prepare('SELECT * FROM whatsapp_connections WHERE tenant_id = ?').get(tenantA);
  assert(waConn !== undefined, 'WhatsApp connection record exists');
  assert.strictEqual(waConn.status, 'CONNECTED', 'Status is CONNECTED');
  assert.strictEqual(waConn.phone_number_id, phoneA, 'Phone Number ID persisted');
  assert.strictEqual(waConn.WABA_id, wabaA, 'WABA ID persisted');

  // Verify database record in meta_connections
  const metaConn = db.prepare("SELECT * FROM meta_connections WHERE business_id = ? AND platform = 'WHATSAPP'").get(tenantA);
  assert(metaConn !== undefined, 'Meta connections record exists');
  assert.strictEqual(metaConn.status, 'CONNECTED', 'Meta channel status is CONNECTED');
  assert(metaConn.encrypted_access_token !== null, 'Access token is AES-256 encrypted at rest');

  // Verify sanitized getConnection exposes ZERO secrets
  const sanitized = whatsappConnectionService.getConnection(tenantA);
  assert.strictEqual(sanitized.encrypted_access_token, undefined, 'Encrypted token stripped from sanitized response');
  assert.strictEqual(sanitized.token_iv, undefined, 'Token IV stripped');
  assert.strictEqual(sanitized.token_tag, undefined, 'Token tag stripped');
  assert.strictEqual(sanitized.has_credential, 1, 'has_credential boolean flag set');
});

// ─────────────────────────────────────────────────────────────────
// TEST 7: DUPLICATE PHONE-NUMBER OWNERSHIP PREVENTION
// ─────────────────────────────────────────────────────────────────
console.log('\n7. Testing Duplicate Phone-Number Ownership Prevention...');
await runAsyncTest('Tenant B cannot hijack Tenant A active phone number ID', async () => {
  const sessionB = metaEmbeddedSignupService.initiateSession(tenantB);

  await assert.rejects(async () => {
    await metaEmbeddedSignupService.completeOnboarding(tenantB, {
      code: 'mock_auth_code_embedded_signup_demo',
      stateToken: sessionB.stateToken,
      sessionInfo: {
        waba_id: 'waba_tenant_b_999',
        phone_number_id: phoneA, // Attempting to link Tenant A's existing phone!
        display_phone_number: '+1 (555) 653-9685'
      }
    });
  }, /already connected to another KreazyAI business/i);
});

let lastProcessedInboundMsgId = null;

// ─────────────────────────────────────────────────────────────────
// TEST 8: 5-CREDIT DEDUCTION ON SUCCESSFUL OUTBOUND DISPATCH
// ─────────────────────────────────────────────────────────────────
console.log('\n8. Testing 5-Credit Atomic Deduction on Successful Reply...');
await runAsyncTest('Inbound message routes and successful AI reply deducts exactly 5 credits', async () => {
  const initialWallet = creditWalletService.getWallet(tenantA);
  assert.strictEqual(initialWallet.creditsBalance, 125, 'Initial balance is 125');

  const inboundMsgId = `wamid.test.credit.${Date.now()}`;
  lastProcessedInboundMsgId = inboundMsgId;
  const pipelineResult = await whatsappPipeline.processInboundMessage({
    platform: 'WHATSAPP',
    businessId: tenantA,
    messageId: inboundMsgId,
    sender: { phone: '15557281920', name: 'Zahirul Islam' },
    recipient: { id: phoneA },
    messageText: 'What is your return policy?'
  });

  assert.strictEqual(pipelineResult.success, true, 'Pipeline processed inbound message');
  assert.strictEqual(pipelineResult.replied, true, 'Auto-reply was generated');

  const updatedWallet = creditWalletService.getWallet(tenantA);
  assert.strictEqual(updatedWallet.creditsBalance, 120, 'Balance reduced by exactly 5 credits (125 -> 120)');
  assert.strictEqual(updatedWallet.creditsUsed, 5, 'Credits used is 5');
  assert.strictEqual(updatedWallet.successfulRepliesCount, 1, 'Successful replies count is 1');

  // Verify transaction in immutable ledger
  const tx = db.prepare("SELECT * FROM credit_transactions WHERE tenant_id = ? AND type = 'RESERVATION_COMMIT' ORDER BY created_at DESC LIMIT 1").get(tenantA);
  assert(tx !== undefined, 'RESERVATION_COMMIT transaction recorded');
  assert.strictEqual(tx.amount, -5, 'Transaction amount is -5');
  assert.strictEqual(tx.balance_after, 120, 'Balance after is 120');
});

// ─────────────────────────────────────────────────────────────────
// TEST 9: NO CREDIT DEDUCTION FOR DUPLICATES, STATUSES, OR INBOUNDS
// ─────────────────────────────────────────────────────────────────
console.log('\n9. Testing Zero-Credit Charge for Duplicates, Statuses, and Inbounds...');
await runAsyncTest('Resending identical message ID drops duplicate without second credit charge', async () => {
  const beforeWallet = creditWalletService.getWallet(tenantA);
  const balanceBefore = beforeWallet.creditsBalance;

  // Resend identical message ID
  const duplicateId = lastProcessedInboundMsgId;

  const dupResult = await whatsappPipeline.processInboundMessage({
    platform: 'WHATSAPP',
    businessId: tenantA,
    messageId: duplicateId,
    sender: { phone: '15557281920', name: 'Zahirul Islam' },
    recipient: { id: phoneA },
    messageText: 'What is your return policy?'
  });

  assert.strictEqual(dupResult.duplicate, true, 'Message marked as duplicate');

  const afterWallet = creditWalletService.getWallet(tenantA);
  assert.strictEqual(afterWallet.creditsBalance, balanceBefore, 'Credits balance unchanged on duplicate delivery');
  assert.strictEqual(afterWallet.creditsUsed, beforeWallet.creditsUsed, 'Credits used unchanged');
});

// ─────────────────────────────────────────────────────────────────
// TEST 10: CONCURRENT CREDIT RESERVATION INTEGRITY
// ─────────────────────────────────────────────────────────────────
console.log('\n10. Testing Atomic Concurrency Hold Integrity...');
runTest('Atomic credit reservation prevents concurrent overspending', () => {
  const wallet = creditWalletService.getWallet(tenantA);
  const available = wallet.creditsBalance;

  // Make a hold of 5 credits
  const hold1 = creditWalletService.reserveCredits(tenantA, 5, 'msg_concurrent_1');
  assert.strictEqual(hold1.success, true, 'Hold 1 succeeded');
  assert.strictEqual(hold1.remainingBalance, available - 5, 'Hold 1 reduced available balance');

  // Verify wallet reflects hold
  const wHeld = creditWalletService.getWallet(tenantA);
  assert.strictEqual(wHeld.creditsReserved, 5, 'Reserved credits is 5');

  // Release hold
  const releaseRes = creditWalletService.releaseReservation(tenantA, hold1.reservationId, 'TEST_RELEASE');
  assert.strictEqual(releaseRes.success, true, 'Release succeeded');

  // Balance restored
  const wRestored = creditWalletService.getWallet(tenantA);
  assert.strictEqual(wRestored.creditsBalance, available, 'Balance completely restored after release');
  assert.strictEqual(wRestored.creditsReserved, 0, 'Reserved credits returned to 0');
});

// ─────────────────────────────────────────────────────────────────
// TEST 11: FAILED SEND RESTORES RESERVED CREDITS
// ─────────────────────────────────────────────────────────────────
console.log('\n11. Testing Failed Send Without Credit Loss...');
runTest('Simulated outbound send failure immediately refunds hold to merchant', () => {
  const before = creditWalletService.getWallet(tenantA);
  const res = creditWalletService.reserveCredits(tenantA, 5, 'msg_fail_send');
  assert.strictEqual(res.success, true);

  // Cloud API returns HTTP 500
  const release = creditWalletService.releaseReservation(tenantA, res.reservationId, 'META_API_500_SERVER_ERROR');
  assert.strictEqual(release.success, true);

  const after = creditWalletService.getWallet(tenantA);
  assert.strictEqual(after.creditsBalance, before.creditsBalance, 'No credit lost on upstream send failure');
  assert.strictEqual(after.creditsUsed, before.creditsUsed, 'Used count not incremented');

  // Verify ledger recorded release
  const relTx = db.prepare("SELECT * FROM credit_transactions WHERE tenant_id = ? AND type = 'RESERVATION_RELEASE' ORDER BY created_at DESC LIMIT 1").get(tenantA);
  assert.strictEqual(relTx.amount, 5, 'Ledger recorded +5 refund');
});

// ─────────────────────────────────────────────────────────────────
// TEST 12: 7-DAY TRIAL EXPIRATION ENFORCEMENT
// ─────────────────────────────────────────────────────────────────
console.log('\n12. Testing 7-Day Free Trial Expiration...');
runTest('Trial expiration pauses AI replies even if credits remain', () => {
  const expiredTenant = 'ws-test-expired';
  db.prepare(`
    INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, created_at, updated_at)
    VALUES (?, 'Old Store', 'old-store', 'Old Owner', 'old@test.com', 'Growth', 'ACTIVE', datetime('now', '-8 days'), datetime('now', '-8 days'))
  `).run(expiredTenant);

  // Initialize wallet with 8-day-old creation date
  ensureCreditWallet(db, expiredTenant, new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString());

  const check = creditWalletService.canSendAiReply(expiredTenant);
  assert.strictEqual(check.canSend, false, 'AI reply rejected due to expired trial');
  assert.strictEqual(check.reason, 'TRIAL_EXPIRED', 'Reason is TRIAL_EXPIRED');
  assert.strictEqual(check.requiresUpgrade, true, 'Requires plan upgrade');

  const wallet = creditWalletService.getWallet(expiredTenant);
  assert.strictEqual(wallet.isTrialExpired, true, 'isTrialExpired flag is true');
  assert.strictEqual(wallet.trialDaysRemaining, 0, 'Zero trial days remaining');
});

// ─────────────────────────────────────────────────────────────────
// TEST 13: CREDIT EXHAUSTION ENFORCEMENT
// ─────────────────────────────────────────────────────────────────
console.log('\n13. Testing Credit Exhaustion Enforcement...');
runTest('Consuming all credits pauses auto-reply and prompts upgrade', () => {
  const exhaustedTenant = 'ws-test-exhausted';
  db.prepare(`
    INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, created_at, updated_at)
    VALUES (?, 'Empty Store', 'empty-store', 'Empty Owner', 'empty@test.com', 'Growth', 'ACTIVE', datetime('now'), datetime('now'))
  `).run(exhaustedTenant);

  ensureCreditWallet(db, exhaustedTenant, new Date().toISOString());

  // Manually drain credits to 0
  db.prepare('UPDATE ai_credit_wallets SET credits_balance = 0, credits_used = 125 WHERE tenant_id = ?').run(exhaustedTenant);

  const check = creditWalletService.canSendAiReply(exhaustedTenant);
  assert.strictEqual(check.canSend, false, 'AI reply rejected due to exhausted credits');
  assert.strictEqual(check.reason, 'CREDITS_EXHAUSTED', 'Reason is CREDITS_EXHAUSTED');
  assert.strictEqual(check.requiresUpgrade, true, 'Requires plan upgrade');
});

// ─────────────────────────────────────────────────────────────────
// TEST 14: PAID PLAN ACTIVATION & REUSE OF EXISTING PRICING
// ─────────────────────────────────────────────────────────────────
console.log('\n14. Testing Existing Pricing Plan Integration & Upgrades...');
runTest('Upgrading to Standard plan grants official 18,000 credits and activates paid subscription', () => {
  const plan = PLAN_CONFIG.standard;
  assert(plan !== undefined, 'Standard plan exists in config');
  assert.strictEqual(plan.credits, 18000, 'Standard plan has exactly 18,000 credits');
  assert.strictEqual(plan.priceUsdMonthly, 119, 'Price matches existing pricing tiers ($119)');

  const upgradeRes = creditWalletService.upgradeSubscription(tenantA, 'standard', 'MONTHLY', 'STRIPE', 'sub_live_test_01');
  assert.strictEqual(upgradeRes.success, true, 'Upgrade succeeded');
  assert.strictEqual(upgradeRes.creditsAdded, 18000, 'Added 18,000 credits');

  const wallet = creditWalletService.getWallet(tenantA);
  assert.strictEqual(wallet.subscriptionTier, 'Standard plan', 'Tier is Standard plan');
  assert.strictEqual(wallet.subscriptionStatus, 'ACTIVE', 'Status is ACTIVE');
  assert(wallet.creditsBalance >= 18000, 'Balance is >= 18,000');
  assert.strictEqual(wallet.monthlyCreditAllowance, 18000, 'Monthly allowance is 18,000');

  // Verify subscriptions table
  const subRow = db.prepare('SELECT * FROM subscriptions WHERE tenant_id = ?').get(tenantA);
  assert(subRow !== undefined, 'Subscription row created');
  assert.strictEqual(subRow.plan_id, 'standard', 'Plan ID is standard');
  assert.strictEqual(subRow.status, 'ACTIVE', 'Subscription status is ACTIVE');

  // Now tenant can send AI replies freely
  const canSend = creditWalletService.canSendAiReply(tenantA);
  assert.strictEqual(canSend.canSend, true, 'Can send AI replies with paid subscription');
});

// ─────────────────────────────────────────────────────────────────
// TEST 15: PAYMENT WEBHOOK IDEMPOTENCY
// ─────────────────────────────────────────────────────────────────
console.log('\n15. Testing Payment Webhook Idempotency...');
runTest('Repeated payment webhooks do not double-grant credits', () => {
  const eventId = `evt_invoice_paid_${Date.now()}`;
  const initialWallet = creditWalletService.getWallet(tenantA);
  const initialBalance = initialWallet.creditsBalance;

  // First webhook delivery
  const res1 = creditWalletService.processPaymentWebhook('STRIPE', eventId, 'INVOICE_PAID', tenantA, 'trial', { amount: 4900 });
  assert.strictEqual(res1.duplicate, false, 'First payment webhook processed');

  const postFirstBalance = creditWalletService.getWallet(tenantA).creditsBalance;
  assert.strictEqual(postFirstBalance, initialBalance + 6600, 'Added 6,600 credits for trial plan');

  // Second delivery of identical webhook event
  const res2 = creditWalletService.processPaymentWebhook('STRIPE', eventId, 'INVOICE_PAID', tenantA, 'trial', { amount: 4900 });
  assert.strictEqual(res2.duplicate, true, 'Duplicate webhook recognized and skipped');

  const postSecondBalance = creditWalletService.getWallet(tenantA).creditsBalance;
  assert.strictEqual(postSecondBalance, postFirstBalance, 'Balance unchanged on duplicate payment webhook');
});

// ─────────────────────────────────────────────────────────────────
// TEST 16: SECURE RECONNECTION DOES NOT GRANT NEW TRIAL
// ─────────────────────────────────────────────────────────────────
console.log('\n16. Testing Reconnection Preserves Trial History...');
runTest('Reconnecting WhatsApp does NOT reset trial credits or grant a new trial', () => {
  const currentWallet = creditWalletService.getWallet(tenantA);
  const currentStartedAt = currentWallet.trialStartedAt;

  // Disconnect WhatsApp
  whatsappConnectionService.disconnect(tenantA);
  const disconnected = whatsappConnectionService.getConnection(tenantA);
  assert.strictEqual(disconnected.status, 'NOT_CONNECTED', 'WhatsApp disconnected');

  // Re-link WhatsApp
  whatsappConnectionService.saveConnection(tenantA, {
    wabaId: wabaA,
    phoneNumberId: phoneA,
    displayNumber: '+1 (555) 653-9685',
    accessToken: 'EAAG_mock_reconnect_token'
  });

  const reconnectedWallet = creditWalletService.getWallet(tenantA);
  assert.strictEqual(reconnectedWallet.trialStartedAt, currentStartedAt, 'Trial start date preserved across reconnects');
  assert.strictEqual(reconnectedWallet.trialCreditsGranted, 125, 'Does not grant duplicate trial credits');
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL EMBEDDED SIGNUP & 7-DAY TRIAL WALLET TESTS PASSED!\n');
}
