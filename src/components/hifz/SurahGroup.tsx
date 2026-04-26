import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import { Fonts, FontSizes } from '@/constants/typography';
import { AyatStatusRow } from './AyatStatusRow';
import type { HifzSurahGroup } from '@/hooks/useHifzState';

const GOLD    = '#C7A85A';
const EMERALD = '#0D3B2E';
const GREEN_SOFT = '#2E7D52';

type Props = {
  group: HifzSurahGroup;
  expanded: boolean;
  onToggle: () => void;
};

export function SurahGroup({ group, expanded, onToggle }: Props) {
  const rotation    = useSharedValue(0);
  const bodyOpacity = useSharedValue(0);
  const bodyTranslY = useSharedValue(-8);
  const scale       = useSharedValue(1);

  useEffect(() => {
    rotation.value    = withSpring(expanded ? 1 : 0, { damping: 16, stiffness: 180 });
    bodyOpacity.value = withTiming(expanded ? 1 : 0, { duration: 260, easing: Easing.out(Easing.quad) });
    bodyTranslY.value = withTiming(expanded ? 0 : -8, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [expanded]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 90}deg` }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: bodyOpacity.value,
    transform: [{ translateY: bodyTranslY.value }],
  }));

  const pressScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const total      = group.items.length;
  const validated  = group.validatedCount;
  const validPct   = total > 0 ? (validated / total) * 100 : 0;

  return (
    <Animated.View style={[s.card, expanded && s.cardExpanded, pressScale]}>
      <Pressable
        onPress={onToggle}
        onPressIn={() => { scale.value = withSpring(0.985, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18 }); }}
        style={({ pressed }) => [s.header, pressed && s.headerPressed]}
        android_ripple={{ color: 'rgba(13,59,46,0.05)' }}
      >
        <View style={s.headerLeft}>
          {/* Surah name */}
          <Text style={s.surahName}>{group.surahName}</Text>

          {/* Meta row */}
          <View style={s.metaRow}>
            <Text style={s.ayatCount}>
              {total} ayat{total > 1 ? 's' : ''}
            </Text>
            {group.reinforceCount > 0 && (
              <View style={s.reinforcePill}>
                <Text style={s.reinforcePillText}>{group.reinforceCount} à renforcer</Text>
              </View>
            )}
            {validated === total && total > 0 && (
              <View style={s.validatedPill}>
                <Text style={s.validatedPillText}>✓ Maîtrisé</Text>
              </View>
            )}
          </View>

          {/* Mini progress bar */}
          <View style={s.miniBarBg}>
            <View style={[s.miniBarFill, { width: `${validPct}%` as unknown as number }]} />
          </View>
        </View>

        {/* Chevron */}
        <Animated.View style={[s.chevronWrap, chevronStyle]}>
          <Text style={s.chevron}>›</Text>
        </Animated.View>
      </Pressable>

      {expanded && (
        <Animated.View style={bodyStyle}>
          <View style={s.divider} />
          {group.items.map((item, idx) => (
            <AyatStatusRow
              key={item.id}
              item={item}
              isLast={idx === group.items.length - 1}
            />
          ))}
        </Animated.View>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#060f0b',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(199,168,90,0.12)',
  },
  cardExpanded: {
    borderColor: 'rgba(199,168,90,0.35)',
    shadowOpacity: 0.14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 12,
  },
  headerPressed: {
    backgroundColor: 'rgba(13,59,46,0.02)',
  },
  headerLeft: {
    flex: 1,
    gap: 6,
  },
  surahName: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: EMERALD,
    lineHeight: FontSizes.md * 1.25,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ayatCount: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: '#7A7060',
  },
  reinforcePill: {
    backgroundColor: 'rgba(199,168,90,0.12)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reinforcePillText: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    fontWeight: '600',
    color: GOLD,
  },
  validatedPill: {
    backgroundColor: 'rgba(46,125,82,0.1)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  validatedPillText: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    fontWeight: '600',
    color: GREEN_SOFT,
  },
  miniBarBg: {
    height: 3,
    backgroundColor: 'rgba(199,168,90,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  miniBarFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 2,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: 20,
    color: GOLD,
    fontWeight: '300',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(199,168,90,0.12)',
  },
});
