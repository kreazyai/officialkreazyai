// =====================================================================
// KREAZYAI INVOICE MODAL COMPONENT
// Preview invoice details, generate PDF, and share to messaging channels
// =====================================================================

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import { Button } from './Button';
import { shareInvoice, generateInvoicePdf } from '../services/invoiceGenerator';

interface InvoiceModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  visible,
  order,
  onClose
}) => {
  const { user, business } = useAuth();
  const [sharing, setSharing] = useState(false);

  if (!order) return null;

  const storeName = business?.name || user?.storeName || 'KreazyAI Store';

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareInvoice({ order, user, business });
    } catch (err: any) {
      Alert.alert('Invoice Generation', err.message || 'Unable to share invoice.');
    } finally {
      setSharing(false);
    }
  };

  const handlePrint = async () => {
    try {
      const { uri } = await generateInvoicePdf({ order, user, business });
      Alert.alert('Invoice PDF Generated', `PDF ready at:\n${uri}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate PDF.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Branded Tax Invoice</Text>
              <Text style={styles.headerSubtitle}>Official KreazyAI PDF Preview</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {/* Branded Store Badge */}
            <View style={styles.brandBox}>
              <View style={styles.brandAvatar}>
                <Text style={styles.brandAvatarText}>{storeName.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.brandName}>{storeName}</Text>
                <Text style={styles.brandSub}>Invoice #{order.id}</Text>
              </View>
            </View>

            {/* Bill To */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Customer Information</Text>
              <Text style={styles.valueText}>{order.customerName}</Text>
              {order.customerPhone && <Text style={styles.subText}>Phone: {order.customerPhone}</Text>}
              {order.customerEmail && <Text style={styles.subText}>Email: {order.customerEmail}</Text>}
            </View>

            {/* Line Items */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Line Items</Text>
              {(order.items || []).map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.productName || item.name || 'Product'}</Text>
                    <Text style={styles.itemSku}>Qty: {item.quantity || 1}</Text>
                  </View>
                  <Text style={styles.itemPrice}>
                    ${((item.totalPrice || item.unitPrice || 0) * (item.quantity || 1)).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={styles.totalBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalVal}>${(order.subtotal || order.total || 0).toFixed(2)}</Text>
              </View>
              {Boolean(order.discount) && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={[styles.totalVal, { color: COLORS.success }]}>-${order.discount?.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Total Amount</Text>
                <Text style={styles.grandTotalVal}>${(order.total || 0).toFixed(2)}</Text>
              </View>
            </View>

            {/* Mandatory Brand Footer requirement */}
            <View style={styles.footerNote}>
              <Feather name="shield" size={14} color={COLORS.primary} />
              <Text style={styles.footerText}>Powered by KreazyAI • Verified Delivery Note</Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerActions}>
            <Button
              title="Share PDF to Channel"
              icon={<Feather name="share-2" size={16} color="#FFFFFF" />}
              loading={sharing}
              onPress={handleShare}
              style={{ flex: 1 }}
            />
            <Button
              title="Print"
              variant="secondary"
              icon={<Feather name="printer" size={16} color={COLORS.textPrimary} />}
              onPress={handlePrint}
              style={{ width: 90 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  content: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center'
  },
  body: {
    maxHeight: 460
  },
  bodyContent: {
    padding: 20
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 20
  },
  brandAvatar: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20
  },
  brandName: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  brandSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: 'monospace'
  },
  section: {
    marginBottom: 18
  },
  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  valueText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  subText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorderSubtle
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600'
  },
  itemSku: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  itemPrice: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  totalBox: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginVertical: 12
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  totalLabel: {
    color: COLORS.textMuted,
    fontSize: 13
  },
  totalVal: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600'
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    marginTop: 8,
    paddingTop: 10
  },
  grandTotalLabel: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800'
  },
  grandTotalVal: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800'
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 12
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.surface
  }
});

export default InvoiceModal;
