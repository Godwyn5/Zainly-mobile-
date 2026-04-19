import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { PressableScale } from '@/components/ui/PressableScale';

type DoneResult = 'validated' | 'reinforced';

const CONTENT: Record<DoneResult, { icon: string; iconColor: string; title: string; sub: string }> = {
  validated: {
    icon: '✓',
    iconColor: '#2E7D52',
    title: 'Mémorisation accomplie',
    sub: 'Ces versets sont maintenant ancrés. Continue ce rythme — chaque jour compte.',
  },
  reinforced: {
    icon: '📖',
    iconColor: Colors.brand.dark,
    title: 'Session terminée',
    sub: 'Tu as travaillé ces versets. Reviens les renforcer dans Mon Hifz quand tu es prêt.',
  },
};

export default function DoneScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { result } = useLocalSearchParams<{ result: DoneResult }>();
  const content = CONTENT[result ?? 'validated'];

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}>
      <View style={styles.center}>
        <AnimatedSection delay={0}>
          <Text style={[styles.icon, { color: content.iconColor }]}>{content.icon}</Text>
        </AnimatedSection>

        <AnimatedSection delay={120}>
          <Text style={styles.title}>{content.title}</Text>
        </AnimatedSection>

        <AnimatedSection delay={220}>
          <Text style={styles.sub}>{content.sub}</Text>
        </AnimatedSection>

        <AnimatedSection delay={340}>
          <PressableScale
            onPress={() => router.replace('/(app)/(tabs)/today')}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Retour à l'accueil</Text>
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
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.xl,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: FontSizes.xl * 1.25,
    marginBottom: 12,
  },
  sub: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.65,
    marginBottom: 48,
    maxWidth: 280,
  },
  btn: {
    width: '100%',
    backgroundColor: Colors.brand.dark,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  btnText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
});
