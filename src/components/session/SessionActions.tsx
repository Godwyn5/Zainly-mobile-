import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import type { SessionPhase } from '@/types';

type Props = {
  phase: SessionPhase;
  listenCount: number;
  saving: boolean;
  onListenReady: () => void;
  onSkip: () => void;
  onReveal: () => void;
  onRemembered: () => void;
  onForgot: () => void;
  onContinueValidated: () => void;
};

export function SessionActions({
  phase,
  listenCount,
  saving,
  onListenReady,
  onSkip,
  onReveal,
  onRemembered,
  onForgot,
  onContinueValidated,
}: Props) {
  if (phase === 'loading') return null;

  return (
    <View style={styles.container}>
      {phase === 'validated' && (
        <PressableScale onPress={onContinueValidated} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Continuer →</Text>
        </PressableScale>
      )}

      {phase === 'listen' && (
        <PressableScale onPress={onListenReady} style={styles.primaryBtn}>
          <Text style={styles.primaryText}>Je suis prêt →</Text>
        </PressableScale>
      )}

      {phase === 'listen' && listenCount < 3 && (
        <View style={styles.skipRow}>
          <PressableScale onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Je connais déjà cet ayat →</Text>
          </PressableScale>
        </View>
      )}

      {phase === 'test' && (
        <PressableScale onPress={onReveal} style={styles.outlineBtn}>
          <Text style={styles.outlineText}>Révéler l'ayat</Text>
        </PressableScale>
      )}

      {phase === 'reveal' && (
        <View style={styles.row}>
          <PressableScale
            onPress={saving ? undefined : onRemembered}
            style={[styles.successBtn, saving && styles.disabled]}
          >
            <Text style={styles.primaryText}>Je m'en souvenais ✓</Text>
          </PressableScale>
          <PressableScale
            onPress={saving ? undefined : onForgot}
            style={[styles.ghostBtn, saving && styles.disabled]}
          >
            <Text style={styles.ghostText}>Je dois revoir ✗</Text>
          </PressableScale>
        </View>
      )}

      {saving && (
        <Text style={styles.saving}>Sauvegarde...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.brand.dark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.brand.dark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  outlineText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.brand.dark,
  },
  successBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Colors.brand.dark,
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ghostBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
  },
  ghostText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  skipRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  skipBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
  },
  disabled: {
    opacity: 0.5,
  },
  saving: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 10,
  },
});
