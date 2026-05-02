import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isLoggedIn } = useAuth();
  // already signed in — skip the login screen
  if (isLoggedIn) return <Redirect href="/(tabs)/feed" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
