import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAyatAudio } from '@/hooks/useAyatAudio';

type Props = {
  globalNum: number;   // 1-based global ayah number — used to build audio URL
  listenCount: number;
  onListen: () => void;
};

export function ListenButton({ globalNum, listenCount, onListen }: Props) {
  const isDone = listenCount >= 3;

  // Real audio — identical to web app SessionAudioButton
  // onEnded fires when playback finishes naturally → increments listenCount
  const { status, toggle } = useAyatAudio(globalNum, onListen);

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const isError   = status === 'error';

  const icon  = isLoading ? null  : isPlaying ? '⏸' : '🔊';
  const label = isDone
    ? 'Ayat écouté 3 fois ✓'
    : isPlaying
      ? 'Pause'
      : isError
        ? 'Erreur — réessayer'
        : `Écouter l'ayat (${listenCount + 1} / 3)`;

  return (
    <View style={styles.container}>
      <PressableScale
        onPress={isDone ? undefined : toggle}
        disabled={isDone}
        style={[styles.btn, isDone && styles.btnDone, isError && styles.btnError]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.btnIcon}>{icon}</Text>
        )}
        <Text style={styles.btnText}>{label}</Text>
      </PressableScale>

      {!isDone && !isError && (
        <Text style={styles.hint}>
          {3 - listenCount} écoute{3 - listenCount > 1 ? 's' : ''} restante{3 - listenCount > 1 ? 's' : ''} pour débloquer le test
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    gap: 10,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.brand.dark,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnDone: {
    backgroundColor: '#2d5a42',
  },
  btnError: {
    backgroundColor: '#a94442',
  },
  btnIcon: {
    fontSize: 18,
  },
  btnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.base,
    color: '#fff',
  },
  hint: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.brand.gold,
    textAlign: 'center',
  },
});
