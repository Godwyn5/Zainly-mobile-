import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';

type Props = {
  surahName: string;
  startAyah: number;
  endAyah: number;
  currentIndex: number;
  total: number;
  saving: boolean;
  onBack: () => void;
};

export function SessionHeader({
  surahName,
  startAyah,
  endAyah,
  currentIndex,
  total,
  saving,
  onBack,
}: Props) {
  const insets = useSafeAreaInsets();
  const ayatLabel =
    startAyah === endAyah ? `Ayat ${startAyah}` : `Ayat ${startAyah}–${endAyah}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={saving ? undefined : onBack}
        style={({ pressed }) => [styles.backBtn, { opacity: pressed || saving ? 0.4 : 1 }]}
        hitSlop={12}
      >
        <Text style={styles.backIcon}>←</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.surahName}>{surahName}</Text>
        <Text style={styles.ayatRange}>{ayatLabel}</Text>
      </View>

      <Text style={styles.counter}>
        {currentIndex + 1} / {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brand.dark,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  surahName: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    color: '#fff',
    lineHeight: FontSizes.md * 1.2,
  },
  ayatRange: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  counter: {
    width: 44,
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
});
