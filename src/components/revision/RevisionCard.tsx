import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, FadeIn,
} from 'react-native-reanimated';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes, LineHeights } from '@/constants/typography';
import { PressableScale } from '@/components/ui/PressableScale';
import type { RevisionItem } from '@/data/revisionMock';
import type { RevisionPhase } from '@/hooks/useRevisionState';

type Props = {
  item: RevisionItem;
  phase: RevisionPhase;
  showTranslit: boolean;
  srsMsg: string;
  saving: boolean;
  isFirst: boolean;
  onReveal: () => void;
  onToggleTranslit: () => void;
  onAnswer: (remembered: boolean) => void;
};

export function RevisionCard({
  item, phase, showTranslit, srsMsg, saving, isFirst,
  onReveal, onToggleTranslit, onAnswer,
}: Props) {
  const opacity   = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value    = 0;
    translateY.value = 10;
    opacity.value    = withTiming(1, { duration: 320, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.quad) });
  }, [item.id]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));


  return (
    <Animated.View style={[styles.card, cardStyle]}>

      {/* Badge */}
      <Text style={styles.badge}>RÉVISION</Text>

      {/* Intro — first ayat only, before reveal */}
      {isFirst && phase === 'recall' && (
        <Text style={styles.intro}>
          Ces ayats reviennent au bon moment pour être mémorisés durablement.
        </Text>
      )}

      {/* Surah + ayat ref */}
      <Text style={styles.ref}>{item.surahLabel} — Ayat {item.ayah}</Text>

      {/* Instruction */}
      <Text style={styles.instruction}>Essaie de réciter cet ayat de mémoire</Text>

      {/* Translitération — toggle or auto-show after reveal */}
      {(phase === 'revealed' || showTranslit) ? (
        <Animated.Text entering={FadeIn.duration(300)} style={styles.translit}>
          {item.transliteration}
        </Animated.Text>
      ) : (
        <PressableScale onPress={onToggleTranslit} style={styles.translitToggle}>
          <Text style={styles.translitToggleText}>Voir la translittération</Text>
        </PressableScale>
      )}

      {/* Traduction — toujours visible */}
      {item.translation ? (
        <Text style={styles.translation}>{item.translation}</Text>
      ) : null}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Texte arabe — affiché uniquement après révélation */}
      {phase === 'revealed' && (
        <Animated.Text entering={FadeIn.duration(350)} style={styles.arabic}>
          {item.arabicText}
        </Animated.Text>
      )}

      {/* CTA reveal */}
      {phase === 'recall' && (
        <PressableScale onPress={onReveal} style={styles.revealBtn}>
          <Text style={styles.revealBtnText}>Voir l'ayat</Text>
        </PressableScale>
      )}

      {/* SRS buttons */}
      {phase === 'revealed' && (
        <View style={styles.srsRow}>
          <PressableScale
            onPress={() => onAnswer(true)}
            disabled={saving}
            style={[styles.srsBtn, styles.srsBtnPrimary, saving && styles.disabled]}
          >
            <Text style={styles.srsBtnPrimaryText}>Je m'en souvenais ✓</Text>
          </PressableScale>
          <PressableScale
            onPress={() => onAnswer(false)}
            disabled={saving}
            style={[styles.srsBtn, styles.srsBtnSecondary, saving && styles.disabled]}
          >
            <Text style={styles.srsBtnSecondaryText}>Je ne m'en souvenais pas ✗</Text>
          </PressableScale>
        </View>
      )}

      {/* SRS message */}
      {srsMsg ? (
        <Animated.Text entering={FadeIn.duration(250)} style={styles.srsMsg}>
          {srsMsg}
        </Animated.Text>
      ) : null}

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.ui.cardBg,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    justifyContent: 'center',
    gap: 12,
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 6,
  },

  badge: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.xs,
    letterSpacing: 2,
    color: Colors.brand.gold,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  intro: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    fontStyle: 'italic',
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: FontSizes.xs * LineHeights.relaxed,
  },

  ref: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  instruction: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.md * LineHeights.relaxed,
  },

  translit: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.md,
    fontStyle: 'italic',
    color: Colors.brand.dark,
    textAlign: 'center',
    lineHeight: FontSizes.md * LineHeights.normal,
  },

  translitToggle: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  translitToggleText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.brand.gold,
    textDecorationLine: 'underline',
  },

  translation: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    textAlign: 'center',
    lineHeight: FontSizes.sm * LineHeights.relaxed,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginVertical: 4,
  },

  arabic: {
    fontFamily: Fonts.amiri,
    fontSize: 32,
    color: Colors.brand.dark,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 32 * 1.8,
    minHeight: 32 * 1.8, // keep space even when opacity=0
  },

  revealBtn: {
    borderWidth: 1.5,
    borderColor: Colors.brand.dark,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  revealBtnText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.brand.dark,
  },

  srsRow: {
    gap: 10,
    marginTop: 4,
  },
  srsBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  srsBtnPrimary: {
    backgroundColor: Colors.brand.dark,
  },
  srsBtnPrimaryText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
  srsBtnSecondary: {
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
  },
  srsBtnSecondaryText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.text.muted,
  },
  disabled: {
    opacity: 0.5,
  },

  srsMsg: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    fontStyle: 'italic',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
