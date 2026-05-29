import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

export const SearchBar = ({
    query,
    onSearch,
}: {
    query: string;
    onSearch: (query: string) => void;
}) => {
    // #region agent log
    fetch('http://127.0.0.1:7327/ingest/d16ae285-20ce-46dd-83c7-6326500aff7f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7ab8a3'},body:JSON.stringify({sessionId:'7ab8a3',runId:'pre-fix',hypothesisId:'H1',location:'components/SearchBar.tsx:12',message:'SearchBar render reached',data:{queryLength:query.length,hasOnSearch:typeof onSearch==='function'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Search for listings..."
                placeholderTextColor="#7a7a7a"
                value={query}
                onChangeText={(text) => {
                    // #region agent log
                    fetch('http://127.0.0.1:7327/ingest/d16ae285-20ce-46dd-83c7-6326500aff7f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7ab8a3'},body:JSON.stringify({sessionId:'7ab8a3',runId:'pre-fix',hypothesisId:'H4',location:'components/SearchBar.tsx:24',message:'SearchBar onChangeText fired',data:{nextQueryLength:text.length},timestamp:Date.now()})}).catch(()=>{});
                    // #endregion
                    onSearch(text);
                }}
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