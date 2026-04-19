import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { useRevisionState } from '@/hooks/useRevisionState';
import { RevisionCard } from '@/components/revision/RevisionCard';
import { RevisionProgress } from '@/components/revision/RevisionProgress';

export default function RevisionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, actions } = useRevisionState();

  const {
    items, currentIndex, phase,
    showTranslit, srsMsg, saving,
    done,
  } = state;

  // ── Done — naviguer vers done.tsx (même logique que la web app → /done) ──
  if (done) {
    router.replace({ pathname: '/(app)/done', params: { result: 'validated' } });
    return null;
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyIcon}>🎉</Text>
        <Text style={styles.emptyTitle}>Aucune révision aujourd'hui</Text>
        <Text style={styles.emptySubtitle}>Tu as tout révisé. Reviens demain.</Text>
        <Pressable onPress={() => router.replace('/(app)/(tabs)/today')} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>Continuer →</Text>
        </Pressable>
      </View>
    );
  }

  const item = items[currentIndex];

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => { if (!saving) router.replace('/(app)/(tabs)/today'); }}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Révision</Text>
          <Text style={styles.headerSub}>{currentIndex + 1} / {items.length}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      {/* Card */}
      <View style={styles.cardWrap}>
        <RevisionCard
          item={item}
          phase={phase}
          showTranslit={showTranslit}
          srsMsg={srsMsg}
          saving={saving}
          isFirst={currentIndex === 0}
          onReveal={actions.reveal}
          onToggleTranslit={actions.toggleTranslit}
          onAnswer={actions.answer}
        />
      </View>

      {/* Progress */}
      <RevisionProgress
        current={currentIndex + 1}
        total={items.length}
        progress={actions.progress}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: Colors.brand.dark,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#fff',
    lineHeight: 26,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: '#fff',
  },
  headerSub: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.6)',
  },

  // Card
  cardWrap: {
    flex: 1,
    padding: 16,
  },

  // Empty
  center: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.brand.dark,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: Colors.brand.dark,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  emptyBtnText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },
});
