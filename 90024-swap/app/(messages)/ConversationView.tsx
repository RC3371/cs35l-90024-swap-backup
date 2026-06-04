import { MessageBubble } from '@/components/MessageComponents/MessageBubble';
import { MessageInputBar } from '@/components/MessageComponents/MessageInputBar';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToConversationMessages } from '@/services/messaging';
import { Message } from '@/types/messaging';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

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
    if (!user?.uid || !conversationId || draft.trim() === '') return;
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
              <Text style={{ fontSize: 16 }}>{recipient}</Text>
              <Text style={{ fontSize: 12 }}>{title}</Text>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={{ padding: 8, gap: 6 }}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            currentUserId={user?.uid ?? ''}
            senderId={message.sender_id}
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
