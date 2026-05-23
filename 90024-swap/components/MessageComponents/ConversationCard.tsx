import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
interface ConversationCardProps {
    recipient: string;
    recipientId: string;
    title: string;
    conversationId: string, 
    latestMessage: string;
    hoursAgo: number;
    eventHandler: () => void;
}
export const ConversationCard: React.FC<ConversationCardProps> = ({
  recipient,
  recipientId,
  title,
  conversationId,
  latestMessage,
  hoursAgo,
  eventHandler
}) => {
    const initials = recipient.split(' ').map(word => word[0]).join('')
    return (
    <TouchableOpacity onPress={eventHandler} style={{ padding: 10, borderWidth: 1 ,borderRadius: 10}}>
        <View style={{flexDirection:'row', justifyContent: "space-between"}}>
            <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor:"#2774AE",
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Text>{initials}</Text>
            </View>
            <View style={{flexDirection:'column'}}>
                <Text>{recipient}</Text>
                <Text>{title}</Text>
                <Text>{latestMessage}</Text>
            </View>
            <View>
                <Text>{hoursAgo}h ago</Text>
            </View>
        </View>
    </TouchableOpacity>
    );
};