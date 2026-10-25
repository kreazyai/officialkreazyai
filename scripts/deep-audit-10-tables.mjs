import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { POSTGRES_SCHEMA_SQL, POSTGRES_TABLES_ORDERED, EXPLICIT_COLUMN_MAPPINGS, mapRowToDestination } from '../src/server/db/postgres.js';
import { extractSelectiveTenantData } from './restore-selective-tenant.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const backupPath = path.join(ROOT_DIR, 'data', 'backups', 'kreazy_export_2026-10-24T06-17-55-350Z.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const selective = extractSelectiveTenantData(backupData.tables);

export function parseCanonicalSchema(sql) {
  const tableSchemas = {};
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:\"?([a-zA-Z0-9_]+)\"?)\s*\(([\s\S]*?)\);/gi;
  let match;
  while ((match = tableRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns = {};
    const foreignKeys = [];
    let primaryKey = null;
    const uniqueConstraints = [];

    const lines = body.split('\n');
    for (let rawLine of lines) {
      const line = rawLine.trim().replace(/,$/, '');
      if (!line || line.startsWith('--')) continue;

      const pkMatch = /^PRIMARY\s+KEY\s*\(([^)]+)\)/i.exec(line);
      if (pkMatch) {
        primaryKey = pkMatch[1].replace(/\"/g, '').trim();
        continue;
      }

      const uqMatch = /^UNIQUE\s*\(([^)]+)\)/i.exec(line);
      if (uqMatch) {
        uniqueConstraints.push(uqMatch[1].split(',').map(s => s.replace(/\"/g, '').trim()));
        continue;
      }

      const fkMatch = /^FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i.exec(line);
      if (fkMatch) {
        foreignKeys.push({
          column: fkMatch[1].replace(/\"/g, '').trim(),
          referencedTable: fkMatch[2],
          referencedColumn: fkMatch[3].replace(/\"/g, '').trim()
        });
        continue;
      }

      const parts = line.split(/\s+/);
      const colName = parts[0].replace(/\"/g, '');
      const colType = parts[1] || '';
      const isPk = /PRIMARY\s+KEY/i.test(line);
      if (isPk) primaryKey = colName;
      const isNullable = !/NOT\s+NULL/i.test(line);
      const hasDefault = /DEFAULT\b/i.test(line);

      const inlineFk = /REFERENCES\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)/i.exec(line);
      if (inlineFk) {
        foreignKeys.push({
          column: colName,
          referencedTable: inlineFk[1],
          referencedColumn: inlineFk[2].replace(/\"/g, '').trim()
        });
      }

      columns[colName] = {
        name: colName,
        type: colType,
        isNullable,
        hasDefault,
        isPrimaryKey: isPk,
        raw: line
      };
    }

    tableSchemas[tableName] = {
      tableName,
      columns,
      primaryKey,
      foreignKeys,
      uniqueConstraints
    };
  }
  return tableSchemas;
}

const canonicalSchemas = parseCanonicalSchema(POSTGRES_SCHEMA_SQL);

console.log('========================================================================');
console.log('  DEEP DIVE INSPECTION: 10 SELECTED TABLES FOR TARGET MERCHANT RESTORE  ');
console.log('========================================================================\n');

const activeTables = Object.keys(selective).filter(t => selective[t].length > 0);
console.log(`Identified ${activeTables.length} tables with records for target merchant:\n${activeTables.map((t, idx) => `  ${idx + 1}. ${t} (${selective[t].length} records)`).join('\n')}\n`);

for (const tableName of activeTables) {
  const rows = selective[tableName];
  const schema = canonicalSchemas[tableName];
  if (!schema) {
    console.error(`ERROR: Table ${tableName} missing from canonical PostgreSQL schema!`);
    continue;
  }

  console.log(`------------------------------------------------------------------------`);
  console.log(`TABLE: ${tableName} (${rows.length} record(s)) | PK: ${schema.primaryKey || 'NONE'}`);
  console.log(`------------------------------------------------------------------------`);
  
  if (schema.foreignKeys.length > 0) {
    console.log('Foreign Keys:');
    schema.foreignKeys.forEach(fk => {
      console.log(`  - ${fk.column} -> ${fk.referencedTable}(${fk.referencedColumn})`);
    });
  }

  // Get all unique keys in backup records for this table
  const backupKeys = new Set();
  rows.forEach(r => Object.keys(r).forEach(k => backupKeys.add(k)));

  const colComparison = [];
  for (const bKey of backupKeys) {
    const isExplicit = (EXPLICIT_COLUMN_MAPPINGS[tableName] || {})[bKey];
    const exactMatch = schema.columns[bKey];
    const caseMatch = Object.keys(schema.columns).find(c => c.toLowerCase() === bKey.toLowerCase());
    
    let destCol = bKey;
    let status = 'EXACT MATCH';
    if (isExplicit) {
      destCol = isExplicit;
      status = `EXPLICIT MAP (${bKey} -> ${destCol})`;
    } else if (!exactMatch && caseMatch) {
      destCol = caseMatch;
      status = `CASE MISMATCH (${bKey} -> ${destCol})`;
    } else if (!exactMatch) {
      status = 'UNMAPPED / MISSING IN DESTINATION';
    }

    const pgColDef = schema.columns[destCol] || {};
    colComparison.push({
      'Backup Key': bKey,
      'Dest Column': destCol,
      'PG Type': pgColDef.type || 'N/A',
      'Nullable': pgColDef.isNullable !== undefined ? (pgColDef.isNullable ? 'YES' : 'NO') : 'N/A',
      'Default': pgColDef.hasDefault ? 'YES' : 'NO',
      'Status': status
    });
  }

  console.table(colComparison);

  // Validate mapping through mapRowToDestination
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { mappedRow, unmappedKeys, remappedKeys } = mapRowToDestination(tableName, row, schema.columns);
    if (unmappedKeys.length > 0) {
      console.warn(`  ⚠️ Row #${i + 1} has UNMAPPED keys:`, unmappedKeys);
    }
    if (remappedKeys.length > 0) {
      console.log(`  ℹ️ Row #${i + 1} remapped keys:`, remappedKeys);
    }
  }

  console.log('');
}
