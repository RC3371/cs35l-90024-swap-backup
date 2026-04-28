import { Text, View } from 'react-native';

export default function HomePlaceholder() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>🚧 Work in Progress</Text>
    </View>
  );
}