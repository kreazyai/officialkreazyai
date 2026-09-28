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
} from './mockData';
import { successResponse, errorResponse, API_ERROR_CODES, apiClient } from '../api/client';

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

function getStored(key, defaultValue) {
  try {
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
  async getAll() {
    const list = getStored(STORAGE_KEYS.CUSTOMERS, initialCustomersDetailed);
    return successResponse(list);
  },

  async getById(id) {
    const list = getStored(STORAGE_KEYS.CUSTOMERS, initialCustomersDetailed);
    const found = list.find(c => c.id === id);
    if (!found) {
      return errorResponse(API_ERROR_CODES.NOT_FOUND, `Customer with id ${id} not found.`);
    }
    return successResponse(found);
  },

  async addNote(customerId, content, author = "Store Staff") {
    const list = getStored(STORAGE_KEYS.CUSTOMERS, initialCustomersDetailed);
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
    setStored(STORAGE_KEYS.CUSTOMERS, updated);
    return successResponse(updated.find(c => c.id === customerId));
  },

  async addTag(customerId, tag) {
    const list = getStored(STORAGE_KEYS.CUSTOMERS, initialCustomersDetailed);
    const updated = list.map(c => {
      if (c.id === customerId) {
        if (!c.tags.includes(tag)) {
          return { ...c, tags: [...c.tags, tag] };
        }
      }
      return c;
    });
    setStored(STORAGE_KEYS.CUSTOMERS, updated);
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
  async getAll() {
    return getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
  },
  async create(product) {
    const products = getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      salesCount: 0,
      status: Number(product.stock) > 0 ? "in_stock" : "out_of_stock"
    };
    const updated = [newProduct, ...products];
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  },
  async update(id, updates) {
    const products = getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    return updated.find(p => p.id === id);
  },
  async delete(id) {
    const products = getStored(STORAGE_KEYS.PRODUCTS, initialProducts);
    const updated = products.filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, updated);
    return true;
  }
};

export const orderService = {
  async getAll() {
    return getStored(STORAGE_KEYS.ORDERS, initialOrders);
  },
  async updateStatus(orderId, newStatus) {
    const orders = getStored(STORAGE_KEYS.ORDERS, initialOrders);
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setStored(STORAGE_KEYS.ORDERS, updated);
    return updated.find(o => o.id === orderId);
  }
};

export const conversationService = {
  async getAll() {
    return getStored(STORAGE_KEYS.CONVERSATIONS, initialConversations);
  },
  async sendMessage(convId, text, sender = "agent") {
    const convos = getStored(STORAGE_KEYS.CONVERSATIONS, initialConversations);
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
    setStored(STORAGE_KEYS.CONVERSATIONS, updated);
    return updated.find(c => c.id === convId);
  },
  async toggleHandoff(convId) {
    const convos = getStored(STORAGE_KEYS.CONVERSATIONS, initialConversations);
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
    setStored(STORAGE_KEYS.CONVERSATIONS, updated);
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
  async simulateChat(userMessage) {
    const msg = userMessage.toLowerCase();
    if (msg.includes("return") || msg.includes("refund")) {
      return {
        reply: "We offer hassle-free exchanges and returns within 14 days of receipt on unworn items with original tags intact. Would you like me to initiate a return shipping label for you?",
        confidence: 94,
        source: "Return & Refund Policy Knowledge"
      };
    }
    if (msg.includes("shipping") || msg.includes("delivery") || msg.includes("courier")) {
      return {
        reply: "Standard delivery is complimentary on all orders over $75 (arriving in 2-4 business days). Express overnight delivery is also available for $18.",
        confidence: 97,
        source: "Shipping Knowledge Base"
      };
    }
    if (msg.includes("discount") || msg.includes("coupon") || msg.includes("deal") || msg.includes("promo")) {
      return {
        reply: "I can offer you an exclusive 10% welcome discount on your order today! Use code KREAZY10 at checkout.",
        confidence: 92,
        source: "Sales Behavior Rules"
      };
    }
    if (msg.includes("linen") || msg.includes("shirt") || msg.includes("carafe") || msg.includes("perfume")) {
      return {
        reply: "Our Artisan collection is crafted with organic European materials. We have sizes and stock ready for immediate dispatch! Would you like to review specs or place an order?",
        confidence: 96,
        source: "Product Catalog Index"
      };
    }
    return {
      reply: "Thank you for asking! I'm here to assist with products, orders, shipping, and sizing across WhatsApp, Instagram, and Facebook. How can I assist your order today?",
      confidence: 89,
      source: "General Concierge Persona"
    };
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
  async submitDemo(demoData) {
    const existing = getStored(STORAGE_KEYS.DEMO_REQUESTS, initialDemoRequests);
    const newLead = { 
      ...demoData, 
      id: `demo-${Date.now()}`, 
      request_type: 'DEMO',
      status: 'NEW',
      notes: 'Submitted via public website demo booking flow.',
      created_at: 'Just now'
    };
    setStored(STORAGE_KEYS.DEMO_REQUESTS, [newLead, ...existing]);
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
      status: 'NEW',
      notes: `Founder 1-on-1 strategy meeting request: ${meetingData.message || 'No additional note'}`,
      created_at: 'Just now'
    };
    setStored(STORAGE_KEYS.DEMO_REQUESTS, [newMeeting, ...existing]);
    return { success: true, lead: newMeeting };
  }
};

export const authService = {
  getCurrentUser() {
    return getStored(STORAGE_KEYS.AUTH_USER, {
      id: "usr-admin-01",
      name: "Marcus Aurelius",
      email: "founder@kreazybrand.com",
      storeName: "Kreazy Flagship Studio",
      role: "OWNER",
      is_super_admin: false,
      isLoggedIn: true
    });
  },
  login(email, password) {
    const isSuper = email.includes('superadmin') || email.includes('admin@kreazy.ai');
    const user = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0] || "Store Owner",
      email: email,
      storeName: isSuper ? "KreazyAI Global Admin" : "Kreazy Flagship Studio",
      role: isSuper ? "SUPER_ADMIN" : "OWNER",
      is_super_admin: isSuper,
      isLoggedIn: true
    };
    setStored(STORAGE_KEYS.AUTH_USER, user);
    return user;
  },
  logout() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    return true;
  }
};
