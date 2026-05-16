import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface MessageBubbleProps {
    author: string,
    content: string
}
export const ListingCard: React.FC<MessageBubbleProps> = ({
  author,
  content
}) => {
  return (
    <View style={{
        backgroundColor:"#2774AE",
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
    }}>
        <Text>{content}</Text>
    </View>
  );
};