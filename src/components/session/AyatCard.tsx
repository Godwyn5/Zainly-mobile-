import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import type { Ayat, SessionPhase } from '@/types';
import { PhasePills } from './PhasePills';

type Props = {
  ayat: Ayat;
  ayatNumber: number;
  total: number;
  phase: SessionPhase;
  successMsg: string;
  showSuccess: boolean;
  retryMsg: boolean;
};

export function AyatCard({
  ayat,
  ayatNumber,
  total,
  phase,
  successMsg,
  showSuccess,
  retryMsg,
}: Props) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(12);
  const arabic     = useSharedValue(1);

  useEffect(() => {
    opacity.value    = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
  }, [ayat.id]);

  useEffect(() => {
    arabic.value = withTiming(
      phase === 'test' ? 0 : 1,
      { duration: 350, easing: Easing.out(Easing.quad) }
    );
  }, [phase]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const arabicStyle = useAnimatedStyle(() => ({
    opacity: arabic.value,
  }));

  const isValidated = phase === 'validated';

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <PhasePills phase={phase} />

      <View style={styles.ayatMeta}>
        <Text style={styles.ayatBadge}>Ayat {ayat.id}</Text>
        <View style={styles.dot} />
        <Text style={styles.counter}>{ayatNumber} / {total}</Text>
      </View>

      {isValidated ? (
        <View style={styles.validatedContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      ) : (
        <>
          <Animated.Text style={[styles.arabicText, arabicStyle]}>
            {ayat.text}
          </Animated.Text>

          {phase === 'test' && (
            <Text style={styles.testHint}>Essaie de réciter cet ayat de mémoire</Text>
          )}

          <View style={styles.divider} />

          <Animated.Text style={[styles.translation, arabicStyle]}>
            {ayat.translation}
          </Animated.Text>
        </>
      )}

      {showSuccess && (
        <Text style={styles.successMsg}>{successMsg} ✓</Text>
      )}

      {retryMsg && (
        <Text style={styles.retryMsg}>Recommence tranquillement, ça va venir.</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.ui.cardBg,
    borderRadius: 24,
    padding: 28,
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    justifyContent: 'center',
  },
  ayatMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  ayatBadge: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.xs,
    letterSpacing: 0.8,
    color: Colors.brand.gold,
    textTransform: 'uppercase',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.ui.border,
  },
  counter: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
  },
  arabicText: {
    fontFamily: Fonts.amiri,
    fontSize: 32,
    textAlign: 'center',
    direction: 'rtl',
    lineHeight: 32 * 1.8,
    color: Colors.text.primary,
  } as any,
  testHint: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: FontSizes.base * 1.6,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginVertical: 20,
  },
  translation: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: FontSizes.sm * 1.65,
  },
  validatedContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  checkmark: {
    fontSize: 64,
    color: '#2E7D52',
  },
  successMsg: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.sm,
    color: '#2E7D52',
  },
  retryMsg: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
    color: Colors.brand.gold,
    textAlign: 'center',
    marginTop: 12,
  },
});
