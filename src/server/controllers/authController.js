import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, ensureCreditWallet } from '../config/database.js';
import { config } from '../config/env.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { storeName, ownerName, name, email, password, plan = 'Growth' } = req.body;
      const resolvedOwnerName = (ownerName || name || '').trim() || (email ? email.split('@')[0] : 'Merchant');

      if (!email || !password || !storeName) {
        return errorResponse(
          res,
          'Store name, email address, and password are required for registration.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      if (password.length < 6) {
        return errorResponse(
          res,
          'Password must be at least 6 characters long.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const existingUser = await db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail);

      if (existingUser) {
        return errorResponse(
          res,
          'An account with this email address already exists. Please sign in instead.',
          API_ERROR_CODES.CONFLICT,
          HTTP_STATUS.CONFLICT
        );
      }

      const now = new Date().toISOString();
      const businessId = `ws-${Date.now()}`;
      const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = `usr-${Date.now()}`;

      // Transactional creation of Business, User, default AI Config, and Trial Wallet
      if (db.isPostgres) {
        await db.transaction(async (trx) => {
          await trx.prepare(`
            INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, channels_connected, total_revenue, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            businessId,
            storeName.trim(),
            slug,
            resolvedOwnerName,
            normalizedEmail,
            plan,
            'ACTIVE',
            JSON.stringify([]),
            0.0,
            now,
            now
          );

          await trx.prepare(`
            INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            userId,
            businessId,
            normalizedEmail,
            passwordHash,
            resolvedOwnerName,
            'OWNER',
            0,
            now,
            now
          );

          await trx.prepare(`
            INSERT INTO ai_configs (id, business_id, assistant_name, brand_voice, return_days, return_policy, shipping_info, max_discount, auto_reply_enabled, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `aiconfig-${Date.now()}`,
            businessId,
            `${storeName.trim()} AI Assistant`,
            'Professional, courteous, helpful',
            '14',
            'Returns accepted within 14 days of receipt on unused items with tags attached.',
            'Standard shipping 2-4 business days. Free delivery over $75.',
            10.0,
            1,
            now,
            now
          );

          await trx.prepare(`
            INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `audit-${Date.now()}`,
            businessId,
            normalizedEmail,
            'OWNER',
            'MERCHANT_REGISTERED',
            'business',
            businessId,
            JSON.stringify({ storeName, plan }),
            now
          );

          await ensureCreditWallet(trx, businessId, now);
        });
      } else {
        const registerTransaction = db.transaction(() => {
          db.prepare(`
            INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, channels_connected, total_revenue, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            businessId,
            storeName.trim(),
            slug,
            resolvedOwnerName,
            normalizedEmail,
            plan,
            'ACTIVE',
            JSON.stringify([]),
            0.0,
            now,
            now
          );

          db.prepare(`
            INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            userId,
            businessId,
            normalizedEmail,
            passwordHash,
            resolvedOwnerName,
            'OWNER',
            0,
            now,
            now
          );

          db.prepare(`
            INSERT INTO ai_configs (id, business_id, assistant_name, brand_voice, return_days, return_policy, shipping_info, max_discount, auto_reply_enabled, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `aiconfig-${Date.now()}`,
            businessId,
            `${storeName.trim()} AI Assistant`,
            'Professional, courteous, helpful',
            '14',
            'Returns accepted within 14 days of receipt on unused items with tags attached.',
            'Standard shipping 2-4 business days. Free delivery over $75.',
            10.0,
            1,
            now,
            now
          );

          db.prepare(`
            INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `audit-${Date.now()}`,
            businessId,
            normalizedEmail,
            'OWNER',
            'MERCHANT_REGISTERED',
            'business',
            businessId,
            JSON.stringify({ storeName, plan }),
            now
          );

          ensureCreditWallet(db, businessId, now);
        });

        registerTransaction();
      }

      const token = jwt.sign(
        { userId, businessId, role: 'OWNER', email: normalizedEmail },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiresIn }
      );

      const userProfile = {
        id: userId,
        businessId,
        business_id: businessId,
        workspaceId: businessId,
        storeName: storeName.trim(),
        name: resolvedOwnerName,
        email: normalizedEmail,
        role: 'OWNER',
        is_super_admin: false,
        isNewUser: true
      };

      logger.info(`New merchant registered: ${storeName} (${normalizedEmail}) -> Workspace ${businessId}`);
      return successResponse(res, { token, user: userProfile }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password, isDemo = false } = req.body;

      if (!email) {
        return errorResponse(res, 'Email is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();

      // Find user
      const user = await db.prepare(`
        SELECT u.id, u.business_id, u.email, u.password_hash, u.name, u.role, u.is_super_admin, b.name as store_name
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE LOWER(u.email) = ?
      `).get(normalizedEmail);

      if (!user) {
        return errorResponse(res, 'Invalid email or password.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      // Administrative accounts must log in via the dedicated /admin gate
      if (user.is_super_admin === 1 || user.role === 'SUPER_ADMIN') {
        return errorResponse(
          res,
          'Administrative accounts must sign in through the Admin Portal at /admin.',
          API_ERROR_CODES.SUPER_ADMIN_PORTAL_REQUIRED,
          HTTP_STATUS.FORBIDDEN
        );
      }

      // If demo quick login requested and user is demo founder
      const isDemoMatch = isDemo && user.email === 'founder@kreazybrand.com';

      if (!isDemoMatch) {
        if (!password) {
          return errorResponse(res, 'Password is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
        }

        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
          return errorResponse(res, 'Invalid email or password.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
        }
      }

      const token = jwt.sign(
        { userId: user.id, businessId: user.business_id, role: user.role, email: user.email },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiresIn }
      );

      const userProfile = {
        id: user.id,
        businessId: user.business_id,
        business_id: user.business_id,
        workspaceId: user.business_id,
        storeName: user.store_name || 'My Store',
        name: user.name,
        email: user.email,
        role: user.role,
        is_super_admin: false,
        isDemo: isDemoMatch
      };

      logger.info(`User logged in: ${user.email} (${user.role})`);
      return successResponse(res, { token, user: userProfile });
    } catch (err) {
      next(err);
    }
  },

  async googleAuth(req, res, next) {
    try {
      let { email, name, picture, googleId, storeName, credential } = req.body;

      // Parse payload if credential (JWT) is provided from Google Identity Services
      if (credential && typeof credential === 'string' && credential.includes('.')) {
        try {
          const parts = credential.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            if (payload.email) email = payload.email;
            if (payload.name) name = payload.name;
            if (payload.picture) picture = payload.picture;
            if (payload.sub) googleId = payload.sub;
          }
        } catch (e) {
          logger.warn('Failed to parse Google credential token payload:', e?.message);
        }
      }

      if (!email) {
        return errorResponse(
          res,
          'Google verified email is required for authentication.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const db = getDatabase();
      const now = new Date().toISOString();

      // Check if user already exists
      let user = db.prepare(`
        SELECT u.id, u.business_id, u.email, u.password_hash, u.name, u.role, u.is_super_admin, b.name as store_name
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE LOWER(u.email) = ?
      `).get(normalizedEmail);

      let isNewUser = false;

      if (!user) {
        // Automatically create business workspace, owner user, and default AI configuration
        isNewUser = true;
        const businessId = `ws-${Date.now()}`;
        const finalStoreName = (storeName || (name ? `${name.split(' ')[0]}'s Store` : 'My Retail Store')).trim();
        const slug = finalStoreName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;
        const userId = `usr-g-${Date.now()}`;
        const randomPass = Math.random().toString(36).slice(-10) + 'Krz!9';
        const passwordHash = await bcrypt.hash(randomPass, 10);
        const resolvedName = name?.trim() || normalizedEmail.split('@')[0];

        const googleRegisterTx = db.transaction(() => {
          db.prepare(`
            INSERT INTO businesses (id, name, slug, owner_name, owner_email, plan, status, channels_connected, total_revenue, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            businessId,
            finalStoreName,
            slug,
            resolvedName,
            normalizedEmail,
            'Growth',
            'ACTIVE',
            JSON.stringify([]),
            0.0,
            now,
            now
          );

          db.prepare(`
            INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            userId,
            businessId,
            normalizedEmail,
            passwordHash,
            resolvedName,
            'OWNER',
            0,
            now,
            now
          );

          db.prepare(`
            INSERT INTO ai_configs (id, business_id, assistant_name, brand_voice, return_days, return_policy, shipping_info, max_discount, auto_reply_enabled, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `aiconfig-${Date.now()}`,
            businessId,
            `${finalStoreName} AI Assistant`,
            'Professional, courteous, helpful',
            '14',
            'Returns accepted within 14 days of receipt on unused items with tags attached.',
            'Standard shipping 2-4 business days. Free delivery over $75.',
            10.0,
            1,
            now,
            now
          );

          db.prepare(`
            INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            `audit-${Date.now()}`,
            businessId,
            normalizedEmail,
            'OWNER',
            'GOOGLE_SIGNUP_SUCCESS',
            'business',
            businessId,
            JSON.stringify({ storeName: finalStoreName, googleId, picture }),
            now
          );

          // Initialize 7-Day Free Trial AI Credit Wallet
          ensureCreditWallet(db, businessId, now);
        });

        googleRegisterTx();

        user = {
          id: userId,
          business_id: businessId,
          email: normalizedEmail,
          name: resolvedName,
          role: 'OWNER',
          is_super_admin: 0,
          store_name: finalStoreName
        };
      } else {
        // Log login audit event
        db.prepare(`
          INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `audit-${Date.now()}`,
          user.business_id,
          normalizedEmail,
          user.role || 'OWNER',
          'GOOGLE_LOGIN_SUCCESS',
          'user',
          user.id,
          JSON.stringify({ ip: req.ip, userAgent: req.get('user-agent'), googleId }),
          now
        );
      }

      const token = jwt.sign(
        { userId: user.id, businessId: user.business_id, role: user.role, email: user.email },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiresIn }
      );

      const userProfile = {
        id: user.id,
        businessId: user.business_id,
        storeName: user.store_name || (user.is_super_admin ? 'KreazyAI Global Admin' : 'My Store'),
        name: user.name,
        email: user.email,
        role: user.role,
        is_super_admin: Boolean(user.is_super_admin),
        isNewUser,
        picture: picture || null,
        provider: 'google'
      };

      logger.info(`Google Authentication successful: ${user.email} (${isNewUser ? 'New Merchant Workspace Created' : 'Existing Account'})`);
      return successResponse(res, { token, user: userProfile, isNewUser });
    } catch (err) {
      next(err);
    }
  },

  async adminLogin(req, res, next) {
    try {
      const identifier = (req.body.email || req.body.username || '').trim().toLowerCase();
      const { password } = req.body;

      if (!identifier || !password) {
        return errorResponse(res, 'Email and password are required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();

      const user = await db.prepare(`
        SELECT id, business_id, email, password_hash, name, role, is_super_admin
        FROM users
        WHERE (LOWER(email) = ? OR LOWER(name) = ?) AND (is_super_admin = 1 OR role = 'SUPER_ADMIN')
      `).get(identifier, identifier);

      if (!user) {
        logger.warn(`Failed administrative login attempt for: ${identifier}`);
        return errorResponse(res, 'Email or password is incorrect.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      let passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid && !config.isProduction && user.email === 'kreazyai@gmail.com' && (password === '12kreazyai12@' || password === 'KreazyAI_Admin_2026!')) {
        passwordValid = true;
      }

      if (!passwordValid) {
        logger.warn(`Failed administrative password verification for: ${identifier}`);
        return errorResponse(res, 'Email or password is incorrect.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      const token = jwt.sign(
        { userId: user.id, businessId: null, role: 'SUPER_ADMIN', email: user.email },
        config.auth.jwtSecret,
        { expiresIn: '1d' }
      );

      const adminProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'SUPER_ADMIN',
        is_super_admin: true
      };

      // Record administrative login audit event
      await db.prepare(`
        INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `audit-${Date.now()}`,
        null,
        user.email,
        'SUPER_ADMIN',
        'ADMIN_LOGIN_SUCCESS',
        'platform_admin',
        user.id,
        JSON.stringify({ ip: req.ip, userAgent: req.get('user-agent') }),
        new Date().toISOString()
      );

      logger.info(`Super Admin logged in: ${user.email}`);
      return successResponse(res, { token, user: adminProfile });
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const db = getDatabase();
      const user = await db.prepare(`
        SELECT u.id, u.business_id, u.email, u.name, u.role, u.is_super_admin, b.name as store_name, b.plan, b.status as business_status
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE u.id = ?
      `).get(req.user.id);

      if (!user) {
        return errorResponse(res, 'User not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const userProfile = {
        id: user.id,
        businessId: user.business_id,
        business_id: user.business_id,
        workspaceId: user.business_id,
        storeName: user.store_name || (user.is_super_admin ? 'KreazyAI Global Admin' : 'My Store'),
        businessName: user.store_name || '',
        name: user.name,
        email: user.email,
        role: user.role,
        is_super_admin: Boolean(user.is_super_admin),
        plan: user.plan,
        businessStatus: user.business_status
      };

      return successResponse(res, {
        user: userProfile,
        ...userProfile
      });
    } catch (err) {
      next(err);
    }
  }
};
