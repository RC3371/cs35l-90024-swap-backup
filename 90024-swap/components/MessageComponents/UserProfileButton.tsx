import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

interface UserProfileButtonProps {
    radius: number;
    onPress: () => void;
}
export const UserProfileButton: React.FC <UserProfileButtonProps> = ({radius, onPress}) => {
    return (
        <TouchableOpacity onPress={onPress} style={{
            width: radius,
            height: radius,
            borderRadius: radius/2,
            backgroundColor:"#FFD100",
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Ionicons name="person" size={radius} color="#2774AE"></Ionicons>
        </TouchableOpacity>
    )
}
