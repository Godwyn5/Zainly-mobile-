import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  FadeInDown, FadeIn, Easing,
  useSharedValue, useAnimatedStyle, withTiming,
  withDelay, interpolate,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { SurahGroup } from '@/components/hifz/SurahGroup';
import { HifzEmptyState } from '@/components/hifz/HifzEmptyState';
import { useHifzLoader } from '@/hooks/useHifzLoader';
import { useHifzState } from '@/hooks/useHifzState';
import type { EnrichedReviewItem } from '@/hooks/useHifzLoader';

const TOTAL_QURAN = 6236;
const GOLD = '#C7A85A';
const EMERALD = '#0D3B2E';
const MID_GREEN = '#145C43';

export default function HifzScreen() {
  const insets  = useSafeAreaInsets();
  const { result, reload } = useHifzLoader();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (result.status === 'loading') {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={EMERALD} size="large" />
        <Text style={s.loadingText}>Chargement de ton Hifz...</Text>
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (result.status === 'error') {
    return (
      <View style={[s.center, { paddingTop: insets.top }]}>
        <Text style={s.errorIcon}>⚠️</Text>
        <Text style={s.errorTitle}>Erreur</Text>
        <Text style={s.errorSub}>{result.message}</Text>
        <Pressable onPress={reload} style={s.errorBtn}>
          <Text style={s.errorBtnText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  // ── Empty handled inside HifzInner ─────────────────────────────────────────
  return <HifzInner items={result.status === 'ready' ? result.items : []} />;
}

// ── Animated stat number with count-up ────────────────────────────────────────

function StatNumber({ value, color }: { value: number; color?: string }) {
  const [display, setDisplay] = React.useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(value / 40));
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setDisplay(start);
      if (start >= value) clearInterval(timer);
    }, 22);
    return () => clearInterval(timer);
  }, [value]);
  return (
    <Text style={[s.statValue, color ? { color } : undefined]}>{display}</Text>
  );
}

// ── Animated progress bar ─────────────────────────────────────────────────────

function GoldProgressBar({ pct }: { pct: number }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withDelay(400, withTiming(pct, { duration: 1200, easing: Easing.out(Easing.cubic) }));
  }, [pct]);
  const barStyle = useAnimatedStyle(() => ({
    width: `${interpolate(width.value, [0, 100], [0, 100])}%`,
  }));
  return (
    <View style={s.progressBg}>
      <Animated.View style={[s.progressFill, barStyle]} />
    </View>
  );
}

// ── Inner component ────────────────────────────────────────────────────────────

function HifzInner({ items }: { items: EnrichedReviewItem[] }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    groups, totalAyats, totalValidated, totalReinforce,
    expandedSurah, toggleExpanded,
  } = useHifzState(items);

  const isEmpty  = items.length === 0;
  const progressPct = Math.min((totalAyats / TOTAL_QURAN) * 100, 100);

  const headerSlide = useSharedValue(20);
  const headerAlpha = useSharedValue(0);
  useEffect(() => {
    headerSlide.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
    headerAlpha.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
  }, []);
  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerAlpha.value,
    transform: [{ translateY: headerSlide.value }],
  }));

  const ListHeader = isEmpty ? null : (
    <>
      {/* ── Floating stats card ── */}
      <Animated.View
        entering={FadeInDown.delay(80).duration(500).springify().damping(18)}
        style={s.statsCard}
      >
        <View style={s.statsInner}>
          <View style={s.statCol}>
            <StatNumber value={totalAyats} />
            <Text style={s.statLabel}>Mémorisés</Text>
          </View>
          <View style={s.statSep} />
          <View style={s.statCol}>
            <StatNumber value={totalValidated} color="#2E7D52" />
            <Text style={s.statLabel}>Validés</Text>
          </View>
          <View style={s.statSep} />
          <View style={s.statCol}>
            <StatNumber value={totalReinforce} color={totalReinforce > 0 ? GOLD : undefined} />
            <Text style={s.statLabel}>À renforcer</Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Progress section ── */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(480)}
        style={s.progressCard}
      >
        <Text style={s.sectionEyebrow}>VERS LE CORAN COMPLET</Text>
        <GoldProgressBar pct={progressPct} />
        <View style={s.progressMeta}>
          <Text style={s.progressCount}>{totalAyats} / {TOTAL_QURAN} ayats</Text>
          <Text style={s.progressPct}>{progressPct.toFixed(1)}%</Text>
        </View>
        <Text style={s.progressQuote}>Chaque ayat te rapproche du but.</Text>
      </Animated.View>

      {/* ── Section label ── */}
      <Animated.View entering={FadeIn.delay(280).duration(400)} style={s.listHeader}>
        <Text style={s.listHeaderText}>TES SOURATES</Text>
        <View style={s.listHeaderLine} />
      </Animated.View>
    </>
  );

  const ListFooter = isEmpty ? null : (
    <Animated.View
      entering={FadeInDown.delay(groups.length * 60 + 120).duration(500)}
      style={s.quoteBlock}
    >
      <View style={s.quoteGoldBar} />
      <Text style={s.quoteArabic}>وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا</Text>
      <Text style={s.quoteTranslation}>
        « Récite le Coran lentement et distinctement. »{'\n'}
        <Text style={s.quoteRef}>— Al-Muzzammil, 73:4</Text>
      </Text>
    </Animated.View>
  );

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>

      {/* ── Hero header ── */}
      <LinearGradient
        colors={[EMERALD, '#0f4a35', MID_GREEN]}
        start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
        style={s.header}
      >
        {/* Glow orb */}
        <View style={s.glowOrb} />
        {/* Calligraphy watermark */}
        <Text style={s.headerCalligraphy}>الحفظ</Text>
        <Animated.View style={headerStyle}>
          <Text style={s.headerEyebrow}>TON VOYAGE CONTINUE</Text>
          <Text style={s.headerTitle}>Mon Hifz</Text>
        </Animated.View>
      </LinearGradient>

      {isEmpty ? (
        <HifzEmptyState onStart={() => router.replace('/(app)/(tabs)/today')} />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={g => String(g.surahNumber)}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: group, index }) => (
            <Animated.View
              entering={FadeInDown.delay(280 + index * 55).duration(380).easing(Easing.out(Easing.quad))}
            >
              <SurahGroup
                group={group}
                expanded={expandedSurah === group.surahNumber}
                onToggle={() => toggleExpanded(group.surahNumber)}
              />
            </Animated.View>
          )}
          ItemSeparatorComponent={() => <View style={s.separator} />}
        />
      )}
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: '#060f0b',
  shadowOpacity: 0.14,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F3EA' },

  // ── Hero header
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 60,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(199,168,90,0.07)',
    top: -60,
    right: -80,
  },
  headerCalligraphy: {
    position: 'absolute',
    right: 8,
    bottom: -8,
    fontFamily: Fonts.amiri,
    fontSize: 120,
    color: 'rgba(255,255,255,0.04)',
    lineHeight: 140,
    userSelect: 'none',
  },
  headerEyebrow: {
    fontFamily: Fonts.dmSans,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 3,
    color: GOLD,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: Fonts.playfair,
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 42,
  },

  // ── Stats glassmorphism card
  statsCard: {
    marginHorizontal: 16,
    marginTop: -32,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: `rgba(199,168,90,0.25)`,
    ...CARD_SHADOW,
  },
  statsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 28,
  },
  statCol: { flex: 1, alignItems: 'center', gap: 6 },
  statValue: {
    fontFamily: Fonts.playfair,
    fontSize: 34,
    fontWeight: '700',
    color: EMERALD,
    lineHeight: 38,
  },
  statLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
    color: GOLD,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  statSep: { width: 1, height: 44, backgroundColor: 'rgba(199,168,90,0.2)' },

  // ── Progress card
  progressCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    ...CARD_SHADOW,
  },
  sectionEyebrow: {
    fontFamily: Fonts.dmSans,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: GOLD,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(199,168,90,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GOLD,
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressCount: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: '#7A7060',
  },
  progressPct: {
    fontFamily: Fonts.dmSansBold,
    fontSize: 12,
    fontWeight: '700',
    color: EMERALD,
  },
  progressQuote: {
    fontFamily: Fonts.playfairItalic,
    fontSize: 13,
    color: '#7A7060',
    marginTop: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // ── List header
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 4,
    gap: 12,
  },
  listHeaderText: {
    fontFamily: Fonts.dmSans,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: GOLD,
    textTransform: 'uppercase',
  },
  listHeaderLine: { flex: 1, height: 1, backgroundColor: 'rgba(199,168,90,0.2)' },

  // ── List
  listContent: { paddingHorizontal: 16, paddingTop: 12 },
  separator:   { height: 10 },

  // ── Quote footer block
  quoteBlock: {
    marginHorizontal: 0,
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...CARD_SHADOW,
  },
  quoteGoldBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: GOLD,
    alignSelf: 'stretch',
    minHeight: 60,
  },
  quoteArabic: {
    flex: 1,
    fontFamily: Fonts.amiri,
    fontSize: 22,
    color: EMERALD,
    textAlign: 'right',
    lineHeight: 36,
    writingDirection: 'rtl',
  },
  quoteTranslation: {
    flex: 1,
    fontFamily: Fonts.playfairItalic,
    fontSize: 13,
    color: '#5A5246',
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 4,
  },
  quoteRef: {
    fontFamily: Fonts.dmSans,
    fontSize: 11,
    color: GOLD,
    fontStyle: 'normal',
  },

  // ── Loading/error states
  center: {
    flex: 1,
    backgroundColor: '#F7F3EA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  errorIcon:     { fontSize: 48, lineHeight: 60 },
  errorTitle:    { fontFamily: Fonts.playfair, fontSize: FontSizes.xl, fontWeight: '600', color: Colors.brand.dark, textAlign: 'center' },
  errorSub:      { fontFamily: Fonts.dmSans, fontSize: FontSizes.base, color: Colors.text.secondary, textAlign: 'center' },
  errorBtn:      { marginTop: 8, backgroundColor: Colors.brand.dark, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14 },
  errorBtnText:  { fontFamily: Fonts.playfair, fontSize: FontSizes.base, fontWeight: '600', color: '#fff' },
});
