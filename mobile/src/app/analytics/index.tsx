// =====================================================================
// MODULE 10: ANALYTICS & PERFORMANCE TELEMETRY
// GMV trends, channel breakdown, and AI resolution rates
// =====================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');

  const channelBreakdown = [
    {
      name: 'WhatsApp Business',
      icon: <FontAwesome5 name="whatsapp" size={14} color={COLORS.whatsapp} />,
      share: '64%',
      revenue: '$15,904.00',
      color: COLORS.whatsapp
    },
    {
      name: 'Meta Messenger',
      icon: <FontAwesome5 name="facebook-messenger" size={14} color={COLORS.messenger} />,
      share: '22%',
      revenue: '$5,467.00',
      color: COLORS.messenger
    },
    {
      name: 'Instagram Direct',
      icon: <FontAwesome5 name="instagram" size={14} color={COLORS.instagram} />,
      share: '14%',
      revenue: '$3,479.00',
      color: COLORS.instagram
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showBack title="Analytics & Metrics" subtitle="Sales & Automation Telemetry" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Time Filter Tabs */}
        <View style={styles.rangeRow}>
          {(['7D', '30D', '90D'] as const).map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeTab, timeRange === r && styles.rangeTabActive]}
              onPress={() => setTimeRange(r)}
            >
              <Text
                style={[
                  styles.rangeTabText,
                  timeRange === r && styles.rangeTabTextActive
                ]}
              >
                {r === '7D' ? 'Last 7 Days' : r === '30D' ? 'Last 30 Days' : 'Last 90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4 Main Performance StatCards */}
        <View style={styles.grid}>
          <StatCard
            label="Gross Merchandise (GMV)"
            value="$24,850"
            trend="+18.4%"
            accentColor={COLORS.success}
            icon={<Feather name="trending-up" size={18} color={COLORS.success} />}
            style={styles.gridItem}
          />
          <StatCard
            label="Average Order Value"
            value="$112.95"
            trend="+$14.20"
            accentColor={COLORS.info}
            icon={<Feather name="shopping-bag" size={18} color={COLORS.info} />}
            style={styles.gridItem}
          />
          <StatCard
            label="AI Resolution Rate"
            value="94.8%"
            subtitle="Autonomous chats"
            accentColor={COLORS.purple}
            icon={<Feather name="cpu" size={18} color={COLORS.purple} />}
            style={styles.gridItem}
          />
          <StatCard
            label="Recovery Attribution"
            value="$4,320"
            subtitle="Stalled checkouts"
            accentColor={COLORS.primary}
            icon={<Feather name="zap" size={18} color={COLORS.primary} />}
            style={styles.gridItem}
          />
        </View>

        {/* Channel Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Revenue By Messaging Channel</Text>
          {channelBreakdown.map((ch, idx) => (
            <View key={idx} style={styles.channelRow}>
              <View style={styles.channelLeft}>
                <View style={styles.channelIconBox}>{ch.icon}</View>
                <View>
                  <Text style={styles.channelName}>{ch.name}</Text>
                  <Text style={styles.channelShare}>{ch.share} of total orders</Text>
                </View>
              </View>
              <Text style={styles.channelRev}>{ch.revenue}</Text>
            </View>
          ))}
        </View>

        {/* AI Operations Efficiency Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Autonomous Operations Efficiency</Text>
          <View style={styles.metricLine}>
            <Text style={styles.metricLabel}>Total Inbound Conversations</Text>
            <Text style={styles.metricVal}>428</Text>
          </View>
          <View style={styles.metricLine}>
            <Text style={styles.metricLabel}>Handled 100% Autonomously by AI</Text>
            <Text style={[styles.metricVal, { color: COLORS.purple }]}>406 (94.8%)</Text>
          </View>
          <View style={styles.metricLine}>
            <Text style={styles.metricLabel}>Human Handoffs Required</Text>
            <Text style={styles.metricVal}>22 (5.2%)</Text>
          </View>
          <View style={[styles.metricLine, { borderBottomWidth: 0 }]}>
            <Text style={styles.metricLabel}>Average AI Response Latency</Text>
            <Text style={[styles.metricVal, { color: COLORS.success }]}>1.4 seconds</Text>
          </View>
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
    paddingBottom: 40
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  rangeTab: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  rangeTabActive: {
    backgroundColor: 'rgba(255, 51, 75, 0.15)',
    borderColor: COLORS.primary
  },
  rangeTabText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  rangeTabTextActive: {
    color: COLORS.primary
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16
  },
  gridItem: {
    width: '48%',
    flexGrow: 1
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16
  },
  cardHeader: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorderSubtle,
    paddingBottom: 8
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorderSubtle
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  channelIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  channelName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  channelShare: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  channelRev: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800'
  },
  metricLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorderSubtle
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: 13
  },
  metricVal: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700'
  }
});
