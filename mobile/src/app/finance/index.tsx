// =====================================================================
// MODULE 9: FINANCE & PAYMENTS — MINIMAL LUXE
// Clean volume metrics, merchant payment accounts & billing
// =====================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { AmbientGlassBackground } from '../../components/AmbientGlassBackground';

export default function FinanceScreen() {
  const [bkashNumber] = useState('01643792804');
  const [nagadNumber] = useState('01643792804');

  const receipts = [
    {
      id: 'REC-2026-089',
      plan: 'Growth AI Plan',
      amount: '$119.00',
      date: 'Nov 01, 2026',
      status: 'CLEARED'
    },
    {
      id: 'REC-2026-042',
      plan: 'Growth AI Plan',
      amount: '$119.00',
      date: 'Oct 01, 2026',
      status: 'CLEARED'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AmbientGlassBackground />
      <Header showBack title="Finance" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Financial KPIs */}
        <View style={styles.kpiGrid}>
          <StatCard
            label="Gross Volume"
            value="$24,850"
            trend="+18.4%"
            accentColor={COLORS.success}
            icon={<Feather name="trending-up" size={18} color={COLORS.success} />}
            style={styles.kpiItem}
          />
          <StatCard
            label="COD Collections"
            value="$18,420"
            accentColor={COLORS.info}
            icon={<Feather name="truck" size={18} color={COLORS.info} />}
            style={styles.kpiItem}
          />
          <StatCard
            label="Advance Payments"
            value="$6,430"
            accentColor={COLORS.warning}
            icon={<Feather name="credit-card" size={18} color={COLORS.warning} />}
            style={styles.kpiItem}
          />
          <StatCard
            label="AI Credits"
            value="875"
            accentColor={COLORS.purple}
            icon={<Feather name="cpu" size={18} color={COLORS.purple} />}
            style={styles.kpiItem}
          />
        </View>

        {/* Security Note */}
        <View style={styles.securityBox}>
          <Feather name="shield" size={14} color={COLORS.success} />
          <Text style={styles.securityText}>
            Manual verification: Always verify transaction IDs before dispatching.
          </Text>
        </View>

        {/* Merchant Accounts */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Merchant Accounts</Text>
          
          <View style={styles.walletItem}>
            <View style={styles.walletLeft}>
              <View style={[styles.walletBadge, { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}>
                <Text style={styles.walletBadgeText}>bKash</Text>
              </View>
              <View>
                <Text style={styles.walletTitle}>bKash Merchant</Text>
                <Text style={styles.walletNumber}>{bkashNumber}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => Alert.alert('Copied', `bKash: ${bkashNumber}`)}
            >
              <Feather name="copy" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.walletItem, { borderBottomWidth: 0 }]}>
            <View style={styles.walletLeft}>
              <View style={[styles.walletBadge, { backgroundColor: 'rgba(255, 255, 255, 0.12)' }]}>
                <Text style={styles.walletBadgeText}>Nagad</Text>
              </View>
              <View>
                <Text style={styles.walletTitle}>Nagad Merchant</Text>
                <Text style={styles.walletNumber}>{nagadNumber}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => Alert.alert('Copied', `Nagad: ${nagadNumber}`)}
            >
              <Feather name="copy" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ledger */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Recent Billing</Text>
          {receipts.map(rec => (
            <View key={rec.id} style={styles.receiptRow}>
              <View>
                <Text style={styles.receiptPlan}>{rec.plan}</Text>
                <Text style={styles.receiptDate}>{rec.date} • {rec.id}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={styles.receiptAmount}>{rec.amount}</Text>
                <Badge label={rec.status} variant="success" size="sm" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14
  },
  kpiItem: {
    width: '48%'
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14
  },
  securityText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  walletBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)'
  },
  walletBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  },
  walletTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  walletNumber: {
    color: '#FFFFFF',
    fontSize: 11.5,
    marginTop: 1,
    opacity: 0.8
  },
  copyBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  receiptPlan: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  receiptDate: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 2,
    opacity: 0.65
  },
  receiptAmount: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800'
  }
});
