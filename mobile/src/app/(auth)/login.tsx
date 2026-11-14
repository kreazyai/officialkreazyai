// =====================================================================
// KREAZYAI MERCHANT SIGN IN SCREEN
// Bcrypt & JWT session management with backend synchronization
// =====================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export default function LoginScreen() {
  const { login, setDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your account email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await setDemoUser();
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not launch demo session.');
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
          {/* Brand Logo & Hero Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logoBadgeImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandTitle}>Kreazy<Text style={styles.brandTitleRed}>AI</Text></Text>
            <Text style={styles.brandSubtitle}>
              Autonomous AI Agents for Social Commerce
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Merchant Sign In</Text>
            <Text style={styles.cardDescription}>
              Access your store orders, conversations, and AI flows
            </Text>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Feather name="alert-triangle" size={16} color={COLORS.primary} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <Input
              label="Email Address"
              placeholder="merchant@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              leftIcon={<Feather name="mail" size={18} color={COLORS.textSecondary} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
              leftIcon={<Feather name="lock" size={18} color={COLORS.textSecondary} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              }
            />

            <Button
              title="Sign In to Dashboard"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR EXPLORE</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Demo Access */}
            <Button
              title="Launch Flagship Demo Session"
              variant="secondary"
              onPress={handleDemoLogin}
              icon={<Feather name="zap" size={16} color={COLORS.primary} />}
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have a store account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.footerLink}>Register Store</Text>
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
    justifyContent: 'center',
    minHeight: '100%'
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  logoBadgeImg: {
    width: 44,
    height: 44
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  brandTitleRed: {
    color: COLORS.primary
  },
  brandSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center'
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4
  },
  cardDescription: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginBottom: 20
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
  loginBtn: {
    marginTop: 8
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 12,
    letterSpacing: 0.5
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24
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
