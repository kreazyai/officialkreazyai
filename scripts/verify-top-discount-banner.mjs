import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

console.log('====================================================');
console.log('VERIFYING TOP DISCOUNT ANNOUNCEMENT BANNER');
console.log('====================================================');

const rootDir = process.cwd();

// 1. Check TopDiscountBanner.jsx
const bannerPath = path.join(rootDir, 'src', 'components', 'website', 'TopDiscountBanner.jsx');
assert(fs.existsSync(bannerPath), 'TopDiscountBanner.jsx must exist');
const bannerCode = fs.readFileSync(bannerPath, 'utf8');

assert(bannerCode.includes('export function TopDiscountBanner'), 'Exports TopDiscountBanner');
assert(bannerCode.includes('discountPercent = 10'), 'Supports discountPercent prop default 10');
assert(bannerCode.includes('sessionStorage.getItem'), 'Supports sessionStorage persistence');
assert(bannerCode.includes('handleClaimOffer'), 'Implements handleClaimOffer');
assert(bannerCode.includes('handleDismiss'), 'Implements handleDismiss');
assert(bannerCode.includes('site-discount-banner'), 'Has site-discount-banner class');
assert(bannerCode.includes('discount-cta-button'), 'Has discount-cta-button class');
assert(bannerCode.includes('discount-close-button'), 'Has discount-close-button class');
console.log('[PASS] TopDiscountBanner component structure and props verified');

// 2. Check Navbar.jsx
const navbarPath = path.join(rootDir, 'src', 'components', 'website', 'Navbar.jsx');
const navbarCode = fs.readFileSync(navbarPath, 'utf8');

assert(navbarCode.includes("import { TopDiscountBanner } from './TopDiscountBanner'"), 'Imports TopDiscountBanner');
assert(navbarCode.includes('<TopDiscountBanner'), 'Renders TopDiscountBanner inside Navbar');
assert(navbarCode.includes('has-discount-banner'), 'Toggles has-discount-banner class');
console.log('[PASS] Navbar integration verified');

// 3. Check translations.js
const transPath = path.join(rootDir, 'src', 'i18n', 'translations.js');
const transCode = fs.readFileSync(transPath, 'utf8');

assert(transCode.includes('banner: {'), 'translations.js contains banner catalog');
assert(transCode.includes("discount: '10% OFF'"), 'translations.js contains 10% OFF discount');
assert(transCode.includes("cta: 'Claim Offer'"), 'translations.js contains Claim Offer CTA');
assert(transCode.includes("discount: '১০% ছাড়'"), 'translations.js contains Bengali translation');
assert(transCode.includes("discount: '10% DE DESCUENTO'"), 'translations.js contains Spanish translation');
console.log('[PASS] Trilingual translations (en, bn, es) verified');

// 4. Check website.css
const cssPath = path.join(rootDir, 'src', 'styles', 'website.css');
const cssCode = fs.readFileSync(cssPath, 'utf8');

assert(cssCode.includes('.site-discount-banner {'), 'website.css has .site-discount-banner');
assert(cssCode.includes('#DDFBE8'), 'website.css has brand green #DDFBE8 background');
assert(cssCode.includes('#064E3B'), 'website.css has brand forest green #064E3B text');
assert(cssCode.includes('.discount-cta-button {'), 'website.css has .discount-cta-button');
assert(cssCode.includes('border-radius: 0px !important'), 'Enforces sharp rectangle styling');
assert(cssCode.includes('.site-nav.has-discount-banner ~ .mobile-nav-drawer'), 'Mobile drawer height offset styled');
console.log('[PASS] CSS styling and zero-curvature rules verified');

console.log('====================================================');
console.log('✓ ALL DISCOUNT BANNER VERIFICATIONS PASSED (4/4)');
console.log('====================================================');
