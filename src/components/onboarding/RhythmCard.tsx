import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import type { Rhythm } from '@/data/onboardingData';

type Props = {
  rhythm: Rhythm;
  selected: boolean;
  onPress: () => void;
};

export function RhythmCard({ rhythm, selected, onPress }: Props) {
  const scale = useSharedValue(1);
  const borderOpacity = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    borderOpacity.value = withTiming(selected ? 1 : 0, { duration: 200 });
    scale.value = withTiming(selected ? 1.015 : 1, { duration: 200, easing: Easing.out(Easing.quad) });
  }, [selected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <PressableScale onPress={onPress}>
      <Animated.View style={[styles.card, selected && styles.cardSelected, animStyle]}>
        <View style={styles.left}>
          <Text style={[styles.label, selected && styles.labelSelected]}>{rhythm.label}</Text>
          <Text style={[styles.desc, selected && styles.descSelected]}>{rhythm.desc}</Text>
        </View>
        {selected && <View style={styles.dot} />}
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.ui.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: Colors.brand.dark,
    backgroundColor: '#F0EDE7',
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
  left: { flex: 1 },
  label: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    color: Colors.text.primary,
    lineHeight: FontSizes.md * 1.2,
  },
  labelSelected: { color: Colors.brand.dark },
  desc: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 3,
  },
  descSelected: { color: Colors.brand.dark },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brand.dark,
    marginLeft: 14,
  },
});
