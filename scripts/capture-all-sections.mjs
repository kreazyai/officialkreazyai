import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

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

await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true
});

await send('Page.navigate', { url: 'http://localhost:5173/' });
await new Promise(r => setTimeout(r, 2500));

// Capture full page screenshot
const metrics = await send('Page.getLayoutMetrics');
const contentSize = metrics.result.contentSize;

await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: Math.ceil(contentSize.height),
  deviceScaleFactor: 2,
  mobile: true
});

const fullShot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
fs.writeFileSync('landing_mobile_fullpage.png', Buffer.from(fullShot.result.data, 'base64'));
console.log('Saved landing_mobile_fullpage.png with height:', contentSize.height);

// Also inspect the founder meeting form and inputs on mobile
const formAnalysis = await send('Runtime.evaluate', {
  expression: `(() => {
    const form = document.querySelector('.founder-booking-form');
    const formRect = form ? form.getBoundingClientRect() : null;
    const inputs = Array.from(document.querySelectorAll('.founder-booking-form input, .founder-booking-form textarea, .founder-booking-form select')).map(el => {
      const r = el.getBoundingClientRect();
      const parent = el.closest('.form-group');
      const label = parent ? parent.querySelector('.form-label') : null;
      const lRect = label ? label.getBoundingClientRect() : null;
      const cs = window.getComputedStyle(el);
      return {
        name: el.placeholder,
        width: Math.round(r.width),
        height: Math.round(r.height),
        left: Math.round(r.left),
        right: Math.round(r.right),
        fontSize: cs.fontSize,
        padding: cs.padding,
        labelLeft: lRect ? Math.round(lRect.left) : null,
        labelWidth: lRect ? Math.round(lRect.width) : null,
        labelGap: lRect ? Math.round(r.top - lRect.bottom) : null
      };
    });

    const rows = Array.from(document.querySelectorAll('.founder-form-row-2')).map(r => {
      const rect = r.getBoundingClientRect();
      const cs = window.getComputedStyle(r);
      return {
        width: Math.round(rect.width),
        display: cs.display,
        gridTemplateColumns: cs.gridTemplateColumns,
        gap: cs.gap
      };
    });

    return {
      formWidth: formRect ? Math.round(formRect.width) : null,
      formLeft: formRect ? Math.round(formRect.left) : null,
      inputs,
      rows
    };
  })()`,
  returnByValue: true
});

console.log('Form Analysis:', JSON.stringify(formAnalysis.result.result.value, null, 2));

chrome.kill();
