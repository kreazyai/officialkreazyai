// =====================================================================
// KREAZYAI ROOT LAYOUT
// Integrates Safe Area, Status Bar, Auth, Inter Font & Notification Providers
// =====================================================================

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black
} from '@expo-google-fonts/inter';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { COLORS } from '../theme/colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black
  });

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: COLORS.background },
              animation: 'slide_from_right'
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="order/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="crm/[id]" options={{ presentation: 'card' }} />
            <Stack.Screen name="crm/index" />
            <Stack.Screen name="ai-flows/index" />
            <Stack.Screen name="ai-messages/index" />
            <Stack.Screen name="inventory/index" />
            <Stack.Screen name="finance/index" />
            <Stack.Screen name="analytics/index" />
            <Stack.Screen name="bookings/index" />
            <Stack.Screen name="integrations/index" />
            <Stack.Screen name="pricing/index" />
            <Stack.Screen name="notifications/index" />
            <Stack.Screen name="settings/index" />
          </Stack>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
