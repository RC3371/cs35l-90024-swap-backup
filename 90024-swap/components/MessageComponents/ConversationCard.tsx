import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConversationCardProps {
    profilePictureUrl?: string;
    recipient: string;
    recipientId: string;
    title: string;
    conversationId: string;
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
    <TouchableOpacity onPress={eventHandler} style={styles.cardBackground}>
        <View style={styles.cardView}>
            <View style={styles.profilePictureBackground}>
                {profilePictureUrl ? (
                  <Image source={{ uri: profilePictureUrl }} style={styles.profilePicture} />
                ) : (
                  <Text style={styles.avatarInitial}>
                    {recipient?.charAt(0)?.toUpperCase() ?? '?'}
                  </Text>
                )}
            </View>
            <View style={styles.conversationInfoView}>
                <View style={styles.topRowInfo}>
                    <Text style={[styles.recipientText, { flexShrink: 1 }]} numberOfLines={1}>{recipient}</Text>
                    <Text>{timeAgo()}</Text>
                </View>
                <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
                <Text style={styles.lastMessageContent} numberOfLines={1}>{lastMessageContent}</Text>
            </View>
        </View>
    </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardBackground: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: "white"
    },
    topRowInfo: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    conversationInfoView: {
        flex:1,
        flexDirection: "column",
        justifyContent: "center",
        marginLeft: 12,
        gap:4,
        paddingVertical: 8,
    },
    recipientText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    titleText: {
        fontSize: 14,
        color: "#374151",
    },
    lastMessageContent: {
        fontSize:14,
        color:"#707070",
    },
    timeView: {
        marginLeft: "auto",
        alignSelf: "flex-start"
    },
    cardView: {
        flexDirection:'row',
        justifyContent: "space-between",
        alignItems: "center",
    },
    profilePictureBackground: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profilePicture: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
});
