import React from 'react';
import { TextInput } from 'react-native';
// import { TextInput } from 'react-native/Libraries/Components/TextInput/TextInput';
// ^ use this for sims! (doesn't work for web)


export const SearchBar = ({query, onSearch}: {query: string; onSearch: (query: string) => void}) => {
    return(
        <TextInput
            placeholder="Search for listings..."
            value={query}
            onChangeText={(text) => onSearch(text)}
        />

    );
}