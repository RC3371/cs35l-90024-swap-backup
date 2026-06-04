import { ConversationCard } from '@/components/MessageComponents/ConversationCard';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToConversationsForUser } from '@/services/messaging';
import { getUserProfile } from '@/services/users';
import { Conversation } from '@/types/messaging';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function MessagesTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recipients, setRecipients] = useState<
    Record<string, { name: string; photo?: string }>
  >({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    return subscribeToConversationsForUser(
      user.uid,
      (next) => {
        setConversations(next);
        setError(null);
      },
      (e) => {
        console.error('Failed to load conversations', e);
        setError(e.message);
      },
    );
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || conversations.length === 0) return;
    let active = true;

    (async () => {
      const entries = await Promise.all(
        conversations.map(async (conversation) => {
          const recipientId =
            conversation.buyer_id === user.uid
              ? conversation.seller_id
              : conversation.buyer_id;
          const profile = await getUserProfile(recipientId);
          return [
            conversation.id,
            { name: profile?.displayName ?? 'Unknown name', photo: profile?.photo },
          ] as const;
        }),
      );
      if (active) setRecipients(Object.fromEntries(entries));
    })().catch((e) => console.error('Failed to load recipient names', e));

    return () => {
      active = false;
    };
  }, [conversations, user?.uid]);

  if (!user?.uid) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Sign in to view messages.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {error ? <Text style={{ padding: 12, color: '#b91c1c' }}>{error}</Text> : null}
      <ScrollView>
        {conversations.map((conversation) => {
          const recipientId =
            conversation.buyer_id === user.uid
              ? conversation.seller_id
              : conversation.buyer_id;
          const recipientInfo = recipients[conversation.id];
          const recipient = recipientInfo?.name ?? 'Unknown name';

          return (
            <View key={conversation.id} style={{ padding: 10 }}>
              <ConversationCard
                profilePictureUrl={recipientInfo?.photo}
                recipient={recipient}
                recipientId={recipientId}
                title={conversation.title}
                conversationId={conversation.id}
                lastMessageContent={conversation.last_message_content}
                lastMessageAt={conversation.last_message_at}
                eventHandler={() =>
                  router.push({
                    pathname: '/(tabs)/messages/conversation' as any,
                    params: {
                      recipient,
                      recipientId,
                      title: conversation.title,
                      conversationId: conversation.id,
                    },
                  })
                }
              />
            </View>
          );
        })}
        {conversations.length === 0 && !error ? (
          <Text style={{ padding: 16, color: '#6b7280' }}>No conversations yet.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}
