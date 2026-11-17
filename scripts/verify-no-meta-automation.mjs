import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9227',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9227/json', (r) => {
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
  console.log('--- Checking Desktop Telemetry Card 1440x900 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2500));

  // Scroll to telemetry section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.hero-trending-telemetry-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const desktopCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const liveTag = document.querySelector('.hero-metric-live-tag');
      const liveText = document.querySelector('.hero-metric-live-text');
      const textMatches = document.body.innerText.includes('Live Meta Automation');
      const card = document.querySelector('.hero-trending-telemetry-wrap .hero-visible-metric-card');
      return {
        liveTagPresent: !!liveTag,
        liveTextPresent: !!liveText,
        textMatchesInDom: textMatches,
        cardPresent: !!card
      };
    })()`,
    returnByValue: true
  });
  console.log('Desktop check:', JSON.stringify(desktopCheck.result.result.value, null, 2));

  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_telemetry_no_meta_text.png'), Buffer.from(desktopShot.result.data, 'base64'));
  console.log('Saved: desktop_telemetry_no_meta_text.png');

  // ==========================================
  // 2. MOBILE VIEWPORT (390 x 844)
  // ==========================================
  console.log('--- Checking Mobile Telemetry Card 390x844 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.hero-trending-telemetry-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const mobileCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const liveTag = document.querySelector('.hero-metric-live-tag');
      const liveText = document.querySelector('.hero-metric-live-text');
      const textMatches = document.body.innerText.includes('Live Meta Automation');
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      return {
        liveTagPresent: !!liveTag,
        liveTextPresent: !!liveText,
        textMatchesInDom: textMatches,
        scrollWidth,
        innerWidth,
        zeroOverflow: scrollWidth <= innerWidth
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile check:', JSON.stringify(mobileCheck.result.result.value, null, 2));

  const mobShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_telemetry_no_meta_text.png'), Buffer.from(mobShot.result.data, 'base64'));
  console.log('Saved: mobile_telemetry_no_meta_text.png');

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chrome.kill();
  console.log('Done.');
}
