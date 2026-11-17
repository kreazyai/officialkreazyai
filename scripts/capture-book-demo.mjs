import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1280,850'
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

// 1. Desktop View (1280x850)
await send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 850,
  deviceScaleFactor: 2,
  mobile: false
});

await send('Page.navigate', { url: 'http://localhost:5173/book-demo' });

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

const loadedDesktop = await waitForSelector('.book-demo-page-wrapper');
console.log('BookDemoPage loaded on desktop:', loadedDesktop);
await new Promise(r => setTimeout(r, 1500));

const artifactDir = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';

// Capture Desktop Screenshot
const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(artifactDir, 'book_demo_desktop_updated.png'), Buffer.from(shotDesktop.result.data, 'base64'));
console.log('Saved book_demo_desktop_updated.png');

// 2. Mobile View (390x844)
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true
});

await new Promise(r => setTimeout(r, 1000));
const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(artifactDir, 'book_demo_mobile_updated.png'), Buffer.from(shotMobile.result.data, 'base64'));
console.log('Saved book_demo_mobile_updated.png');

// Check Button Computed Style
const btnAudit = await send('Runtime.evaluate', {
  expression: `(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (!btn) return null;
    const cs = window.getComputedStyle(btn);
    return {
      text: btn.innerText.trim(),
      background: cs.background,
      backgroundColor: cs.backgroundColor,
      color: cs.color,
      borderRadius: cs.borderRadius
    };
  })()`,
  returnByValue: true
});
console.log('Button audit result:', btnAudit.result.result.value);

chrome.kill();
