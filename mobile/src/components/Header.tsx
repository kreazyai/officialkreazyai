// =====================================================================
// KREAZYAI BRANDED HEADER COMPONENT
// Shows store identity, live connection status beacon, and notifications
// =====================================================================

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { COLORS } from '../theme/colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  showBrandLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
  showBrandLogo = false
}) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const storeName = user?.storeName || 'KreazyAI Store';
  const avatarUrl = user?.avatarUrl;

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="chevron-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/settings')}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{storeName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.onlineBeacon} />
          </TouchableOpacity>
        )}

        {showBrandLogo ? (
          <View style={styles.brandRow}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
            <View style={styles.titleColumn}>
              <Text style={styles.titleText} numberOfLines={1}>
                {title || 'KreazyAI'}
              </Text>
              <Text style={styles.subtitleText} numberOfLines={1}>
                {subtitle || 'AI Commerce Hub'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.titleColumn}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title || storeName}
            </Text>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle || 'AI Commerce Hub'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.rightRow}>
        {rightAction ? (
          rightAction
        ) : (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={20} color={COLORS.textSecondary} />
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: 'rgba(11, 11, 16, 0.75)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        } as any)
      : {})
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)'
  },
  avatarButton: {
    position: 'relative',
    marginRight: 12
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.card
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16
  },
  onlineBeacon: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#09090C'
  },
  titleColumn: {
    flex: 1
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  brandLogo: {
    width: 28,
    height: 28
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2
  },
  subtitleText: {
    color: '#FFFFFF',
    opacity: 0.85,
    fontSize: 11,
    fontWeight: '500'
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.background
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800'
  }
});

export default Header;
