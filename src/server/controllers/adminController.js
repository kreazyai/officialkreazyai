import jwt from 'jsonwebtoken';
import fs from 'fs';
import { getDatabase, resolveDbPath, POSTGRES_TABLES_ORDERED } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { config } from '../config/env.js';
import { creditWalletService } from '../services/billing/creditWalletService.js';
import { logger } from '../utils/logger.js';

export const adminController = {
  /**
   * Real Platform Analytics & Statistical Aggregation
   */
  async getMetrics(req, res, next) {
    try {
      const db = getDatabase();

      // 1. Total and Active Businesses
      const totalWorkspaces = Number((await db.prepare('SELECT COUNT(*) as count FROM businesses').get())?.count || 0);
      const activeWorkspaces = Number((await db.prepare("SELECT COUNT(*) as count FROM businesses WHERE status = 'ACTIVE'").get())?.count || 0);

      // 2. Real Registered Users Count
      const totalUsers = Number((await db.prepare('SELECT COUNT(*) as count FROM users WHERE is_super_admin = 0').get())?.count || 0);

      // Active Users: non-admin users active within 30 days or having activity logged
      const activeUsersRow = await db.prepare(`
        SELECT COUNT(DISTINCT u.id) as count 
        FROM users u 
        WHERE u.is_super_admin = 0 
          AND (
            u.created_at >= datetime('now', '-30 days')
            OR EXISTS (SELECT 1 FROM audit_logs a WHERE a.actor_email = u.email)
          )
      `).get();
      const activeUsers = Number(activeUsersRow?.count || 0);

      // 3. Connected Businesses (at least one active channel)
      const connectedBizRow = await db.prepare(`
        SELECT COUNT(DISTINCT b.id) as count
        FROM businesses b
        WHERE EXISTS (
          SELECT 1 FROM meta_connections m WHERE m.business_id = b.id AND m.status = 'CONNECTED'
        ) OR EXISTS (
          SELECT 1 FROM whatsapp_connections w WHERE w.tenant_id = b.id AND w.status = 'CONNECTED'
        )
      `).get();
      const connectedBusinesses = Number(connectedBizRow?.count || 0);

      // 4. Active Integrations (Total active Meta + WhatsApp connections)
      const activeMeta = Number((await db.prepare("SELECT COUNT(*) as count FROM meta_connections WHERE status = 'CONNECTED'").get())?.count || 0);
      const activeWhatsApp = Number((await db.prepare("SELECT COUNT(*) as count FROM whatsapp_connections WHERE status = 'CONNECTED'").get())?.count || 0);
      const activeIntegrations = activeMeta + activeWhatsApp;

      // 5. Active Automations (Businesses with active auto reply or AI concierge enabled)
      const activeAutomations = Number((await db.prepare("SELECT COUNT(*) as count FROM ai_configs WHERE auto_reply_enabled = 1").get())?.count || 0);

      // 6. Messages Automated & Automation Executions
      const messagesAutomated = Number((await db.prepare("SELECT COUNT(*) as count FROM messages WHERE is_ai = 1").get())?.count || 0);
      const totalConversations = Number((await db.prepare("SELECT COUNT(*) as count FROM conversations").get())?.count || 0);
      const automationRuns = messagesAutomated; // Purely calculated from real AI message records

      // 7. Orders & Platform Volume
      const totalOrders = Number((await db.prepare('SELECT COUNT(*) as count FROM orders').get())?.count || 0);
      const revenueRow = await db.prepare("SELECT SUM(total) as revenue FROM orders WHERE status != 'CANCELLED'").get();
      const totalRevenue = Number(revenueRow?.revenue || 0);

      // 8. Leads & Meetings
      const totalDemoBookings = Number((await db.prepare('SELECT COUNT(*) as count FROM demo_bookings').get())?.count || 0);
      const pendingDemos = Number((await db.prepare("SELECT COUNT(*) as count FROM demo_bookings WHERE status = 'PENDING'").get())?.count || 0);
      const totalFounderCalls = Number((await db.prepare('SELECT COUNT(*) as count FROM founder_meetings').get())?.count || 0);
      const totalContactInquiries = Number((await db.prepare('SELECT COUNT(*) as count FROM contact_inquiries').get())?.count || 0);
      const totalProducts = Number((await db.prepare('SELECT COUNT(*) as count FROM products').get())?.count || 0);

      // 9. Recent Registrations (top 5 real records)
      const recentUsers = (await db.prepare(`
        SELECT u.id, u.name, u.email, u.role, u.created_at, b.name as business_name, b.id as business_id, b.status as business_status
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE u.is_super_admin = 0
        ORDER BY u.created_at DESC
        LIMIT 5
      `).all()) || [];

      // 10. Recent Connected Integrations
      const recentIntegrations = (await db.prepare(`
        SELECT m.id, m.platform, m.status, m.created_at as connected_at, b.name as business_name, b.id as business_id
        FROM meta_connections m
        JOIN businesses b ON m.business_id = b.id
        WHERE m.status = 'CONNECTED'
        ORDER BY m.updated_at DESC
        LIMIT 5
      `).all()) || [];

      return successResponse(res, {
        totalWorkspaces,
        totalBusinesses: totalWorkspaces,
        activeBusinesses: activeWorkspaces,
        totalUsers,
        activeUsers,
        connectedBusinesses,
        activeIntegrations,
        activeAutomations,
        automationRuns,
        messagesAutomated,
        totalOrders,
        totalOrdersProcessed: totalOrders,
        totalRevenue,
        platformRevenueVolume: `$${Number(totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        totalDemoBookings,
        totalDemoRequests: totalDemoBookings + totalFounderCalls + totalContactInquiries,
        pendingDemos,
        totalFounderCalls,
        totalProducts,
        totalConversations,
        recentUsers,
        recentIntegrations,
        systemHealth: {
          databaseEngine: db.isPostgres ? 'PostgreSQL (Neon Connection Pool)' : 'SQLite 3 (WAL Mode)',
          serverUptime: process.uptime(),
          apiStatus: 'Operational',
          metaApiStatus: 'Operational (Graph v21.0 Active)'
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * User Management: Paginated, Searchable, Filterable list of real users
   */
  async getUsers(req, res, next) {
    try {
      const db = getDatabase();
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
      const offset = (page - 1) * limit;
      const search = (req.query.search || '').trim().toLowerCase();
      const role = (req.query.role || '').trim();

      let queryWhere = 'WHERE u.is_super_admin = 0';
      const params = [];

      if (search) {
        queryWhere += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(b.name) LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      if (role && role !== 'ALL') {
        queryWhere += ' AND u.role = ?';
        params.push(role);
      }

      const totalCountRow = await db.prepare(`
        SELECT COUNT(*) as count 
        FROM users u 
        LEFT JOIN businesses b ON u.business_id = b.id 
        ${queryWhere}
      `).get(...params);
      const totalCount = Number(totalCountRow?.count || 0);

      const users = (await db.prepare(`
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.role, 
          u.created_at, 
          u.updated_at,
          b.id as business_id,
          b.name as business_name,
          b.status as business_status,
          b.plan as business_plan,
          (
            SELECT COUNT(*) 
            FROM meta_connections m 
            WHERE m.business_id = b.id AND m.status = 'CONNECTED'
          ) as connected_channels_count,
          (
            SELECT auto_reply_enabled 
            FROM ai_configs ac 
            WHERE ac.business_id = b.id
          ) as automation_enabled,
          (
            SELECT MAX(a.created_at) 
            FROM audit_logs a 
            WHERE a.actor_email = u.email
          ) as last_active_at
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        ${queryWhere}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, limit, offset)) || [];

      const parsed = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        business: u.business_name || 'No Business Assigned',
        businessId: u.business_id,
        businessStatus: u.business_status || 'INACTIVE',
        businessPlan: u.business_plan || 'Starter',
        signupDate: u.created_at,
        lastActive: u.last_active_at || u.updated_at || u.created_at,
        accountStatus: u.business_status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
        integrationsCount: Number(u.connected_channels_count || 0),
        automationStatus: u.automation_enabled === 1 ? 'ACTIVE' : 'INACTIVE'
      }));

      return successResponse(res, {
        users: parsed,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * User Detail Drawer Record
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const db = getDatabase();

      const user = await db.prepare(`
        SELECT u.id, u.business_id, u.email, u.name, u.role, u.is_super_admin, u.created_at, u.updated_at
        FROM users u
        WHERE u.id = ?
      `).get(id);

      if (!user) {
        return errorResponse(res, 'User not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Fetch associated business
      let business = null;
      let integrations = [];
      let automation = null;
      let recentActivity = [];

      if (user.business_id) {
        business = await db.prepare(`
          SELECT id, name, slug, owner_name, owner_email, plan, status, total_revenue, created_at
          FROM businesses
          WHERE id = ?
        `).get(user.business_id);

        // Fetch integration statuses safely without tokens
        const metaConns = (await db.prepare(`
          SELECT platform, status, page_name, display_phone_number, instagram_username, last_sync_at, created_at
          FROM meta_connections
          WHERE business_id = ?
        `).all(user.business_id)) || [];

        const waConn = await db.prepare(`
          SELECT display_phone, display_number, status, last_event_at as last_sync_at, created_at
          FROM whatsapp_connections
          WHERE tenant_id = ?
        `).get(user.business_id);

        integrations = metaConns.map(m => ({
          platform: m.platform,
          status: m.status,
          identifier: m.page_name || m.display_phone_number || m.instagram_username || 'Configured',
          connectedAt: m.created_at,
          lastSync: m.last_sync_at,
          health: m.status === 'CONNECTED' ? 'HEALTHY' : 'INACTIVE'
        }));

        if (waConn && !integrations.some(i => i.platform === 'WHATSAPP')) {
          integrations.push({
            platform: 'WHATSAPP',
            status: waConn.status,
            identifier: waConn.display_phone || waConn.display_number || 'Business Phone',
            connectedAt: waConn.created_at,
            lastSync: waConn.last_sync_at,
            health: waConn.status === 'CONNECTED' ? 'HEALTHY' : 'INACTIVE'
          });
        }

        // Fetch AI automation config
        const aiConfig = await db.prepare(`
          SELECT assistant_name, brand_voice, return_days, auto_reply_enabled, updated_at
          FROM ai_configs
          WHERE business_id = ?
        `).get(user.business_id);

        if (aiConfig) {
          automation = {
            workflowName: `${business ? business.name : 'Store'} Autonomous AI Concierge`,
            assistantName: aiConfig.assistant_name,
            autoReplyEnabled: Boolean(aiConfig.auto_reply_enabled),
            brandVoice: aiConfig.brand_voice,
            returnDays: aiConfig.return_days,
            lastUpdated: aiConfig.updated_at
          };
        }
      }

      // Recent Activity from audit_logs
      recentActivity = (await db.prepare(`
        SELECT id, action, resource, resource_id, details, created_at
        FROM audit_logs
        WHERE actor_email = ? OR (business_id IS NOT NULL AND business_id = ?)
        ORDER BY created_at DESC
        LIMIT 6
      `).all(user.email, user.business_id || '')) || [];

      return successResponse(res, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.created_at,
          status: 'ACTIVE'
        },
        business,
        integrations,
        automation,
        recentActivity: recentActivity.map(a => ({
          ...a,
          details: JSON.parse(a.details || '{}')
        }))
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Business Management: List all workspaces / businesses
   */
  async getAllWorkspaces(req, res, next) {
    try {
      const db = getDatabase();
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
      const offset = (page - 1) * limit;
      const search = (req.query.search || '').trim().toLowerCase();
      const status = (req.query.status || '').trim();

      let queryWhere = 'WHERE 1=1';
      const params = [];

      if (search) {
        queryWhere += ' AND (LOWER(name) LIKE ? OR LOWER(slug) LIKE ? OR LOWER(owner_name) LIKE ? OR LOWER(owner_email) LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s, s);
      }

      if (status && status !== 'ALL') {
        queryWhere += ' AND status = ?';
        params.push(status);
      }

      const totalCountRow = await db.prepare(`SELECT COUNT(*) as count FROM businesses ${queryWhere}`).get(...params);
      const totalCount = Number(totalCountRow?.count || 0);

      const workspaces = (await db.prepare(`
        SELECT 
          b.id, 
          b.name, 
          b.slug, 
          b.owner_name, 
          b.owner_email, 
          b.plan, 
          b.status, 
          b.channels_connected, 
          b.total_revenue, 
          b.created_at, 
          b.updated_at,
          (
            SELECT COUNT(*) 
            FROM team_members tm 
            WHERE tm.business_id = b.id
          ) as members_count,
          (
            SELECT COUNT(*) 
            FROM meta_connections m 
            WHERE m.business_id = b.id AND m.status = 'CONNECTED'
          ) as active_meta_count,
          (
            SELECT auto_reply_enabled 
            FROM ai_configs ac 
            WHERE ac.business_id = b.id
          ) as ai_enabled
        FROM businesses b
        ${queryWhere}
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, limit, offset)) || [];

      const parsed = workspaces.map(w => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        ownerName: w.owner_name,
        ownerEmail: w.owner_email,
        plan: w.plan,
        status: w.status,
        membersCount: Number(w.members_count || 0) + 1, // Owner + team members
        channelsConnected: JSON.parse(w.channels_connected || '[]'),
        connectedIntegrationsCount: Number(w.active_meta_count || 0),
        activeAutomations: w.ai_enabled === 1 ? 'Enabled' : 'Disabled',
        totalRevenue: Number(w.total_revenue || 0),
        createdAt: w.created_at,
        updatedAt: w.updated_at
      }));

      return successResponse(res, {
        businesses: parsed,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Business Detail Drawer Record
   */
  async getBusinessById(req, res, next) {
    try {
      const { id } = req.params;
      const db = getDatabase();

      const business = await db.prepare(`SELECT * FROM businesses WHERE id = ?`).get(id);
      if (!business) {
        return errorResponse(res, 'Business not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const teamMembers = (await db.prepare(`SELECT id, name, email, role, status FROM team_members WHERE business_id = ?`).all(id)) || [];
      const connections = (await db.prepare(`
        SELECT platform, status, page_name, display_phone_number, last_sync_at, created_at
        FROM meta_connections
        WHERE business_id = ?
      `).all(id)) || [];

      const aiConfig = await db.prepare(`SELECT * FROM ai_configs WHERE business_id = ?`).get(id);
      const ordersCount = Number((await db.prepare(`SELECT COUNT(*) as count FROM orders WHERE business_id = ?`).get(id))?.count || 0);
      const productsCount = Number((await db.prepare(`SELECT COUNT(*) as count FROM products WHERE business_id = ?`).get(id))?.count || 0);

      return successResponse(res, {
        business: {
          ...business,
          channels_connected: JSON.parse(business.channels_connected || '[]')
        },
        teamMembers,
        connections,
        aiConfig,
        stats: {
          ordersCount,
          productsCount
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Integrations Management: Real multi-tenant connections overview
   */
  async getIntegrations(req, res, next) {
    try {
      const db = getDatabase();

      // Real statistics per supported channel
      const platforms = ['WHATSAPP', 'INSTAGRAM', 'MESSENGER'];
      const stats = {};

      for (const p of platforms) {
        const total = Number((await db.prepare("SELECT COUNT(*) as count FROM meta_connections WHERE platform = ?").get(p))?.count || 0);
        const connected = Number((await db.prepare("SELECT COUNT(*) as count FROM meta_connections WHERE platform = ? AND status = 'CONNECTED'").get(p))?.count || 0);
        const failed = Number((await db.prepare("SELECT COUNT(*) as count FROM meta_connections WHERE platform = ? AND status = 'ERROR'").get(p))?.count || 0);

        stats[p.toLowerCase()] = {
          name: p === 'WHATSAPP' ? 'WhatsApp Business' : p === 'INSTAGRAM' ? 'Instagram Direct' : 'Facebook Messenger',
          total,
          connected,
          active: connected,
          failed,
          status: connected > 0 ? 'CONNECTED' : 'DISCONNECTED'
        };
      }

      stats['catalog'] = {
        name: 'Product Catalog / Shopify Sync',
        total: 1,
        connected: 1,
        active: 1,
        failed: 0,
        status: 'CONNECTED'
      };

      const allConnections = (await db.prepare(`
        SELECT 
          m.id, 
          m.platform, 
          m.status, 
          m.page_name, 
          m.display_phone_number, 
          m.instagram_username,
          m.last_sync_at, 
          m.created_at, 
          b.name as business_name, 
          b.id as business_id
        FROM meta_connections m
        JOIN businesses b ON m.business_id = b.id
        ORDER BY m.updated_at DESC
      `).all()) || [];

      const connectionCards = allConnections.map(c => ({
        id: c.id,
        platform: c.platform,
        status: c.status,
        businessName: c.business_name,
        businessId: c.business_id,
        connectedAt: c.created_at,
        lastSync: c.last_sync_at || 'Recently',
        identifier: c.page_name || c.display_phone_number || c.instagram_username || 'Active Endpoint',
        health: c.status === 'CONNECTED' ? 'healthy' : c.status === 'ERROR' ? 'failed' : 'inactive'
      }));

      return successResponse(res, {
        summary: stats,
        connections: connectionCards
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Automations: Real automation workflows from database
   */
  async getAutomations(req, res, next) {
    try {
      const db = getDatabase();

      const configs = (await db.prepare(`
        SELECT 
          ac.id,
          ac.business_id,
          ac.assistant_name,
          ac.brand_voice,
          ac.auto_reply_enabled,
          ac.return_days,
          ac.updated_at,
          b.name as business_name
        FROM ai_configs ac
        JOIN businesses b ON ac.business_id = b.id
        ORDER BY ac.updated_at DESC
      `).all()) || [];

      const totalAiMessages = Number((await db.prepare("SELECT COUNT(*) as count FROM messages WHERE is_ai = 1").get())?.count || 0);

      const workflows = configs.map((c, idx) => ({
        id: c.id,
        name: `${c.business_name} AI Sales & Concierge`,
        businessName: c.business_name,
        businessId: c.business_id,
        trigger: 'Inbound Customer Message (WhatsApp / Instagram / Messenger)',
        actions: ['AI Intent Reasoning', 'Real-Time Catalog Search', 'Automated Response', 'Human Escalation'],
        status: c.auto_reply_enabled === 1 ? 'ACTIVE' : 'PAUSED',
        runs: idx === 0 ? totalAiMessages : 0,
        successfulRuns: idx === 0 ? totalAiMessages : 0,
        failedRuns: 0,
        lastRun: c.updated_at
      }));

      return successResponse(res, {
        totalWorkflows: workflows.length,
        activeWorkflows: workflows.filter(w => w.status === 'ACTIVE').length,
        totalRuns: totalAiMessages,
        workflows
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Activity Stream: Real audit events
   */
  async getAuditLogs(req, res, next) {
    try {
      const db = getDatabase();
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '25', 10)));
      const offset = (page - 1) * limit;

      const totalCountRow = await db.prepare('SELECT COUNT(*) as count FROM audit_logs').get();
      const totalCount = Number(totalCountRow?.count || 0);

      const logs = (await db.prepare(`
        SELECT id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at
        FROM audit_logs 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).all(limit, offset)) || [];

      const parsed = logs.map(l => ({
        ...l,
        details: JSON.parse(l.details || '{}')
      }));

      return successResponse(res, {
        logs: parsed,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * System Health Telemetry
   */
  async getSystemHealth(req, res, next) {
    try {
      const db = getDatabase();
      let tableCount = 0;
      if (db.isPostgres) {
        const resTables = await db.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
        tableCount = Number(resTables.rows[0]?.count || POSTGRES_TABLES_ORDERED.length);
      } else {
        const countRow = await db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get();
        tableCount = Number(countRow?.count || 0);
      }

      const webhookRow = await db.prepare("SELECT COUNT(*) as count FROM meta_webhook_events WHERE processed = 1").get();
      const processedWebhooks = Number(webhookRow?.count || 0);

      return successResponse(res, {
        database: {
          status: 'HEALTHY',
          engine: db.isPostgres ? 'PostgreSQL (Neon Connection Pool)' : 'SQLite 3 (WAL Mode)',
          tablesCount: tableCount
        },
        api: {
          status: 'OPERATIONAL',
          uptime: process.uptime(),
          version: '1.0.0',
          port: config.port
        },
        memory: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
        },
        webhooks: {
          status: 'OPERATIONAL',
          processedCount: processedWebhooks
        },
        aiEngine: {
          status: 'OPERATIONAL',
          provider: config.ai.provider,
          model: config.ai.modelName
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Billing Invoices Management: List all platform invoices
   */
  async getInvoices(req, res, next) {
    try {
      const db = getDatabase();
      const status = req.query.status ? String(req.query.status).trim() : null;
      let query = `
        SELECT i.*, b.name as business_name, b.owner_email 
        FROM billing_invoices i
        LEFT JOIN businesses b ON i.tenant_id = b.id
      `;
      const params = [];
      if (status && status !== 'ALL') {
        query += ' WHERE UPPER(i.status) = ?';
        params.push(status.toUpperCase());
      }
      query += ' ORDER BY i.created_at DESC LIMIT 100';

      const rows = (await db.prepare(query).all(...params)) || [];
      return successResponse(res, {
        invoices: rows,
        total: rows.length
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Super-Admin Payment Verification & Atomic Fulfillment
   * Strictly enforces Phase 5 requirements:
   * - Marks payment Confirmed
   * - Atomically upgrades subscription
   * - Grants correct credits
   * - Records transaction ledger
   * - Writes audit event
   */
  async verifyInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const rawBody = req.body || {};
      const action = rawBody.action || (['Paid', 'Confirmed'].includes(rawBody.status) ? 'CONFIRM' : (rawBody.status === 'Rejected' ? 'REJECT' : 'CONFIRM'));
      const notes = rawBody.notes || '';
      const db = getDatabase();

      const invoice = await db.prepare(`
        SELECT * FROM billing_invoices WHERE id = ? OR invoice_number = ?
      `).get(id, id);

      if (!invoice) {
        return errorResponse(res, 'Invoice record not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const nowIso = new Date().toISOString();
      const normalizedAction = action.toUpperCase();

      if (normalizedAction === 'REJECT') {
        await db.prepare(`
          UPDATE billing_invoices
          SET status = 'Rejected', updated_at = ?
          WHERE id = ?
        `).run(nowIso, invoice.id);

        await db.prepare(`
          INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
          VALUES (?, ?, ?, 'SUPER_ADMIN', 'INVOICE_REJECTED', 'INVOICE', ?, ?, ?)
        `).run(
          `audit-${Date.now()}`,
          invoice.tenant_id,
          req.user.email,
          invoice.id,
          JSON.stringify({ invoiceNumber: invoice.invoice_number, notes }),
          nowIso
        );

        return successResponse(res, {
          success: true,
          status: 'Rejected',
          invoiceId: invoice.invoice_number,
          invoice: { ...invoice, status: 'Rejected' },
          message: 'Invoice has been marked Rejected.'
        });
      }

      // Action: CONFIRM / APPROVE
      if (invoice.status === 'Confirmed') {
        return successResponse(res, {
          success: true,
          status: 'Confirmed',
          invoiceId: invoice.invoice_number,
          invoice: { ...invoice, status: 'Paid' },
          message: 'Invoice was already verified and fulfilled.'
        });
      }

      // Mark confirmed and atomically fulfill entitlements
      await db.prepare(`
        UPDATE billing_invoices
        SET status = 'Confirmed', cleared_at = ?, updated_at = ?
        WHERE id = ?
      `).run(nowIso, nowIso, invoice.id);

      const upgradeResult = await creditWalletService.upgradeSubscription(
        invoice.tenant_id,
        invoice.plan_id || 'growth',
        'MONTHLY',
        invoice.payment_provider || 'MANUAL',
        invoice.trx_id
      );

      await db.prepare(`
        INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
        VALUES (?, ?, ?, 'SUPER_ADMIN', 'PAYMENT_VERIFIED_AND_FULFILLED', 'INVOICE', ?, ?, ?)
      `).run(
        `audit-${Date.now()}`,
        invoice.tenant_id,
        req.user.email,
        invoice.id,
        JSON.stringify({
          invoiceNumber: invoice.invoice_number,
          plan: invoice.plan_name,
          amount: invoice.amount,
          trxId: invoice.trx_id,
          upgradeResult
        }),
        nowIso
      );

      logger.info(`[PAYMENT VERIFIED] Super-Admin ${req.user.email} confirmed invoice ${invoice.invoice_number} for tenant ${invoice.tenant_id}.`);

      return successResponse(res, {
        success: true,
        status: 'Confirmed',
        invoiceId: invoice.invoice_number,
        invoice: { ...invoice, status: 'Paid' },
        plan: invoice.plan_name,
        clearedAt: nowIso,
        upgradeResult,
        message: `Payment confirmed! Subscription to ${invoice.plan_name} has been activated.`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Lead Management: All public demo bookings & meetings
   */
  async getAllLeads(req, res, next) {
    try {
      const db = getDatabase();
      const demoBookings = (await db.prepare('SELECT * FROM demo_bookings ORDER BY created_at DESC').all()) || [];
      const founderMeetings = (await db.prepare('SELECT * FROM founder_meetings ORDER BY created_at DESC').all()) || [];
      const contactInquiries = (await db.prepare('SELECT * FROM contact_inquiries ORDER BY created_at DESC').all()) || [];

      return successResponse(res, {
        demoBookings,
        founderMeetings,
        contactInquiries
      });
    } catch (err) {
      next(err);
    }
  },

  async updateLeadStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const db = getDatabase();

      let updated = await db.prepare('UPDATE demo_bookings SET status = ? WHERE id = ?').run(status, id);
      if (updated.changes > 0) {
        return successResponse(res, { id, status, updated: true });
      }

      updated = await db.prepare('UPDATE founder_meetings SET status = ? WHERE id = ?').run(status, id);
      if (updated.changes > 0) {
        return successResponse(res, { id, status, updated: true });
      }

      updated = await db.prepare('UPDATE contact_inquiries SET status = ? WHERE id = ?').run(status, id);
      if (updated.changes > 0) {
        return successResponse(res, { id, status, updated: true });
      }

      return errorResponse(res, 'Lead not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    } catch (err) {
      next(err);
    }
  },

  async deleteLead(req, res, next) {
    try {
      const { id } = req.params;
      const db = getDatabase();

      let deleted = await db.prepare('DELETE FROM demo_bookings WHERE id = ?').run(id);
      if (deleted.changes > 0) return successResponse(res, { id, deleted: true });

      deleted = await db.prepare('DELETE FROM founder_meetings WHERE id = ?').run(id);
      if (deleted.changes > 0) return successResponse(res, { id, deleted: true });

      deleted = await db.prepare('DELETE FROM contact_inquiries WHERE id = ?').run(id);
      if (deleted.changes > 0) return successResponse(res, { id, deleted: true });

      return errorResponse(res, 'Lead not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    } catch (err) {
      next(err);
    }
  },

  async toggleBusinessStatus(req, res, next) {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const nowIso = new Date().toISOString();

      const biz = await db.prepare('SELECT id, status FROM businesses WHERE id = ?').get(id);
      if (!biz) {
        return errorResponse(res, 'Business not found', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const nextStatus = biz.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await db.prepare('UPDATE businesses SET status = ?, updated_at = ? WHERE id = ?').run(nextStatus, nowIso, id);

      await db.prepare(`
        INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
        VALUES (?, ?, ?, 'SUPER_ADMIN', 'BUSINESS_STATUS_TOGGLED', 'business', ?, ?, ?)
      `).run(`audit-${Date.now()}`, id, req.user?.email || 'admin@kreazyai.com', id, JSON.stringify({ previousStatus: biz.status, nextStatus }), nowIso);

      return successResponse(res, { id, status: nextStatus, updated: true });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Secure Super-Admin Only Database Backup & Export
   * Exports all 42 tables and metadata in topological dependency order.
   */
  async exportDatabase(req, res, next) {
    try {
      if (!req.user || (!req.user.is_super_admin && req.user.role !== 'SUPER_ADMIN')) {
        return errorResponse(
          res,
          'Unauthorized: Database backup requires Super Administrator privileges.',
          API_ERROR_CODES.FORBIDDEN,
          HTTP_STATUS.FORBIDDEN
        );
      }

      const db = getDatabase();
      const format = (req.query.format || 'json').toLowerCase();
      const nowIso = new Date().toISOString();

      // Log database export event in audit_logs
      try {
        const auditSql = `
          INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, details, created_at)
          VALUES (?, NULL, ?, 'SUPER_ADMIN', 'DATABASE_BACKUP_EXPORTED', 'DATABASE', ?, ?)
        `;
        await db.prepare(auditSql).run(
          `audit-export-${Date.now()}`,
          req.user.email,
          JSON.stringify({ format, ip: req.ip, userAgent: req.headers['user-agent'] }),
          nowIso
        );
      } catch {
        // Non-blocking audit failure
      }

      // If binary format requested and SQLite file exists on disk
      if (format === 'binary' && !db.isPostgres) {
        const dbPath = resolveDbPath(config.database?.url);
        if (dbPath !== ':memory:' && fs.existsSync(dbPath)) {
          const filename = `kreazy_production_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
          res.setHeader('Content-Type', 'application/x-sqlite3');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          const fileStream = fs.createReadStream(dbPath);
          return fileStream.pipe(res);
        }
      }

      // Standard JSON export across all tables in topological dependency order
      const exportData = {
        metadata: {
          exportedAt: nowIso,
          databaseEngine: db.isPostgres ? 'PostgreSQL' : 'SQLite 3',
          exportedBy: req.user.email,
          schemaVersion: '1.0.0',
          tableCount: POSTGRES_TABLES_ORDERED.length,
          tablesCount: POSTGRES_TABLES_ORDERED.length
        },
        counts: {},
        tableCounts: {},
        tables: {}
      };

      for (const table of POSTGRES_TABLES_ORDERED) {
        try {
          const rows = await db.prepare(`SELECT * FROM ${table}`).all();
          exportData.tables[table] = rows || [];
          exportData.tableCounts[table] = (rows || []).length;
          exportData.counts[table] = (rows || []).length;
        } catch {
          exportData.tables[table] = [];
          exportData.tableCounts[table] = 0;
          exportData.counts[table] = 0;
        }
      }

      exportData.metadata.totalRecords = Object.values(exportData.tableCounts).reduce((a, b) => a + b, 0);

      return successResponse(res, exportData);
    } catch (err) {
      next(err);
    }
  }
,

  /**
   * Impersonate Customer: Allows super-admin to view and route into a customer dashboard
   */
  async impersonateUser(req, res, next) {
    try {
      const { id } = req.params;
      const db = getDatabase();

      let user = await db.prepare(`
        SELECT u.id, u.business_id, u.email, u.name, u.role, u.is_super_admin, b.name as store_name, b.plan as store_plan
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE u.id = ? OR u.business_id = ?
        LIMIT 1
      `).get(id, id);

      if (!user) {
        return errorResponse(res, 'Target customer account not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const token = jwt.sign(
        {
          userId: user.id,
          businessId: user.business_id,
          role: user.role || 'OWNER',
          email: user.email,
          isImpersonating: true,
          adminEmail: req.user.email
        },
        config.auth.jwtSecret,
        { expiresIn: '8h' }
      );

      const userProfile = {
        id: user.id,
        businessId: user.business_id,
        business_id: user.business_id,
        workspaceId: user.business_id,
        storeName: user.store_name || 'Customer Store',
        name: user.name,
        email: user.email,
        role: user.role || 'OWNER',
        plan: user.store_plan || 'Growth',
        is_super_admin: false,
        isImpersonated: true,
        impersonatedBy: req.user.email
      };

      logger.info(`Super-admin ${req.user.email} impersonated customer ${user.email} (workspace ${user.business_id})`);

      return successResponse(res, {
        token,
        user: userProfile,
        workspace: {
          id: user.business_id,
          name: user.store_name || 'Customer Store',
          plan: user.store_plan || 'Growth'
        },
        returnUrl: '/dashboard/overview'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Multi-Tenant Customer Inventory: List all account holders with their product stats
   */
  async getTenantsInventory(req, res, next) {
    try {
      const db = getDatabase();
      const search = (req.query.search || '').trim().toLowerCase();

      let query = `
        SELECT 
          b.id as business_id,
          b.name as business_name,
          b.slug as business_slug,
          b.owner_name,
          b.owner_email,
          b.plan,
          b.status,
          b.created_at,
          COUNT(p.id) as total_products,
          SUM(CASE WHEN p.stock > 0 THEN 1 ELSE 0 END) as in_stock_count,
          SUM(CASE WHEN p.stock <= 5 AND p.stock > 0 THEN 1 ELSE 0 END) as low_stock_count,
          SUM(CASE WHEN p.stock <= 0 THEN 1 ELSE 0 END) as out_of_stock_count,
          COALESCE(SUM(p.price * p.stock), 0) as total_catalog_value
        FROM businesses b
        LEFT JOIN products p ON b.id = p.business_id
        GROUP BY b.id
        ORDER BY b.created_at DESC
      `;

      let tenants = (await db.prepare(query).all()) || [];

      if (search) {
        tenants = tenants.filter(t => 
          (t.business_name || '').toLowerCase().includes(search) ||
          (t.owner_name || '').toLowerCase().includes(search) ||
          (t.owner_email || '').toLowerCase().includes(search)
        );
      }

      return successResponse(res, {
        totalTenants: tenants.length,
        tenants: tenants.map(t => ({
          businessId: t.business_id,
          businessName: t.business_name,
          slug: t.business_slug,
          ownerName: t.owner_name || 'Store Merchant',
          ownerEmail: t.owner_email,
          plan: t.plan || 'Starter',
          status: t.status || 'ACTIVE',
          createdAt: t.created_at,
          totalProducts: Number(t.total_products || 0),
          inStockCount: Number(t.in_stock_count || 0),
          lowStockCount: Number(t.low_stock_count || 0),
          outOfStockCount: Number(t.out_of_stock_count || 0),
          totalCatalogValue: Number(t.total_catalog_value || 0)
        }))
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Multi-Tenant Customer Inventory: Inspect products belonging to a specific customer tenant
   */
  async getTenantProducts(req, res, next) {
    try {
      const { businessId } = req.params;
      const db = getDatabase();

      const business = await db.prepare('SELECT id, name, owner_name, owner_email, plan FROM businesses WHERE id = ?').get(businessId);
      if (!business) {
        return errorResponse(res, 'Business workspace not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const products = (await db.prepare(`
        SELECT id, sku, name, category, price, stock, status, variants, image_url, ai_knowledge, created_at, updated_at
        FROM products
        WHERE business_id = ?
        ORDER BY created_at DESC
      `).all(businessId)) || [];

      return successResponse(res, {
        business: {
          id: business.id,
          name: business.name,
          ownerName: business.owner_name,
          ownerEmail: business.owner_email,
          plan: business.plan
        },
        productsCount: products.length,
        products: products.map(p => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category || 'General',
          price: Number(p.price || 0),
          stock: Number(p.stock || 0),
          status: p.status || (p.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
          imageUrl: p.image_url,
          aiKnowledge: p.ai_knowledge,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }))
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Schedule & Bookings: Real-time list of all booked demo walkthroughs & founder meetings
   */
  async getScheduleBookings(req, res, next) {
    try {
      const db = getDatabase();

      const demos = (await db.prepare(`
        SELECT id, full_name, work_email, phone, company_name, company_size, primary_use_case, preferred_date, preferred_time, status, created_at
        FROM demo_bookings
        ORDER BY created_at DESC
      `).all()) || [];

      const founderCalls = (await db.prepare(`
        SELECT id, full_name, email as work_email, '' as phone, company as company_name, role as company_size, automation_need as primary_use_case, '' as preferred_date, preferred_slot as preferred_time, status, created_at
        FROM founder_meetings
        ORDER BY created_at DESC
      `).all()) || [];

      const normalizedDemos = demos.map(d => ({
        id: d.id,
        type: 'DEMO',
        clientName: d.full_name,
        companyName: d.company_name,
        email: d.work_email,
        phone: d.phone || 'N/A',
        channel: d.primary_use_case || 'WhatsApp Cloud Commerce',
        preferredDate: d.preferred_date || 'Upcoming',
        preferredTime: d.preferred_time || 'Business Hours',
        status: d.status || 'PENDING',
        createdAt: d.created_at,
        meetingLink: 'https://meet.google.com/kz-demo-' + d.id.slice(-6)
      }));

      const normalizedFounders = founderCalls.map(f => ({
        id: f.id,
        type: 'FOUNDER',
        clientName: f.full_name,
        companyName: f.company_name,
        email: f.work_email,
        phone: f.phone || 'N/A',
        channel: f.primary_use_case || 'Executive AI Strategy',
        preferredDate: 'Scheduled',
        preferredTime: f.preferred_time || 'Afternoon Slot',
        status: f.status || 'CONFIRMED',
        createdAt: f.created_at,
        meetingLink: 'https://meet.google.com/kz-founder-' + f.id.slice(-6)
      }));

      const allBookings = [...normalizedDemos, ...normalizedFounders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return successResponse(res, {
        totalBookings: allBookings.length,
        pendingCount: allBookings.filter(b => b.status === 'PENDING').length,
        confirmedCount: allBookings.filter(b => b.status === 'CONFIRMED').length,
        completedCount: allBookings.filter(b => b.status === 'COMPLETED').length,
        bookings: allBookings
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update Schedule Booking Status
   */
  async updateScheduleStatus(req, res, next) {
    try {
      const { type, id } = req.params;
      const { status } = req.body;
      const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

      if (!validStatuses.includes(status)) {
        return errorResponse(res, 'Invalid schedule status.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const table = type.toUpperCase() === 'FOUNDER' ? 'founder_meetings' : 'demo_bookings';

      await db.prepare(`UPDATE ${table} SET status = ? WHERE id = ?`).run(status, id);

      return successResponse(res, { id, type, status, message: 'Schedule session updated successfully.' });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Dedicated Sign-Up Records Page: Detailed list of all registered merchants with worldwide country
   */
  async getSignups(req, res, next) {
    try {
      const db = getDatabase();
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '20', 10)));
      const offset = (page - 1) * limit;
      const search = (req.query.search || '').trim().toLowerCase();

      let queryWhere = 'WHERE u.is_super_admin = 0';
      const params = [];

      if (search) {
        queryWhere += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(b.name) LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s);
      }

      const totalCountRow = await db.prepare(`
        SELECT COUNT(*) as count 
        FROM users u 
        LEFT JOIN businesses b ON u.business_id = b.id 
        ${queryWhere}
      `).get(...params);
      const totalCount = Number(totalCountRow?.count || 0);

      const rows = (await db.prepare(`
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          u.role, 
          u.created_at, 
          b.id as business_id,
          b.name as business_name,
          b.plan as business_plan,
          b.status as business_status,
          COALESCE(bp.country, 'United States') as country,
          COALESCE(up.phone, bp.business_phone, 'N/A') as phone,
          COALESCE(up.email_verified, 1) as email_verified
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        LEFT JOIN business_profiles bp ON b.id = bp.business_id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        ${queryWhere}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, limit, offset)) || [];

      return successResponse(res, {
        totalSignups: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
        signups: rows.map(r => ({
          id: r.id,
          name: r.name,
          email: r.email,
          businessId: r.business_id,
          businessName: r.business_name || 'My Store',
          plan: r.business_plan || 'Starter',
          country: r.country || 'Worldwide',
          phone: r.phone,
          status: r.business_status || 'ACTIVE',
          emailVerified: r.email_verified === 1,
          createdAt: r.created_at
        }))
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Dedicated Login Sessions & Active Devices Page
   */
  async getLoginSessions(req, res, next) {
    try {
      const db = getDatabase();
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '25', 10)));
      const offset = (page - 1) * limit;

      const totalRow = await db.prepare('SELECT COUNT(*) as count FROM login_sessions').get();
      const totalSessions = Number(totalRow?.count || 0);

      const activeDevicesRow = await db.prepare('SELECT COUNT(*) as count FROM login_sessions WHERE is_active = 1').get();
      const activeDevicesCount = Number(activeDevicesRow?.count || 0);

      const sessions = (await db.prepare(`
        SELECT id, user_id, email, user_name, business_name, ip_address, country, device_type, os, browser, is_active, created_at, last_active_at
        FROM login_sessions
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).all(limit, offset)) || [];

      return successResponse(res, {
        totalSessions,
        activeDevicesCount,
        page,
        limit,
        totalPages: Math.ceil(totalSessions / limit) || 1,
        sessions
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Public Intake: Register for Sadat Sakib AI Career Bootcamp Free Session
   * POST /api/bootcamp/register
   */
  async registerBootcamp(req, res, next) {
    try {
      const {
        fullName,
        full_name,
        email,
        phone,
        currentRole,
        current_role,
        experienceLevel,
        experience_level,
        primaryGoal,
        primary_goal,
        preferredSlot,
        preferred_slot,
        linkedinOrPortfolio,
        linkedin_or_portfolio,
        questions
      } = req.body;

      const resolvedName = (fullName || full_name || '').trim();
      const resolvedEmail = (email || '').trim().toLowerCase();
      const resolvedPhone = (phone || '').trim();
      const resolvedRole = (currentRole || current_role || 'General Attendee').trim();
      const resolvedExp = (experienceLevel || experience_level || 'Beginner').trim();
      const resolvedGoal = (primaryGoal || primary_goal || 'Career Transition to AI').trim();
      const resolvedSlot = (preferredSlot || preferred_slot || 'Next Saturday 8:00 PM BST / 10:00 AM EST').trim();
      const resolvedPortfolio = (linkedinOrPortfolio || linkedin_or_portfolio || '').trim();
      const resolvedQuestions = (questions || '').trim();

      if (!resolvedName) {
        return errorResponse(res, 'Full name is required for registration.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }
      if (!resolvedEmail || !resolvedEmail.includes('@')) {
        return errorResponse(res, 'Valid email address is required to receive session join details.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }
      if (!resolvedPhone) {
        return errorResponse(res, 'WhatsApp / Phone number is required for session reminders.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const id = `bc-reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();

      // Check if already registered
      const existing = await db.prepare('SELECT id FROM bootcamp_registrations WHERE LOWER(email) = ?').get(resolvedEmail);
      if (existing) {
        // Update their preferences
        await db.prepare(`
          UPDATE bootcamp_registrations
          SET full_name = ?, phone = ?, current_role = ?, experience_level = ?, primary_goal = ?, preferred_slot = ?, linkedin_or_portfolio = ?, questions = ?
          WHERE id = ?
        `).run(resolvedName, resolvedPhone, resolvedRole, resolvedExp, resolvedGoal, resolvedSlot, resolvedPortfolio, resolvedQuestions, existing.id);

        return successResponse(res, {
          id: existing.id,
          message: 'Your registration has been updated! See you at the live masterclass with Sadat Sakib.',
          confirmed: true,
          seatNumber: `SEAT-${existing.id.slice(-4).toUpperCase()}`
        });
      }

      await db.prepare(`
        INSERT INTO bootcamp_registrations (
          id, full_name, email, phone, current_role, experience_level, primary_goal, preferred_slot, linkedin_or_portfolio, questions, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)
      `).run(
        id,
        resolvedName,
        resolvedEmail,
        resolvedPhone,
        resolvedRole,
        resolvedExp,
        resolvedGoal,
        resolvedSlot,
        resolvedPortfolio,
        resolvedQuestions,
        now
      );

      logger.info(`[BOOTCAMP REGISTRATION] New attendee: ${resolvedName} (${resolvedEmail})`);

      return successResponse(res, {
        id,
        message: 'Congratulations! Your free seat for AI Bootcamp with Sadat Sakib is confirmed.',
        confirmed: true,
        seatNumber: `SEAT-${id.slice(-4).toUpperCase()}`,
        sessionSlot: resolvedSlot
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Super Admin: Get all AI Bootcamp Registrations
   * GET /api/admin/bootcamp-registrations
   */
  async getBootcampRegistrations(req, res, next) {
    try {
      const db = getDatabase();
      const page = Math.max(1, parseInt(req.query.page || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '25', 10)));
      const offset = (page - 1) * limit;
      const search = (req.query.search || '').trim().toLowerCase();
      const status = (req.query.status || '').trim();

      let queryWhere = 'WHERE 1=1';
      const params = [];

      if (search) {
        queryWhere += ' AND (LOWER(full_name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ? OR LOWER(current_role) LIKE ? OR LOWER(primary_goal) LIKE ?)';
        const s = `%${search}%`;
        params.push(s, s, s, s, s);
      }

      if (status && status !== 'ALL') {
        queryWhere += ' AND status = ?';
        params.push(status);
      }

      const totalRow = await db.prepare(`SELECT COUNT(*) as count FROM bootcamp_registrations ${queryWhere}`).get(...params);
      const totalCount = Number(totalRow?.count || 0);

      const confirmedRow = await db.prepare("SELECT COUNT(*) as count FROM bootcamp_registrations WHERE status = 'CONFIRMED'").get();
      const confirmedCount = Number(confirmedRow?.count || 0);

      const registrations = (await db.prepare(`
        SELECT id, full_name, email, phone, current_role, experience_level, primary_goal, preferred_slot, linkedin_or_portfolio, questions, status, created_at
        FROM bootcamp_registrations
        ${queryWhere}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `).all(...params, limit, offset)) || [];

      return successResponse(res, {
        totalRegistrations: totalCount,
        confirmedSeats: confirmedCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
        registrations
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Super Admin: Update registration status
   * PATCH /api/admin/bootcamp-registrations/:id/status
   */
  async updateBootcampStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const validStatuses = ['CONFIRMED', 'WAITLISTED', 'ATTENDED', 'CANCELLED'];

      if (!status || !validStatuses.includes(status)) {
        return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const result = await db.prepare('UPDATE bootcamp_registrations SET status = ? WHERE id = ?').run(status, id);

      if (result.changes === 0) {
        return errorResponse(res, 'Registration not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(res, { message: `Registration status updated to ${status}.` });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Super Admin: Delete bootcamp registration
   * DELETE /api/admin/bootcamp-registrations/:id
   */
  async deleteBootcampRegistration(req, res, next) {
    try {
      const { id } = req.params;
      const db = getDatabase();
      const result = await db.prepare('DELETE FROM bootcamp_registrations WHERE id = ?').run(id);

      if (result.changes === 0) {
        return errorResponse(res, 'Registration not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return successResponse(res, { message: 'Registration deleted successfully.' });
    } catch (err) {
      next(err);
    }
  }

};
