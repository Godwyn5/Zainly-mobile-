import { Tabs } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.brand.dark,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.ui.cardBg,
          borderTopColor: Colors.ui.border,
        },
      }}
    >
      <Tabs.Screen name="today"   options={{ title: "Aujourd'hui" }} />
      <Tabs.Screen name="hifz"    options={{ title: 'Mon Hifz' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
