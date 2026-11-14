// =====================================================================
// MODULES DIRECTORY — MINIMAL LUXE
// Concise, essential navigation across business modules
// =====================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { AmbientGlassBackground } from '../../components/AmbientGlassBackground';

interface ModuleItem {
  id: string;
  name: string;
  route: string;
  icon: keyof typeof Feather.glyphMap;
  badge?: string;
}

export default function MoreScreen() {
  const modules: ModuleItem[] = [
    { id: 'ai-flows', name: 'AI Flows', route: '/ai-flows', icon: 'zap', badge: 'Active' },
    { id: 'ai-messages', name: 'AI Messages', route: '/ai-messages', icon: 'cpu' },
    { id: 'crm', name: 'CRM & Customers', route: '/crm', icon: 'users' },
    { id: 'inventory', name: 'Inventory', route: '/inventory', icon: 'layers' },
    { id: 'finance', name: 'Finance', route: '/finance', icon: 'dollar-sign' },
    { id: 'analytics', name: 'Analytics', route: '/analytics', icon: 'bar-chart-2' },
    { id: 'bookings', name: 'Bookings', route: '/bookings', icon: 'calendar' },
    { id: 'integrations', name: 'Integrations', route: '/integrations', icon: 'link' },
    { id: 'notifications', name: 'Notifications', route: '/notifications', icon: 'bell', badge: '2' },
    { id: 'settings', name: 'Settings', route: '/settings', icon: 'settings' }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AmbientGlassBackground />
      <Header title="Modules" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {modules.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <Feather name={item.icon} size={18} color={COLORS.primaryLight} />
                </View>
                <Text style={styles.cardTitle}>{item.name}</Text>
              </View>

              <View style={styles.cardRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Feather name="chevron-right" size={16} color="rgba(255, 255, 255, 0.45)" />
              </View>
            </TouchableOpacity>
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
    paddingBottom: 115
  },
  grid: {
    gap: 10
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  }
});
