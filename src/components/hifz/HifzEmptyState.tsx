import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';

const GOLD    = '#C7A85A';
const EMERALD = '#0D3B2E';

type Props = {
  onStart: () => void;
};

export function HifzEmptyState({ onStart }: Props) {
  return (
    <View style={s.container}>
      <Animated.View entering={FadeInDown.delay(80).duration(500).springify()} style={s.inner}>

        {/* Arabic watermark */}
        <Text style={s.calligraphy}>الحفظ</Text>

        {/* Gold accent line */}
        <View style={s.accentLine} />

        <Text style={s.title}>Ton Hifz commence{'\n'}ici.</Text>
        <Text style={s.subtitle}>
          Chaque ayat mémorisé est une lumière que tu portes avec toi.{'\n'}
          Lance ta première session pour commencer.
        </Text>

        <PressableScale onPress={onStart} style={s.cta}>
          <Text style={s.ctaText}>Commencer ma première session →</Text>
        </PressableScale>

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F3EA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  inner: {
    alignItems: 'center',
    gap: 16,
    position: 'relative',
  },
  calligraphy: {
    fontFamily: Fonts.amiri,
    fontSize: 80,
    color: 'rgba(199,168,90,0.15)',
    lineHeight: 100,
    marginBottom: -16,
  },
  accentLine: {
    width: 32,
    height: 2,
    borderRadius: 1,
    backgroundColor: GOLD,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.xl,
    fontWeight: '700',
    color: EMERALD,
    textAlign: 'center',
    lineHeight: FontSizes.xl * 1.3,
  },
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: '#7A7060',
    textAlign: 'center',
    lineHeight: FontSizes.sm * 1.7,
    maxWidth: 280,
  },
  cta: {
    marginTop: 8,
    backgroundColor: EMERALD,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: EMERALD,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaText: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
