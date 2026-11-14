// =====================================================================
// MODULE 13: PUSH NOTIFICATIONS & REAL-TIME ALERTS
// Deep-linking notification stream for pending orders and advance payments
// =====================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationItem } from '../../types';

export default function NotificationsScreen() {
  const { notifications, unreadCount, openNotification, markAllAsRead } = useNotifications();

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ORDER_PENDING':
        return <Feather name="shopping-bag" size={18} color={COLORS.primary} />;
      case 'PAYMENT_REQUEST':
        return <Feather name="credit-card" size={18} color={COLORS.warning} />;
      case 'INVENTORY_LOW':
        return <Feather name="alert-triangle" size={18} color={COLORS.warning} />;
      case 'AI_HANDOFF':
        return <Feather name="user-check" size={18} color={COLORS.purple} />;
      default:
        return <Feather name="bell" size={18} color={COLORS.info} />;
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => openNotification(item)}
      activeOpacity={0.8}
    >
      <View style={styles.iconCircle}>{getIcon(item.type)}</View>

      <View style={styles.contentCol}>
        <View style={styles.topRow}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.itemMessage}>{item.message}</Text>
        <Text style={styles.itemDate}>Tap to review & respond</Text>
      </View>

      <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        showBack
        title="Notifications"
        subtitle={`${unreadCount} unread alerts`}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markReadBtn}>
              <Text style={styles.markReadText}>Mark Read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="All Caught Up"
            description="You have no pending notifications. Alerts about new customer orders and advance payment requests will appear here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  listContent: {
    padding: 16
  },
  markReadBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  markReadText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10
  },
  unreadCard: {
    borderColor: 'rgba(255, 51, 75, 0.35)',
    backgroundColor: '#141824'
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  contentCol: {
    flex: 1,
    marginRight: 8
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  itemTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary
  },
  itemMessage: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4
  },
  itemDate: {
    color: COLORS.textMuted,
    fontSize: 11
  }
});
