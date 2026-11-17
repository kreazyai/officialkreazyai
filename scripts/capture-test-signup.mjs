import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const PORT = 9285;
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--disable-gpu',
  '--no-sandbox',
  '--window-size=1440,900'
]);

setTimeout(async () => {
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
    const send = (m, p = {}) => new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const h = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === id) { ws.removeEventListener('message', h); resolve(msg); }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id, method: m, params: p }));
    });
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:5173/signup' });
    for (let i = 0; i < 20; i++) {
      const r = await send('Runtime.evaluate', { expression: `Boolean(document.querySelector('.auth-showcase-photo-signup'))` });
      if (r?.result?.result?.value) break;
      await new Promise(res => setTimeout(res, 500));
    }
    await new Promise(r => setTimeout(r, 1200));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/SADAT/.gemini/antigravity/brain/29ac6ca5-3600-4e48-a36f-79b80542ecfd/test_signup_phones.png', Buffer.from(shot.result.data, 'base64'));
    console.log('Saved test_signup_phones.png');
    ws.close();
  } catch(e) { console.error(e); }
  finally { chrome.kill(); }
}, 2500);
