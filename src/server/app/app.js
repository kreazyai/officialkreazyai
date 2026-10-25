import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { config } from '../config/env.js';
import { getDatabase } from '../config/database.js';
import { apiRouter } from '../routes/apiRoutes.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// ─── Reverse-Proxy & Mobile Carrier Client IP Resolution ──────────────────────

/**
 * Safely resolves the true client IP across mobile networks, cellular data (CGNAT),
 * Cloudflare Tunnels, ngrok, and local/remote reverse proxies.
 * - Extracts Cloudflare 'cf-connecting-ip' (authenticated at Cloudflare edge).
 * - Extracts standard 'x-real-ip' and 'x-forwarded-for' (leftmost client IP).
 * - Falls back to Express req.ip and raw socket remoteAddress.
 * - Guarantees a non-empty string fallback ('127.0.0.1') so rate-limiters never key on undefined.
 */
export function getClientIp(req) {
  // 1. Cloudflare authenticated client IP header
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }

  // 2. Standard X-Real-IP reverse proxy header
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  // 3. X-Forwarded-For header (leftmost IP is the originating client)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  // 4. Express req.ip (when trust proxy is configured)
  if (req.ip) {
    return req.ip;
  }

  // 5. Raw socket remote address
  const remoteAddr = req.socket?.remoteAddress;
  if (remoteAddr) {
    return remoteAddr;
  }

  // 6. Resilient loopback fallback
  return '127.0.0.1';
}

/**
 * Resolves a safe rate-limiting key for the client.
 * For mobile networks / cellular data (CGNAT & IPv6):
 * 1. If user is authenticated (Bearer token or workspace header), rate-limit by user identity / workspace
 *    so multiple mobile devices sharing the same carrier IP/subnet are not throttled together.
 * 2. For IPv6, mask at /64 (3GPP cellular standard allocates a /64 per mobile device PDP context)
 *    rather than /56 (which incorrectly groups 256 mobile subscribers together).
 */
export function getRateLimitKey(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const tokenPart = authHeader.slice(7).trim();
    if (tokenPart.length >= 10) {
      return `auth_${tokenPart.slice(-16)}`;
    }
  }

  const clientIp = getClientIp(req);
  return ipKeyGenerator(clientIp, 64);
}

// ─── Rate Limiter Definitions ─────────────────────────────────────────────────

/** General API rate limit: 1000 requests / 15-minute window per IP / session */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getRateLimitKey(req),
  handler: (req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000) || 60;
    res.setHeader('Retry-After', String(retryAfter));
    res.status(options.statusCode || 429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests — please try again in a few minutes.',
        retryAfter
      }
    });
  },
  skip: (req) => {
    if (process.env.NODE_ENV === 'test') return true;
    const url = req.originalUrl || req.url || '';
    if (url === '/api/health' || url === '/api/health/db' || url.includes('/webhook')) return true;
    // Skip internal authenticated merchant telemetry & billing read APIs so normal dashboard browsing is never throttled
    if (
      url.includes('/api/v1/dashboard') ||
      url.includes('/dashboard/overview-metrics') ||
      url.includes('/api/v1/analytics') ||
      url.includes('/api/v1/revenue') ||
      url.includes('/api/v1/billing') ||
      url.includes('/api/v1/meta') ||
      url.includes('/api/meta')
    ) {
      return true;
    }
    return false;
  }
});

/** Strict limit for auth endpoints: 60 attempts / 15-minute window per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getRateLimitKey(req),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts — please wait a few minutes before trying again.'
    }
  }
});

/** Public lead intake: 30 submissions / 10-minute window per IP (prevents spam without blocking mobile users) */
const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getRateLimitKey(req),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many form submissions — please wait before submitting again.'
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────

export function createApp() {
  const app = express();

  // 0. Trust reverse proxy hops (Cloudflare Tunnel, ngrok, Docker, LAN reverse proxies)
  // Essential for mobile data connections arriving through tunnels or reverse proxies
  app.set('trust proxy', true);

  // 1. Security Headers via Helmet (OWASP A05:2021 hardening)
  // For REST API servers, disable HTML CSP to allow cross-origin mobile clients & webviews
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  }));

  // 2. Resilient CORS Configuration for Mobile Networks, Tunnels & Local Dev
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile native apps, curl, server-to-server webhooks)
      if (!origin) {
        return callback(null, true);
      }

      // Check configured origins and frontend URL
      if (config.corsOrigins.includes(origin) || origin === config.meta.frontendUrl) {
        return callback(null, true);
      }

      // Allow any localhost / loopback on any port
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow private LAN IPs on any port (for mobile hotspot or LAN testing: 192.168.x, 10.x, 172.16-31.x)
      if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow public development tunnels (Cloudflare Tunnel, ngrok, localtunnel)
      if (/^https?:\/\/.*(trycloudflare\.com|ngrok-free\.app|ngrok\.io|loca\.lt)$/.test(origin)) {
        return callback(null, true);
      }

      // Allow official KreazyAI production and preview domains
      if (/^https?:\/\/([a-z0-9-]+\.)*(kreazyai\.com|onrender\.com)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      logger.warn(`CORS rejected origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'x-hub-signature-256',
      'x-workspace-id',
      'X-Workspace-Id',
      'x-tenant-id',
      'X-Tenant-Id'
    ]
  }));

  // 3. Apply general rate limiter to all /api routes
  app.use('/api', generalLimiter);

  // 4. Request Parsers (capturing raw body for webhook HMAC validation)
  app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    }
  }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Request Logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.originalUrl !== '/api/health') {
        logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
      }
    });
    next();
  });

  // 6. Health Check Endpoints (Phase 1 Requirement)
  app.get('/api/health', async (req, res) => {
    let dbStatus = 'HEALTHY';
    let dbEngine = 'SQLite 3 (WAL Mode)';
    try {
      const db = getDatabase();
      dbEngine = db.isPostgres ? 'PostgreSQL (Neon Connection Pool)' : 'SQLite 3 (WAL Mode)';
      await db.prepare('SELECT 1').get();
    } catch {
      dbStatus = 'DEGRADED';
    }

    return successResponse(res, {
      status: 'UP',
      service: 'KreazyAI Production API Server',
      environment: config.nodeEnv,
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
      databaseEngine: dbEngine,
      nodeVersion: process.version,
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      }
    });
  });

  app.get('/api/health/db', async (req, res) => {
    try {
      const db = getDatabase();
      
      await db.prepare('SELECT 1').get();

      const countSql = db.isPostgres
        ? "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
        : "SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'";

      const countRow = await db.prepare(countSql).get();
      const tablesCount = Number(countRow?.count ?? 0);
    
      return successResponse(res, {
        status: 'CONNECTED',
        connected: true,
        databaseEngine: db.isPostgres ? 'PostgreSQL' : 'SQLite',
        tablesCount
      });
    } catch (err) {
      logger.error('[HEALTH/DB] Database check failed:', err.message);
      return errorResponse(res, 'Database unavailable.', 'DB_ERROR', HTTP_STATUS.SERVICE_UNAVAILABLE);
    }
  });

  // 7. Apply stricter rate limiters before mounting routers
  app.use('/api/v1/auth', authLimiter);
  app.use('/api/v1/public', leadLimiter);

  // 8. Versioned API Routes
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter); // Alias for convenience

  // 9. Static File Serving (public assets & audit reports)
  const publicDir = path.resolve(process.cwd(), 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
  }

  // 10. Direct Download Endpoint for Official Master Audit PDF
  const handlePdfDownload = (req, res) => {
    const candidates = [
      path.resolve(process.cwd(), 'KreazyAI_Full_Website_Audit_Report.pdf'),
      path.resolve(process.cwd(), 'public', 'KreazyAI_Full_Website_Audit_Report.pdf'),
      path.resolve(process.cwd(), 'KREAZYAI_FULL_PROJECT_AUDIT_REPORT.pdf'),
      path.resolve(process.cwd(), 'public', 'KREAZYAI_FULL_PROJECT_AUDIT_REPORT.pdf')
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="KreazyAI_Full_Website_Audit_Report.pdf"');
        return res.sendFile(filePath);
      }
    }
    return res.status(404).json({ success: false, error: 'Audit PDF not found on server' });
  };

  app.get('/download-audit-pdf', handlePdfDownload);
  app.get('/KreazyAI_Full_Website_Audit_Report.pdf', handlePdfDownload);
  app.get('/KREAZYAI_FULL_PROJECT_AUDIT_REPORT.pdf', handlePdfDownload);
  app.get('/api/v1/public/download-audit-pdf', handlePdfDownload);

  // 11. Catch-all Not Found & Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
