// =====================================================================
// KREAZYAI PUSH NOTIFICATION & DEEP LINKING SERVICE
// Handles order alerts, payment notifications, and route navigation
// =====================================================================

import { router } from 'expo-router';
import { NotificationItem } from '../types';

class NotificationService {
  private listeners: ((notification: NotificationItem) => void)[] = [];
  private notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      title: 'New Order Awaiting Approval',
      message: 'Order #ORD-78192 from Sarah Jenkins (WhatsApp) requires merchant confirmation.',
      type: 'ORDER_PENDING',
      read: false,
      targetId: 'ORD-78192',
      targetType: 'order',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: 'notif-2',
      title: 'Advance Payment Request',
      message: 'Customer requested manual bKash payment instructions for Order #ORD-78190.',
      type: 'PAYMENT_REQUEST',
      read: false,
      targetId: 'ORD-78190',
      targetType: 'order',
      createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    {
      id: 'notif-3',
      title: 'Low Stock Alert',
      message: 'Kreazy Oversized Hoodie is running low (only 3 units remaining).',
      type: 'INVENTORY_LOW',
      read: true,
      targetId: 'prod-hoodie-01',
      targetType: 'product',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];

  getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  markAsRead(id: string) {
    this.notifications = this.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
  }

  markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
  }

  addNotification(notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) {
    const item: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.notifications.unshift(item);
    this.listeners.forEach(cb => cb(item));
  }

  onNotification(callback: (notification: NotificationItem) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  // Deep Link Handling
  handleDeepLink(notification: NotificationItem) {
    this.markAsRead(notification.id);
    if (notification.targetType === 'order' && notification.targetId) {
      router.push(`/order/${notification.targetId}`);
    } else if (notification.targetType === 'conversation' && notification.targetId) {
      router.push(`/chat/${notification.targetId}`);
    } else if (notification.targetType === 'product') {
      router.push('/(tabs)/products');
    } else {
      router.push('/notifications');
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
