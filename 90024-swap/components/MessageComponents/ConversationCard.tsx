import React from 'react';
import { Ionicons } from '@expo/vector-icons';
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
                  <Ionicons name="person" size={24} color="white" />
                )}
            </View>
            <View style={styles.conversationInfoView}>
                <View style={styles.topRowInfo}>
                    <View style={{flexDirection:"row", gap: 10, flexShrink: 1, maxWidth: "70%", overflow: "hidden"}}>
                        <Text style={styles.recipientText} numberOfLines={1}>{recipient}</Text>
                        <Text>{"·"}</Text>
                        <Text style={styles.titleText}>{title}</Text>
                    </View>
                    <Text>{timeAgo()}</Text>
                </View>

                <Text style={styles.lastMessageContent}>{lastMessageContent}</Text>
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
        height:60,
        flexDirection: "column",
        justifyContent: "flex-start",
        marginLeft: 12,
        gap:4,
        paddingVertical: 8,
    },
    recipientText: {
        fontSize: 16,
        fontWeight: "bold"
    },
    titleText: {
        fontSize: 16
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
        height: 72
    },
    profilePictureBackground: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'grey',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profilePicture: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
});
