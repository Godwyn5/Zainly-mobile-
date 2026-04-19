import React from 'react';
import {
  View, Text, ScrollView, FlatList, StyleSheet, Pressable,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { RhythmCard } from '@/components/onboarding/RhythmCard';
import { SurahRow } from '@/components/onboarding/SurahRow';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { LoadingScreen } from '@/components/onboarding/LoadingScreen';
import { PlanSummary } from '@/components/onboarding/PlanSummary';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { RHYTHMS, ZAINLY_ORDER, JUZ_30 } from '@/data/onboardingData';

// Juz filter pills: Tout + Juz 30 → Juz 1
const JUZ_FILTERS = [0, ...Array.from({ length: 30 }, (_, i) => 30 - i)];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, actions } = useOnboardingState();
  const {
    step, ayahPerDay, knownSurahs, partialSurahs,
    juzFilter, expandedPartial, loadingPercent, loadingPhrase, error,
    plan,
  } = state;

  // Slide animation between steps
  const opacity    = useSharedValue(1);
  const translateX = useSharedValue(0);

  function animateTransition(direction: 'forward' | 'back', cb: () => void) {
    const outX = direction === 'forward' ? -30 : 30;
    const inX  = direction === 'forward' ? 30  : -30;
    opacity.value    = withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) });
    translateX.value = withTiming(outX, { duration: 200 }, () => {
      translateX.value = inX;
      opacity.value    = 0;
    });
    setTimeout(() => {
      cb();
      opacity.value    = withTiming(1, { duration: 240, easing: Easing.out(Easing.quad) });
      translateX.value = withTiming(0, { duration: 240 });
    }, 220);
  }

  const slideStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  function handleGoToSurahs() {
    animateTransition('forward', actions.goToSurahs);
  }
  function handleGoBack() {
    animateTransition('back', actions.goBackToRhythm);
  }

  // Filtered surah list
  const juzSet  = juzFilter === 0 ? null : new Set(JUZ_30);
  const visible = juzFilter === 0
    ? ZAINLY_ORDER
    : ZAINLY_ORDER.filter(s => juzSet?.has(s));

  const allJuzAmmaKnown = JUZ_30.every(s => knownSurahs.includes(s));

  const preview30 = ayahPerDay
    ? `En 30 jours, tu auras mémorisé ~${Math.round(ayahPerDay * 6 * 4.33)} ayats.`
    : null;

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (step === 'loading') {
    return <LoadingScreen percent={loadingPercent} phrase={loadingPhrase} />;
  }

  // ── PLAN ─────────────────────────────────────────────────────────────────────
  async function handleConfirmOnboarding() {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
    router.replace('/(app)/(tabs)/today');
  }

  if (step === 'plan' && plan) {
    return (
      <PlanSummary
        plan={plan}
        onStart={handleConfirmOnboarding}
      />
    );
  }

  // ── QUESTIONS ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.screen}>
      <OnboardingProgress step={step === 'rhythm' ? 1 : 2} />

      <Animated.View style={[styles.flex, slideStyle]}>

        {/* ── STEP 1: Rythme ──────────────────────────────────────────────── */}
        {step === 'rhythm' && (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <AnimatedSection delay={0}>
              <Text style={styles.overline}>ÉTAPE 1 / 2</Text>
              <Text style={styles.title}>À quel rythme veux-tu avancer ?</Text>
              <Text style={styles.subtitle}>Tu pourras ajuster à tout moment.</Text>
            </AnimatedSection>

            <AnimatedSection delay={100}>
              <View style={[styles.previewBox, !!ayahPerDay && styles.previewBoxActive]}>
                {preview30 ? (
                  <>
                    <Text style={styles.previewMain}>{preview30}</Text>
                    <Text style={styles.previewMotivation}>
                      {RHYTHMS.find(r => r.ayah === ayahPerDay)?.motivation}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.previewPlaceholder}>
                    Choisis un rythme pour voir ta progression.
                  </Text>
                )}
              </View>
            </AnimatedSection>

            <AnimatedSection delay={160}>
              <View style={styles.rhythmList}>
                {RHYTHMS.map(r => (
                  <RhythmCard
                    key={r.ayah}
                    rhythm={r}
                    selected={ayahPerDay === r.ayah}
                    onPress={() => actions.setAyahPerDay(r.ayah)}
                  />
                ))}
              </View>
            </AnimatedSection>

            <AnimatedSection delay={220}>
              <PressableScale
                onPress={ayahPerDay ? handleGoToSurahs : undefined}
                style={[styles.cta, !ayahPerDay && styles.ctaDisabled]}
              >
                <Text style={[styles.ctaText, !ayahPerDay && styles.ctaTextDisabled]}>
                  Commencer avec ce rythme →
                </Text>
              </PressableScale>
            </AnimatedSection>
          </ScrollView>
        )}

        {/* ── STEP 2: Sourates connues ─────────────────────────────────────── */}
        {step === 'surahs' && (
          <View style={[styles.flex, { paddingTop: insets.top + 12 }]}>

            {/* Header fixe */}
            <View style={styles.surahHeader}>
              <Pressable onPress={handleGoBack} hitSlop={10}>
                <Text style={styles.backBtn}>← Retour</Text>
              </Pressable>

              <Text style={styles.overline}>ÉTAPE 2 / 2</Text>
              <Text style={styles.title}>Quelles sourates maîtrises-tu déjà ?</Text>
              <Text style={styles.subtitle}>
                Coche celles que tu maîtrises — si aucune, Zainly commence par Al-Fatiha.
              </Text>

              {/* Badge estimation */}
              {actions.estimatedYears !== null && (
                <View style={styles.estimateBadge}>
                  <Text style={styles.estimateText}>
                    ~{actions.estimatedYears} an{actions.estimatedYears > 1 ? 's' : ''} pour le Coran complet
                  </Text>
                </View>
              )}

              {/* Raccourcis */}
              <View style={styles.shortcuts}>
                <Pressable
                  onPress={actions.selectNone}
                  style={[styles.shortcutBtn, knownSurahs.length === 0 && styles.shortcutBtnActive]}
                >
                  <Text style={[styles.shortcutText, knownSurahs.length === 0 && styles.shortcutTextActive]}>
                    Aucune
                  </Text>
                </Pressable>
                <Pressable
                  onPress={allJuzAmmaKnown ? undefined : actions.selectJuzAmma}
                  style={[styles.shortcutBtn, styles.shortcutBtnGold, allJuzAmmaKnown && styles.shortcutBtnDone]}
                >
                  <Text style={[styles.shortcutText, styles.shortcutTextGold, allJuzAmmaKnown && styles.shortcutTextDone]}>
                    Je connais Juz Amma
                  </Text>
                </Pressable>
              </View>

              {/* Filtre Juz */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.juzFilters}
              >
                {JUZ_FILTERS.map(j => (
                  <Pressable
                    key={j}
                    onPress={() => actions.setJuzFilter(j)}
                    style={[styles.juzPill, juzFilter === j && styles.juzPillActive]}
                  >
                    <Text style={[styles.juzPillText, juzFilter === j && styles.juzPillTextActive]}>
                      {j === 0 ? 'Tout' : `Juz ${j}`}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Liste sourates */}
            <FlatList
              data={visible}
              keyExtractor={item => item}
              style={styles.surahList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: name }) => (
                <SurahRow
                  name={name}
                  checked={knownSurahs.includes(name)}
                  partial={partialSurahs[name]}
                  expandedPartial={expandedPartial}
                  onToggle={() => actions.toggleSurah(name)}
                  onExpandPartial={() => actions.setExpandedPartial(expandedPartial === name ? null : name)}
                  onPartialFrom={val => actions.setPartialFrom(name, val)}
                  onPartialTo={val => actions.setPartialTo(name, val)}
                  onPartialConfirm={() => actions.setExpandedPartial(null)}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            {/* CTA bas */}
            <View style={[styles.surahCta, { paddingBottom: insets.bottom + 16 }]}>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <PressableScale onPress={actions.generate} style={styles.cta}>
                <Text style={styles.ctaText}>Générer mon plan →</Text>
              </PressableScale>
            </View>
          </View>
        )}

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 0,
  },

  // Typography
  overline: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.xs,
    color: Colors.brand.gold,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    fontWeight: '600',
    color: Colors.brand.dark,
    textAlign: 'center',
    lineHeight: 28 * 1.3,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.6,
    marginBottom: 24,
  },

  // Preview box
  previewBox: {
    minHeight: 64,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  previewBoxActive: {
    backgroundColor: Colors.ui.cardBg,
    borderColor: Colors.ui.border,
  },
  previewMain: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.brand.dark,
    textAlign: 'center',
    lineHeight: FontSizes.md * 1.4,
    marginBottom: 4,
  },
  previewMotivation: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.brand.gold,
    textAlign: 'center',
  },
  previewPlaceholder: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    textAlign: 'center',
  },

  // Rhythm list
  rhythmList: { gap: 10, marginBottom: 28 },

  // CTA
  cta: {
    backgroundColor: Colors.brand.dark,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaDisabled: {
    backgroundColor: Colors.ui.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
  ctaTextDisabled: {
    color: Colors.text.muted,
  },

  // Surahs step
  surahHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    backgroundColor: Colors.ui.pageBg,
  },
  backBtn: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    paddingVertical: 8,
    marginBottom: 12,
  },
  estimateBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.ui.cardBg,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginBottom: 14,
  },
  estimateText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.sm,
    color: Colors.brand.dark,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
  },
  shortcutBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.ui.cardBg,
  },
  shortcutBtnActive: {
    backgroundColor: Colors.brand.dark,
    borderColor: Colors.brand.dark,
  },
  shortcutBtnGold: {
    borderColor: Colors.brand.gold,
  },
  shortcutBtnDone: {
    borderColor: Colors.ui.border,
    backgroundColor: Colors.ui.pageBg,
  },
  shortcutText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  shortcutTextActive: { color: '#fff' },
  shortcutTextGold: { color: Colors.brand.gold },
  shortcutTextDone: { color: Colors.text.muted },

  // Juz filter
  juzFilters: {
    paddingVertical: 4,
    gap: 6,
  },
  juzPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    backgroundColor: Colors.ui.cardBg,
  },
  juzPillActive: {
    backgroundColor: Colors.brand.dark,
    borderColor: Colors.brand.dark,
  },
  juzPillText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 12,
    color: Colors.text.secondary,
  },
  juzPillTextActive: { color: '#fff' },

  // Surah list
  surahList: {
    flex: 1,
    backgroundColor: Colors.ui.cardBg,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginLeft: 48,
  },

  // Bottom CTA area
  surahCta: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
    backgroundColor: Colors.ui.pageBg,
    gap: 8,
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: '#c0392b',
    textAlign: 'center',
  },
});
