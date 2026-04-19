import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';

type Props = {
  onStart: () => void;
};

export function HifzEmptyState({ onStart }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📖</Text>
      <Text style={styles.title}>Tu n'as pas encore{'\n'}mémorisé d'ayat.</Text>
      <Text style={styles.subtitle}>Lance ta première session.</Text>
      <PressableScale onPress={onStart} style={styles.cta}>
        <Text style={styles.ctaText}>Commencer →</Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  icon: {
    fontSize: 48,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.lg,
    fontWeight: '600',
    color: Colors.brand.dark,
    textAlign: 'center',
    lineHeight: FontSizes.lg * 1.35,
  },
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  cta: {
    marginTop: 8,
    backgroundColor: Colors.brand.dark,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
});
