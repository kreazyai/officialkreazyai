import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';
const PORT = 9290;

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

  // ==========================================
  // 1. DESKTOP /login (1440 x 900)
  // ==========================================
  console.log('--- Checking Desktop /login 1440x900 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: 'http://localhost:5173/login' });

  for (let i = 0; i < 30; i++) {
    const r = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.auth-showcase-photo'))`,
      returnByValue: true
    });
    if (r?.result?.result?.value) break;
    await new Promise(res => setTimeout(res, 500));
  }
  await new Promise(r => setTimeout(r, 1200));

  const desktopLoginCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const photo = document.querySelector('.auth-showcase-photo');
      const form = document.querySelector('.auth-form-panel');
      return {
        photoLoaded: !!photo && photo.complete && photo.naturalWidth > 0,
        photoSrc: photo?.src,
        formPresent: !!form
      };
    })()`,
    returnByValue: true
  });
  console.log('Desktop /login audit:', JSON.stringify(desktopLoginCheck.result.result.value, null, 2));

  const desktopLoginShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_login_new_showcase.png'), Buffer.from(desktopLoginShot.result.data, 'base64'));
  console.log('Saved: desktop_login_new_showcase.png');

  // ==========================================
  // 2. MOBILE /login (390 x 844)
  // ==========================================
  console.log('--- Checking Mobile /login 390x844 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
  await new Promise(r => setTimeout(r, 1000));

  const mobileLoginCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const panel = document.querySelector('.auth-showcase-panel');
      const form = document.querySelector('.auth-form-panel');
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const panelDisplay = panel ? window.getComputedStyle(panel).display : 'none';
      const formRect = form ? form.getBoundingClientRect() : null;
      return {
        photoHiddenOnMobile: panelDisplay === 'none',
        formVisibleOnMobile: !!form && formRect && formRect.height > 0,
        scrollWidth,
        innerWidth,
        zeroOverflow: scrollWidth <= innerWidth
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile /login audit:', JSON.stringify(mobileLoginCheck.result.result.value, null, 2));

  const mobLoginShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_login_new_showcase.png'), Buffer.from(mobLoginShot.result.data, 'base64'));
  console.log('Saved: mobile_login_new_showcase.png');

  // ==========================================
  // 3. DESKTOP /signup (1440 x 900)
  // ==========================================
  console.log('--- Checking Desktop /signup 1440x900 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });
  await send('Page.navigate', { url: 'http://localhost:5173/signup' });
  for (let i = 0; i < 30; i++) {
    const r = await send('Runtime.evaluate', {
      expression: `Boolean(document.querySelector('.auth-form-panel'))`,
      returnByValue: true
    });
    if (r?.result?.result?.value) break;
    await new Promise(res => setTimeout(res, 500));
  }
  await new Promise(r => setTimeout(r, 1500));

  const desktopSignupShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_signup_new_showcase.png'), Buffer.from(desktopSignupShot.result.data, 'base64'));
  console.log('Saved: desktop_signup_new_showcase.png');

  // ==========================================
  // 4. MOBILE /signup (390 x 844)
  // ==========================================
  console.log('--- Checking Mobile /signup 390x844 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
  await new Promise(r => setTimeout(r, 1000));

  const mobSignupShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_signup_new_showcase.png'), Buffer.from(mobSignupShot.result.data, 'base64'));
  console.log('Saved: mobile_signup_new_showcase.png');

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chrome.kill();
  console.log('Done.');
}
