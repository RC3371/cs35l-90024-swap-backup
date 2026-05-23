import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { UserProfileButton } from '@/components/MessageComponents/UserProfileButton';
import { ConversationCard } from '@/components/MessageComponents/ConversationCard';
import { useRouter } from 'expo-router';
import conversationsJson from '@/testdata/conversations.json';

const conversation_data = [
    { recipient: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5, conversationId: "1"},
    { recipient: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5, conversationId: "2"},
    { recipient: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5, conversationId: "3"},
    { recipient: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5, conversationId: "4"},
    { recipient: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5, conversationId: "5"}
]

export default function MessagesTab() { 
    const router = useRouter()
    const conversation_data = Object.values(conversationsJson)
    return (
        <View style={{flex:1}}>
            <View style={{ flexDirection: "row", flex: 1, justifyContent:"space-between", backgroundColor:"#2774AE"}}>
                <Text>Messages</Text>
                <UserProfileButton radius={40} onPress={function (): void {
                    throw new Error('Function not implemented.');
                } }></UserProfileButton>
            </View>
            <View style={{ flex: 6}}>
                <ScrollView>
                    {conversation_data.map((conversation, index) => {
                        const lastMessage = conversation.messages[conversation.messages.length - 1]
                        const hoursAgo = Math.floor((Date.now() - new Date(lastMessage.timestamp).getTime())/(3600000))
                        return (
                            <View key={index} style={{padding: 10}}>
                                <ConversationCard
                                    
                                    recipient={conversation.recipient}
                                    title={conversation.title}
                                    // PLACEHOLDER
                                    recipientId={conversation.conversationId}
                                    conversationId={conversation.conversationId}
                                    latestMessage={conversation.messages[conversation.messages.length - 1].content}
                                    hoursAgo={hoursAgo}
                                    eventHandler={() => router.push({
                                        pathname:'/(messages)/Conversation',
                                        params: { recipient: conversation.recipient, title: conversation.title, conversationId: conversation.conversationId}
                                    })}
                                />
                            </View>
                        )
                    })}
                </ScrollView>
            </View>
            
        </View>
        
    );
}