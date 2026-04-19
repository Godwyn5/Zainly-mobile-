import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';

type Props = {
  percent: number;
  phrase: string;
  error?: string | null;
};

export function LoadingScreen({ percent, phrase, error }: Props) {
  const insets = useSafeAreaInsets();
  const arcValue = useSharedValue(0);

  useEffect(() => {
    arcValue.value = withTiming(percent, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [percent]);

  const RADIUS = 72;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const strokeStyle = useAnimatedStyle(() => ({
    strokeDashoffset: CIRCUMFERENCE - (arcValue.value / 100) * CIRCUMFERENCE,
  } as any));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.center}>
        <View style={styles.circleWrapper}>
          <Animated.View>
            <Animated.Text style={styles.svgPlaceholder}>
              {Math.round(percent)}%
            </Animated.Text>
          </Animated.View>

          <View style={styles.ringTrack}>
            <View style={[styles.ringFill, { width: `${percent}%` as any }]} />
          </View>
        </View>

        <Text style={styles.phrase}>{phrase}</Text>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    paddingHorizontal: 32,
  },
  circleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  svgPlaceholder: {
    fontFamily: Fonts.playfair,
    fontSize: 52,
    fontWeight: '600',
    color: Colors.brand.dark,
  },
  ringTrack: {
    width: 160,
    height: 3,
    backgroundColor: Colors.ui.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  ringFill: {
    height: 3,
    backgroundColor: Colors.brand.dark,
    borderRadius: 2,
  },
  phrase: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.md * 1.5,
  },
  error: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: '#c0392b',
    textAlign: 'center',
  },
});
