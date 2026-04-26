import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/hooks/useAuth';
import { STORAGE_KEYS } from '@/lib/storageKeys';

export default function Index() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace('/(auth)/login');
      return;
    }
    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE).then(done => {
      router.replace(done === 'true' ? '/(app)/(tabs)/today' : '/(app)/onboarding');
    });
  }, [session, loading]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#163026" />
    </View>
  );
}
