import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('====================================================');
console.log('VERIFYING REVENUE PAGE TWO-SECTION ARCHITECTURE');
console.log('====================================================');

const rootDir = process.cwd();
const revPath = path.join(rootDir, 'src', 'pages', 'dashboard', 'RevenuePage.jsx');
assert(fs.existsSync(revPath), 'RevenuePage.jsx exists');
const revCode = fs.readFileSync(revPath, 'utf8');

// 1. Verify hero summary grid is removed
assert(!revCode.includes('revenue-hero-summary-grid'), 'Hero summary grid is removed from RevenuePage');
assert(!revCode.includes('hero-sales-card'), 'hero-sales-card is removed');
console.log('[PASS] Redundant 3 top hero cards are completely removed');

// 2. Verify exactly two core sections exist
assert(revCode.includes('id="section-where-sales-came-from"'), 'Contains Section 1: Where Sales Came From');
assert(revCode.includes('id="section-best-selling-products"'), 'Contains Section 2: Best Selling Products');

// Count <section elements in RevenuePage.jsx
const sectionMatches = revCode.match(/<section[\s>]/g) || [];
assert.strictEqual(sectionMatches.length, 2, `RevenuePage has exactly 2 <section> tags, found ${sectionMatches.length}`);
console.log('[PASS] Exactly two core sections are rendered');

// 3. Verify clutter elements are removed
assert(!revCode.includes('revenue-distribution-standby-wrapper'), 'Standby pulse bar removed');
assert(!revCode.includes('Live Channel Tracking'), 'Live Channel Tracking badge removed');
assert(!revCode.includes('platform-progress-track'), 'Progress track fill bars removed');
console.log('[PASS] Visual clutter, pulse bars, and redundant tracks removed');

// 4. Verify Total Revenue badge exists in Section 1
assert(revCode.includes('section-total-badge'), 'Section 1 contains section-total-badge');
assert(revCode.includes('section-total-label'), 'Section 1 contains section-total-label');
assert(revCode.includes('section-total-value'), 'Section 1 contains section-total-value');
console.log('[PASS] Clean Total Revenue badge integrated in Section 1');

// 5. Verify compact empty state exists
assert(revCode.includes('best-selling-empty-compact'), 'Section 2 contains best-selling-empty-compact');
console.log('[PASS] Compact, elegant Section 2 empty state verified');

// 6. Verify dashboard.css styling
const cssPath = path.join(rootDir, 'src', 'styles', 'dashboard.css');
const cssCode = fs.readFileSync(cssPath, 'utf8');
assert(cssCode.includes('.section-total-badge {'), 'dashboard.css contains .section-total-badge');
assert(cssCode.includes('.best-selling-empty-compact {'), 'dashboard.css contains .best-selling-empty-compact');
assert(cssCode.includes('.platform-sales-card {'), 'dashboard.css contains .platform-sales-card');
console.log('[PASS] Dashboard CSS styling verified');

console.log('====================================================');
console.log('✓ ALL TWO-SECTION REVENUE VERIFICATIONS PASSED (6/6)');
console.log('====================================================');
