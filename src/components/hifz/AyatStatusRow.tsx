import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Fonts, FontSizes } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAyatAudio } from '@/hooks/useAyatAudio';
import type { EnrichedReviewItem } from '@/hooks/useHifzLoader';

const GOLD    = '#C7A85A';
const EMERALD = '#0D3B2E';

type Props = {
  item: EnrichedReviewItem;
  isLast: boolean;
};

const STATUS_CONFIG = {
  validated: { label: 'Validé',      bg: 'rgba(46,125,82,0.1)',    text: '#2E7D52' },
  reinforce: { label: 'À renforcer', bg: 'rgba(199,168,90,0.12)',  text: GOLD },
  pending:   { label: 'En cours',    bg: 'rgba(13,59,46,0.07)',    text: EMERALD },
} as const;

export function AyatStatusRow({ item, isLast }: Props) {
  const cfg = STATUS_CONFIG[item.final_test_status] ?? STATUS_CONFIG.pending;
  const { status: audioStatus, toggle: audioToggle } = useAyatAudio(item.globalNum);

  const isPlaying = audioStatus === 'playing';
  const isLoading = audioStatus === 'loading';
  const isError   = audioStatus === 'error';

  return (
    <View style={[s.row, !isLast && s.rowBorder]}>

      {/* ── Top: ayat number + status badge ── */}
      <View style={s.topRow}>
        <View style={s.ayatNumWrap}>
          <Text style={s.ayatNum}>{item.ayah}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: cfg.bg }]}>
          <Text style={[s.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* ── Arabic text ── */}
      {!!item.arabicText && (
        <Text style={s.arabic}>{item.arabicText}</Text>
      )}

      {/* ── Transliteration ── */}
      {!!item.transliteration && (
        <Text style={s.translit}>{item.transliteration}</Text>
      )}

      {/* ── Translation ── */}
      {!!item.translation && (
        <Text style={s.translation}>{item.translation}</Text>
      )}

      {/* ── Audio button — gold premium ── */}
      <PressableScale
        onPress={audioToggle}
        style={[
          s.audioBtn,
          isPlaying && s.audioBtnPlaying,
          isError   && s.audioBtnError,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color={GOLD} size="small" />
        ) : (
          <Text style={s.audioBtnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        )}
        <Text style={[s.audioBtnText, isPlaying && s.audioBtnTextPlaying]}>
          {isPlaying ? 'Pause' : isError ? 'Erreur — réessayer' : 'Écouter'}
        </Text>
      </PressableScale>

    </View>
  );
}

const s = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(199,168,90,0.1)',
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ayatNumWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(199,168,90,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ayatNum: {
    fontFamily: Fonts.dmSansBold,
    fontSize: 12,
    fontWeight: '700',
    color: GOLD,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Texts
  arabic: {
    fontFamily: Fonts.amiri,
    fontSize: 28,
    color: EMERALD,
    textAlign: 'right',
    lineHeight: 52,
    writingDirection: 'rtl',
  },
  translit: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
    color: '#7A7060',
    lineHeight: FontSizes.sm * 1.6,
  },
  translation: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: '#9A9080',
    lineHeight: FontSizes.sm * 1.7,
  },

  // Audio button
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: EMERALD,
  },
  audioBtnPlaying: {
    backgroundColor: GOLD,
  },
  audioBtnError: {
    backgroundColor: '#C0392B',
  },
  audioBtnIcon: {
    fontSize: 14,
    color: '#fff',
  },
  audioBtnText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  audioBtnTextPlaying: {
    color: '#fff',
    fontWeight: '700',
  },
});
