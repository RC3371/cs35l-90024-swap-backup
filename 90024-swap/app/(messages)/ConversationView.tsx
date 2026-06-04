import { MessageInputBar } from '@/components/MessageComponents/MessageInputBar';
import { MessageBubble } from '@/components/MessageComponents/MessageBubble';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToConversationMessages } from '@/services/messaging';
import { Message } from '@/types/messaging';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConversationView() {
  const { user } = useAuth();
  const { recipient, title, conversationId } = useLocalSearchParams<{
    recipient?: string;
    title?: string;
    conversationId?: string;
  }>();
  const router = useRouter();
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
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.headerTitle}>{recipient}</Text>
              <Text style={styles.headerSubtitle}>{title}</Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
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

      <View style={{ padding: 8 }}>
        <MessageInputBar content={draft} onChangeText={setDraft} onSend={handleSend} />
      </View>
    </View>
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
