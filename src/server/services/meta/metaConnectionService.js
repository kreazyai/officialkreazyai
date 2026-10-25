import { config } from '../../config/env.js';
import { getDatabase, ensureMetaConnections } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import { sanitizeConnection } from '../../utils/encryption.js';
import { metaTokenService } from './metaTokenService.js';
import { metaAssetService } from './metaAssetService.js';
import { whatsappService } from './whatsappService.js';
import { instagramService } from './instagramService.js';
import { messengerService } from './messengerService.js';

export const metaConnectionService = {
  /**
   * Get all 3 Meta connection records for a business workspace
   */
  getConnections(businessId, workspaceId) {
    const db = getDatabase();
    ensureMetaConnections(db, businessId, workspaceId);

    const rowsRaw = db.prepare(`
      SELECT * FROM meta_connections 
      WHERE business_id = ? 
      ORDER BY CASE platform 
        WHEN 'WHATSAPP' THEN 1 
        WHEN 'INSTAGRAM' THEN 2 
        WHEN 'MESSENGER' THEN 3 
        ELSE 4 END
    `).all(businessId);

    if (rowsRaw instanceof Promise) {
      return (async () => {
        const rows = (await rowsRaw) || [];
        const results = [];
        for (const r of rows) {
          if (r.platform === 'MESSENGER' && (!r.encrypted_access_token || r.status === 'NOT_CONNECTED')) {
            const pageId = config.messenger?.pageId;
            const pageAccessToken = config.messenger?.pageAccessToken;
            const tenantId = config.messenger?.tenantId;

            if (pageId && pageAccessToken && tenantId && businessId === tenantId) {
              const tenant = await db.prepare('SELECT id FROM businesses WHERE id = ?').get(businessId);
              if (tenant) {
                const sanitized = sanitizeConnection(r);
                results.push({
                  ...sanitized,
                  status: 'CONNECTED',
                  hasToken: true,
                  has_token: true,
                  page_id: pageId,
                  page_name: r.page_name || 'Test Facebook Page',
                  webhook_status: 'ACTIVE'
                });
                continue;
              }
            }
          }
          results.push(sanitizeConnection(r));
        }
        return results;
      })();
    }

    const rows = rowsRaw || [];
    const results = [];
    for (const r of rows) {
      if (r.platform === 'MESSENGER' && (!r.encrypted_access_token || r.status === 'NOT_CONNECTED')) {
        const pageId = config.messenger?.pageId;
        const pageAccessToken = config.messenger?.pageAccessToken;
        const tenantId = config.messenger?.tenantId;

        if (pageId && pageAccessToken && tenantId && businessId === tenantId) {
          const tenant = db.prepare('SELECT id FROM businesses WHERE id = ?').get(businessId);
          if (tenant) {
            const sanitized = sanitizeConnection(r);
            results.push({
              ...sanitized,
              status: 'CONNECTED',
              hasToken: true,
              has_token: true,
              page_id: pageId,
              page_name: r.page_name || 'Test Facebook Page',
              webhook_status: 'ACTIVE'
            });
            continue;
          }
        }
      }
      results.push(sanitizeConnection(r));
    }
    return results;
  },

  /**
   * Get connection by platform with decrypted token for internal server dispatch only
   */
  getConnectionWithToken(businessId, platform) {
    if (!businessId) return null;
    const db = getDatabase();
    const plat = (platform || '').toUpperCase();
    const rowRaw = db.prepare(`
      SELECT * FROM meta_connections 
      WHERE business_id = ? AND platform = ?
    `).get(businessId, plat);

    if (rowRaw instanceof Promise) {
      return (async () => {
        const row = await rowRaw;
        return this._resolveTokenConnection(db, businessId, plat, row, true);
      })();
    }

    return this._resolveTokenConnection(db, businessId, plat, rowRaw, false);
  },

  _resolveTokenConnection(db, businessId, plat, row, isAsync) {
    // 1. Preserved encrypted database-based OAuth connection takes precedence
    if (row && row.encrypted_access_token && row.status !== 'NOT_CONNECTED') {
      const token = metaTokenService.decrypt(
        row.encrypted_access_token,
        row.token_iv,
        row.token_tag
      );

      return {
        ...row,
        decryptedAccessToken: token
      };
    }

    // 2. Optional Render environment test page integration fallback for Messenger
    if (plat === 'MESSENGER') {
      const pageId = config.messenger?.pageId;
      const pageAccessToken = config.messenger?.pageAccessToken;
      const tenantId = config.messenger?.tenantId;

      if (pageId && pageAccessToken && tenantId) {
        if (businessId === tenantId) {
          if (isAsync) {
            return (async () => {
              const tenant = await db.prepare('SELECT id FROM businesses WHERE id = ?').get(businessId);
              if (tenant) {
                return {
                  id: row?.id || `conn-messenger-${businessId}`,
                  business_id: businessId,
                  workspace_id: row?.workspace_id || businessId,
                  platform: 'MESSENGER',
                  status: 'CONNECTED',
                  page_id: pageId,
                  page_name: row?.page_name || 'Test Facebook Page',
                  auto_reply_enabled: row?.auto_reply_enabled !== undefined ? row.auto_reply_enabled : 1,
                  ai_confidence_threshold: row?.ai_confidence_threshold || 0.75,
                  decryptedAccessToken: pageAccessToken,
                  isEnvConfigured: true
                };
              }
              logger.warn(`[MESSENGER TEST INTEGRATION] Tenant "${businessId}" does not exist in businesses table. Access denied.`);
              return null;
            })();
          }

          const tenant = db.prepare('SELECT id FROM businesses WHERE id = ?').get(businessId);
          if (tenant) {
            return {
              id: row?.id || `conn-messenger-${businessId}`,
              business_id: businessId,
              workspace_id: row?.workspace_id || businessId,
              platform: 'MESSENGER',
              status: 'CONNECTED',
              page_id: pageId,
              page_name: row?.page_name || 'Test Facebook Page',
              auto_reply_enabled: row?.auto_reply_enabled !== undefined ? row.auto_reply_enabled : 1,
              ai_confidence_threshold: row?.ai_confidence_threshold || 0.75,
              decryptedAccessToken: pageAccessToken,
              isEnvConfigured: true
            };
          }
          logger.warn(`[MESSENGER TEST INTEGRATION] Tenant "${businessId}" does not exist in businesses table. Access denied.`);
          return null;
        }
      }
    }

    return null;
  },

  /**
   * Save newly authorized credentials and assets from OAuth flow
   */
  saveConnectionFromOAuth(businessId, workspaceId, platform, tokenData, assetData = {}) {
    const db = getDatabase();
    const plat = platform.toUpperCase();
    const id = `conn-${plat.toLowerCase()}-${businessId}`;

    const encrypted = metaTokenService.encrypt(tokenData.accessToken);
    const expiresAt = tokenData.expiresIn 
      ? new Date(Date.now() + tokenData.expiresIn * 1000).toISOString()
      : null;

    let pageId = assetData.pageId || null;
    let pageName = assetData.pageName || null;
    let igId = assetData.instagramId || null;
    let igUsername = assetData.instagramUsername || null;
    let wabaId = assetData.wabaId || null;
    let phoneId = assetData.phoneNumberId || null;
    let displayNumber = assetData.displayNumber || null;

    const sql = `
      INSERT INTO meta_connections (
        id, business_id, workspace_id, platform, status,
        encrypted_access_token, token_iv, token_tag, token_expires_at,
        page_id, page_name, instagram_account_id, instagram_username,
        whatsapp_business_account_id, phone_number_id, display_phone_number, webhook_status,
        updated_at
      ) VALUES (
        ?, ?, ?, ?, 'CONNECTED',
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, 'ACTIVE',
        CURRENT_TIMESTAMP
      )
      ON CONFLICT(business_id, platform) DO UPDATE SET
        status = 'CONNECTED',
        encrypted_access_token = excluded.encrypted_access_token,
        token_iv = excluded.token_iv,
        token_tag = excluded.token_tag,
        token_expires_at = excluded.token_expires_at,
        page_id = COALESCE(excluded.page_id, meta_connections.page_id),
        page_name = COALESCE(excluded.page_name, meta_connections.page_name),
        instagram_account_id = COALESCE(excluded.instagram_account_id, meta_connections.instagram_account_id),
        instagram_username = COALESCE(excluded.instagram_username, meta_connections.instagram_username),
        whatsapp_business_account_id = COALESCE(excluded.whatsapp_business_account_id, meta_connections.whatsapp_business_account_id),
        phone_number_id = COALESCE(excluded.phone_number_id, meta_connections.phone_number_id),
        display_phone_number = COALESCE(excluded.display_phone_number, meta_connections.display_phone_number),
        webhook_status = 'ACTIVE',
        updated_at = CURRENT_TIMESTAMP
    `;

    return db.prepare(sql).run(
      id, businessId, workspaceId, plat,
      encrypted.encrypted, encrypted.iv, encrypted.tag, expiresAt,
      pageId, pageName, igId, igUsername,
      wabaId, phoneId, displayNumber
    );
  },

  /**
   * Update configuration settings (e.g. auto reply toggle, confidence threshold)
   */
  updateSettings(businessId, platform, settings = {}) {
    const db = getDatabase();
    const plat = platform.toUpperCase();

    const allowed = {};
    if (typeof settings.auto_reply_enabled === 'boolean') {
      allowed.auto_reply_enabled = settings.auto_reply_enabled ? 1 : 0;
    }
    if (typeof settings.ai_confidence_threshold === 'number') {
      allowed.ai_confidence_threshold = Math.max(0.1, Math.min(1.0, settings.ai_confidence_threshold));
    }
    if (typeof settings.catalog_sync_enabled === 'boolean') {
      allowed.catalog_sync_enabled = settings.catalog_sync_enabled ? 1 : 0;
    }

    if (Object.keys(allowed).length === 0) {
      return { changes: 0 };
    }

    const sets = Object.keys(allowed).map(k => `${k} = ?`).join(', ');
    const values = Object.values(allowed);
    values.push(new Date().toISOString(), businessId, plat);

    return db.prepare(`
      UPDATE meta_connections 
      SET ${sets}, updated_at = ?
      WHERE business_id = ? AND platform = ?
    `).run(...values);
  },

  /**
   * Disconnect integration cleanly without deleting audit history
   */
  disconnect(businessId, platform) {
    const db = getDatabase();
    const plat = platform.toUpperCase();

    return db.prepare(`
      UPDATE meta_connections SET
        status = 'NOT_CONNECTED',
        encrypted_access_token = NULL,
        token_iv = NULL,
        token_tag = NULL,
        token_expires_at = NULL,
        webhook_status = 'INACTIVE',
        updated_at = datetime('now')
      WHERE business_id = ? AND platform = ?
    `).run(businessId, plat);
  },

  /**
   * Execute real-time health probe against Meta Graph API
   */
  async probeHealth(businessId, platform) {
    const conn = await this.getConnectionWithToken(businessId, platform);
    if (!conn || !conn.decryptedAccessToken) {
      return {
        healthy: false,
        status: 'NOT_CONNECTED',
        error: 'No active connection or credentials found.'
      };
    }

    const token = conn.decryptedAccessToken;
    const plat = platform.toUpperCase();

    try {
      if (plat === 'WHATSAPP') {
        const phoneId = conn.phone_number_id;
        if (!phoneId) {
          return { healthy: false, status: 'DEGRADED', error: 'Missing phone_number_id' };
        }
        const data = await whatsappService.getPhoneNumberDetails(phoneId, token);
        return {
          healthy: true,
          status: 'CONNECTED',
          verifiedName: data.verified_name,
          displayNumber: data.display_phone_number,
          qualityRating: data.quality_rating,
          codeVerificationStatus: data.code_verification_status
        };
      }

      if (plat === 'INSTAGRAM') {
        const igId = conn.instagram_account_id;
        if (!igId) {
          return { healthy: false, status: 'DEGRADED', error: 'Missing instagram_account_id' };
        }
        const data = await instagramService.getAccountDetails(igId, token);
        return {
          healthy: true,
          status: 'CONNECTED',
          username: data.username,
          name: data.name
        };
      }

      if (plat === 'MESSENGER') {
        const pageId = conn.page_id;
        if (!pageId) {
          return { healthy: false, status: 'DEGRADED', error: 'Missing page_id' };
        }
        const data = await messengerService.getPageDetails(pageId, token);
        return {
          healthy: true,
          status: 'CONNECTED',
          pageName: data.name,
          category: data.category
        };
      }

      return { healthy: false, status: 'UNKNOWN', error: `Unsupported platform: ${platform}` };
    } catch (err) {
      logger.warn(`Health probe failed for ${plat} (${businessId}): ${err.message}`);
      return {
        healthy: false,
        status: 'DEGRADED',
        error: err.message
      };
    }
  }
};
