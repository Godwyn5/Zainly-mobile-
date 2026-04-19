import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { useRevisionLoader } from '@/hooks/useRevisionLoader';
import { useRevisionState } from '@/hooks/useRevisionState';
import type { RevisionItem } from '@/data/revisionMock';
import { RevisionCard } from '@/components/revision/RevisionCard';
import { RevisionProgress } from '@/components/revision/RevisionProgress';

export default function RevisionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { result, reload } = useRevisionLoader();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (result.status === 'loading') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.brand.dark} size="large" />
        <Text style={styles.loadingText}>Chargement des révisions...</Text>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (result.status === 'error') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.emptyTitle}>Erreur</Text>
        <Text style={styles.emptySubtitle}>{result.message}</Text>
        <Pressable onPress={reload} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (result.status === 'empty') {
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

  // ── Ready — only mounts when data is available ─────────────────────────────
  return <RevisionInner initialItems={result.items} userId={result.userId} />;
}

// ── Inner component — mounts only when loader is ready ───────────────────────

function RevisionInner({ initialItems, userId }: { initialItems: RevisionItem[]; userId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, actions } = useRevisionState(initialItems, userId);

  const {
    items, currentIndex, phase,
    showTranslit, srsMsg, saving,
    done, error,
  } = state;

  // ── SRS save error — inline non-blocking display
  // (saving guard already prevents double-tap)

  // ── Done — naviguer vers done.tsx (même logique que la web app → /done) ──
  if (done) {
    router.replace({ pathname: '/(app)/done', params: { result: 'validated' } });
    return null;
  }

  // ── Empty (should not happen since loader guards this, but keep as safety) ──
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

      {/* SRS error banner — non-blocking */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

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
  loadingText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  errorBanner: {
    backgroundColor: '#fdecea',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  errorBannerText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: '#c0392b',
    textAlign: 'center',
  },
});
