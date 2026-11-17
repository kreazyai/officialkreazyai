import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9226/json', (r) => {
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
  await send('DOM.enable');

  // ==========================================
  // 1. DESKTOP VIEWPORT (1440 x 900)
  // ==========================================
  console.log('--- Checking Desktop /pricing 1440x900 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: 'http://localhost:5173/pricing' });
  await new Promise(r => setTimeout(r, 2500));

  const desktopCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.querySelector('.pricing-main-title');
      const subtitle = document.querySelector('.pricing-sub-desc');
      const textMatches = document.body.innerText.includes('Simple pricing that pays for itself');
      const subtitleMatches = document.body.innerText.includes('Choose the plan that fits your growth');
      const controls = document.querySelector('.pricing-controls-row');
      const cards = document.querySelectorAll('.pricing-suite-card');
      return {
        titleElementPresent: !!title,
        subtitleElementPresent: !!subtitle,
        titleTextInDom: textMatches,
        subtitleTextInDom: subtitleMatches,
        controlsPresent: !!controls,
        cardsCount: cards.length
      };
    })()`,
    returnByValue: true
  });
  console.log('Desktop /pricing check:', JSON.stringify(desktopCheck.result.result.value, null, 2));

  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'pricing_page_desktop_clean.png'), Buffer.from(desktopShot.result.data, 'base64'));
  console.log('Saved: pricing_page_desktop_clean.png');

  // ==========================================
  // 2. MOBILE VIEWPORT (390 x 844)
  // ==========================================
  console.log('--- Checking Mobile /pricing 390x844 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
  await new Promise(r => setTimeout(r, 1200));

  const mobileCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.querySelector('.pricing-main-title');
      const subtitle = document.querySelector('.pricing-sub-desc');
      const textMatches = document.body.innerText.includes('Simple pricing that pays for itself');
      const subtitleMatches = document.body.innerText.includes('Choose the plan that fits your growth');
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      return {
        titleElementPresent: !!title,
        subtitleElementPresent: !!subtitle,
        titleTextInDom: textMatches,
        subtitleTextInDom: subtitleMatches,
        scrollWidth,
        innerWidth,
        zeroOverflow: scrollWidth <= innerWidth
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile /pricing check:', JSON.stringify(mobileCheck.result.result.value, null, 2));

  const mobShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'pricing_page_mobile_clean.png'), Buffer.from(mobShot.result.data, 'base64'));
  console.log('Saved: pricing_page_mobile_clean.png');

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chrome.kill();
  console.log('Done.');
}
