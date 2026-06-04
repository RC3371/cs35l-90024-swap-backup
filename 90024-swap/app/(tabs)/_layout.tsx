import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

// Feed is the home/default route for the tab group (the old placeholder
// index screen was removed).
export const unstable_settings = {
  anchor: 'feed',
};

export default function TabsLayout() {
  const { user, loading, signOut } = useAuth();
  if (loading) return null;
  if (!user || !user.emailVerified) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerTitle: '90024 Swap',
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
        name="drafts"
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({color, size}) => (
            <Ionicons name="add-circle" color={color} size={size} />
          )
        }}
      />
      {/* The create/edit form is reached from the Drafts screen and the profile
          edit flow via router.push; hidden from the tab bar. */}
      <Tabs.Screen name="addListing" options={{ href: null }} />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarLabel: 'Messages',
          // The messages tab nests its own Stack (list + conversation), which
          // renders the header; hide the tab header to avoid a double header.
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="agreements"
        options={{
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
