import React from 'react';
import { Text, View } from 'react-native';

interface MessageBubbleProps {
    current_user_id: string;
    sender_id: string;
    message_id: string;
    content: string;
    created_at: string;
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  current_user_id,
  sender_id,
  content,
}) => {
  const mine = current_user_id === sender_id;

  return (
    <View style={[{
        backgroundColor: mine ? "#0a84ff" : "white",
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
