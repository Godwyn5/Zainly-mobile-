import React from 'react';
import { ScrollView, View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { TodayHeader } from '@/components/today/TodayHeader';
import { MemorizationCard } from '@/components/today/MemorizationCard';
import { RevisionItem } from '@/components/today/RevisionItem';
import { ProgressBlock } from '@/components/today/ProgressBlock';
import { useTodayData } from '@/hooks/useTodayData';

export default function TodayScreen() {
  const insets       = useSafeAreaInsets();
  const router       = useRouter();
  const { state, reload } = useTodayData();

  const topPad = insets.top + 20;
  const botPad = insets.bottom + 32;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (state.status === 'loading') {
    return (
      <View style={[styles.center, { paddingTop: topPad }]}>
        <ActivityIndicator color={Colors.brand.dark} size="large" />
      </View>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (state.status === 'error') {
    return (
      <View style={[styles.center, { paddingTop: topPad }]}>
        <Text style={styles.errorText}>{state.message}</Text>
        <Pressable onPress={reload} style={styles.retryBtn}>
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  // ── No plan ───────────────────────────────────────────────────────────────
  if (state.status === 'no_plan') {
    return (
      <View style={[styles.center, { paddingTop: topPad }]}>
        <Text style={styles.noPlanText}>Aucun plan trouvé.</Text>
        <Pressable onPress={() => router.replace('/(onboarding)')} style={styles.retryBtn}>
          <Text style={styles.retryText}>Créer mon plan →</Text>
        </Pressable>
      </View>
    );
  }

  // ── Ready ─────────────────────────────────────────────────────────────────
  const { date, streak, revisionCount, sessionDone, memorizationCard, revisions } = state.data;

  function handleStartSession() {
    router.push({
      pathname: '/(app)/session',
      params: {
        surahNumber: String(memorizationCard.surahNumber),
        surahName: memorizationCard.surahName,
        startAyah: String(memorizationCard.ayatRange[0]),
        endAyah: String(memorizationCard.ayatRange[1]),
      },
    });
  }

  function handleStartRevision() {
    router.push('/(app)/revision');
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad, paddingBottom: botPad },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <AnimatedSection delay={0}>
        <TodayHeader date={date} />
      </AnimatedSection>

      <View style={styles.gap24} />

      <AnimatedSection delay={80}>
        <MemorizationCard data={memorizationCard} sessionDone={sessionDone} onStart={handleStartSession} />
      </AnimatedSection>

      {revisions.length > 0 && (
        <>
          <View style={styles.gap32} />

          <AnimatedSection delay={160}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Révisions</Text>
              <Pressable onPress={handleStartRevision} hitSlop={8}>
                <Text style={styles.sectionCta}>Commencer →</Text>
              </Pressable>
            </View>
          </AnimatedSection>

          <View style={styles.gap12} />

          {revisions.map((item, index) => (
            <AnimatedSection key={item.id} delay={200 + index * 60}>
              <RevisionItem item={item} />
              {index < revisions.length - 1 && <View style={styles.gap8} />}
            </AnimatedSection>
          ))}
        </>
      )}

      <View style={styles.gap32} />

      <AnimatedSection delay={400}>
        <ProgressBlock streak={streak} revisionCount={revisionCount} />
      </AnimatedSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  gap8:  { height: 8 },
  gap12: { height: 12 },
  gap24: { height: 24 },
  gap32: { height: 32 },

  // Loading / error / no_plan
  center: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  noPlanText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.lg,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.brand.dark,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },

  // Section header row
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionCta: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.sm,
    color: Colors.brand.gold,
  },
});
