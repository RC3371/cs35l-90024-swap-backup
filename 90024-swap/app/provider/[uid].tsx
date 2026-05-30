import { ProfileView } from '@/components/ProfileView';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

// Public provider profile reached by tapping a provider's name on the feed.
// Read-only: shows the provider's public info, contact details, and active posts.
export default function ProviderProfile() {
  const { uid } = useLocalSearchParams<{ uid: string }>();

  if (!uid) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Provider not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Provider' }} />
      <ProfileView uid={uid} isOwner={false} />
    </>
  );
}
