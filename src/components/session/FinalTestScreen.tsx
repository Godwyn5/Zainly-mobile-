import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import type { SessionPhase } from '@/types';

type Props = {
  phase: Extract<SessionPhase, 'final-intro' | 'final-recitation' | 'final-sincerity' | 'final-success' | 'final-reinforce'>;
  surahRef: string;
  showRevealAnswer: boolean;
  saving: boolean;
  onStart: () => void;
  onShowAnswer: () => void;
  onContinueAfterReveal: () => void;
  onFinalSuccess: () => void;
  onFinalReinforce: () => void;
  onFinish: (validated: boolean) => void;
  onRetry: () => void;
};

export function FinalTestScreen({
  phase,
  surahRef,
  showRevealAnswer,
  saving,
  onStart,
  onShowAnswer,
  onContinueAfterReveal,
  onFinalSuccess,
  onFinalReinforce,
  onFinish,
  onRetry,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }]}>

      {/* ── INTRO ── */}
      {phase === 'final-intro' && (
        <View style={styles.center}>
          <AnimatedSection delay={0}>
            <Text style={styles.bigEmoji}>🎯</Text>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <Text style={styles.title}>Test final</Text>
          </AnimatedSection>
          <AnimatedSection delay={180}>
            <Text style={styles.subtitle}>
              Récite maintenant sans aide les versets travaillés aujourd'hui.
            </Text>
          </AnimatedSection>
          <AnimatedSection delay={260}>
            <PressableScale onPress={onStart} style={styles.primaryBtn}>
              <Text style={styles.primaryText}>Commencer le test</Text>
            </PressableScale>
          </AnimatedSection>
        </View>
      )}

      {/* ── RECITATION ── */}
      {phase === 'final-recitation' && (
        <View style={styles.center}>
          <AnimatedSection delay={0}>
            <Text style={styles.overlineGold}>À réciter</Text>
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <Text style={styles.refTitle}>{surahRef}</Text>
          </AnimatedSection>
          <AnimatedSection delay={140}>
            <Text style={styles.italic}>
              Récite de mémoire, sans regarder le texte.
            </Text>
          </AnimatedSection>
          <AnimatedSection delay={220}>
            {!showRevealAnswer ? (
              <PressableScale onPress={onShowAnswer} style={styles.outlineBtn}>
                <Text style={styles.outlineText}>Voir la réponse</Text>
              </PressableScale>
            ) : (
              <PressableScale onPress={onContinueAfterReveal} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>Continuer →</Text>
              </PressableScale>
            )}
          </AnimatedSection>
        </View>
      )}

      {/* ── SINCERITY ── */}
      {phase === 'final-sincerity' && (
        <View style={styles.center}>
          <AnimatedSection delay={0}>
            <Text style={styles.title}>As-tu réussi à réciter sans aide ?</Text>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <View style={styles.quoteBox}>
              <Text style={styles.quoteText}>
                « La vérité mène au bien, et le mensonge mène à l'égarement. »
              </Text>
              <Text style={styles.quoteSource}>Rapporté par al-Bukhari et Muslim</Text>
              <Text style={styles.quoteCta}>Sois sincère avec toi-même.</Text>
            </View>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <View style={styles.sincerityCtas}>
              <PressableScale onPress={onFinalSuccess} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>Oui, j'ai réussi ✓</Text>
              </PressableScale>
              <PressableScale onPress={onFinalReinforce} style={styles.outlineBtn}>
                <Text style={styles.outlineText}>Non, je dois renforcer</Text>
              </PressableScale>
            </View>
          </AnimatedSection>
        </View>
      )}

      {/* ── SUCCESS ── */}
      {phase === 'final-success' && (
        <View style={styles.center}>
          <AnimatedSection delay={0}>
            <Text style={styles.bigCheck}>✓</Text>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <Text style={styles.title}>Mémorisation validée</Text>
          </AnimatedSection>
          <AnimatedSection delay={180}>
            <Text style={styles.subtitle}>Tu connais maintenant ces versets.</Text>
          </AnimatedSection>
          <AnimatedSection delay={260}>
            <PressableScale
              onPress={saving ? undefined : () => onFinish(true)}
              style={[styles.primaryBtn, saving && styles.disabled]}
            >
              <Text style={styles.primaryText}>
                {saving ? 'Sauvegarde...' : 'Terminer la session'}
              </Text>
            </PressableScale>
          </AnimatedSection>
        </View>
      )}

      {/* ── REINFORCE ── */}
      {phase === 'final-reinforce' && (
        <View style={styles.center}>
          <AnimatedSection delay={0}>
            <Text style={styles.bigEmoji}>📖</Text>
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <Text style={styles.title}>Session terminée — à renforcer</Text>
          </AnimatedSection>
          <AnimatedSection delay={160}>
            <Text style={styles.subtitle}>
              Tu as avancé, mais ces versets ne sont pas encore parfaitement ancrés.
            </Text>
          </AnimatedSection>
          <AnimatedSection delay={240}>
            <View style={styles.sincerityCtas}>
              <PressableScale onPress={onRetry} style={styles.primaryBtn}>
                <Text style={styles.primaryText}>Refaire maintenant</Text>
              </PressableScale>
              <PressableScale
                onPress={saving ? undefined : () => onFinish(false)}
                style={[styles.outlineBtn, saving && styles.disabled]}
              >
                <Text style={styles.outlineText}>
                  {saving ? 'Sauvegarde...' : 'Continuer'}
                </Text>
              </PressableScale>
            </View>
          </AnimatedSection>
        </View>
      )}

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
    gap: 0,
  },
  bigEmoji: {
    fontSize: 52,
    textAlign: 'center',
    marginBottom: 24,
  },
  bigCheck: {
    fontSize: 72,
    color: '#2E7D52',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.xl,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: FontSizes.xl * 1.25,
    marginBottom: 16,
    maxWidth: 300,
  },
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.65,
    marginBottom: 40,
    maxWidth: 300,
  },
  overlineGold: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.xs,
    color: Colors.brand.gold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 14,
  },
  refTitle: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.lg,
    color: Colors.text.primary,
    textAlign: 'center',
    lineHeight: FontSizes.lg * 1.3,
    marginBottom: 36,
  },
  italic: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.6,
    marginBottom: 44,
    maxWidth: 280,
  },
  quoteBox: {
    backgroundColor: Colors.brand.sand,
    borderRadius: 16,
    padding: 20,
    maxWidth: 340,
    marginBottom: 36,
    gap: 8,
  },
  quoteText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    lineHeight: FontSizes.sm * 1.7,
  },
  quoteSource: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    letterSpacing: 0.3,
  },
  quoteCta: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  sincerityCtas: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.brand.dark,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 0,
  },
  primaryText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
  outlineBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.brand.dark,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  outlineText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.brand.dark,
  },
  disabled: {
    opacity: 0.5,
  },
});
