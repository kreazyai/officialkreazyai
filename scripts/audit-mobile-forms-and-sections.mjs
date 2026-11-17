import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=390,844'
]);

await new Promise(r => setTimeout(r, 2000));

const targets = await new Promise((res, rej) => {
  http.get('http://127.0.0.1:9222/json', (r) => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => res(JSON.parse(d)));
  }).on('error', rej);
});

const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);

const send = (method, params = {}) => new Promise((resolve) => {
  const id = Math.floor(Math.random() * 100000);
  const handler = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id === id) {
      ws.removeEventListener('message', handler);
      resolve(msg);
    }
  };
  ws.addEventListener('message', handler);
  ws.send(JSON.stringify({ id, method, params }));
});

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true
});

await send('Page.navigate', { url: 'http://localhost:5173/' });

// Wait for React and HomePage to load
async function waitForSelector(selector, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const r = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('${selector}'))`,
      returnByValue: true
    });
    if (r?.result?.result?.value) return true;
    await new Promise(res => setTimeout(res, 500));
  }
  return false;
}

const loaded = await waitForSelector('.hero-section');
console.log('HomePage loaded (.hero-section):', loaded);

if (!loaded) {
  const pageState = await send('Runtime.evaluate', {
    expression: `({
      url: window.location.href,
      title: document.title,
      bodyText: document.body.innerText.slice(0, 300),
      bodyHtmlSnippet: document.body.innerHTML.slice(0, 300)
    })`,
    returnByValue: true
  });
  console.log('Page state:', pageState.result.result.value);
}

const auditResults = await send('Runtime.evaluate', {
  expression: `(() => {
    const bodyScrollW = document.body.scrollWidth;
    const docScrollW = document.documentElement.scrollWidth;
    const winW = window.innerWidth;

    // Check all sections
    const sections = [
      '.site-discount-banner',
      '.site-nav',
      '.hero-section',
      '.showcase-section',
      '.benefits-section',
      '.workflow-section',
      '.channels-section',
      '.features-editorial-section',
      '.proof-section',
      '.pricing-suite-section',
      '.home-faq-section',
      '.founder-section',
      '.final-cta-section',
      '.site-footer'
    ].map(sel => {
      const el = document.querySelector(sel);
      if (!el) return { selector: sel, exists: false };
      const r = el.getBoundingClientRect();
      return {
        selector: sel,
        exists: true,
        width: Math.round(r.width),
        left: Math.round(r.left),
        right: Math.round(r.right),
        overflowing: Math.round(r.right) > winW || Math.round(r.left) < 0
      };
    });

    // Check Founder form & inputs
    const founderCard = document.querySelector('.founder-card');
    const founderBookingForm = document.querySelector('.founder-booking-form');
    const founderCardRect = founderCard ? founderCard.getBoundingClientRect() : null;
    const founderCardStyle = founderCard ? window.getComputedStyle(founderCard) : null;
    const formStyle = founderBookingForm ? window.getComputedStyle(founderBookingForm) : null;

    const inputs = Array.from(document.querySelectorAll('.founder-booking-form input, .founder-booking-form textarea')).map(input => {
      const r = input.getBoundingClientRect();
      const cs = window.getComputedStyle(input);
      const label = document.querySelector('label[for="' + input.id + '"]') || input.closest('.form-group')?.querySelector('.form-label');
      const labelRect = label ? label.getBoundingClientRect() : null;
      return {
        id: input.id,
        name: input.name,
        type: input.tagName.toLowerCase() === 'textarea' ? 'textarea' : input.type,
        width: Math.round(r.width),
        height: Math.round(r.height),
        borderRadius: cs.borderRadius,
        fontSize: cs.fontSize,
        padding: cs.padding,
        placeholder: input.placeholder,
        placeholderWords: input.placeholder.trim().split(/\\s+/).length,
        labelAlignLeft: labelRect ? Math.abs(labelRect.left - r.left) <= 2 : null,
        labelText: label ? label.innerText.trim() : null
      };
    });

    return {
      viewport: { winW, bodyScrollW, docScrollW, hasOverflow: docScrollW > winW },
      sections,
      founderCard: founderCard ? {
        width: Math.round(founderCardRect.width),
        padding: founderCardStyle.padding,
        borderRadius: founderCardStyle.borderRadius
      } : null,
      founderBookingForm: founderBookingForm ? {
        width: Math.round(founderBookingForm.getBoundingClientRect().width),
        padding: formStyle.padding,
        borderRadius: formStyle.borderRadius
      } : null,
      inputs
    };
  })()`,
  returnByValue: true
});

console.log('AUDIT RESULT:\n', JSON.stringify(auditResults.result.result.value, null, 2));

// Capture Screenshot of Founder Section
const founderClip = await send('Runtime.evaluate', {
  expression: `(() => {
    const el = document.querySelector('.founder-section');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: 0,
      y: window.scrollY + r.top,
      width: 390,
      height: Math.round(r.height),
      scale: 2
    };
  })()`,
  returnByValue: true
});

if (founderClip.result.result.value) {
  const clip = founderClip.result.result.value;
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    clip
  });
  const artifactDir = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';
  fs.writeFileSync(path.join(artifactDir, 'mobile_founder_section.png'), Buffer.from(shot.result.data, 'base64'));
  console.log('Saved mobile_founder_section.png');
}

// Full page screenshot
const fullLayout = await send('Page.getLayoutMetrics');
const fullHeight = Math.min(Math.round(fullLayout.result.contentSize.height), 8000);
const fullShot = await send('Page.captureScreenshot', {
  format: 'png',
  clip: {
    x: 0,
    y: 0,
    width: 390,
    height: fullHeight,
    scale: 1
  }
});
const artifactDir = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';
fs.writeFileSync(path.join(artifactDir, 'mobile_full_home_verified.png'), Buffer.from(fullShot.result.data, 'base64'));
console.log('Saved mobile_full_home_verified.png');

chrome.kill();
