import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

export default function TabsLayout() {
  const { user, loading, signOut } = useAuth();
  if (loading) return null;
  if (!user || !user.emailVerified) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        // logout icon in the header so we can bounce back to the login screen
        headerRight: () => (
          <Pressable onPress={() => signOut()} style={{ paddingHorizontal: 16 }}>
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
      <Tabs.Screen
        name="addListing"
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="add-circle" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="agreements"
        options={{
          title: 'Agreements',
          tabBarLabel: 'Agreements',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}