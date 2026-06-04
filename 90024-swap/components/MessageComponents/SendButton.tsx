import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
interface SendButtonProps {
    onPress: () => void;
}
export const SendButton: React.FC <SendButtonProps> = ({onPress}) => {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Ionicons name="send" size={20} color="#2774AE" />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e5e7eb",
        alignItems: "center",
        justifyContent: "center",
    },
});
