// =====================================================================
// KREAZYAI CORE DATA MODEL & TYPE DEFINITIONS
// Matches backend Express & SQLite/Postgres schemas
// =====================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'SUPER_ADMIN';
  businessId: string;
  business_id?: string;
  workspaceId?: string;
  storeName?: string;
  avatarUrl?: string | null;
  phone?: string;
  is_super_admin?: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: 'ACTIVE' | 'SUSPENDED';
  ownerName?: string;
  ownerEmail?: string;
  legalName?: string;
  businessType?: string;
  businessCategory?: string;
  businessDescription?: string;
  website?: string;
  businessEmail?: string;
  businessPhone?: string;
  baseCurrency?: string;
  timezone?: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId?: string | null;
  product_id?: string | null;
  productName?: string;
  product_name?: string;
  name?: string;
  productSku?: string;
  product_sku?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  unit_price?: number;
  price?: number;
  totalPrice?: number;
  total_price?: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  businessId?: string;
  business_id?: string;
  customerId?: string | null;
  customer_id?: string | null;
  customerName: string;
  customer_name?: string;
  customerEmail?: string;
  customer_email?: string;
  customerPhone?: string;
  customer_phone?: string;
  status: OrderStatus;
  channel: 'WHATSAPP' | 'MESSENGER' | 'INSTAGRAM' | 'DIRECT';
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  paymentStatus?: 'PENDING_VERIFICATION' | 'PAID' | 'COD_ON_DELIVERY' | 'REFUNDED';
  advancePaymentRequested?: boolean;
  advancePaymentMethod?: 'bKash' | 'Nagad' | 'Card';
  advancePaymentAmount?: number;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    notes?: string;
  };
  shipping_address?: string;
  items: OrderItem[];
  invoiceUrl?: string;
  invoiceGeneratedAt?: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  businessId?: string;
  business_id?: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'LOW_STOCK';
  imageUrl?: string | null;
  image_url?: string | null;
  description?: string;
  variants?: any[];
  aiKnowledge?: string;
  ai_knowledge?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  businessId?: string;
  fullName: string;
  full_name?: string;
  email?: string;
  phone?: string;
  customerStatus: 'ACTIVE' | 'INACTIVE';
  customerType: 'REGULAR' | 'VIP' | 'NEW';
  source: string;
  totalOrders: number;
  total_orders?: number;
  totalSpent: number;
  total_spent?: number;
  tags?: string[];
  notes?: { id: string; text: string; date: string; author: string }[];
  createdAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'CUSTOMER' | 'MERCHANT' | 'AI';
  senderName?: string;
  text: string;
  isAi?: boolean;
  channel: 'WHATSAPP' | 'MESSENGER' | 'INSTAGRAM' | 'DIRECT';
  createdAt: string;
}

export interface Conversation {
  id: string;
  businessId?: string;
  customerId?: string | null;
  customerName: string;
  customer_name?: string;
  customerAvatar?: string;
  channel: 'WHATSAPP' | 'MESSENGER' | 'INSTAGRAM' | 'DIRECT';
  unread: number;
  status: 'ACTIVE' | 'CLOSED' | 'WAITING_HUMAN';
  lastMessage?: string;
  lastMessageTime?: string;
  last_message_time?: string;
  suggestedReply?: string;
  aiPaused?: boolean;
  createdAt?: string;
}

export interface DashboardMetrics {
  totalRevenue: number;
  todayRevenue: number;
  ordersCount: number;
  pendingApprovalCount: number;
  activeConversationsCount: number;
  aiAutomationRate: number;
  inventoryAlertsCount: number;
  recoveredRevenue: number;
}

export interface RecoveryCandidate {
  id: string;
  tenantId?: string;
  conversationId: string;
  customerName?: string;
  channel: string;
  intentScore: number;
  intentCategory: string;
  intentReason?: string;
  buyingSignals: string[];
  lastCustomerMessageText?: string;
  stage: 'IDENTIFIED' | 'SCHEDULED' | 'SENT' | 'RECOVERED' | 'DISMISSED';
  state: 'PENDING' | 'ATTEMPTED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface PolicyItem {
  id: string;
  policyType: string;
  content: string;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'ORDER_PENDING' | 'PAYMENT_REQUEST' | 'INVENTORY_LOW' | 'AI_HANDOFF' | 'SYSTEM';
  read: boolean;
  targetId?: string;
  targetType?: 'order' | 'conversation' | 'product';
  createdAt: string;
}

export interface Booking {
  id: string;
  fullName: string;
  full_name?: string;
  workEmail?: string;
  work_email?: string;
  phone?: string;
  companyName?: string;
  company_name?: string;
  primaryUseCase?: string;
  primary_use_case?: string;
  preferredDate?: string;
  preferred_date?: string;
  preferredTime?: string;
  preferred_time?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: 'DEMO' | 'FOUNDER_MEETING' | 'BOOTCAMP';
  createdAt: string;
}
