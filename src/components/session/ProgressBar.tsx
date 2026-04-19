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

type Props = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(pct, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [pct]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Text style={styles.label}>
        Ayat {current} sur {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  track: {
    height: 4,
    backgroundColor: '#E2D9CC',
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    backgroundColor: Colors.brand.dark,
    borderRadius: 2,
  },
  label: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    marginTop: 6,
  },
});
