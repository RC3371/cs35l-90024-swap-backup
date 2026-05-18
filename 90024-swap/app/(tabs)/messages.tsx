import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { UserProfileButton } from '@/components/MessageComponents/UserProfileButton';
import { ConversationCard } from '@/components/MessageComponents/ConversationCard';
import { useRouter } from 'expo-router';

const conversation_data = [
    { author: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5},
    { author: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5},
    { author: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5},
    { author: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5},
    { author: "James James", title: "Tutoring", latestMessage: "How does tomorrow sound?", hoursAgo: 5}
]
export default function MessagesTab() { 
    const router = useRouter()

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
                    {conversation_data.map((conversation, index) => (
                        <View style={{padding: 10}}>
                            <ConversationCard
                                key={index}
                                author={conversation.author}
                                title={conversation.title}
                                latestMessage={conversation.latestMessage}
                                hoursAgo={conversation.hoursAgo}
                                eventHandler={() => router.push({
                                    pathname:'/(messages)/Conversation',
                                    params: { recipient: conversation.author, title: conversation.title}
                                })}
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>
            
        </View>
        
    );
}