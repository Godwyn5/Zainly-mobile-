import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useSessionState } from '@/hooks/useSessionState';
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
  const router = useRouter();
  const params = useLocalSearchParams<{
    surahNumber?: string;
    surahName?: string;
    startAyah?: string;
    endAyah?: string;
  }>();

  const paramsOverride: Partial<SessionState> | undefined =
    params.surahName
      ? {
          surahNumber: params.surahNumber ? Number(params.surahNumber) : undefined,
          surahName: params.surahName,
          startAyah: params.startAyah ? Number(params.startAyah) : undefined,
          endAyah: params.endAyah ? Number(params.endAyah) : undefined,
        }
      : undefined;

  const { state, actions } = useSessionState(paramsOverride);

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
        onFinish={(validated) => {
          actions.finish(validated);
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
});
