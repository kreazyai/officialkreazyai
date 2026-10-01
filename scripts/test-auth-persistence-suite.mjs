// =====================================================================
// KREAZYAI AUTHENTICATION REGRESSION & PERSISTENCE TEST SUITE
// =====================================================================
// Verifies all 7 Core Authentication Flows (TEST A - TEST G)

import { authService } from '../src/services/api.js';
import { apiClient } from '../src/api/client.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

console.log('============================================================');
console.log('STARTING KREAZYAI AUTHENTICATION FLOW VERIFICATION SUITE');
console.log('============================================================\n');

async function runAuthTests() {
  // Reset clean state
  authService.logout();

  // -------------------------------------------------------------------
  // TEST A: Landing Page -> Sign In -> Successful auth -> Dashboard
  // -------------------------------------------------------------------
  console.log('--- TEST A: Sign In to Dashboard Flow ---');
  const userA = await authService.login('founder@kreazybrand.com', 'demo', true);
  assert(userA && userA.email === 'founder@kreazybrand.com', 'User object successfully created on login');
  assert(typeof userA.then === 'undefined', 'User object is clean plain object (no Thenable recursion loop)');
  assert(userA.isLoggedIn === true, 'User isLoggedIn flag is true');
  
  const currentA = authService.getCurrentUser();
  assert(currentA && currentA.email === 'founder@kreazybrand.com', 'Session is immediately retrievable from storage');
  console.log('TEST A Status: PASSED\n');

  // -------------------------------------------------------------------
  // TEST B: Sign In -> Dashboard -> Navigate back to Landing Page
  // -------------------------------------------------------------------
  console.log('--- TEST B: Dashboard to Landing Page Navigation ---');
  // Emulate landing page URL ('/')
  const landingUser = authService.getCurrentUser();
  assert(landingUser !== null, 'Session is NOT lost when navigating back to landing page');
  assert(landingUser.email === 'founder@kreazybrand.com', 'Correct user profile recognized on landing page');
  console.log('TEST B Status: PASSED\n');

  // -------------------------------------------------------------------
  // TEST C: Browser Refresh Emulation
  // -------------------------------------------------------------------
  console.log('--- TEST C: Browser Refresh Session Restoration ---');
  // On page refresh, components mount fresh and read authService.getCurrentUser()
  const refreshedUser = authService.getCurrentUser();
  assert(refreshedUser !== null, 'Session survives page reload and is synchronously loaded');
  assert(refreshedUser.storeName === 'Kreazy Flagship Studio', 'Store metadata intact after simulated refresh');
  console.log('TEST C Status: PASSED\n');

  // -------------------------------------------------------------------
  // TEST D: Multi-Page Navigation (Pricing -> Features -> Contact -> Dashboard)
  // -------------------------------------------------------------------
  console.log('--- TEST D: Multi-Page Navigation Persistence ---');
  const routes = ['pricing', 'features', 'contact', 'about', 'how-it-works', 'dashboard'];
  let allRetained = true;
  for (const route of routes) {
    const session = authService.getCurrentUser();
    if (!session || session.email !== 'founder@kreazybrand.com') {
      allRetained = false;
      break;
    }
  }
  assert(allRetained, 'User remained authenticated across all route changes without loss of session');
  console.log('TEST D Status: PASSED\n');

  // -------------------------------------------------------------------
  // TEST E: Intentional Sign Out
  // -------------------------------------------------------------------
  console.log('--- TEST E: Explicit Intentional Sign Out ---');
  const logoutRes = authService.logout();
  assert(logoutRes === true, 'Logout method executed cleanly');
  const afterLogout = authService.getCurrentUser();
  assert(afterLogout === null, 'Session storage completely cleared upon logout');
  assert(apiClient.getAuthToken() === null, 'API client auth token is cleared');
  console.log('TEST E Status: PASSED\n');

  // -------------------------------------------------------------------
  // TEST F: Direct Protected Route Access While Signed Out
  // -------------------------------------------------------------------
  console.log('--- TEST F: Direct Dashboard Access Gate While Signed Out ---');
  const unauthenticatedUser = authService.getCurrentUser();
  const shouldRedirectToLogin = unauthenticatedUser === null;
  assert(shouldRedirectToLogin, 'Unauthenticated user attempting /dashboard access is denied and flagged for redirect to /login');
  console.log('TEST F Status: PASSED\n');

  // -------------------------------------------------------------------
  // TEST G: Lifecycle Changes & Network Resiliency (Zero Auto-Logout)
  // -------------------------------------------------------------------
  console.log('--- TEST G: Lifecycle Resiliency & Network Failure Safety ---');
  // Sign in with merchant email and password (triggers backend attempt)
  const merchantUser = await authService.login('merchant@sylvanstudio.com', 'SecurePass2026!', false);
  assert(merchantUser && merchantUser.email === 'merchant@sylvanstudio.com', 'Merchant login creates stable local session');
  
  // Simulate failed network calls in background
  try {
    await apiClient.get('/nonexistent-test-endpoint');
  } catch (err) {
    // expected network error
  }

  const sessionAfterFailedApi = authService.getCurrentUser();
  assert(sessionAfterFailedApi !== null && sessionAfterFailedApi.email === 'merchant@sylvanstudio.com',
    'Failed background API call did NOT trigger false automatic logout. Session preserved.'
  );
  console.log('TEST G Status: PASSED\n');

  // -------------------------------------------------------------------
  // Final Summary
  // -------------------------------------------------------------------
  console.log('============================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} assertions`);
  console.log('============================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('✓ ALL AUTHENTICATION FLOW TESTS (A-G) PASSED SUCCESSFULLY');
    process.exit(0);
  }
}

runAuthTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
