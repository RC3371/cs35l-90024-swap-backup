import { useAuth } from '@/contexts/AuthContext';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  // only let verified users skip the login screen
  if (user && user.emailVerified) return <Redirect href="/(tabs)/feed" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
