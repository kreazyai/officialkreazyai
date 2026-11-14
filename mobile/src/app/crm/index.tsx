// =====================================================================
// MODULE 5: CRM & CUSTOMER DIRECTORY
// Multi-tenant customer profiles, lifetime value, and VIP tiers
// =====================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { AmbientGlassBackground } from '../../components/AmbientGlassBackground';
import { Customer } from '../../types';
import { api } from '../../services/api';

export default function CrmScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered, setFiltered] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTier, setActiveTier] = useState<string>('ALL');

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await api.customers.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setCustomers(data);
      } else {
        const mockCustomers: Customer[] = [
          {
            id: 'c-1',
            fullName: 'Marcus Vance',
            email: 'marcus.v@example.com',
            phone: '+1 (555) 432-8812',
            customerStatus: 'ACTIVE',
            customerType: 'VIP',
            source: 'MESSENGER',
            totalOrders: 6,
            totalSpent: 890.00,
            tags: ['VIP', 'Repeat Buyer'],
            createdAt: '2026-09-12'
          },
          {
            id: 'c-2',
            fullName: 'Sarah Jenkins',
            email: 'sarah.j@example.com',
            phone: '+1 (555) 349-2190',
            customerStatus: 'ACTIVE',
            customerType: 'REGULAR',
            source: 'WHATSAPP',
            totalOrders: 3,
            totalSpent: 345.00,
            tags: ['Active Lead'],
            createdAt: '2026-10-04'
          },
          {
            id: 'c-3',
            fullName: 'Elena Rostova',
            email: 'elena@example.com',
            phone: '+1 (555) 981-4433',
            customerStatus: 'ACTIVE',
            customerType: 'NEW',
            source: 'INSTAGRAM',
            totalOrders: 1,
            totalSpent: 65.00,
            tags: ['Instagram DM'],
            createdAt: '2026-11-01'
          },
          {
            id: 'c-4',
            fullName: 'Tariq Rahman',
            email: 'tariq.r@example.com',
            phone: '+880 1711-002233',
            customerStatus: 'ACTIVE',
            customerType: 'VIP',
            source: 'WHATSAPP',
            totalOrders: 8,
            totalSpent: 1240.00,
            tags: ['VIP', 'Dhaka Flagship'],
            createdAt: '2026-08-15'
          }
        ];
        setCustomers(mockCustomers);
      }
    } catch {
      // Quiet fallback for preview mode
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    let result = customers;
    if (activeTier !== 'ALL') {
      result = result.filter(c => c.customerType === activeTier);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.fullName.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q))
      );
    }
    setFiltered(result);
  }, [customers, activeTier, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  };

  const tiers = ['ALL', 'VIP', 'REGULAR', 'NEW'];

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    const isVip = item.customerType === 'VIP';

    return (
      <TouchableOpacity
        style={styles.customerCard}
        onPress={() => router.push(`/crm/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{item.fullName.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.fullName}
            </Text>
            <Badge
              label={item.customerType}
              variant={isVip ? 'purple' : item.customerType === 'NEW' ? 'info' : 'default'}
              size="sm"
            />
          </View>

          <Text style={styles.contactText}>
            {item.phone || item.email || 'No direct contact info'}
          </Text>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              <Text style={styles.statsBold}>{item.totalOrders}</Text> Orders •{' '}
              <Text style={styles.statsBold}>${item.totalSpent.toFixed(2)}</Text> Lifetime
            </Text>
            <Text style={styles.sourceText}>via {item.source}</Text>
          </View>
        </View>

        <Feather name="chevron-right" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AmbientGlassBackground />
      <Header showBack title="Customer CRM" subtitle="Tenant Lifetime Value" />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={COLORS.textPlaceholder} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by customer name, email, or phone..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tier Filter Pills */}
      <View style={styles.tierFilterRow}>
        {tiers.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tierChip, activeTier === t && styles.activeTierChip]}
            onPress={() => setActiveTier(t)}
          >
            <Text
              style={[
                styles.tierChipText,
                activeTier === t && styles.activeTierChipText
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Customers List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderCustomerItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title="No Customers Found"
            description="Customers who interact with your WhatsApp or social channels will be profiled here."
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13
  },
  tierFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8
  },
  tierChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  activeTierChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: '#FFFFFF'
  },
  tierChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  activeTierChipText: {
    color: '#FFFFFF'
  },
  listContent: {
    padding: 16
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 10
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  customerInfo: {
    flex: 1
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  customerName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1
  },
  contactText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 6
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statsText: {
    color: COLORS.textSecondary,
    fontSize: 12
  },
  statsBold: {
    color: COLORS.textPrimary,
    fontWeight: '700'
  },
  sourceText: {
    color: COLORS.textMuted,
    fontSize: 11,
    textTransform: 'uppercase'
  }
});
