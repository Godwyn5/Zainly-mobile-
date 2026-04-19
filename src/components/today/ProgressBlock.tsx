import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { Card } from '@/components/ui/Card';

type Props = {
  streak: number;
  revisionCount: number;
};

export function ProgressBlock({ streak, revisionCount }: Props) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={styles.streakBlock}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <View>
            <Text style={styles.streakValue}>{streak} jours</Text>
            <Text style={styles.streakLabel}>Série en cours</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.revisionBlock}>
          <Text style={styles.revisionValue}>{revisionCount}</Text>
          <Text style={styles.revisionLabel}>révisions aujourd’hui</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  streakEmoji: {
    fontSize: 28,
    lineHeight: 36,
  },
  streakValue: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.lg,
    color: Colors.text.primary,
    lineHeight: FontSizes.lg * 1.2,
  },
  streakLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.ui.border,
    marginHorizontal: 20,
  },
  revisionBlock: {
    flex: 1,
  },
  revisionValue: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.lg,
    color: Colors.text.primary,
    lineHeight: FontSizes.lg * 1.2,
  },
  revisionLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginTop: 2,
  },
});
