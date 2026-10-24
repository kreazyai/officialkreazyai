#!/usr/bin/env node
/**
 * scripts/export-live-sqlite.mjs
 * 
 * Safely extracts and backs up live SQLite database records without modifying or deleting them.
 * Supports both:
 *   1. Remote extraction from Render via authenticated Super Admin API (/api/v1/admin/database/export)
 *   2. Local extraction from a SQLite .db file (e.g. data/kreazy.db)
 * 
 * Usage:
 *   node scripts/export-live-sqlite.mjs --url https://kreazyai.onrender.com/api/v1 --email admin@kreazyai.com --password "..."
 *   node scripts/export-live-sqlite.mjs --local-db data/kreazy.db
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { POSTGRES_TABLES_ORDERED } from '../src/server/db/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: process.env.REMOTE_API_URL || null,
    email: process.env.SUPER_ADMIN_EMAIL || null,
    password: process.env.SUPER_ADMIN_PASSWORD || null,
    token: process.env.SUPER_ADMIN_TOKEN || null,
    localDb: null,
    downloadDb: false,
    out: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) {
      options.url = args[++i].replace(/\/+$/, '');
    } else if (arg === '--email' && args[i + 1]) {
      options.email = args[++i];
    } else if (arg === '--password' && args[i + 1]) {
      options.password = args[++i];
    } else if (arg === '--token' && args[i + 1]) {
      options.token = args[++i];
    } else if (arg === '--local-db' && args[i + 1]) {
      options.localDb = args[++i];
    } else if (arg === '--download-db') {
      options.downloadDb = true;
    } else if (arg === '--out' && args[i + 1]) {
      options.out = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
KreazyAI SQLite Backup & Extraction Tool

Options:
  --url <url>          Base URL of backend API (e.g. https://kreazyai.onrender.com/api/v1)
  --email <email>      Super Admin email for authentication
  --password <pass>    Super Admin password for authentication
  --token <jwt>        Super Admin JWT token (skips login request)
  --local-db <path>    Path to local SQLite .db file (e.g. data/kreazy.db)
  --download-db        Download raw binary SQLite .db file from remote server as well
  --out <path>         Output path for export JSON file
  --help, -h           Show this help message
`);
}

function ensureBackupsDir() {
  const backupsDir = path.join(ROOT_DIR, 'data', 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  return backupsDir;
}

async function exportFromLocalDb(dbPath, outPath) {
  console.log(`[LOCAL EXPORT] Opening SQLite database at: ${dbPath}`);
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Local database file does not exist at: ${dbPath}`);
  }

  const db = new Database(dbPath, { readonly: true });
  const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);

  const tablesData = {};
  const counts = {};
  let totalRecords = 0;

  for (const tableName of POSTGRES_TABLES_ORDERED) {
    if (existingTables.includes(tableName)) {
      try {
        const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
        tablesData[tableName] = rows;
        counts[tableName] = rows.length;
        totalRecords += rows.length;
      } catch (err) {
        console.warn(`[LOCAL EXPORT] Warning reading table ${tableName}: ${err.message}`);
        tablesData[tableName] = [];
        counts[tableName] = 0;
      }
    } else {
      tablesData[tableName] = [];
      counts[tableName] = 0;
    }
  }

  db.close();

  const exportPayload = {
    metadata: {
      source: 'local-sqlite',
      sourcePath: dbPath,
      exportedAt: new Date().toISOString(),
      schemaTablesOrdered: POSTGRES_TABLES_ORDERED,
      tablesCount: POSTGRES_TABLES_ORDERED.length,
      totalRecords
    },
    counts,
    tables: tablesData
  };

  fs.writeFileSync(outPath, JSON.stringify(exportPayload, null, 2), 'utf-8');
  console.log(`[LOCAL EXPORT] Successfully exported ${totalRecords} records across ${POSTGRES_TABLES_ORDERED.length} tables to:\n  ${outPath}`);
  printSummaryTable(counts, totalRecords);
  return exportPayload;
}

async function exportFromRemote(options, outPath) {
  console.log(`[REMOTE EXPORT] Connecting to remote API at: ${options.url}`);

  let token = options.token;

  if (!token) {
    if (!options.email || !options.password) {
      throw new Error('Authentication required: please provide --token or --email and --password');
    }

    console.log(`[REMOTE EXPORT] Authenticating as Super Admin: ${options.email}...`);
    const loginRes = await fetch(`${options.url}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: options.email, password: options.password })
    });

    if (!loginRes.ok) {
      const errBody = await loginRes.text();
      throw new Error(`Admin authentication failed (${loginRes.status}): ${errBody}`);
    }

    const loginData = await loginRes.json();
    token = loginData.data?.token || loginData.token;
    if (!token) {
      throw new Error('Authentication response did not contain a valid JWT token.');
    }
    console.log('[REMOTE EXPORT] Authentication successful.');
  }

  console.log('[REMOTE EXPORT] Requesting full database export (/admin/database/export)...');
  const exportRes = await fetch(`${options.url}/admin/database/export`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!exportRes.ok) {
    const errBody = await exportRes.text();
    throw new Error(`Database export endpoint returned ${exportRes.status}: ${errBody}`);
  }

  const exportJson = await exportRes.json();
  const exportPayload = exportJson.data || exportJson;

  fs.writeFileSync(outPath, JSON.stringify(exportPayload, null, 2), 'utf-8');
  console.log(`[REMOTE EXPORT] Successfully downloaded export to:\n  ${outPath}`);

  if (options.downloadDb) {
    console.log('[REMOTE EXPORT] Downloading raw SQLite .db binary file (/admin/database/backup)...');
    const backupRes = await fetch(`${options.url}/admin/database/backup`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (backupRes.ok) {
      const dbBuf = await backupRes.arrayBuffer();
      const rawDbPath = outPath.replace(/\.json$/, '.db');
      fs.writeFileSync(rawDbPath, Buffer.from(dbBuf));
      console.log(`[REMOTE EXPORT] Raw SQLite binary file saved to:\n  ${rawDbPath}`);
    } else {
      console.warn(`[REMOTE EXPORT] Failed to download raw .db file: HTTP ${backupRes.status}`);
    }
  }

  const total = exportPayload.metadata?.totalRecords ?? Object.values(exportPayload.counts || {}).reduce((a, b) => a + b, 0);
  printSummaryTable(exportPayload.counts || {}, total);
  return exportPayload;
}

function printSummaryTable(counts, totalRecords) {
  console.log('\n--- Exported Tables & Record Counts ---');
  const nonZero = [];
  const empty = [];

  for (const [table, count] of Object.entries(counts)) {
    if (count > 0) {
      nonZero.push({ table, count });
    } else {
      empty.push(table);
    }
  }

  console.table(nonZero.map(item => ({ 'Table Name': item.table, 'Records': item.count })));
  console.log(`Total Records: ${totalRecords}`);
  console.log(`Empty Tables (${empty.length}): ${empty.join(', ')}\n`);
}

async function main() {
  const options = parseArgs();
  const backupsDir = ensureBackupsDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const defaultOutPath = path.join(backupsDir, `kreazy_export_${timestamp}.json`);
  const outPath = options.out ? path.resolve(options.out) : defaultOutPath;

  if (options.localDb) {
    await exportFromLocalDb(path.resolve(options.localDb), outPath);
  } else if (options.url) {
    await exportFromRemote(options, outPath);
  } else {
    // Check if local data/kreazy.db exists
    const defaultLocal = path.join(ROOT_DIR, 'data', 'kreazy.db');
    if (fs.existsSync(defaultLocal)) {
      console.log(`[AUTO-DETECT] Found local SQLite database at ${defaultLocal}. Exporting locally.`);
      await exportFromLocalDb(defaultLocal, outPath);
    } else {
      console.error('Error: No source specified. Provide either --local-db <path> or --url <url>');
      printHelp();
      process.exit(1);
    }
  }
}

main().catch(err => {
  console.error('[EXPORT ERROR]', err.message);
  process.exit(1);
});
