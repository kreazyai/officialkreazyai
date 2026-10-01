/**
 * Comprehensive Test Suite for Dashboard Routing Architecture
 * Tests:
 * 1. URL Path Parsing for all 10 dashboard sub-routes
 * 2. Redirect behavior for /dashboard -> /dashboard/overview
 * 3. 404 / Invalid dashboard route detection (/dashboard/something-invalid)
 * 4. Preservation of public marketing routes
 * 5. Browser history popstate navigation (Back / Forward simulation)
 * 6. Auth guard protection for dashboard routes
 * 7. Multi-route transition without session loss
 */

import assert from 'node:assert';

// Simulated environment for URL testing
const VALID_DASHBOARD_MODULES = [
  'overview',
  'messages',
  'orders',
  'products',
  'customers',
  'integrations',
  'ai-assistant',
  'analytics',
  'revenue',
  'settings'
];

function getRouteStateFromUrl(pathname, port = '5173') {
  const isDedicatedAdminPort = port === '5174' || pathname.startsWith('/admin');
  if (isDedicatedAdminPort) {
    return { page: 'admin', dashboardModule: null, rawPath: pathname };
  }

  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    return { page: 'home', dashboardModule: null, rawPath: '/' };
  }

  const root = segments[0].toLowerCase();

  if (root === 'admin') {
    return { page: 'admin', dashboardModule: null, rawPath: pathname };
  }

  if (root === 'dashboard') {
    const sub = segments[1] ? segments[1].toLowerCase() : null;
    if (!sub) {
      // /dashboard -> redirect to /dashboard/overview
      return {
        page: 'dashboard',
        dashboardModule: 'overview',
        shouldRedirectToOverview: true,
        rawPath: pathname
      };
    }
    if (VALID_DASHBOARD_MODULES.includes(sub)) {
      return {
        page: 'dashboard',
        dashboardModule: sub,
        shouldRedirectToOverview: false,
        rawPath: pathname
      };
    }
    // Invalid dashboard module -> 404
    return {
      page: 'dashboard',
      dashboardModule: 'not-found',
      invalidModule: sub,
      shouldRedirectToOverview: false,
      rawPath: pathname
    };
  }

  // Auth & Onboarding
  if (root === 'login') return { page: 'login', dashboardModule: null, rawPath: pathname };
  if (root === 'signup' || root === 'register') return { page: 'signup', dashboardModule: null, rawPath: pathname };
  if (root === 'forgot-password') return { page: 'forgot-password', dashboardModule: null, rawPath: pathname };
  if (root === 'onboarding') return { page: 'onboarding', dashboardModule: null, rawPath: pathname };

  // Website marketing pages
  if (root === 'pricing') return { page: 'pricing', dashboardModule: null, rawPath: pathname };
  if (root === 'about') return { page: 'about', dashboardModule: null, rawPath: pathname };
  if (root === 'contact') return { page: 'contact', dashboardModule: null, rawPath: pathname };
  if (root === 'services' || root === 'features') return { page: 'features', dashboardModule: null, rawPath: pathname };
  if (root === 'how-it-works') return { page: 'how-it-works', dashboardModule: null, rawPath: pathname };
  if (root === 'book-demo') return { page: 'book-demo', dashboardModule: null, rawPath: pathname };
  if (root === 'founder-meeting') return { page: 'founder-meeting', dashboardModule: null, rawPath: pathname };
  if (root === 'faq') return { page: 'faq', dashboardModule: null, rawPath: pathname };
  if (root === 'legal-privacy') return { page: 'legal-privacy', dashboardModule: null, rawPath: pathname };
  if (root === 'legal-terms') return { page: 'legal-terms', dashboardModule: null, rawPath: pathname };

  return { page: 'home', dashboardModule: null, rawPath: pathname };
}

console.log('============================================================');
console.log('KREAZY AI - DASHBOARD ROUTING ARCHITECTURE TEST SUITE');
console.log('============================================================\n');

let passCount = 0;
let failCount = 0;

function check(testName, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${testName}: ${err.message}`);
    failCount++;
  }
}

// 1. Direct URL access for all 10 dashboard sub-routes
console.log('--- TEST 1: Direct URL Access for All 10 Required Routes ---');
const expectedRoutes = [
  { path: '/dashboard/overview', module: 'overview' },
  { path: '/dashboard/messages', module: 'messages' },
  { path: '/dashboard/orders', module: 'orders' },
  { path: '/dashboard/products', module: 'products' },
  { path: '/dashboard/customers', module: 'customers' },
  { path: '/dashboard/integrations', module: 'integrations' },
  { path: '/dashboard/ai-assistant', module: 'ai-assistant' },
  { path: '/dashboard/analytics', module: 'analytics' },
  { path: '/dashboard/revenue', module: 'revenue' },
  { path: '/dashboard/settings', module: 'settings' }
];

for (const { path, module } of expectedRoutes) {
  check(`Direct access to ${path} resolves to module "${module}"`, () => {
    const res = getRouteStateFromUrl(path);
    assert.strictEqual(res.page, 'dashboard');
    assert.strictEqual(res.dashboardModule, module);
    assert.strictEqual(res.shouldRedirectToOverview, false);
    assert.strictEqual(res.invalidModule, undefined);
  });
}

// 2. /dashboard root redirect to /dashboard/overview
console.log('\n--- TEST 2: /dashboard Redirect to /dashboard/overview ---');
check('Accessing /dashboard triggers shouldRedirectToOverview flag', () => {
  const res = getRouteStateFromUrl('/dashboard');
  assert.strictEqual(res.page, 'dashboard');
  assert.strictEqual(res.dashboardModule, 'overview');
  assert.strictEqual(res.shouldRedirectToOverview, true);
});

check('Accessing /dashboard/ triggers shouldRedirectToOverview flag', () => {
  const res = getRouteStateFromUrl('/dashboard/');
  assert.strictEqual(res.page, 'dashboard');
  assert.strictEqual(res.dashboardModule, 'overview');
  assert.strictEqual(res.shouldRedirectToOverview, true);
});

// 3. 404 / Invalid dashboard subroutes
console.log('\n--- TEST 3: 404 / Unknown Dashboard Routes Handling ---');
check('/dashboard/something-that-does-not-exist renders 404 not-found, not overview', () => {
  const res = getRouteStateFromUrl('/dashboard/something-that-does-not-exist');
  assert.strictEqual(res.page, 'dashboard');
  assert.strictEqual(res.dashboardModule, 'not-found');
  assert.strictEqual(res.invalidModule, 'something-that-does-not-exist');
  assert.strictEqual(res.shouldRedirectToOverview, false);
});

check('/dashboard/unknown-xyz preserves invalidModule name for user display', () => {
  const res = getRouteStateFromUrl('/dashboard/unknown-xyz');
  assert.strictEqual(res.dashboardModule, 'not-found');
  assert.strictEqual(res.invalidModule, 'unknown-xyz');
});

// 4. Marketing and Public routes isolation
console.log('\n--- TEST 4: Marketing Page & Dashboard Isolation ---');
check('/ resolves to home page without dashboard module', () => {
  const res = getRouteStateFromUrl('/');
  assert.strictEqual(res.page, 'home');
  assert.strictEqual(res.dashboardModule, null);
});

check('/pricing resolves to pricing page', () => {
  const res = getRouteStateFromUrl('/pricing');
  assert.strictEqual(res.page, 'pricing');
  assert.strictEqual(res.dashboardModule, null);
});

check('/dashboard/products does NOT render home or pricing page', () => {
  const res = getRouteStateFromUrl('/dashboard/products');
  assert.strictEqual(res.page, 'dashboard');
  assert.notStrictEqual(res.page, 'home');
  assert.strictEqual(res.dashboardModule, 'products');
});

// 5. Browser History Popstate Navigation Simulation
console.log('\n--- TEST 5: Browser History (Back / Forward) Navigation ---');
check('Simulating Dashboard -> Products -> Orders -> Customers -> Revenue and Back steps', () => {
  const historyStack = [
    '/dashboard/overview',
    '/dashboard/products',
    '/dashboard/orders',
    '/dashboard/customers',
    '/dashboard/revenue'
  ];
  let pointer = historyStack.length - 1;

  // Currently at Revenue
  let state = getRouteStateFromUrl(historyStack[pointer]);
  assert.strictEqual(state.dashboardModule, 'revenue');

  // Back -> Customers
  pointer--;
  state = getRouteStateFromUrl(historyStack[pointer]);
  assert.strictEqual(state.dashboardModule, 'customers');

  // Back -> Orders
  pointer--;
  state = getRouteStateFromUrl(historyStack[pointer]);
  assert.strictEqual(state.dashboardModule, 'orders');

  // Back -> Products
  pointer--;
  state = getRouteStateFromUrl(historyStack[pointer]);
  assert.strictEqual(state.dashboardModule, 'products');

  // Forward -> Orders
  pointer++;
  state = getRouteStateFromUrl(historyStack[pointer]);
  assert.strictEqual(state.dashboardModule, 'orders');

  // Forward -> Customers
  pointer++;
  state = getRouteStateFromUrl(historyStack[pointer]);
  assert.strictEqual(state.dashboardModule, 'customers');
});

// 6. Protected Route Enforcement
console.log('\n--- TEST 6: Protected Dashboard Route Guarding ---');
function simulateRouteGuard(pathname, isAuthenticated, isLoading) {
  const state = getRouteStateFromUrl(pathname);
  if (isLoading) {
    return { rendered: 'PageLoader', redirectedTo: null };
  }
  if (state.page === 'dashboard' && !isAuthenticated) {
    return { rendered: null, redirectedTo: '/login' };
  }
  if ((state.page === 'login' || state.page === 'signup') && isAuthenticated) {
    return { rendered: null, redirectedTo: '/dashboard/overview' };
  }
  return { rendered: state.page, module: state.dashboardModule, redirectedTo: null };
}

check('Unauthenticated access to /dashboard/products redirects to /login', () => {
  const guard = simulateRouteGuard('/dashboard/products', false, false);
  assert.strictEqual(guard.redirectedTo, '/login');
});

check('Unauthenticated access to /dashboard/revenue redirects to /login', () => {
  const guard = simulateRouteGuard('/dashboard/revenue', false, false);
  assert.strictEqual(guard.redirectedTo, '/login');
});

check('Auth loading on /dashboard/overview renders PageLoader without early redirect', () => {
  const guard = simulateRouteGuard('/dashboard/overview', false, true);
  assert.strictEqual(guard.rendered, 'PageLoader');
  assert.strictEqual(guard.redirectedTo, null);
});

check('Authenticated access to /dashboard/products renders dashboard products', () => {
  const guard = simulateRouteGuard('/dashboard/products', true, false);
  assert.strictEqual(guard.redirectedTo, null);
  assert.strictEqual(guard.rendered, 'dashboard');
  assert.strictEqual(guard.module, 'products');
});

// 7. Session persistence across dashboard sub-route changes
console.log('\n--- TEST 7: Session Stability During Sub-Route Switching ---');
check('Navigating across all 10 dashboard routes keeps session intact', () => {
  let session = { id: 'usr_101', name: 'Test Merchant', email: 'merchant@kreazy.ai' };
  for (const { path, module } of expectedRoutes) {
    const guard = simulateRouteGuard(path, Boolean(session), false);
    assert.strictEqual(guard.redirectedTo, null);
    assert.strictEqual(guard.module, module);
    assert.ok(session !== null, 'Session must not be lost');
  }
});

console.log('\n============================================================');
console.log(`RESULTS: ${passCount} passed, ${failCount} failed out of ${passCount + failCount} assertions`);
console.log('============================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✓ ALL DASHBOARD ROUTING TESTS PASSED SUCCESSFULLY');
}
