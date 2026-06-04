import { MessageInputBar } from '@/components/MessageComponents/MessageInputBar';
import { MessageBubble } from '@/components/MessageComponents/MessageBubble';
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, subscribeToConversationMessages } from '@/services/messaging';
import { Message } from '@/types/messaging';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [conversation, setConversation] = useState<any>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const insets= useSafeAreaInsets();

  useEffect(() => {
      const showListener = Keyboard.addListener('keyboardWillShow', () => setIsKeyboardVisible(true))
      const hideListener = Keyboard.addListener('keyboardWillHide', () => setIsKeyboardVisible(false))
      return () => {
          showListener.remove()
          hideListener.remove()
      }
  }, [])
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
              <Text style={styles.headerTitle}>{title}</Text>
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

        <View style={{paddingBottom: isKeyboardVisible ? 12 : 0}}>
          <MessageInputBar content={draft} onChangeText={setDraft} onSend={handleSend}/>
        </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  messages: {
    padding: 8,
    gap: 6,
  },
});
