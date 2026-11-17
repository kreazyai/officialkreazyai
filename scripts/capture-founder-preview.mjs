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

await waitForSelector('.founder-section');

// Scroll directly to founder section form
await send('Runtime.evaluate', {
  expression: `(() => {
    const el = document.querySelector('.founder-booking-form');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`
});

await new Promise(r => setTimeout(r, 1000));

// Capture visible viewport screenshot
const shot = await send('Page.captureScreenshot', {
  format: 'png'
});

const artifactDir = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';
fs.writeFileSync(path.join(artifactDir, 'mobile_founder_form_visible.png'), Buffer.from(shot.result.data, 'base64'));
console.log('Saved mobile_founder_form_visible.png');

// Also scroll to Hero & capture
await send('Runtime.evaluate', {
  expression: `window.scrollTo(0, 0);`
});
await new Promise(r => setTimeout(r, 800));
const heroShot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(artifactDir, 'mobile_hero_visible.png'), Buffer.from(heroShot.result.data, 'base64'));
console.log('Saved mobile_hero_visible.png');

// Also scroll to Pricing & capture
await send('Runtime.evaluate', {
  expression: `(() => {
    const el = document.querySelector('.pricing-suite-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  })()`
});
await new Promise(r => setTimeout(r, 800));
const pricingShot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(artifactDir, 'mobile_pricing_visible.png'), Buffer.from(pricingShot.result.data, 'base64'));
console.log('Saved mobile_pricing_visible.png');

// Also scroll to Final CTA & capture
await send('Runtime.evaluate', {
  expression: `(() => {
    const el = document.querySelector('.final-cta-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`
});
await new Promise(r => setTimeout(r, 800));
const ctaShot = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(artifactDir, 'mobile_final_cta_visible.png'), Buffer.from(ctaShot.result.data, 'base64'));
console.log('Saved mobile_final_cta_visible.png');

chrome.kill();
