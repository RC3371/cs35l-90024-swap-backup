import React from 'react';
import { TextInput } from 'react-native';

export const SearchBar = ({query, onSearch}: {query: string; onSearch: (query: string) => void}) => {
    return(
        <TextInput
            placeholder="Search for listings..."
            value={query}
            onChangeText={onSearch}
        />
    );
}