import { Router } from 'express';
import { metaController } from '../controllers/metaController.js';
import { optionalAuth } from '../middleware/auth.js';

export const metaRouter = Router();

// ── 1. Webhook Handshake & Ingestion (Public Meta Endpoints) ───────────────
metaRouter.get('/webhook', metaController.verifyWebhook);
metaRouter.post('/webhook', metaController.handleWebhook);
metaRouter.get('/meta', metaController.verifyWebhook);
metaRouter.post('/meta', metaController.handleWebhook);

// ── 2. OAuth Callback from Meta (Public redirect) ─────────────────────────
metaRouter.get('/oauth/callback', metaController.handleOAuthCallback);

// ── 3. Merchant Connection Management (JWT or Tenant-Scoped) ─────────────
metaRouter.use(optionalAuth);

metaRouter.post('/connect', metaController.initiateConnect);
metaRouter.get('/connections', metaController.getConnections);
metaRouter.post('/test-simulate', metaController.simulateTestEvent);
metaRouter.post('/:connectionId/test', metaController.testConnection);
metaRouter.post('/:connectionId/reconnect', metaController.reconnect);
metaRouter.delete('/:connectionId', metaController.disconnect);
metaRouter.patch('/:connectionId/settings', metaController.updateSettings);
