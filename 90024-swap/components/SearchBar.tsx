import React from 'react';
import { TextInput } from 'react-native/Libraries/Components/TextInput/TextInput';


export const SearchBar = ({query, onSearch}: {query: string; onSearch: (query: string) => void}) => {
    return(
        <TextInput
            placeholder="Search for listings..."
            value={query}
            onChangeText={() => onSearch(query)}
        />

    );
}