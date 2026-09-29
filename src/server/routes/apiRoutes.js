import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { productController } from '../controllers/productController.js';
import { orderController } from '../controllers/orderController.js';
import { customerController } from '../controllers/customerController.js';
import { conversationController } from '../controllers/conversationController.js';
import { aiController } from '../controllers/aiController.js';
import { publicLeadController } from '../controllers/publicLeadController.js';
import { adminController } from '../controllers/adminController.js';
import { metaWebhookController } from '../controllers/metaWebhookController.js';
import { settingsController } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/rbac.js';
import { avatarUpload, documentUpload, handleUploadError } from '../middleware/upload.js';


export const apiRouter = Router();

// =====================================================================
// 1. PUBLIC LEAD & INTAKE ROUTES (No Auth Required)
// =====================================================================
const publicRouter = Router();
publicRouter.post('/book-demo', publicLeadController.bookDemo);
publicRouter.post('/demo', publicLeadController.bookDemo);
publicRouter.post('/founder-meeting', publicLeadController.requestFounderCall);
publicRouter.post('/contact', publicLeadController.submitContact);
apiRouter.use('/public', publicRouter);

// =====================================================================
// 2. AUTHENTICATION ROUTES
// =====================================================================
const authRouter = Router();
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/admin-login', authController.adminLogin);
authRouter.get('/me', authenticate, authController.getMe);
apiRouter.use('/auth', authRouter);

// =====================================================================
// 3. PRODUCT CATALOG ROUTES (Tenant-Scoped)
// =====================================================================
const productRouter = Router();
productRouter.use(authenticate);
productRouter.get('/', productController.getAll);
productRouter.post('/', productController.create);
productRouter.get('/:id', productController.getById);
productRouter.put('/:id', productController.update);
productRouter.delete('/:id', productController.delete);
apiRouter.use('/products', productRouter);

// =====================================================================
// 4. COMMERCE & ORDER ROUTES (Tenant-Scoped)
// =====================================================================
const orderRouter = Router();
orderRouter.use(authenticate);
orderRouter.get('/', orderController.getAll);
orderRouter.post('/', orderController.create);
orderRouter.get('/:id', orderController.getById);
orderRouter.patch('/:id/status', orderController.updateStatus);
apiRouter.use('/orders', orderRouter);

// =====================================================================
// 5. CRM & CUSTOMER ROUTES (Tenant-Scoped)
// =====================================================================
const customerRouter = Router();
customerRouter.use(authenticate);
customerRouter.get('/', customerController.getAll);
customerRouter.get('/:id', customerController.getById);
customerRouter.post('/:id/notes', customerController.addNote);
apiRouter.use('/customers', customerRouter);

// =====================================================================
// 6. CONVERSATION & CHAT ROUTES (Tenant-Scoped)
// =====================================================================
const conversationRouter = Router();
conversationRouter.use(authenticate);
conversationRouter.get('/', conversationController.getAll);
conversationRouter.get('/:id', conversationController.getById);
conversationRouter.post('/:id/messages', conversationController.sendMessage);
conversationRouter.patch('/:id', conversationController.updateStatus);
conversationRouter.post('/:id/ai-suggest', conversationController.aiSuggest);
conversationRouter.post('/inbound', conversationController.receiveIncoming);
apiRouter.use('/conversations', conversationRouter);


// =====================================================================
// 7. AI & KNOWLEDGE ROUTES (Tenant-Scoped)
// =====================================================================
const aiRouter = Router();
aiRouter.use(authenticate);
aiRouter.post('/chat', aiController.chat);
aiRouter.get('/config', aiController.getConfig);
aiRouter.put('/config', aiController.updateConfig);
apiRouter.use('/ai', aiRouter);

// =====================================================================
// 8. META INTEGRATION & WEBHOOKS
// =====================================================================
const webhookRouter = Router();
webhookRouter.get('/meta', metaWebhookController.verifyWebhook);
webhookRouter.post('/meta', metaWebhookController.handleIncoming);
apiRouter.use('/webhooks', webhookRouter);

// =====================================================================
// 9. PLATFORM ADMIN ROUTES (Super Admin Protected)
// =====================================================================
const adminRouter = Router();
adminRouter.use(authenticate, requireSuperAdmin);
adminRouter.get('/metrics', adminController.getMetrics);
adminRouter.get('/workspaces', adminController.getAllWorkspaces);
adminRouter.get('/leads', adminController.getAllLeads);
adminRouter.patch('/leads/:id/status', adminController.updateLeadStatus);
adminRouter.delete('/leads/:id', adminController.deleteLead);
adminRouter.get('/audit-logs', adminController.getAuditLogs);
apiRouter.use('/admin', adminRouter);

// =====================================================================
// 10. SETTINGS ROUTES — User Profile, Business, KYC, Team, Notifications
// =====================================================================
const settingsRouter = Router();
settingsRouter.use(authenticate);

// User profile
settingsRouter.get('/profile', settingsController.getProfile);
settingsRouter.patch('/profile', settingsController.updateProfile);
settingsRouter.patch('/password', settingsController.changePassword);
settingsRouter.post('/avatar', avatarUpload.single('avatar'), settingsController.uploadAvatar, handleUploadError);
settingsRouter.delete('/avatar', settingsController.removeAvatar);

// Business profile
settingsRouter.get('/business', settingsController.getBusinessProfile);
settingsRouter.patch('/business', settingsController.updateBusinessProfile);

// KYC
settingsRouter.get('/kyc', settingsController.getKyc);
settingsRouter.post('/kyc', settingsController.updateKyc);
settingsRouter.post('/kyc/submit', settingsController.submitKyc);
settingsRouter.get('/kyc/documents', settingsController.getDocuments);
settingsRouter.post('/kyc/documents', documentUpload.single('document'), settingsController.uploadDocument, handleUploadError);
settingsRouter.get('/kyc/documents/:id/view', settingsController.viewDocument);
settingsRouter.delete('/kyc/documents/:id', settingsController.deleteDocument);

// Team management
settingsRouter.get('/team', settingsController.getTeam);
settingsRouter.post('/team', settingsController.inviteMember);
settingsRouter.delete('/team/:id', settingsController.removeMember);

// Notification preferences
settingsRouter.get('/notifications', settingsController.getNotificationPrefs);
settingsRouter.patch('/notifications', settingsController.updateNotificationPrefs);

// API key management
settingsRouter.get('/api-keys', settingsController.getApiKeys);
settingsRouter.post('/api-keys', settingsController.createApiKey);
settingsRouter.delete('/api-keys/:id', settingsController.revokeApiKey);

apiRouter.use('/settings', settingsRouter);

