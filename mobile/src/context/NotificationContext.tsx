// =====================================================================
// KREAZYAI NOTIFICATION CONTEXT
// Surfaces real-time unread alerts and pushes notifications into the app
// =====================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NotificationItem } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  openNotification: (notification: NotificationItem) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshNotifications = () => {
    const list = notificationService.getNotifications();
    setNotifications(list);
    setUnreadCount(notificationService.getUnreadCount());
  };

  useEffect(() => {
    refreshNotifications();
    const unsubscribe = notificationService.onNotification(() => {
      refreshNotifications();
    });
    return unsubscribe;
  }, []);

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    refreshNotifications();
  };

  const openNotification = (item: NotificationItem) => {
    notificationService.handleDeepLink(item);
    refreshNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        openNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
