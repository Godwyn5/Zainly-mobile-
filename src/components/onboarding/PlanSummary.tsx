import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { PressableScale } from '@/components/ui/PressableScale';
import type { GeneratedPlan } from '@/hooks/useOnboardingState';

type Props = {
  plan: GeneratedPlan;
  onStart: () => void;
};

export function PlanSummary({ plan, onStart }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.content}>

        <AnimatedSection delay={0}>
          <Text style={styles.overline}>PLAN PERSONNALISÉ</Text>
        </AnimatedSection>

        <AnimatedSection delay={80}>
          <Text style={styles.title}>Deviens Hafiz.</Text>
        </AnimatedSection>

        <AnimatedSection delay={160}>
          <Text style={styles.subtitle}>Ton plan est prêt. Il ne reste qu'à commencer.</Text>
        </AnimatedSection>

        <AnimatedSection delay={260}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{plan.ayahPerDay}</Text>
              <Text style={styles.statLabel}>Ayats / jour</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Jours / semaine</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{plan.estimatedYears}</Text>
              <Text style={styles.statLabel}>Ans pour le Coran</Text>
            </View>
          </View>
        </AnimatedSection>

        <AnimatedSection delay={340}>
          <Text style={styles.hint}>
            Aujourd'hui : {plan.ayahPerDay} ayat{plan.ayahPerDay > 1 ? 's' : ''}. Un premier pas, chaque jour.
          </Text>
        </AnimatedSection>

        <AnimatedSection delay={420}>
          <PressableScale onPress={onStart} style={styles.cta}>
            <Text style={styles.ctaText}>Commencer aujourd'hui</Text>
          </PressableScale>
        </AnimatedSection>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 0,
  },
  overline: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.xs,
    color: Colors.brand.gold,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes['2xl'],
    fontWeight: '600',
    color: Colors.brand.dark,
    textAlign: 'center',
    lineHeight: FontSizes['2xl'] * 1.2,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.6,
    marginBottom: 36,
  },
  statsCard: {
    backgroundColor: Colors.ui.cardBg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Fonts.playfair,
    fontSize: 32,
    fontWeight: '600',
    color: Colors.brand.dark,
    lineHeight: 36,
  },
  statLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.ui.border,
  },
  hint: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: FontSizes.sm * 1.7,
    marginBottom: 32,
  },
  cta: {
    backgroundColor: Colors.brand.dark,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  ctaText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
});
