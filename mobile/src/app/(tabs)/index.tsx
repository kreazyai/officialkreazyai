// =====================================================================
// KREAZYAI BUSINESS WORKSPACE DASHBOARD
// Exactly matches kreazyai.com business workspace dashboard specification
// Features Welcome Greeting, Clean 14-Module Grid & Full Navigation Sidebar Drawer
// =====================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { AmbientGlassBackground } from '../../components/AmbientGlassBackground';
import { SidebarDrawer } from '../../components/SidebarDrawer';
import { FONTS } from '../../theme/typography';

interface ModuleItem {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap | string;
  iconType: 'feather' | 'fa5';
  route: string;
  badge?: string;
}

export default function WorkspaceDashboard() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Exact 14 business workspace modules matching kreazyai.com dashboard screenshot
  const modules: ModuleItem[] = [
    { id: 'home', name: 'Home', icon: 'home', iconType: 'feather', route: '/(tabs)' },
    { id: 'inbox', name: 'Inbox', icon: 'message-square', iconType: 'feather', route: '/(tabs)/inbox', badge: '3' },
    { id: 'products', name: 'Products', icon: 'package', iconType: 'feather', route: '/(tabs)/products' },
    { id: 'orders', name: 'Orders', icon: 'shopping-bag', iconType: 'feather', route: '/(tabs)/orders', badge: '2' },
    { id: 'crm', name: 'CRM', icon: 'users', iconType: 'feather', route: '/crm' },
    { id: 'ai-flows', name: 'AI Flows', icon: 'zap', iconType: 'feather', route: '/ai-flows' },
    { id: 'ai-messages', name: 'AI Messages', icon: 'cpu', iconType: 'feather', route: '/ai-messages' },
    { id: 'inventory', name: 'Inventory', icon: 'tag', iconType: 'feather', route: '/inventory' },
    { id: 'finance', name: 'Finance', icon: 'dollar-sign', iconType: 'feather', route: '/finance' },
    { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2', iconType: 'feather', route: '/analytics' },
    { id: 'bookings', name: 'Bookings', icon: 'calendar', iconType: 'feather', route: '/bookings' },
    { id: 'integrations', name: 'Integrations', icon: 'link', iconType: 'feather', route: '/integrations', badge: 'Meta' },
    { id: 'notifications', name: 'Notifications', icon: 'bell', iconType: 'feather', route: '/notifications' },
    { id: 'settings', name: 'Settings', icon: 'settings', iconType: 'feather', route: '/settings' }
  ];

  // Dynamic responsive layout math for iPhone, Android & Tablets
  const isTablet = width >= 600;
  const numColumns = isTablet ? 3 : 2;
  const hPadding = width < 360 ? 12 : 16;
  const gapSize = width < 360 ? 8 : 12;
  const cardWidth = Math.floor((width - (hPadding * 2) - ((numColumns - 1) * gapSize)) / numColumns);

  const handleModulePress = (route: string) => {
    if (route === '/(tabs)') {
      return;
    }
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 3D Dark Carbon Ribs Architecture Wallpaper */}
      <AmbientGlassBackground />

      {/* Top Header Bar */}
      <View style={[styles.header, { paddingHorizontal: hPadding }]}>
        {/* Left: Sidebar Hamburger Button + Brand Logo & Title (Side-by-side: Logo then Letters) */}
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setSidebarOpen(true)}
            activeOpacity={0.7}
            accessibilityLabel="Open Navigation Menu"
          >
            <Feather name="menu" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/logo.png')}
              style={[styles.brandLogo, width < 360 && styles.brandLogoSmall]}
              resizeMode="contain"
            />
            <View style={styles.brandTitleBox}>
              <Text style={[styles.brandTitle, width < 360 && { fontSize: 16 }]}>
                Kreazy<Text style={styles.brandTitleAccent}>AI</Text>
              </Text>
              <Text style={styles.brandSubtitle}>Your Business Workspace</Text>
            </View>
          </View>
        </View>

        {/* Right: Pricing & User Avatar */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.pricingShortcutBtn}
            onPress={() => router.push('/pricing' as any)}
            activeOpacity={0.8}
          >
            <Feather name="credit-card" size={13} color="#FFFFFF" />
            <Text style={styles.pricingShortcutText}>Pricing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.8}
            accessibilityLabel="User Profile and Settings"
          >
            <Feather name="user" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Greeting Section matching user's exact specification */}
        <View style={styles.welcomeSection}>
          {/* Autonomous Operations • 2026 Badge (Exact User Image 2) */}
          <View style={styles.badgePill}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Autonomous Operations • 2026</Text>
          </View>

          <Text style={[styles.welcomeTitle, width < 360 && { fontSize: 19 }]}>
            Welcome to your business
          </Text>
          <Text style={styles.welcomeSubtitle}>
            Choose a module to manage your operations
          </Text>
        </View>

        {/* Workspace Modules Grid (14 Modules) */}
        <View style={[styles.grid, { rowGap: gapSize }]}>
          {modules.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.moduleCard,
                {
                  width: cardWidth,
                  paddingVertical: width < 360 ? 16 : 22
                }
              ]}
              onPress={() => handleModulePress(item.route)}
              activeOpacity={0.75}
            >
              {/* Optional Notification/Alert Badge */}
              {item.badge && (
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{item.badge}</Text>
                </View>
              )}

              {/* Icon Container with Frosted Glass Squircle */}
              <View style={styles.iconContainer}>
                {item.iconType === 'feather' ? (
                  <Feather name={item.icon as any} size={width < 360 ? 20 : 22} color="#FFFFFF" />
                ) : (
                  <FontAwesome5 name={item.icon as any} size={width < 360 ? 18 : 20} color="#FFFFFF" />
                )}
              </View>

              {/* Module Name in Pure Crisp White with Inter Font */}
              <Text style={styles.moduleName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Slide-out Sidebar Drawer Navigation */}
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeRoute="home"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090D'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(10, 10, 16, 0.65)'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1
  },
  brandLogo: {
    width: 30,
    height: 30
  },
  brandLogoSmall: {
    width: 24,
    height: 24
  },
  brandTitleBox: {
    justifyContent: 'center'
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: -0.4
  },
  brandTitleAccent: {
    color: '#22C55E'
  },
  brandSubtitle: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 11,
    fontFamily: FONTS.medium,
    fontWeight: '500',
    marginTop: 0.5
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  pricingShortcutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)'
  },
  pricingShortcutText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: FONTS.bold,
    fontWeight: '700'
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 115
  },
  welcomeSection: {
    marginBottom: 20
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(26, 24, 38, 0.70)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.30)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  badgeDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.5,
    backgroundColor: '#A78BFA',
    marginRight: 8,
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontFamily: FONTS.semiBold,
    fontWeight: '600',
    letterSpacing: 0.3
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6
  },
  welcomeSubtitle: {
    color: '#FFFFFF',
    opacity: 0.7,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  moduleCard: {
    backgroundColor: 'rgba(25, 23, 38, 0.45)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopColor: 'rgba(167, 139, 250, 0.28)',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(167, 139, 250, 0.30)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.50)'
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontFamily: FONTS.bold,
    fontWeight: '900'
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  moduleName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    textAlign: 'center'
  }
});
