import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Categories, Topics } from './Listing.types';

interface FilterButtonProps {
    text: Topics | Categories;
    onPress: () => void;
}
export const FilterButton: React.FC <FilterButtonProps> = ({text, onPress}) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <Text>{text}</Text>
        </TouchableOpacity>
    )
}