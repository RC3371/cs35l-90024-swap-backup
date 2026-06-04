import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
interface ConversationCardProps {
    recipient?: string;
    title: string;
    lastMessageContent?: string;
    lastMessageAt?: string;
    eventHandler: () => void;
}
export const ConversationCard: React.FC<ConversationCardProps> = ({
  recipient,
  title,
  lastMessageContent,
  lastMessageAt,
  eventHandler
}) => {
    const displayName = recipient || 'Unknown name';
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const hoursAgo = lastMessageAt
      ? Math.max(0, Math.floor((Date.now() - new Date(lastMessageAt).getTime()) / 3600000))
      : null;
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
                <Text>{displayName}</Text>
                <Text>{title}</Text>
                <Text>{lastMessageContent || 'No messages yet'}</Text>
            </View>
            <View>
                <Text>{hoursAgo === null ? '' : `${hoursAgo}h ago`}</Text>
            </View>
        </View>
    </TouchableOpacity>
    );
};
