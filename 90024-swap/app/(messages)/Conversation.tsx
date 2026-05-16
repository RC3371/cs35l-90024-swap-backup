import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { UserProfileButton } from '@/components/MessageComponents/UserProfileButton';
import { ConversationCard } from '@/components/MessageComponents/ConversationCard';
import { useLocalSearchParams } from 'expo-router';
import { MessageBar } from '@/components/MessageComponents/MessageBar';


export default function ConversationView() {
    const { recipient, title} = useLocalSearchParams()
    return (
        <View style={{flex:1}}>
            <View style={{ flexDirection: "column", flex: 1, backgroundColor:"#2774AE"}}>
                <Text>{recipient}</Text>
                <Text>{title}</Text>
            </View>

            <View style={{flex: 1}}>
                <MessageBar content={''} onEnter={function (content: string): void {
                throw new Error('Function not implemented.');
                } }/>

            </View>
        </View>

        
    );
}