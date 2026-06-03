import { ProfileView } from '@/components/ProfileView';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

// Public provider profile reached by tapping a provider's name on the feed.
// Read-only: shows the provider's public info, contact details, and active posts.
export default function ProviderProfile() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const router = useRouter();

  if (!uid) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Provider not found.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Provider',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/feed'))}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ paddingHorizontal: 4 }}
            >
              <Text style={{ color: '#2563eb', fontSize: 17, fontWeight: '600' }}>‹ Back</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ProfileView uid={uid} isOwner={false} />
    </>
  );
}
