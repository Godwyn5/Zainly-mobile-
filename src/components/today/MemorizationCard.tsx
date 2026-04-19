import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { Card } from '@/components/ui/Card';
import { PressableScale } from '@/components/ui/PressableScale';
import type { MemorizationCard as MemorizationCardType } from '@/data/todayMock';

type Props = {
  data: MemorizationCardType;
  sessionDone?: boolean;
  onStart?: () => void;
};

export function MemorizationCard({ data, sessionDone = false, onStart }: Props) {
  const { surahName, surahNameAr, ayatRange, estimatedMinutes } = data;

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>À mémoriser</Text>
        </View>
        <Text style={styles.duration}>~{estimatedMinutes} min</Text>
      </View>

      <View style={styles.surahRow}>
        <View style={styles.surahInfo}>
          <Text style={styles.surahName}>{surahName}</Text>
          <Text style={styles.ayatRange}>
            Ayat {ayatRange[0]}–{ayatRange[1]}
          </Text>
        </View>
        <Text style={styles.arabicName}>{surahNameAr}</Text>
      </View>

      {sessionDone ? (
        <View style={styles.doneBadge}>
          <Text style={styles.doneText}>Session du jour complétée ✓</Text>
        </View>
      ) : (
        <PressableScale onPress={onStart} style={styles.ctaButton}>
          <Text style={styles.ctaText}>Commencer la session</Text>
        </PressableScale>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.brand.dark,
    padding: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.4,
  },
  duration: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.brand.gold,
    letterSpacing: 0.3,
  },
  surahRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  surahInfo: {
    flex: 1,
  },
  surahName: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.xl,
    color: Colors.text.inverse,
    lineHeight: FontSizes.xl * 1.2,
  },
  ayatRange: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  arabicName: {
    fontFamily: Fonts.amiri,
    fontSize: FontSizes['2xl'],
    color: 'rgba(255,255,255,0.35)',
    marginLeft: 12,
  },
  ctaButton: {
    backgroundColor: Colors.brand.gold,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.base,
    color: Colors.brand.dark,
    letterSpacing: 0.2,
  },
  doneBadge: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  doneText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.base,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.2,
  },
});
