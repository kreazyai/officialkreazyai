import { getDatabase, ensureCreditWallet } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { PLAN_CONFIG, COST_PER_AI_REPLY } from './planConfig.js';

export const creditWalletService = {
  /**
   * Retrieves full wallet details for a tenant.
   * Dynamically evaluates trial expiration and remaining days.
   * @param {string} tenantId 
   */
  getWallet(tenantId) {
    if (!tenantId) return null;
    const db = getDatabase();
    let wallet = ensureCreditWallet(db, tenantId);
    if (!wallet) return null;

    const now = new Date();
    const trialExpiresAt = new Date(wallet.trial_expires_at);
    const msRemaining = trialExpiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
    const isTrialElapsed = msRemaining <= 0;

    let effectiveStatus = wallet.subscription_status;
    if (wallet.subscription_tier === 'FREE_TRIAL') {
      if (isTrialElapsed && wallet.subscription_status === 'TRIAL_ACTIVE') {
        effectiveStatus = 'TRIAL_EXPIRED';
        db.prepare(`
          UPDATE ai_credit_wallets 
          SET subscription_status = 'TRIAL_EXPIRED', updated_at = datetime('now')
          WHERE tenant_id = ?
        `).run(tenantId);
      } else if (wallet.credits_balance < COST_PER_AI_REPLY && !isTrialElapsed) {
        effectiveStatus = 'CREDITS_EXHAUSTED';
      }
    } else if (wallet.credits_balance < COST_PER_AI_REPLY && wallet.subscription_status === 'ACTIVE') {
      effectiveStatus = 'CREDITS_EXHAUSTED';
    }

    // Refresh wallet row in case status was updated
    const freshWallet = db.prepare('SELECT * FROM ai_credit_wallets WHERE tenant_id = ?').get(tenantId) || wallet;

    return {
      tenantId: freshWallet.tenant_id,
      creditsBalance: freshWallet.credits_balance,
      creditsReserved: freshWallet.credits_reserved,
      creditsUsed: freshWallet.credits_used,
      trialCreditsGranted: freshWallet.trial_credits_granted,
      successfulRepliesCount: freshWallet.successful_replies_count,
      subscriptionTier: freshWallet.subscription_tier,
      subscriptionStatus: effectiveStatus,
      trialStartedAt: freshWallet.trial_started_at,
      trialExpiresAt: freshWallet.trial_expires_at,
      trialDaysRemaining: daysRemaining,
      isTrialExpired: isTrialElapsed && freshWallet.subscription_tier === 'FREE_TRIAL',
      costPerReply: COST_PER_AI_REPLY,
      maxTrialReplies: Math.floor(freshWallet.trial_credits_granted / COST_PER_AI_REPLY),
      monthlyCreditAllowance: freshWallet.monthly_credit_allowance,
      subscriptionRenewsAt: freshWallet.subscription_renews_at
    };
  },

  /**
   * Fast verification check before initiating AI generation pipeline.
   * Returns whether AI reply is permitted, reason if denied, and required action.
   * @param {string} tenantId 
   */
  canSendAiReply(tenantId) {
    const wallet = this.getWallet(tenantId);
    if (!wallet) {
      return { canSend: false, reason: 'WALLET_NOT_FOUND', requiresUpgrade: true };
    }

    // 1. Check Trial Expiration
    if (wallet.subscriptionTier === 'FREE_TRIAL') {
      if (wallet.isTrialExpired) {
        logger.info(`[BILLING] AI reply denied for tenant ${tenantId}: 7-day free trial has expired.`);
        return { canSend: false, reason: 'TRIAL_EXPIRED', requiresUpgrade: true, wallet };
      }
    }

    // 2. Check Sufficient Credits
    if (wallet.creditsBalance < COST_PER_AI_REPLY) {
      logger.info(`[BILLING] AI reply denied for tenant ${tenantId}: Insufficient credits (${wallet.creditsBalance} < ${COST_PER_AI_REPLY}).`);
      return { canSend: false, reason: 'CREDITS_EXHAUSTED', requiresUpgrade: true, wallet };
    }

    return { canSend: true, availableCredits: wallet.creditsBalance, wallet };
  },

  /**
   * Concurrency-safe atomic reservation of credits before AI generation/Cloud API dispatch.
   * Prevents simultaneous incoming messages from overspending credits.
   * @param {string} tenantId 
   * @param {number} amount (default 5)
   * @param {string} messageId 
   * @returns {{ success: boolean, reservationId?: string, remainingBalance?: number, error?: string }}
   */
  reserveCredits(tenantId, amount = COST_PER_AI_REPLY, messageId = null) {
    const db = getDatabase();
    ensureCreditWallet(db, tenantId);

    const reservationId = `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();

    const reservationTx = db.transaction(() => {
      // 1. Fetch wallet
      const wallet = db.prepare('SELECT * FROM ai_credit_wallets WHERE tenant_id = ?').get(tenantId);
      if (!wallet) throw new Error('WALLET_NOT_FOUND');

      // Check trial expiration
      const now = new Date();
      if (wallet.subscription_tier === 'FREE_TRIAL' && now > new Date(wallet.trial_expires_at)) {
        throw new Error('TRIAL_EXPIRED');
      }

      if (wallet.credits_balance < amount) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      // 2. Atomically hold credits
      const updateResult = db.prepare(`
        UPDATE ai_credit_wallets
        SET 
          credits_balance = credits_balance - ?,
          credits_reserved = credits_reserved + ?,
          updated_at = ?
        WHERE tenant_id = ? AND credits_balance >= ?
      `).run(amount, amount, nowIso, tenantId, amount);

      if (updateResult.changes === 0) {
        throw new Error('CONCURRENT_CREDIT_CONFLICT');
      }

      const balanceAfter = wallet.credits_balance - amount;

      // 3. Log reservation in immutable ledger
      db.prepare(`
        INSERT INTO credit_transactions (
          id, tenant_id, amount, type, balance_after, reference_id, description, created_at
        ) VALUES (?, ?, ?, 'RESERVATION_HOLD', ?, ?, ?, ?)
      `).run(
        `ctx-${reservationId}`,
        tenantId,
        -amount,
        balanceAfter,
        messageId || reservationId,
        `Credit hold (${amount} credits) for WhatsApp outbound reply`,
        nowIso
      );

      return {
        success: true,
        reservationId,
        amount,
        remainingBalance: balanceAfter
      };
    });

    try {
      return reservationTx();
    } catch (err) {
      logger.warn(`Credit reservation failed for tenant ${tenantId}:`, err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Finalizes and commits the deduction ONLY after the outbound reply is verified
   * and accepted by Meta's WhatsApp Cloud API.
   * @param {string} tenantId 
   * @param {string} reservationId 
   * @param {string} externalMessageId 
   * @param {string} metaCloudMessageId 
   */
  commitReservation(tenantId, reservationId, externalMessageId = null, metaCloudMessageId = null) {
    if (!tenantId || !reservationId) return { success: false };
    const db = getDatabase();
    const nowIso = new Date().toISOString();

    const commitTx = db.transaction(() => {
      // 1. Move reserved credits to used
      const updateResult = db.prepare(`
        UPDATE ai_credit_wallets
        SET 
          credits_reserved = MAX(0, credits_reserved - ?),
          credits_used = credits_used + ?,
          successful_replies_count = successful_replies_count + 1,
          updated_at = ?
        WHERE tenant_id = ? AND credits_reserved >= ?
      `).run(COST_PER_AI_REPLY, COST_PER_AI_REPLY, nowIso, tenantId, COST_PER_AI_REPLY);

      const wallet = db.prepare('SELECT credits_balance FROM ai_credit_wallets WHERE tenant_id = ?').get(tenantId);
      const balance = wallet ? wallet.credits_balance : 0;

      // 2. Immutable Ledger Entry
      const txId = `ctx-commit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO credit_transactions (
          id, tenant_id, amount, type, balance_after, reference_id, description, created_at
        ) VALUES (?, ?, ?, 'RESERVATION_COMMIT', ?, ?, ?, ?)
      `).run(
        txId,
        tenantId,
        -COST_PER_AI_REPLY,
        balance,
        metaCloudMessageId || externalMessageId || reservationId,
        `Finalized 5-credit deduction for verified WhatsApp outbound message (Meta ID: ${metaCloudMessageId || 'N/A'})`,
        nowIso
      );

      logger.info(`[CREDITS DEDUCTED] 5 credits deducted for tenant ${tenantId}. Remaining balance: ${balance}`);
      return { success: true, balance };
    });

    try {
      return commitTx();
    } catch (err) {
      logger.error(`Error committing credit reservation ${reservationId} for tenant ${tenantId}:`, err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Releases and restores reserved credits when AI generation or outbound Cloud API send fails.
   * Ensures merchant is NEVER charged for failed responses or API drops.
   * @param {string} tenantId 
   * @param {string} reservationId 
   * @param {string} failureReason 
   */
  releaseReservation(tenantId, reservationId, failureReason = 'OUTBOUND_SEND_FAILED') {
    if (!tenantId || !reservationId) return { success: false };
    const db = getDatabase();
    const nowIso = new Date().toISOString();

    const releaseTx = db.transaction(() => {
      // 1. Revert reserved credits back to available balance
      db.prepare(`
        UPDATE ai_credit_wallets
        SET 
          credits_balance = credits_balance + ?,
          credits_reserved = MAX(0, credits_reserved - ?),
          updated_at = ?
        WHERE tenant_id = ?
      `).run(COST_PER_AI_REPLY, COST_PER_AI_REPLY, nowIso, tenantId);

      const wallet = db.prepare('SELECT credits_balance FROM ai_credit_wallets WHERE tenant_id = ?').get(tenantId);
      const balance = wallet ? wallet.credits_balance : 0;

      // 2. Ledger refund/release entry
      const txId = `ctx-rel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      db.prepare(`
        INSERT INTO credit_transactions (
          id, tenant_id, amount, type, balance_after, reference_id, description, created_at
        ) VALUES (?, ?, ?, 'RESERVATION_RELEASE', ?, ?, ?, ?)
      `).run(
        txId,
        tenantId,
        COST_PER_AI_REPLY,
        balance,
        reservationId,
        `Released 5 credits due to: ${failureReason}`,
        nowIso
      );

      logger.info(`[CREDITS RELEASED] Restored 5 credits to tenant ${tenantId} due to send failure (${failureReason}). Balance: ${balance}`);
      return { success: true, balance };
    });

    try {
      return releaseTx();
    } catch (err) {
      logger.error(`Error releasing credit reservation ${reservationId}:`, err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Activates or upgrades a tenant to a paid plan.
   * Adds the official monthly credit allowance to their wallet.
   * @param {string} tenantId 
   * @param {'trial'|'standard'|'pro'} planId 
   * @param {string} billingCycle ('MONTHLY'|'ANNUAL')
   * @param {string} provider ('STRIPE'|'BKASH'|'MANUAL'|'INTERNAL')
   * @param {string} externalSubscriptionId 
   */
  upgradeSubscription(tenantId, planId, billingCycle = 'MONTHLY', provider = 'INTERNAL', externalSubscriptionId = null) {
    const plan = PLAN_CONFIG[planId];
    if (!plan) {
      throw new Error(`Invalid plan ID: ${planId}. Must be one of: trial, standard, pro.`);
    }

    const db = getDatabase();
    ensureCreditWallet(db, tenantId);

    const now = new Date();
    const periodEnd = new Date(now.getTime() + (billingCycle === 'ANNUAL' ? 365 : 30) * 24 * 60 * 60 * 1000);
    const nowIso = now.toISOString();
    const periodEndIso = periodEnd.toISOString();

    const upgradeTx = db.transaction(() => {
      // 1. Add credit allowance and update wallet tier
      db.prepare(`
        UPDATE ai_credit_wallets
        SET 
          credits_balance = credits_balance + ?,
          subscription_tier = ?,
          subscription_status = 'ACTIVE',
          monthly_credit_allowance = ?,
          subscription_renews_at = ?,
          updated_at = ?
        WHERE tenant_id = ?
      `).run(
        plan.credits,
        plan.name,
        plan.credits,
        periodEndIso,
        nowIso,
        tenantId
      );

      // 2. Update businesses table plan
      db.prepare(`
        UPDATE businesses
        SET plan = ?, updated_at = ?
        WHERE id = ?
      `).run(plan.name, nowIso, tenantId);

      const wallet = db.prepare('SELECT credits_balance FROM ai_credit_wallets WHERE tenant_id = ?').get(tenantId);
      const newBalance = wallet ? wallet.credits_balance : plan.credits;

      // 3. Upsert into subscriptions table
      const subId = `sub-${tenantId}`;
      db.prepare(`
        INSERT INTO subscriptions (
          id, tenant_id, plan_id, status, credits_allowance, billing_cycle,
          currency, amount, current_period_start, current_period_end,
          cancel_at_period_end, payment_provider, external_subscription_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, 'ACTIVE', ?, ?, 'USD', ?, ?, ?, 0, ?, ?, ?, ?)
        ON CONFLICT(tenant_id) DO UPDATE SET
          plan_id = excluded.plan_id,
          status = 'ACTIVE',
          credits_allowance = excluded.credits_allowance,
          billing_cycle = excluded.billing_cycle,
          current_period_start = excluded.current_period_start,
          current_period_end = excluded.current_period_end,
          payment_provider = excluded.payment_provider,
          external_subscription_id = COALESCE(excluded.external_subscription_id, subscriptions.external_subscription_id),
          updated_at = excluded.updated_at
      `).run(
        subId,
        tenantId,
        planId,
        plan.credits,
        billingCycle,
        billingCycle === 'ANNUAL' ? (plan.priceUsdAnnual * 12) : plan.priceUsdMonthly,
        nowIso,
        periodEndIso,
        provider,
        externalSubscriptionId || `sub_ext_${Date.now()}`,
        nowIso,
        nowIso
      );

      // 4. Record in immutable transaction ledger
      db.prepare(`
        INSERT INTO credit_transactions (
          id, tenant_id, amount, type, balance_after, reference_id, description, created_at
        ) VALUES (?, ?, ?, 'PLAN_GRANT', ?, ?, ?, ?)
      `).run(
        `ctx-sub-${Date.now()}`,
        tenantId,
        plan.credits,
        newBalance,
        subId,
        `Subscription activated: ${plan.name} (+${plan.credits} credits)`,
        nowIso
      );

      logger.info(`[BILLING] Tenant ${tenantId} upgraded to ${plan.name} (+${plan.credits} credits). New Balance: ${newBalance}`);
      return { success: true, plan: plan.name, creditsAdded: plan.credits, newBalance };
    });

    return upgradeTx();
  },

  /**
   * Process incoming billing/payment webhook idempotently.
   * Guarantees duplicate payment webhook events do not grant duplicate credits.
   */
  processPaymentWebhook(provider, eventId, eventType, tenantId, planId, payload = {}) {
    const db = getDatabase();
    
    // Check payment event idempotency
    const existing = db.prepare('SELECT id, processed FROM payment_events WHERE event_id = ?').get(eventId);
    if (existing) {
      logger.info(`[PAYMENT WEBHOOK DUPLICATE] Event ${eventId} was already processed. Skipping.`);
      return { success: true, duplicate: true };
    }

    // Insert as in-flight / processing
    db.prepare(`
      INSERT INTO payment_events (id, event_id, provider, event_type, tenant_id, payload, processed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `).run(
      `pevt-${Date.now()}`,
      eventId,
      provider,
      eventType,
      tenantId,
      JSON.stringify(payload)
    );

    if (eventType === 'INVOICE_PAID' || eventType === 'SUBSCRIPTION_CREATED' || eventType === 'PAYMENT_SUCCESS') {
      this.upgradeSubscription(tenantId, planId || 'standard', 'MONTHLY', provider, eventId);
    }

    db.prepare('UPDATE payment_events SET processed = 1 WHERE event_id = ?').run(eventId);
    return { success: true, duplicate: false };
  },

  /**
   * Fetch transaction ledger for a tenant.
   */
  getTransactions(tenantId, limit = 50) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM credit_transactions 
      WHERE tenant_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(tenantId, limit);
  }
};
