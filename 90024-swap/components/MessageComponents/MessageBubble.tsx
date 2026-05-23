import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const current_user = 'user_2' // replace with get userid function
interface MessageBubbleProps {
    senderId: string,
    messageId: string,
    content: string,
    timestamp: string
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  senderId,
  messageId,
  content,
  timestamp
}) => {
  return (
    <View style={[{
        backgroundColor: current_user === senderId ? "#2774AE" : "white",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        alignSelf: current_user === senderId ? "flex-end" : "flex-start"
        }, (current_user != senderId) && {
            shadowColor: 'black',
            shadowOpacity:0.1,   
            shadowOffset: { width: 0, height: 2},   
            shadowRadius: 4  
        }
    ]}>
        <Text>{content}</Text>
    </View>
  );
};