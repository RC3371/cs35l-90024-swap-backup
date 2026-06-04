import React, { useEffect, useState } from 'react';
import { TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { UserProfileButton } from '@/components/MessageComponents/UserProfileButton';
import { ConversationCard } from '@/components/MessageComponents/ConversationCard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MessageInputBar } from '@/components/MessageComponents/MessageInputBar';
import { Ionicons } from '@expo/vector-icons';
import conversations from '@/testdata/conversations.json'
import { MessageBubble, MessageType } from '@/components/MessageComponents/MessageBubble';
import { subscribeToAgreementMessages } from '@/constants/agreements';
const current_user = 'user_2' //replace with get user id from profile part

type ChatMessage = {
    messageId: string;
    senderId: string;
    content: string;
    timestamp: string;
    type?: MessageType;
    agreementId?: string;
};

export default function ConversationView() {
    const params = useLocalSearchParams<{
        recipient?: string;
        title?: string;
        conversationId?: string;
        recipientId?: string;
    }>();
    const { recipient, title, conversationId } = params;
    const router = useRouter();
    const conversation = conversations[conversationId as keyof typeof conversations]
    // New conversations (started from a listing) have no entry in the test data yet,
    // so fall back to an empty thread instead of crashing.
    const [textMessages, setTextMessages] = useState<ChatMessage[]>(
        (conversation?.messages as ChatMessage[]) ?? []
    )
    const [agreementMessages, setAgreementMessages] = useState<ChatMessage[]>([])
    const [draft, setDraft] = useState('')

    useEffect(() => {
        if (!conversationId) return;
        const unsub = subscribeToAgreementMessages(
            conversationId as string,
            (msgs) => {
                setAgreementMessages(
                    msgs.map((m) => ({
                        messageId: `agreement_${m.id}`,
                        senderId: m.senderId,
                        content: 'Sent an agreement',
                        timestamp: new Date(m.createdAt).toISOString(),
                        type: 'agreement',
                        agreementId: m.agreementId,
                    })),
                );
            },
        );
        return unsub;
    }, [conversationId]);

    const messages: ChatMessage[] = [...textMessages, ...agreementMessages].sort(
        (a, b) => a.timestamp.localeCompare(b.timestamp),
    );

    function handleSend() {
        if(draft === "") return;
        setTextMessages([...textMessages, {
            messageId: Date.now().toString(),
            senderId: current_user,
            content: draft,
            timestamp: new Date().toISOString()
        }])
        setDraft("")
    }

    function handleStartAgreement() {
        router.push({
            pathname: '/(agreement)/create',
            params: {
                otherUid: (params.recipientId as string) ?? '',
                otherName: (recipient as string) ?? '',
                listingTitle: (title as string) ?? '',
                currentUserRole: 'buyer',
                conversationId: (conversationId as string) ?? '',
            },
        });
    }

    return (
        <View style={{flex:1}}>
            <View style={{ flexDirection: "row",  backgroundColor:"#2774AE", alignItems: 'center', padding: 8 }}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
                    <Ionicons name="arrow-back" size={24} color="white"/>
                </TouchableOpacity>
                <View style={{ flexDirection: "column", flex: 1, marginLeft: 8 }}>
                    <Text style={{color: "white"}}>{recipient}</Text>
                    <Text style={{color: "white"}}>{title}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleStartAgreement}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        gap: 4,
                    }}
                >
                    <Ionicons name="document-text-outline" size={16} color="#2774AE" />
                    <Text style={{ color: '#2774AE', fontWeight: '700', fontSize: 12 }}>
                        Agreement
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 8, gap: 6 }}>
            {messages.map((message) => {
                return (
                    <MessageBubble
                    key={message.messageId}
                    senderId={message.senderId}
                    messageId={message.messageId}
                    timestamp={message.timestamp}
                    content={message.content}
                    type={message.type}
                    agreementId={message.agreementId}
                    />
                )
            })}
            </ScrollView>
            <View style={{flex: 1}}>
                <MessageInputBar content={draft} onChangeText={setDraft} onSend={handleSend}/>
            </View>
        </View>


    );
}
