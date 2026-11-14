// =====================================================================
// KREAZYAI BOTTOM TABS NAVIGATOR — FINTECH LUXE VIOLET
// Modern dark floating tab bar with elevated center action button
// =====================================================================

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { FONTS } from '../../theme/typography';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 6);
  const tabHeight = Platform.OS === 'ios' ? 56 + bottomInset : 58 + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(11, 10, 16, 0.88)',
          borderTopColor: 'rgba(255, 255, 255, 0.10)',
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          ...(Platform.OS === 'web'
            ? ({
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              } as any)
            : {})
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.45)',
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '700',
          letterSpacing: 0.2,
          marginTop: 2,
          color: '#FFFFFF'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name="home"
              size={focused ? 22 : 20}
              color={color as string}
            />
          )
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name="message-circle"
              size={focused ? 22 : 20}
              color={color as string}
            />
          )
        }}
      />

      {/* Center Floating Action Tab: Orders / Quick Action (Fintech Center Glow from Image 1) */}
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.centerFabContainer}>
              <LinearGradient
                colors={['#A78BFA', '#7C3AED']}
                style={styles.centerFabGlow}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name="shopping-bag" size={22} color="#FFFFFF" />
              </LinearGradient>
            </View>
          ),
          tabBarLabel: () => null
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name="box"
              size={focused ? 22 : 20}
              color={color as string}
            />
          )
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: 'Modules',
          tabBarIcon: ({ color, size, focused }) => (
            <Feather
              name="grid"
              size={focused ? 22 : 20}
              color={color as string}
            />
          )
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerFabContainer: {
    top: -14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  centerFabGlow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.40)'
  }
});
