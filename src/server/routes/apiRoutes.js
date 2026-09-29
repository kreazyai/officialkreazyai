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
import { authenticate } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/rbac.js';

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
