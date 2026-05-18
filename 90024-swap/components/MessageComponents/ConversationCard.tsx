import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
interface ConversationCardProps {
    author: string;
    title: string;
    latestMessage: string;
    hoursAgo: number;
    eventHandler: () => void;
}
export const ConversationCard: React.FC<ConversationCardProps> = ({
  author,
  title,
  latestMessage,
  hoursAgo,
  eventHandler
}) => {
    const initials = author.split(' ').map(word => word[0]).join('')
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
                <Text>{author}</Text>
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