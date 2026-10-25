#!/usr/bin/env node
/**
 * scripts/migrate-sqlite-to-postgres.mjs
 * 
 * Safe, idempotent SQLite-to-PostgreSQL data migration runner for KreazyAI.
 * 
 * Features:
 *   - Dependency-ordered migration according to POSTGRES_TABLES_ORDERED DAG.
 *   - Ingests from either JSON export (from export-live-sqlite.mjs) or directly from SQLite .db.
 *   - Uses parameterized INSERT with ON CONFLICT DO NOTHING to guarantee idempotency and zero duplicates.
 *   - Preserves all IDs, password hashes, relationships, JSON text, and ISO timestamps.
 *   - Full count verification and reconciliation audit table.
 *   - Connects to Neon PostgreSQL via POSTGRES_URL with secure SSL pooling.
 * 
 * Usage:
 *   node scripts/migrate-sqlite-to-postgres.mjs --source data/backups/kreazy_export_....json
 *   node scripts/migrate-sqlite-to-postgres.mjs --source data/kreazy.db
 *   node scripts/migrate-sqlite-to-postgres.mjs --verify-only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import {
  getPostgresPool,
  closePostgresPool,
  PostgresDatabaseAdapter,
  runPostgresMigrations,
  POSTGRES_TABLES_ORDERED,
  mapRowToDestination
} from '../src/server/db/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    source: null,
    targetUrl: process.env.POSTGRES_URL || null,
    dryRun: false,
    verifyOnly: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--source' && args[i + 1]) {
      options.source = args[++i];
    } else if (arg === '--target' && args[i + 1]) {
      options.targetUrl = args[++i];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verify-only') {
      options.verifyOnly = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp() {
  console.log(`
KreazyAI SQLite to PostgreSQL Migration Engine

Options:
  --source <path>     Path to SQLite export JSON or SQLite .db file
  --target <url>      Destination PostgreSQL connection URL (defaults to POSTGRES_URL env)
  --dry-run           Test schema initialization without inserting records
  --verify-only       Verify existing table record counts against source without modifying data
  --help, -h          Show this help message
`);
}

function loadSourceData(sourcePath) {
  if (!sourcePath) {
    throw new Error('Source path must be specified via --source <path>');
  }

  const resolved = path.resolve(sourcePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Source file does not exist at: ${resolved}`);
  }

  if (resolved.endsWith('.json')) {
    console.log(`[SOURCE] Ingesting JSON export from: ${resolved}`);
    const raw = fs.readFileSync(resolved, 'utf-8');
    const parsed = JSON.parse(raw);
    const tables = parsed.tables || parsed.data?.tables || parsed;
    const counts = parsed.counts || parsed.data?.counts || {};

    const normalizedTables = {};
    const normalizedCounts = {};

    for (const tbl of POSTGRES_TABLES_ORDERED) {
      normalizedTables[tbl] = tables[tbl] || [];
      normalizedCounts[tbl] = normalizedTables[tbl].length;
    }

    return {
      sourceType: 'JSON Export',
      sourcePath: resolved,
      tables: normalizedTables,
      counts: normalizedCounts
    };
  }

  // SQLite .db file
  console.log(`[SOURCE] Reading directly from SQLite database: ${resolved}`);
  const db = new Database(resolved, { readonly: true });
  const existingTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);

  const tables = {};
  const counts = {};

  for (const tbl of POSTGRES_TABLES_ORDERED) {
    if (existingTables.includes(tbl)) {
      try {
        const rows = db.prepare(`SELECT * FROM "${tbl}"`).all();
        tables[tbl] = rows;
        counts[tbl] = rows.length;
      } catch (err) {
        console.warn(`[SOURCE] Warning reading table ${tbl}:`, err.message);
        tables[tbl] = [];
        counts[tbl] = 0;
      }
    } else {
      tables[tbl] = [];
      counts[tbl] = 0;
    }
  }

  db.close();
  return {
    sourceType: 'SQLite Binary File',
    sourcePath: resolved,
    tables,
    counts
  };
}

async function migrateData(sourceData, pool, dryRun) {
  const adapter = new PostgresDatabaseAdapter(pool);

  console.log('[MIGRATION] Ensuring PostgreSQL schema, tables, views, and indexes exist...');
  await runPostgresMigrations(adapter);
  console.log('[MIGRATION] Schema verified successfully.');

  if (dryRun) {
    console.log('[DRY-RUN] Schema initialized. Dry run mode enabled: skipping data inserts.');
    return;
  }

  console.log('\n[MIGRATION] Ingesting records in topological dependency order...');
  const migrationResults = {};

  const client = await pool.connect();

  try {
    for (const tableName of POSTGRES_TABLES_ORDERED) {
      const rows = sourceData.tables[tableName] || [];
      if (rows.length === 0) {
        migrationResults[tableName] = { total: 0, inserted: 0, skipped: 0 };
        continue;
      }

      console.log(`[TABLE] Migrating ${tableName} (${rows.length} records)...`);
      let insertedCount = 0;
      let skippedCount = 0;

      // Wrap in table-level transaction
      await client.query('BEGIN');

      try {
        for (const row of rows) {
          const { mappedRow, unmappedKeys } = mapRowToDestination(tableName, row);
          if (unmappedKeys.length > 0) {
            console.warn(`[MIGRATION WARNING] Table ${tableName} row has unmapped keys:`, unmappedKeys);
          }

          const keys = Object.keys(mappedRow).filter(k => mappedRow[k] !== undefined);
          if (keys.length === 0) continue;

          const cols = keys.map(k => `"${k}"`).join(', ');
          const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
          const values = keys.map(k => {
            const val = mappedRow[k];
            // Format dates or booleans if necessary
            if (val === null) return null;
            return val;
          });

          const sql = `INSERT INTO "${tableName}" (${cols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
          const res = await client.query(sql, values);
          if (res.rowCount > 0) {
            insertedCount++;
          } else {
            skippedCount++;
          }
        }

        await client.query('COMMIT');
        migrationResults[tableName] = {
          total: rows.length,
          inserted: insertedCount,
          skipped: skippedCount
        };
      } catch (tblErr) {
        await client.query('ROLLBACK');
        console.error(`[MIGRATION ERROR] Failed on table ${tableName}:`, tblErr.message);
        throw tblErr;
      }
    }
  } finally {
    client.release();
  }

  return migrationResults;
}

async function verifyAndReconcile(sourceData, pool) {
  console.log('\n============================================================');
  console.log('              DATA RECONCILIATION & AUDIT                   ');
  console.log('============================================================\n');

  const report = [];
  let allMatched = true;
  let totalSourceRecords = 0;
  let totalDestRecords = 0;

  for (const tableName of POSTGRES_TABLES_ORDERED) {
    const srcCount = sourceData.counts[tableName] || 0;
    totalSourceRecords += srcCount;

    let destCount = 0;
    try {
      const res = await pool.query(`SELECT COUNT(*)::int as count FROM "${tableName}"`);
      destCount = res.rows[0].count;
    } catch (err) {
      destCount = -1;
    }

    totalDestRecords += Math.max(0, destCount);

    const match = destCount >= srcCount;
    if (!match) allMatched = false;

    if (srcCount > 0 || destCount > 0) {
      report.push({
        Table: tableName,
        'Source (SQLite)': srcCount,
        'Destination (PostgreSQL)': destCount,
        Status: destCount >= srcCount ? 'MATCH / OK' : 'MISMATCH'
      });
    }
  }

  console.table(report);
  console.log(`Total Source Records:      ${totalSourceRecords}`);
  console.log(`Total Destination Records: ${totalDestRecords}`);

  if (allMatched) {
    console.log('\n SUCCESS: All table record counts match or exceed source counts. Migration complete.');
  } else {
    console.error('\n WARNING: Some tables have fewer records than the source! Check table details above.');
  }

  return allMatched;
}

async function main() {
  const options = parseArgs();

  const targetUrl = options.targetUrl || process.env.POSTGRES_URL;
  if (!targetUrl) {
    console.error('Error: POSTGRES_URL is not set. Provide --target <POSTGRES_URL> or set POSTGRES_URL in environment.');
    process.exit(1);
  }

  let sourceData = null;
  if (options.source) {
    sourceData = loadSourceData(options.source);
  } else {
    // Check if data/backups/ has recent export or data/kreazy.db
    const backupsDir = path.join(ROOT_DIR, 'data', 'backups');
    if (fs.existsSync(backupsDir)) {
      const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json')).sort().reverse();
      if (files.length > 0) {
        const latest = path.join(backupsDir, files[0]);
        console.log(`[AUTO-DETECT] Found latest JSON backup at: ${latest}`);
        sourceData = loadSourceData(latest);
      }
    }

    if (!sourceData) {
      const localDb = path.join(ROOT_DIR, 'data', 'kreazy.db');
      if (fs.existsSync(localDb)) {
        console.log(`[AUTO-DETECT] Found local SQLite database at: ${localDb}`);
        sourceData = loadSourceData(localDb);
      }
    }

    if (!sourceData) {
      console.error('Error: No source data found. Please run scripts/export-live-sqlite.mjs or provide --source <path>');
      process.exit(1);
    }
  }

  const pool = getPostgresPool(targetUrl);

  try {
    // Quick test connection
    const testRes = await pool.query('SELECT NOW() as now, version() as version');
    console.log(`[POSTGRES] Connected successfully to Neon PostgreSQL! (Server time: ${testRes.rows[0].now})`);

    if (!options.verifyOnly) {
      await migrateData(sourceData, pool, options.dryRun);
    }

    await verifyAndReconcile(sourceData, pool);
  } finally {
    await closePostgresPool();
  }
}

main().catch(err => {
  console.error('[FATAL MIGRATION ERROR]', err);
  process.exit(1);
});
