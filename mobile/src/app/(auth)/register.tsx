// =====================================================================
// KREAZYAI MERCHANT REGISTRATION SCREEN
// Creates isolated store workspace, seeds initial AI config & credit wallet
// =====================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!storeName.trim()) {
      setErrorMessage('Store name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await register({
        storeName: storeName.trim(),
        ownerName: ownerName.trim() || undefined,
        email: email.trim().toLowerCase(),
        password,
        country
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Create Store Workspace</Text>
              <Text style={styles.headerSubtitle}>Start your 7-Day AI Automation Trial</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {errorMessage && (
              <View style={styles.errorBanner}>
                <Feather name="alert-triangle" size={16} color={COLORS.primary} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <Input
              label="Store / Business Name *"
              placeholder="e.g. Vintage Apparel Co."
              value={storeName}
              onChangeText={setStoreName}
              helper="This official store name will appear on all branded customer invoices."
              leftIcon={<Feather name="shopping-bag" size={18} color={COLORS.textSecondary} />}
            />

            <Input
              label="Merchant Full Name"
              placeholder="e.g. Alex Morgan"
              value={ownerName}
              onChangeText={setOwnerName}
              leftIcon={<Feather name="user" size={18} color={COLORS.textSecondary} />}
            />

            <Input
              label="Business Email *"
              placeholder="owner@yourstore.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              leftIcon={<Feather name="mail" size={18} color={COLORS.textSecondary} />}
            />

            <Input
              label="Create Password *"
              placeholder="Min 8 characters (letters & numbers)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              leftIcon={<Feather name="lock" size={18} color={COLORS.textSecondary} />}
            />

            <Input
              label="Operating Country"
              placeholder="e.g. Bangladesh, United States, UK"
              value={country}
              onChangeText={setCountry}
              leftIcon={<Feather name="globe" size={18} color={COLORS.textSecondary} />}
            />

            <View style={styles.identityNotice}>
              <Feather name="lock" size={14} color={COLORS.textMuted} />
              <Text style={styles.identityNoticeText}>
                Store identity is permanently locked to this registered store name for verified customer tax invoicing.
              </Text>
            </View>

            <Button
              title="Create Workspace & Launch AI"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerBtn}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    padding: 24,
    minHeight: '100%'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    marginTop: 8
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800'
  },
  headerSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 51, 75, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 51, 75, 0.35)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  errorBannerText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1
  },
  identityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorderSubtle
  },
  identityNoticeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    flex: 1
  },
  registerBtn: {
    marginTop: 4
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 14
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700'
  }
});
