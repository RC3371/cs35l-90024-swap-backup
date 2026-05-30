import { ProfileView } from '@/components/ProfileView';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';

// The Profile tab shows the current user's own profile: their contact info
// and a dashboard of their active listings (with edit/delete).
export default function Profile() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;

  return <ProfileView uid={user.uid} isOwner />;
}
