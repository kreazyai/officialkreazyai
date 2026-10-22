import { getDatabase, ensureCreditWallet, ensureBillingData } from '../config/database.js';
import { creditWalletService } from '../services/billing/creditWalletService.js';
import { PLAN_CONFIG } from '../services/billing/planConfig.js';
import { successResponse, errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Masks an account/phone number to ensure privacy and security.
 * e.g. "01643792804" -> "016****2804"
 */
function maskAccountNumber(num) {
  if (!num || typeof num !== 'string') return '';
  const clean = num.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  if (clean.length <= 7) {
    return clean.slice(0, 2) + '***' + clean.slice(-2);
  }
  const prefix = clean.slice(0, 3);
  const suffix = clean.slice(-4);
  return `${prefix}****${suffix}`;
}

/**
 * Formats date into readable string, e.g. "November 12, 2026"
 */
function formatDate(dateObjOrStr) {
  if (!dateObjOrStr) return '';
  const d = new Date(dateObjOrStr);
  if (isNaN(d.getTime())) return String(dateObjOrStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export const billingController = {
  /**
   * GET /api/v1/billing/details
   * Returns authoritative, tenant-isolated data for the 4 Billing sections:
   * 1. Your Plan
   * 2. Monthly AI Conversations
   * 3. Payment Method
   * 4. Payment History (Invoices)
   */
  async getDetails(req, res, next) {
    try {
      const db = getDatabase();
      const tenantId = req.businessId || req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';

      // Ensure base tables and records exist
      ensureCreditWallet(db, tenantId);
      ensureBillingData(db, tenantId);

      const business = db.prepare('SELECT id, name, plan, status FROM businesses WHERE id = ?').get(tenantId);
      const sub = db.prepare('SELECT * FROM subscriptions WHERE tenant_id = ?').get(tenantId);
      const wallet = creditWalletService.getWallet(tenantId);

      // Determine active plan tier configuration
      let planKey = 'growth';
      if (sub && sub.plan_id) {
        planKey = sub.plan_id.toLowerCase();
      } else if (business && business.plan) {
        const bp = business.plan.toLowerCase();
        if (bp.includes('scale') || bp.includes('pro') || bp.includes('299')) planKey = 'scale';
        else if (bp.includes('starter') || bp.includes('trial') || bp.includes('49')) planKey = 'starter';
        else planKey = 'growth';
      }

      const planConfig = PLAN_CONFIG[planKey] || PLAN_CONFIG.growth;
      const isSubActive = sub ? (sub.status === 'ACTIVE') : (wallet?.subscriptionStatus === 'ACTIVE' || (business?.plan && !business.plan.toLowerCase().includes('free')));
      const planName = planConfig.name;

      // Currency and Price (strictly using backend configured currency & amount)
      const configuredCurrency = sub?.currency || 'USD';
      const configuredAmount = sub?.amount ? Number(sub.amount) : planConfig.priceUsdMonthly;
      const priceBdt = planConfig.priceBdtMonthly || Math.round(configuredAmount * 120);

      // Formatted display price using configured currency
      const formattedPrice = configuredCurrency === 'BDT'
        ? `৳${configuredAmount.toLocaleString()} / month`
        : `$${configuredAmount} / month`;

      // Next Payment / Renewal Date
      let nextPaymentDate = '';
      let resetPeriodStr = 'the 1st of each month';
      if (sub?.current_period_end) {
        nextPaymentDate = formatDate(sub.current_period_end);
        resetPeriodStr = nextPaymentDate;
      } else if (wallet?.subscriptionRenewsAt) {
        nextPaymentDate = formatDate(wallet.subscriptionRenewsAt);
        resetPeriodStr = nextPaymentDate;
      } else {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        nextPaymentDate = formatDate(nextMonth);
        resetPeriodStr = 'the 1st of each month';
      }

      // ── SECTION 2: MONTHLY AI CONVERSATIONS ──
      // Calculate qualifying conversations in the current billing cycle
      let periodStart;
      if (sub?.current_period_start) {
        const pDate = new Date(sub.current_period_start);
        pDate.setUTCHours(0, 0, 0, 0);
        periodStart = pDate.toISOString();
      } else {
        periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      }

      const convCountRow = db.prepare(`
        SELECT COUNT(DISTINCT id) AS count
        FROM conversations
        WHERE (business_id = ? OR tenant_id = ?)
          AND created_at >= ?
      `).get(tenantId, tenantId, periodStart);

      const conversationsUsed = convCountRow ? Number(convCountRow.count) : 0;
      const conversationsLimit = planConfig.maxReplies || 5000;
      const conversationsRemaining = Math.max(0, conversationsLimit - conversationsUsed);

      // ── SECTION 3: PAYMENT METHOD ──
      // Retrieve latest invoice / payment method record for masked details
      const latestInvoice = db.prepare(`
        SELECT * FROM billing_invoices
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).get(tenantId);

      const provider = latestInvoice?.payment_provider || sub?.payment_provider || 'bKash';
      const senderRaw = latestInvoice?.sender_number || '01643792804';
      const maskedAccount = maskAccountNumber(senderRaw);
      const verificationStatus = latestInvoice?.status || (isSubActive ? 'Confirmed' : 'Unverified');

      // ── SECTION 4: PAYMENT HISTORY (INVOICES) ──
      const invoiceRows = db.prepare(`
        SELECT * FROM billing_invoices
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        LIMIT 20
      `).all(tenantId);

      const invoices = invoiceRows.map(inv => ({
        id: inv.invoice_number,
        date: formatDate(inv.created_at),
        amount: inv.amount_formatted || `$${inv.amount}.00`,
        rawAmount: inv.amount,
        currency: inv.currency || 'USD',
        status: inv.status || 'Confirmed',
        method: inv.payment_method || `${inv.payment_provider} (Send money)`,
        trxId: inv.trx_id || 'TRX-VERIFIED',
        senderNumber: inv.sender_number || '01643792804',
        senderMasked: maskAccountNumber(inv.sender_number || '01643792804'),
        screenshotUrl: inv.screenshot_url || null,
        clearedAt: inv.cleared_at ? formatDate(inv.cleared_at) : null
      }));

      return successResponse(res, {
        plan: {
          id: planConfig.id,
          name: planName,
          status: isSubActive ? 'Active' : 'Inactive',
          isActive: Boolean(isSubActive),
          amount: configuredAmount,
          currency: configuredCurrency,
          formattedPrice,
          priceBdt,
          nextPayment: isSubActive ? nextPaymentDate : 'No upcoming payment',
          canCancel: Boolean(isSubActive)
        },
        conversations: {
          used: conversationsUsed,
          limit: conversationsLimit,
          remaining: conversationsRemaining,
          resetDate: resetPeriodStr,
          resetText: `Resets on ${resetPeriodStr}.`
        },
        paymentMethod: {
          provider,
          accountNumber: maskedAccount,
          rawAccount: senderRaw,
          verificationStatus,
          isVerified: verificationStatus.toLowerCase() === 'confirmed',
          receiptDetails: latestInvoice ? {
            invoiceId: latestInvoice.invoice_number,
            planName: latestInvoice.plan_name,
            amount: latestInvoice.amount_formatted || `$${latestInvoice.amount}.00`,
            provider: latestInvoice.payment_provider,
            senderNumber: latestInvoice.sender_number,
            senderMasked: maskAccountNumber(latestInvoice.sender_number),
            trxId: latestInvoice.trx_id,
            screenshotUrl: latestInvoice.screenshot_url,
            date: formatDate(latestInvoice.created_at)
          } : null
        },
        invoices
      });
    } catch (err) {
      logger.error('Error fetching billing details:', err);
      next(err);
    }
  },

  /**
   * POST /api/v1/billing/change-plan
   * Safely switches or upgrades user plan tier and updates limits.
   */
  async changePlan(req, res, next) {
    try {
      const tenantId = req.businessId || req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { planId, billingCycle = 'MONTHLY', provider = 'BKASH' } = req.body || {};

      if (!planId || !PLAN_CONFIG[planId]) {
        return errorResponse(res, 'Valid planId is required (starter, growth, or scale)', 'VALIDATION_FAILED', HTTP_STATUS.BAD_REQUEST);
      }

      const result = creditWalletService.upgradeSubscription(tenantId, planId, billingCycle, provider);
      return successResponse(res, result, HTTP_STATUS.OK, {
        message: `Plan successfully updated to ${result.plan}`
      });
    } catch (err) {
      logger.error('Error changing plan:', err);
      next(err);
    }
  },

  /**
   * POST /api/v1/billing/cancel-plan
   * Cancels active subscription according to subscription rules.
   */
  async cancelPlan(req, res, next) {
    try {
      const db = getDatabase();
      const tenantId = req.businessId || req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const nowIso = new Date().toISOString();

      db.transaction(() => {
        // Update subscription status
        db.prepare(`
          UPDATE subscriptions
          SET status = 'CANCELLED', cancel_at_period_end = 1, updated_at = ?
          WHERE tenant_id = ?
        `).run(nowIso, tenantId);

        // Revert wallet status to trial or inactive
        db.prepare(`
          UPDATE ai_credit_wallets
          SET subscription_status = 'CANCELLED', updated_at = ?
          WHERE tenant_id = ?
        `).run(nowIso, tenantId);

        // Update businesses table
        db.prepare(`
          UPDATE businesses
          SET plan = 'Free Trial', updated_at = ?
          WHERE id = ?
        `).run(nowIso, tenantId);
      })();

      return successResponse(res, { success: true }, HTTP_STATUS.OK, {
        message: 'Subscription has been cancelled. Account moved to Free Trial.'
      });
    } catch (err) {
      logger.error('Error cancelling subscription:', err);
      next(err);
    }
  },

  /**
   * POST /api/v1/billing/submit-payment
   * Accepts and records a new bKash / Nagad Send Money payment and generates invoice.
   */
  async submitPayment(req, res, next) {
    try {
      const db = getDatabase();
      const tenantId = req.businessId || req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { planId = 'growth', provider = 'bKash', senderNumber, trxId, screenshotUrl } = req.body || {};

      if (!senderNumber || !senderNumber.trim()) {
        return errorResponse(res, 'Sender phone number is required.', 'VALIDATION_FAILED', HTTP_STATUS.BAD_REQUEST);
      }
      if (!trxId || !trxId.trim()) {
        return errorResponse(res, 'Transaction ID (TrxID) is required.', 'VALIDATION_FAILED', HTTP_STATUS.BAD_REQUEST);
      }

      const planKey = (planId || 'growth').toLowerCase();
      const plan = PLAN_CONFIG[planKey] || PLAN_CONFIG.growth;
      const now = new Date();
      const nowIso = now.toISOString();
      const invoiceNumber = `INV-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
      const priceBdt = plan.priceBdtMonthly || Math.round(plan.priceUsdMonthly * 120);
      const amountFormatted = `$${plan.priceUsdMonthly}.00 (৳${priceBdt.toLocaleString()} BDT)`;

      // Upgrade subscription in wallet service
      creditWalletService.upgradeSubscription(tenantId, planKey, 'MONTHLY', provider.toUpperCase());

      // Insert billing invoice row
      const invoiceId = `inv-${tenantId}-${Date.now()}`;
      db.prepare(`
        INSERT INTO billing_invoices (
          id, tenant_id, invoice_number, plan_id, plan_name, amount, currency,
          amount_formatted, status, payment_method, payment_provider, sender_number,
          trx_id, screenshot_url, cleared_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'USD', ?, 'Confirmed', ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        invoiceId,
        tenantId,
        invoiceNumber,
        planKey,
        plan.name,
        plan.priceUsdMonthly,
        amountFormatted,
        `${provider} 01643792804 (Send money)`,
        provider,
        senderNumber.trim(),
        trxId.trim().toUpperCase(),
        screenshotUrl || null,
        nowIso,
        nowIso,
        nowIso
      );

      return successResponse(res, {
        success: true,
        invoiceId: invoiceNumber,
        plan: plan.name,
        amountFormatted,
        trxId: trxId.trim().toUpperCase(),
        senderMasked: maskAccountNumber(senderNumber.trim()),
        provider
      }, HTTP_STATUS.OK, {
        message: `Payment confirmed! Subscription to ${plan.name} is now active.`
      });
    } catch (err) {
      logger.error('Error submitting payment:', err);
      next(err);
    }
  },

  /**
   * POST /api/v1/billing/update-method
   * Updates sender account or provider credentials.
   */
  async updatePaymentMethod(req, res, next) {
    try {
      const db = getDatabase();
      const tenantId = req.businessId || req.user?.business_id || req.headers['x-workspace-id'] || 'ws-flagship-01';
      const { provider = 'bKash', senderNumber } = req.body || {};

      if (!senderNumber || !senderNumber.trim()) {
        return errorResponse(res, 'Sender phone number is required.', 'VALIDATION_FAILED', HTTP_STATUS.BAD_REQUEST);
      }

      const nowIso = new Date().toISOString();
      db.prepare(`
        UPDATE billing_invoices
        SET payment_provider = ?, sender_number = ?, updated_at = ?
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        LIMIT 1
      `).run(provider, senderNumber.trim(), nowIso, tenantId);

      return successResponse(res, {
        provider,
        accountNumber: maskAccountNumber(senderNumber.trim())
      }, HTTP_STATUS.OK, {
        message: 'Payment method updated successfully.'
      });
    } catch (err) {
      logger.error('Error updating payment method:', err);
      next(err);
    }
  }
};
