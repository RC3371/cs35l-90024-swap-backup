import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export const SearchBar = ({
    query,
    onSearch,
}: {
    query: string;
    onSearch: (query: string) => void;
}) => {
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search for listings..."
                placeholderTextColor="#7a7a7a"
                value={query}
                onChangeText={onSearch}
                clearButtonMode="while-editing"
                keyboardAppearance="light"
                returnKeyType="search"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 14,
        backgroundColor: '#f7f7f8',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    input: {
        fontSize: 16,
        color: '#1c1c1e',
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
});