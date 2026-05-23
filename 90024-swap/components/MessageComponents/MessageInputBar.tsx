import React from 'react';
import { TextInput, View } from 'react-native';
import { SendButton } from './SendButton';


export const MessageInputBar = ({
    content, onSend, onChangeText
}: {
    content: string; 
    onChangeText: (content: string) => void
    onSend: () => void
}) => {
    return(
        <View style={{flexDirection: "row", maxWidth: "100%"}}>
            <TextInput
            placeholder="Type your message..."
            value={content}
            onChangeText={onChangeText}
            style={{
                borderWidth:1,
                flex: 1,
                borderRadius:24
            }}
            />
            <SendButton onPress={onSend}/>
        </View>

    );
}