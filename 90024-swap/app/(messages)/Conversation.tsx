import React, { useState } from 'react';
import { TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { UserProfileButton } from '@/components/MessageComponents/UserProfileButton';
import { ConversationCard } from '@/components/MessageComponents/ConversationCard';
import { useLocalSearchParams } from 'expo-router';
import { MessageInputBar } from '@/components/MessageComponents/MessageInputBar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import conversations from '@/testdata/conversations.json'
import { MessageBubble } from '@/components/MessageComponents/MessageBubble';
const current_user = 'user_2' //replace with get user id from profile part

export default function ConversationView() {
    const { recipient, title, conversationId} = useLocalSearchParams()
    const router = useRouter();
    const conversation = conversations[conversationId as keyof typeof conversations]
    // New conversations (started from a listing) have no entry in the test data yet,
    // so fall back to an empty thread instead of crashing.
    const [messages, setMessages] = useState(conversation?.messages ?? [])
    const [draft, setDraft] = useState('')
    function handleSend() {
        if(draft === "") return;
        setMessages([...messages, {
            messageId: Date.now().toString(),
            senderId: current_user,
            content: draft,
            timestamp: new Date().toISOString()
        }])
        setDraft("")
    }
    return (
        <View style={{flex:1}}>
            <View style={{ flexDirection: "row",  backgroundColor:"#2774AE"}}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/messages')}>
                    <Ionicons name="arrow-back" size={24} color="white"/>
                </TouchableOpacity>
                <View style={{ flexDirection: "column", flex: 1}}>
                    <Text style={{color: "white"}}>{recipient}</Text>
                    <Text style={{color: "white"}}>{title}</Text>
                </View>
            </View>
            <ScrollView>
            {messages.map((message) => {
                return (
                    <MessageBubble
                    key={message.messageId}
                    senderId = {message.senderId}
                    messageId= {message.messageId}
                    timestamp= {message.timestamp}
                    content = {message.content}
                    ></MessageBubble>
                )
            })}
            </ScrollView>
            <View style={{flex: 1}}>
                <MessageInputBar content={draft} onChangeText={setDraft} onSend={handleSend}/>
            </View>
        </View>

        
    );
}