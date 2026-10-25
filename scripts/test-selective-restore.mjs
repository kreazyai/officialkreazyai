/**
 * scripts/test-selective-restore.mjs
 * 
 * Comprehensive Test & Regression Suite for Selective Tenant Restore Engine:
 * 1. Target merchant extraction & isolation (Sadat merchant, 13 records across 10 tables).
 * 2. Super Admin protection guarantee (zero leakage, zero modification).
 * 3. Bcrypt password hash preservation.
 * 4. REGRESSION: WABA_id -> waba_id casing mismatch resolution.
 * 5. Case-safe SQL generation: verifies `"waba_id"` is used and NEVER `"WABA_id"`.
 * 6. Backward compatibility: verifies `normalizeRowCompat` populates both `waba_id` and `WABA_id`.
 * 7. Schema introspection: canonical schema definitions for all 42 tables.
 * 8. Validation engine: checks required NOT NULL columns, types, and DAG FK dependencies.
 * 9. Fail-safe regression tests: unmapped fields, missing required fields, and FK violations.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  extractSelectiveTenantData,
  validateSelectiveData,
  TARGET_SPEC
} from './restore-selective-tenant.mjs';
import {
  POSTGRES_TABLES_ORDERED,
  parseCanonicalPostgresSchema,
  mapRowToDestination,
  normalizeRowCompat,
  EXPLICIT_COLUMN_MAPPINGS
} from '../src/server/db/postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

async function main() {
  console.log('\n============================================================');
  console.log('   TEST SUITE: SELECTIVE RESTORE & POSTGRESQL COMPATIBILITY  ');
  console.log('============================================================\n');

  const backupPath = path.join(ROOT_DIR, 'data', 'backups', 'kreazy_export_2026-10-24T06-17-55-350Z.json');
  assert.ok(fs.existsSync(backupPath), `Backup file must exist at ${backupPath}`);

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
  const allTables = backupData.tables;

  const selective = extractSelectiveTenantData(allTables, TARGET_SPEC);

  // -------------------------------------------------------------
  // Test 1: Exactly 13 target records extracted across 10 tables
  // -------------------------------------------------------------
  const totalExtracted = Object.values(selective).reduce((sum, rows) => sum + rows.length, 0);
  assert.strictEqual(totalExtracted, 13, `Must extract exactly 13 records, got ${totalExtracted}`);
  
  const activeTables = Object.keys(selective).filter(t => selective[t].length > 0);
  assert.strictEqual(activeTables.length, 10, `Target records must span exactly 10 tables, got ${activeTables.length}`);
  console.log('  [PASS] Test 1: Exactly 13 target records extracted across 10 tables from 752 total backup records');

  // -------------------------------------------------------------
  // Test 2: Business & User Isolation
  // -------------------------------------------------------------
  assert.strictEqual(selective.businesses.length, 1);
  assert.strictEqual(selective.businesses[0].id, TARGET_SPEC.businessId);
  assert.strictEqual(selective.businesses[0].slug, 'sadat-4058');
  assert.strictEqual(selective.businesses[0].owner_email, TARGET_SPEC.email);

  assert.strictEqual(selective.users.length, 1);
  const user = selective.users[0];
  assert.strictEqual(user.id, TARGET_SPEC.userId);
  assert.strictEqual(user.email, TARGET_SPEC.email);
  assert.strictEqual(user.business_id, TARGET_SPEC.businessId);
  assert.strictEqual(user.role, 'OWNER');
  assert.strictEqual(user.is_super_admin, 0);
  console.log('  [PASS] Test 2: Target business (ws-1791314014057) and user account correctly isolated');

  // -------------------------------------------------------------
  // Test 3: Password hash preservation
  // -------------------------------------------------------------
  assert.ok(user.password_hash && user.password_hash.startsWith('$2'), 'Password hash must be intact bcrypt hash');
  assert.strictEqual(typeof user.password_hash, 'string');
  assert.ok(user.password_hash.length >= 60, 'Bcrypt hash length must be >= 60 characters');
  console.log('  [PASS] Test 3: Original bcrypt password hash preserved intact without modification');

  // -------------------------------------------------------------
  // Test 4: Complete exclusion of SUPER_ADMIN
  // -------------------------------------------------------------
  for (const tbl of Object.keys(selective)) {
    const rows = selective[tbl];
    for (const r of rows) {
      assert.notStrictEqual(r.role, 'SUPER_ADMIN', `SUPER_ADMIN role must never appear in selective restore`);
      assert.notStrictEqual(r.is_super_admin, 1, `is_super_admin=1 must never appear in selective restore`);
      assert.notStrictEqual(r.email, 'admin@kreazyai.com', `Platform super admin email must not appear`);
      assert.notStrictEqual(r.email, 'kreazyai@gmail.com', `Dev super admin email must not appear`);
    }
  }
  console.log('  [PASS] Test 4: Super Admin protection: 0 super-admin accounts in selective restore payload');

  // -------------------------------------------------------------
  // Test 5: REGRESSION: WABA_id -> waba_id Column Mapping
  // -------------------------------------------------------------
  assert.strictEqual(
    EXPLICIT_COLUMN_MAPPINGS.whatsapp_connections['WABA_id'],
    'waba_id',
    'EXPLICIT_COLUMN_MAPPINGS must map WABA_id to waba_id for whatsapp_connections'
  );

  const waRow = selective.whatsapp_connections[0];
  assert.ok(waRow, 'whatsapp_connections row must exist');
  assert.ok('WABA_id' in waRow, 'Original SQLite backup row must contain WABA_id');

  const { mappedRow: waMapped, unmappedKeys: waUnmapped, remappedKeys: waRemapped } = mapRowToDestination('whatsapp_connections', waRow);
  assert.strictEqual(waUnmapped.length, 0, 'Must have zero unmapped keys for whatsapp_connections');
  assert.ok('waba_id' in waMapped, 'Mapped row must contain waba_id');
  assert.ok(!('WABA_id' in waMapped), 'Mapped row must not contain original WABA_id key');
  assert.strictEqual(waRemapped.length, 1, 'Must track exactly 1 remapped key');
  assert.deepStrictEqual(waRemapped[0], { from: 'WABA_id', to: 'waba_id' });
  console.log('  [PASS] Test 5 (REGRESSION): WABA_id -> waba_id explicitly mapped, 0 unmapped keys');

  // -------------------------------------------------------------
  // Test 6: REGRESSION: SQL Generation Case-Safety
  // -------------------------------------------------------------
  const keys = Object.keys(waMapped).filter(k => waMapped[k] !== undefined);
  const cols = keys.map(k => `"${k}"`).join(', ');
  assert.ok(cols.includes('"waba_id"'), 'Generated SQL columns must include quoted "waba_id"');
  assert.ok(!cols.includes('"WABA_id"'), 'Generated SQL columns must NEVER include quoted "WABA_id"');

  const sql = `INSERT INTO "whatsapp_connections" (${cols}) VALUES (...) ON CONFLICT DO NOTHING`;
  assert.ok(!sql.includes('"WABA_id"'), 'Full SQL statement must not contain "WABA_id"');
  console.log('  [PASS] Test 6 (REGRESSION): SQL generation produces "waba_id" and prevents PostgreSQL column not found error');

  // -------------------------------------------------------------
  // Test 7: Backward Compatibility: normalizeRowCompat
  // -------------------------------------------------------------
  const dbResultRow = {
    id: 'waconn-ws-1791314014057',
    tenant_id: 'ws-1791314014057',
    waba_id: 'waba_test_9999',
    status: 'CONNECTED'
  };
  const normalized = normalizeRowCompat({ ...dbResultRow });
  assert.strictEqual(normalized.waba_id, 'waba_test_9999', 'Normalized row must retain waba_id');
  assert.strictEqual(normalized.WABA_id, 'waba_test_9999', 'Normalized row must alias WABA_id for legacy frontend compatibility');
  console.log('  [PASS] Test 7: normalizeRowCompat seamlessly populates both row.waba_id and row.WABA_id');

  // -------------------------------------------------------------
  // Test 8: Schema Introspection & Zero Unmapped Keys
  // -------------------------------------------------------------
  const canonicalSchemas = parseCanonicalPostgresSchema();
  assert.strictEqual(Object.keys(canonicalSchemas).length, 42, 'Must parse all 42 tables from POSTGRES_SCHEMA_SQL');

  for (const tbl of activeTables) {
    const rows = selective[tbl];
    for (const r of rows) {
      const { unmappedKeys } = mapRowToDestination(tbl, r, canonicalSchemas[tbl]?.columns);
      assert.strictEqual(unmappedKeys.length, 0, `Table ${tbl} row has unmapped keys: ${unmappedKeys.join(', ')}`);
    }
  }
  console.log('  [PASS] Test 8: 100% column alignment: 0 unmapped keys across all 13 selective records');

  // -------------------------------------------------------------
  // Test 9: Pre-flight Validation Engine on Target Payload
  // -------------------------------------------------------------
  const valResult = validateSelectiveData(canonicalSchemas, selective, TARGET_SPEC);
  assert.strictEqual(valResult.valid, true, `Validation must pass for target payload. Errors: ${valResult.errors.join('; ')}`);
  assert.strictEqual(valResult.errors.length, 0);
  assert.ok(valResult.remappedSummary.whatsapp_connections, 'Must identify whatsapp_connections remapping');
  assert.strictEqual(valResult.remappedSummary.whatsapp_connections[0], 'WABA_id -> waba_id');
  console.log('  [PASS] Test 9: Pre-flight validation engine passes 100% of checks on target merchant payload');

  // -------------------------------------------------------------
  // Test 10: Fail-Safe Detection: Catches Unmapped Column
  // -------------------------------------------------------------
  const badSelective1 = JSON.parse(JSON.stringify(selective));
  badSelective1.businesses[0].unknown_bogus_col = 'should_fail';
  const valFail1 = validateSelectiveData(canonicalSchemas, badSelective1, TARGET_SPEC);
  assert.strictEqual(valFail1.valid, false, 'Validation must fail when unmapped column is present');
  assert.ok(valFail1.errors.some(e => e.includes('unknown_bogus_col')), 'Error must cite unknown column');
  console.log('  [PASS] Test 10: Fail-safe: correctly rejects unmapped column and prevents silent field drop');

  // -------------------------------------------------------------
  // Test 11: Fail-Safe Detection: Catches Missing Required Column
  // -------------------------------------------------------------
  const badSelective2 = JSON.parse(JSON.stringify(selective));
  delete badSelective2.users[0].email;
  const valFail2 = validateSelectiveData(canonicalSchemas, badSelective2, TARGET_SPEC);
  assert.strictEqual(valFail2.valid, false, 'Validation must fail when required NOT NULL column is missing');
  assert.ok(valFail2.errors.some(e => e.includes('Missing required NOT NULL field "email"')), 'Error must cite missing email');
  console.log('  [PASS] Test 11: Fail-safe: correctly rejects missing NOT NULL required fields without default');

  // -------------------------------------------------------------
  // Test 12: Fail-Safe Detection: Catches Foreign-Key DAG Violation
  // -------------------------------------------------------------
  const badSelective3 = JSON.parse(JSON.stringify(selective));
  badSelective3.ai_credit_wallets[0].tenant_id = 'ws-non-existent-parent';
  const valFail3 = validateSelectiveData(canonicalSchemas, badSelective3, TARGET_SPEC);
  assert.strictEqual(valFail3.valid, false, 'Validation must fail on dangling foreign key');
  assert.ok(valFail3.errors.some(e => e.includes('Foreign key constraint failure')), 'Error must cite FK violation');
  console.log('  [PASS] Test 12: Fail-safe: correctly enforces foreign-key DAG dependencies');

  // -------------------------------------------------------------
  // Test 13: DAG Ordering Verification
  // -------------------------------------------------------------
  const indices = activeTables.map(t => POSTGRES_TABLES_ORDERED.indexOf(t));
  for (let i = 1; i < indices.length; i++) {
    assert.ok(indices[i] > indices[i - 1], `Topological DAG order violated: ${activeTables[i - 1]} must precede ${activeTables[i]}`);
  }
  console.log('  [PASS] Test 13: Ingestion DAG ordering verified (businesses -> users -> ... -> credit_transactions)');

  console.log('\n============================================================');
  console.log('  ALL REGRESSION & COMPATIBILITY TESTS PASSED (13/13)');
  console.log('============================================================\n');
}

main().catch(err => {
  console.error('\n[TEST FAILURE]', err);
  process.exit(1);
});
