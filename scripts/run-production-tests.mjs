import { runProductionTestSuite } from '../src/services/productionTestRunner.js';

console.log("============================================================");
console.log("STARTING KREAZYAI PRODUCTION VALIDATION & GENERATIONAL TEST");
console.log("============================================================\n");

async function main() {
  const start = Date.now();
  const report = await runProductionTestSuite();
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
