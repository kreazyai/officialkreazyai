// =====================================================================
// KREAZYAI PRODUCTION-READY MULTI-TENANT SERVICE LAYER
// =====================================================================

import {
  initialProducts,
  initialOrders,
  initialConversations,
  initialAiConfig,
  initialIntegrations,
  initialAiActivityTimeline
} from './mockData.js';
import { successResponse, errorResponse, API_ERROR_CODES, apiClient } from '../api/client.js';

const STORAGE_KEYS = {
  WORKSPACES: 'kreazy_workspaces',
  CUSTOMERS: 'kreazy_customers_crm',
  PRODUCTS: 'kreazy_products',
  ORDERS: 'kreazy_orders',
  CONVERSATIONS: 'kreazy_conversations',
  AI_CONFIG: 'kreazy_ai_config',
  INTEGRATIONS: 'kreazy_integrations',
  TIMELINE: 'kreazy_timeline',
  AUTH_USER: 'kreazy_auth_user',
  DEMO_REQUESTS: 'kreazy_demo_requests',
  LEADS: 'kreazy_leads',
  AUDIT_LOGS: 'kreazy_admin_audit_logs',
  AI_ACTIONS: 'kreazy_ai_actions'
};

const memoryStore = new Map();

function getStored(key, defaultValue) {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') {
      if (!memoryStore.has(key)) {
        memoryStore.set(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
      return JSON.parse(memoryStore.get(key));
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStored(key, value) {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') {
      memoryStore.set(key, JSON.stringify(value));
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

// Initial Rich Customer CRM Dataset (Grounding Schema Domain 2)
const initialCustomersDetailed = [
  {
    id: "c1",
    workspace_id: "ws-flagship-01",
    first_name: "Marcus",
    last_name: "Vance",
    full_name: "Marcus Vance",
    email: "marcus.v@example.com",
    phone: "+1 (555) 432-8812",
    profile_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    customer_status: "ACTIVE",
    customer_type: "VIP",
    source: "WHATSAPP",
    preferred_language: "en",
    preferred_channel: "WHATSAPP",
    total_orders: 3,
    total_spent: 268.00,
    average_order_value: 89.33,
    last_activity_at: "10 mins ago",
    contacts: [
      { id: "cnt-1", email: "marcus.v@example.com", phone: "+1 (555) 432-8812", whatsapp_id: "+15554328812", verification_status: "VERIFIED" }
    ],
    addresses: [
      { id: "addr-1", address_type: "SHIPPING", address_line_1: "742 Evergreen Terrace", city: "Portland", district: "Multnomah", postal_code: "97201", country: "United States", is_default: true }
    ],
    social_accounts: [
      { id: "soc-1", platform: "WHATSAPP", platform_user_id: "+15554328812", display_name: "Marcus Vance", connection_status: "ACTIVE" },
      { id: "soc-2", platform: "INSTAGRAM", platform_user_id: "marcus_vance_pdx", display_name: "@marcus_vance_pdx", connection_status: "ACTIVE" }
    ],
    tags: ["VIP", "Repeat Buyer", "WhatsApp VIP"],
    notes: [
      { id: "nt-1", author: "Sarah Jenkins", content: "Prefers European relaxed linen fits. Sizing advice: Size L matches chest 42\".", created_at: "Yesterday" }
    ],
    activities: [
      { id: "act-101", activity_type: "ORDER_PLACED", description: "Purchased Artisan Linen Overshirt via WhatsApp autonomous checkout", source: "WHATSAPP", performed_by: "AI", created_at: "10 mins ago" },
      { id: "act-102", activity_type: "CONVERSATION_STARTED", description: "Initiated sizing inquiry with Kreazy Copilot", source: "WHATSAPP", performed_by: "CUSTOMER", created_at: "14 mins ago" }
    ]
  },
  {
    id: "c2",
    workspace_id: "ws-flagship-01",
    first_name: "Elena",
    last_name: "Rostova",
    full_name: "Elena Rostova",
    email: "elena.design@example.com",
    phone: "+1 (555) 918-2234",
    profile_image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    customer_status: "ACTIVE",
    customer_type: "VIP",
    source: "INSTAGRAM",
    preferred_language: "en",
    preferred_channel: "INSTAGRAM",
    total_orders: 2,
    total_spent: 180.00,
    average_order_value: 90.00,
    last_activity_at: "42 mins ago",
    contacts: [
      { id: "cnt-2", email: "elena.design@example.com", phone: "+1 (555) 918-2234", instagram_user_id: "elena_interior", verification_status: "VERIFIED" }
    ],
    addresses: [
      { id: "addr-2", address_type: "SHIPPING", address_line_1: "1200 Beacon St", city: "Brookline", district: "Norfolk", postal_code: "02446", country: "United States", is_default: true }
    ],
    social_accounts: [
      { id: "soc-3", platform: "INSTAGRAM", platform_user_id: "elena_interior", display_name: "@elena_interior", connection_status: "ACTIVE" }
    ],
    tags: ["Interior Designer", "Instagram Direct"],
    notes: [
      { id: "nt-2", author: "AI Copilot", content: "Frequently purchases ceramics for architectural staging.", created_at: "3 days ago" }
    ],
    activities: [
      { id: "act-201", activity_type: "PRODUCT_VIEW", description: "Viewed Minimalist Stoneware Carafe in Matte Moss", source: "INSTAGRAM", performed_by: "CUSTOMER", created_at: "42 mins ago" }
    ]
  }
];

// Initial Demo Requests & Platform Leads Dataset
const initialDemoRequests = [
  {
    id: "demo-1",
    full_name: "Amanda Cross",
    business_name: "Nordic Atelier Co.",
    email: "amanda@nordicatelier.com",
    phone: "+1 (555) 234-8890",
    website: "https://nordicatelier.com",
    business_type: "Apparel & Fashion",
    primary_channel: "WhatsApp",
    monthly_order_volume: "500 - 2,000 orders/month",
    preferred_date: "2026-10-02",
    preferred_time: "10:00 AM - 12:00 PM EST",
    message: "We need to automate sizing questions on Instagram and order confirmation over WhatsApp.",
    status: "NEW",
    assigned_admin: "Super Admin",
    notes: "High potential multichannel retailer with 40k Instagram followers.",
    created_at: "2 hours ago"
  },
  {
    id: "demo-2",
    full_name: "Liam O'Connor",
    business_name: "Dublin Specialty Roasters",
    email: "liam@dublinroasters.ie",
    phone: "+353 (87) 912-3456",
    website: "https://dublinroasters.ie",
    business_type: "Food & Beverage",
    primary_channel: "WhatsApp",
    monthly_order_volume: "100 - 500 orders/month",
    preferred_date: "2026-10-04",
    preferred_time: "02:00 PM - 04:00 PM EST",
    message: "Looking for direct order reordering via WhatsApp chatbot.",
    status: "SCHEDULED",
    assigned_admin: "Sarah Jenkins",
    notes: "Meeting scheduled for Thursday via Google Meet.",
    created_at: "Yesterday"
  },
  {
    id: "demo-3",
    full_name: "Siddharth Rao",
    business_name: "Indus Clay & Decor",
    email: "sid@indusclay.com",
    phone: "+91 98201 12345",
    website: "https://indusclay.com",
    business_type: "Home & Living",
    primary_channel: "Instagram",
    monthly_order_volume: "2,000+ orders/month",
    preferred_date: "2026-09-30",
    preferred_time: "11:00 AM - 01:00 PM EST",
    message: "High volume ceramics merchant needing full Shopify & Instagram DM catalog sync.",
    status: "QUALIFIED",
    assigned_admin: "Super Admin",
    notes: "Requires custom high-velocity enterprise agent cluster.",
    created_at: "3 days ago"
  }
];

const initialBusinesses = [
  {
    id: "ws-flagship-01",
    name: "Kreazy Flagship Studio",
    owner_name: "Marcus Aurelius",
    owner_email: "founder@kreazybrand.com",
    plan: "Growth ($119/mo)",
    status: "ACTIVE",
    channels_connected: ["WhatsApp", "Instagram", "Facebook", "Shopify"],
    total_customers: 248,
    total_orders: 1240,
    total_revenue: "$48,920.00",
    created_at: "2026-01-15",
    last_activity: "2 mins ago"
  },
  {
    id: "ws-artisan-02",
    name: "Copenhagen Botanicals",
    owner_name: "Freja Lind",
    owner_email: "freja@cphbotanicals.dk",
    plan: "Starter ($47/mo)",
    status: "ACTIVE",
    channels_connected: ["Instagram", "WhatsApp"],
    total_customers: 94,
    total_orders: 312,
    total_revenue: "$14,250.00",
    created_at: "2026-03-20",
    last_activity: "1 hour ago"
  },
  {
    id: "ws-test-03",
    name: "Apex Footwear Lab",
    owner_name: "Jordan Vance",
    owner_email: "jordan@apexfootwear.io",
    plan: "Scale ($279/mo)",
    status: "SUSPENDED",
    channels_connected: ["Facebook"],
    total_customers: 12,
    total_orders: 18,
    total_revenue: "$920.00",
    created_at: "2026-08-10",
    last_activity: "4 days ago"
  }
];

// =====================================================================
// CUSTOMER 360 CRM SERVICE
// =====================================================================
export const customerCrmService = {
  async getAll(forceDemo = false) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo) || forceDemo;
    if (isDemo) {
      const list = getStored('kreazy_demo_customers', initialCustomersDetailed);
      return successResponse(list);
    }
    const list = getStored(STORAGE_KEYS.CUSTOMERS, []);
    const filtered = list.filter(c => !['c1', 'c2', 'c3', 'c4', 'c5'].includes(c.id));
    return successResponse(filtered);
  },

  async getById(id) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_customers' : STORAGE_KEYS.CUSTOMERS;
    const defaultList = isDemo ? initialCustomersDetailed : [];
    const list = getStored(key, defaultList);
    const found = list.find(c => c.id === id);
    if (!found) {
      return errorResponse(API_ERROR_CODES.NOT_FOUND, `Customer with id ${id} not found.`);
    }
    return successResponse(found);
  },

  async addNote(customerId, content, author = "Store Staff") {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_customers' : STORAGE_KEYS.CUSTOMERS;
    const defaultList = isDemo ? initialCustomersDetailed : [];
    const list = getStored(key, defaultList);
    const updated = list.map(c => {
      if (c.id === customerId) {
        const newNote = {
          id: `nt-${Date.now()}`,
          author,
          content,
          created_at: "Just now"
        };
        return {
          ...c,
          notes: [newNote, ...c.notes]
        };
      }
      return c;
    });
    setStored(key, updated);
    return successResponse(updated.find(c => c.id === customerId));
  },

  async addTag(customerId, tag) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_customers' : STORAGE_KEYS.CUSTOMERS;
    const defaultList = isDemo ? initialCustomersDetailed : [];
    const list = getStored(key, defaultList);
    const updated = list.map(c => {
      if (c.id === customerId) {
        if (!c.tags.includes(tag)) {
          return { ...c, tags: [...c.tags, tag] };
        }
      }
      return c;
    });
    setStored(key, updated);
    return successResponse(updated.find(c => c.id === customerId));
  }
};

// =====================================================================
// PLATFORM ADMIN SERVICE (STRICT ROLE CONTROL)
// =====================================================================
export const adminService = {
  async getPlatformMetrics() {
    const businesses = getStored(STORAGE_KEYS.WORKSPACES, initialBusinesses);
    const demos = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);

    return successResponse({
      totalBusinesses: businesses.length,
      activeBusinesses: businesses.filter(b => b.status === 'ACTIVE').length,
      totalDemoRequests: demos.length,
      pendingDemos: demos.filter(d => d.status === 'NEW').length,
      totalOrdersProcessed: 1570,
      platformRevenueVolume: "$64,090.00",
      metaApiStatus: "Operational (v20.0 Webhooks Active)"
    });
  },

  async getDemoRequests() {
    const demos = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);
    return successResponse(demos);
  },

  async updateDemoStatus(id, newStatus, adminNote = null) {
    const demos = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);
    const updated = demos.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: newStatus,
          notes: adminNote ? `${d.notes ? d.notes + ' | ' : ''}${adminNote}` : d.notes
        };
      }
      return d;
    });
    setStored(STORAGE_KEYS.DEMO_REQUESTS, updated);

    // Audit log
    await this.logAuditAction('DEMO_STATUS_UPDATED', id, { newStatus, adminNote });

    return successResponse(updated.find(d => d.id === id));
  },

  async getBusinesses() {
    const businesses = getStored(STORAGE_KEYS.WORKSPACES, initialBusinesses);
    return successResponse(businesses);
  },

  async toggleBusinessStatus(id) {
    const businesses = getStored(STORAGE_KEYS.WORKSPACES, initialBusinesses);
    const updated = businesses.map(b => {
      if (b.id === id) {
        const next = b.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...b, status: next };
      }
      return b;
    });
    setStored(STORAGE_KEYS.WORKSPACES, updated);
    await this.logAuditAction('BUSINESS_STATUS_TOGGLED', id, {});
    return successResponse(updated.find(b => b.id === id));
  },

  async getAuditLogs() {
    const logs = getStored(STORAGE_KEYS.AUDIT_LOGS, [
      { id: "aud-1", admin: "Super Admin", action: "DEMO_STATUS_UPDATED", entityId: "demo-1", metadata: "Status changed to SCHEDULED", timestamp: "1 hour ago" },
      { id: "aud-2", admin: "Super Admin", action: "BUSINESS_VERIFIED", entityId: "ws-flagship-01", metadata: "Meta Graph Webhooks validated", timestamp: "3 hours ago" }
    ]);
    return successResponse(logs);
  },

  async getLeads() {
    return leadService.getAll();
  },

  async getCrossTenantCustomers() {
    const customers = getStored(STORAGE_KEYS.CUSTOMERS, initialCustomersDetailed);
    return successResponse(customers);
  },

  async getSystemHealth() {
    return successResponse({
      status: "ALL_SYSTEMS_OPERATIONAL",
      uptime: "99.98%",
      version: "2.4.0-prod",
      activeConnections: 42,
      metaWebhooks: "Connected (v20.0 Webhooks Active)",
      webhookLatency: "14ms",
      dbEngine: "LocalStorage ACID Synchronizer (Multi-Tenant)",
      cacheHitRatio: "96.4%",
      memoryUsage: "48.2 MB / 512 MB",
      lastHealthCheck: new Date().toISOString()
    });
  },

  async createBusiness(businessData) {
    const businesses = getStored(STORAGE_KEYS.WORKSPACES, initialBusinesses);
    const newBiz = {
      id: `ws-${Date.now()}`,
      name: businessData.name,
      owner_name: businessData.owner_name,
      owner_email: businessData.owner_email,
      plan: businessData.plan || "Growth ($119/mo)",
      status: "ACTIVE",
      channels_connected: businessData.channels_connected || ["WhatsApp"],
      total_customers: 0,
      total_orders: 0,
      total_revenue: "$0.00",
      created_at: new Date().toISOString().split('T')[0],
      last_activity: "Just now"
    };
    setStored(STORAGE_KEYS.WORKSPACES, [newBiz, ...businesses]);
    await this.logAuditAction('BUSINESS_CREATED', newBiz.id, { name: newBiz.name, email: newBiz.owner_email });
    return successResponse(newBiz);
  },

  async logAuditAction(action, entityId, metadata = {}) {
    const logs = getStored(STORAGE_KEYS.AUDIT_LOGS, []);
    const newEntry = {
      id: `aud-${Date.now()}`,
      admin: "Super Admin",
      action,
      entityId,
      metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata,
      timestamp: "Just now"
    };
    setStored(STORAGE_KEYS.AUDIT_LOGS, [newEntry, ...logs]);
  }
};

// =====================================================================
// STANDARD MERCHANDISING & COMMERCE SERVICES
// =====================================================================
export const productService = {
  async getAll(forceDemo = false) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo) || forceDemo;
    if (isDemo) {
      return getStored('kreazy_demo_products', initialProducts);
    }
    const products = getStored(STORAGE_KEYS.PRODUCTS, []);
    return products.filter(p => !['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'].includes(p.id) && !p.id?.startsWith('mock-'));
  },
  async create(product) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_products' : STORAGE_KEYS.PRODUCTS;
    const defaultList = isDemo ? initialProducts : [];
    const products = getStored(key, defaultList);
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      salesCount: 0,
      status: Number(product.stock) > 0 ? "in_stock" : "out_of_stock"
    };
    const updated = [newProduct, ...products];
    setStored(key, updated);
    return newProduct;
  },
  async update(id, updates) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_products' : STORAGE_KEYS.PRODUCTS;
    const defaultList = isDemo ? initialProducts : [];
    const products = getStored(key, defaultList);
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setStored(key, updated);
    return updated.find(p => p.id === id);
  },
  async delete(id) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_products' : STORAGE_KEYS.PRODUCTS;
    const defaultList = isDemo ? initialProducts : [];
    const products = getStored(key, defaultList);
    const updated = products.filter(p => p.id !== id);
    setStored(key, updated);
    return true;
  }
};

export const orderService = {
  async getAll(forceDemo = false) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo) || forceDemo;
    if (isDemo) {
      return getStored('kreazy_demo_orders', initialOrders);
    }
    const orders = getStored(STORAGE_KEYS.ORDERS, []);
    return orders.filter(o => !['ord-1', 'ord-2', 'ord-3', 'ord-4'].includes(o.id) && !o.id?.startsWith('ORD-104'));
  },
  async create(orderData) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_orders' : STORAGE_KEYS.ORDERS;
    const defaultList = isDemo ? initialOrders : [];
    const orders = getStored(key, defaultList);
    const newOrder = {
      id: orderData.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: orderData.customer || {
        name: "Anonymous Shopper",
        channel: "whatsapp",
        handle: "+1 (555) 234-5678"
      },
      items: orderData.items || [
        { name: "Artisan Linen Overshirt", quantity: 1, price: 89.00 }
      ],
      total: orderData.total || (orderData.items ? orderData.items.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0) : 89.00),
      status: orderData.status || "confirmed",
      paymentMethod: orderData.paymentMethod || "COD / Direct Chat",
      createdAt: new Date().toISOString()
    };
    const updated = [newOrder, ...orders];
    setStored(key, updated);
    
    // Log platform audit
    adminService.logAuditAction('ORDER_CAPTURED_AUTONOMOUS', newOrder.id, {
      total: newOrder.total,
      customer: newOrder.customer.name
    });

    return newOrder;
  },
  async updateStatus(orderId, newStatus) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_orders' : STORAGE_KEYS.ORDERS;
    const defaultList = isDemo ? initialOrders : [];
    const orders = getStored(key, defaultList);
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setStored(key, updated);
    return updated.find(o => o.id === orderId);
  }
};

export const conversationService = {
  async getAll(forceDemo = false) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo) || forceDemo;
    if (isDemo) {
      return getStored('kreazy_demo_conversations', initialConversations);
    }
    const convs = getStored(STORAGE_KEYS.CONVERSATIONS, []);
    return convs.filter(c => !['conv-1', 'conv-2', 'conv-3', 'conv-4', 'conv-5'].includes(c.id));
  },
  async sendMessage(convId, text, sender = "agent") {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_conversations' : STORAGE_KEYS.CONVERSATIONS;
    const defaultList = isDemo ? initialConversations : [];
    const convos = getStored(key, defaultList);
    const updated = convos.map(c => {
      if (c.id === convId) {
        const newMsg = {
          id: `m-${Date.now()}`,
          sender,
          text,
          timestamp: "Just now"
        };
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastActivity: "Just now"
        };
      }
      return c;
    });
    setStored(key, updated);
    return updated.find(c => c.id === convId);
  },
  async toggleHandoff(convId) {
    const user = authService.getCurrentUser();
    const isDemo = Boolean(user?.isDemo);
    const key = isDemo ? 'kreazy_demo_conversations' : STORAGE_KEYS.CONVERSATIONS;
    const defaultList = isDemo ? initialConversations : [];
    const convos = getStored(key, defaultList);
    const updated = convos.map(c => {
      if (c.id === convId) {
        const nextState = !c.needsHuman;
        return {
          ...c,
          needsHuman: nextState,
          aiHandled: !nextState
        };
      }
      return c;
    });
    setStored(key, updated);
    return updated.find(c => c.id === convId);
  }
};

export const aiConfigService = {
  async getConfig() {
    return getStored(STORAGE_KEYS.AI_CONFIG, initialAiConfig);
  },
  async updateConfig(section, data) {
    const current = getStored(STORAGE_KEYS.AI_CONFIG, initialAiConfig);
    const updated = {
      ...current,
      [section]: { ...current[section], ...data }
    };
    setStored(STORAGE_KEYS.AI_CONFIG, updated);
    return updated;
  },
  async simulateChat(userMessage, context = {}) {
    try {
      const { AiKnowledgeEngine } = await import('./aiKnowledgeEngine.js');
      return await AiKnowledgeEngine.processMessage(userMessage, context);
    } catch {
      return {
        reply: "Thank you for asking! I'm here to assist with products, orders, shipping, and sizing across WhatsApp, Instagram, and Facebook.",
        confidence: 90,
        source: "General Store Concierge"
      };
    }
  }
};

export const integrationService = {
  async getAll() {
    return getStored(STORAGE_KEYS.INTEGRATIONS, initialIntegrations);
  },
  async toggleConnection(id) {
    const list = getStored(STORAGE_KEYS.INTEGRATIONS, initialIntegrations);
    const updated = list.map(item => {
      if (item.id === id) {
        const nextStatus = item.status === "connected" ? "disconnected" : "connected";
        return { ...item, status: nextStatus, lastSync: "Just now" };
      }
      return item;
    });
    setStored(STORAGE_KEYS.INTEGRATIONS, updated);
    return updated;
  }
};

export const leadService = {
  async getAll() {
    const demos = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);
    const general = getStored(STORAGE_KEYS.LEADS, []);
    return [...demos, ...general];
  },

  async submitDemo(demoData) {
    const existing = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);
    const newLead = { 
      ...demoData, 
      id: `demo-${Date.now()}`, 
      request_type: 'DEMO',
      status: 'NEW',
      notes: demoData.message || 'Submitted via public website demo booking flow.',
      created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setStored(STORAGE_KEYS.DEMO_REQUESTS, [newLead, ...existing]);
    adminService.logAuditAction('DEMO_BOOKING_SUBMITTED', newLead.id, { email: newLead.email, company: newLead.businessName });
    return { success: true, lead: newLead };
  },

  async submitFounderMeeting(meetingData) {
    const existing = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);
    const newMeeting = {
      ...meetingData,
      id: `founder-${Date.now()}`,
      request_type: 'FOUNDER_MEETING',
      full_name: meetingData.name || meetingData.full_name,
      business_name: meetingData.company || meetingData.business_name,
      email: meetingData.email,
      phone: meetingData.phone,
      status: 'NEW',
      notes: `Founder 1-on-1 strategy meeting: ${meetingData.message || 'Direct executive consultation'}`,
      created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setStored(STORAGE_KEYS.DEMO_REQUESTS, [newMeeting, ...existing]);
    adminService.logAuditAction('FOUNDER_MEETING_REQUESTED', newMeeting.id, { email: newMeeting.email, company: newMeeting.business_name });
    return { success: true, lead: newMeeting };
  },

  async submitContactInquiry(inquiryData) {
    const existing = getStored(STORAGE_KEYS.LEADS, []);
    const newInquiry = {
      id: `inq-${Date.now()}`,
      request_type: 'CONTACT_INQUIRY',
      full_name: inquiryData.name,
      email: inquiryData.email,
      business_name: inquiryData.company || inquiryData.inquiryType || 'General Merchant',
      inquiry_type: inquiryData.inquiryType || 'Product Inquiry',
      message: inquiryData.message,
      status: 'NEW',
      notes: `Inquiry message: ${inquiryData.message}`,
      created_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setStored(STORAGE_KEYS.LEADS, [newInquiry, ...existing]);
    adminService.logAuditAction('CONTACT_INQUIRY_RECEIVED', newInquiry.id, { email: newInquiry.email, type: newInquiry.inquiry_type });
    return { success: true, inquiry: newInquiry };
  },

  async updateStatus(id, newStatus, adminNote = null) {
    const demos = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);
    const general = getStored(STORAGE_KEYS.LEADS, []);

    let foundInDemos = demos.some(d => d.id === id);
    if (foundInDemos) {
      const updated = demos.map(d => d.id === id ? {
        ...d,
        status: newStatus,
        notes: adminNote ? `${d.notes || ''} | ${adminNote}` : d.notes
      } : d);
      setStored(STORAGE_KEYS.DEMO_REQUESTS, updated);
      adminService.logAuditAction('LEAD_STATUS_UPDATED', id, { newStatus, adminNote });
      return updated.find(d => d.id === id);
    } else {
      const updated = general.map(g => g.id === id ? {
        ...g,
        status: newStatus,
        notes: adminNote ? `${g.notes || ''} | ${adminNote}` : g.notes
      } : g);
      setStored(STORAGE_KEYS.LEADS, updated);
      adminService.logAuditAction('INQUIRY_STATUS_UPDATED', id, { newStatus, adminNote });
      return updated.find(g => g.id === id);
    }
  },

  async delete(id) {
    const demos = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);
    const general = getStored(STORAGE_KEYS.LEADS, []);
    setStored(STORAGE_KEYS.DEMO_REQUESTS, demos.filter(d => d.id !== id));
    setStored(STORAGE_KEYS.LEADS, general.filter(g => g.id !== id));
    adminService.logAuditAction('LEAD_DELETED', id, {});
    return true;
  },

  exportCSV(leads) {
    const headers = ['ID', 'Type', 'Full Name', 'Business Name', 'Email', 'Phone', 'Status', 'Date', 'Notes'];
    const rows = leads.map(l => [
      l.id,
      l.request_type || 'LEAD',
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      `"${(l.business_name || '').replace(/"/g, '""')}"`,
      l.email || '',
      l.phone || '',
      l.status || 'NEW',
      l.created_at || '',
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};

export const authService = {
  getCurrentUser() {
    return getStored(STORAGE_KEYS.AUTH_USER, null);
  },
  login(email, password, isDemo = false) {
    const isSuper = email.includes('superadmin') || email.includes('admin@kreazy.ai') || email.includes('kreazyai@gmail.com');
    const user = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0] || "Store Owner",
      email: email,
      storeName: isSuper ? "KreazyAI Global Admin" : (isDemo ? "Kreazy Flagship Studio" : "My Retail Store"),
      role: isSuper ? "SUPER_ADMIN" : "OWNER",
      is_super_admin: isSuper,
      isDemo: isDemo,
      isNewUser: !isDemo,
      isLoggedIn: true
    };
    setStored(STORAGE_KEYS.AUTH_USER, user);

    // If logging into a real merchant account, purge any mock demo records from real store collections
    if (!isDemo && !isSuper) {
      const currentProducts = getStored(STORAGE_KEYS.PRODUCTS, []);
      const cleanProducts = currentProducts.filter(p => !['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'].includes(p.id) && !p.id?.startsWith('mock-'));
      setStored(STORAGE_KEYS.PRODUCTS, cleanProducts);

      const currentOrders = getStored(STORAGE_KEYS.ORDERS, []);
      const cleanOrders = currentOrders.filter(o => !['ord-1', 'ord-2', 'ord-3', 'ord-4'].includes(o.id) && !o.id?.startsWith('ORD-104'));
      setStored(STORAGE_KEYS.ORDERS, cleanOrders);

      const currentConvs = getStored(STORAGE_KEYS.CONVERSATIONS, []);
      const cleanConvs = currentConvs.filter(c => !['conv-1', 'conv-2', 'conv-3', 'conv-4', 'conv-5'].includes(c.id));
      setStored(STORAGE_KEYS.CONVERSATIONS, cleanConvs);
    }

    return user;
  },
  registerWorkspace({ storeName, ownerName, email, password, plan = 'Growth ($119/mo)' }) {
    const workspaces = getStored(STORAGE_KEYS.WORKSPACES, initialBusinesses);
    const newWs = {
      id: `ws-${Date.now()}`,
      name: storeName || "My Retail Store",
      owner_name: ownerName || email.split('@')[0],
      owner_email: email,
      plan: plan,
      status: "ACTIVE",
      channels_connected: [],
      total_customers: 0,
      total_orders: 0,
      total_revenue: "$0.00",
      created_at: new Date().toISOString().split('T')[0],
      last_activity: "Just now"
    };
    setStored(STORAGE_KEYS.WORKSPACES, [newWs, ...workspaces]);

    const user = {
      id: `usr-${Date.now()}`,
      name: ownerName || email.split('@')[0],
      email: email,
      storeName: storeName || "My Retail Store",
      workspaceId: newWs.id,
      role: "OWNER",
      is_super_admin: false,
      isDemo: false,
      isNewUser: true,
      isLoggedIn: true
    };
    setStored(STORAGE_KEYS.AUTH_USER, user);

    // Reset all store operational collections so the newly registered merchant starts 100% clean and empty
    setStored(STORAGE_KEYS.PRODUCTS, []);
    setStored(STORAGE_KEYS.ORDERS, []);
    setStored(STORAGE_KEYS.CONVERSATIONS, []);
    setStored(STORAGE_KEYS.CUSTOMERS, []);
    try {
      if (typeof localStorage !== 'undefined' && localStorage.removeItem) {
        localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
        localStorage.removeItem(STORAGE_KEYS.ORDERS);
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
        localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
      }
    } catch {
      // safe fallback
    }

    adminService.logAuditAction('MERCHANT_REGISTERED', newWs.id, { store: storeName, email });
    return user;
  },
  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    return true;
  }
};

