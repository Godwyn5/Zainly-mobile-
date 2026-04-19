import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Animated, { FadeInDown, Easing } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { SurahGroup } from '@/components/hifz/SurahGroup';
import { HifzEmptyState } from '@/components/hifz/HifzEmptyState';
import { useHifzState } from '@/hooks/useHifzState';

export default function HifzScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const {
    groups, totalAyats, totalValidated, totalReinforce,
    expandedSurah, toggleExpanded,
    isEmpty,
  } = useHifzState();

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <AnimatedSection delay={0}>
          <Text style={styles.headerTitle}>Mon Hifz</Text>
        </AnimatedSection>

        {/* Stats summary */}
        {!isEmpty && (
          <AnimatedSection delay={80}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalAyats}</Text>
                <Text style={styles.statLabel}>Ayats</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalValidated}</Text>
                <Text style={styles.statLabel}>Validés</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, totalReinforce > 0 && styles.statValueGold]}>
                  {totalReinforce}
                </Text>
                <Text style={styles.statLabel}>À renforcer</Text>
              </View>
            </View>
          </AnimatedSection>
        )}

      </View>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      {isEmpty ? (
        <HifzEmptyState onStart={() => router.replace('/(app)/(tabs)/today')} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={g => String(g.surahNumber)}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 60).duration(320).easing(Easing.out(Easing.quad))}>
              <SurahGroup
                group={group}
                expanded={expandedSurah === group.surahNumber}
                onToggle={() => toggleExpanded(group.surahNumber)}
              />
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyFilter}>
              <Text style={styles.emptyFilterText}>Aucune sourate dans ce filtre.</Text>
            </View>
          }
        />
      )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
    backgroundColor: Colors.ui.pageBg,
    gap: 16,
  },
  headerTitle: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes['2xl'],
    fontWeight: '600',
    color: Colors.brand.dark,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.ui.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.brand.dark,
    lineHeight: FontSizes.xl * 1.1,
  },
  statValueGold: {
    color: Colors.brand.gold,
  },
  statLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.ui.border,
  },

  // List
  listContent: {
    padding: 16,
  },
  separator: {
    height: 10,
  },

  // Empty filter state
  emptyFilter: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.muted,
  },
});
