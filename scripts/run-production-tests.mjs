import http from 'http';
import { createApp } from '../src/server/app/app.js';
import { getDatabase, closeDatabase } from '../src/server/config/database.js';
import { apiClient } from '../src/api/client.js';
import { runProductionTestSuite } from '../src/services/productionTestRunner.js';

console.log("============================================================");
console.log("STARTING KREAZYAI PRODUCTION VALIDATION & GENERATIONAL TEST");
console.log("============================================================\n");

const TEST_PORT = 5096;

async function main() {
  process.env.DATABASE_URL = ':memory:';
  process.env.PORT = String(TEST_PORT);
  process.env.JWT_SECRET = 'test_secret_key_kreazy_2026_acceptance_suite';
  process.env.META_WEBHOOK_VERIFY_TOKEN = 'kreazy_meta_verify_secret_2026';

  getDatabase(':memory:');
  const app = createApp();
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  apiClient.setBaseUrl(`http://127.0.0.1:${TEST_PORT}/api/v1`);

  let report;
  const start = Date.now();
  try {
    report = await runProductionTestSuite();
  } finally {
    await new Promise((resolve) => server.close(resolve));
    closeDatabase();
  }
  const elapsed = Date.now() - start;

  console.log(`Executed ${report.totalExecuted} tests in ${elapsed}ms.`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}\n`);

  console.log("--- PRODUCTION ACCEPTANCE JOURNEYS ---");
  for (const [k, v] of Object.entries(report.journeys)) {
    console.log(`[${v.status}] ${v.name}`);
    if (v.error) console.error(`   Error: ${v.error}`);
  }

  console.log("\n--- GENERATIONAL MATRIX CASES ---");
  for (const [k, v] of Object.entries(report.matrixTests)) {
    console.log(`[${v.status}] ${v.name}`);
    if (v.error) console.error(`   Error: ${v.error}`);
  }

  console.log("\n============================================================");
  if (report.failed === 0) {
    console.log("✓ ALL KREAZYAI PRODUCTION TESTS PASSED WITH ZERO DEFECTS");
    process.exit(0);
  } else {
    console.error(`✗ ${report.failed} TESTS FAILED`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
