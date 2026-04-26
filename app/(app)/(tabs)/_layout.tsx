import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Svg, Path, Polyline, Line, Circle } from 'react-native-svg';

const ACTIVE   = '#163026';
const INACTIVE = '#C8BFB2';
const GOLD     = '#B8962E';

function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.tabIconWrap}>
      {children}
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

function HomeIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACTIVE : INACTIVE;
  return (
    <TabIcon focused={focused}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <Polyline points="9 22 9 12 15 12 15 22" />
      </Svg>
    </TabIcon>
  );
}

function ProgressIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACTIVE : INACTIVE;
  return (
    <TabIcon focused={focused}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Line x1="18" y1="20" x2="18" y2="10" />
        <Line x1="12" y1="20" x2="12" y2="4" />
        <Line x1="6"  y1="20" x2="6"  y2="14" />
      </Svg>
    </TabIcon>
  );
}

function HifzIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACTIVE : INACTIVE;
  return (
    <TabIcon focused={focused}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </Svg>
    </TabIcon>
  );
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const c = focused ? ACTIVE : INACTIVE;
  return (
    <TabIcon focused={focused}>
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Circle cx="12" cy="7" r="4" />
      </Svg>
    </TabIcon>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: 'rgba(245,240,230,0.92)',
          borderTopColor: 'rgba(22,48,38,0.08)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Aujourd'hui",
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progression',
          tabBarIcon: ({ focused }) => <ProgressIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="hifz"
        options={{
          title: 'Mon Hifz',
          tabBarIcon: ({ focused }) => <HifzIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: 'center', position: 'relative', paddingBottom: 4 },
  activeDot:   { position: 'absolute', bottom: -2, width: 4, height: 4, borderRadius: 2, backgroundColor: GOLD },
});
