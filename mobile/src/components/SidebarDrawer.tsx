// =====================================================================
// KREAZYAI LUXE SIDEBAR DRAWER COMPONENT
// Inspired by kreazyai.com Dashboard Sidebar
// Provides clean slide-out navigation across all business modules & pricing
// =====================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Easing,
  Platform,
  Alert,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { FONTS } from '../theme/typography';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
  badge?: string;
  highlight?: boolean;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  activeRoute = 'home'
}) => {
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'home', route: '/(tabs)' },
    { id: 'inbox', label: 'Inbox', icon: 'message-square', route: '/(tabs)/inbox', badge: '3' },
    { id: 'products', label: 'Products', icon: 'package', route: '/(tabs)/products' },
    { id: 'orders', label: 'Orders', icon: 'shopping-bag', route: '/(tabs)/orders', badge: '2' },
    { id: 'crm', label: 'CRM', icon: 'users', route: '/crm' },
    { id: 'ai-flows', label: 'AI Flows', icon: 'zap', route: '/ai-flows', highlight: true },
    { id: 'ai-messages', label: 'AI Messages', icon: 'cpu', route: '/ai-messages' },
    { id: 'inventory', label: 'Inventory', icon: 'tag', route: '/inventory' },
    { id: 'finance', label: 'Finance', icon: 'dollar-sign', route: '/finance' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart-2', route: '/analytics' },
    { id: 'bookings', label: 'Bookings', icon: 'calendar', route: '/bookings' },
    { id: 'integrations', label: 'Integrations', icon: 'link', route: '/integrations', badge: 'Meta' },
    { id: 'pricing', label: 'Pricing & Plans', icon: 'credit-card', route: '/pricing', badge: 'Pro', highlight: true },
    { id: 'notifications', label: 'Notifications', icon: 'bell', route: '/notifications' },
    { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  const handleNavigate = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 150);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      onClose();
      router.replace('/');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Backdrop Tappable */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        {/* Sidebar Panel */}
        <SafeAreaView style={styles.sidebarPanel} edges={['top', 'bottom', 'left']}>
          {/* Header Brand */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.logoBox}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.brandTitle}>
                  Kreazy<Text style={styles.brandTitleAccent}>AI</Text>
                </Text>
                <Text style={styles.brandSub}>Your Business Workspace</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Current Subscription Pill */}
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handleNavigate('/pricing')}
            activeOpacity={0.8}
          >
            <View style={styles.planLeft}>
              <View style={styles.planDot} />
              <View>
                <Text style={styles.planTitle}>Growth AI Plan</Text>
                <Text style={styles.planSub}>Active • 5,000 AI chats / mo</Text>
              </View>
            </View>
            <View style={styles.upgradeBtn}>
              <Text style={styles.upgradeText}>Pricing</Text>
              <Feather name="chevron-right" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {/* Nav Links */}
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionHeading}>MODULES & WORKSPACE</Text>
            {navItems.map((item) => {
              const isActive = activeRoute === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.navItem,
                    isActive && styles.navItemActive,
                    item.highlight && styles.navItemHighlight
                  ]}
                  onPress={() => handleNavigate(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.navItemLeft}>
                    <View style={[styles.navIconBox, isActive && styles.navIconBoxActive]}>
                      <Feather name={item.icon} size={17} color="#FFFFFF" />
                    </View>
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                      {item.label}
                    </Text>
                  </View>

                  <View style={styles.navItemRight}>
                    {item.badge && (
                      <View style={[styles.navBadge, item.highlight && styles.navBadgeHighlight]}>
                        <Text style={styles.navBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <Feather name="chevron-right" size={15} color="rgba(255, 255, 255, 0.4)" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer User & Sign Out */}
          <View style={styles.footer}>
            <View style={styles.userRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {(user?.storeName || 'K').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.storeName || 'Kreazy Flagship Studio'}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {user?.email || 'merchant@kreazyai.com'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
              <Feather name="log-out" size={16} color="#FFFFFF" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  sidebarPanel: {
    width: '84%',
    maxWidth: 340,
    height: '100%',
    backgroundColor: 'rgba(10, 10, 16, 0.96)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000000',
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  logoImage: {
    width: 28,
    height: 28
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  brandTitleAccent: {
    color: '#22C55E'
  },
  brandSub: {
    color: '#FFFFFF',
    opacity: 0.65,
    fontSize: 11,
    fontFamily: FONTS.medium,
    fontWeight: '500'
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  planCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  planDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#A78BFA',
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700'
  },
  planSub: {
    color: '#FFFFFF',
    opacity: 0.65,
    fontSize: 10.5,
    fontFamily: FONTS.regular,
    marginTop: 1
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)'
  },
  upgradeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  scrollList: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4
  },
  sectionHeading: {
    color: '#FFFFFF',
    opacity: 0.5,
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingHorizontal: 6
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'transparent'
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)'
  },
  navItemHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)'
  },
  navItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  navIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  navIconBoxActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)'
  },
  navLabel: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontFamily: FONTS.medium,
    fontWeight: '600'
  },
  navLabelActive: {
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  navItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  navBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.20)'
  },
  navBadgeHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)'
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: FONTS.bold,
    fontWeight: '800'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: FONTS.bold,
    fontWeight: '700'
  },
  userEmail: {
    color: '#FFFFFF',
    opacity: 0.6,
    fontSize: 11,
    fontFamily: FONTS.regular
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)'
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontFamily: FONTS.bold,
    fontWeight: '700'
  }
});

export default SidebarDrawer;
