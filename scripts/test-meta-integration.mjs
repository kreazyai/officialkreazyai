import crypto from 'crypto';
import { createApp } from '../src/server/app/app.js';
import { getDatabase } from '../src/server/config/database.js';
import { config } from '../src/server/config/env.js';
import { encryptToken, decryptToken, sanitizeConnection } from '../src/server/utils/encryption.js';
import { metaAuthService } from '../src/server/services/meta/metaAuthService.js';
import { metaWebhookService } from '../src/server/services/meta/metaWebhookService.js';
import { metaConnectionService } from '../src/server/services/meta/metaConnectionService.js';
import { metaAutoReplyEngine } from '../src/server/services/meta/metaAutoReplyEngine.js';

console.log('================================================================');
console.log('KREAZYAI META PLATFORM INTEGRATION & AUTO-REPLY TEST SUITE');
console.log('================================================================\n');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✕ FAILED: ${message}`);
    testsFailed++;
  }
}

async function runSuite() {
  const db = getDatabase(':memory:');
  const app = createApp();
  const PORT = 5088;

  const server = app.listen(PORT, async () => {
    try {
      console.log(`[TEST SERVER] Running on port ${PORT}\n`);

      // ─────────────────────────────────────────────────────────────
      // 1. AES-256-GCM TOKEN ENCRYPTION & DATA SANITIZATION
      // ─────────────────────────────────────────────────────────────
      console.log('1. Testing AES-256-GCM Token Encryption & Storage Security...');
      const rawToken = 'EAAGm0PX4ZC0IBO8ZCKkQZALsecretTokenValue1234567890';
      const enc = encryptToken(rawToken);

      assert(enc && enc.encrypted && enc.iv && enc.tag, 'Token was encrypted with IV and Auth Tag');
      assert(enc.encrypted !== rawToken, 'Encrypted cipher does not match raw token');

      const decrypted = decryptToken(enc.encrypted, enc.iv, enc.tag);
      assert(decrypted === rawToken, 'Decrypted token matches original secret exactly');

      const connectionRecord = {
        id: 'meta_wa_test',
        platform: 'WHATSAPP',
        status: 'CONNECTED',
        encrypted_access_token: enc.encrypted,
        token_iv: enc.iv,
        token_tag: enc.tag,
        phone_number_id: 'phone_10928374',
        page_id: null
      };

      const sanitized = sanitizeConnection(connectionRecord);
      assert(sanitized.encrypted_access_token === undefined, 'Sanitization strips encrypted_access_token');
      assert(sanitized.token_iv === undefined, 'Sanitization strips token_iv');
      assert(sanitized.token_tag === undefined, 'Sanitization strips token_tag');
      assert(sanitized.has_token === true, 'Sanitization flags has_token = true');

      // ─────────────────────────────────────────────────────────────
      // 2. OAUTH URL GENERATION & SIGNED STATE VERIFICATION
      // ─────────────────────────────────────────────────────────────
      console.log('\n2. Testing OAuth URL Generation & State Security...');
      const { authUrl, state, isSimulated } = metaAuthService.generateAuthorizationUrl(
        'ws-flagship-01',
        'ws-flagship-01',
        'WHATSAPP'
      );

      assert(typeof authUrl === 'string' && authUrl.length > 0, 'Auth URL generated successfully');
      assert(typeof state === 'string' && state.length > 20, 'State is a signed tamper-proof base64url token');

      const verifiedState = metaAuthService.verifySignedState(state);
      assert(verifiedState.businessId === 'ws-flagship-01', 'Verified state businessId matches');
      assert(verifiedState.platform === 'WHATSAPP', 'Verified state platform matches');

      let tamperedStateThrew = false;
      try {
        metaAuthService.verifySignedState(state + 'TAMPER');
      } catch {
        tamperedStateThrew = true;
      }
      assert(tamperedStateThrew, 'Tampered state signature is firmly rejected');

      // ─────────────────────────────────────────────────────────────
      // 3. WEBHOOK HANDSHAKE (GET /api/v1/meta/webhook)
      // ─────────────────────────────────────────────────────────────
      console.log('\n3. Testing Meta Webhook Verification Handshake...');
      const validVerifyRes = await fetch(
        `http://localhost:${PORT}/api/v1/meta/webhook?hub.mode=subscribe&hub.verify_token=${config.meta.verifyToken}&hub.challenge=test_challenge_8821`
      );
      const challengeEcho = await validVerifyRes.text();
      assert(validVerifyRes.status === 200 && challengeEcho === 'test_challenge_8821', 'Handshake succeeds with verify token');

      const invalidVerifyRes = await fetch(
        `http://localhost:${PORT}/api/v1/meta/webhook?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=test_challenge_8821`
      );
      assert(invalidVerifyRes.status === 403, 'Handshake rejected with invalid verify token');

      // ─────────────────────────────────────────────────────────────
      // 4. WEBHOOK SIGNATURE & DEDUPLICATION (POST /api/v1/meta/webhook)
      // ─────────────────────────────────────────────────────────────
      console.log('\n4. Testing Webhook Signature Verification & Deduplication...');
      const testEventId = `mid.test.${Date.now()}`;
      const samplePayload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'waba_99182',
          changes: [{
            field: 'messages',
            value: {
              metadata: { phone_number_id: 'phone_10928374' },
              contacts: [{ wa_id: '1555019283', profile: { name: 'Alex Johnson' } }],
              messages: [{
                id: testEventId,
                from: '1555019283',
                timestamp: Math.floor(Date.now() / 1000).toString(),
                type: 'text',
                text: { body: 'Hello KreazyAI support!' }
              }]
            }
          }]
        }]
      };

      const rawJson = JSON.stringify(samplePayload);
      const testSecret = 'kreazy_meta_test_secret_for_hmac_suite_2026';
      const validHmac = 'sha256=' + crypto.createHmac('sha256', testSecret).update(rawJson).digest('hex');
      const invalidHmac = 'sha256=ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

      assert(metaWebhookService.verifySignature(rawJson, validHmac, testSecret) === true, 'Signature verifier accepts genuine HMAC');
      assert(metaWebhookService.verifySignature(rawJson, invalidHmac, testSecret) === false, 'Signature verifier rejects forged HMAC');

      // Test Deduplication Lifecycle: First-Time, In-Flight Pipeline, Repeated Delivery, & Failure Retry
      const isFreshFirst = metaWebhookService.deduplicateEvent(testEventId, 'WHATSAPP', 'ws-flagship-01', samplePayload);
      assert(isFreshFirst === true, 'First incoming message is marked fresh at gateway (processed=0)');
      
      // Crucial: Pipeline stage must NOT reject the in-flight event as a duplicate of itself
      const pipelineRejectedInFlight = metaWebhookService.isDuplicateEvent(testEventId);
      assert(pipelineRejectedInFlight === false, 'Pipeline permits in-flight message to proceed without self-duplicate rejection');

      // Gateway marks event completed once processing finishes
      metaWebhookService.markEventProcessed(testEventId, true);

      // Repeated delivery of completed message must be dropped
      const isFreshDuplicate = metaWebhookService.deduplicateEvent(testEventId, 'WHATSAPP', 'ws-flagship-01', samplePayload);
      assert(isFreshDuplicate === false, 'Duplicate incoming message is recognized and dropped at gateway (processed=1)');
      const pipelineRejectedCompleted = metaWebhookService.isDuplicateEvent(testEventId);
      assert(pipelineRejectedCompleted === true, 'Pipeline drops duplicate completed message');

      // Failure followed by legitimate retry test
      const failRetryEventId = `mid.test.fail_retry.${Date.now()}`;
      const firstAttempt = metaWebhookService.deduplicateEvent(failRetryEventId, 'WHATSAPP', 'ws-flagship-01', samplePayload);
      assert(firstAttempt === true, 'First attempt of retryable message is marked fresh');
      // Processing throws / fails
      metaWebhookService.markEventProcessed(failRetryEventId, false);
      // Legitimate retry from Meta arrives
      const retryAttempt = metaWebhookService.deduplicateEvent(failRetryEventId, 'WHATSAPP', 'ws-flagship-01', samplePayload);
      assert(retryAttempt === true, 'Legitimate retry following a failure is accepted for re-processing');
      const pipelineAllowedRetry = metaWebhookService.isDuplicateEvent(failRetryEventId);
      assert(pipelineAllowedRetry === false, 'Pipeline permits retried message to proceed');
      metaWebhookService.markEventProcessed(failRetryEventId, true);
      const postSuccessDuplicate = metaWebhookService.deduplicateEvent(failRetryEventId, 'WHATSAPP', 'ws-flagship-01', samplePayload);
      assert(postSuccessDuplicate === false, 'Post-success duplicate is dropped firmly');

      // ─────────────────────────────────────────────────────────────
      // 5. HETEROGENEOUS PAYLOAD NORMALIZATION
      // ─────────────────────────────────────────────────────────────
      console.log('\n5. Testing Heterogeneous Payload Normalization...');
      // WhatsApp Normalization
      const waNormalized = metaWebhookService.normalizeWebhookPayload(samplePayload);
      assert(waNormalized.length === 1, 'WhatsApp payload normalized into single internal event');
      assert(waNormalized[0].platform === 'WHATSAPP', 'Normalized platform is WHATSAPP');
      assert(waNormalized[0].messageText === 'Hello KreazyAI support!', 'Extracted WhatsApp message body');
      assert(waNormalized[0].sender.phone === '1555019283', 'Extracted WhatsApp sender phone');

      // Instagram Normalization
      const igPayload = {
        object: 'instagram',
        entry: [{
          id: 'ig_acc_901928',
          messaging: [{
            sender: { id: 'ig_user_11928' },
            recipient: { id: 'ig_acc_901928' },
            timestamp: Date.now(),
            message: {
              mid: 'm_ig_891823',
              text: 'How much is the Artisan Linen Overshirt?'
            }
          }]
        }]
      };
      const igNormalized = metaWebhookService.normalizeWebhookPayload(igPayload);
      assert(igNormalized.length === 1 && igNormalized[0].platform === 'INSTAGRAM', 'Instagram payload normalized');
      assert(igNormalized[0].messageText === 'How much is the Artisan Linen Overshirt?', 'Extracted Instagram text');

      // Messenger Normalization
      const fbPayload = {
        object: 'page',
        entry: [{
          id: 'page_881920',
          messaging: [{
            sender: { id: 'fb_user_5521' },
            recipient: { id: 'page_881920' },
            timestamp: Date.now(),
            message: {
              mid: 'm_fb_771928',
              text: 'What are your delivery charges?'
            }
          }]
        }]
      };
      const fbNormalized = metaWebhookService.normalizeWebhookPayload(fbPayload);
      assert(fbNormalized.length === 1 && fbNormalized[0].platform === 'MESSENGER', 'Facebook Messenger payload normalized');
      assert(fbNormalized[0].messageText === 'What are your delivery charges?', 'Extracted Messenger text');

      // ─────────────────────────────────────────────────────────────
      // SEED OFFICIAL CHANNELS FOR MERCHANT TEST WORKSPACE
      // ─────────────────────────────────────────────────────────────
      metaConnectionService.saveConnectionFromOAuth(
        'ws-flagship-01',
        'ws-flagship-01',
        'WHATSAPP',
        { accessToken: 'EAAG_mock_test_whatsapp_token', expiresIn: 5184000 },
        {
          wabaId: 'waba_99182',
          phoneNumberId: 'phone_10928374',
          displayPhoneNumber: '+1 (555) 019-2831',
          scopes: ['whatsapp_business_messaging', 'whatsapp_business_management']
        }
      );

      metaConnectionService.saveConnectionFromOAuth(
        'ws-flagship-01',
        'ws-flagship-01',
        'INSTAGRAM',
        { accessToken: 'EAAG_mock_test_instagram_token', expiresIn: 5184000 },
        {
          instagramAccountId: 'ig_acc_901928',
          instagramUsername: 'kreazy.apparel.official',
          scopes: ['instagram_basic', 'instagram_manage_messages']
        }
      );

      metaConnectionService.saveConnectionFromOAuth(
        'ws-flagship-01',
        'ws-flagship-01',
        'MESSENGER',
        { accessToken: 'EAAG_mock_test_messenger_token', expiresIn: 5184000 },
        {
          pageId: 'page_881920',
          pageName: 'KreazyAI Flagship Store',
          scopes: ['pages_messaging', 'pages_show_list']
        }
      );

      // ─────────────────────────────────────────────────────────────
      // 6. RULE-FIRST AUTO-REPLY EVALUATION (SQLITE GROUNDING)
      // ─────────────────────────────────────────────────────────────
      console.log('\n6. Testing Rule-First Auto-Reply Grounding in Relational DB...');

      // Test Stock Inquiry grounded in SQLite products table
      const stockResult = await metaAutoReplyEngine.processIncomingMessage({
        platform: 'WHATSAPP',
        businessId: 'ws-flagship-01',
        workspaceId: 'ws-flagship-01',
        externalConversationId: 'conv_stock_test',
        externalMessageId: 'mid_stock_test_' + Date.now(),
        messageText: 'Do you have this shirt in XL?',
        sender: { id: '1555019283', name: 'Alex Johnson', phone: '1555019283' }
      });

      assert(stockResult && stockResult.intent === 'PRODUCT_AVAILABILITY', 'Intent detected as PRODUCT_AVAILABILITY');
      assert(stockResult.ruleMatched === true, 'Handled by Rule-First architecture without LLM cost');
      assert(typeof stockResult.replyText === 'string' && stockResult.replyText.includes('in stock'), 'Replied with verified inventory status');

      // Test Delivery Inquiry grounded in ai_configs table
      const deliveryResult = await metaAutoReplyEngine.processIncomingMessage({
        platform: 'INSTAGRAM',
        businessId: 'ws-flagship-01',
        workspaceId: 'ws-flagship-01',
        externalConversationId: 'conv_del_test',
        externalMessageId: 'mid_del_test_' + Date.now(),
        messageText: 'What is your delivery charge and shipping policy?',
        sender: { id: 'ig_user_11928', name: 'Instagram Shopper' }
      });

      assert(deliveryResult && deliveryResult.intent === 'DELIVERY_INQUIRY', 'Intent detected as DELIVERY_INQUIRY');
      assert(deliveryResult.replyText.includes('Delivery') || deliveryResult.replyText.includes('shipping'), 'Delivered exact store delivery fee/policy');

      // Test Return Policy Inquiry grounded in ai_configs table
      const returnResult = await metaAutoReplyEngine.processIncomingMessage({
        platform: 'MESSENGER',
        businessId: 'ws-flagship-01',
        workspaceId: 'ws-flagship-01',
        externalConversationId: 'conv_ret_test',
        externalMessageId: 'mid_ret_test_' + Date.now(),
        messageText: 'What is your return policy?',
        sender: { id: 'fb_user_5521', name: 'Messenger Buyer' }
      });

      assert(returnResult && returnResult.intent === 'RETURN_POLICY', 'Intent detected as RETURN_POLICY');
      assert(returnResult.replyText.includes('return') || returnResult.replyText.includes('days'), 'Returned store return policy');

      // ─────────────────────────────────────────────────────────────
      // 7. HUMAN HANDOFF & CONFIDENCE THRESHOLD
      // ─────────────────────────────────────────────────────────────
      console.log('\n7. Testing Human Handoff & Escalation Triggers...');
      const complexInquiry = await metaAutoReplyEngine.processIncomingMessage({
        platform: 'WHATSAPP',
        businessId: 'ws-flagship-01',
        workspaceId: 'ws-flagship-01',
        externalConversationId: 'conv_escalate_test',
        externalMessageId: 'mid_escalate_' + Date.now(),
        messageText: 'I demand to speak to your human manager about a legal dispute right now!',
        sender: { id: '1555019283', name: 'Escalation Requester' }
      });

      assert(complexInquiry && complexInquiry.escalated === true, 'Escalation triggered for complex/low-confidence query');
      assert(complexInquiry.replyText.includes('team member'), 'Friendly handoff message returned to customer');

      // Check that Live Inbox was notified
      const dbCheck = getDatabase();
      const updatedConv = dbCheck.prepare(
        "SELECT status FROM conversations WHERE id = 'conv_escalate_test'"
      ).get();
      assert(updatedConv && updatedConv.status === 'NEEDS_HUMAN', 'Conversation status set to NEEDS_HUMAN in Live Inbox');

      // ─────────────────────────────────────────────────────────────
      // 8. 5-POINT CONNECTION TEST SUITE
      // ─────────────────────────────────────────────────────────────
      console.log('\n8. Testing 5-Point Meta Connection Diagnostic Suite...');
      const diagResult = await metaConnectionService.testConnection('ws-flagship-01', 'WHATSAPP');
      assert(diagResult && diagResult.success === true, 'Diagnostic test suite executed successfully');
      assert(Array.isArray(diagResult.checks) && diagResult.checks.length === 5, 'Evaluated all 5 diagnostic checkpoints:');
      for (const check of diagResult.checks) {
        console.log(`     - [${check.passed ? 'PASS' : 'FAIL'}] ${check.title}: ${check.detail}`);
      }

      // ─────────────────────────────────────────────────────────────
      // 9. TENANT ISOLATION
      // ─────────────────────────────────────────────────────────────
      console.log('\n9. Testing Multi-Tenant Data Isolation...');
      db.prepare(`
        INSERT INTO businesses (id, name, slug, owner_name, owner_email)
        VALUES ('ws-tenant-b', 'Tenant B Boutiques', 'tenant-b', 'Jane Doe', 'jane@tenantb.com')
      `).run();

      const tenantAConns = metaConnectionService.getConnections('ws-flagship-01');
      const tenantBConns = metaConnectionService.getConnections('ws-tenant-b');

      assert(tenantAConns.length === 3, 'Merchant A has 3 configured connections');
      assert(tenantAConns.every(c => c.status === 'CONNECTED'), 'Merchant A connections are active');
      assert(tenantBConns.length === 3, 'Merchant B has separate isolated connection records');
      assert(tenantBConns.every(c => c.status === 'NOT_CONNECTED'), 'Merchant B channels are NOT_CONNECTED and cannot see Merchant A tokens');

      // ─────────────────────────────────────────────────────────────
      // 10. INTERACTIVE META CONNECTION TEST MODE API
      // ─────────────────────────────────────────────────────────────
      console.log('\n10. Testing Interactive META CONNECTION TEST MODE API Endpoint...');
      const jwtMod = await import('jsonwebtoken');
      const testJwt = jwtMod.default.sign(
        { userId: 'usr-founder', email: 'founder@kreazybrand.com', role: 'OWNER', businessId: 'ws-flagship-01' },
        config.auth.jwtSecret,
        { expiresIn: '1h' }
      );

      const simRes = await fetch(`http://localhost:${PORT}/api/v1/meta/test-simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testJwt}`,
          'x-workspace-id': 'ws-flagship-01'
        },
        body: JSON.stringify({
          platform: 'WHATSAPP',
          messageText: 'Do you have this shirt in XL?',
          senderName: 'Sarah Jenkins',
          senderPhone: '+1 (555) 928-1029'
        })
      });

      const simData = await simRes.json();
      assert(simRes.status === 200 && simData.success === true, 'Test mode simulation endpoint returns 200 OK');
      assert(Array.isArray(simData.data.executionTrace), 'Returns step-by-step execution trace:');
      for (const step of simData.data.executionTrace) {
        console.log(`     Step ${step.step}: ${step.title} -> ${step.detail}`);
      }
      assert(typeof simData.data.replyText === 'string', 'Generated customer reply');

      // ─────────────────────────────────────────────────────────────
      // 11. END-TO-END HTTP POST WEBHOOK INGESTION & AUTO-REPLY FLOW
      // ─────────────────────────────────────────────────────────────
      console.log('\n11. Testing End-to-End HTTP POST /api/v1/meta/webhook Flow...');
      const e2eEventId = `wamid.test.e2e.${Date.now()}`;
      const e2ePayload = {
        object: 'whatsapp_business_account',
        entry: [{
          id: 'waba_99182',
          changes: [{
            field: 'messages',
            value: {
              metadata: { phone_number_id: 'phone_10928374' },
              contacts: [{ wa_id: '1555019283', profile: { name: 'E2E Shopper' } }],
              messages: [{
                id: e2eEventId,
                from: '1555019283',
                timestamp: Math.floor(Date.now() / 1000).toString(),
                type: 'text',
                text: { body: 'What is your return policy?' }
              }]
            }
          }]
        }]
      };

      const e2eBody = JSON.stringify(e2ePayload);
      const e2eHmac = config.meta.appSecret 
        ? 'sha256=' + crypto.createHmac('sha256', config.meta.appSecret).update(e2eBody).digest('hex')
        : undefined;

      // 1st delivery: Fresh message
      const e2eRes1 = await fetch(`http://localhost:${PORT}/api/v1/meta/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '157.240.231.17',
          'cf-connecting-ip': '157.240.231.17',
          ...(e2eHmac ? { 'x-hub-signature-256': e2eHmac } : {})
        },
        body: e2eBody
      });
      assert(e2eRes1.status === 200, 'HTTP POST Webhook returns 200 immediately for first delivery');

      // Wait a moment for background processing to complete
      await new Promise(r => setTimeout(r, 600));

      // Verify that the inbound message was saved in DB
      const dbInstance = getDatabase();
      const savedInMsg = dbInstance.prepare('SELECT id, text, status FROM messages WHERE external_message_id = ?').get(e2eEventId);
      assert(Boolean(savedInMsg), 'Inbound message successfully persisted in messages table (not dropped as self-duplicate)');

      // 2nd delivery: Duplicate message delivery from Meta
      const e2eRes2 = await fetch(`http://localhost:${PORT}/api/v1/meta/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '157.240.231.17',
          'cf-connecting-ip': '157.240.231.17',
          ...(e2eHmac ? { 'x-hub-signature-256': e2eHmac } : {})
        },
        body: e2eBody
      });
      assert(e2eRes2.status === 200, 'HTTP POST Webhook returns 200 ACK for duplicate delivery without error');

      console.log('\n================================================================');
      console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
      console.log('================================================================');

      if (testsFailed === 0) {
        console.log('🎉 ALL PRODUCTION-GRADE META INTEGRATION TESTS PASSED PERFECTLY!\n');
      } else {
        process.exitCode = 1;
      }
    } catch (err) {
      console.error('\n❌ Uncaught error during test suite execution:', err);
      process.exitCode = 1;
    } finally {
      server.close();
    }
  });
}

runSuite();
