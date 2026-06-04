import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Pressable } from 'react-native';

export default function MessagesLayout() {
  const { signOut } = useAuth();
  return (
    <Stack
      screenOptions={{
        headerTitle: '90024 Swap',
        headerRight: () => (
          <Pressable onPress={() => signOut()} style={{ paddingHorizontal: 16 }}>
            <Ionicons name="log-out-outline" size={22} color="#1A1A1A" />
          </Pressable>
        ),
      }}
    />
  );
}
