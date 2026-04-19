import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { AyatStatusRow } from './AyatStatusRow';
import type { HifzSurahGroup } from '@/hooks/useHifzState';

type Props = {
  group: HifzSurahGroup;
  expanded: boolean;
  onToggle: () => void;
};

export function SurahGroup({ group, expanded, onToggle }: Props) {
  const rotation     = useSharedValue(0);
  const bodyOpacity  = useSharedValue(0);
  const bodyTranslY  = useSharedValue(-6);

  useEffect(() => {
    rotation.value    = withTiming(expanded ? 1 : 0, { duration: 220, easing: Easing.out(Easing.quad) });
    bodyOpacity.value = withTiming(expanded ? 1 : 0, { duration: 240, easing: Easing.out(Easing.quad) });
    bodyTranslY.value = withTiming(expanded ? 0 : -6, { duration: 240, easing: Easing.out(Easing.quad) });
  }, [expanded]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
    transform: [{ translateY: bodyTranslY.value }],
  }));

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
        android_ripple={{ color: 'rgba(22,48,38,0.05)' }}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.surahName}>{group.surahName}</Text>
          <Text style={styles.ayatCount}>
            {group.items.length} ayat{group.items.length > 1 ? 's' : ''} mémorisé{group.items.length > 1 ? 's' : ''}
          </Text>
        </View>

        <Animated.View style={chevronStyle}>
          <Text style={styles.chevron}>›</Text>
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View style={bodyStyle}>
          <View style={styles.divider} />
          {group.items.map((item, idx) => (
            <AyatStatusRow
              key={item.id}
              item={item}
              isLast={idx === group.items.length - 1}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.ui.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  headerPressed: {
    backgroundColor: 'rgba(22,48,38,0.03)',
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  surahName: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.brand.dark,
    lineHeight: FontSizes.md * 1.2,
  },
  ayatCount: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  chevron: {
    fontSize: 22,
    color: Colors.text.muted,
    fontWeight: '300',
    lineHeight: 24,
    transform: [{ rotate: '90deg' }],
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EBE0',
    marginHorizontal: 0,
  },
});
