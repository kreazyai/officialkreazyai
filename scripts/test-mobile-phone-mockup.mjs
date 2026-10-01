import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('============================================================');
console.log('VERIFYING MOBILE PHONE MOCKUP REDESIGN ON LANDING PAGE');
console.log('============================================================');

let passed = 0;
let total = 0;

function check(title, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [FAIL] ${title}`);
    console.error('    Error:', err.message);
  }
}

const mockupPath = path.resolve(process.cwd(), 'src/components/website/MobilePhoneMockup.jsx');
const showcasePath = path.resolve(process.cwd(), 'src/components/website/IphoneIntegrationShowcase.jsx');
const cssPath = path.resolve(process.cwd(), 'src/styles/website.css');

check('MobilePhoneMockup component file exists', () => {
  assert.equal(fs.existsSync(mockupPath), true);
});

const mockupContent = fs.readFileSync(mockupPath, 'utf8');

check('Contains Customer 1 inquiry & AI response', () => {
  assert.equal(mockupContent.includes('Hi, is this available in black?'), true);
  assert.equal(mockupContent.includes('Yes, Black is available. What size would you like?'), true);
});

check('Contains Customer 2 inquiry & AI response', () => {
  assert.equal(mockupContent.includes('How much is delivery?'), true);
  assert.equal(mockupContent.includes('Delivery starts from $5. It usually arrives within 1–2 business days.'), true);
});

check('Contains Customer 3 inquiry & AI response', () => {
  assert.equal(mockupContent.includes('Can I order the Large size?'), true);
  assert.equal(mockupContent.includes('Absolutely. Large is available. Would you like me to place the order?'), true);
});

check('Contains Customer 4 inquiry & AI response', () => {
  assert.equal(mockupContent.includes('Do you accept card payment?'), true);
  assert.equal(mockupContent.includes('Yes. We accept card payment and other available checkout options.'), true);
});

check('Contains required AI automation indicators', () => {
  assert.equal(mockupContent.includes('KreazyAI Assistant'), true);
  assert.equal(mockupContent.includes('Online • Instant response'), true);
  assert.equal(mockupContent.includes('KreazyAI is replying...'), true);
});

check('IphoneIntegrationShowcase renders MobilePhoneMockup', () => {
  const showcaseContent = fs.readFileSync(showcasePath, 'utf8');
  assert.equal(showcaseContent.includes('<MobilePhoneMockup'), true);
  assert.equal(showcaseContent.includes('iphone-integrations.jpg'), false); // Static image removed
});

check('Responsive CSS rules for 640px and 380px are configured', () => {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  assert.equal(cssContent.includes('.phone-mockup-frame'), true);
  assert.equal(cssContent.includes('.phone-chassis'), true);
  assert.equal(cssContent.includes('@media (max-width: 640px)'), true);
  assert.equal(cssContent.includes('@media (max-width: 380px)'), true);
});

console.log('\n============================================================');
console.log(`RESULTS: ${passed} passed, ${total - passed} failed out of ${total} assertions`);
console.log('============================================================');
assert.equal(passed, total);
console.log('✓ ALL MOBILE PHONE MOCKUP TESTS PASSED WITH 100% SUCCESS');
