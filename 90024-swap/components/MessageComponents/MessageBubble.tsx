import React from 'react';
import { Text, View } from 'react-native';

interface MessageBubbleProps {
    currentUserId: string,
    senderId: string,
    content: string,
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  currentUserId,
  senderId,
  content,
}) => {
  const mine = currentUserId === senderId;

  return (
    <View style={[{
        backgroundColor: mine ? "#2774AE" : "white",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        alignSelf: mine ? "flex-end" : "flex-start"
        }, !mine && {
            shadowColor: 'black',
            shadowOpacity:0.1,
            shadowOffset: { width: 0, height: 2},
            shadowRadius: 4
        }
    ]}>
        <Text style={{ color: mine ? 'white' : '#111' }}>{content}</Text>
    </View>
  );
};
