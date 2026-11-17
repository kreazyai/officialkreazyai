import { spawn } from 'child_process';
import http from 'http';

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
await new Promise(r => setTimeout(r, 2000));

const sectionAudit = await send('Runtime.evaluate', {
  expression: `(() => {
    const selectors = [
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
    ];

    const results = {};
    const winW = window.innerWidth;

    selectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) {
        results[sel] = { exists: false };
        return;
      }
      const rect = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      
      // Check children layout
      const directChildren = Array.from(el.children).map(c => {
        const cRect = c.getBoundingClientRect();
        return {
          tag: c.tagName,
          className: c.className,
          width: Math.round(cRect.width),
          left: Math.round(cRect.left),
          right: Math.round(cRect.right)
        };
      });

      results[sel] = {
        exists: true,
        width: Math.round(rect.width),
        padding: cs.padding,
        display: cs.display,
        childrenCount: el.children.length,
        directChildren
      };
    });

    return results;
  })()`,
  returnByValue: true
});

console.log('Sections Detailed Audit:\n', JSON.stringify(sectionAudit.result.result.value, null, 2));

chrome.kill();
