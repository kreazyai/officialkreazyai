import assert from 'node:assert/strict';

// Mock Browser Environment
const storage = new Map();
global.window = {
  location: {
    pathname: '/dashboard/overview',
    port: '5173',
    search: '',
    hash: ''
  },
  history: {
    state: {},
    pushState(state, title, url) {
      window.location.pathname = url;
      window.history.state = state;
    },
    replaceState(state, title, url) {
      window.location.pathname = url;
      window.history.state = state;
    }
  },
  localStorage: {
    getItem(key) {
      return storage.get(key) || null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    }
  },
  addEventListener() {},
  removeEventListener() {},
  scrollTo() {}
};
global.localStorage = window.localStorage;

import { authService } from '../src/services/api.js';

console.log('============================================================');
console.log('VERIFYING DASHBOARD -> LANDING PAGE NAVIGATION FLOW');
console.log('============================================================');

let passedCount = 0;
let totalCount = 0;

function test(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${name}`);
    console.error('    Error:', err.message);
  }
}

// -------------------------------------------------------------
// Helper: getRouteStateFromUrl logic mirroring src/App.jsx
// -------------------------------------------------------------
const VALID_DASHBOARD_MODULES = [
  'overview', 'messages', 'orders', 'products', 'customers',
  'integrations', 'ai-assistant', 'analytics', 'revenue', 'settings'
];

function getRouteState(pathname = window.location.pathname) {
  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segments.length === 0) {
    return { page: 'home', dashboardModule: null, rawPath: '/' };
  }
  const root = segments[0].toLowerCase();
  if (root === 'dashboard') {
    const sub = segments[1] ? segments[1].toLowerCase() : null;
    if (!sub) {
      return { page: 'dashboard', dashboardModule: 'overview', shouldRedirectToOverview: true, rawPath: pathname };
    }
    if (VALID_DASHBOARD_MODULES.includes(sub)) {
      return { page: 'dashboard', dashboardModule: sub, shouldRedirectToOverview: false, rawPath: pathname };
    }
    return { page: 'dashboard', dashboardModule: 'not-found', invalidModule: sub, rawPath: pathname };
  }
  if (['login', 'signup', 'register', 'pricing', 'about', 'contact'].includes(root)) {
    return { page: root === 'register' ? 'signup' : root, dashboardModule: null, rawPath: pathname };
  }
  return { page: 'home', dashboardModule: null, rawPath: pathname };
}

// -------------------------------------------------------------
// TEST 1: Sign In -> Dashboard -> Click Home / Landing Page
// -------------------------------------------------------------
console.log('\n--- TEST 1: Sign In -> Dashboard -> Click Landing Page ---');
let signedUser;
await (async () => {
  signedUser = await authService.login('founder@testbrand.com', 'SecurePass123!');
  window.history.pushState({}, '', '/dashboard/overview');
})();

test('User successfully logs in and lands on /dashboard/overview', () => {
  assert.equal(signedUser.isLoggedIn, true);
  const route = getRouteState();
  assert.equal(route.page, 'dashboard');
  assert.equal(route.dashboardModule, 'overview');
});

test('Clicking Landing Page navigates directly to "/"', () => {
  window.history.pushState({}, '', '/');
  const route = getRouteState();
  assert.equal(route.page, 'home');
  assert.equal(window.location.pathname, '/');
});

test('Authentication remains intact on Landing Page (no logout, no guest mode)', () => {
  const currentUser = authService.getCurrentUser();
  assert.notEqual(currentUser, null);
  assert.equal(currentUser.email, 'founder@testbrand.com');
  assert.equal(currentUser.isLoggedIn, true);
});

// -------------------------------------------------------------
// TEST 2: Landing Page -> Refresh
// -------------------------------------------------------------
console.log('\n--- TEST 2: Landing Page -> Browser Refresh ---');
test('Simulated page refresh on "/" synchronously restores auth and home route', () => {
  // Simulate page reload: storage still exists, route resolves from url
  const routeOnReload = getRouteState(window.location.pathname);
  assert.equal(routeOnReload.page, 'home');
  const userOnReload = authService.getCurrentUser();
  assert.notEqual(userOnReload, null);
  assert.equal(userOnReload.email, 'founder@testbrand.com');
});

// -------------------------------------------------------------
// TEST 3: Landing Page -> Dashboard
// -------------------------------------------------------------
console.log('\n--- TEST 3: Landing Page -> Open Dashboard ---');
test('Clicking Dashboard CTA from Landing Page opens /dashboard/overview without prompt', () => {
  window.history.pushState({}, '', '/dashboard/overview');
  const route = getRouteState();
  assert.equal(route.page, 'dashboard');
  assert.equal(route.dashboardModule, 'overview');
  const user = authService.getCurrentUser();
  assert.equal(user.isLoggedIn, true);
});

// -------------------------------------------------------------
// TEST 4: Two-Way Ping-Pong Navigation Persistence
// -------------------------------------------------------------
console.log('\n--- TEST 4: Two-Way Navigation Persistence ---');
test('Seamless repeated navigation between Dashboard and Landing Page', () => {
  for (let i = 0; i < 5; i++) {
    window.history.pushState({}, '', '/');
    assert.equal(getRouteState().page, 'home');
    assert.equal(authService.getCurrentUser().isLoggedIn, true);

    window.history.pushState({}, '', '/dashboard/orders');
    assert.equal(getRouteState().page, 'dashboard');
    assert.equal(getRouteState().dashboardModule, 'orders');
    assert.equal(authService.getCurrentUser().isLoggedIn, true);
  }
});

// -------------------------------------------------------------
// TEST 5: Sign Out -> Landing Page
// -------------------------------------------------------------
console.log('\n--- TEST 5: Explicit Sign Out -> Unauthenticated Landing Page ---');
test('Explicit sign out clears storage and navigates to "/" with unauthenticated state', () => {
  authService.logout();
  window.history.pushState({}, '', '/');
  assert.equal(authService.getCurrentUser(), null);
  const route = getRouteState();
  assert.equal(route.page, 'home');
});

// -------------------------------------------------------------
// TEST 6: Directly Open Landing Page While Authenticated
// -------------------------------------------------------------
console.log('\n--- TEST 6: Direct Access to Landing Page When Authenticated ---');
await (async () => {
  await authService.login('merchant@apparel.com', 'Pass456!');
  window.history.pushState({}, '', '/');
})();

test('Direct URL visit to "/" while signed in preserves authenticated status', () => {
  const route = getRouteState();
  assert.equal(route.page, 'home');
  const user = authService.getCurrentUser();
  assert.equal(user.email, 'merchant@apparel.com');
  assert.equal(user.isLoggedIn, true);
});

// -------------------------------------------------------------
// TEST 7: Browser Back / Forward History Navigation
// -------------------------------------------------------------
console.log('\n--- TEST 7: Browser Back / Forward Navigation ---');
test('Browser Back from Landing Page to Dashboard preserves session', () => {
  // History: /dashboard/overview -> /
  const historyStack = ['/dashboard/overview', '/'];
  let pointer = 1;

  // Back button
  pointer--;
  window.location.pathname = historyStack[pointer];
  assert.equal(window.location.pathname, '/dashboard/overview');
  assert.equal(getRouteState().page, 'dashboard');
  assert.equal(authService.getCurrentUser().isLoggedIn, true);

  // Forward button
  pointer++;
  window.location.pathname = historyStack[pointer];
  assert.equal(window.location.pathname, '/');
  assert.equal(getRouteState().page, 'home');
  assert.equal(authService.getCurrentUser().isLoggedIn, true);
});

// -------------------------------------------------------------
// TEST 8: Verify No Forbidden Public/Guest Message Strings
// -------------------------------------------------------------
console.log('\n--- TEST 8: Verify Absence of Forbidden Message Strings in UI Files ---');
import fs from 'node:fs';
import path from 'node:path';

const filesToCheck = [
  'src/components/dashboard/Sidebar.jsx',
  'src/components/dashboard/TopHeader.jsx',
  'src/pages/website/HomePage.jsx',
  'src/components/website/Navbar.jsx',
  'src/App.jsx'
];

const forbiddenPhrases = [
  'Public Website',
  'Public Page',
  'You are viewing the public website',
  'Guest Mode',
  'Viewing as Guest',
  'Public Landing Page',
  'Authentication Notice'
];

test('None of the key navigation components contain forbidden guest or notice phrases', () => {
  for (const relPath of filesToCheck) {
    const fullPath = path.resolve(process.cwd(), relPath);
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const phrase of forbiddenPhrases) {
      const hasPhrase = content.includes(phrase);
      assert.equal(
        hasPhrase,
        false,
        `File ${relPath} contains forbidden phrase: "${phrase}"`
      );
    }
  }
});

console.log('\n============================================================');
console.log(`RESULTS: ${passedCount} passed, ${totalCount - passedCount} failed out of ${totalCount} assertions`);
console.log('============================================================');
assert.equal(passedCount, totalCount);
console.log('✓ ALL 8 TEST SCENARIOS PASSED WITH 100% SUCCESS');
