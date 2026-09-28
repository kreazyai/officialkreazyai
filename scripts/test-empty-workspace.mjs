import { authService, productService, orderService, conversationService, customerCrmService } from '../src/services/api.js';

async function testEmptyMerchantWorkspace() {
  console.log("=== VERIFYING EMPTY PRODUCTS & CLEAN DASHBOARD ON SIGNUP ===");

  // 1. Simulate new merchant signup
  console.log("\n1. Registering new merchant account...");
  const newUser = authService.registerWorkspace({
    storeName: "Elena Couture Studio",
    ownerName: "Elena Rostova",
    email: "elena@elenacouture.com",
    password: "SecurePassword123!",
    plan: "Growth ($119/mo)"
  });

  if (newUser.isDemo) {
    throw new Error("FAIL: Newly registered merchant should NOT have isDemo set to true");
  }
  console.log("✓ Merchant registered with isDemo = false");

  // 2. Check product catalog
  const products = await productService.getAll();
  console.log(`✓ Products count for new merchant: ${products.length}`);
  if (products.length !== 0) {
    throw new Error(`FAIL: Expected 0 products for new merchant, but found ${products.length}: ${JSON.stringify(products)}`);
  }

  // 3. Check orders
  const orders = await orderService.getAll();
  console.log(`✓ Orders count for new merchant: ${orders.length}`);
  if (orders.length !== 0) {
    throw new Error(`FAIL: Expected 0 orders for new merchant, but found ${orders.length}`);
  }

  // 4. Check conversations
  const convos = await conversationService.getAll();
  console.log(`✓ Conversations count for new merchant: ${convos.length}`);
  if (convos.length !== 0) {
    throw new Error(`FAIL: Expected 0 conversations for new merchant, but found ${convos.length}`);
  }

  // 5. Check customers
  const customers = await customerCrmService.getAll();
  console.log(`✓ Customers count for new merchant: ${customers.data.length}`);
  if (customers.data.length !== 0) {
    throw new Error(`FAIL: Expected 0 customers for new merchant, but found ${customers.data.length}`);
  }

  // 6. Test merchant adding their first product
  console.log("\n2. Adding merchant's first real product...");
  const newProd = await productService.create({
    name: "Silk Evening Gown",
    price: 320.00,
    stock: 12,
    sku: "ELENA-GOWN-01",
    category: "Apparel",
    variants: ["36", "38", "40"]
  });

  const updatedProducts = await productService.getAll();
  console.log(`✓ Products count after adding 1 item: ${updatedProducts.length}`);
  if (updatedProducts.length !== 1 || updatedProducts[0].name !== "Silk Evening Gown") {
    throw new Error(`FAIL: Expected 1 custom product, got: ${JSON.stringify(updatedProducts)}`);
  }

  // 7. Test Demo user login retains demo data
  console.log("\n3. Testing Demo login isolation...");
  authService.login('founder@kreazybrand.com', 'demo', true);
  const demoProducts = await productService.getAll();
  console.log(`✓ Demo products count: ${demoProducts.length}`);
  if (demoProducts.length < 5) {
    throw new Error(`FAIL: Demo user should have access to demo catalog`);
  }

  // 8. Re-login as real merchant
  console.log("\n4. Switching back to real merchant...");
  authService.login('elena@elenacouture.com', 'SecurePassword123!', false);
  const realProducts = await productService.getAll();
  console.log(`✓ Products count for real merchant after switching: ${realProducts.length}`);
  if (realProducts.some(p => ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'].includes(p.id))) {
    throw new Error("FAIL: Demo items leaked into real merchant product catalog!");
  }

  console.log("\n🎉 ALL TESTS PASSED: Brand new merchant workspace is 100% clean and empty!");
}

testEmptyMerchantWorkspace().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
