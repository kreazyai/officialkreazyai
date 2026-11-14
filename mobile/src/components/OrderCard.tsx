// =====================================================================
// KREAZYAI ORDER CARD COMPONENT
// Supports approval workflow, advance payment alert, and PDF generation
// =====================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { Order } from '../types';
import { COLORS } from '../theme/colors';
import { Badge, BadgeVariant } from './Badge';
import { Button } from './Button';

interface OrderCardProps {
  order: Order;
  onApprove?: (order: Order) => void;
  onReject?: (order: Order) => void;
  onShareInvoice?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onApprove,
  onReject,
  onShareInvoice
}) => {
  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'CONFIRMED':
      case 'DELIVERED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getChannelIcon = () => {
    switch (order.channel) {
      case 'WHATSAPP':
        return <FontAwesome5 name="whatsapp" size={14} color={COLORS.whatsapp} />;
      case 'MESSENGER':
        return <FontAwesome5 name="facebook-messenger" size={14} color={COLORS.messenger} />;
      case 'INSTAGRAM':
        return <FontAwesome5 name="instagram" size={14} color={COLORS.instagram} />;
      default:
        return <Feather name="globe" size={14} color={COLORS.textMuted} />;
    }
  };

  const itemsPreview = (order.items || []).map(i => `${i.quantity}x ${i.productName || i.name || 'Item'}`).join(', ') || '1x Order Package';
  const isPending = order.status === 'PENDING';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, isPending && styles.pendingCardBorder]}
      onPress={() => router.push(`/order/${order.id}`)}
    >
      <View style={styles.topRow}>
        <View style={styles.orderIdGroup}>
          <Text style={styles.orderId}>{order.id}</Text>
          <View style={styles.channelBadge}>
            {getChannelIcon()}
            <Text style={styles.channelText}>{order.channel}</Text>
          </View>
        </View>
        <Badge label={order.status} variant={getStatusVariant(order.status)} />
      </View>

      <View style={styles.customerRow}>
        <Text style={styles.customerName} numberOfLines={1}>
          {order.customerName}
        </Text>
        <Text style={styles.orderTotal}>${(order.total || 0).toFixed(2)}</Text>
      </View>

      <Text style={styles.itemsPreview} numberOfLines={2}>
        {itemsPreview}
      </Text>

      {/* Advance Payment Alert (Step 5 requirement) */}
      {order.advancePaymentRequested && (
        <View style={styles.advanceAlert}>
          <Feather name="alert-circle" size={14} color={COLORS.warning} />
          <Text style={styles.advanceAlertText}>
            Manual Advance Requested ({order.advancePaymentMethod || 'bKash'} - Provide instructions)
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {isPending ? (
          <>
            <Button
              title="Approve & Reserve"
              size="sm"
              variant="success"
              icon={<Feather name="check" size={14} color="#FFFFFF" />}
              onPress={() => onApprove?.(order)}
              style={styles.actionBtn}
            />
            {onShareInvoice && (
              <Button
                title="Invoice"
                size="sm"
                variant="secondary"
                icon={<Feather name="file-text" size={14} color={COLORS.textPrimary} />}
                onPress={() => onShareInvoice?.(order)}
                style={styles.invoiceBtn}
              />
            )}
          </>
        ) : (
          <>
            <Button
              title="View Details"
              size="sm"
              variant="secondary"
              icon={<Feather name="eye" size={14} color={COLORS.textPrimary} />}
              onPress={() => router.push(`/order/${order.id}`)}
              style={styles.actionBtn}
            />
            {onShareInvoice && (
              <Button
                title="Share PDF"
                size="sm"
                variant="outline"
                icon={<Feather name="share-2" size={14} color={COLORS.textPrimary} />}
                onPress={() => onShareInvoice?.(order)}
                style={styles.invoiceBtn}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(25, 23, 38, 0.50)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderTopColor: 'rgba(167, 139, 250, 0.28)',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  pendingCardBorder: {
    borderColor: 'rgba(167, 139, 250, 0.45)',
    borderTopColor: 'rgba(167, 139, 250, 0.70)',
    backgroundColor: 'rgba(32, 28, 48, 0.65)'
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  orderIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  orderId: {
    fontFamily: 'monospace',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  channelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600'
  },
  customerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  customerName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1
  },
  orderTotal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800'
  },
  itemsPreview: {
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12
  },
  advanceAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12
  },
  advanceAlertText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    flex: 1
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorderSubtle,
    paddingTop: 12
  },
  actionBtn: {
    flex: 1
  },
  invoiceBtn: {
    paddingHorizontal: 12
  }
});

export default OrderCard;
