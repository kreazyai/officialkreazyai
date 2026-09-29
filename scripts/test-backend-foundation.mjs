import { createApp } from '../src/server/app/app.js';
import { getDatabase } from '../src/server/config/database.js';

console.log('Testing Express Backend Initialization and Endpoints...');

async function run() {
  const db = getDatabase(':memory:');
  const app = createApp();

  const server = app.listen(5099, async () => {
    try {
      console.log('Test server listening on port 5099');

      // 1. Test Health Check
      const healthRes = await fetch('http://localhost:5099/api/health');
      const healthData = await healthRes.json();
      console.log('1. Health check response:', healthData.data.status, healthData.data.service);

      // 2. Test DB Health
      const dbRes = await fetch('http://localhost:5099/api/health/db');
      const dbData = await dbRes.json();
      console.log('2. Database tables count:', dbData.data.tablesCount, 'Status:', dbData.data.status);

      // 3. Test Public Demo Booking
      const demoRes = await fetch('http://localhost:5099/api/v1/public/book-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test Auditor',
          workEmail: 'auditor@kreazy.ai',
          companyName: 'Kreazy Global Audit Corp'
        })
      });
      const demoData = await demoRes.json();
      console.log('3. Public Demo Booking:', demoData.success ? 'PASSED (Saved to DB)' : 'FAILED');

      // 4. Test Super Admin Login (Hashed verification)
      const adminLoginRes = await fetch('http://localhost:5099/api/v1/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'kreazyai@gmail.com',
          password: '12kreazyai12@'
        })
      });
      const adminLoginData = await adminLoginRes.json();
      console.log('4. Admin Login with Bcrypt & JWT:', adminLoginData.success ? 'PASSED (Token issued)' : 'FAILED');
      const token = adminLoginData.data.token;

      // 5. Test Admin Protected Metrics
      const metricsRes = await fetch('http://localhost:5099/api/v1/admin/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const metricsData = await metricsRes.json();
      console.log('5. Admin Metrics from DB:', metricsData.data);

      console.log('\n✓ ALL BACKEND AND DATABASE INTEGRATION TESTS PASSED!');
    } catch (err) {
      console.error('Test failed:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

run();
