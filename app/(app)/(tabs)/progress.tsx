import { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTodayData } from '@/hooks/useTodayData';

const TOTAL_QURAN = 6236;
const DAY_LABELS  = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function StatCol({ value, label }: { value: number; label: string }) {
  return (
    <View style={s.statCol}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const { state } = useTodayData();
  const insets = useSafeAreaInsets();

  const now      = new Date();
  const curYear  = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curDay   = now.getDate();

  const { daysInMonth, offset } = useMemo(() => {
    const firstDay = new Date(curYear, curMonth - 1, 1).getDay();
    const offset   = (firstDay + 6) % 7; // lundi = 0
    const days     = new Date(curYear, curMonth, 0).getDate();
    return { daysInMonth: days, offset };
  }, [curYear, curMonth]);

  if (state.status === 'loading') {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#163026" />
      </View>
    );
  }

  if (state.status === 'error' || state.status === 'no_plan') {
    return (
      <View style={s.center}>
        <Text style={s.emptyText}>
          {state.status === 'error' ? state.message : 'Aucun programme trouvé.'}
        </Text>
      </View>
    );
  }

  const { streak, totalMemorized, sessionDates } = state.data;
  const progressPct     = Math.min((totalMemorized / TOTAL_QURAN) * 100, 100);
  const sessionDatesSet = new Set(sessionDates);

  const padZero = (n: number) => String(n).padStart(2, '0');
  const thisMonthSessions = sessionDates.filter(d => d.startsWith(`${curYear}-${padZero(curMonth)}`)).length;

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>

        {/* ── HEADER ── */}
        <LinearGradient
          colors={['#163026', '#1e4535', '#2d5a42']}
          start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }}
          style={s.header}
        >
          <Text style={s.bgCalligraphy}>الله</Text>
          <Text style={s.headerTitle}>Ta progression</Text>
        </LinearGradient>

        {/* ── STATS CARD ── */}
        <View style={s.statsCard}>
          <StatCol value={totalMemorized} label="Ayat mémorisés" />
          <View style={s.statDivider} />
          <StatCol value={streak} label="Jours de suite" />
          <View style={s.statDivider} />
          <StatCol value={thisMonthSessions} label="Actif ce mois" />
        </View>

        {/* ── CORAN COMPLET ── */}
        <View style={s.card}>
          <Text style={s.eyebrow}>VERS LE CORAN COMPLET</Text>
          <View style={s.progressHeader}>
            <Text style={s.progressCount}>{totalMemorized} / {TOTAL_QURAN} ayat</Text>
            <Text style={s.progressPct}>{progressPct.toFixed(1)}%</Text>
          </View>
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: `${progressPct.toFixed(2)}%` as unknown as number }]} />
          </View>
        </View>

        {/* ── CALENDRIER ── */}
        <View style={s.card}>
          <Text style={s.eyebrow}>CE MOIS</Text>

          {/* Labels jours */}
          <View style={s.calGrid}>
            {DAY_LABELS.map((d, i) => (
              <Text key={i} style={s.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Cellules */}
          <View style={s.calGrid}>
            {Array.from({ length: offset }).map((_, i) => (
              <View key={`e-${i}`} style={s.dayCell} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day        = i + 1;
              const dateStr    = `${curYear}-${padZero(curMonth)}-${padZero(day)}`;
              const isToday    = day === curDay;
              const hasSession = sessionDatesSet.has(dateStr);

              return (
                <View
                  key={day}
                  style={[
                    s.dayCell,
                    hasSession && s.dayCellActive,
                    isToday && !hasSession && s.dayCellToday,
                  ]}
                >
                  <Text style={[
                    s.dayNum,
                    hasSession && s.dayNumActive,
                    isToday && !hasSession && s.dayNumToday,
                  ]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: '#0f2318',
  shadowOpacity: 0.10,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F5F0E6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#F5F0E6' },
  emptyText: { fontSize: 15, color: '#6B6357', textAlign: 'center' },

  // Header
  header:        { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 56, overflow: 'hidden' },
  bgCalligraphy: { position: 'absolute', right: -10, bottom: -10, fontSize: 160, color: 'rgba(255,255,255,0.05)', lineHeight: 180 },
  headerTitle:   { fontSize: 28, fontWeight: '600', color: '#fff' },

  // Stats card
  statsCard:    { marginHorizontal: 16, marginTop: -24, backgroundColor: '#fff', borderRadius: 20, padding: 28, flexDirection: 'row', alignItems: 'center', ...CARD_SHADOW },
  statCol:      { flex: 1, alignItems: 'center' },
  statValue:    { fontSize: 36, fontWeight: '700', color: '#163026', lineHeight: 40 },
  statLabel:    { fontSize: 10, fontWeight: '500', color: '#B8962E', textTransform: 'uppercase', letterSpacing: 2, marginTop: 8, textAlign: 'center' },
  statDivider:  { width: 1, height: 48, backgroundColor: '#E2D9CC' },

  // Cards
  card:       { marginHorizontal: 16, marginTop: 24, backgroundColor: '#fff', borderRadius: 20, padding: 24, ...CARD_SHADOW },
  eyebrow:    { fontSize: 10, fontWeight: '500', color: '#B8962E', textTransform: 'uppercase', letterSpacing: 2 },

  // Progress bar
  progressHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 10 },
  progressCount:   { fontSize: 13, color: '#6B6357' },
  progressPct:     { fontSize: 13, fontWeight: '600', color: '#163026' },
  progressBarBg:   { height: 8, backgroundColor: '#E2D9CC', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#163026', borderRadius: 4 },

  // Calendar
  calGrid:     { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16 },
  dayLabel:    { width: '14.28%', textAlign: 'center', fontSize: 10, color: '#6B6357', paddingVertical: 4 },
  dayCell:     { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  dayCellActive: {},
  dayCellToday:  {},
  dayNum:         { fontSize: 10, color: '#6B6357', width: 28, height: 28, borderRadius: 14, textAlign: 'center', lineHeight: 28, backgroundColor: '#E2D9CC', overflow: 'hidden' },
  dayNumActive:   { backgroundColor: '#163026', color: '#fff', fontWeight: '600' },
  dayNumToday:    { backgroundColor: 'transparent', color: '#163026', borderWidth: 2, borderColor: '#B8962E' },
});
