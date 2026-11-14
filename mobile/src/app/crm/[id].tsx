// =====================================================================
// CUSTOMER PROFILE & ORDER HISTORY SCREEN
// Detailed merchant CRM view with timeline notes
// =====================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Customer } from '../../types';
import { api } from '../../services/api';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<{ id: string; text: string; date: string }[]>([
    {
      id: 'n-1',
      text: 'Preferred payment method is bKash send money or COD.',
      date: 'Oct 24, 2026'
    },
    {
      id: 'n-2',
      text: 'Asked for oversized hoodie restock in Charcoal Gray.',
      date: 'Nov 02, 2026'
    }
  ]);

  useEffect(() => {
    // Initial mock customer detail
    setCustomer({
      id: id || 'c-1',
      fullName: 'Marcus Vance',
      email: 'marcus.v@example.com',
      phone: '+1 (555) 432-8812',
      customerStatus: 'ACTIVE',
      customerType: 'VIP',
      source: 'MESSENGER',
      totalOrders: 6,
      totalSpent: 890.00,
      tags: ['VIP', 'Repeat Buyer', 'Fashion Lead'],
      createdAt: 'September 12, 2026'
    });
  }, [id]);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      date: 'Just now'
    };
    setNotes(prev => [newNote, ...prev]);
    setNoteText('');

    try {
      if (id) {
        await api.customers.addNote(id, newNote.text);
      }
    } catch {
      // offline fallback
    }
    Alert.alert('Note Added', 'Internal merchant note saved to customer profile.');
  };

  if (!customer) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showBack title={customer.fullName} subtitle="Customer Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{customer.fullName.charAt(0)}</Text>
          </View>
          <Text style={styles.nameLarge}>{customer.fullName}</Text>
          <View style={styles.tierBadgeRow}>
            <Badge label={customer.customerType} variant="purple" />
            <Badge label={customer.customerStatus} variant="success" />
          </View>
          <Text style={styles.memberSince}>Customer since {customer.createdAt}</Text>
        </View>

        {/* Lifetime Value Metric Box */}
        <View style={styles.metricsBox}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>${customer.totalSpent.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Lifetime Spent</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{customer.totalOrders}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{customer.source}</Text>
            <Text style={styles.metricLabel}>Acquired Via</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Direct Contacts</Text>
          <View style={styles.contactRow}>
            <Feather name="phone" size={16} color={COLORS.textSecondary} />
            <Text style={styles.contactVal}>{customer.phone || 'No phone'}</Text>
          </View>
          <View style={styles.contactRow}>
            <Feather name="mail" size={16} color={COLORS.textSecondary} />
            <Text style={styles.contactVal}>{customer.email || 'No email'}</Text>
          </View>
        </View>

        {/* Internal Merchant Notes */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Merchant Notes & Log</Text>
          <View style={styles.addNoteRow}>
            <TextInput
              placeholder="Add internal note about customer..."
              placeholderTextColor={COLORS.textPlaceholder}
              value={noteText}
              onChangeText={setNoteText}
              style={styles.noteInput}
            />
            <Button
              title="Add"
              size="sm"
              onPress={handleAddNote}
              disabled={!noteText.trim()}
              style={{ paddingHorizontal: 16 }}
            />
          </View>

          {notes.map(n => (
            <View key={n.id} style={styles.noteItem}>
              <Text style={styles.noteText}>{n.text}</Text>
              <Text style={styles.noteDate}>{n.date}</Text>
            </View>
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
    paddingBottom: 40
  },
  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800'
  },
  nameLarge: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8
  },
  tierBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8
  },
  memberSince: {
    color: COLORS.textMuted,
    fontSize: 12
  },
  metricsBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 14,
    marginBottom: 12
  },
  metricItem: {
    flex: 1,
    alignItems: 'center'
  },
  metricVal: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2
  },
  metricLabel: {
    color: COLORS.textMuted,
    fontSize: 11
  },
  metricDivider: {
    width: 1,
    backgroundColor: COLORS.cardBorderSubtle
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12
  },
  cardHeader: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorderSubtle,
    paddingBottom: 8
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8
  },
  contactVal: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600'
  },
  addNoteRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  noteInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    color: COLORS.textPrimary,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  noteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorderSubtle,
    marginBottom: 8
  },
  noteText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4
  },
  noteDate: {
    color: COLORS.textMuted,
    fontSize: 11
  }
});
