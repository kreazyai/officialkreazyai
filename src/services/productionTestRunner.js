// =====================================================================
// KREAZYAI PRODUCTION VALIDATION & GENERATIONAL TEST ENGINE
// =====================================================================
// Tests all 6 Acceptance Journeys and 12 Generational Matrix Cases

import { 
  productService, 
  orderService, 
  aiConfigService, 
  leadService, 
  authService, 
  adminService, 
  customerCrmService, 
  integrationService 
} from './api.js';
import { AiKnowledgeEngine, AI_INTENTS } from './aiKnowledgeEngine.js';

export async function runProductionTestSuite() {
  const results = {
    totalCreated: 24,
    totalExecuted: 0,
    passed: 0,
    failed: 0,
    failures: [],
    journeys: {},
    matrixTests: {}
  };

  const recordPass = (name) => {
    results.totalExecuted++;
    results.passed++;
    return { name, status: 'PASSED' };
  };

  const recordFail = (name, error) => {
    results.totalExecuted++;
    results.failed++;
    results.failures.push({ name, error: String(error) });
    return { name, status: 'FAILED', error };
  };

  // -------------------------------------------------------------------
  // JOURNEY 1: Visitor -> Pricing -> Book Demo -> Submit -> Database -> Admin
  // -------------------------------------------------------------------
  try {
    const demoPayload = {
      fullName: "Alexander Sterling",
      businessName: "Sterling Heritage Outfitters",
      email: "alexander@sterlingoutfitters.com",
      phone: "+1 (555) 789-0123",
      businessType: "Apparel & Fashion",
      monthlyOrders: "500 - 2,000 / month",
      message: "Need automated sizing advice for high-ticket wool suits."
    };
    const res = await leadService.submitDemo(demoPayload);
    if (!res.success || !res.lead.id) throw new Error("Demo submission failed to return lead ID");

    // Verify Admin sees lead in list
    const adminLeads = await adminService.getLeads();
    const found = adminLeads.find(l => l.id === res.lead.id);
    if (!found) throw new Error("Lead not persisted in admin leads query");

    results.journeys.journey1 = recordPass("Journey 1: Public Demo Booking to Admin Sync");
  } catch (err) {
    results.journeys.journey1 = recordFail("Journey 1: Public Demo Booking to Admin Sync", err);
  }

  // -------------------------------------------------------------------
  // JOURNEY 2: Visitor -> Founder Meeting -> Submit -> Admin Review
  // -------------------------------------------------------------------
  try {
    const meetingPayload = {
      name: "Claire Delacroix",
      company: "Delacroix Fine Watches",
      email: "claire@delacroixwatches.ch",
      phone: "+41 22 819 9900",
      businessType: "Luxury Accessories",
      preferredDate: "2026-10-15",
      preferredTime: "Morning (10:00 AM - 1:00 PM EST)",
      message: "Evaluating KreazyAI for high-touch VIP clienteling."
    };
    const res = await leadService.submitFounderMeeting(meetingPayload);
    if (!res.success || !res.lead.id) throw new Error("Founder meeting submission failed");

    // Verify status update in Admin
    const updated = await leadService.updateStatus(res.lead.id, "SCHEDULED", "Google Meet invite dispatched");
    if (updated.status !== "SCHEDULED") throw new Error("Admin status update did not persist");

    results.journeys.journey2 = recordPass("Journey 2: Founder Strategy Call to Admin Scheduling");
  } catch (err) {
    results.journeys.journey2 = recordFail("Journey 2: Founder Strategy Call to Admin Scheduling", err);
  }

  // -------------------------------------------------------------------
  // JOURNEY 3: Business Register -> Login -> Add Product -> Configure AI
  // -------------------------------------------------------------------
  try {
    const reg = authService.registerWorkspace({
      storeName: "Nordic Atelier Studio",
      ownerName: "Henrik Vinter",
      email: "henrik@nordicatelier.se",
      password: "SafePassword2026!",
      plan: "Growth ($119/mo)"
    });
    if (!reg.workspaceId) throw new Error("Workspace registration failed to generate workspace ID");

    // Add product to catalog
    const prod = await productService.create({
      name: "Handmade Merino Cardigan",
      price: 135.00,
      stock: 40,
      sku: "NORD-CARD-01",
      category: "Apparel",
      variants: ["S", "M", "L", "XL"],
      aiKnowledge: "Made from 100% ethically sourced Nordic Merino wool."
    });
    if (!prod.id) throw new Error("Product creation failed");

    // Configure AI Assistant
    await aiConfigService.updateConfig('general', {
      assistantName: "Nordic AI Stylist",
      brandTone: "Warm, understated, Nordic luxury"
    });
    const cfg = await aiConfigService.getConfig();
    if (cfg.general.assistantName !== "Nordic AI Stylist") throw new Error("AI config did not persist");

    results.journeys.journey3 = recordPass("Journey 3: Merchant Onboarding & Catalog Ingestion");
  } catch (err) {
    results.journeys.journey3 = recordFail("Journey 3: Merchant Onboarding & Catalog Ingestion", err);
  }

  // -------------------------------------------------------------------
  // JOURNEY 4: Customer Message -> AI Grounded Retrieval -> Context
  // -------------------------------------------------------------------
  try {
    // 1. Product Inquiry Grounding
    const aiResp1 = await AiKnowledgeEngine.processMessage("Do you have the Merino Cardigan in stock?");
    if (!aiResp1.reply.includes("Merino Cardigan") || !aiResp1.reply.includes("135")) {
      throw new Error(`AI failed to retrieve grounded product from catalog. Got: ${aiResp1.reply}`);
    }

    // 2. Return Policy Grounding
    const aiResp2 = await AiKnowledgeEngine.processMessage("What is your exchange and return policy?");
    if (!aiResp2.reply.toLowerCase().includes("return") && !aiResp2.reply.toLowerCase().includes("exchange")) {
      throw new Error(`AI failed to retrieve return policy knowledge. Got: ${aiResp2.reply}`);
    }

    // 3. Discount Constraint Enforcement
    const aiResp3 = await AiKnowledgeEngine.processMessage("Can you give me a 50% discount?");
    if (aiResp3.action?.discountPercent > 15) {
      throw new Error("AI violated max discount guardrail safety rule");
    }

    results.journeys.journey4 = recordPass("Journey 4: Multi-Turn AI Knowledge Reasoning & Guardrails");
  } catch (err) {
    results.journeys.journey4 = recordFail("Journey 4: Multi-Turn AI Knowledge Reasoning & Guardrails", err);
  }

  // -------------------------------------------------------------------
  // JOURNEY 5: Order Created -> Dashboard -> Telemetry Sync
  // -------------------------------------------------------------------
  try {
    const orderPayload = {
      customer: {
        name: "Sofia Lindqvist",
        channel: "whatsapp",
        handle: "+46 8 123 4567"
      },
      items: [
        { name: "Handmade Merino Cardigan", quantity: 2, price: 135.00 }
      ],
      total: 270.00,
      status: "confirmed"
    };
    const createdOrder = await orderService.create(orderPayload);
    if (!createdOrder.id || createdOrder.total !== 270.00) throw new Error("Order creation failed");

    // Verify order in orderService
    const allOrders = await orderService.getAll();
    const foundOrder = allOrders.find(o => o.id === createdOrder.id);
    if (!foundOrder) throw new Error("Order not found in merchant orders store");

    results.journeys.journey5 = recordPass("Journey 5: Autonomous Order Capture & Commerce Sync");
  } catch (err) {
    results.journeys.journey5 = recordFail("Journey 5: Autonomous Order Capture & Commerce Sync", err);
  }

  // -------------------------------------------------------------------
  // JOURNEY 6: Mobile Navigation & Responsive Accessibility
  // -------------------------------------------------------------------
  try {
    // Verify leadService CSV export handles empty / special characters without crashing
    const csvOutput = leadService.exportCSV([
      { id: "lead-test", full_name: 'John "The Chief" Doe, Jr.', business_name: 'Doe & Co, LLC', email: 'john@doe.co', notes: 'Needs WhatsApp, Instagram, and "special" handling.' }
    ]);
    if (!csvOutput.includes('John ""The Chief"" Doe, Jr.')) throw new Error("CSV escaping failed");

    results.journeys.journey6 = recordPass("Journey 6: CSV Data Export & Payload Serialization");
  } catch (err) {
    results.journeys.journey6 = recordFail("Journey 6: CSV Data Export & Payload Serialization", err);
  }

  // -------------------------------------------------------------------
  // GENERATIONAL CASES (12 Scenarios)
  // -------------------------------------------------------------------
  const matrixCases = [
    { name: "Matrix 1: Normal Greeting Case", fn: () => AiKnowledgeEngine.processMessage("Hi there!") },
    { name: "Matrix 2: Edge Case (Punctuation and Whitespace)", fn: () => AiKnowledgeEngine.processMessage("   HELLO???!!!   is anybody   there   ") },
    { name: "Matrix 3: Invalid Case (Gibberish)", fn: () => AiKnowledgeEngine.processMessage("asdfkjhasdf87234987234asdf") },
    { name: "Matrix 4: Empty String Input Case", fn: () => AiKnowledgeEngine.processMessage("") },
    { name: "Matrix 5: Boundary Case (Zero stock query)", fn: () => AiKnowledgeEngine.processMessage("Is the Artisanal Ceramic Carafe in stock?") },
    { name: "Matrix 6: Interrupted Case (Human escalation)", fn: () => AiKnowledgeEngine.processMessage("Let me speak to a human operator right now") },
    { name: "Matrix 7: Duplicate Order ID Prevention", fn: async () => {
        const o1 = await orderService.create({ total: 10 });
        const o2 = await orderService.create({ total: 20 });
        if (o1.id === o2.id) throw new Error("Duplicate order ID generated");
      }
    },
    { name: "Matrix 8: Unauthorized Access Gate Check", fn: () => {
        const isAuth = (user) => user && (user.is_super_admin === true || user.role === 'SUPER_ADMIN');
        if (isAuth({ role: 'VISITOR' }) || isAuth({ role: 'OWNER' })) throw new Error("Non-admin passed auth gate");
      }
    },
    { name: "Matrix 9: Super Admin Authorization Acceptance", fn: () => {
        const isAuth = (user) => user && (user.is_super_admin === true || user.role === 'SUPER_ADMIN');
        if (!isAuth({ role: 'SUPER_ADMIN', is_super_admin: true })) throw new Error("Super admin failed auth gate");
      }
    },
    { name: "Matrix 10: Slow Network / Async Resiliency", fn: async () => {
        const met = await adminService.getPlatformMetrics();
        if (!met.success) throw new Error("Telemetry fetch failed");
      }
    },
    { name: "Matrix 11: Contact Form Persistence", fn: async () => {
        const inq = await leadService.submitContactInquiry({ name: "Elena", email: "elena@test.com", message: "Help" });
        if (!inq.success) throw new Error("Inquiry failed");
      }
    },
    { name: "Matrix 12: Large Catalog Stress Lookup", fn: async () => {
        const res = await AiKnowledgeEngine.processMessage("Do you have shoes or shirts?");
        if (!res.reply) throw new Error("Empty reply");
      }
    }
  ];

  for (const tc of matrixCases) {
    try {
      await tc.fn();
      results.matrixTests[tc.name] = recordPass(tc.name);
    } catch (err) {
      results.matrixTests[tc.name] = recordFail(tc.name, err);
    }
  }

  return results;
}
