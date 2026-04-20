import React from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { useSessionLoader } from '@/hooks/useSessionLoader';
import { useSessionState } from '@/hooks/useSessionState';
import type { SessionContext } from '@/hooks/useSessionState';
import type { SessionState } from '@/types';
import { SessionHeader } from '@/components/session/SessionHeader';
import { AyatCard } from '@/components/session/AyatCard';
import { ListenButton } from '@/components/session/ListenButton';
import { SessionActions } from '@/components/session/SessionActions';
import { ProgressBar } from '@/components/session/ProgressBar';
import { FinalTestScreen } from '@/components/session/FinalTestScreen';

const FINAL_PHASES = new Set([
  'final-intro',
  'final-recitation',
  'final-sincerity',
  'final-success',
  'final-reinforce',
]);

export default function SessionScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { result } = useSessionLoader();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (result.status === 'loading') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.brand.dark} size="large" />
        <Text style={styles.loadingText}>Préparation de ta session...</Text>
      </View>
    );
  }

  // ── Session already done today ─────────────────────────────────────────────
  if (result.status === 'session_done_today') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.doneIcon}>✓</Text>
        <Text style={styles.doneTitle}>Session du jour accomplie.</Text>
        <Text style={styles.doneSub}>Reviens demain إن شاء الله</Text>
        <Pressable onPress={() => router.replace('/(app)/(tabs)/today')} style={styles.btn}>
          <Text style={styles.btnText}>Retour à l'accueil</Text>
        </Pressable>
      </View>
    );
  }

  // ── Premium blocked — redirect to paywall, no flash ──────────────────────
  // useEffect avoids "Cannot update during render" warning from expo-router
  React.useEffect(() => {
    if (result.status === 'premium_blocked') {
      router.replace('/(app)/paywall');
    }
  }, [result.status, router]);

  if (result.status === 'premium_blocked') {
    return <View style={styles.center} />;
  }

  // ── Quran complete ─────────────────────────────────────────────────────────
  if (result.status === 'quran_complete') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.doneIcon}>🎉</Text>
        <Text style={styles.doneTitle}>Coran mémorisé.</Text>
        <Text style={styles.doneSub}>Qu'Allah accepte ton effort.</Text>
        <Pressable onPress={() => router.replace('/(app)/(tabs)/today')} style={styles.btn}>
          <Text style={styles.btnText}>Retour à l'accueil</Text>
        </Pressable>
      </View>
    );
  }

  // ── Invalid surah — données corrompues ou index hors limites ─────────────
  if (result.status === 'invalid_surah') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Une erreur est survenue. Merci de réessayer.</Text>
        <Pressable onPress={() => router.replace('/(app)/(tabs)/today')} style={styles.btn}>
          <Text style={styles.btnText}>Retour à l'accueil</Text>
        </Pressable>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (result.status === 'error') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{result.message}</Text>
        <Pressable onPress={() => router.replace('/(app)/(tabs)/today')} style={styles.btn}>
          <Text style={styles.btnText}>Retour à l'accueil</Text>
        </Pressable>
      </View>
    );
  }

  // ── Ready — build override + context from loader result ───────────────────
  const paramsOverride: Partial<SessionState> = {
    surahNumber: result.surahNumber,
    surahName:   result.surahName,
    startAyah:   result.ayats[0]?.id,
    endAyah:     result.ayats[result.ayats.length - 1]?.id,
    ayats:       result.ayats,
  };

  const sessionCtx: SessionContext = {
    userId:           result.userId,
    surahNumber:      result.surahNumber,
    savedAyah:        result.savedAyah,
    surahTotalVerses: result.surahTotalVerses,
    progress:         result.progress,
  };

  return <SessionInner paramsOverride={paramsOverride} sessionCtx={sessionCtx} />;
}

// ── Inner component — only mounts when data is ready ─────────────────────────

function SessionInner({
  paramsOverride,
  sessionCtx,
}: {
  paramsOverride: Partial<SessionState>;
  sessionCtx: SessionContext;
}) {
  const router = useRouter();
  const { state, actions } = useSessionState(paramsOverride, sessionCtx);

  const {
    ayats,
    currentIndex,
    surahName,
    startAyah,
    endAyah,
    phase,
    listenCount,
    saving,
    showRevealAnswer,
    successMsg,
    showSuccess,
    retryMsg,
  } = state;

  const ayat = ayats[currentIndex];
  const isFinal = FINAL_PHASES.has(phase);

  const surahRef =
    startAyah === endAyah
      ? `${surahName} • Ayat ${startAyah}`
      : `${surahName} • Ayat ${startAyah}–${endAyah}`;

  if (isFinal) {
    return (
      <FinalTestScreen
        phase={phase as any}
        surahRef={surahRef}
        showRevealAnswer={showRevealAnswer}
        saving={saving}
        onStart={actions.goToRecitation}
        onShowAnswer={actions.showAnswer}
        onContinueAfterReveal={actions.goToSincerity}
        onFinalSuccess={actions.handleFinalSuccess}
        onFinalReinforce={actions.handleFinalReinforce}
        onFinish={async (validated) => {
          await actions.finish(validated);
          router.replace({
            pathname: '/(app)/done',
            params: { result: validated ? 'validated' : 'reinforced' },
          });
        }}
        onRetry={actions.retry}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <SessionHeader
        surahName={surahName}
        startAyah={startAyah}
        endAyah={endAyah}
        currentIndex={currentIndex}
        total={ayats.length}
        saving={saving}
        onBack={() => router.back()}
      />

      <View style={styles.cardArea}>
        {ayat && (
          <AyatCard
            ayat={ayat}
            ayatNumber={currentIndex + 1}
            total={ayats.length}
            phase={phase}
            successMsg={successMsg}
            showSuccess={showSuccess}
            retryMsg={retryMsg}
          />
        )}

        {phase === 'listen' && ayat && (
          <ListenButton
            globalNum={ayat.globalNum}
            listenCount={listenCount}
            onListen={actions.incrementListen}
          />
        )}
      </View>

      <ProgressBar current={currentIndex + 1} total={ayats.length} />

      <SessionActions
        phase={phase}
        listenCount={listenCount}
        saving={saving}
        onListenReady={actions.advanceToTest}
        onSkip={actions.skipToTest}
        onReveal={actions.revealAyat}
        onRemembered={() => actions.handleRevealChoice(true)}
        onForgot={() => actions.handleRevealChoice(false)}
        onContinueValidated={actions.continueValidated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },
  cardArea: {
    flex: 1,
    margin: 16,
    gap: 12,
  },

  // Loading / error / done states
  center: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  doneIcon: {
    fontSize: 56,
    lineHeight: 72,
    textAlign: 'center',
  },
  doneTitle: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.brand.dark,
    textAlign: 'center',
  },
  doneSub: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  btn: {
    marginTop: 8,
    backgroundColor: Colors.brand.dark,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
  },
  btnText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
});
