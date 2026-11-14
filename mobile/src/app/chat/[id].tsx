// =====================================================================
// LIVE CONVERSATION & CHAT THREAD SCREEN
// Multi-channel message stream with 1-click AI suggestions & manual override
// =====================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Message } from '../../types';
import { api } from '../../services/api';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [suggestedReply, setSuggestedReply] = useState<string | null>(
    'Yes, we can send payment instructions for bKash. Please transfer to our verified merchant wallet: 01643792804.'
  );
  const [aiActive, setAiActive] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initial mock messages matching conversation
    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        conversationId: id || 'conv-01',
        sender: 'CUSTOMER',
        senderName: 'Sarah Jenkins',
        text: 'Hello! I would like to order the Cybernetic Hoodie and Tactical Bag.',
        channel: 'WHATSAPP',
        createdAt: '10:42 AM'
      },
      {
        id: 'msg-2',
        conversationId: id || 'conv-01',
        sender: 'AI',
        senderName: 'Kreazy AI Assistant',
        text: 'Great choice, Sarah! Both items are currently in stock. The total is $125.00 with free standard delivery. Would you like to proceed with Cash on Delivery or Advance Payment?',
        isAi: true,
        channel: 'WHATSAPP',
        createdAt: '10:43 AM'
      },
      {
        id: 'msg-3',
        conversationId: id || 'conv-01',
        sender: 'CUSTOMER',
        senderName: 'Sarah Jenkins',
        text: 'Can I pay via bKash advance? Please send me your merchant number.',
        channel: 'WHATSAPP',
        createdAt: '10:45 AM'
      }
    ];

    setMessages(mockMessages);
  }, [id]);

  const handleSend = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: id || 'conv-01',
      sender: 'MERCHANT',
      senderName: 'Store Owner',
      text: content,
      channel: 'WHATSAPP',
      createdAt: 'Just now'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setSuggestedReply(null);

    try {
      if (id) {
        await api.conversations.sendMessage(id, content);
      }
    } catch {
      // Offline fallback
    }

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleToggleAi = () => {
    setAiActive(!aiActive);
    Alert.alert(
      aiActive ? 'AI Assistant Paused' : 'AI Assistant Resumed',
      aiActive
        ? 'AI auto-replies are paused for this customer. You have manual control.'
        : 'AI auto-replies are now active for this customer.'
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCustomer = item.sender === 'CUSTOMER';
    const isAi = item.sender === 'AI' || item.isAi;

    return (
      <View
        style={[
          styles.messageRow,
          isCustomer ? styles.customerRow : styles.merchantRow
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCustomer
              ? styles.customerBubble
              : isAi
              ? styles.aiBubble
              : styles.merchantBubble
          ]}
        >
          {isAi && (
            <View style={styles.aiTagRow}>
              <Feather name="cpu" size={11} color={COLORS.purple} />
              <Text style={styles.aiTagText}>Kreazy AI Assistant</Text>
            </View>
          )}
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>{item.createdAt}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Header
        showBack
        title="Sarah Jenkins"
        subtitle="WhatsApp Chat"
        rightAction={
          <TouchableOpacity
            style={[styles.aiToggleBtn, aiActive && styles.aiToggleActive]}
            onPress={handleToggleAi}
          >
            <Feather
              name={aiActive ? 'cpu' : 'pause-circle'}
              size={14}
              color={aiActive ? COLORS.purple : COLORS.textMuted}
            />
            <Text
              style={[
                styles.aiToggleText,
                aiActive && { color: COLORS.purple }
              ]}
            >
              {aiActive ? 'AI Live' : 'AI Paused'}
            </Text>
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Messages Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
        />

        {/* AI Suggested Reply Pill */}
        {suggestedReply && (
          <View style={styles.suggestedContainer}>
            <View style={styles.suggestedHeader}>
              <View style={styles.suggestedLeft}>
                <Feather name="zap" size={13} color={COLORS.purple} />
                <Text style={styles.suggestedTitle}>AI Recommended Reply</Text>
              </View>
              <TouchableOpacity onPress={() => setSuggestedReply(null)}>
                <Feather name="x" size={14} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.suggestedBody}>{suggestedReply}</Text>
            <TouchableOpacity
              style={styles.sendSuggestionBtn}
              onPress={() => handleSend(suggestedReply)}
            >
              <Text style={styles.sendSuggestionText}>Send Reply with 1-Click</Text>
              <Feather name="send" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Message Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            placeholder="Type customer reply..."
            placeholderTextColor={COLORS.textPlaceholder}
            value={inputText}
            onChangeText={setInputText}
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              inputText.trim().length > 0 && styles.sendBtnActive
            ]}
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
          >
            <Feather name="arrow-up" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  aiToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  aiToggleActive: {
    borderColor: 'rgba(168, 85, 247, 0.4)',
    backgroundColor: 'rgba(168, 85, 247, 0.1)'
  },
  aiToggleText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  messageList: {
    padding: 16,
    paddingBottom: 24
  },
  messageRow: {
    marginBottom: 12,
    flexDirection: 'row'
  },
  customerRow: {
    justifyContent: 'flex-start'
  },
  merchantRow: {
    justifyContent: 'flex-end'
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 14,
    padding: 12
  },
  customerBubble: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderBottomLeftRadius: 4
  },
  aiBubble: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderBottomRightRadius: 4
  },
  merchantBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4
  },
  aiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  aiTagText: {
    color: COLORS.purple,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  messageText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20
  },
  messageTime: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right'
  },
  suggestedContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.25)',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12
  },
  suggestedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  suggestedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  suggestedTitle: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  suggestedBody: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10
  },
  sendSuggestionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.purple,
    borderRadius: 8,
    paddingVertical: 8
  },
  sendSuggestionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 20,
    color: COLORS.textPrimary,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 90
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cardBorder,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendBtnActive: {
    backgroundColor: COLORS.primary
  }
});
