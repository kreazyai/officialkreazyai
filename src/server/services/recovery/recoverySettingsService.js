import { getDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';

export const DEFAULT_RECOVERY_SETTINGS = {
  enabled: 0, // Disabled by default
  dry_run: 1, // Dry-run enabled by default (safety first)
  channels: JSON.stringify({ whatsapp: true, messenger: false, instagram: false }),
  min_intent_score: 0.70,
  inactivity_minutes: 30,
  quiet_hours_enabled: 1,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  timezone: 'Asia/Dhaka',
  max_daily_attempts_per_lead: 2,
  max_daily_tenant_attempts: 100,
  consent_policy: 'EXPLICIT_OR_24H',
  model_provider: 'local_ollama',
  model_name: 'qwen3:1.7b',
  max_tokens: 150,
  temperature: 0.3,
  discount_offer_percent: 0.0,
  control_group_ratio: 0.10 // 10% holdout for lift calculation
};

export const recoverySettingsService = {
  /**
   * Get settings for a tenant, initializing default row if absent.
   * @param {string} tenantId
   * @returns {object}
   */
  getSettings(tenantId) {
    if (!tenantId) throw new Error('Tenant ID is required for recovery settings.');
    const db = getDatabase();

    let settings = db.prepare('SELECT * FROM recovery_settings WHERE tenant_id = ?').get(tenantId);
    if (!settings) {
      const id = `recset-${tenantId}`;
      db.prepare(`
        INSERT OR IGNORE INTO recovery_settings (
          id, tenant_id, enabled, dry_run, channels, min_intent_score, inactivity_minutes,
          quiet_hours_enabled, quiet_hours_start, quiet_hours_end, timezone,
          max_daily_attempts_per_lead, max_daily_tenant_attempts, consent_policy,
          model_provider, model_name, max_tokens, temperature, discount_offer_percent,
          control_group_ratio, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, datetime('now'), datetime('now')
        )
      `).run(
        id,
        tenantId,
        DEFAULT_RECOVERY_SETTINGS.enabled,
        DEFAULT_RECOVERY_SETTINGS.dry_run,
        DEFAULT_RECOVERY_SETTINGS.channels,
        DEFAULT_RECOVERY_SETTINGS.min_intent_score,
        DEFAULT_RECOVERY_SETTINGS.inactivity_minutes,
        DEFAULT_RECOVERY_SETTINGS.quiet_hours_enabled,
        DEFAULT_RECOVERY_SETTINGS.quiet_hours_start,
        DEFAULT_RECOVERY_SETTINGS.quiet_hours_end,
        DEFAULT_RECOVERY_SETTINGS.timezone,
        DEFAULT_RECOVERY_SETTINGS.max_daily_attempts_per_lead,
        DEFAULT_RECOVERY_SETTINGS.max_daily_tenant_attempts,
        DEFAULT_RECOVERY_SETTINGS.consent_policy,
        DEFAULT_RECOVERY_SETTINGS.model_provider,
        DEFAULT_RECOVERY_SETTINGS.model_name,
        DEFAULT_RECOVERY_SETTINGS.max_tokens,
        DEFAULT_RECOVERY_SETTINGS.temperature,
        DEFAULT_RECOVERY_SETTINGS.discount_offer_percent,
        DEFAULT_RECOVERY_SETTINGS.control_group_ratio
      );
      settings = db.prepare('SELECT * FROM recovery_settings WHERE tenant_id = ?').get(tenantId);
    }

    return {
      ...settings,
      channels: typeof settings.channels === 'string' ? JSON.parse(settings.channels || '{}') : settings.channels,
      enabled: Boolean(settings.enabled),
      dry_run: Boolean(settings.dry_run),
      quiet_hours_enabled: Boolean(settings.quiet_hours_enabled)
    };
  },

  /**
   * Update tenant recovery settings with strict validation.
   * @param {string} tenantId
   * @param {object} updates
   * @returns {object} updated settings
   */
  updateSettings(tenantId, updates = {}) {
    if (!tenantId) throw new Error('Tenant ID is required for recovery settings update.');
    const current = this.getSettings(tenantId);
    const db = getDatabase();

    const enabled = updates.enabled !== undefined ? (updates.enabled ? 1 : 0) : (current.enabled ? 1 : 0);
    const dryRun = updates.dry_run !== undefined ? (updates.dry_run ? 1 : 0) : (current.dry_run ? 1 : 0);
    const channels = updates.channels ? JSON.stringify(updates.channels) : JSON.stringify(current.channels);
    
    const minIntentScore = typeof updates.min_intent_score === 'number'
      ? Math.max(0.1, Math.min(1.0, updates.min_intent_score))
      : current.min_intent_score;

    const inactivityMinutes = typeof updates.inactivity_minutes === 'number'
      ? Math.max(5, Math.min(1440, updates.inactivity_minutes))
      : current.inactivity_minutes;

    const quietHoursEnabled = updates.quiet_hours_enabled !== undefined
      ? (updates.quiet_hours_enabled ? 1 : 0)
      : (current.quiet_hours_enabled ? 1 : 0);

    const quietHoursStart = updates.quiet_hours_start || current.quiet_hours_start;
    const quietHoursEnd = updates.quiet_hours_end || current.quiet_hours_end;
    const timezone = updates.timezone || current.timezone;

    const maxDailyAttemptsPerLead = typeof updates.max_daily_attempts_per_lead === 'number'
      ? Math.max(1, Math.min(5, updates.max_daily_attempts_per_lead))
      : current.max_daily_attempts_per_lead;

    const maxDailyTenantAttempts = typeof updates.max_daily_tenant_attempts === 'number'
      ? Math.max(1, Math.min(10000, updates.max_daily_tenant_attempts))
      : current.max_daily_tenant_attempts;

    const consentPolicy = updates.consent_policy || current.consent_policy;
    const modelProvider = updates.model_provider || current.model_provider;
    const modelName = updates.model_name || current.model_name;
    const maxTokens = updates.max_tokens || current.max_tokens;
    const temperature = updates.temperature !== undefined ? updates.temperature : current.temperature;
    const discountOfferPercent = updates.discount_offer_percent !== undefined
      ? Math.max(0, Math.min(50, updates.discount_offer_percent))
      : current.discount_offer_percent;

    const controlGroupRatio = updates.control_group_ratio !== undefined
      ? Math.max(0, Math.min(0.5, updates.control_group_ratio))
      : current.control_group_ratio;

    db.prepare(`
      UPDATE recovery_settings
      SET enabled = ?, dry_run = ?, channels = ?, min_intent_score = ?,
          inactivity_minutes = ?, quiet_hours_enabled = ?, quiet_hours_start = ?,
          quiet_hours_end = ?, timezone = ?, max_daily_attempts_per_lead = ?,
          max_daily_tenant_attempts = ?, consent_policy = ?, model_provider = ?,
          model_name = ?, max_tokens = ?, temperature = ?, discount_offer_percent = ?,
          control_group_ratio = ?, updated_at = datetime('now')
      WHERE tenant_id = ?
    `).run(
      enabled, dryRun, channels, minIntentScore,
      inactivityMinutes, quietHoursEnabled, quietHoursStart,
      quietHoursEnd, timezone, maxDailyAttemptsPerLead,
      maxDailyTenantAttempts, consentPolicy, modelProvider,
      modelName, maxTokens, temperature, discountOfferPercent,
      controlGroupRatio, tenantId
    );

    logger.info(`[RECOVERY SETTINGS] Updated settings for tenant ${tenantId}. Enabled: ${enabled}, DryRun: ${dryRun}`);
    return this.getSettings(tenantId);
  },

  /**
   * Check if quiet hours currently apply in the given timezone.
   * @param {object} settings
   * @param {Date} [now]
   * @returns {boolean}
   */
  isQuietHour(settings, now = new Date()) {
    if (!settings.quiet_hours_enabled) return false;

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: settings.timezone || 'UTC',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      });
      const parts = formatter.formatToParts(now);
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      const currentMinutes = hour * 60 + minute;

      const [startH, startM] = (settings.quiet_hours_start || '22:00').split(':').map(Number);
      const [endH, endM] = (settings.quiet_hours_end || '08:00').split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (startMinutes > endMinutes) {
        // Over midnight (e.g. 22:00 to 08:00)
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
    } catch (err) {
      logger.warn(`[QUIET HOURS] Timezone calculation error for ${settings.timezone}:`, err.message);
      return false;
    }
  }
};
