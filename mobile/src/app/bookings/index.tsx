// =====================================================================
// MODULE 11: BOOKINGS & FOUNDER DEMO MEETINGS
// Manage customer demo schedules, meeting slots, and AI consultations
// =====================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Booking } from '../../types';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'demo-01',
      fullName: 'Alex Vance',
      workEmail: 'alex@nordicbotanicals.com',
      companyName: 'Nordic Botanicals',
      phone: '+45 20 12 34 56',
      primaryUseCase: 'Automate WhatsApp orders and inventory synchronization',
      preferredDate: 'Nov 14, 2026',
      preferredTime: '3:00 PM EST',
      status: 'PENDING',
      type: 'DEMO',
      createdAt: 'Today, 9:20 AM'
    },
    {
      id: 'demo-02',
      fullName: 'Farhan Kabir',
      workEmail: 'farhan@craftstudios.bd',
      companyName: 'Craft Studios Dhaka',
      phone: '+880 1712-445566',
      primaryUseCase: 'bKash advance payment workflow with automated invoice sharing',
      preferredDate: 'Nov 15, 2026',
      preferredTime: '11:00 AM BST',
      status: 'CONFIRMED',
      type: 'FOUNDER_MEETING',
      createdAt: 'Yesterday'
    }
  ]);

  const handleConfirm = (id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'CONFIRMED' } : b))
    );
    Alert.alert('Booking Confirmed', 'Confirmation calendar invitation sent to attendee.');
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{item.type.replace('_', ' ')}</Text>
        </View>
        <Badge
          label={item.status}
          variant={item.status === 'CONFIRMED' ? 'success' : 'warning'}
          size="sm"
        />
      </View>

      <Text style={styles.nameText}>{item.fullName}</Text>
      <Text style={styles.companyText}>
        {item.companyName} • {item.workEmail}
      </Text>

      <View style={styles.slotBox}>
        <Feather name="calendar" size={14} color={COLORS.primary} />
        <Text style={styles.slotText}>
          {item.preferredDate} at {item.preferredTime}
        </Text>
      </View>

      {item.primaryUseCase && (
        <Text style={styles.useCaseText}>
          <Text style={styles.useCaseLabel}>Use Case: </Text>
          {item.primaryUseCase}
        </Text>
      )}

      {item.status === 'PENDING' && (
        <View style={styles.actionRow}>
          <Button
            title="Confirm Slot"
            size="sm"
            variant="success"
            icon={<Feather name="check" size={14} color="#FFFFFF" />}
            onPress={() => handleConfirm(item.id)}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header showBack title="Bookings & Demos" subtitle="Live Consultation Requests" />

      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  listContent: {
    padding: 16
  },
  bookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  typeTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  typeText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700'
  },
  nameText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  companyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10
  },
  slotBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 51, 75, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  slotText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  useCaseText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12
  },
  useCaseLabel: {
    color: COLORS.textMuted,
    fontWeight: '700'
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorderSubtle,
    paddingTop: 12
  }
});
