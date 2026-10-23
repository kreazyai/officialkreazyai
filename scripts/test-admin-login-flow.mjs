import assert from 'assert';
import { createApp } from '../src/server/app/app.js';
import { getDatabase, closeDatabase } from '../src/server/config/database.js';
import { 
  apiClient, 
  normalizeApiBaseUrl, 
  resolveApiBaseUrl 
} from '../src/api/client.js';

console.log('============================================================');
console.log('STARTING KREAZYAI ADMIN LOGIN & CORS VERIFICATION TESTS');
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

async function runAllTests() {
  // ── TEST GROUP 1: URL Normalization & Resolution ──────────────────────────
  console.log('--- TEST GROUP 1: API Base URL Normalization & Resolution ---');

  test('1.1 normalizeApiBaseUrl appends /api/v1 to bare domains', () => {
    assert.strictEqual(
      normalizeApiBaseUrl('https://kreazyai.onrender.com'),
      'https://kreazyai.onrender.com/api/v1'
    );
  });

  test('1.2 normalizeApiBaseUrl strips trailing slashes before appending /api/v1', () => {
    assert.strictEqual(
      normalizeApiBaseUrl('https://kreazyai.onrender.com///'),
      'https://kreazyai.onrender.com/api/v1'
    );
  });

  test('1.3 normalizeApiBaseUrl handles URLs already ending with /api/v1', () => {
    assert.strictEqual(
      normalizeApiBaseUrl('https://kreazyai.onrender.com/api/v1'),
      'https://kreazyai.onrender.com/api/v1'
    );
    assert.strictEqual(
      normalizeApiBaseUrl('https://kreazyai.onrender.com/api/v1/'),
      'https://kreazyai.onrender.com/api/v1'
    );
  });

  test('1.4 normalizeApiBaseUrl handles URLs ending with /api', () => {
    assert.strictEqual(
      normalizeApiBaseUrl('https://kreazyai.onrender.com/api'),
      'https://kreazyai.onrender.com/api/v1'
    );
    assert.strictEqual(
      normalizeApiBaseUrl('https://kreazyai.onrender.com/api/'),
      'https://kreazyai.onrender.com/api/v1'
    );
  });

  test('1.5 apiClient.resolveUrl prevents duplicate /api/v1 segments', () => {
    apiClient.setBaseUrl('https://kreazyai.onrender.com');
    assert.strictEqual(
      apiClient.resolveUrl('/auth/admin-login'),
      'https://kreazyai.onrender.com/api/v1/auth/admin-login'
    );
    assert.strictEqual(
      apiClient.resolveUrl('/api/v1/auth/admin-login'),
      'https://kreazyai.onrender.com/api/v1/auth/admin-login'
    );
    assert.strictEqual(
      apiClient.resolveUrl('api/v1/auth/admin-login'),
      'https://kreazyai.onrender.com/api/v1/auth/admin-login'
    );
  });

  test('1.6 apiClient.resolveUrl strips trailing slashes to prevent 301 redirects', () => {
    apiClient.setBaseUrl('https://kreazyai.onrender.com');
    assert.strictEqual(
      apiClient.resolveUrl('/auth/admin-login/'),
      'https://kreazyai.onrender.com/api/v1/auth/admin-login'
    );
    assert.strictEqual(
      apiClient.resolveUrl('/auth/admin-login///'),
      'https://kreazyai.onrender.com/api/v1/auth/admin-login'
    );
  });

  test('1.7 apiClient.resolveUrl preserves full external HTTP/HTTPS URLs', () => {
    assert.strictEqual(
      apiClient.resolveUrl('https://graph.facebook.com/v21.0/me'),
      'https://graph.facebook.com/v21.0/me'
    );
  });

  // ── TEST GROUP 2: HTTP Server, Admin Login & CORS Preflight ────────────────
  console.log('\n--- TEST GROUP 2: HTTP Server, Admin Login & CORS Preflight ---');

  const db = getDatabase(':memory:');
  const app = createApp();
  const TEST_PORT = 5089;
  let server;

  await new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`[TEST SERVER] Listening on port ${TEST_PORT}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    await asyncTest('2.1 CORS preflight OPTIONS from https://kreazyai.com succeeds with 204 and correct headers', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://kreazyai.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, X-Workspace-Id, Authorization'
        }
      });

      assert.strictEqual(res.status, 204, 'Preflight must return 204 No Content');
      assert.strictEqual(
        res.headers.get('access-control-allow-origin'),
        'https://kreazyai.com',
        'Must permit https://kreazyai.com origin'
      );
      assert.strictEqual(
        res.headers.get('access-control-allow-credentials'),
        'true',
        'Must permit credentials'
      );
      const allowMethods = res.headers.get('access-control-allow-methods') || '';
      assert.ok(allowMethods.includes('POST'), 'Must allow POST method');
      const allowHeaders = (res.headers.get('access-control-allow-headers') || '').toLowerCase();
      assert.ok(allowHeaders.includes('content-type'), 'Must allow Content-Type');
      assert.ok(allowHeaders.includes('x-workspace-id'), 'Must allow X-Workspace-Id');
      assert.ok(allowHeaders.includes('authorization'), 'Must allow Authorization');
    });

    await asyncTest('2.2 CORS preflight OPTIONS from https://www.kreazyai.com succeeds', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://www.kreazyai.com',
          'Access-Control-Request-Method': 'POST'
        }
      });
      assert.strictEqual(res.status, 204);
      assert.strictEqual(res.headers.get('access-control-allow-origin'), 'https://www.kreazyai.com');
    });

    await asyncTest('2.3 CORS preflight OPTIONS from https://kreazyai.onrender.com succeeds', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://kreazyai.onrender.com',
          'Access-Control-Request-Method': 'POST'
        }
      });
      assert.strictEqual(res.status, 204);
      assert.strictEqual(res.headers.get('access-control-allow-origin'), 'https://kreazyai.onrender.com');
    });

    await asyncTest('2.4 CORS rejects unauthorized untrusted origin', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'https://malicious-attacker-domain.com',
          'Access-Control-Request-Method': 'POST'
        }
      });
      assert.notStrictEqual(
        res.headers.get('access-control-allow-origin'),
        'https://malicious-attacker-domain.com',
        'Must NOT allow unauthorized origin'
      );
    });

    await asyncTest('2.5 POST /api/v1/auth/admin-login with valid credentials returns JWT token and super admin profile', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://kreazyai.com'
        },
        body: JSON.stringify({
          email: 'kreazyai@gmail.com',
          password: 'KreazyAI_Admin_2026!'
        })
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('access-control-allow-origin'), 'https://kreazyai.com');
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.data?.token, 'Must return JWT token');
      assert.strictEqual(body.data?.user?.role, 'SUPER_ADMIN');
      assert.strictEqual(body.data?.user?.is_super_admin, true);
    });

    await asyncTest('2.6 POST /api/v1/auth/admin-login/ (trailing slash) also succeeds cleanly', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://kreazyai.com'
        },
        body: JSON.stringify({
          email: 'kreazyai@gmail.com',
          password: 'KreazyAI_Admin_2026!'
        })
      });

      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.data?.token);
    });

    await asyncTest('2.7 POST /api/v1/auth/admin-login rejects invalid password', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://kreazyai.com'
        },
        body: JSON.stringify({
          email: 'kreazyai@gmail.com',
          password: 'WrongPassword123!'
        })
      });

      assert.strictEqual(res.status, 401);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error?.message, 'Email or password is incorrect.');
    });

    await asyncTest('2.8 POST /api/v1/auth/admin-login rejects non-admin tenant user (tenant isolation)', async () => {
      // founder@kreazybrand.com is an OWNER of ws-flagship-01, NOT a SUPER_ADMIN
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://kreazyai.com'
        },
        body: JSON.stringify({
          email: 'founder@kreazybrand.com',
          password: 'demo'
        })
      });

      assert.strictEqual(res.status, 401, 'Non-super-admin merchant cannot access admin portal');
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error?.message, 'Email or password is incorrect.');
    });

    await asyncTest('2.9 GET /api/v1/auth/admin-login returns 405 Method Not Allowed instead of 404', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login`, {
        method: 'GET',
        headers: {
          'Origin': 'https://kreazyai.com'
        }
      });

      assert.strictEqual(res.status, 405, 'Must return 405 Method Not Allowed');
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.ok(body.error?.message?.includes('requires HTTP POST'));
    });

    await asyncTest('2.10 GET /api/v1/auth/admin-login/ (trailing slash) returns 405 Method Not Allowed', async () => {
      const res = await fetch(`${baseUrl}/api/v1/auth/admin-login/`, {
        method: 'GET',
        headers: {
          'Origin': 'https://kreazyai.com'
        }
      });

      assert.strictEqual(res.status, 405, 'Must return 405 Method Not Allowed');
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.ok(body.error?.message?.includes('requires HTTP POST'));
    });

  } finally {
    if (server) {
      server.close();
    }
    closeDatabase();
  }

  console.log('\n============================================================');
  console.log(`ALL ${passedTests}/${totalTests} ADMIN LOGIN & CORS TESTS PASSED!`);
  console.log('============================================================');
}

runAllTests().catch((err) => {
  console.error('\nTests failed with error:', err);
  process.exit(1);
});
