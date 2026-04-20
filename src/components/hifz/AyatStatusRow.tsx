import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAyatAudio } from '@/hooks/useAyatAudio';
import type { EnrichedReviewItem } from '@/hooks/useHifzLoader';

type Props = {
  item: EnrichedReviewItem;
  isLast: boolean;
};

const STATUS_CONFIG = {
  validated: { label: 'Validé',      bg: 'rgba(22,48,38,0.08)',    text: Colors.brand.dark },
  reinforce: { label: 'À renforcer', bg: 'rgba(184,150,46,0.12)',  text: Colors.brand.gold },
  pending:   { label: 'En cours',    bg: 'rgba(155,145,137,0.12)', text: Colors.text.muted },
} as const;

export function AyatStatusRow({ item, isLast }: Props) {
  const cfg = STATUS_CONFIG[item.final_test_status] ?? STATUS_CONFIG.pending;
  const { status: audioStatus, toggle: audioToggle } = useAyatAudio(item.globalNum);

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      {/* Numéro + badge */}
      <View style={styles.topRow}>
        <Text style={styles.ayatLabel}>Ayat {item.ayah}</Text>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Texte arabe */}
      {item.arabicText ? (
        <Text style={styles.arabic}>{item.arabicText}</Text>
      ) : null}

      {/* Translittération */}
      {item.transliteration ? (
        <Text style={styles.translit}>{item.transliteration}</Text>
      ) : null}

      {/* Traduction */}
      {item.translation ? (
        <Text style={styles.translation}>{item.translation}</Text>
      ) : null}

      {/* Bouton audio */}
      <PressableScale onPress={audioToggle} style={[
        styles.audioBtn,
        audioStatus === 'playing' && styles.audioBtnActive,
        audioStatus === 'error'   && styles.audioBtnError,
      ]}>
        {audioStatus === 'loading' ? (
          <ActivityIndicator color={Colors.brand.dark} size="small" />
        ) : (
          <Text style={styles.audioBtnIcon}>
            {audioStatus === 'playing' ? '⏸' : '🔊'}
          </Text>
        )}
        <Text style={[
          styles.audioBtnText,
          audioStatus === 'playing' && styles.audioBtnTextActive,
        ]}>
          {audioStatus === 'playing' ? 'Pause' : audioStatus === 'error' ? 'Erreur — réessayer' : 'Écouter l\'ayat'}
        </Text>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ayatLabel: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.sm,
    color: Colors.brand.gold,
    letterSpacing: 0.5,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.xs,
    letterSpacing: 0.2,
  },
  arabic: {
    fontFamily: Fonts.amiri,
    fontSize: 26,
    color: Colors.brand.dark,
    textAlign: 'right',
    lineHeight: 26 * 1.8,
    writingDirection: 'rtl',
  },
  translit: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
    color: Colors.text.secondary,
    lineHeight: FontSizes.sm * 1.5,
  },
  translation: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    lineHeight: FontSizes.sm * 1.6,
  },

  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  audioBtnActive: {
    borderColor: Colors.brand.gold,
    backgroundColor: 'rgba(184,150,46,0.08)',
  },
  audioBtnError: {
    borderColor: Colors.status.error,
  },
  audioBtnIcon: {
    fontSize: 15,
  },
  audioBtnText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  audioBtnTextActive: {
    color: Colors.brand.gold,
  },
});
