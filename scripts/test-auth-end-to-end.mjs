import http from 'http';
import assert from 'assert';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/server/app/app.js';
import { getDatabase, closeDatabase } from '../src/server/config/database.js';
import { apiClient } from '../src/api/client.js';
import { authService, adminService, productService } from '../src/services/api.js';

console.log('============================================================');
console.log('STARTING KREAZYAI PRODUCTION AUTHENTICATION END-TO-END TESTS');
console.log('============================================================\n');

const TEST_PORT = 5094;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api/v1`;

let totalTests = 0;
let passedTests = 0;

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

async function main() {
  process.env.DATABASE_URL = ':memory:';
  process.env.PORT = String(TEST_PORT);
  process.env.JWT_SECRET = 'test_secret_key_kreazy_2026_auth_e2e_suite';
  process.env.SUPER_ADMIN_PASSWORD = 'AdminSecurePass2026!';
  process.env.META_WEBHOOK_VERIFY_TOKEN = 'kreazy_meta_verify_secret_2026';

  const db = getDatabase(':memory:');
  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  apiClient.setBaseUrl(BASE_URL);

  let userAToken = null;
  let userAWorkspaceId = null;
  let userAId = null;
  const userAEmail = `merchant_${Date.now()}@testbrand.com`;

  let userBToken = null;
  let userBWorkspaceId = null;
  const userBEmail = `merchant_b_${Date.now()}@otherbrand.com`;

  let adminToken = null;

  try {
    // -------------------------------------------------------------
    // TEST 1: New User Registration & Relational Persistence
    // -------------------------------------------------------------
    await asyncTest('1.1 New merchant registers and persists user + business in SQLite database', async () => {
      const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Connor',
          email: userAEmail,
          password: 'Password123!',
          storeName: 'Cyberdyne Apparel',
          plan: 'Growth ($119/mo)'
        })
      });

      assert.strictEqual(regRes.status, 201, 'Registration must return HTTP 201 Created');
      const json = await regRes.json();
      assert.strictEqual(json.success, true, 'Response must be success: true');
      assert.ok(json.data.token, 'Must return JWT token');
      assert.ok(json.data.user, 'Must return user object');
      assert.strictEqual(json.data.user.email, userAEmail);
      assert.ok(json.data.user.businessId, 'Must return businessId');
      assert.ok(json.data.user.business_id, 'Must return business_id');
      assert.strictEqual(json.data.user.role, 'OWNER');
      assert.strictEqual(json.data.user.is_super_admin, false);

      userAToken = json.data.token;
      userAWorkspaceId = json.data.user.businessId;
      userAId = json.data.user.id;

      // Verify direct database records
      const dbUser = db.prepare('SELECT * FROM users WHERE email = ?').get(userAEmail);
      assert.ok(dbUser, 'User must exist in SQLite users table');
      assert.strictEqual(dbUser.business_id, userAWorkspaceId, 'User must be linked to business');
      assert.strictEqual(dbUser.is_super_admin, 0, 'User must not be super admin');

      const dbBiz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(userAWorkspaceId);
      assert.ok(dbBiz, 'Business must exist in SQLite businesses table');
      assert.strictEqual(dbBiz.name, 'Cyberdyne Apparel');

      const dbAiCfg = db.prepare('SELECT * FROM ai_configs WHERE business_id = ?').get(userAWorkspaceId);
      assert.ok(dbAiCfg, 'Default AI config must be created in SQLite');
    });

    // -------------------------------------------------------------
    // TEST 2: Duplicate Email Handling (409 Conflict)
    // -------------------------------------------------------------
    await asyncTest('1.2 Duplicate email registration returns HTTP 409 Conflict', async () => {
      // Test case-insensitive duplicate check
      const dupRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Sarah Imposter',
          email: userAEmail.toUpperCase(),
          password: 'Password123!',
          storeName: 'Another Store'
        })
      });

      assert.strictEqual(dupRes.status, 409, 'Must return HTTP 409 Conflict');
      const json = await dupRes.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error.code, 'CONFLICT');
      assert.ok(json.error.message.includes('already exists'), 'Message must indicate account exists');
    });

    // -------------------------------------------------------------
    // TEST 3: Normal User Login
    // -------------------------------------------------------------
    await asyncTest('1.3 Normal user login with valid credentials succeeds', async () => {
      const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userAEmail,
          password: 'Password123!'
        })
      });

      assert.strictEqual(loginRes.status, 200, 'Must return HTTP 200 OK');
      const json = await loginRes.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.token, 'Must return JWT token');
      assert.strictEqual(json.data.user.id, userAId);
      assert.strictEqual(json.data.user.businessId, userAWorkspaceId);
      assert.strictEqual(json.data.user.business_id, userAWorkspaceId);
    });

    // -------------------------------------------------------------
    // TEST 4: Invalid Password Rejection
    // -------------------------------------------------------------
    await asyncTest('1.4 Normal user login with invalid password returns HTTP 401', async () => {
      const failRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userAEmail,
          password: 'WrongPassword999!'
        })
      });

      assert.strictEqual(failRes.status, 401, 'Must return HTTP 401 Unauthorized');
      const json = await failRes.json();
      assert.strictEqual(json.success, false);
      assert.strictEqual(json.error.code, 'UNAUTHORIZED');
    });

    // -------------------------------------------------------------
    // TEST 5: Super Admin Login & Dedicated Endpoint
    // -------------------------------------------------------------
    await asyncTest('1.5 Super Admin login via /auth/admin-login returns admin JWT', async () => {
      const adminRes = await fetch(`${BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'kreazyai@gmail.com',
          password: '12kreazyai12@'
        })
      });

      assert.strictEqual(adminRes.status, 200, 'Must return HTTP 200 OK');
      const json = await adminRes.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.token, 'Must return JWT token');
      assert.strictEqual(json.data.user.is_super_admin, true);
      assert.strictEqual(json.data.user.role, 'SUPER_ADMIN');

      adminToken = json.data.token;
    });

    // -------------------------------------------------------------
    // TEST 6: Normal User Denied Super Admin Access
    // -------------------------------------------------------------
    await asyncTest('1.6 Normal merchant token denied Super Admin endpoints (HTTP 403)', async () => {
      const adminUsersRes = await fetch(`${BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userAToken}`
        }
      });
      assert.strictEqual(adminUsersRes.status, 403, 'Normal user must be blocked from /admin/users');

      const adminBizRes = await fetch(`${BASE_URL}/admin/businesses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userAToken}`
        }
      });
      assert.strictEqual(adminBizRes.status, 403, 'Normal user must be blocked from /admin/businesses');

      // Attempting to use normal user credentials at /auth/admin-login
      const adminLoginRes = await fetch(`${BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userAEmail,
          password: 'Password123!'
        })
      });
      assert.strictEqual(adminLoginRes.status, 401, 'Normal user credentials must be rejected at admin login');
    });

    // -------------------------------------------------------------
    // TEST 7: Super Admin Blocked From Normal /auth/login
    // -------------------------------------------------------------
    await asyncTest('1.7 Super Admin accounts blocked from /auth/login with descriptive guidance', async () => {
      const adminNormalLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'kreazyai@gmail.com',
          password: '12kreazyai12@'
        })
      });

      assert.strictEqual(adminNormalLoginRes.status, 403, 'Must return HTTP 403');
      const json = await adminNormalLoginRes.json();
      assert.strictEqual(json.error.code, 'SUPER_ADMIN_PORTAL_REQUIRED');
      assert.ok(json.error.message.includes('/admin'), 'Must guide user to /admin portal');
    });

    // -------------------------------------------------------------
    // TEST 8: Registered User Visible in Super Admin Users List
    // -------------------------------------------------------------
    await asyncTest('1.8 Newly registered user is visible in Super Admin /admin/users list', async () => {
      const res = await fetch(`${BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      assert.strictEqual(res.status, 200, 'Super admin can access /admin/users');
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data.users), 'users must be an array');
      assert.ok(json.data.users.length > 0, 'Users array must NOT be empty after registration');

      const found = json.data.users.find(u => u.email === userAEmail);
      assert.ok(found, 'Newly registered user must be present in Super Admin users list');
      assert.strictEqual(found.name, 'Sarah Connor');
      assert.strictEqual(found.businessId, userAWorkspaceId);
      assert.strictEqual(found.business, 'Cyberdyne Apparel');
    });

    // -------------------------------------------------------------
    // TEST 9: Business Visible in Super Admin Businesses List & Metrics
    // -------------------------------------------------------------
    await asyncTest('1.9 Newly created business visible in Super Admin /admin/businesses and metrics', async () => {
      const res = await fetch(`${BASE_URL}/admin/businesses`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.ok(Array.isArray(json.data.workspaces || json.data.businesses), 'businesses must be an array');
      const list = json.data.workspaces || json.data.businesses;
      const foundBiz = list.find(b => b.id === userAWorkspaceId);
      assert.ok(foundBiz, 'Business must be in Super Admin list');
      assert.strictEqual(foundBiz.name, 'Cyberdyne Apparel');

      // Check platform metrics
      const metricsRes = await fetch(`${BASE_URL}/admin/metrics`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      assert.strictEqual(metricsRes.status, 200);
      const metricsJson = await metricsRes.json();
      assert.ok(metricsJson.data.totalUsers >= 1, 'Total users metric must be >= 1');
      assert.ok(metricsJson.data.totalBusinesses >= 1, 'Total businesses metric must be >= 1');
    });

    // -------------------------------------------------------------
    // TEST 10: Multi-Tenant Isolation Between Two Different Businesses
    // -------------------------------------------------------------
    await asyncTest('1.10 Strict multi-tenant isolation enforced between Business A and Business B', async () => {
      // 1. Register User B with Business B
      const regB = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Connor',
          email: userBEmail,
          password: 'Password123!',
          storeName: 'Resistance Outpost',
          plan: 'Growth ($119/mo)'
        })
      });
      assert.strictEqual(regB.status, 201);
      const jsonB = await regB.json();
      userBToken = jsonB.data.token;
      userBWorkspaceId = jsonB.data.user.businessId;

      // 2. User A creates a product in Business A
      const prodARes = await fetch(`${BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userAToken}`
        },
        body: JSON.stringify({
          name: 'T-800 Leather Jacket',
          price: 299.00,
          stock: 15,
          sku: 'CYBER-JACKET-01'
        })
      });
      assert.strictEqual(prodARes.status, 201);
      const prodAJson = await prodARes.json();
      const productAId = prodAJson.data.id;

      // 3. User B retrieves their products -> must NOT see Business A's product
      const prodBListRes = await fetch(`${BASE_URL}/products`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userBToken}`
        }
      });
      assert.strictEqual(prodBListRes.status, 200);
      const prodBList = await prodBListRes.json();
      const leaked = (prodBList.data || []).find(p => p.id === productAId || p.name === 'T-800 Leather Jacket');
      assert.strictEqual(leaked, undefined, 'User B must NEVER see products belonging to User A');

      // 4. User B attempts to access Product A by ID -> must return 404 (or 403)
      const prodADetailByB = await fetch(`${BASE_URL}/products/${productAId}`, {
        headers: { 'Authorization': `Bearer ${userBToken}` }
      });
      assert.strictEqual(prodADetailByB.status, 404, 'User B cannot fetch User A product by ID');

      // 5. User B attempts spoofing Business A via X-Workspace-Id header -> rejected 403 TENANT_MISMATCH
      const spoofRes = await fetch(`${BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${userBToken}`,
          'X-Workspace-Id': userAWorkspaceId
        }
      });
      assert.strictEqual(spoofRes.status, 403, 'Spoofed X-Workspace-Id must be rejected with HTTP 403');
      const spoofJson = await spoofRes.json();
      assert.strictEqual(spoofJson.error.code, 'TENANT_MISMATCH');
    });

    // -------------------------------------------------------------
    // TEST 11: Session Restoration via /auth/me
    // -------------------------------------------------------------
    await asyncTest('1.11 /auth/me restores verified session and workspace context', async () => {
      const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${userAToken}` }
      });

      assert.strictEqual(meRes.status, 200);
      const json = await meRes.json();
      assert.strictEqual(json.data.user.id, userAId);
      assert.strictEqual(json.data.user.businessId, userAWorkspaceId);
      assert.strictEqual(json.data.user.businessName, 'Cyberdyne Apparel');

      // Test with invalid token
      const invalidMeRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { 'Authorization': 'Bearer invalid.token.payload' }
      });
      assert.strictEqual(invalidMeRes.status, 401, 'Invalid token must return 401');
    });

    // -------------------------------------------------------------
    // TEST 12: Onboarding Data Persistence
    // -------------------------------------------------------------
    await asyncTest('1.12 Business settings & onboarding changes persist correctly in database', async () => {
      const updateRes = await fetch(`${BASE_URL}/settings/business`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userAToken}`
        },
        body: JSON.stringify({
          businessDescription: 'Autonomous apparel logistics and tactical garments.',
          website: 'https://cyberdyne-apparel.com',
          city: 'Los Angeles',
          country: 'United States'
        })
      });

      assert.strictEqual(updateRes.status, 200);

      // Verify direct database persistence
      const profileRow = db.prepare('SELECT * FROM business_profiles WHERE business_id = ?').get(userAWorkspaceId);
      assert.ok(profileRow, 'Business profile row must exist in DB');
      assert.strictEqual(profileRow.website, 'https://cyberdyne-apparel.com');
      assert.strictEqual(profileRow.city, 'Los Angeles');
    });

    // -------------------------------------------------------------
    // TEST 13: ApiClient and AuthService Client Flow Validation
    // -------------------------------------------------------------
    await asyncTest('1.13 authService client methods perform real auth without fake local fallbacks', async () => {
      // 1. Clean logout
      authService.logout();
      assert.strictEqual(apiClient.getAuthToken(), null);
      assert.strictEqual(apiClient.getWorkspaceId(), null);

      // 2. Login via authService
      const authed = await authService.login(userAEmail, 'Password123!');
      assert.strictEqual(authed.id, userAId);
      assert.strictEqual(authed.workspaceId, userAWorkspaceId);
      assert.strictEqual(apiClient.getWorkspaceId(), userAWorkspaceId);
      assert.ok(apiClient.getAuthToken());

      // 3. Verify session
      const verified = await authService.verifySession();
      assert.strictEqual(verified.id, userAId);
      assert.strictEqual(verified.workspaceId, userAWorkspaceId);

      // 4. Logout cleans everything
      authService.logout();
      assert.strictEqual(apiClient.getAuthToken(), null);
      assert.strictEqual(apiClient.getWorkspaceId(), null);
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
    closeDatabase();
  }

  console.log('\n============================================================');
  console.log(`ALL ${passedTests}/${totalTests} AUTH END-TO-END TESTS PASSED WITH ZERO FAILURES!`);
  console.log('============================================================');
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
