import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { getDatabase } from '../config/database.js';
import { apiRouter } from '../routes/apiRoutes.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

// ─── Rate Limiter Definitions ─────────────────────────────────────────────────

/** General API rate limit: 100 requests / 15-minute window per IP */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests — please try again in a few minutes.'
    }
  },
  skip: (req) => req.originalUrl === '/api/health' || req.originalUrl === '/api/health/db'
});

/** Strict limit for auth endpoints: 10 attempts / 15-minute window per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts — please wait 15 minutes before trying again.'
    }
  }
});

/** Public lead intake: 5 submissions / 10-minute window per IP (prevents spam) */
const leadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
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

  // 1. Security Headers via Helmet (OWASP A05:2021 hardening)
  app.use(helmet({
    // Allow cross-origin resource loading needed for fonts and static assets
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Content Security Policy — configured for SPA with API
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Vite injects inline scripts
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'", 'https://generativelanguage.googleapis.com', 'https://api.openai.com', 'https://graph.facebook.com'],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"]
      }
    }
  }));

  // 2. CORS Configuration
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin || config.corsOrigins.includes(origin) || config.isDev) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked request from origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-hub-signature-256']
  }));

  // 3. Apply general rate limiter to all /api routes
  app.use('/api', generalLimiter);

  // 4. Request Parsers
  app.use(express.json({ limit: '10mb' }));
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
  app.get('/api/health', (req, res) => {
    let dbStatus = 'HEALTHY';
    try {
      const db = getDatabase();
      db.prepare('SELECT 1').get();
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
      nodeVersion: process.version,
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
      }
    });
  });

  app.get('/api/health/db', (req, res) => {
    try {
      const db = getDatabase();
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      return successResponse(res, {
        status: 'CONNECTED',
        tablesCount: tables.length,
        tables: tables.map(t => t.name)
      });
    } catch (err) {
      return errorResponse(res, `Database unhealthy: ${err.message}`, 'DB_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  });

  // 7. Apply stricter rate limiters before mounting routers
  app.use('/api/v1/auth', authLimiter);
  app.use('/api/v1/public', leadLimiter);

  // 8. Versioned API Routes
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter); // Alias for convenience

  // 9. Catch-all Not Found & Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
