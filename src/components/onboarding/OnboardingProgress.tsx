import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

type Props = {
  step: 1 | 2;
  total?: number;
};

export function OnboardingProgress({ step, total = 2 }: Props) {
  const width = useSharedValue(((step - 1) / total) * 100);

  useEffect(() => {
    width.value = withTiming((step / total) * 100, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
  }, [step]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: Colors.ui.border,
  },
  fill: {
    height: 3,
    backgroundColor: Colors.brand.gold,
  },
});
