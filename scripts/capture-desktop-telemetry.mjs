import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';
const PORT = 9235;

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900'
]);

await new Promise(r => setTimeout(r, 2500));

try {
  const targets = await new Promise((res, rej) => {
    http.get(`http://127.0.0.1:${PORT}/json`, (r) => {
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

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });

  // Wait for .hero-visible-metric-card to exist
  for (let i = 0; i < 30; i++) {
    const r = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.hero-visible-metric-card'))`,
      returnByValue: true
    });
    if (r?.result?.result?.value) break;
    await new Promise(res => setTimeout(res, 500));
  }

  await new Promise(r => setTimeout(r, 1000));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.hero-trending-telemetry-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_telemetry_clean_header.png'), Buffer.from(desktopShot.result.data, 'base64'));
  console.log('Saved: desktop_telemetry_clean_header.png');

  // Also check mobile 390x844
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

  const mobShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_telemetry_clean_header.png'), Buffer.from(mobShot.result.data, 'base64'));
  console.log('Saved: mobile_telemetry_clean_header.png');

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chrome.kill();
  console.log('Done.');
}
