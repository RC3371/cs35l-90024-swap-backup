import React from 'react';
import { Text, View } from 'react-native';

interface MessageBubbleProps {
    current_user_id: string;
    sender_id: string;
    message_id: string;
    content: string;
    created_at: string;
}

function formatTime(created_at: string): string {
  if (!created_at) return '';
  const date = new Date(created_at);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  current_user_id,
  sender_id,
  content,
  created_at,
}) => {
  const mine = current_user_id === sender_id;

  return (
    <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
      <View style={[{
          backgroundColor: mine ? "#0a84ff" : "white",
          borderRadius: 10,
          paddingHorizontal: 10,
          paddingVertical: 8,
          }, !mine && {
              shadowColor: 'black',
              shadowOpacity:0.1,
              shadowOffset: { width: 0, height: 2},
              shadowRadius: 4
          }
      ]}>
          <Text style={{ color: mine ? 'white' : '#111' }}>{content}</Text>
      </View>
      <Text
        style={{
          fontSize: 10,
          color: '#8e8e93',
          marginTop: 2,
          marginHorizontal: 4,
          alignSelf: mine ? 'flex-end' : 'flex-start',
        }}
      >
        {formatTime(created_at)}
      </Text>
    </View>
  );
};
