import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\SADAT\\.gemini\\antigravity\\brain\\29ac6ca5-3600-4e48-a36f-79b80542ecfd';

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await new Promise((res, rej) => {
    http.get('http://127.0.0.1:9225/json', (r) => {
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
  console.log('--- Checking Desktop 1440x900 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2500));

  // Scroll to Hero top
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
  await new Promise(r => setTimeout(r, 800));

  const desktopHeroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_hero_pricing_verified.png'), Buffer.from(desktopHeroShot.result.data, 'base64'));
  console.log('Saved: desktop_hero_pricing_verified.png');

  // Scroll to Centered Trending Telemetry Section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.hero-trending-telemetry-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const desktopTelemetryShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'desktop_centered_telemetry_verified.png'), Buffer.from(desktopTelemetryShot.result.data, 'base64'));
  console.log('Saved: desktop_centered_telemetry_verified.png');

  // ==========================================
  // 2. MOBILE VIEWPORT (390 x 844)
  // ==========================================
  console.log('--- Checking Mobile 390x844 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  // Scroll to top
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0);` });
  await new Promise(r => setTimeout(r, 1200));

  // Check overflow and elements
  const mobileAudit = await send('Runtime.evaluate', {
    expression: `(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const pills = document.querySelector('.hero-feature-pills');
      const pricing = document.querySelector('.hero-col-right .hero-pricing-widget');
      const telemetry = document.querySelector('.hero-trending-telemetry-section');
      const metricCard = document.querySelector('.hero-trending-telemetry-wrap .hero-visible-metric-card');
      const liveTag = document.querySelector('.hero-metric-live-text')?.textContent;
      return {
        scrollWidth,
        innerWidth,
        zeroOverflow: scrollWidth <= innerWidth,
        pillsRemoved: !pills,
        pricingInHero: !!pricing,
        telemetryPresent: !!telemetry,
        metricCardCentered: !!metricCard,
        liveTag
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile Audit Result:', JSON.stringify(mobileAudit.result.result.value, null, 2));

  // Capture Mobile Hero
  const mobHeroShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_hero_pricing_verified.png'), Buffer.from(mobHeroShot.result.data, 'base64'));
  console.log('Saved: mobile_hero_pricing_verified.png');

  // Scroll down a bit in Hero to capture the pricing widget on mobile
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.hero-pricing-widget');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const mobPricingShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_hero_pricing_widget_scroll.png'), Buffer.from(mobPricingShot.result.data, 'base64'));
  console.log('Saved: mobile_hero_pricing_widget_scroll.png');

  // Scroll to Centered Trending Telemetry Section
  await send('Runtime.evaluate', {
    expression: `(() => {
      const el = document.querySelector('.hero-trending-telemetry-section');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const mobTelemetryShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_centered_telemetry_verified.png'), Buffer.from(mobTelemetryShot.result.data, 'base64'));
  console.log('Saved: mobile_centered_telemetry_verified.png');

  ws.close();
} catch (e) {
  console.error('Error during verification:', e);
} finally {
  chrome.kill();
  console.log('Done.');
}
