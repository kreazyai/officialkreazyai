import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Helper: log to audit_logs ──────────────────────────────────────────────
function auditLog(db, businessId, actorEmail, action, resource, resourceId, details = {}) {
  try {
    db.prepare(`
      INSERT INTO audit_logs (id, business_id, actor_email, actor_role, action, resource, resource_id, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      businessId,
      actorEmail,
      'OWNER',
      action,
      resource,
      resourceId,
      JSON.stringify(details),
      new Date().toISOString()
    );
  } catch (err) {
    logger.warn(`Audit log write failed: ${err.message}`);
  }
}

// ─── Helper: get or create user_profile row ──────────────────────────────────
function getOrCreateUserProfile(db, userId) {
  let profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
  if (!profile) {
    const id = `up-${userId}`;
    db.prepare(`
      INSERT INTO user_profiles (id, user_id, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `).run(id, userId);
    profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId);
  }
  return profile;
}

// ─── Helper: get or create business_profile row ───────────────────────────────
function getOrCreateBusinessProfile(db, businessId) {
  let bp = db.prepare('SELECT * FROM business_profiles WHERE business_id = ?').get(businessId);
  if (!bp) {
    const id = `bp-${businessId}`;
    db.prepare(`
      INSERT INTO business_profiles (id, business_id, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `).run(id, businessId);
    bp = db.prepare('SELECT * FROM business_profiles WHERE business_id = ?').get(businessId);
  }
  return bp;
}

// ─── Helper: get or create kyc_profile row ────────────────────────────────────
function getOrCreateKycProfile(db, businessId) {
  let kyc = db.prepare('SELECT * FROM kyc_profiles WHERE business_id = ?').get(businessId);
  if (!kyc) {
    const id = `kyc-${businessId}`;
    db.prepare(`
      INSERT INTO kyc_profiles (id, business_id, status, step_completed, created_at, updated_at)
      VALUES (?, ?, 'NOT_STARTED', 0, datetime('now'), datetime('now'))
    `).run(id, businessId);
    kyc = db.prepare('SELECT * FROM kyc_profiles WHERE business_id = ?').get(businessId);
  }
  return kyc;
}

export const settingsController = {

  // ── GET /api/settings/profile ─────────────────────────────────────────────
  async getProfile(req, res, next) {
    try {
      const db = getDatabase();
      const user = db.prepare(`
        SELECT u.id, u.email, u.name, u.role, u.created_at,
               b.name as store_name, b.plan, b.status as business_status
        FROM users u
        LEFT JOIN businesses b ON u.business_id = b.id
        WHERE u.id = ?
      `).get(req.user.id);

      if (!user) {
        return errorResponse(res, 'User not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const profile = getOrCreateUserProfile(db, req.user.id);

      return successResponse(res, {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeName: user.store_name,
        plan: user.plan,
        businessStatus: user.business_status,
        memberSince: user.created_at,
        // Extended profile fields
        displayName: profile.display_name || user.name,
        phone: profile.phone || '',
        dateOfBirth: profile.date_of_birth || '',
        gender: profile.gender || '',
        avatarUrl: profile.avatar_url || null,
        emailVerified: Boolean(profile.email_verified),
        phoneVerified: Boolean(profile.phone_verified),
        lastPasswordChanged: profile.last_password_changed || null,
      });
    } catch (err) { next(err); }
  },

  // ── PATCH /api/settings/profile ───────────────────────────────────────────
  async updateProfile(req, res, next) {
    try {
      const { name, displayName, phone, dateOfBirth, gender } = req.body;
      const db = getDatabase();
      const now = new Date().toISOString();

      // Validate phone if provided
      if (phone && !/^\+?[\d\s\-().]{7,20}$/.test(phone)) {
        return errorResponse(res, 'Invalid phone number format.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      // Update core user name if provided
      if (name && name.trim().length >= 2) {
        db.prepare('UPDATE users SET name = ?, updated_at = ? WHERE id = ?')
          .run(name.trim(), now, req.user.id);
      }

      // Upsert user_profile
      getOrCreateUserProfile(db, req.user.id);
      db.prepare(`
        UPDATE user_profiles
        SET display_name = ?, phone = ?, date_of_birth = ?, gender = ?, updated_at = ?
        WHERE user_id = ?
      `).run(
        displayName?.trim() || name?.trim() || null,
        phone?.trim() || null,
        dateOfBirth || null,
        gender || null,
        now,
        req.user.id
      );

      auditLog(db, req.businessId, req.user.email, 'PROFILE_UPDATED', 'user', req.user.id, { fields: Object.keys(req.body) });

      return successResponse(res, { message: 'Profile updated successfully.' });
    } catch (err) { next(err); }
  },

  // ── PATCH /api/settings/password ──────────────────────────────────────────
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Current password and new password are required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }
      if (newPassword.length < 8) {
        return errorResponse(res, 'New password must be at least 8 characters.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return errorResponse(res, 'Current password is incorrect.', API_ERROR_CODES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      const now = new Date().toISOString();
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(newHash, now, req.user.id);

      // Record password change time
      getOrCreateUserProfile(db, req.user.id);
      db.prepare('UPDATE user_profiles SET last_password_changed = ?, updated_at = ? WHERE user_id = ?').run(now, now, req.user.id);

      auditLog(db, req.businessId, req.user.email, 'PASSWORD_CHANGED', 'user', req.user.id, {});

      return successResponse(res, { message: 'Password changed successfully.' });
    } catch (err) { next(err); }
  },

  // ── POST /api/settings/avatar ─────────────────────────────────────────────
  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No image file uploaded.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const now = new Date().toISOString();

      // Store the relative path; serve via authenticated endpoint
      const avatarUrl = `/api/settings/avatar/${req.user.id}/${req.file.filename}`;

      getOrCreateUserProfile(db, req.user.id);
      db.prepare('UPDATE user_profiles SET avatar_path = ?, avatar_url = ?, updated_at = ? WHERE user_id = ?')
        .run(req.file.path, avatarUrl, now, req.user.id);

      auditLog(db, req.businessId, req.user.email, 'AVATAR_UPLOADED', 'user', req.user.id, { filename: req.file.filename });

      return successResponse(res, { avatarUrl, message: 'Profile photo updated.' });
    } catch (err) { next(err); }
  },

  // ── DELETE /api/settings/avatar ───────────────────────────────────────────
  async removeAvatar(req, res, next) {
    try {
      const db = getDatabase();
      const profile = db.prepare('SELECT avatar_path FROM user_profiles WHERE user_id = ?').get(req.user.id);

      if (profile?.avatar_path) {
        try {
          const fs = await import('fs');
          if (fs.existsSync(profile.avatar_path)) {
            fs.unlinkSync(profile.avatar_path);
          }
        } catch { /* file may already be gone */ }
      }

      db.prepare('UPDATE user_profiles SET avatar_path = NULL, avatar_url = NULL, updated_at = ? WHERE user_id = ?')
        .run(new Date().toISOString(), req.user.id);

      auditLog(db, req.businessId, req.user.email, 'AVATAR_REMOVED', 'user', req.user.id, {});

      return successResponse(res, { avatarUrl: null, message: 'Profile photo removed.' });
    } catch (err) { next(err); }
  },

  // ── GET /api/settings/avatar/:userId/:filename ─────────────────────────────
  async viewAvatar(req, res, next) {
    try {
      const filename = req.params.filename || req.params.file;
      if (!filename) {
        return errorResponse(res, 'Avatar filename required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.BAD_REQUEST);
      }
      const safeFilename = path.basename(filename);
      const fs = await import('fs');
      const avatarPath = path.resolve(__dirname, '../../../data/uploads/avatars', safeFilename);
      if (!fs.existsSync(avatarPath)) {
        return errorResponse(res, 'Avatar image not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      const ext = path.extname(safeFilename).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp'
      };
      res.setHeader('Content-Type', mimeTypes[ext] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      fs.createReadStream(avatarPath).pipe(res);
    } catch (err) { next(err); }
  },

  // ── GET /api/settings/business ────────────────────────────────────────────
  async getBusinessProfile(req, res, next) {
    try {
      const db = getDatabase();

      const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.businessId);
      if (!business) {
        return errorResponse(res, 'Business not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const bp = getOrCreateBusinessProfile(db, req.businessId);

      return successResponse(res, {
        // Core workspace fields
        id: business.id,
        name: business.name,
        slug: business.slug,
        plan: business.plan,
        status: business.status,
        createdAt: business.created_at,
        // Extended business profile
        legalName: bp.legal_name || '',
        businessType: bp.business_type || '',
        businessCategory: bp.business_category || '',
        businessDescription: bp.business_description || '',
        website: bp.website || '',
        businessEmail: bp.business_email || '',
        businessPhone: bp.business_phone || '',
        country: bp.country || '',
        state: bp.state || '',
        city: bp.city || '',
        address: bp.address || '',
        postalCode: bp.postal_code || '',
        baseCurrency: bp.base_currency || 'USD',
        timezone: bp.timezone || 'UTC',
        registrationNumber: bp.registration_number || '',
        taxId: bp.tax_id || '',
        tradeLicense: bp.trade_license || '',
        vatNumber: bp.vat_number || '',
        dateOfIncorporation: bp.date_of_incorporation || '',
        countryOfRegistration: bp.country_of_registration || '',
      });
    } catch (err) { next(err); }
  },

  // ── PATCH /api/settings/business ──────────────────────────────────────────
  async updateBusinessProfile(req, res, next) {
    try {
      const {
        name, legalName, businessType, businessCategory, businessDescription,
        website, businessEmail, businessPhone, country, state, city, address,
        postalCode, baseCurrency, timezone, registrationNumber, taxId,
        tradeLicense, vatNumber, dateOfIncorporation, countryOfRegistration
      } = req.body;

      const db = getDatabase();
      const now = new Date().toISOString();

      // Update core business name if provided
      if (name && name.trim().length >= 2) {
        db.prepare('UPDATE businesses SET name = ?, updated_at = ? WHERE id = ?')
          .run(name.trim(), now, req.businessId);
      }

      // Upsert business_profiles
      getOrCreateBusinessProfile(db, req.businessId);
      db.prepare(`
        UPDATE business_profiles SET
          legal_name = ?, business_type = ?, business_category = ?, business_description = ?,
          website = ?, business_email = ?, business_phone = ?, country = ?, state = ?, city = ?,
          address = ?, postal_code = ?, base_currency = ?, timezone = ?,
          registration_number = ?, tax_id = ?, trade_license = ?, vat_number = ?,
          date_of_incorporation = ?, country_of_registration = ?, updated_at = ?
        WHERE business_id = ?
      `).run(
        legalName || null, businessType || null, businessCategory || null, businessDescription || null,
        website || null, businessEmail || null, businessPhone || null,
        country || null, state || null, city || null, address || null, postalCode || null,
        baseCurrency || 'USD', timezone || 'UTC',
        registrationNumber || null, taxId || null, tradeLicense || null, vatNumber || null,
        dateOfIncorporation || null, countryOfRegistration || null,
        now, req.businessId
      );

      auditLog(db, req.businessId, req.user.email, 'BUSINESS_PROFILE_UPDATED', 'business', req.businessId, { fields: Object.keys(req.body) });

      return successResponse(res, { message: 'Business profile updated successfully.' });
    } catch (err) { next(err); }
  },

  // ── GET /api/kyc ──────────────────────────────────────────────────────────
  async getKyc(req, res, next) {
    try {
      const db = getDatabase();
      const kyc = getOrCreateKycProfile(db, req.businessId);
      const documents = db.prepare('SELECT id, doc_type, original_name, status, review_status, uploaded_at FROM kyc_documents WHERE business_id = ?').all(req.businessId);
      const submission = db.prepare('SELECT * FROM kyc_submissions WHERE business_id = ? ORDER BY submitted_at DESC LIMIT 1').get(req.businessId);

      return successResponse(res, {
        status: kyc.status,
        stepCompleted: kyc.step_completed,
        fullLegalName: kyc.full_legal_name || '',
        dateOfBirth: kyc.date_of_birth || '',
        nationality: kyc.nationality || '',
        countryOfResidence: kyc.country_of_residence || '',
        residentialAddress: kyc.residential_address || '',
        phone: kyc.phone || '',
        submittedAt: kyc.submitted_at || null,
        reviewedAt: kyc.reviewed_at || null,
        rejectionReason: kyc.rejection_reason || null,
        documents,
        lastSubmission: submission || null,
      });
    } catch (err) { next(err); }
  },

  // ── POST /api/kyc ─────────────────────────────────────────────────────────
  async updateKyc(req, res, next) {
    try {
      const { fullLegalName, dateOfBirth, nationality, countryOfResidence, residentialAddress, phone, stepCompleted } = req.body;
      const db = getDatabase();
      const now = new Date().toISOString();

      const kyc = getOrCreateKycProfile(db, req.businessId);

      // Only allow updates if not under review or verified
      if (kyc.status === 'UNDER_REVIEW') {
        return errorResponse(res, 'KYC information is locked while under review.', API_ERROR_CODES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
      }
      if (kyc.status === 'VERIFIED') {
        return errorResponse(res, 'KYC has been verified and cannot be changed.', API_ERROR_CODES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
      }

      const newStatus = kyc.status === 'NOT_STARTED' ? 'IN_PROGRESS' : kyc.status;

      db.prepare(`
        UPDATE kyc_profiles SET
          full_legal_name = ?, date_of_birth = ?, nationality = ?,
          country_of_residence = ?, residential_address = ?, phone = ?,
          step_completed = ?, status = ?, updated_at = ?
        WHERE business_id = ?
      `).run(
        fullLegalName || kyc.full_legal_name,
        dateOfBirth || kyc.date_of_birth,
        nationality || kyc.nationality,
        countryOfResidence || kyc.country_of_residence,
        residentialAddress || kyc.residential_address,
        phone || kyc.phone,
        stepCompleted !== undefined ? stepCompleted : kyc.step_completed,
        newStatus,
        now,
        req.businessId
      );

      auditLog(db, req.businessId, req.user.email, 'KYC_INFO_UPDATED', 'kyc_profile', req.businessId, { step: stepCompleted });

      return successResponse(res, { message: 'KYC information saved.', status: newStatus });
    } catch (err) { next(err); }
  },

  // ── POST /api/kyc/submit ──────────────────────────────────────────────────
  async submitKyc(req, res, next) {
    try {
      const db = getDatabase();
      const kyc = getOrCreateKycProfile(db, req.businessId);
      const now = new Date().toISOString();

      if (kyc.status === 'UNDER_REVIEW') {
        return errorResponse(res, 'Verification is already under review.', API_ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT);
      }
      if (kyc.status === 'VERIFIED') {
        return errorResponse(res, 'Already verified.', API_ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT);
      }

      // Mark as under review
      db.prepare(`UPDATE kyc_profiles SET status = 'UNDER_REVIEW', submitted_at = ?, updated_at = ? WHERE business_id = ?`)
        .run(now, now, req.businessId);

      // Create submission record
      db.prepare(`
        INSERT INTO kyc_submissions (id, business_id, status, submitted_at)
        VALUES (?, ?, 'UNDER_REVIEW', ?)
      `).run(`kycsubmit-${Date.now()}`, req.businessId, now);

      auditLog(db, req.businessId, req.user.email, 'KYC_SUBMITTED', 'kyc_profile', req.businessId, { submittedAt: now });

      return successResponse(res, { message: 'Verification submitted for review.', status: 'UNDER_REVIEW', submittedAt: now });
    } catch (err) { next(err); }
  },

  // ── GET /api/kyc/documents ────────────────────────────────────────────────
  async getDocuments(req, res, next) {
    try {
      const db = getDatabase();
      const docs = db.prepare(`
        SELECT id, doc_type, original_name, file_size, mime_type, status, review_status, uploaded_at
        FROM kyc_documents
        WHERE business_id = ?
        ORDER BY uploaded_at DESC
      `).all(req.businessId);

      // Return metadata only — never expose stored_path or stored_name directly
      return successResponse(res, docs.map(d => ({
        id: d.id,
        docType: d.doc_type,
        originalName: d.original_name,
        fileSize: d.file_size,
        mimeType: d.mime_type,
        status: d.status,
        reviewStatus: d.review_status,
        uploadedAt: d.uploaded_at,
        viewUrl: `/api/kyc/documents/${d.id}/view`,
      })));
    } catch (err) { next(err); }
  },

  // ── POST /api/kyc/documents ───────────────────────────────────────────────
  async uploadDocument(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No document file uploaded.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const { docType } = req.body;
      if (!docType) {
        return errorResponse(res, 'Document type is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const now = new Date().toISOString();
      const docId = `doc-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      db.prepare(`
        INSERT INTO kyc_documents (id, business_id, doc_type, original_name, stored_name, stored_path, mime_type, file_size, status, review_status, uploaded_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UPLOADED', 'PENDING', ?, ?)
      `).run(
        docId, req.businessId, docType, req.file.originalname,
        req.file.filename, req.file.path, req.file.mimetype, req.file.size, now, now
      );

      auditLog(db, req.businessId, req.user.email, 'KYC_DOCUMENT_UPLOADED', 'kyc_document', docId, { docType, originalName: req.file.originalname });

      return successResponse(res, {
        id: docId, docType, originalName: req.file.originalname,
        fileSize: req.file.size, mimeType: req.file.mimetype,
        status: 'UPLOADED', reviewStatus: 'PENDING', uploadedAt: now,
        viewUrl: `/api/kyc/documents/${docId}/view`,
      }, HTTP_STATUS.CREATED);
    } catch (err) { next(err); }
  },

  // ── GET /api/kyc/documents/:id/view ──────────────────────────────────────
  async viewDocument(req, res, next) {
    try {
      const db = getDatabase();
      const doc = db.prepare('SELECT * FROM kyc_documents WHERE id = ? AND business_id = ?').get(req.params.id, req.businessId);

      if (!doc) {
        return errorResponse(res, 'Document not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const fs = await import('fs');
      if (!fs.existsSync(doc.stored_path)) {
        return errorResponse(res, 'Document file not found on server.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      res.setHeader('Content-Type', doc.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
      fs.createReadStream(doc.stored_path).pipe(res);
    } catch (err) { next(err); }
  },

  // ── DELETE /api/kyc/documents/:id ────────────────────────────────────────
  async deleteDocument(req, res, next) {
    try {
      const db = getDatabase();
      const doc = db.prepare('SELECT * FROM kyc_documents WHERE id = ? AND business_id = ?').get(req.params.id, req.businessId);

      if (!doc) {
        return errorResponse(res, 'Document not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Remove file from disk
      try {
        const fs = await import('fs');
        if (fs.existsSync(doc.stored_path)) fs.unlinkSync(doc.stored_path);
      } catch { /* safe */ }

      db.prepare('DELETE FROM kyc_documents WHERE id = ?').run(req.params.id);

      auditLog(db, req.businessId, req.user.email, 'KYC_DOCUMENT_DELETED', 'kyc_document', req.params.id, { docType: doc.doc_type });

      return successResponse(res, { message: 'Document removed.' });
    } catch (err) { next(err); }
  },

  // ── GET /api/settings/notifications ──────────────────────────────────────
  async getNotificationPrefs(req, res, next) {
    try {
      const db = getDatabase();
      let prefs = db.prepare('SELECT * FROM notification_preferences WHERE user_id = ?').get(req.user.id);

      if (!prefs) {
        const id = `np-${req.user.id}`;
        db.prepare(`
          INSERT INTO notification_preferences (id, user_id, created_at, updated_at)
          VALUES (?, ?, datetime('now'), datetime('now'))
        `).run(id, req.user.id);
        prefs = db.prepare('SELECT * FROM notification_preferences WHERE user_id = ?').get(req.user.id);
      }

      return successResponse(res, {
        orderNotifications: Boolean(prefs.order_notifications),
        aiNotifications: Boolean(prefs.ai_notifications),
        automationFailures: Boolean(prefs.automation_failures),
        integrationAlerts: Boolean(prefs.integration_alerts),
        securityAlerts: Boolean(prefs.security_alerts),
        marketingEmails: Boolean(prefs.marketing_emails),
      });
    } catch (err) { next(err); }
  },

  // ── PATCH /api/settings/notifications ────────────────────────────────────
  async updateNotificationPrefs(req, res, next) {
    try {
      const { orderNotifications, aiNotifications, automationFailures, integrationAlerts, securityAlerts, marketingEmails } = req.body;
      const db = getDatabase();
      const now = new Date().toISOString();

      // Ensure row exists
      let prefs = db.prepare('SELECT id FROM notification_preferences WHERE user_id = ?').get(req.user.id);
      if (!prefs) {
        db.prepare(`INSERT INTO notification_preferences (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)`)
          .run(`np-${req.user.id}`, req.user.id, now, now);
      }

      db.prepare(`
        UPDATE notification_preferences SET
          order_notifications = ?, ai_notifications = ?, automation_failures = ?,
          integration_alerts = ?, security_alerts = ?, marketing_emails = ?, updated_at = ?
        WHERE user_id = ?
      `).run(
        orderNotifications ? 1 : 0,
        aiNotifications ? 1 : 0,
        automationFailures ? 1 : 0,
        integrationAlerts ? 1 : 0,
        securityAlerts ? 1 : 0,
        marketingEmails ? 1 : 0,
        now, req.user.id
      );

      return successResponse(res, { message: 'Notification preferences saved.' });
    } catch (err) { next(err); }
  },

  // ── GET /api/settings/team ────────────────────────────────────────────────
  async getTeam(req, res, next) {
    try {
      const db = getDatabase();
      const members = db.prepare(`
        SELECT id, name, email, role, status, invited_at, last_active_at
        FROM team_members WHERE business_id = ?
        ORDER BY invited_at ASC
      `).all(req.businessId);

      // Also include the owner from users table
      const owner = db.prepare(`
        SELECT u.id, u.name, u.email, u.role, u.created_at as invited_at, u.updated_at as last_active_at
        FROM users u WHERE u.id = ?
      `).get(req.user.id);

      const ownerEntry = {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        role: 'Owner',
        status: 'Active',
        invitedAt: owner.invited_at,
        lastActiveAt: owner.last_active_at,
        isOwner: true,
      };

      const teamList = [ownerEntry, ...members.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        status: m.status,
        invitedAt: m.invited_at,
        lastActiveAt: m.last_active_at,
        isOwner: false,
      }))];

      return successResponse(res, teamList);
    } catch (err) { next(err); }
  },

  // ── POST /api/settings/team ───────────────────────────────────────────────
  async inviteMember(req, res, next) {
    try {
      const { name, email, role = 'MEMBER' } = req.body;

      if (!name || !email) {
        return errorResponse(res, 'Name and email are required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return errorResponse(res, 'Invalid email address.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const existing = db.prepare('SELECT id FROM team_members WHERE business_id = ? AND email = ?').get(req.businessId, email.toLowerCase());
      if (existing) {
        return errorResponse(res, 'A team member with this email already exists.', API_ERROR_CODES.CONFLICT, HTTP_STATUS.CONFLICT);
      }

      const now = new Date().toISOString();
      const id = `tm-${Date.now()}`;
      db.prepare(`
        INSERT INTO team_members (id, business_id, name, email, role, status, invited_at)
        VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
      `).run(id, req.businessId, name.trim(), email.toLowerCase(), role, now);

      auditLog(db, req.businessId, req.user.email, 'TEAM_MEMBER_INVITED', 'team_member', id, { email, role });

      return successResponse(res, { id, name, email, role, status: 'PENDING', invitedAt: now }, HTTP_STATUS.CREATED);
    } catch (err) { next(err); }
  },

  // ── DELETE /api/settings/team/:id ─────────────────────────────────────────
  async removeMember(req, res, next) {
    try {
      const db = getDatabase();
      const member = db.prepare('SELECT * FROM team_members WHERE id = ? AND business_id = ?').get(req.params.id, req.businessId);

      if (!member) {
        return errorResponse(res, 'Team member not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
      auditLog(db, req.businessId, req.user.email, 'TEAM_MEMBER_REMOVED', 'team_member', req.params.id, { email: member.email });

      return successResponse(res, { message: 'Team member removed.' });
    } catch (err) { next(err); }
  },

  // ── GET /api/settings/api-keys ────────────────────────────────────────────
  async getApiKeys(req, res, next) {
    try {
      const db = getDatabase();
      const keys = db.prepare(`
        SELECT id, label, key_prefix, is_active, last_used_at, created_at, revoked_at
        FROM api_keys WHERE business_id = ? AND is_active = 1
        ORDER BY created_at DESC
      `).all(req.businessId);

      return successResponse(res, keys.map(k => ({
        id: k.id,
        label: k.label,
        maskedKey: `${k.key_prefix}••••••••••••`,
        isActive: Boolean(k.is_active),
        lastUsedAt: k.last_used_at,
        createdAt: k.created_at,
      })));
    } catch (err) { next(err); }
  },

  // ── POST /api/settings/api-keys ───────────────────────────────────────────
  async createApiKey(req, res, next) {
    try {
      const { label } = req.body;
      if (!label || label.trim().length < 2) {
        return errorResponse(res, 'API key label is required.', API_ERROR_CODES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY);
      }

      const db = getDatabase();
      const rawKey = `kz_live_${crypto.randomBytes(24).toString('hex')}`;
      const keyPrefix = rawKey.slice(0, 12);
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
      const id = `key-${Date.now()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO api_keys (id, business_id, label, key_prefix, key_hash, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, ?)
      `).run(id, req.businessId, label.trim(), keyPrefix, keyHash, now);

      auditLog(db, req.businessId, req.user.email, 'API_KEY_CREATED', 'api_key', id, { label });

      // Return raw key ONCE — not stored, cannot be retrieved again
      return successResponse(res, {
        id, label: label.trim(), rawKey,
        maskedKey: `${keyPrefix}••••••••••••`,
        createdAt: now,
        warning: 'Store this key now. It cannot be shown again.',
      }, HTTP_STATUS.CREATED);
    } catch (err) { next(err); }
  },

  // ── DELETE /api/settings/api-keys/:id ─────────────────────────────────────
  async revokeApiKey(req, res, next) {
    try {
      const db = getDatabase();
      const key = db.prepare('SELECT * FROM api_keys WHERE id = ? AND business_id = ?').get(req.params.id, req.businessId);

      if (!key) {
        return errorResponse(res, 'API key not found.', API_ERROR_CODES.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const now = new Date().toISOString();
      db.prepare('UPDATE api_keys SET is_active = 0, revoked_at = ? WHERE id = ?').run(now, req.params.id);

      auditLog(db, req.businessId, req.user.email, 'API_KEY_REVOKED', 'api_key', req.params.id, { label: key.label });

      return successResponse(res, { message: 'API key revoked successfully.' });
    } catch (err) { next(err); }
  },
};
