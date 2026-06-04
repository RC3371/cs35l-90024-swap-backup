import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConversationCardProps {
    profilePictureUrl?: string;
    recipient: string;
    recipientId?: string;
    title: string;
    conversationId?: string;
    lastMessageAt: string;
    lastMessageContent: string;
    eventHandler: () => void;
}
export const ConversationCard: React.FC<ConversationCardProps> = ({
  profilePictureUrl,
  recipient,
  title,
  lastMessageContent,
  lastMessageAt,
  eventHandler,
}) => {
    const timeAgo = () => {
        if (!lastMessageAt) return '';

        const timeDifference = Date.now() - new Date(lastMessageAt).getTime();
        const secondsDifference = Math.ceil(timeDifference / 1000);
        const minutesDifference = Math.ceil(secondsDifference / 60);
        const hoursDifference = Math.ceil(minutesDifference / 60);
        const daysDifference = Math.ceil(hoursDifference / 24);
        const weeksDifference = Math.ceil(daysDifference / 7);
        const yearsDifference = Math.ceil(weeksDifference / 52);

        if (secondsDifference < 60) return 'just now';
        if (minutesDifference < 60) return `${minutesDifference}m ago`;
        if (hoursDifference < 24) return `${hoursDifference}h ago`;
        if (daysDifference < 7) return `${daysDifference}d ago`;
        if (weeksDifference < 52) return `${weeksDifference}w ago`;
        return `${yearsDifference}y ago`;
    };

    return (
    <TouchableOpacity onPress={eventHandler} style={styles.card}>
        <View style={styles.row}>
            <View style={styles.profilePictureBackground}>
                {profilePictureUrl ? (
                  <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
                ) : (
                  <Ionicons name="person" size={24} color="white" />
                )}
            </View>
            <View style={styles.content}>
                <Text>{recipient}</Text>
                <Text>{title}</Text>
                <Text>{lastMessageContent}</Text>
            </View>
            <View>
                <Text>{timeAgo()}</Text>
            </View>
        </View>
    </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: 10,
    },
    profilePictureBackground: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'grey',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});
