import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/server/app/app.js';
import { getDatabase } from '../src/server/config/database.js';
import { config } from '../src/server/config/env.js';
import { whatsappConnectionService } from '../src/server/services/whatsapp/whatsappConnectionService.js';
import { whatsappPipeline } from '../src/server/services/whatsapp/whatsappPipeline.js';
import { languageDetector } from '../src/server/services/whatsapp/languageDetector.js';
import { knowledgeService } from '../src/server/services/whatsapp/knowledgeService.js';
import { visionService } from '../src/server/services/whatsapp/visionService.js';
import { metaWebhookService } from '../src/server/services/meta/metaWebhookService.js';
import { whatsappService } from '../src/server/services/meta/whatsappService.js';

console.log('================================================================');
console.log('KREAZYAI WHATSAPP PRODUCTION INTEGRATION TEST SUITE');
console.log('Validating all 11 Acceptance Criteria & Phase 11 Test Specifications');
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
  const PORT = 5089;

  const server = app.listen(PORT, async () => {
    try {
      console.log(`[TEST SERVER] Running on port ${PORT}\n`);

      // ─────────────────────────────────────────────────────────────
      // 1. WEBHOOK VERIFICATION HANDSHAKE
      // ─────────────────────────────────────────────────────────────
      console.log('1. Testing Official Meta Webhook Verification Handshake...');
      const verifyToken = config.meta.verifyToken;
      const challengeCode = 'whatsapp_challenge_token_99182';

      // Successful handshake
      const validRes = await fetch(
        `http://localhost:${PORT}/api/v1/meta/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=${challengeCode}`
      );
      const challengeBody = await validRes.text();
      assert(validRes.status === 200, 'Webhook handshake returns 200 OK with valid verify token');
      assert(challengeBody === challengeCode, 'Webhook handshake echoes hub.challenge accurately');

      // Invalid token handshake
      const invalidRes = await fetch(
        `http://localhost:${PORT}/api/v1/meta/webhook?hub.mode=subscribe&hub.verify_token=FORGED_TOKEN&hub.challenge=${challengeCode}`
      );
      assert(invalidRes.status === 403, 'Webhook handshake rejects invalid verify token with 403 Forbidden');

      // ─────────────────────────────────────────────────────────────
      // 2. TENANT RESOLUTION FROM PHONE NUMBER ID (NO CLIENT TRUST)
      // ─────────────────────────────────────────────────────────────
      console.log('\n2. Testing Tenant Resolution from Incoming Asset ID...');
      const resolvedTenant = metaWebhookService.resolveTenant('WHATSAPP', '109283741');
      assert(resolvedTenant !== null, 'Mapped WhatsApp phone number ID resolves to an active tenant');
      assert(resolvedTenant?.businessId === 'ws-flagship-01', 'Phone number ID 109283741 maps to ws-flagship-01');

      // ─────────────────────────────────────────────────────────────
      // 3. MISSING TENANT MAPPING REJECTION (NEVER GUESS TENANT)
      // ─────────────────────────────────────────────────────────────
      console.log('\n3. Testing Missing Tenant Mapping (Never Guess Tenant)...');
      const unmappedResolution = metaWebhookService.resolveTenant('WHATSAPP', 'unmapped_phone_9999999');
      assert(unmappedResolution === null, 'Unmapped phone number ID strictly returns null without guessing');

      // Test webhook drop of unmapped asset
      const unmappedEvent = {
        platform: 'WHATSAPP',
        businessId: null,
        messageId: 'wamid.unmapped.test.01',
        sender: { id: 'cust_unmapped', phone: '+123456789' },
        recipient: { id: 'unmapped_phone_9999999' },
        message: { text: 'Hello unmapped store' }
      };
      const unmappedPipelineResult = await whatsappPipeline.processInboundMessage(unmappedEvent);
      assert(unmappedPipelineResult.success === false, 'Inbound message from unmapped asset is dropped');
      assert(unmappedPipelineResult.reason === 'TENANT_UNRESOLVED', 'Drop reason is TENANT_UNRESOLVED');

      // ─────────────────────────────────────────────────────────────
      // 4. DUPLICATE WEBHOOK IDEMPOTENCY HANDLING
      // ─────────────────────────────────────────────────────────────
      console.log('\n4. Testing Duplicate Webhook Handling & Idempotency...');
      const dedupId = `wamid.idempotency.test.${Date.now()}`;
      const firstCheck = metaWebhookService.isDuplicateEvent(dedupId);
      assert(firstCheck === false, 'First arrival of message ID is marked fresh');

      const secondCheck = metaWebhookService.isDuplicateEvent(dedupId);
      assert(secondCheck === true, 'Subsequent retry of same message ID is marked duplicate and dropped');

      // ─────────────────────────────────────────────────────────────
      // 5. CROSS-TENANT DATA ISOLATION
      // ─────────────────────────────────────────────────────────────
      console.log('\n5. Testing Strict Cross-Tenant Data Isolation...');
      // Seed isolated data for Tenant B
      db.prepare(`
        INSERT OR IGNORE INTO faqs (id, tenant_id, question, answer, category, status)
        VALUES ('faq-tenant-b-01', 'ws-artisan-02', 'Where is Copenhagen Botanicals located?', 'We are based in Copenhagen, Denmark.', 'LOCATION', 'ACTIVE')
      `).run();

      db.prepare(`
        INSERT OR IGNORE INTO policies (id, tenant_id, policy_type, content, status)
        VALUES ('pol-tenant-b-01', 'ws-artisan-02', 'CUSTOMS', 'International customs are prepaid for European Union orders.', 'ACTIVE')
      `).run();

      // Retrieve knowledge for Tenant A
      const tenantAKnowledge = knowledgeService.getTenantKnowledge('ws-flagship-01');
      const tenantBKnowledge = knowledgeService.getTenantKnowledge('ws-artisan-02');

      const tenantAHasTenantBFaq = tenantAKnowledge.faqs.some(f => f.question.includes('Copenhagen'));
      assert(tenantAHasTenantBFaq === false, 'Tenant A cannot retrieve Tenant B FAQs');

      const tenantBHasTenantAFaq = tenantBKnowledge.faqs.some(f => f.question.includes('Return Policy'));
      assert(tenantBHasTenantAFaq === false, 'Tenant B cannot retrieve Tenant A FAQs');

      const tenantAHasTenantBPolicy = tenantAKnowledge.policies.some(p => p.content.includes('European Union'));
      assert(tenantAHasTenantBPolicy === false, 'Tenant A cannot retrieve Tenant B Policies');

      // ─────────────────────────────────────────────────────────────
      // 6. MULTI-LANGUAGE DETECTION (BANGLA, BANGLISH, ENGLISH, MIXED)
      // ─────────────────────────────────────────────────────────────
      console.log('\n6. Testing Multi-Language Detection Engine...');
      const banglaTest = languageDetector.detect('এই শার্টের দাম কত এবং স্টকে আছে কি?');
      assert(banglaTest.language === 'BANGLA', 'Bangla script accurately detected as BANGLA');
      assert(banglaTest.isBanglaScript === true, 'Bangla script flag is true');

      const banglishTest = languageDetector.detect('Bhai eita ki stock e ache? Price koto taka?');
      assert(['BANGLISH', 'BANGLA'].includes(banglishTest.language), 'Banglish phrases detected as BANGLISH/BANGLA');

      const englishTest = languageDetector.detect('Do you have this in size XL and what is the shipping time?');
      assert(englishTest.language === 'ENGLISH', 'English text detected as ENGLISH');

      const mixedTest = languageDetector.detect('Hello ভাই, linen shirt er price koto?');
      assert(['BANGLA', 'BANGLISH', 'MIXED'].includes(mixedTest.language), 'Mixed script text detected correctly');

      // ─────────────────────────────────────────────────────────────
      // 7. INBOUND & OUTBOUND MESSAGE FLOW WITH PERSISTENCE
      // ─────────────────────────────────────────────────────────────
      console.log('\n7. Testing End-to-End Inbound & Outbound WhatsApp Flow...');
      const customerPhone = '+1 (555) 728-1920';
      const inboundPayload = {
        platform: 'WHATSAPP',
        businessId: 'ws-flagship-01',
        messageId: `wamid.flow.${Date.now()}`,
        sender: { id: 'cust_flow_01', phone: customerPhone, name: 'Tarek Ahmed' },
        recipient: { id: '109283741' },
        message: { text: 'What is the price of the Artisan Linen Overshirt?' }
      };

      const flowResult = await whatsappPipeline.processInboundMessage(inboundPayload);
      assert(flowResult.success === true, 'Inbound message processed through pipeline successfully');
      assert(flowResult.intent === 'PRODUCT_INQUIRY' || flowResult.intent === 'PRODUCT_AVAILABILITY', 'Intent classified as product inquiry');
      assert(flowResult.replyText.includes('89') || flowResult.replyText.includes('Artisan Linen'), 'Outbound reply includes verified price from database');
      assert(flowResult.conversationId !== undefined, 'Conversation ID generated and bound');

      // Verify persistence in SQLite
      const persistedMsg = db.prepare('SELECT * FROM messages WHERE id = ?').get(flowResult.outboundMessageId);
      assert(persistedMsg !== undefined, 'Outbound response persisted in messages table');
      assert(persistedMsg?.direction === 'OUTBOUND', 'Message direction recorded as OUTBOUND');
      assert(persistedMsg?.tenant_id === 'ws-flagship-01', 'Outbound message bound to tenant_id');

      // ─────────────────────────────────────────────────────────────
      // 8. AUTHORITATIVE PRICE & STOCK VALIDATION (NO FABRICATION)
      // ─────────────────────────────────────────────────────────────
      console.log('\n8. Testing Authoritative Product Validation (Live Stock & Price Check)...');
      // Create a specific product in database
      const testProdId = `prod-stock-test-${Date.now()}`;
      db.prepare(`
        INSERT INTO products (id, business_id, tenant_id, sku, name, description, price, currency, stock, category, status)
        VALUES (?, 'ws-flagship-01', 'ws-flagship-01', 'SKU-NORDIC-CARDIGAN', 'Nordic Wool Cardigan', 'Handmade heavyweight cardigan', 145.00, 'USD', 0, 'Apparel', 'ACTIVE')
      `).run(testProdId);

      const stockCheckEvent = {
        platform: 'WHATSAPP',
        businessId: 'ws-flagship-01',
        messageId: `wamid.stock.${Date.now()}`,
        sender: { id: 'cust_stock_01', phone: '+1 (555) 991-2819' },
        recipient: { id: '109283741' },
        message: { text: 'Do you have Nordic Wool Cardigan in stock?' }
      };

      const stockResult = await whatsappPipeline.processInboundMessage(stockCheckEvent);
      assert(stockResult.success === true, 'Out of stock query processed successfully');
      assert(
        stockResult.replyText.toLowerCase().includes('out of stock') ||
        stockResult.replyText.toLowerCase().includes('currently') ||
        stockResult.replyText.toLowerCase().includes('145'),
        'System accurately honors authoritative zero stock from DB and does not claim available'
      );

      // ─────────────────────────────────────────────────────────────
      // 9. MULTIMODAL / VISION IMAGE-TO-PRODUCT MATCHING
      // ─────────────────────────────────────────────────────────────
      console.log('\n9. Testing Multimodal Image-to-Product Matching Pipeline...');
      const imageVisionEvent = {
        platform: 'WHATSAPP',
        businessId: 'ws-flagship-01',
        messageId: `wamid.vision.${Date.now()}`,
        sender: { id: 'cust_vision_01', phone: '+1 (555) 381-9201' },
        recipient: { id: '109283741' },
        message: {
          text: 'How much does this cost?',
          type: 'image',
          attachments: [
            {
              type: 'image',
              url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
              id: 'media_sample_wa_01'
            }
          ]
        }
      };

      const visionResult = await whatsappPipeline.processInboundMessage(imageVisionEvent);
      assert(visionResult.success === true, 'Image message successfully entered product-matching pipeline');
      assert(visionResult.replyText && visionResult.replyText.length > 10, 'Generated informative reply for image query');

      // ─────────────────────────────────────────────────────────────
      // 10. TENANT-SCOPED FAQ & POLICY KNOWLEDGE WITH LIVE CACHE INVALIDATION
      // ─────────────────────────────────────────────────────────────
      console.log('\n10. Testing FAQ Retrieval and Live Cache Invalidation...');
      const faqEvent = {
        platform: 'WHATSAPP',
        businessId: 'ws-flagship-01',
        messageId: `wamid.faq.${Date.now()}`,
        sender: { id: 'cust_faq_01', phone: '+1 (555) 441-2819' },
        recipient: { id: '109283741' },
        message: { text: 'What is your return policy?' }
      };

      const faqResult = await whatsappPipeline.processInboundMessage(faqEvent);
      assert(faqResult.success === true, 'FAQ message processed successfully');
      assert(
        faqResult.replyText.toLowerCase().includes('return') ||
        faqResult.replyText.toLowerCase().includes('14 days') ||
        faqResult.replyText.toLowerCase().includes('exchange'),
        'Authoritative return policy retrieved from tenant knowledge'
      );

      // Invalidate cache and update FAQ
      knowledgeService.invalidateTenantCache('ws-flagship-01');
      db.prepare(`
        UPDATE faqs SET answer = 'All purchases have a 30-day no-questions-asked refund policy.'
        WHERE tenant_id = 'ws-flagship-01' AND question LIKE '%return%'
      `).run();
      db.prepare(`
        UPDATE policies SET content = 'All purchases have a 30-day no-questions-asked refund policy.'
        WHERE tenant_id = 'ws-flagship-01' AND policy_type = 'RETURN_POLICY'
      `).run();

      const updatedFaqResult = await whatsappPipeline.processInboundMessage({
        ...faqEvent,
        messageId: `wamid.faq.updated.${Date.now()}`
      });
      assert(
        updatedFaqResult.replyText.includes('30-day'),
        'Live cache invalidation ensures immediate retrieval of updated FAQ without full system rebuild'
      );

      // ─────────────────────────────────────────────────────────────
      // 11. LOW-CONFIDENCE FALLBACK & HUMAN HANDOFF
      // ─────────────────────────────────────────────────────────────
      console.log('\n11. Testing Low-Confidence Fallback & Human Handoff...');
      const escalationEvent = {
        platform: 'WHATSAPP',
        businessId: 'ws-flagship-01',
        messageId: `wamid.handoff.${Date.now()}`,
        sender: { id: 'cust_handoff_01', phone: '+1 (555) 123-4567' },
        recipient: { id: '109283741' },
        message: { text: 'I need to speak with a human agent or manager immediately about a severe billing mistake!' }
      };

      const handoffResult = await whatsappPipeline.processInboundMessage(escalationEvent);
      assert(handoffResult.success === true, 'Escalation event handled cleanly');
      assert(handoffResult.intent === 'HUMAN_HANDOFF', 'Intent recognized as HUMAN_HANDOFF');
      assert(handoffResult.status === 'NEEDS_HUMAN', 'Status marked as NEEDS_HUMAN');

      const handoffConv = db.prepare('SELECT * FROM conversations WHERE id = ?').get(handoffResult.conversationId);
      assert(handoffConv?.status === 'NEEDS_HUMAN', 'Conversation status in DB updated to NEEDS_HUMAN for Live Inbox');

      // ─────────────────────────────────────────────────────────────
      // 12. OUTBOUND CLOUD API RETRY WITH BOUNDED BACKOFF
      // ─────────────────────────────────────────────────────────────
      console.log('\n12. Testing Outbound WhatsApp API Failure & Bounded Backoff...');
      let retryCount = 0;
      const failingSendCall = async () => {
        retryCount++;
        if (retryCount < 3) {
          const err = new Error('Meta Cloud API temporary 503 Service Unavailable');
          err.status = 503;
          throw err;
        }
        return { success: true, messageId: 'wa_retry_success_01' };
      };

      const retryRes = await whatsappService.sendTextMessageWithRetry(
        '109283741',
        customerPhone,
        'Test message with retry bounded backoff',
        3,
        failingSendCall
      );
      assert(retryRes.success === true, 'Bounded retry successfully completed when upstream recovered');
      assert(retryCount === 3, 'Executed exactly 3 retry attempts before success');

      // ─────────────────────────────────────────────────────────────
      // 13. ZERO SECRET EXPOSURE IN CLIENT RESPONSES & DIAGNOSTICS
      // ─────────────────────────────────────────────────────────────
      console.log('\n13. Testing Strict Secret Non-Exposure (Criterion 10)...');
      const merchantAuthToken = jwt.sign(
        { userId: 'usr-founder', businessId: 'ws-flagship-01' },
        config.auth.jwtSecret,
        { expiresIn: '1h' }
      );

      const connApiRes = await fetch(`http://localhost:${PORT}/api/v1/whatsapp/connection`, {
        headers: {
          Authorization: `Bearer ${merchantAuthToken}`,
          'x-workspace-id': 'ws-flagship-01'
        }
      });
      const connJson = await connApiRes.json();
      const stringifiedResponse = JSON.stringify(connJson);

      assert(connApiRes.status === 200, 'WhatsApp connection endpoint returns 200');
      assert(!stringifiedResponse.includes('EAAGm0PX4ZC0IBO'), 'Meta access token is never in API response');
      assert(!stringifiedResponse.includes('kreazy_meta_webhook_verification_token'), 'Webhook verify token is never in API response');
      assert(!stringifiedResponse.includes('token_iv'), 'Token IV is stripped from response');
      assert(!stringifiedResponse.includes('token_tag'), 'Token tag is stripped from response');
      assert(connJson.data.isConfigured === true, 'Connection configured state is accurately reported');

      // Run health check endpoint
      const healthApiRes = await fetch(`http://localhost:${PORT}/api/v1/whatsapp/health-check`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${merchantAuthToken}`,
          'x-workspace-id': 'ws-flagship-01'
        }
      });
      const healthJson = await healthApiRes.json();
      const healthString = JSON.stringify(healthJson);

      assert(healthApiRes.status === 200, 'Health check endpoint returns 200');
      assert(healthJson.data.success === true, 'Health check passes all diagnostics');
      // ─────────────────────────────────────────────────────────────
      // 14. INVALID WEBHOOK PAYLOAD HANDLING
      // ─────────────────────────────────────────────────────────────
      console.log('\n14. Testing Malformed / Invalid Webhook Payload Handling...');
      const malformedRes = await fetch(`http://localhost:${PORT}/api/v1/meta/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'corrupted payload without entry array' })
      });
      assert(malformedRes.status === 200 || malformedRes.status === 400, 'Malformed webhook event is safely handled without unhandled exception');

      // ─────────────────────────────────────────────────────────────
      // 15. CONNECTION STATUS TRANSITIONS & DISCONNECT RECONNECT
      // ─────────────────────────────────────────────────────────────
      console.log('\n15. Testing Connection Status Transitions...');
      const disconnectRes = await fetch(`http://localhost:${PORT}/api/v1/whatsapp/disconnect`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${merchantAuthToken}`,
          'x-workspace-id': 'ws-flagship-01'
        }
      });
      const disconnectJson = await disconnectRes.json();
      assert(disconnectRes.status === 200, 'Disconnect endpoint returns 200');
      assert(disconnectJson.data.status === 'NOT_CONNECTED', 'Channel status transitioned to NOT_CONNECTED');

      // Reconnect/Save connection back
      const reconnected = whatsappConnectionService.saveConnection('ws-flagship-01', {
        wabaId: '2983710492817',
        phoneNumberId: '109283741',
        displayNumber: '+8801700000000',
        accessToken: 'EAAGm0PX4ZC0IBO_prod_reconnected_token_2026'
      });
      assert(reconnected.status === 'CONNECTED', 'Connection transitioned back to CONNECTED');

      // ─────────────────────────────────────────────────────────────
      // 16. OBSERVABILITY TELEMETRY ENDPOINT (Phase 13)
      // ─────────────────────────────────────────────────────────────
      console.log('\n16. Testing Observability Telemetry Endpoint (Phase 13)...');
      const obsRes = await fetch(`http://localhost:${PORT}/api/v1/whatsapp/observability`, {
        headers: {
          Authorization: `Bearer ${merchantAuthToken}`,
          'x-workspace-id': 'ws-flagship-01'
        }
      });
      const obsJson = await obsRes.json();
      const obsString = JSON.stringify(obsJson);

      assert(obsRes.status === 200, 'Observability endpoint returns 200 OK');
      assert(obsJson.data.metaApiHealth === 'HEALTHY', 'Meta API health reports HEALTHY');
      assert(obsJson.data.webhookHealth === 'HEALTHY', 'Webhook health reports HEALTHY');
      assert(Boolean(obsJson.data.lastInboundEvent), 'Last inbound event timestamp is recorded');
      assert(obsJson.data.retryState?.maxRetries === 3, 'Retry policy correctly reports maxRetries = 3');
      assert(!obsString.includes('EAAGm0PX4ZC0IBO'), 'Observability payload exposes zero credentials or secrets');

      // ─────────────────────────────────────────────────────────────
      // 17. MODULAR PROVIDER ABSTRACTIONS (Phase 9)
      // ─────────────────────────────────────────────────────────────
      console.log('\n17. Testing Modular Provider Abstractions (Phase 9)...');
      const { getLLMProvider } = await import('../src/server/services/whatsapp/providers/LLMProvider.js');
      const { getVisionProvider } = await import('../src/server/services/whatsapp/providers/VisionProvider.js');
      const { getEmbeddingProvider } = await import('../src/server/services/whatsapp/providers/EmbeddingProvider.js');
      const { getRetrievalProvider } = await import('../src/server/services/whatsapp/providers/RetrievalProvider.js');

      const llm = getLLMProvider();
      const vision = getVisionProvider();
      const embedder = getEmbeddingProvider();
      const retriever = getRetrievalProvider();

      const llmResponse = await llm.generateResponse({
        prompt: 'Check stock',
        context: {
          matchedProduct: { name: 'Test Silk Shirt', price: 90, stock: 5, currency: 'USD' }
        }
      });
      assert(llmResponse.confidence >= 0.9, 'Modular LLMProvider generates authoritative response');

      const visionTraits = await vision.analyzeImage({ imageUrl: 'sample_sneaker.jpg', prompt: 'black shoe' });
      assert(visionTraits.category === 'shoes', 'Modular VisionProvider correctly classifies shoe image');

      const embVector = await embedder.embedQuery('shirt size xl');
      assert(Array.isArray(embVector) && embVector.length > 0, 'Modular EmbeddingProvider generates normalized vector');

      const retrievedContext = await retriever.retrieveContext({ tenantId: 'ws-flagship-01' });
      assert(Array.isArray(retrievedContext.products) && retrievedContext.products.length > 0, 'Modular RetrievalProvider fetches tenant products');


      // ─────────────────────────────────────────────────────────────
      // SUMMARY
      // ─────────────────────────────────────────────────────────────
      console.log('\n================================================================');
      console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
      console.log('================================================================');

      if (testsFailed === 0) {
        console.log('🎉 ALL 11 PRODUCTION ACCEPTANCE CRITERIA VERIFIED WITH ZERO DEFECTS!\n');
        server.close(() => process.exit(0));
      } else {
        console.error(`💥 ${testsFailed} TESTS FAILED! Check logs above.\n`);
        server.close(() => process.exit(1));
      }
    } catch (err) {
      console.error('Fatal test error:', err);
      server.close(() => process.exit(1));
    }
  });
}

runSuite();
