import crypto from 'crypto';
import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { whatsappService } from '../meta/whatsappService.js';
import { messengerService } from '../meta/messengerService.js';
import { instagramService } from '../meta/instagramService.js';
import { metaConnectionService } from '../meta/metaConnectionService.js';
import { whatsappConnectionService } from '../whatsapp/whatsappConnectionService.js';
import { recoveryPolicyService } from './recoveryPolicyService.js';
import { recoverySettingsService } from './recoverySettingsService.js';

export const recoveryDeliveryService = {
  /**
   * Hashes message text for deduplication and audit tracking.
   */
  hashMessage(text) {
    return crypto.createHash('sha256').update(text || '').digest('hex').slice(0, 32);
  },

  /**
   * Dispatches a recovery message or simulates it safely if dry-run is active.
   * @param {object} params
   * @param {string} params.tenantId
   * @param {object} params.candidate
   * @param {string} params.messageText
   * @param {object} params.composition
   * @returns {Promise<object>} dispatch outcome
   */
  async dispatch({ tenantId, candidate, messageText, composition }) {
    const db = getDatabase();
    const settings = await recoverySettingsService.getSettings(tenantId);
    const channel = (candidate.channel || 'WHATSAPP').toUpperCase();

    // 1. Resolve Customer & Recipient Address
    let recipient = null;
    let customer = null;
    if (candidate.customer_id) {
      customer = await db.prepare('SELECT * FROM customers WHERE id = ?').get(candidate.customer_id);
      recipient = customer?.phone || customer?.email || null;
    }

    if (!recipient) {
      // Find recipient from conversation or latest message
      const latestMsg = await db.prepare(`
        SELECT sender, text FROM messages 
        WHERE conversation_id = ? AND sender != 'ai' 
        ORDER BY created_at DESC LIMIT 1
      `).get(candidate.conversation_id);
      recipient = latestMsg?.sender || null;
    }

    const messageHash = this.hashMessage(messageText);
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const idempotencyKey = `rec_outbox_${candidate.id}_${attemptId}`;

    // 2. Evaluate Policy
    const policy = recoveryPolicyService.evaluate({
      tenantId,
      channel,
      recipient,
      lastCustomerMessageAt: candidate.last_customer_message_at,
      settings,
      customer
    });

    if (!policy.allowed) {
      logger.warn(`[RECOVERY POLICY BLOCKED] Dispatch blocked for candidate ${candidate.id} on ${channel}: ${policy.reason}`);

      const now = new Date().toISOString();
      // Record blocked attempt
      const safeCandidateId = candidate?.id || `cand-direct-${Date.now()}`;
      await db.prepare(`
        INSERT INTO recovery_attempts (
          id, tenant_id, candidate_id, channel, scheduled_at, attempted_at,
          outcome, failure_reason, policy_check_result, generation_model,
          prompt_tokens, completion_tokens, latency_ms, cost_estimate,
          message_text, message_hash, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          'BLOCKED', ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?
        )
      `).run(
        attemptId, tenantId, safeCandidateId, channel,
        now, now,
        policy.reason, JSON.stringify(policy), composition?.model || 'gpt-4o-mini',
        composition?.promptTokens || 0, composition?.completionTokens || 0,
        composition?.latencyMs || 0, composition?.costEstimate || 0,
        messageText, messageHash, now
      );

      // Record event
      const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, attempt_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, ?, 'POLICY_CHECK_BLOCKED', ?, ?)
      `).run(evId, tenantId, safeCandidateId, attemptId, JSON.stringify({ reason: policy.reason, channel }), now);

      return {
        success: false,
        outcome: 'BLOCKED',
        reason: policy.reason,
        attemptId
      };
    }

    // 3. Dry-Run Handling: Record simulated attempt without sending real message
    if (settings.dry_run) {
      const safeCandidateId = candidate?.id || `cand-direct-${Date.now()}`;
      logger.info(`[RECOVERY DRY-RUN] Simulating recovery send for candidate ${safeCandidateId} on ${channel}. Real message NOT sent.`);
      const now = new Date().toISOString();

      await db.prepare(`
        INSERT INTO recovery_attempts (
          id, tenant_id, candidate_id, channel, scheduled_at, attempted_at,
          outcome, failure_reason, policy_check_result, generation_model,
          prompt_tokens, completion_tokens, latency_ms, cost_estimate,
          message_text, message_hash, provider_response_id, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          'SIMULATED_DRY_RUN', NULL, ?, ?,
          ?, ?, ?, ?,
          ?, ?, 'sim_dry_run_prov_id', ?
        )
      `).run(
        attemptId, tenantId, safeCandidateId, channel,
        now, now,
        JSON.stringify(policy), composition?.model || 'gpt-4o-mini',
        composition?.promptTokens || 0, composition?.completionTokens || 0,
        composition?.latencyMs || 0, composition?.costEstimate || 0,
        messageText, messageHash, now
      );

      if (candidate?.id) {
        await db.prepare(`
          UPDATE recovery_candidates
          SET stage = 'DISPATCHED', state = 'COMPLETED', version = version + 1, updated_at = ?
          WHERE id = ?
        `).run(now, candidate.id);
      }

      const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, attempt_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, ?, 'MESSAGE_DISPATCHED', ?, ?)
      `).run(evId, tenantId, safeCandidateId, attemptId, JSON.stringify({ dryRun: true, channel, messageHash }), now);

      return {
        success: true,
        simulated: true,
        outcome: 'SIMULATED_DRY_RUN',
        attemptId,
        messageText
      };
    }

    // 4. Live Outbound Send via Existing Adapters
    // Step 4A: Create outbox item first (durable outbox pattern)
    const outboxNow = new Date().toISOString();
    await db.prepare(`
      INSERT INTO recovery_outbox (
        id, tenant_id, candidate_id, attempt_id, channel, recipient,
        status, idempotency_key, payload, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        'SENDING', ?, ?, ?, ?
      )
    `).run(
      `outbox-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      tenantId,
      candidate.id,
      attemptId,
      channel,
      recipient || 'unknown',
      idempotencyKey,
      JSON.stringify({ messageText, policy }),
      outboxNow,
      outboxNow
    );

    // Step 4B: Call external provider outside DB transaction
    let sendResult = { success: false };
    try {
      if (channel === 'WHATSAPP') {
        let conn = await whatsappConnectionService.getConnectionWithToken(tenantId);
        if (!conn) {
          conn = await metaConnectionService.getConnectionWithToken(tenantId, 'WHATSAPP');
        }

        if (!conn || !conn.decryptedAccessToken) {
          throw new Error('No active WhatsApp credentials found for tenant.');
        }

        const phoneNumberId = conn.phone_number_id;
        const cleanPhone = String(recipient).replace(/[^0-9]/g, '');

        if (policy.messageMode === 'TEMPLATE') {
          // Template dispatch
          sendResult = await whatsappService.sendTemplateMessage(
            phoneNumberId,
            conn.decryptedAccessToken,
            cleanPhone,
            policy.templateRequirement.name,
            policy.templateRequirement.language
          );
        } else {
          // Free-form text
          sendResult = await whatsappService.sendTextMessage(
            phoneNumberId,
            conn.decryptedAccessToken,
            cleanPhone,
            messageText
          );
        }
      } else if (channel === 'MESSENGER') {
        const conn = await metaConnectionService.getConnectionWithToken(tenantId, 'MESSENGER');
        if (!conn) throw new Error('No active Messenger connection found.');
        sendResult = await messengerService.sendTextMessage(
          conn.page_id,
          conn.decryptedAccessToken,
          recipient,
          messageText
        );
      } else if (channel === 'INSTAGRAM') {
        const conn = await metaConnectionService.getConnectionWithToken(tenantId, 'INSTAGRAM');
        if (!conn) throw new Error('No active Instagram connection found.');
        sendResult = await instagramService.sendTextMessage(
          conn.instagram_account_id || conn.page_id,
          conn.decryptedAccessToken,
          recipient,
          messageText
        );
      }
    } catch (apiErr) {
      logger.error(`[RECOVERY SEND ERROR] External dispatch failed for ${candidate.id}:`, apiErr.message);
      sendResult = { success: false, error: apiErr.message };
    }

    // Step 4C: Record results in DB after HTTP call returns
    const finalOutcome = sendResult.success ? 'DELIVERED' : 'FAILED';
    const failureReason = sendResult.success ? null : (sendResult.error || 'Provider dispatch failed');
    const providerMsgId = sendResult.messageId || sendResult.data?.messages?.[0]?.id || null;
    const finalNow = new Date().toISOString();

    // Record attempt
    await db.prepare(`
      INSERT INTO recovery_attempts (
        id, tenant_id, candidate_id, channel, scheduled_at, attempted_at,
        outcome, failure_reason, policy_check_result, generation_model,
        prompt_tokens, completion_tokens, latency_ms, cost_estimate,
        message_text, message_hash, provider_response_id, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `).run(
      attemptId, tenantId, candidate.id, channel,
      finalNow, finalNow,
      finalOutcome, failureReason, JSON.stringify(policy), composition.model,
      composition.promptTokens || 0, composition.completionTokens || 0,
      composition.latencyMs || 0, composition.costEstimate || 0,
      messageText, messageHash, providerMsgId, finalNow
    );

    // Update outbox
    await db.prepare(`
      UPDATE recovery_outbox
      SET status = ?, last_error = ?, updated_at = ?
      WHERE idempotency_key = ?
    `).run(finalOutcome === 'DELIVERED' ? 'SENT' : 'FAILED', failureReason, finalNow, idempotencyKey);

    // Update candidate stage
    if (finalOutcome === 'DELIVERED') {
      await db.prepare(`
        UPDATE recovery_candidates
        SET stage = 'DISPATCHED', state = 'COMPLETED', version = version + 1, updated_at = ?
        WHERE id = ?
      `).run(finalNow, candidate.id);

      // Also record message in conversations thread
      const msgId = `msg-rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await db.prepare(`
        INSERT INTO messages (id, conversation_id, sender, sender_name, text, is_ai, channel, tenant_id, direction, created_at)
        VALUES (?, ?, 'ai', 'Kreazy Sales Recovery', ?, 1, ?, ?, 'OUTBOUND', ?)
      `).run(msgId, candidate.conversation_id, messageText, channel, tenantId, finalNow);

      const evId = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await db.prepare(`
        INSERT INTO recovery_events (id, tenant_id, candidate_id, attempt_id, event_type, metadata, created_at)
        VALUES (?, ?, ?, ?, 'MESSAGE_DISPATCHED', ?, ?)
      `).run(evId, tenantId, candidate.id, attemptId, JSON.stringify({ channel, providerMsgId }), finalNow);
    } else {
      await db.prepare(`
        UPDATE recovery_candidates
        SET state = 'FAILED', version = version + 1, updated_at = ?
        WHERE id = ?
      `).run(finalNow, candidate.id);
    }

    return {
      success: sendResult.success,
      outcome: finalOutcome,
      attemptId,
      providerResponseId: providerMsgId,
      error: failureReason
    };
  }
};
