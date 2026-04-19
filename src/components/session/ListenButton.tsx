import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';

type Props = {
  listenCount: number;
  onListen: () => void;
};

const LISTEN_LABELS = [
  'Simuler écoute 1 / 3',
  'Simuler écoute 2 / 3',
  'Simuler écoute 3 / 3',
];

export function ListenButton({ listenCount, onListen }: Props) {
  const isDone = listenCount >= 3;
  const label  = isDone ? 'Ayat écouté 3 fois ✓' : LISTEN_LABELS[listenCount] ?? LISTEN_LABELS[0];

  return (
    <View style={styles.container}>
      <Text style={styles.mockNotice}>Audio non disponible dans cette version</Text>

      <PressableScale
        onPress={isDone ? undefined : onListen}
        style={[styles.btn, isDone && styles.btnDone]}
      >
        <Text style={styles.btnIcon}>🔊</Text>
        <Text style={styles.btnText}>{label}</Text>
      </PressableScale>

      {!isDone && (
        <Text style={styles.hint}>
          Appuie {3 - listenCount} fois de plus pour débloquer le test
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
  mockNotice: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.2,
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
