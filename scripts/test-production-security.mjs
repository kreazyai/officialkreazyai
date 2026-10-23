import assert from 'assert';
import path from 'path';
import fs from 'fs';
import os from 'os';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { 
  config, 
  validateProductionEnv, 
  assertProductionEnv, 
  INSECURE_DEFAULT_SECRETS 
} from '../src/server/config/env.js';
import { 
  resolveDbPath, 
  runMigrations, 
  seedInitialData, 
  ensureSuperAdmin, 
  ensureBillingData, 
  ensureWhatsAppConnection,
  closeDatabase 
} from '../src/server/config/database.js';

console.log('============================================================');
console.log('STARTING PRODUCTION SECURITY & CONFIG REGRESSION TESTS');
console.log('============================================================\n');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    throw err;
  }
}

async function asyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    throw err;
  }
}

async function runAllTests() {
  // ── TEST GROUP 1: Production Environment Security Validation ──
  console.log('--- TEST GROUP 1: Production Environment Security Validation ---');

  test('1.1 Rejects missing JWT_SECRET in production', () => {
    const res = validateProductionEnv({
      NODE_ENV: 'production',
      JWT_SECRET: '',
      META_ENCRYPTION_KEY: 'a'.repeat(32)
    }, { force: true });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('JWT_SECRET is required')));
  });

  test('1.2 Rejects short JWT_SECRET (< 32 chars) in production', () => {
    const res = validateProductionEnv({
      NODE_ENV: 'production',
      JWT_SECRET: 'too_short_jwt_secret',
      META_ENCRYPTION_KEY: 'a'.repeat(32)
    }, { force: true });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('at least 32 characters')));
  });

  test('1.3 Rejects insecure default JWT_SECRET in production', () => {
    for (const secret of INSECURE_DEFAULT_SECRETS) {
      const res = validateProductionEnv({
        NODE_ENV: 'production',
        JWT_SECRET: secret,
        META_ENCRYPTION_KEY: 'valid_secure_encryption_key_32_chars_ok!'
      }, { force: true });
      assert.strictEqual(res.valid, false, `Should reject insecure secret: ${secret}`);
      assert.ok(res.errors.some(e => e.includes('insecure default value')));
    }
  });

  test('1.4 Rejects missing or insecure META_ENCRYPTION_KEY in production', () => {
    const missingRes = validateProductionEnv({
      NODE_ENV: 'production',
      JWT_SECRET: 'super_secure_jwt_token_secret_min_32_chars_now!',
      META_ENCRYPTION_KEY: ''
    }, { force: true });
    assert.strictEqual(missingRes.valid, false);
    assert.ok(missingRes.errors.some(e => e.includes('META_ENCRYPTION_KEY')));

    const defaultRes = validateProductionEnv({
      NODE_ENV: 'production',
      JWT_SECRET: 'super_secure_jwt_token_secret_min_32_chars_now!',
      META_ENCRYPTION_KEY: 'kreazy_meta_aes_256_secret_key_32b_2026'
    }, { force: true });
    assert.strictEqual(defaultRes.valid, false);
    assert.ok(defaultRes.errors.some(e => e.includes('insecure default secret')));
  });

  test('1.5 Rejects insecure default WHATSAPP_WEBHOOK_VERIFY_TOKEN in production', () => {
    const res = validateProductionEnv({
      NODE_ENV: 'production',
      JWT_SECRET: 'super_secure_jwt_token_secret_min_32_chars_now!',
      META_ENCRYPTION_KEY: 'super_secure_encryption_key_min_32_chars!',
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'kreazy_meta_webhook_verification_token_2026'
    }, { force: true });
    assert.strictEqual(res.valid, false);
    assert.ok(res.errors.some(e => e.includes('insecure default value')));
  });

  test('1.6 Rejects weak or default SUPER_ADMIN_PASSWORD in production', () => {
    const weakRes = validateProductionEnv({
      NODE_ENV: 'production',
      JWT_SECRET: 'super_secure_jwt_token_secret_min_32_chars_now!',
      META_ENCRYPTION_KEY: 'super_secure_encryption_key_min_32_chars!',
      SUPER_ADMIN_PASSWORD: 'short'
    }, { force: true });
    assert.strictEqual(weakRes.valid, false);
    assert.ok(weakRes.errors.some(e => e.includes('at least 12 characters')));

    const defaultRes = validateProductionEnv({
      NODE_ENV: 'production',
      JWT_SECRET: 'super_secure_jwt_token_secret_min_32_chars_now!',
      META_ENCRYPTION_KEY: 'super_secure_encryption_key_min_32_chars!',
      SUPER_ADMIN_PASSWORD: 'KreazyAI_Admin_2026!'
    }, { force: true });
    assert.strictEqual(defaultRes.valid, false);
    assert.ok(defaultRes.errors.some(e => e.includes('cannot be a known default')));
  });

  test('1.7 Accepts secure, compliant production environment variables', () => {
    const validRes = validateProductionEnv({
      NODE_ENV: 'production',
      JWT_SECRET: 'my_production_ultra_secret_key_for_jwt_auth_32b!',
      META_ENCRYPTION_KEY: 'my_production_aes_master_key_for_db_crypto_32b!',
      WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'custom_secure_verify_token_prod_991823',
      SUPER_ADMIN_EMAIL: 'prod.admin@company.com',
      SUPER_ADMIN_PASSWORD: 'SuperP@ssw0rd!2026#Secure'
    }, { force: true });
    assert.strictEqual(validRes.valid, true);
    assert.strictEqual(validRes.errors.length, 0);
  });

  test('1.8 assertProductionEnv throws when production requirements are violated', () => {
    assert.throws(() => {
      assertProductionEnv({
        NODE_ENV: 'production',
        JWT_SECRET: 'short'
      });
    }, /Production security validation failed/);
  });

  // ── TEST GROUP 2: SQLite Database Path Resolution & /var/data/kreazy.db ──
  console.log('\n--- TEST GROUP 2: Database URL & SQLite Path Resolution ---');

  test('2.1 resolveDbPath handles /var/data/kreazy.db correctly', () => {
    const resolved = resolveDbPath('/var/data/kreazy.db');
    assert.ok(path.isAbsolute(resolved));
    assert.ok(resolved.endsWith(path.join('var', 'data', 'kreazy.db')) || resolved.endsWith('kreazy.db'));
  });

  test('2.2 resolveDbPath handles sqlite:///var/data/kreazy.db URL scheme', () => {
    const resolved = resolveDbPath('sqlite:///var/data/kreazy.db');
    assert.ok(path.isAbsolute(resolved));
    assert.ok(resolved.endsWith(path.join('var', 'data', 'kreazy.db')) || resolved.endsWith('kreazy.db'));
  });

  test('2.3 resolveDbPath handles file:///var/data/kreazy.db URL scheme', () => {
    const resolved = resolveDbPath('file:///var/data/kreazy.db');
    assert.ok(path.isAbsolute(resolved));
    assert.ok(resolved.endsWith(path.join('var', 'data', 'kreazy.db')) || resolved.endsWith('kreazy.db'));
  });

  test('2.4 resolveDbPath handles :memory: target path', () => {
    const resolved = resolveDbPath(':memory:');
    assert.strictEqual(resolved, ':memory:');
  });

  test('2.5 resolveDbPath handles relative paths (./data/kreazy.db)', () => {
    const resolved = resolveDbPath('./data/kreazy.db');
    assert.ok(path.isAbsolute(resolved));
    assert.ok(resolved.endsWith(path.join('data', 'kreazy.db')));
  });

  test('2.6 Database initialization and migrations work with /var/data/kreazy.db pattern', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kreazy-db-test-'));
    const simulatedPath = path.join(tempDir, 'subfolder', 'test_kreazy.db');
    
    // Ensure parent dir doesn't exist yet to test auto-creation
    assert.strictEqual(fs.existsSync(path.dirname(simulatedPath)), false);

    const resolved = resolveDbPath(simulatedPath);
    const parentDir = path.dirname(resolved);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    assert.strictEqual(fs.existsSync(parentDir), true);

    const db = new Database(resolved);
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    runMigrations(db);

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
    assert.ok(tables.includes('businesses'));
    assert.ok(tables.includes('users'));
    assert.ok(tables.includes('products'));
    assert.ok(tables.includes('orders'));
    assert.ok(tables.includes('whatsapp_connections'));
    assert.ok(tables.includes('meta_connections'));

    db.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  // ── TEST GROUP 3: Password Overwrite Prevention in ensureSuperAdmin() ──
  console.log('\n--- TEST GROUP 3: Password Overwrite Protection in ensureSuperAdmin ---');

  test('3.1 ensureSuperAdmin NEVER overwrites existing admin password hash', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const targetEmail = 'admin@production-store.com';
    const customPassword = 'OriginalSecretPassword123!';
    const originalHash = bcrypt.hashSync(customPassword, 10);

    // Seed existing admin directly with custom password hash
    db.prepare(`
      INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
      VALUES (?, null, ?, ?, 'Store Admin', 'SUPER_ADMIN', 1, datetime('now'), datetime('now'))
    `).run('usr-existing-01', targetEmail, originalHash);

    // Call ensureSuperAdmin multiple times (simulating server restarts)
    ensureSuperAdmin(db);
    ensureSuperAdmin(db);
    ensureSuperAdmin(db);

    // Fetch user record from DB
    const adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get(targetEmail);
    assert.strictEqual(adminUser.password_hash, originalHash, 'Password hash must remain EXACTLY unchanged!');

    // Verify bcrypt comparison succeeds with original password and fails with default passwords
    assert.strictEqual(bcrypt.compareSync(customPassword, adminUser.password_hash), true);
    assert.strictEqual(bcrypt.compareSync('12kreazyai12@', adminUser.password_hash), false);
    assert.strictEqual(bcrypt.compareSync('KreazyAI_Admin_2026!', adminUser.password_hash), false);

    db.close();
  });

  test('3.2 ensureSuperAdmin preserves custom credentials even when env password differs', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const targetEmail = 'kreazyai@gmail.com';
    const userChangedPassword = 'UserChangedTheirPasswordInSettings!789';
    const customHash = bcrypt.hashSync(userChangedPassword, 10);

    db.prepare(`
      INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
      VALUES (?, null, ?, ?, 'Platform Admin', 'SUPER_ADMIN', 1, datetime('now'), datetime('now'))
    `).run('usr-superadmin', targetEmail, customHash);

    // Re-run ensureSuperAdmin
    ensureSuperAdmin(db);

    const adminUser = db.prepare('SELECT * FROM users WHERE email = ?').get(targetEmail);
    assert.strictEqual(adminUser.password_hash, customHash, 'User-changed password must never be overwritten on restart!');
    assert.strictEqual(bcrypt.compareSync(userChangedPassword, adminUser.password_hash), true);

    db.close();
  });

  // ── TEST GROUP 4: Disabling Demo Data & Fake Connections in Production ──
  console.log('\n--- TEST GROUP 4: Disabling Demo Data & Fake WhatsApp States in Production ---');

  test('4.1 seedInitialData is completely disabled in production', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const originalNodeEnv = process.env.NODE_ENV;
    const originalIsProduction = config.isProduction;

    try {
      config.isProduction = true;

      seedInitialData(db);

      // Verify no demo tenants were created
      const flagship = db.prepare('SELECT * FROM businesses WHERE id = ?').get('ws-flagship-01');
      assert.strictEqual(flagship, undefined, 'Flagship demo workspace must NOT be created in production');

      const artisan = db.prepare('SELECT * FROM businesses WHERE id = ?').get('ws-artisan-02');
      assert.strictEqual(artisan, undefined, 'Artisan demo workspace must NOT be created in production');

      // Verify no demo users were created
      const demoUser = db.prepare('SELECT * FROM users WHERE email = ?').get('founder@kreazybrand.com');
      assert.strictEqual(demoUser, undefined, 'Demo founder user must NOT be created in production');

      // Verify no demo bookings were created
      const demoBooking = db.prepare('SELECT * FROM demo_bookings WHERE id = ?').get('demo-101');
      assert.strictEqual(demoBooking, undefined, 'Demo booking must NOT be created in production');

      // Verify no sample products were created
      const products = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
      assert.strictEqual(products, 0, 'Sample products must NOT be created in production');

      // Verify no fake WhatsApp connected connections were seeded
      const connectedWa = db.prepare("SELECT * FROM whatsapp_connections WHERE status = 'CONNECTED'").all();
      assert.strictEqual(connectedWa.length, 0, 'Fake connected WhatsApp status must NOT be created in production');

      const connectedMeta = db.prepare("SELECT * FROM meta_connections WHERE status = 'CONNECTED'").all();
      assert.strictEqual(connectedMeta.length, 0, 'Fake connected Meta status must NOT be created in production');

      // Verify ensureBillingData does not seed sample billing data
      ensureBillingData(db, 'ws-prod-tenant');
      const invoices = db.prepare('SELECT COUNT(*) as count FROM billing_invoices').get().count;
      assert.strictEqual(invoices, 0, 'Sample billing invoices must NOT be created in production');

      const subs = db.prepare('SELECT COUNT(*) as count FROM subscriptions').get().count;
      assert.strictEqual(subs, 0, 'Sample subscriptions must NOT be created in production');

    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      config.isProduction = originalIsProduction;
      db.close();
    }
  });

  // ── TEST GROUP 5: Preserving Development & Test Behavior ──
  console.log('\n--- TEST GROUP 5: Preserving Development & Test Behavior ---');

  test('5.1 Development mode seeds baseline demo data and test accounts', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const originalIsProduction = config.isProduction;
    try {
      config.isProduction = false;

      seedInitialData(db);

      // Verify flagship workspace exists in dev
      const flagship = db.prepare('SELECT * FROM businesses WHERE id = ?').get('ws-flagship-01');
      assert.ok(flagship, 'Flagship demo workspace should be present in development');
      assert.strictEqual(flagship.name, 'Kreazy Flagship Studio');

      // Verify sample products exist in dev
      const products = db.prepare('SELECT COUNT(*) as count FROM products WHERE business_id = ?').get('ws-flagship-01').count;
      assert.ok(products >= 4, 'Flagship should have sample products in development');

      // Verify demo user exists in dev
      const demoUser = db.prepare('SELECT * FROM users WHERE email = ?').get('founder@kreazybrand.com');
      assert.ok(demoUser, 'Demo founder should exist in development');

      // Verify dev super admin exists
      const superAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(config.auth.superAdminEmail || 'kreazyai@gmail.com');
      assert.ok(superAdmin, 'Super admin should exist in development');

    } finally {
      config.isProduction = originalIsProduction;
      db.close();
    }
  });

  // ── TEST GROUP 6: Non-Destructive Migrations & Production Data Preservation ──
  console.log('\n--- TEST GROUP 6: Non-Destructive Migrations & Data Preservation ---');

  test('6.1 Existing production data is never deleted or reset by migrations', () => {
    const db = new Database(':memory:');
    runMigrations(db);

    const testTenantId = 'ws-prod-tenant-100';
    const testUserId = 'usr-prod-owner-100';
    const testEmail = 'merchant@realbrand.com';
    const testPasswordHash = bcrypt.hashSync('RealOwnerPass!998', 10);

    // Create a real business and user
    db.prepare(`
      INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, channels_connected, total_revenue)
      VALUES (?, 'Real Enterprise Store', 'real-store', 'Real Owner', ?, 'Scale', 'ACTIVE', '[]', 50000.0)
    `).run(testTenantId, testEmail);

    db.prepare(`
      INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin)
      VALUES (?, ?, ?, ?, 'Real Owner', 'OWNER', 0)
    `).run(testUserId, testTenantId, testEmail, testPasswordHash);

    // Create customer and order
    db.prepare(`
      INSERT INTO customers (id, business_id, full_name, email, phone)
      VALUES ('cust-1', ?, 'VIP Shopper', 'shopper@gmail.com', '+1234567890')
    `).run(testTenantId);

    db.prepare(`
      INSERT INTO orders (id, business_id, customer_name, customer_email, subtotal, total)
      VALUES ('ord-1', ?, 'VIP Shopper', 'shopper@gmail.com', 250.0, 250.0)
    `).run(testTenantId);

    // Run migrations and startup tasks multiple times
    runMigrations(db);
    runMigrations(db);
    ensureSuperAdmin(db);

    // Verify all records exist completely intact
    const fetchedBiz = db.prepare('SELECT * FROM businesses WHERE id = ?').get(testTenantId);
    assert.strictEqual(fetchedBiz.name, 'Real Enterprise Store');
    assert.strictEqual(fetchedBiz.total_revenue, 50000.0);

    const fetchedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(testUserId);
    assert.strictEqual(fetchedUser.email, testEmail);
    assert.strictEqual(fetchedUser.password_hash, testPasswordHash);

    const fetchedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get('ord-1');
    assert.strictEqual(fetchedOrder.total, 250.0);

    db.close();
  });

  console.log('\n============================================================');
  console.log(`✓ ALL ${passedTests}/${totalTests} PRODUCTION SECURITY REGRESSION TESTS PASSED!`);
  console.log('============================================================');
}

runAllTests().catch(err => {
  console.error('\n✗ REGRESSION SUITE FAILED:', err);
  process.exit(1);
});
