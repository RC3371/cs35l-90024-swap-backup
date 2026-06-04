import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SendButton } from './SendButton';


export const MessageInputBar = ({
    content, onSend, onChangeText
}: {
    content: string;
    onChangeText: (content: string) => void
    onSend: () => void
}) => {
    return(
        <View style={styles.bar}>
            <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            value={content}
            onChangeText={onChangeText}
            style={styles.input}
            />
            <SendButton onPress={onSend}/>
        </View>

    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d1d5db",
        backgroundColor: "#f9fafb",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
    },
});
