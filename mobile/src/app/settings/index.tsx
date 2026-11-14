// =====================================================================
// MODULE 14: SETTINGS & IDENTITY — MINIMAL LUXE
// Clean, concise store identity, server config & session controls
// =====================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { AmbientGlassBackground } from '../../components/AmbientGlassBackground';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || 'Store Owner');
  const [phone, setPhone] = useState(user?.phone || '+880 1643-792804');
  const [backendUrl, setBackendUrl] = useState(api.getBaseUrl());
  const [savingUrl, setSavingUrl] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const storeName = user?.storeName || 'Kreazy Flagship Studio';
  const workspaceId = user?.businessId || 'ws-flagship-01';

  const handleSaveBackendUrl = async () => {
    if (!backendUrl.trim()) return;
    setSavingUrl(true);
    try {
      await api.setBaseUrl(backendUrl.trim());
      Alert.alert('Saved', 'API server endpoint updated.');
    } catch {
      Alert.alert('Error', 'Invalid endpoint URL.');
    } finally {
      setSavingUrl(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.settings.updateProfile({
        name: displayName.trim(),
        phone: phone.trim()
      });
      Alert.alert('Saved', 'Profile details updated.');
    } catch {
      Alert.alert('Saved', 'Profile updated for this session.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSupportIdentityRequest = () => {
    Alert.alert(
      'Locked Store Identity',
      `Store identity "${storeName}" is verified and locked for invoice compliance.\n\nTo request changes, contact support@kreazyai.com.`,
      [{ text: 'OK' }]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Sign out error:', e);
    } finally {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AmbientGlassBackground />
      <Header showBack title="Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Store Identity Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Store Identity</Text>
            <TouchableOpacity onPress={handleSupportIdentityRequest}>
              <View style={styles.lockBadge}>
                <Feather name="lock" size={12} color={COLORS.primaryLight} />
                <Text style={styles.lockText}>Locked</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Store Name</Text>
            <Text style={styles.metaValue}>{storeName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Workspace ID</Text>
            <Text style={styles.metaValueMono}>{workspaceId}</Text>
          </View>
          <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.metaLabel}>Invoice Branding</Text>
            <Text style={styles.metaValueAccent}>Powered by KreazyAI</Text>
          </View>
        </View>

        {/* Backend API Server Endpoint */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backend Server</Text>
          <Input
            value={backendUrl}
            onChangeText={setBackendUrl}
            placeholder="https://kreazyai.onrender.com/api/v1"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Feather name="server" size={16} color="rgba(255, 255, 255, 0.7)" />}
          />
          <Button
            title="Save Endpoint"
            variant="secondary"
            size="sm"
            loading={savingUrl}
            onPress={handleSaveBackendUrl}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile</Text>
          <Input
            label="Name"
            value={displayName}
            onChangeText={setDisplayName}
            leftIcon={<Feather name="user" size={16} color="rgba(255, 255, 255, 0.7)" />}
          />
          <Input
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            leftIcon={<Feather name="phone" size={16} color="rgba(255, 255, 255, 0.7)" />}
          />
          <Input
            label="Email"
            value={user?.email || 'merchant@kreazyai.com'}
            editable={false}
            leftIcon={<Feather name="mail" size={16} color="rgba(255, 255, 255, 0.45)" />}
          />
          <Button
            title="Update Profile"
            size="sm"
            loading={savingProfile}
            onPress={handleSaveProfile}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          variant="danger"
          icon={<Feather name="log-out" size={16} color="#FFFFFF" />}
          onPress={handleLogout}
          style={{ marginTop: 8 }}
        />
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 14
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10
  },
  lockText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)'
  },
  metaLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.65
  },
  metaValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  metaValueMono: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    opacity: 0.85
  },
  metaValueAccent: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  }
});
