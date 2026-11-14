// =====================================================================
// MODULE 2: UNIFIED INBOX
// Multi-channel customer conversations (WhatsApp, Messenger, Instagram)
// =====================================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Badge, BadgeVariant } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { AmbientGlassBackground } from '../../components/AmbientGlassBackground';
import { Conversation } from '../../types';
import { api } from '../../services/api';

export default function InboxScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filtered, setFiltered] = useState<Conversation[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.conversations.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setConversations(data);
      } else {
        // Fallback realistic seed conversations matching backend
        const initialSeed: Conversation[] = [
          {
            id: 'conv-01',
            customerName: 'Sarah Jenkins',
            channel: 'WHATSAPP',
            unread: 2,
            status: 'WAITING_HUMAN',
            lastMessage: 'Can I pay via bKash advance? Please send me your merchant number.',
            lastMessageTime: '12m ago',
            suggestedReply: 'Yes! You can send advance payment to our official bKash merchant number: 01643792804 (Send money).'
          },
          {
            id: 'conv-02',
            customerName: 'Marcus Vance',
            channel: 'MESSENGER',
            unread: 0,
            status: 'ACTIVE',
            lastMessage: 'My order has been placed successfully. Thank you for the quick assistance!',
            lastMessageTime: '45m ago'
          },
          {
            id: 'conv-03',
            customerName: 'Elena Rostova',
            channel: 'INSTAGRAM',
            unread: 1,
            status: 'ACTIVE',
            lastMessage: 'Is the Titanium Cardholder in stock right now?',
            lastMessageTime: '2h ago',
            suggestedReply: 'Yes! The Titanium Cardholder is in stock and ready to ship within 24 hours.'
          },
          {
            id: 'conv-04',
            customerName: 'Tariq Rahman',
            channel: 'WHATSAPP',
            unread: 0,
            status: 'ACTIVE',
            lastMessage: 'Invoice received. Cash on delivery is perfect.',
            lastMessageTime: '4h ago'
          }
        ];
        setConversations(initialSeed);
      }
    } catch {
      // Quiet fallback for preview mode
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    let result = conversations;
    if (activeChannel !== 'ALL') {
      result = result.filter(c => c.channel.toUpperCase() === activeChannel);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.customerName.toLowerCase().includes(q) ||
          (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [conversations, activeChannel, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const channels = ['ALL', 'WHATSAPP', 'MESSENGER', 'INSTAGRAM'];

  const getChannelIcon = (channel: string) => {
    switch (channel.toUpperCase()) {
      case 'WHATSAPP':
        return <FontAwesome5 name="whatsapp" size={13} color={COLORS.whatsapp} />;
      case 'MESSENGER':
        return <FontAwesome5 name="facebook-messenger" size={13} color={COLORS.messenger} />;
      case 'INSTAGRAM':
        return <FontAwesome5 name="instagram" size={13} color={COLORS.instagram} />;
      default:
        return <Feather name="message-square" size={13} color={COLORS.textSecondary} />;
    }
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationCard, item.unread > 0 && styles.unreadCard]}
      onPress={() => router.push(`/chat/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.avatarBox}>
        <Text style={styles.avatarText}>{item.customerName.charAt(0).toUpperCase()}</Text>
        <View style={styles.channelIconFloat}>{getChannelIcon(item.channel)}</View>
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.topLine}>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.customerName}
          </Text>
          <Text style={styles.timestamp}>{item.lastMessageTime || 'Recently'}</Text>
        </View>

        <Text
          style={[styles.snippetText, item.unread > 0 && styles.unreadSnippet]}
          numberOfLines={2}
        >
          {item.lastMessage || 'Conversation started...'}
        </Text>

        <View style={styles.bottomMeta}>
          {item.status === 'WAITING_HUMAN' ? (
            <Badge label="Human Needed" variant="warning" size="sm" />
          ) : (
            <Badge label="AI Active" variant="purple" size="sm" />
          )}

          {item.unread > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <AmbientGlassBackground />
      <Header title="Unified Inbox" subtitle="Omnichannel Customer Messaging" />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={COLORS.textPlaceholder} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by customer or message..."
          placeholderTextColor={COLORS.textPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Channel Pills */}
      <View style={styles.channelFilterRow}>
        {channels.map(ch => (
          <TouchableOpacity
            key={ch}
            style={[styles.channelChip, activeChannel === ch && styles.activeChip]}
            onPress={() => setActiveChannel(ch)}
          >
            <Text
              style={[
                styles.channelChipText,
                activeChannel === ch && styles.activeChipText
              ]}
            >
              {ch}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="message-circle"
            title="No Conversations Found"
            description="Incoming customer messages from WhatsApp, Messenger, and Instagram will show up here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 13
  },
  channelFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8
  },
  channelChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  activeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: '#FFFFFF'
  },
  channelChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  activeChipText: {
    color: '#FFFFFF'
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 115
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(25, 23, 38, 0.50)',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderTopColor: 'rgba(167, 139, 250, 0.28)',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  unreadCard: {
    borderColor: 'rgba(167, 139, 250, 0.45)',
    borderTopColor: 'rgba(167, 139, 250, 0.75)',
    backgroundColor: 'rgba(32, 28, 50, 0.65)'
  },
  avatarBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 12
  },
  avatarText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '800'
  },
  channelIconFloat: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  conversationInfo: {
    flex: 1
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  customerName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    flex: 1
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 11
  },
  snippetText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8
  },
  unreadSnippet: {
    color: COLORS.textPrimary,
    fontWeight: '600'
  },
  bottomMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  unreadCountBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800'
  }
});
