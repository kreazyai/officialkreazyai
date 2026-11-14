// =====================================================================
// MODULE 8: INVENTORY MANAGEMENT
// Real-time stock levels, low-stock threshold alerts, and valuation
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
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Product } from '../../types';
import { api } from '../../services/api';

export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const data = await api.products.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        const mock: Product[] = [
          {
            id: 'prod-01',
            sku: 'KZY-HOODIE-BLK',
            name: 'Kreazy Cybernetic Oversized Hoodie',
            category: 'Apparel',
            price: 85.00,
            stock: 3,
            status: 'LOW_STOCK'
          },
          {
            id: 'prod-02',
            sku: 'KZY-SNKRS-01',
            name: 'Obsidian Minimalist Sneakers',
            category: 'Footwear',
            price: 145.00,
            stock: 14,
            status: 'IN_STOCK'
          },
          {
            id: 'prod-03',
            sku: 'KZY-BAG-TAC',
            name: 'Kreazy Tactical Crossbody Bag',
            category: 'Accessories',
            price: 40.00,
            stock: 22,
            status: 'IN_STOCK'
          },
          {
            id: 'prod-04',
            sku: 'KZY-CARD-TI',
            name: 'Kreazy Titanium Cardholder',
            category: 'Accessories',
            price: 65.00,
            stock: 0,
            status: 'OUT_OF_STOCK'
          }
        ];
        setProducts(mock);
      }
    } catch {
      // Quiet fallback for preview mode
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(products);
    } else {
      const q = searchQuery.toLowerCase();
      setFiltered(
        products.filter(
          p =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        )
      );
    }
  }, [products, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
  };

  const updateUnits = (id: string, delta: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newUnits = Math.max(0, p.stock + delta);
          const newStatus =
            newUnits === 0 ? 'OUT_OF_STOCK' : newUnits <= 5 ? 'LOW_STOCK' : 'IN_STOCK';
          return { ...p, stock: newUnits, status: newStatus as any };
        }
        return p;
      })
    );
  };

  const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const inventoryValue = products.reduce((acc, p) => acc + p.stock * p.price, 0);

  const renderItem = ({ item }: { item: Product }) => {
    const isOut = item.stock === 0;
    const isLow = item.stock > 0 && item.stock <= 5;

    return (
      <View style={styles.itemCard}>
        <View style={styles.topRow}>
          <Text style={styles.skuText}>{item.sku}</Text>
          <Badge
            label={isOut ? 'OUT OF STOCK' : isLow ? 'LOW STOCK ALERT' : 'HEALTHY STOCK'}
            variant={isOut ? 'danger' : isLow ? 'warning' : 'success'}
            size="sm"
          />
        </View>

        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.priceSub}>${item.price.toFixed(2)} per unit</Text>

        <View style={styles.bottomControl}>
          <Text style={styles.valuationText}>
            Valuation: ${(item.stock * item.price).toFixed(2)}
          </Text>

          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => updateUnits(item.id, -1)}
            >
              <Feather name="minus" size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.counterUnits}>
              <Text style={styles.unitsValue}>{item.stock}</Text>
            </View>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => updateUnits(item.id, 1)}
            >
              <Feather name="plus" size={14} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showBack title="Inventory Controls" subtitle="Stock Valuation & Alerts" />

      {/* Top 3 KPI metrics */}
      <View style={styles.metricsRow}>
        <StatCard
          label="Total Units"
          value={totalUnits}
          icon={<Feather name="layers" size={18} color={COLORS.primary} />}
          style={styles.metricItem}
        />
        <StatCard
          label="Low Stock Alerts"
          value={lowStockCount}
          accentColor={COLORS.warning}
          icon={<Feather name="alert-triangle" size={18} color={COLORS.warning} />}
          style={styles.metricItem}
        />
        <StatCard
          label="Valuation"
          value={`$${Math.round(inventoryValue)}`}
          accentColor={COLORS.success}
          icon={<Feather name="dollar-sign" size={18} color={COLORS.success} />}
          style={styles.metricItem}
        />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={COLORS.textPlaceholder} style={styles.searchIcon} />
        <TextInput
          placeholder="Filter inventory by SKU or product name..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Inventory List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
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
            icon="layers"
            title="No Items in Inventory"
            description="Add products from the Products tab to begin tracking stock units."
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
  metricsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8
  },
  metricItem: {
    flex: 1,
    padding: 12
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginHorizontal: 16,
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
  listContent: {
    padding: 16,
    paddingTop: 8
  },
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 10
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  skuText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700'
  },
  nameText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  priceSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 10
  },
  bottomControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorderSubtle,
    paddingTop: 10
  },
  valuationText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700'
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorderStrong
  },
  counterBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  counterUnits: {
    paddingHorizontal: 12
  },
  unitsValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800'
  }
});
