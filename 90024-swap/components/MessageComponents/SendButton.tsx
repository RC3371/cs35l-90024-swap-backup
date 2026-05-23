import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
interface SendButtonProps {
    onPress: () => void;
}
export const SendButton: React.FC <SendButtonProps> = ({onPress}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Ionicons name="send" size={24} color="#2774AE" />
        </TouchableOpacity>
    )
}