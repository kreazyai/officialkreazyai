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
import { metaRouter } from './metaRoutes.js';
import { faqController } from '../controllers/faqController.js';
import { policyController } from '../controllers/policyController.js';
import { aiSettingsController } from '../controllers/aiSettingsController.js';
import { whatsappController } from '../controllers/whatsappController.js';
import { recoveryController } from '../controllers/recoveryController.js';
import { dashboardMetricsController } from '../controllers/dashboardMetricsController.js';
import { billingController } from '../controllers/billingController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/rbac.js';
import { avatarUpload, documentUpload, handleUploadError } from '../middleware/upload.js';
import { errorResponse, API_ERROR_CODES, HTTP_STATUS } from '../utils/response.js';

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
authRouter.post('/admin-login/', authController.adminLogin);
authRouter.get('/admin-login', (req, res) => {
  res.setHeader('Allow', 'POST');
  return errorResponse(res, 'Admin login requires HTTP POST with email and password.', API_ERROR_CODES.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED);
});
authRouter.get('/admin-login/', (req, res) => {
  res.setHeader('Allow', 'POST');
  return errorResponse(res, 'Admin login requires HTTP POST with email and password.', API_ERROR_CODES.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED);
});
authRouter.post('/send-otp', authController.sendOtp);
authRouter.post('/verify-otp', authController.verifyOtp);
authRouter.post('/resend-otp', authController.sendOtp);
authRouter.post('/google', authController.googleAuth);
authRouter.get('/google/config', authController.googleConfig);
authRouter.post('/forgot-password', authController.forgotPassword);
authRouter.post('/reset-password', authController.resetPassword);
authRouter.get('/me', authenticate, authController.getMe);
apiRouter.use('/auth', authRouter);

// Public Intake for AI Career Bootcamp with Sadat Sakib
apiRouter.post('/bootcamp/register', adminController.registerBootcamp);

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
// 7. DASHBOARD METRICS ROUTES (Tenant-Scoped, Timezone-Aware)
// =====================================================================
const dashboardRouter = Router();
dashboardRouter.use(optionalAuth);
dashboardRouter.get('/overview-metrics', dashboardMetricsController.getOverviewMetrics);
apiRouter.use('/dashboard', dashboardRouter);

// =====================================================================
// 8. SIMPLIFIED ANALYTICS SUMMARY ROUTES (Tenant-Scoped)
// =====================================================================
const analyticsRouter = Router();
analyticsRouter.use(optionalAuth);
analyticsRouter.get('/summary', dashboardMetricsController.getAnalyticsMetrics);
analyticsRouter.get('/metrics', dashboardMetricsController.getAnalyticsMetrics);
apiRouter.use('/analytics', analyticsRouter);

// =====================================================================
// 8.5. SIMPLIFIED REVENUE METRICS ROUTES (Tenant-Scoped)
// =====================================================================
const revenueRouter = Router();
revenueRouter.use(optionalAuth);
revenueRouter.get('/metrics', dashboardMetricsController.getRevenueMetrics);
revenueRouter.get('/summary', dashboardMetricsController.getRevenueMetrics);
apiRouter.use('/revenue', revenueRouter);

// =====================================================================
// 9. AI & KNOWLEDGE ROUTES (Tenant-Scoped)
// =====================================================================
const aiRouter = Router();
aiRouter.use(authenticate);
aiRouter.post('/chat', aiController.chat);
aiRouter.get('/config', aiController.getConfig);
aiRouter.put('/config', aiController.updateConfig);
aiRouter.get('/settings', aiSettingsController.getSettings);
aiRouter.put('/settings', aiSettingsController.updateSettings);
apiRouter.use('/ai', aiRouter);

// =====================================================================
// 8. TENANT-SCOPED KNOWLEDGE BASE: FAQS & POLICIES
// =====================================================================
const faqRouter = Router();
faqRouter.use(authenticate);
faqRouter.get('/', faqController.getAll);
faqRouter.post('/', faqController.create);
faqRouter.get('/:id', faqController.getById);
faqRouter.put('/:id', faqController.update);
faqRouter.delete('/:id', faqController.delete);
apiRouter.use('/faqs', faqRouter);

const policyRouter = Router();
policyRouter.use(authenticate);
policyRouter.get('/', policyController.getAll);
policyRouter.post('/', policyController.create);
policyRouter.get('/:id', policyController.getById);
policyRouter.put('/:id', policyController.update);
policyRouter.delete('/:id', policyController.delete);
apiRouter.use('/policies', policyRouter);

// =====================================================================
// 9. DEDICATED WHATSAPP BUSINESS PLATFORM INTEGRATION
// =====================================================================
const whatsappRouter = Router();
whatsappRouter.use(authenticate);
whatsappRouter.get('/connection', whatsappController.getConnection);
whatsappRouter.get('/wallet', whatsappController.getWallet);
whatsappRouter.get('/transactions', whatsappController.getTransactions);
whatsappRouter.post('/upgrade-plan', whatsappController.upgradePlan);
whatsappRouter.post('/embedded-signup/session', whatsappController.initiateEmbeddedSignup);
whatsappRouter.post('/embedded-signup/callback', whatsappController.completeEmbeddedSignup);
whatsappRouter.get('/qr-session', whatsappController.getQrSession);
whatsappRouter.post('/pair-qr', whatsappController.pairWithQr);
whatsappRouter.post('/connect-phone', whatsappController.connectPhone);
whatsappRouter.post('/configure-credentials', whatsappController.configureCredentials);
whatsappRouter.patch('/auto-reply', whatsappController.updateAutoReply);
whatsappRouter.post('/connect', whatsappController.connect);
whatsappRouter.post('/reconnect', whatsappController.reconnect);
whatsappRouter.post('/disconnect', whatsappController.disconnect);
whatsappRouter.get('/observability', whatsappController.getObservability);
whatsappRouter.get('/ai-health', whatsappController.getAiHealth);
whatsappRouter.post('/health-check', whatsappController.healthCheck);
whatsappRouter.post('/test-message', whatsappController.testMessage);
apiRouter.use('/whatsapp', whatsappRouter);

// =====================================================================
// 10. META INTEGRATION & WEBHOOKS (Official Graph & Cloud API Suite)
// =====================================================================
apiRouter.use('/meta', metaRouter);
apiRouter.use('/webhooks', metaRouter); // alias for backward compatibility

// =====================================================================
// 9. PLATFORM ADMIN ROUTES (Super Admin Protected)
// =====================================================================
const adminRouter = Router();
adminRouter.use(authenticate, requireSuperAdmin);

// Core Statistical Metrics & Telemetry
adminRouter.get('/metrics', adminController.getMetrics);
adminRouter.get('/stats', adminController.getMetrics);

// Real User Management
adminRouter.get('/users', adminController.getUsers);
adminRouter.get('/users/:id', adminController.getUserById);

// Real Business / Workspace Management
adminRouter.get('/businesses', adminController.getAllWorkspaces);
adminRouter.get('/businesses/:id', adminController.getBusinessById);
adminRouter.patch('/businesses/:id/status', adminController.toggleBusinessStatus);
adminRouter.get('/workspaces', adminController.getAllWorkspaces);

// Integrations Status & Overview
adminRouter.get('/integrations', adminController.getIntegrations);

// Automation Workflows
adminRouter.get('/automations', adminController.getAutomations);

// Real Activity & Audit Stream
adminRouter.get('/activity', adminController.getAuditLogs);
adminRouter.get('/audit-logs', adminController.getAuditLogs);

// System Health
adminRouter.get('/system-health', adminController.getSystemHealth);
adminRouter.get('/health', adminController.getSystemHealth);

// Public Demo & Lead Intake Management
adminRouter.get('/leads', adminController.getAllLeads);
adminRouter.patch('/leads/:id/status', adminController.updateLeadStatus);
adminRouter.delete('/leads/:id', adminController.deleteLead);

// Secure Super-Admin Database Backup & Extraction (SQLite-to-PostgreSQL Migration)
adminRouter.get('/database/export', adminController.exportDatabase);
adminRouter.get('/database/backup', adminController.exportDatabase);

// Billing & Payment Invoices Verification
adminRouter.get('/invoices', adminController.getInvoices);
adminRouter.patch('/invoices/:id/verify', adminController.verifyInvoice);

// Customer Dashboard Impersonation
adminRouter.post('/impersonate/:id', adminController.impersonateUser);

// Multi-Tenant Inventory Inspection
adminRouter.get('/tenants-inventory', adminController.getTenantsInventory);
adminRouter.get('/tenants-inventory/:businessId', adminController.getTenantProducts);

// Schedule & Bookings Management
adminRouter.get('/schedule', adminController.getScheduleBookings);
adminRouter.patch('/schedule/:type/:id', adminController.updateScheduleStatus);

// Sign-Up Records & Login Sessions
adminRouter.get('/signups', adminController.getSignups);
adminRouter.get('/logins', adminController.getLoginSessions);

// AI Career Bootcamp Management (Sadat Sakib Masterclass)
adminRouter.get('/bootcamp-registrations', adminController.getBootcampRegistrations);
adminRouter.patch('/bootcamp-registrations/:id/status', adminController.updateBootcampStatus);
adminRouter.delete('/bootcamp-registrations/:id', adminController.deleteBootcampRegistration);

apiRouter.use('/admin', adminRouter);

// =====================================================================
// 10. SETTINGS ROUTES — User Profile, Business, KYC, Team, Notifications
// =====================================================================
const settingsRouter = Router();
settingsRouter.use(authenticate);

// User profile
settingsRouter.get('/profile', settingsController.getProfile);
settingsRouter.patch('/profile', settingsController.updateProfile);
settingsRouter.put('/profile', settingsController.updateProfile);
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
settingsRouter.put('/notifications', settingsController.updateNotificationPrefs);

// API key management
settingsRouter.get('/api-keys', settingsController.getApiKeys);
settingsRouter.post('/api-keys', settingsController.createApiKey);
settingsRouter.delete('/api-keys/:id', settingsController.revokeApiKey);

// Public avatar viewing for <img> tags
apiRouter.get('/settings/avatar/:userId/:filename', settingsController.viewAvatar);
apiRouter.get('/settings/avatar/:filename', settingsController.viewAvatar);

apiRouter.use('/settings', settingsRouter);

// =====================================================================
// 11. SMART SALES RECOVERY AGENT ROUTES (Tenant-Scoped)
// =====================================================================
const recoveryRouter = Router();
recoveryRouter.use(authenticate);
recoveryRouter.get('/overview', recoveryController.getOverview);
recoveryRouter.get('/candidates', recoveryController.getCandidates);
recoveryRouter.get('/candidates/:id', recoveryController.getCandidateById);
recoveryRouter.post('/candidates/:id/cancel', recoveryController.cancelCandidate);
recoveryRouter.post('/candidates/:id/retry', recoveryController.retryCandidate);
recoveryRouter.get('/settings', recoveryController.getSettings);
recoveryRouter.put('/settings', recoveryController.updateSettings);
recoveryRouter.get('/events', recoveryController.getEvents);
recoveryRouter.post('/simulate', recoveryController.simulateIntent);
recoveryRouter.post('/trigger-worker', recoveryController.triggerWorkerTick);
apiRouter.use('/recovery', recoveryRouter);

// =====================================================================
// 12. BILLING & SUBSCRIPTIONS ROUTES (Tenant-Scoped)
// =====================================================================
const billingRouter = Router();
billingRouter.use(authenticate);
billingRouter.get('/details', billingController.getDetails);
billingRouter.post('/change-plan', billingController.changePlan);
billingRouter.post('/cancel-plan', billingController.cancelPlan);
billingRouter.post('/cancel', billingController.cancelPlan);
billingRouter.post('/submit-payment', billingController.submitPayment);
billingRouter.post('/pay', billingController.submitPayment);
billingRouter.post('/update-method', billingController.updatePaymentMethod);
apiRouter.use('/billing', billingRouter);


