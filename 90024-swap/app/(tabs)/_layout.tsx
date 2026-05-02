import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';

export default function TabsLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        // logout icon in the header so we can bounce back to the login screen
        headerRight: () => (
          <Pressable onPress={signOut} style={{ paddingHorizontal: 16 }}>
            <Ionicons name="log-out-outline" size={22} color="#1A1A1A" />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}