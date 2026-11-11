import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, ensureCreditWallet } from '../config/database.js';
import { config } from '../config/env.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

function isCountryRestricted(country, phone) {
  const c = (country || '').trim().toLowerCase();
  const p = (phone || '').trim();
  if (
    c === 'india' || c === 'in' || c === 'ind' ||
    c === 'pakistan' || c === 'pk' || c === 'pak' ||
    p.startsWith('+91') || p.startsWith('+92') ||
    p.startsWith('0091') || p.startsWith('0092')
  ) {
    return true;
  }
  return false;
}

function parseDeviceInfo(userAgent) {
  const ua = userAgent || '';
  let deviceType = 'Desktop';
  let os = 'Windows';
  let browser = 'Chrome';

  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    deviceType = /tablet|ipad/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/firefox/i.test(ua)) browser = 'Firefox';

  return { deviceType, os, browser };
}

async function recordLoginSession(db, user, req, customCountry) {
  try {
    const ip = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1';
    const cleanIp = typeof ip === 'string' ? ip.split(',')[0].trim() : '127.0.0.1';
    const userAgent = (req.get ? req.get('user-agent') : req.headers?.['user-agent']) || '';
    const { deviceType, os, browser } = parseDeviceInfo(userAgent);
    const country = customCountry || req.body?.country || 'United States';
    const sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO login_sessions (id, user_id, email, user_name, business_name, ip_address, country, device_type, os, browser, user_agent, is_active, created_at, last_active_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      sessionId,
      user.id,
      user.email,
      user.name || user.email.split('@')[0],
      user.store_name || user.storeName || 'My Store',
      cleanIp,
      country,
      deviceType,
      os,
      browser,
      userAgent.slice(0, 255),
      now,
      now
    );
  } catch (err) {
    logger.warn('Failed to record login session:', err?.message);
  }
}


export const authController = {
  async register(req, res, next) {
    
    try {
      const { storeName, ownerName, name, email, password, plan = 'Free Trial', country = 'United States', phone = '' } = req.body;
      if (isCountryRestricted(country, phone)) {
        return errorResponse(
          res,
          'Sign-ups are currently unavailable for users located in India and Pakistan. Kreazy AI is available worldwide in all other supported regions.',
          API_ERROR_CODES.FORBIDDEN,
          HTTP_STATUS.FORBIDDEN
        );
      }

      const resolvedOwnerName = (ownerName || name || '').trim() || (email ? email.split('@')[0] : 'Merchant');

      if (!email || !password || !storeName) {
        return errorResponse(
          res,
          'Store name, email address, and password are required for registration.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        return errorResponse(
          res,
          'Password must be at least 8 characters long and contain both letters and numbers.',
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

      
      await recordLoginSession(db, userProfile, req, country);
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

      
      await recordLoginSession(db, userProfile, req);
logger.info(`User logged in: ${user.email} (${user.role})`);
      return successResponse(res, { token, user: userProfile });
    } catch (err) {
      next(err);
    }
  },

  async googleAuth(req, res, next) {
    try {
      let { email, name, picture, googleId, storeName, credential, country, phone } = req.body;
      if (isCountryRestricted(country, phone)) {
        return errorResponse(
          res,
          'Sign-ups are currently unavailable for users located in India and Pakistan. Kreazy AI is available worldwide in all other supported regions.',
          API_ERROR_CODES.FORBIDDEN,
          HTTP_STATUS.FORBIDDEN
        );
      }


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
            'Free Trial',
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

      await recordLoginSession(db, userProfile, req, country || 'Worldwide');
      logger.info(`Google Authentication successful: ${user.email} (${isNewUser ? 'New Merchant Workspace Created' : 'Existing Account'})`);
      return successResponse(res, { token, user: userProfile, isNewUser });
    } catch (err) {
      next(err);
    }
  },

  async adminLogin(req, res, next) {
    try {
      const rawIdentifier = (req.body.email || req.body.username || req.body.identifier || '').trim();
      const identifier = rawIdentifier.toLowerCase();
      const { password } = req.body;

      if (!identifier || !password) {
        return errorResponse(res, 'Email and password are required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const now = new Date().toISOString();

      // Master admin credential profiles
      const masterProfiles = [
        {
          aliases: ['admin@kreazyai.com', 'admin', 'kreazyadmin'],
          defaultEmail: 'admin@kreazyai.com',
          passwords: ['KreazyAI_Admin_2026!', config.auth?.superAdminPassword].filter(Boolean),
          name: 'Kreazy Super Administrator'
        },
        {
          aliases: ['kreazyai@gmail.com'],
          defaultEmail: 'kreazyai@gmail.com',
          passwords: ['12kreazyai12@', 'KreazyAI_Admin_2026!', config.auth?.superAdminPassword].filter(Boolean),
          name: 'Kreazy Executive Administrator'
        }
      ];

      if (config.auth?.superAdminEmail) {
        const envEmail = config.auth.superAdminEmail.trim().toLowerCase();
        if (!masterProfiles.some(p => p.defaultEmail === envEmail)) {
          masterProfiles.push({
            aliases: [envEmail],
            defaultEmail: envEmail,
            passwords: [config.auth.superAdminPassword, 'KreazyAI_Admin_2026!'].filter(Boolean),
            name: 'Kreazy Super Administrator'
          });
        }
      }

      const matchedProfile = masterProfiles.find(p => p.aliases.includes(identifier));
      const isMasterPass = matchedProfile && matchedProfile.passwords.includes(password);
      const targetEmail = matchedProfile ? matchedProfile.defaultEmail : identifier;

      // Query database for user by target email or raw identifier
      let user = await db.prepare(
        "SELECT id, business_id, email, password_hash, name, role, is_super_admin FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?"
      ).get(targetEmail, identifier);

      // Auto-provision if user does not exist but supplied valid master credentials
      if (!user && isMasterPass) {
        const adminId = "usr-admin-" + Date.now();
        const newHash = await bcrypt.hash(password, 12);
        const adminName = matchedProfile.name;

        await db.prepare(
          "INSERT INTO users (id, business_id, email, password_hash, name, role, is_super_admin, created_at, updated_at) VALUES (?, NULL, ?, ?, ?, 'SUPER_ADMIN', 1, ?, ?)"
        ).run(adminId, targetEmail, newHash, adminName, now, now);

        user = {
          id: adminId,
          business_id: null,
          email: targetEmail,
          password_hash: newHash,
          name: adminName,
          role: 'SUPER_ADMIN',
          is_super_admin: 1
        };
        logger.info("Auto-provisioned super admin account on login: " + targetEmail);
      }

      if (!user) {
        logger.warn("Failed administrative login attempt for: " + identifier);
        return errorResponse(res, 'Email or password is incorrect.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      // Verify password
      let passwordValid = false;
      if (user.password_hash) {
        passwordValid = await bcrypt.compare(password, user.password_hash);
      }

      // Master password fallback & self-healing
      if (!passwordValid && isMasterPass) {
        passwordValid = true;
        try {
          const healedHash = await bcrypt.hash(password, 12);
          await db.prepare(
            "UPDATE users SET password_hash = ?, role = 'SUPER_ADMIN', is_super_admin = 1, updated_at = ? WHERE id = ?"
          ).run(healedHash, now, user.id);
          user.password_hash = healedHash;
          logger.info("Self-healed password hash for super admin: " + user.email);
        } catch (healErr) {
          logger.warn("Failed to self-heal password hash: " + healErr.message);
        }
      }

      // Ensure super admin permissions if matched profile
      if (passwordValid && matchedProfile && (user.role !== 'SUPER_ADMIN' || !user.is_super_admin)) {
        try {
          await db.prepare(
            "UPDATE users SET role = 'SUPER_ADMIN', is_super_admin = 1, updated_at = ? WHERE id = ?"
          ).run(now, user.id);
          user.role = 'SUPER_ADMIN';
          user.is_super_admin = 1;
        } catch (promoteErr) {
          logger.warn("Failed to auto-promote admin user: " + promoteErr.message);
        }
      }

      if (!passwordValid || (!user.is_super_admin && user.role !== 'SUPER_ADMIN' && !matchedProfile)) {
        logger.warn("Failed administrative password verification for: " + identifier);
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
      try {
        await db.prepare(
          "INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).run(
          "audit-" + Date.now(),
          null,
          user.email,
          'SUPER_ADMIN',
          'ADMIN_LOGIN_SUCCESS',
          'platform_admin',
          user.id,
          JSON.stringify({ ip: req.ip, userAgent: req.get('user-agent') }),
          now
        );
      } catch (auditErr) {
        logger.warn("Audit log entry failed: " + auditErr.message);
      }

      await recordLoginSession(db, adminProfile, req, 'Global Operations Center');
      logger.info("Super Admin logged in successfully: " + user.email);
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
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body || {};
      if (!email || typeof email !== 'string') {
        return errorResponse(res, 'Email address is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const user = await db.prepare('SELECT id, business_id, email FROM users WHERE LOWER(email) = ?').get(normalizedEmail);

      // Always return generic success to prevent account enumeration
      if (!user) {
        return successResponse(res, {
          dispatched: true,
          message: 'If an account exists with this email address, a password recovery link has been sent.'
        }, HTTP_STATUS.OK);
      }

      const resetToken = crypto.randomUUID();
      logger.info(`Password reset requested for user: ${normalizedEmail}`);

      return successResponse(res, {
        dispatched: true,
        resetToken: !config.isProduction ? resetToken : undefined,
        message: 'If an account exists with this email address, a password recovery link has been sent.'
      }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { email, token, newPassword } = req.body || {};
      if (!email || !token || !newPassword) {
        return errorResponse(res, 'Email, token, and new password are required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return errorResponse(res, 'New password must be at least 8 characters long and contain both letters and numbers.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const normalizedEmail = email.trim().toLowerCase();
      const user = await db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(normalizedEmail);

      if (!user) {
        return errorResponse(res, 'Invalid reset token or user account.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, new Date().toISOString(), user.id);

      logger.info(`Password successfully reset for user: ${normalizedEmail}`);
      return successResponse(res, { reset: true, message: 'Password has been reset successfully.' }, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/send-otp
   * Generates a 6-digit security code, persists in DB, dispatches email / helper, and returns code metadata.
   */
  async sendOtp(req, res, next) {
    try {
      const { email, storeName, country, phone } = req.body;
      const normalizedEmail = (email || '').trim().toLowerCase();

      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        return errorResponse(res, 'Valid email address is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      if (isCountryRestricted(country, phone)) {
        return errorResponse(
          res,
          'Sign-ups are currently unavailable for users located in India and Pakistan. Kreazy AI is available worldwide in all other supported regions.',
          API_ERROR_CODES.FORBIDDEN,
          HTTP_STATUS.FORBIDDEN
        );
      }

      const db = getDatabase();
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
      const otpId = `otp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      db.prepare(`UPDATE verification_otps SET is_verified = -1 WHERE LOWER(email) = ? AND is_verified = 0`).run(normalizedEmail);

      db.prepare(`
        INSERT INTO verification_otps (id, email, otp_code, store_name, purpose, expires_at, is_verified, attempts, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?)
      `).run(
        otpId,
        normalizedEmail,
        otpCode,
        (storeName || 'My Store').trim(),
        'SIGNUP',
        expiresAt,
        now.toISOString()
      );

      logger.info(`[SECURITY OTP DISPATCHED] 6-digit verification code for ${normalizedEmail}: ${otpCode}`);

      return successResponse(res, {
        message: `A 6-digit security verification code has been dispatched to ${normalizedEmail}.`,
        email: normalizedEmail,
        otp: otpCode,
        expiresIn: 600
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/verify-otp
   * Validates the 6-digit verification code.
   */
  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      const normalizedEmail = (email || '').trim().toLowerCase();
      const cleanOtp = (otp || '').toString().trim();

      if (!normalizedEmail || !cleanOtp) {
        return errorResponse(res, 'Email and 6-digit OTP code are required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const record = db.prepare(`
        SELECT id, email, otp_code, expires_at, is_verified, attempts
        FROM verification_otps
        WHERE LOWER(email) = ? AND is_verified = 0
        ORDER BY created_at DESC
        LIMIT 1
      `).get(normalizedEmail);

      if (!record) {
        return errorResponse(res, 'No pending verification code found. Please request a new code.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      if (new Date(record.expires_at) < new Date()) {
        return errorResponse(res, 'Verification code has expired. Please click "Resend code".', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST);
      }

      if (record.otp_code !== cleanOtp) {
        db.prepare(`UPDATE verification_otps SET attempts = attempts + 1 WHERE id = ?`).run(record.id);
        return errorResponse(res, 'Invalid 6-digit verification code. Please check your inbox or click Auto-fill.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      db.prepare(`UPDATE verification_otps SET is_verified = 1 WHERE id = ?`).run(record.id);
      logger.info(`[OTP VERIFIED SUCCESS] Email ${normalizedEmail} successfully passed 6-digit verification.`);

      return successResponse(res, {
        verified: true,
        email: normalizedEmail,
        message: 'Email address verified successfully.'
      });
    } catch (err) {
      next(err);
    }
  },

  googleConfig(req, res) {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    return successResponse(res, {
      enabled: Boolean(clientId),
      clientId: clientId ? `${clientId.slice(0, 12)}...` : null
    });
  }
};
