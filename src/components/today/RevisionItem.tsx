import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import type { RevisionItem as RevisionItemType } from '@/data/todayMock';

type Props = {
  item: RevisionItemType;
};

const STRENGTH_COLORS: Record<RevisionItemType['strength'], string> = {
  weak: '#C0392B',
  medium: Colors.brand.gold,
  strong: '#2E7D52',
};

const STRENGTH_LABELS: Record<RevisionItemType['strength'], string> = {
  weak: 'À renforcer',
  medium: 'En cours',
  strong: 'Solide',
};

export function RevisionItem({ item }: Props) {
  const { surahName, ayatRange, lastReviewedDaysAgo, strength } = item;
  const dot = STRENGTH_COLORS[strength];
  const label = STRENGTH_LABELS[strength];

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: dot }]} />
        <View style={styles.textBlock}>
          <Text style={styles.name}>{surahName}</Text>
          <Text style={styles.ayat}>
            Ayat {ayatRange[0]}–{ayatRange[1]}
          </Text>
        </View>
      </View>
      <View style={styles.meta}>
        <Text style={[styles.strengthLabel, { color: dot }]}>{label}</Text>
        <Text style={styles.daysAgo}>· il y a {lastReviewedDaysAgo}j</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.ui.cardBg,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#163026',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  textBlock: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.base,
    color: Colors.text.primary,
  },
  ayat: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  strengthLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.xs,
  },
  daysAgo: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginLeft: 2,
  },
});
