import { useEffect } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { STORAGE_KEYS } from '@/lib/storageKeys';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    SplashScreen.hideAsync();

    const inAuthGroup = pathname.startsWith('/(auth)');

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      // Check local flag — replaced by Supabase plan check once wired
      AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE).then(done => {
        router.replace(done === 'true' ? '/(app)/(tabs)/today' : '/(app)/onboarding');
      });
    }
    // session + !inAuthGroup → already in app, do nothing
    // !session + inAuthGroup → already on login, do nothing
  }, [session, loading, pathname, router]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
