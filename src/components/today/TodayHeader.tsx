import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';

type Props = {
  date: Date;
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function TodayHeader({ date }: Props) {
  const label = formatDate(date);
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Aujourd'hui</Text>
      <Text style={styles.date}>{capitalized}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes['2xl'],
    color: Colors.text.primary,
    lineHeight: FontSizes['2xl'] * 1.2,
  },
  date: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
