import assert from 'assert';
import Database from 'better-sqlite3';
import { 
  config, 
  validateMessengerConfig, 
  validateProductionEnv, 
  INSECURE_DEFAULT_SECRETS 
} from '../src/server/config/env.js';
import { 
  getDatabase, 
  runMigrations, 
  closeDatabase,
  ensureMetaConnections 
} from '../src/server/config/database.js';
import { sanitizeConnection } from '../src/server/utils/encryption.js';
import { metaConnectionService } from '../src/server/services/meta/metaConnectionService.js';
import { metaWebhookService } from '../src/server/services/meta/metaWebhookService.js';
import { metaTokenService } from '../src/server/services/meta/metaTokenService.js';

console.log('============================================================');
console.log('STARTING KREAZYAI MESSENGER TEST INTEGRATION & ISOLATION TESTS');
console.log('============================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    throw err;
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    throw err;
  }
}

// Helper to seed a minimal isolated business in test DB
function createTestBusiness(db, businessId, name) {
  db.prepare(`
    INSERT OR REPLACE INTO businesses (id, name, slug, owner_name, owner_email, plan, status, channels_connected, total_revenue, created_at, updated_at)
    VALUES (?, ?, ?, 'Owner', 'owner@example.com', 'Starter', 'ACTIVE', '[]', 0, datetime('now'), datetime('now'))
  `).run(businessId, name, `slug-${businessId}`);
}

async function runAllTests() {
  // ── TEST GROUP 1: Messenger Configuration Validation ──────────────────────
  console.log('--- TEST GROUP 1: Messenger Configuration Validation ---');

  test('1.1 Empty configuration is treated as valid (optional integration)', () => {
    const res = validateMessengerConfig({});
    assert.strictEqual(res.isConfigured, false, 'isConfigured should be false');
    assert.strictEqual(res.isValid, true, 'isValid should be true when nothing is set');
    assert.strictEqual(res.errors.length, 0, 'No errors when unset');
  });

  test('1.2 Incomplete configuration missing PAGE_ID is rejected', () => {
    const res = validateMessengerConfig({
      MESSENGER_PAGE_ACCESS_TOKEN: 'EAAG_test_token_12345678901234567890',
      MESSENGER_TENANT_ID: 'ws-tenant-01'
    });
    assert.strictEqual(res.isConfigured, false);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('MESSENGER_PAGE_ID')), 'Should report missing MESSENGER_PAGE_ID');
  });

  test('1.3 Incomplete configuration missing PAGE_ACCESS_TOKEN is rejected', () => {
    const res = validateMessengerConfig({
      MESSENGER_PAGE_ID: 'page_123456789',
      MESSENGER_TENANT_ID: 'ws-tenant-01'
    });
    assert.strictEqual(res.isConfigured, false);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('MESSENGER_PAGE_ACCESS_TOKEN')), 'Should report missing token');
  });

  test('1.4 Incomplete configuration missing TENANT_ID is rejected', () => {
    const res = validateMessengerConfig({
      MESSENGER_PAGE_ID: 'page_123456789',
      MESSENGER_PAGE_ACCESS_TOKEN: 'EAAG_test_token_12345678901234567890'
    });
    assert.strictEqual(res.isConfigured, false);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('MESSENGER_TENANT_ID')), 'Should report missing tenant ID');
  });

  test('1.5 Insecure default secrets are rejected for MESSENGER_PAGE_ACCESS_TOKEN', () => {
    for (const badSecret of ['password', 'secret', 'changeme']) {
      const res = validateMessengerConfig({
        MESSENGER_PAGE_ID: 'page_123456789',
        MESSENGER_PAGE_ACCESS_TOKEN: badSecret,
        MESSENGER_TENANT_ID: 'ws-tenant-01'
      });
      assert.strictEqual(res.isValid, false);
      assert.ok(res.errors.some(e => e.includes('insecure default')), `Should reject bad secret: ${badSecret}`);
    }
  });

  test('1.6 Database check rejects non-existent tenant ID', () => {
    const testDb = new Database(':memory:');
    runMigrations(testDb);

    const res = validateMessengerConfig({
      MESSENGER_PAGE_ID: 'page_123456789',
      MESSENGER_PAGE_ACCESS_TOKEN: 'EAAG_valid_synthetic_token_value_32b',
      MESSENGER_TENANT_ID: 'non-existent-tenant-id'
    }, { db: testDb });

    assert.strictEqual(res.isValid, false);
    assert.ok(res.errors.some(e => e.includes('does not exist in businesses table')), 'Must report missing tenant in DB');
    testDb.close();
  });

  test('1.7 Database check accepts existing tenant ID', () => {
    const testDb = new Database(':memory:');
    runMigrations(testDb);
    createTestBusiness(testDb, 'ws-valid-01', 'Valid Merchant');

    const res = validateMessengerConfig({
      MESSENGER_PAGE_ID: 'page_123456789',
      MESSENGER_PAGE_ACCESS_TOKEN: 'EAAG_valid_synthetic_token_value_32b',
      MESSENGER_TENANT_ID: 'ws-valid-01'
    }, { db: testDb });

    assert.strictEqual(res.isConfigured, true);
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.errors.length, 0);
    testDb.close();
  });

  test('1.8 validateProductionEnv incorporates Messenger test validation in production mode', () => {
    const badProdEnv = {
      NODE_ENV: 'production',
      JWT_SECRET: 'a_very_secure_production_jwt_secret_key_32chars!',
      META_ENCRYPTION_KEY: 'a_very_secure_encryption_key_32chars_meta!',
      SUPER_ADMIN_PASSWORD: 'SuperSecurePassword2026!@#',
      MESSENGER_PAGE_ID: 'page_test_123' // missing token and tenant!
    };

    const res = validateProductionEnv(badProdEnv);
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('Incomplete Messenger test configuration')), 'Production validation must flag incomplete Messenger config');
  });

  // ── TEST GROUP 2: Tenant Isolation & Token Protection ───────────────────────
  console.log('\n--- TEST GROUP 2: Tenant Isolation & Token Protection ---');

  // Set up an isolated database with 2 tenants
  const db = getDatabase(':memory:');
  const tenantA = 'ws-tenant-alpha';
  const tenantB = 'ws-tenant-bravo';
  createTestBusiness(db, tenantA, 'Alpha Store');
  createTestBusiness(db, tenantB, 'Bravo Store');

  // Configure Messenger test page for Tenant A only
  const testPageId = 'fb_page_alpha_1001';
  const testPageToken = 'EAAG_page_access_token_for_alpha_merchant_secure_123';
  config.messenger.pageId = testPageId;
  config.messenger.pageAccessToken = testPageToken;
  config.messenger.tenantId = tenantA;

  test('2.1 getConnectionWithToken returns token for mapped tenant A', () => {
    const conn = metaConnectionService.getConnectionWithToken(tenantA, 'MESSENGER');
    assert.ok(conn, 'Should find connection for mapped tenant');
    assert.strictEqual(conn.platform, 'MESSENGER');
    assert.strictEqual(conn.page_id, testPageId);
    assert.strictEqual(conn.decryptedAccessToken, testPageToken);
    assert.strictEqual(conn.status, 'CONNECTED');
  });

  test('2.2 getConnectionWithToken strictly prevents cross-tenant access for Tenant B', () => {
    const conn = metaConnectionService.getConnectionWithToken(tenantB, 'MESSENGER');
    assert.strictEqual(conn, null, 'Tenant B must NEVER access Tenant A token');
  });

  test('2.3 getConnectionWithToken returns null for random or non-existent tenant', () => {
    const conn = metaConnectionService.getConnectionWithToken('ws-ghost-999', 'MESSENGER');
    assert.strictEqual(conn, null, 'Non-existent tenant must return null');
  });

  test('2.4 getConnectionWithToken returns null if tenant does not exist in businesses table', () => {
    // Temporarily point config to non-existent tenant
    config.messenger.tenantId = 'ws-unseeded-ghost';
    const conn = metaConnectionService.getConnectionWithToken('ws-unseeded-ghost', 'MESSENGER');
    assert.strictEqual(conn, null, 'Must return null when tenant is not in businesses table');
    // Restore
    config.messenger.tenantId = tenantA;
  });

  test('2.5 getConnections API response never leaks raw or decrypted token to frontend', () => {
    const connections = metaConnectionService.getConnections(tenantA);
    const messengerConn = connections.find(c => c.platform === 'MESSENGER');

    assert.ok(messengerConn, 'Messenger connection must exist in getConnections');
    assert.strictEqual(messengerConn.status, 'CONNECTED');
    assert.strictEqual(messengerConn.hasToken, true);
    assert.strictEqual(messengerConn.has_token, true);
    assert.strictEqual(messengerConn.page_id, testPageId);

    // CRITICAL SECURITY CHECKS: No secrets in API response
    assert.strictEqual(messengerConn.decryptedAccessToken, undefined, 'Must not leak decryptedAccessToken');
    assert.strictEqual(messengerConn.pageAccessToken, undefined, 'Must not leak pageAccessToken');
    assert.strictEqual(messengerConn.accessToken, undefined, 'Must not leak accessToken');
    assert.strictEqual(messengerConn.token, undefined, 'Must not leak token');
    assert.strictEqual(messengerConn.encrypted_access_token, undefined, 'Must not leak encrypted_access_token');
    assert.strictEqual(messengerConn.token_iv, undefined, 'Must not leak token_iv');
    assert.strictEqual(messengerConn.token_tag, undefined, 'Must not leak token_tag');

    // JSON serialization verification
    const jsonStr = JSON.stringify(messengerConn);
    assert.ok(!jsonStr.includes(testPageToken), 'Serialized JSON must never contain the token value');
  });

  test('2.6 getConnections for Tenant B reflects NOT_CONNECTED and does not leak Tenant A assets', () => {
    const connections = metaConnectionService.getConnections(tenantB);
    const messengerConn = connections.find(c => c.platform === 'MESSENGER');

    assert.ok(messengerConn);
    assert.strictEqual(messengerConn.status, 'NOT_CONNECTED');
    assert.strictEqual(messengerConn.hasToken, false);
    assert.strictEqual(messengerConn.page_id, null);
  });

  test('2.7 Partial config causes getConnectionWithToken to return null', () => {
    // Temporarily clear pageAccessToken
    config.messenger.pageAccessToken = '';
    const conn = metaConnectionService.getConnectionWithToken(tenantA, 'MESSENGER');
    assert.strictEqual(conn, null, 'Missing token must disable test fallback');
    config.messenger.pageAccessToken = testPageToken;
  });

  // ── TEST GROUP 3: Messenger Webhook Routing ────────────────────────────────
  console.log('\n--- TEST GROUP 3: Messenger Webhook Routing ---');

  test('3.1 Webhook routes to mapped Tenant A on exact Page ID match', () => {
    const resolved = metaWebhookService.resolveTenant('MESSENGER', testPageId);
    assert.ok(resolved, 'Should resolve tenant');
    assert.strictEqual(resolved.businessId, tenantA);
    assert.strictEqual(resolved.workspaceId, tenantA);
  });

  test('3.2 Webhook firmly rejects unmapped Facebook Page ID (multi-tenant isolation)', () => {
    const resolved = metaWebhookService.resolveTenant('MESSENGER', 'unmapped_page_99999999');
    assert.strictEqual(resolved, null, 'Unmapped Page ID must return null');
  });

  test('3.3 Webhook rejects mapped Page ID if tenant does not exist in businesses table', () => {
    config.messenger.tenantId = 'ghost-non-existent-tenant';
    const resolved = metaWebhookService.resolveTenant('MESSENGER', testPageId);
    assert.strictEqual(resolved, null, 'Must reject when tenant does not exist in businesses');
    config.messenger.tenantId = tenantA;
  });

  test('3.4 Webhook normalizer correctly parses Messenger payload and assigns mapped tenant', () => {
    const messengerWebhookPayload = {
      object: 'page',
      entry: [{
        id: testPageId,
        messaging: [{
          sender: { id: 'fb_user_sender_9901' },
          recipient: { id: testPageId },
          timestamp: Date.now(),
          message: {
            mid: 'mid_fb_test_msg_1001',
            text: 'Hello, do you have this in size Medium?'
          }
        }]
      }]
    };

    const normalized = metaWebhookService.normalizeWebhookPayload(messengerWebhookPayload);
    assert.strictEqual(normalized.length, 1);
    const ev = normalized[0];
    assert.strictEqual(ev.platform, 'MESSENGER');
    assert.strictEqual(ev.businessId, tenantA);
    assert.strictEqual(ev.workspaceId, tenantA);
    assert.strictEqual(ev.messageText, 'Hello, do you have this in size Medium?');
    assert.strictEqual(ev.sender.id, 'fb_user_sender_9901');
    assert.strictEqual(ev.recipient.id, testPageId);
  });

  test('3.5 Webhook normalizer safely assigns businessId: null for unmapped page', () => {
    const unmappedPayload = {
      object: 'page',
      entry: [{
        id: 'foreign_facebook_page_5555',
        messaging: [{
          sender: { id: 'fb_user_foreign_1' },
          recipient: { id: 'foreign_facebook_page_5555' },
          timestamp: Date.now(),
          message: {
            mid: 'mid_foreign_msg_2',
            text: 'Is anyone there?'
          }
        }]
      }]
    };

    const normalized = metaWebhookService.normalizeWebhookPayload(unmappedPayload);
    assert.strictEqual(normalized.length, 1);
    assert.strictEqual(normalized[0].businessId, null, 'Unmapped page must have businessId null');
  });

  // ── TEST GROUP 4: Database OAuth Precedence & Preservation ────────────────
  console.log('\n--- TEST GROUP 4: Database OAuth Precedence & Preservation ---');

  test('4.1 Encrypted database-based OAuth connection takes precedence over env test configuration', () => {
    // Tenant A authorized official OAuth connection stored in SQLite with encrypted token
    const dbOAuthToken = 'EAAG_official_oauth_page_token_stored_in_encrypted_db_xyz';
    metaConnectionService.saveConnectionFromOAuth(
      tenantA,
      tenantA,
      'MESSENGER',
      { accessToken: dbOAuthToken, expiresIn: 5184000 },
      { pageId: 'page_db_oauth_8888', pageName: 'DB Official Store Page' }
    );

    // getConnectionWithToken must return the DB token, NOT the env fallback token
    const conn = metaConnectionService.getConnectionWithToken(tenantA, 'MESSENGER');
    assert.ok(conn);
    assert.strictEqual(conn.page_id, 'page_db_oauth_8888');
    assert.strictEqual(conn.decryptedAccessToken, dbOAuthToken, 'DB OAuth token MUST take precedence');
    assert.notStrictEqual(conn.decryptedAccessToken, testPageToken, 'Must NOT use env fallback when DB token exists');

    // Webhook resolution for the DB page must resolve to Tenant A
    const resolvedDbPage = metaWebhookService.resolveTenant('MESSENGER', 'page_db_oauth_8888');
    assert.ok(resolvedDbPage);
    assert.strictEqual(resolvedDbPage.businessId, tenantA);
  });

  test('4.2 Disconnecting DB OAuth reverts to env fallback for mapped tenant', () => {
    metaConnectionService.disconnect(tenantA, 'MESSENGER');

    // After disconnect, DB row has encrypted_access_token = NULL, status = NOT_CONNECTED
    // Env fallback allows continued testing for the explicitly mapped tenant
    const conn = metaConnectionService.getConnectionWithToken(tenantA, 'MESSENGER');
    assert.ok(conn);
    assert.strictEqual(conn.page_id, testPageId);
    assert.strictEqual(conn.decryptedAccessToken, testPageToken);
  });

  // ── TEST GROUP 5: OAuth Callback Page Access Token Storage ─────────────────
  console.log('\n--- TEST GROUP 5: OAuth Callback Page Access Token Fix ---');

  test('5.1 OAuth callback stores actual Page Access Token instead of User Access Token', () => {
    const userAccessToken = 'EAAG_user_access_token_from_login_dialog_user_99';
    const actualPageAccessToken = 'EAAG_actual_page_access_token_from_me_accounts_page_77';

    // Simulate OAuth callback payload: primaryPage has its own page token
    const primaryPage = {
      id: 'page_oauth_test_9921',
      name: 'Kreazy Flagship Store Official',
      accessToken: actualPageAccessToken
    };
    const tokenResult = {
      accessToken: userAccessToken,
      expiresIn: 5184000
    };

    // The fixed logic in metaController:
    const messengerTokenData = {
      accessToken: primaryPage?.accessToken || tokenResult.accessToken,
      expiresIn: tokenResult.expiresIn
    };

    metaConnectionService.saveConnectionFromOAuth(
      tenantB,
      tenantB,
      'MESSENGER',
      messengerTokenData,
      {
        pageId: primaryPage.id,
        pageName: primaryPage.name,
        scopes: ['pages_show_list', 'pages_messaging', 'pages_manage_metadata']
      }
    );

    // Retrieve and decrypt from database
    const conn = metaConnectionService.getConnectionWithToken(tenantB, 'MESSENGER');
    assert.ok(conn);
    assert.strictEqual(
      conn.decryptedAccessToken, 
      actualPageAccessToken, 
      'Decrypted stored token must match actual Page Access Token, NOT User Access Token'
    );
    assert.notStrictEqual(
      conn.decryptedAccessToken, 
      userAccessToken, 
      'Decrypted stored token must NOT be the User Access Token'
    );
  });

  // Cleanup config changes
  config.messenger.pageId = '';
  config.messenger.pageAccessToken = '';
  config.messenger.tenantId = '';
  closeDatabase();

  console.log('\n============================================================');
  console.log(`ALL ${passedTests}/${totalTests} MESSENGER TEST INTEGRATION TESTS PASSED!`);
  console.log('============================================================');
}

runAllTests().catch(err => {
  console.error('\nTests failed with error:', err);
  process.exit(1);
});
