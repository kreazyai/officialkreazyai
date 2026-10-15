import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('============================================================');
console.log('STARTING KREAZYAI FULL-STACK DEVELOPMENT ENVIRONMENT');
console.log('1. Express REST API Server  -> http://0.0.0.0:5000');
console.log('2. Vite Frontend Dev Server -> http://0.0.0.0:5173 (LAN/Mobile)');
console.log('============================================================\n');

let serverProc = null;
let viteProc = null;

function cleanup() {
  if (serverProc && !serverProc.killed) {
    try { serverProc.kill('SIGTERM'); } catch {}
  }
  if (viteProc && !viteProc.killed) {
    try { viteProc.kill('SIGTERM'); } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// 1. Launch Backend Server
const serverScript = path.join(rootDir, 'src', 'server', 'server.js');
serverProc = spawn(process.execPath, [serverScript], {
  cwd: rootDir,
  env: { ...process.env, HOST: '0.0.0.0' },
  stdio: 'inherit'
});

serverProc.on('error', (err) => {
  console.error('[SERVER ERROR]', err.message);
});

serverProc.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`[SERVER EXITED with code ${code}]`);
  }
});

// 2. Launch Vite Frontend with host binding
const viteScript = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
viteProc = spawn(process.execPath, [viteScript, '--host'], {
  cwd: rootDir,
  env: process.env,
  stdio: 'inherit'
});

viteProc.on('error', (err) => {
  console.error('[VITE ERROR]', err.message);
});

viteProc.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`[VITE EXITED with code ${code}]`);
  }
});
