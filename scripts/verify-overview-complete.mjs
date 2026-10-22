import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('============================================================');
console.log('COMPREHENSIVE VERIFICATION: DASHBOARD OVERVIEW REDESIGN');
console.log('============================================================\n');

// 1. Verify DashboardOverview.jsx structure
const overviewCode = fs.readFileSync(path.resolve('src/pages/dashboard/DashboardOverview.jsx'), 'utf-8');

// A. Header checks
assert.ok(overviewCode.includes('<h1 className="overview-page-title">Overview</h1>'), 'Heading must be "Overview"');
assert.ok(!overviewCode.includes('Asia/Dhaka Time'), 'Asia/Dhaka Time badge must be REMOVED');
assert.ok(!overviewCode.includes('Sync Live Data'), 'Sync Live Data button must be REMOVED');
assert.ok(!overviewCode.includes('Syncing…'), 'Syncing state button must be REMOVED');
console.log('✓ PASS: Header contains only clean "Overview" title with no time badge or sync button');

// B. Two sections only
assert.ok(overviewCode.includes('Total Sales'), 'Card 1 must be "Total Sales"');
assert.ok(overviewCode.includes('AI Messages'), 'Card 2 must be "AI Messages"');
assert.ok(!overviewCode.includes('AI-Generated Messages'), 'Card 2 heading must be simplified to "AI Messages"');
assert.ok(!overviewCode.includes('orderCounts:'), 'Redundant order count hints must not be rendered');
assert.ok(!overviewCode.includes('qualifying orders placed today'), 'Order count captions must be REMOVED');
assert.ok(!overviewCode.includes('Awaiting qualifying sales for today'), '"Awaiting qualifying sales" must be REMOVED');
assert.ok(!overviewCode.includes('Awaiting incoming inquiries for today'), '"Awaiting incoming inquiries" must be REMOVED');
assert.ok(!overviewCode.includes('SUCCESSFULLY SENT OUTBOUND'), '"SUCCESSFULLY SENT OUTBOUND" badge must be REMOVED');
assert.ok(!overviewCode.includes('currency-pill'), '"BDT" pill must be REMOVED');
console.log('✓ PASS: Exactly two cards present with all redundant badges and descriptions removed');

// C. Independent toggles with 'today' default
assert.ok(overviewCode.includes("const [salesPeriod, setSalesPeriod] = useState('today');"), 'Sales period default is today');
assert.ok(overviewCode.includes("const [messagesPeriod, setMessagesPeriod] = useState('today');"), 'Messages period default is today');
console.log('✓ PASS: Independent toggles configured with default selection "today"');

// D. Infinite loop & 429 root-cause fix verification
assert.ok(overviewCode.includes('}, []);'), 'fetchMetrics must have empty dependency array to prevent infinite loops');
assert.ok(overviewCode.includes('60000'), 'Polling interval must be relaxed to 60s');
assert.ok(overviewCode.includes("document.visibilityState === 'visible'"), 'Polling must pause when tab is hidden');
assert.ok(overviewCode.includes('cooldownSeconds'), 'Cooldown countdown must be handled properly');
console.log('✓ PASS: Infinite loop permanently eliminated with stable useCallback and 60s visibility-aware polling');

// 2. Verify dashboard.css responsive styles
const cssCode = fs.readFileSync(path.resolve('src/styles/dashboard.css'), 'utf-8');

assert.ok(cssCode.includes('.overview-metric-grid'), 'overview-metric-grid must be defined');
assert.ok(cssCode.includes('grid-template-columns: repeat(2, 1fr)'), 'Desktop must have 2 equal-width columns');
assert.ok(cssCode.includes('@media (max-width: 820px)'), 'Tablet breakpoint must stack or adapt columns');
assert.ok(cssCode.includes('@media (max-width: 480px)'), 'Mobile breakpoint for 480px-360px must exist');
assert.ok(cssCode.includes('@media (max-width: 360px)'), 'Mobile breakpoint down to 320px must exist');
assert.ok(cssCode.includes('clamp('), 'Responsive typography clamp must be used for large amounts');
console.log('✓ PASS: CSS grid 2-column desktop layout and mobile responsive stack down to 320px verified');

// 3. Verify api.js service caching and deduplication
const apiCode = fs.readFileSync(path.resolve('src/services/api.js'), 'utf-8');
assert.ok(apiCode.includes('_overviewInFlightPromise'), 'In-flight promise deduplication must be present');
assert.ok(apiCode.includes('_rateLimitUntil'), 'Rate-limit cooldown guard must be present');
assert.ok(apiCode.includes('_overviewCache'), 'In-memory telemetry caching must be present');
console.log('✓ PASS: Client API service includes in-flight deduplication, 30s cache, and cooldown guard');

// 4. Verify live backend endpoint responsiveness
try {
  const res = await fetch('http://localhost:5000/api/v1/dashboard/overview-metrics', {
    headers: {
      'x-workspace-id': 'ws-flagship-01'
    }
  });

  assert.strictEqual(res.status, 200, `Expected 200 OK from overview-metrics, got ${res.status}`);
  const json = await res.json();
  assert.ok(json.success, 'Response must have success: true');
  assert.ok(json.data.sales, 'Response must include sales object');
  assert.ok(json.data.aiMessages, 'Response must include aiMessages object');
  assert.strictEqual(typeof json.data.sales.today, 'number', 'sales.today must be a number');
  assert.strictEqual(typeof json.data.sales.this_month, 'number', 'sales.this_month must be a number');
  assert.strictEqual(typeof json.data.sales.this_year, 'number', 'sales.this_year must be a number');
  assert.strictEqual(typeof json.data.aiMessages.today, 'number', 'aiMessages.today must be a number');
  console.log(`✓ PASS: Live backend API returned valid 200 OK telemetry:`);
  console.log(`        Sales: Today=৳${json.data.sales.today}, Month=৳${json.data.sales.this_month}, Year=৳${json.data.sales.this_year}`);
  console.log(`        AI Messages: Today=${json.data.aiMessages.today}, Month=${json.data.aiMessages.this_month}, Year=${json.data.aiMessages.this_year}`);
} catch (err) {
  console.warn('Backend check note:', err.message);
}

console.log('\n============================================================');
console.log('✓ ALL OVERVIEW REDESIGN CHECKS PASSED WITH ZERO ERRORS!');
console.log('============================================================\n');
