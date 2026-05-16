import React from 'react';
import { TextInput } from 'react-native';


export const MessageBar = ({content, onEnter}: {content: string; onEnter: (content: string) => void}) => {
    return(
        <TextInput
            placeholder="Type your message..."
            value={content}
            onChangeText={() => onEnter(content)}
            style={{
                borderWidth:1,
                borderRadius:24
            }}
        />

    );
}