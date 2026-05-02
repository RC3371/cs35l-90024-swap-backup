import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Slot, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

// redirects between the login screen and the tabs based on auth state
function RootNavigator() {
  const { isLoggedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navState = useRootNavigationState();

  useEffect(() => {
    // wait until the root navigator has mounted before redirecting
    if (!navState?.key) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isLoggedIn && inAuthGroup) {
      router.replace('/(tabs)/feed');
    }
  }, [isLoggedIn, segments, router, navState?.key]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
