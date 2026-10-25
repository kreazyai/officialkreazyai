import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { POSTGRES_SCHEMA_SQL, POSTGRES_TABLES_ORDERED } from '../src/server/db/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const backupPath = path.join(ROOT_DIR, 'data', 'backups', 'kreazy_export_2026-10-24T06-17-55-350Z.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

// Parse all table schemas from POSTGRES_SCHEMA_SQL
function parsePgSchema(sql) {
  const tableSchemas = {};
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:\"?([a-zA-Z0-9_]+)\"?)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns = {};
    const lines = body.split('\n');
    for (let rawLine of lines) {
      const line = rawLine.trim().replace(/,$/, '');
      if (!line || line.startsWith('--') || /^(UNIQUE|PRIMARY\s+KEY|FOREIGN\s+KEY|CHECK|CONSTRAINT)\b/i.test(line)) {
        continue;
      }
      const parts = line.split(/\s+/);
      const colName = parts[0].replace(/\"/g, '');
      const colType = parts[1] || '';
      const isNullable = !line.toUpperCase().includes('NOT NULL');
      const hasDefault = line.toUpperCase().includes('DEFAULT');
      columns[colName] = {
        name: colName,
        type: colType,
        isNullable,
        hasDefault,
        raw: line
      };
    }
    tableSchemas[tableName] = columns;
  }
  return tableSchemas;
}

const pgSchemas = parsePgSchema(POSTGRES_SCHEMA_SQL);

console.log('=== FULL COLUMN COMPARISON: SQLITE BACKUP VS POSTGRESQL DDL ===\n');

const report = {};

for (const tableName of POSTGRES_TABLES_ORDERED) {
  const backupRows = backupData.tables[tableName] || [];
  if (backupRows.length === 0) continue;

  const pgCols = pgSchemas[tableName] || {};
  const pgColNames = Object.keys(pgCols);
  const pgColLowerMap = {};
  for (const c of pgColNames) {
    pgColLowerMap[c.toLowerCase()] = c;
  }

  // Collect all unique keys from all rows in this table
  const allKeys = new Set();
  for (const r of backupRows) {
    Object.keys(r).forEach(k => allKeys.add(k));
  }

  const caseMismatches = [];
  const missingInPg = [];
  const validColumns = [];

  for (const bKey of allKeys) {
    if (pgCols[bKey]) {
      validColumns.push(bKey);
    } else if (pgColLowerMap[bKey.toLowerCase()]) {
      caseMismatches.push({
        sqliteKey: bKey,
        pgColumn: pgColLowerMap[bKey.toLowerCase()]
      });
    } else {
      missingInPg.push(bKey);
    }
  }

  // Check if any NOT NULL PG columns with no default are missing from the backup
  const missingRequiredInPg = [];
  for (const [pCol, pDef] of Object.entries(pgCols)) {
    const foundInBackup = allKeys.has(pCol) || caseMismatches.some(m => m.pgColumn === pCol);
    if (!foundInBackup && !pDef.isNullable && !pDef.hasDefault) {
      missingRequiredInPg.push(pCol);
    }
  }

  report[tableName] = {
    totalBackupRows: backupRows.length,
    totalBackupCols: allKeys.size,
    totalPgCols: pgColNames.length,
    validColumns: validColumns.length,
    caseMismatches,
    missingInPg,
    missingRequiredInPg
  };
}

for (const [tbl, info] of Object.entries(report)) {
  console.log(`Table: ${tbl} (${info.totalBackupRows} rows)`);
  if (info.caseMismatches.length > 0) {
    console.log('  ⚠️ CASE MISMATCHES:');
    info.caseMismatches.forEach(m => console.log(`     SQLite: "${m.sqliteKey}"  -->  Postgres: "${m.pgColumn}"`));
  }
  if (info.missingInPg.length > 0) {
    console.log('  ❌ MISSING IN PG SCHEMA:');
    info.missingInPg.forEach(col => console.log(`     "${col}" exists in SQLite backup but NOT in PostgreSQL table!`));
  }
  if (info.missingRequiredInPg.length > 0) {
    console.log('  🚨 MISSING REQUIRED PG COLUMNS:');
    info.missingRequiredInPg.forEach(col => console.log(`     "${col}" is NOT NULL without default in PG but missing from SQLite!`));
  }
  if (info.caseMismatches.length === 0 && info.missingInPg.length === 0 && info.missingRequiredInPg.length === 0) {
    console.log('  ✅ 100% Column alignment (all ' + info.totalBackupCols + ' columns match PG schema)');
  }
  console.log('');
}

console.log('\n============================================================');
console.log('  FULL DDL COMPARISON: SQLITE DDL VS POSTGRESQL DDL (42 TABLES)');
console.log('============================================================\n');

const dbFile = fs.readFileSync(path.join(ROOT_DIR, 'src', 'server', 'config', 'database.js'), 'utf8');
const sqliteSchemas = {};
const sqlTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
let m;
while ((m = sqlTableRegex.exec(dbFile)) !== null) {
  const tbl = m[1];
  const body = m[2];
  const cols = [];
  for (let l of body.split('\n')) {
    l = l.trim().replace(/,$/, '');
    if (!l || l.startsWith('--') || /^(UNIQUE|PRIMARY\s+KEY|FOREIGN\s+KEY|CHECK|CONSTRAINT)\b/i.test(l)) continue;
    cols.push(l.split(/\s+/)[0].replace(/\"/g, ''));
  }
  sqliteSchemas[tbl] = cols;
}

let totalDdlMismatches = 0;
for (const tbl of POSTGRES_TABLES_ORDERED) {
  const sCols = sqliteSchemas[tbl] || [];
  const pgCols = Object.keys(pgSchemas[tbl] || {});
  const pgLowerMap = {};
  pgCols.forEach(c => pgLowerMap[c.toLowerCase()] = c);

  const caseMismatches = [];
  const missingInPg = [];

  for (const sc of sCols) {
    if (!pgCols.includes(sc)) {
      if (pgLowerMap[sc.toLowerCase()]) {
        caseMismatches.push({ sqlite: sc, pg: pgLowerMap[sc.toLowerCase()] });
      } else {
        missingInPg.push(sc);
      }
    }
  }

  if (caseMismatches.length > 0 || missingInPg.length > 0) {
    totalDdlMismatches++;
    console.log(`Table ${tbl}:`);
    if (caseMismatches.length > 0) {
      console.log('  ⚠️ Casing differences:', caseMismatches);
    }
    if (missingInPg.length > 0) {
      console.log('  ❌ Missing in PG DDL:', missingInPg);
    }
  }
}

if (totalDdlMismatches === 0) {
  console.log('✅ ALL 42 TABLES in SQLite and PostgreSQL DDL have identical column names!');
} else {
  console.log(`\nFound ${totalDdlMismatches} tables with naming or casing differences between SQLite and PostgreSQL DDL.`);
}

