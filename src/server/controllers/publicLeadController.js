import { getDatabase } from '../config/database.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const publicLeadController = {
  async bookDemo(req, res, next) {
    try {
      const fullName = req.body.fullName || req.body.name || req.body.full_name;
      const workEmail = req.body.workEmail || req.body.email;
      const companyName = req.body.companyName || req.body.businessName || req.body.company || req.body.business_name;
      const phone = req.body.phone || '';
      const companySize = req.body.companySize || req.body.monthlyOrders || '';
      const primaryUseCase = req.body.primaryUseCase || req.body.businessType || req.body.message || '';
      const preferredDate = req.body.preferredDate || '';
      const preferredTime = req.body.preferredTime || '';
      const channels = req.body.channels || (req.body.primaryChannel ? [req.body.primaryChannel] : []);

      if (!fullName || !workEmail || !companyName) {
        return errorResponse(
          res,
          'Full name, work email address, and company name are required.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      // Email format check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(workEmail).trim())) {
        return errorResponse(
          res,
          'Please enter a valid work email address.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const db = getDatabase();
      const id = `demo-${Date.now()}`;
      const now = new Date().toISOString();

      const combinedUseCase = [
        primaryUseCase,
        Array.isArray(channels) && channels.length ? `Channels: ${channels.join(', ')}` : ''
      ].filter(Boolean).join(' | ');

      db.prepare(`
        INSERT INTO demo_bookings (id, full_name, work_email, phone, company_name, company_size, primary_use_case, preferred_date, preferred_time, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        String(fullName).trim(),
        String(workEmail).trim().toLowerCase(),
        String(phone).trim(),
        String(companyName).trim(),
        String(companySize).trim(),
        combinedUseCase,
        String(preferredDate).trim(),
        String(preferredTime).trim(),
        'PENDING',
        now
      );

      logger.info(`Live Demo Booking captured in DB: ${fullName} (${companyName}, ${workEmail})`);

      return successResponse(res, {
        id,
        status: 'PENDING',
        fullName,
        businessName: companyName,
        email: workEmail,
        created_at: now,
        message: 'Your demo request has been securely scheduled. Our team will reach out with your calendar invitation.'
      }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async requestFounderCall(req, res, next) {
    try {
      const fullName = req.body.fullName || req.body.name || req.body.full_name;
      const email = req.body.email || req.body.workEmail;
      const company = req.body.company || req.body.businessName || req.body.companyName || req.body.business_name;
      const phone = req.body.phone || req.body.whatsapp || '';
      const role = req.body.role || '';
      const stage = req.body.stage || '';
      const monthlyRevenue = req.body.monthlyRevenue || req.body.monthly_revenue || '';
      const automationNeed = req.body.automationNeed || req.body.message || '';
      const preferredSlot = req.body.preferredSlot || req.body.preferredDate || '';

      if (!fullName || !email || !company) {
        return errorResponse(
          res,
          'Full name, work email, and company name are required.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const db = getDatabase();
      const id = `founder-${Date.now()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO founder_meetings (id, full_name, email, phone, company, role, stage, monthly_revenue, automation_need, preferred_slot, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        String(fullName).trim(),
        String(email).trim().toLowerCase(),
        String(phone).trim(),
        String(company).trim(),
        String(role).trim(),
        String(stage).trim(),
        String(monthlyRevenue).trim(),
        String(automationNeed).trim(),
        String(preferredSlot).trim(),
        'CONFIRMED',
        now
      );

      logger.info(`Online Founder Strategy Call booked in DB: ${fullName} (${company})`);

      return successResponse(res, {
        id,
        status: 'CONFIRMED',
        fullName,
        company,
        email,
        phone,
        created_at: now,
        message: 'Your online meeting with our founding team has been reserved.'
      }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  },

  async submitContact(req, res, next) {
    try {
      const name = req.body.name || req.body.fullName || req.body.full_name;
      const email = req.body.email || req.body.workEmail;
      const company = req.body.company || req.body.businessName || req.body.companyName || '';
      const message = req.body.message || req.body.notes || '';

      if (!name || !email || !message) {
        return errorResponse(
          res,
          'Name, email, and message are required.',
          API_ERROR_CODES.VALIDATION_FAILED,
          HTTP_STATUS.UNPROCESSABLE_ENTITY
        );
      }

      const db = getDatabase();
      const id = `inq-${Date.now()}`;
      const now = new Date().toISOString();

      db.prepare(`
        INSERT INTO contact_inquiries (id, name, email, company, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, String(name).trim(), String(email).trim().toLowerCase(), String(company).trim(), String(message).trim(), 'NEW', now);

      logger.info(`Contact message logged: ${name} (${email})`);

      return successResponse(res, {
        id,
        status: 'RECEIVED',
        name,
        email,
        company,
        created_at: now,
        message: 'Thank you for reaching out. We will get back to you shortly.'
      }, HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }
};
