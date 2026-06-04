import { MessageInputBar } from '@/components/MessageComponents/MessageInputBar';
import { MessageBubble } from '@/components/MessageComponents/MessageBubble';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToConversationMessages } from '@/services/messaging';
import { Message } from '@/types/messaging';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ConversationView() {
  const { user } = useAuth();
  const { recipient, title, conversationId } = useLocalSearchParams<{
    recipient?: string;
    title?: string;
    conversationId?: string;
  }>();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!conversationId) return;
    return subscribeToConversationMessages(
      conversationId,
      setMessages,
      (e) => console.error('Failed to load messages', e),
    );
  }, [conversationId]);

  async function handleSend() {
    if (!user?.uid || !conversationId || draft === '') return;
    try {
      await sendMessage(conversationId, user.uid, draft);
      setDraft('');
    } catch (error) {
      console.error('Failed sending message:', error);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={tabBarHeight}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>{recipient}</Text>
              <Text style={styles.headerSubtitle}>{title}</Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace('/(tabs)/messages')
              }
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ paddingHorizontal: 4 }}
            >
              <Text style={{ color: '#2563eb', fontSize: 17, fontWeight: '600' }}>‹ Back</Text>
            </TouchableOpacity>
          ),
          headerRight: () => null,
        }}
      />

      <ScrollView contentContainerStyle={styles.messages}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            current_user_id={user?.uid ?? ''}
            sender_id={message.sender_id}
            message_id={message.id}
            created_at={message.created_at}
            content={message.content}
          />
        ))}
      </ScrollView>

      <MessageInputBar content={draft} onChangeText={setDraft} onSend={handleSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 16,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  messages: {
    padding: 8,
    gap: 6,
  },
});
