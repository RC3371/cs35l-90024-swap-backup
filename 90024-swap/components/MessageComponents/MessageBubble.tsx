import React from 'react';
import { Text, View } from 'react-native';
import { AgreementCard } from './AgreementCard';

const current_user = 'user_2' // replace with get userid function

export type MessageType = 'text' | 'agreement';

interface MessageBubbleProps {
    senderId: string,
    messageId: string,
    content: string,
    timestamp: string,
    type?: MessageType,
    agreementId?: string,
}
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  senderId,
  content,
  type,
  agreementId,
}) => {
  const mine = current_user === senderId;

  if (type === 'agreement' && agreementId) {
    return (
      <AgreementCard
        agreementId={agreementId}
        fallbackTitle={content}
        alignRight={mine}
      />
    );
  }

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
