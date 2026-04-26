import { useState } from 'react';
import {
  View, Text, Pressable, ActivityIndicator, ScrollView,
  StyleSheet, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTodayData } from '@/hooks/useTodayData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const TOTAL_QURAN = 6236;

function getMotivation(streak: number): string {
  if (streak >= 30) return "Un mois. Tu es hafiz en devenir. Allah facilite ton chemin.";
  if (streak >= 14) return "Deux semaines. Le Coran s'installe dans ton cœur.";
  if (streak >= 7)  return "Une semaine complète. Tu deviens quelqu'un de différent.";
  if (streak >= 3)  return "Tu construis quelque chose de solide. Continue.";
  if (streak >= 2)  return "Deux jours de suite. L'habitude commence à se former.";
  return "Bienvenue. Chaque grand hafiz a commencé exactement là où tu en es.";
}

export default function TodayScreen() {
  const { state, reload } = useTodayData();
  const { session } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [recoveryDismissed, setRecoveryDismissed] = useState(false);
  const [feedbackOpen, setFeedbackOpen]       = useState(false);
  const [feedbackText, setFeedbackText]       = useState('');
  const [feedbackSaving, setFeedbackSaving]   = useState(false);
  const [feedbackDone, setFeedbackDone]       = useState(false);

  const prenom = (session?.user?.user_metadata?.prenom as string | undefined) ?? '';

  async function submitFeedback() {
    if (!feedbackText.trim() || feedbackSaving) return;
    setFeedbackSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('feedbacks').insert({ user_id: user?.id, message: feedbackText.trim() });
    setFeedbackSaving(false);
    setFeedbackDone(true);
    setTimeout(() => { setFeedbackText(''); setFeedbackDone(false); setFeedbackOpen(false); }, 2000);
  }

  if (state.status === 'loading') {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#163026" />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{state.message}</Text>
        <Pressable style={s.solidBtn} onPress={reload}>
          <Text style={s.solidBtnText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  if (state.status === 'no_plan') {
    return (
      <View style={s.center}>
        <Text style={s.noPlanTitle}>Aucun programme trouvé.</Text>
        <Pressable style={s.solidBtn} onPress={() => router.replace('/(app)/onboarding')}>
          <Text style={s.solidBtnText}>Créer mon programme →</Text>
        </Pressable>
      </View>
    );
  }

  const {
    date, streak, memorizationCard, revisions, sessionDone,
    recoveryMode, daysSinceLastSession,
    totalMemorized, isPremium, isSessionBlocked, estMonths,
  } = state.data;

  const dateStr    = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const progressPct = Math.min((totalMemorized / TOTAL_QURAN) * 100, 100);
  const showRecovery = recoveryMode && !recoveryDismissed;

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.root, { paddingTop: insets.top }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>

          {/* ── HEADER gradient ── */}
          <LinearGradient
            colors={['#0d1f17', '#163026', '#1e4535']}
            start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
            style={s.header}
          >
            <Text style={s.bgCalligraphy}>الله</Text>

            {/* Top row: name + streak */}
            <View style={s.headerTop}>
              <View style={{ flex: 1 }}>
                <Text style={s.headerGreeting}>Assalamu Alaykoum{prenom ? ',' : ''}</Text>
                <Text style={s.headerName} numberOfLines={1}>{prenom || 'Frère'}</Text>
                <Text style={s.headerDate}>{dateStr}</Text>
              </View>
              <View style={s.streakBlock}>
                <View style={s.streakRow}>
                  <Text style={s.streakFire}>🔥</Text>
                  <Text style={s.streakNum}>{streak}</Text>
                </View>
                <Text style={s.streakLabel}>jours</Text>
                {streak > 0 && <Text style={s.streakSub}>Continue comme ça</Text>}
              </View>
            </View>

            {/* Bottom row: premium badge */}
            <View style={s.headerBottom}>
              {isPremium ? (
                <View style={s.premiumBadge}>
                  <Text style={s.premiumBadgeText}>👑 Premium</Text>
                </View>
              ) : (
                <Pressable onPress={() => router.push('/(app)/paywall')} style={s.premiumBtn}>
                  <Text style={s.premiumBtnText}>✨ Passer à Premium</Text>
                </Pressable>
              )}
            </View>
          </LinearGradient>

          {/* ── RECOVERY CARD ── */}
          {showRecovery && (
            <View style={s.recoveryCard}>
              <Text style={s.recoveryEmoji}>⚠️</Text>
              <Text style={s.recoveryTitle}>Bienvenue de retour.</Text>
              <Text style={s.recoverySub}>
                Tu étais absent{daysSinceLastSession > 1 ? `(e) depuis ${daysSinceLastSession} jours` : ''}. Révise d'abord ce que tu as appris.
              </Text>
              <Pressable style={s.recoveryRevBtn} onPress={() => router.push('/(app)/session')}>
                <Text style={s.recoveryRevBtnText}>Réviser mes ayats →</Text>
              </Pressable>
              <Pressable onPress={() => setRecoveryDismissed(true)}>
                <Text style={s.recoveryContinueText}>Continuer quand même</Text>
              </Pressable>
            </View>
          )}

          {/* ── SESSION CARD ── */}
          <View style={[s.sessionCard, showRecovery ? { marginTop: 16 } : { marginTop: -24 }]}>
            <Text style={s.eyebrow}>AUJOURD'HUI</Text>

            {/* Mémorisation */}
            <View style={{ marginTop: 16 }}>
              <Text style={s.subLabel}>Nouvelle mémorisation</Text>
              <Text style={s.surahName}>{memorizationCard.surahName}</Text>
              <Text style={s.surahSub}>
                {memorizationCard.ayatRange[0] > 0
                  ? `Ayat ${memorizationCard.ayatRange[0]} à ${memorizationCard.ayatRange[1]}`
                  : 'Sourate complète'}
              </Text>
              <View style={s.chip}>
                <Text style={s.chipText}>
                  {memorizationCard.ayatRange[1] - memorizationCard.ayatRange[0] + 1} ayat · {memorizationCard.estimatedMinutes} min
                </Text>
              </View>
            </View>

            {/* Séparateur */}
            <View style={s.dashedSep} />

            {/* Révisions */}
            <Text style={s.subLabel}>Révision</Text>
            {revisions.length > 0 ? (
              <View style={{ marginTop: 10, gap: 6 }}>
                {revisions.slice(0, 5).map((r) => (
                  <Text key={r.id} style={s.revItem}>
                    {r.surahName} — ayat {r.ayatRange[0]}{r.ayatRange[0] !== r.ayatRange[1] ? `–${r.ayatRange[1]}` : ''}
                  </Text>
                ))}
                {revisions.length > 5 && (
                  <Text style={s.revMore}>et {revisions.length - 5} autre{revisions.length - 5 > 1 ? 's' : ''} à réviser</Text>
                )}
              </View>
            ) : (
              <View style={s.noRevChip}>
                <Text style={s.noRevText}>Aucune révision aujourd'hui 🎉</Text>
              </View>
            )}

            {/* CTA zone */}
            {sessionDone ? (
              <>
                <View style={s.doneBanner}>
                  <Text style={s.doneBannerText}>Session du jour complétée ✓</Text>
                </View>
                {revisions.length > 0 && (
                  <Pressable style={s.goldBtn} onPress={() => router.push('/(app)/session')}>
                    <Text style={s.goldBtnText}>Commencer la révision →</Text>
                  </Pressable>
                )}
              </>
            ) : isSessionBlocked ? (
              <View style={s.blockedWrap}>
                <Text style={s.sessionHint} numberOfLines={1}>Ta session t'attend aujourd'hui.</Text>
                <View style={[s.gradientBtn, { opacity: 0.35 }]}>
                  <Text style={s.gradientBtnText}>Commencer la session →</Text>
                </View>
                <View style={s.paywallOverlay}>
                  <Text style={s.paywallIcon}>🔒</Text>
                  <Text style={s.paywallTitle}>Limite gratuite atteinte</Text>
                  <Text style={s.paywallSub}>Tu as utilisé tes 5 sessions gratuites.{'\n'}Passe à Premium pour continuer.</Text>
                  <Pressable style={s.solidBtn} onPress={() => router.push('/(app)/paywall')}>
                    <Text style={s.solidBtnText}>Continuer avec Premium →</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <>
                <Text style={s.sessionHint}>Ta session t'attend aujourd'hui.</Text>
                <Pressable
                  style={({ pressed }) => [s.gradientBtnWrap, pressed && { opacity: 0.88 }]}
                  onPress={() => router.push('/(app)/session')}
                >
                  <LinearGradient colors={['#163026', '#2d5a42']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.gradientBtn}>
                    <Text style={s.gradientBtnText}>Commencer la session →</Text>
                  </LinearGradient>
                </Pressable>
              </>
            )}
          </View>

          {/* ── TON OBJECTIF ── */}
          <View style={s.objectifCard}>
            <Text style={s.eyebrow}>TON OBJECTIF</Text>
            <View style={s.progressBarBg}>
              <View style={[s.progressBarFill, { width: `${progressPct.toFixed(2)}%` as unknown as number }]} />
            </View>
            <Text style={s.objectifCount}>{totalMemorized} / {TOTAL_QURAN} ayat</Text>
            <Text style={s.objectifEst}>
              {estMonths === null
                ? 'Calcul en cours...'
                : estMonths === 0
                  ? 'Tu as mémorisé tout le Coran. MashaAllah !'
                  : `Il te reste environ ${estMonths} mois pour atteindre ton objectif.`}
            </Text>
          </View>

          {/* ── MOTIVATION (bordure gauche or) ── */}
          <View style={s.motivCard}>
            <Text style={s.motivText}>{getMotivation(streak)}</Text>
          </View>

          {/* ── FEEDBACK ── */}
          <Pressable
            style={s.feedbackCard}
            onPress={() => { if (!feedbackDone) setFeedbackOpen((o: boolean) => !o); }}
          >
            <View style={s.feedbackRow}>
              <Text style={s.feedbackPrompt}>✏️ Une idée pour améliorer Zainly ?</Text>
              {!feedbackDone ? (
                <Text style={s.feedbackAction}>Partager mon avis →</Text>
              ) : (
                <Text style={s.feedbackThanks}>Merci 🙏</Text>
              )}
            </View>
            {feedbackOpen && !feedbackDone && (
              <View>
                <TextInput
                  value={feedbackText}
                  onChangeText={setFeedbackText}
                  placeholder="Dis-nous ce qu'on peut améliorer..."
                  placeholderTextColor="#A09890"
                  multiline
                  numberOfLines={4}
                  style={s.feedbackInput}
                />
                <Pressable
                  style={[s.solidBtn, feedbackSaving && { opacity: 0.7 }]}
                  onPress={submitFeedback}
                  disabled={feedbackSaving}
                >
                  <Text style={s.solidBtnText}>{feedbackSaving ? 'Envoi...' : 'Envoyer'}</Text>
                </Pressable>
              </View>
            )}
          </Pressable>

        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const CARD_SHADOW = {
  shadowColor: '#0f2318',
  shadowOpacity: 0.15,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 12 },
  elevation: 8,
};

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F5F0E6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, backgroundColor: '#F5F0E6' },

  // ── HEADER
  header:         { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 64, overflow: 'hidden' },
  bgCalligraphy:  { position: 'absolute', right: -10, bottom: -10, fontSize: 160, color: 'rgba(255,255,255,0.05)', lineHeight: 180 },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerGreeting: { fontSize: 13, color: '#B8962E', fontWeight: '500' },
  headerName:     { fontSize: 26, fontWeight: '600', color: '#fff', marginTop: 2, marginRight: 8 },
  headerDate:     { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  streakBlock:    { alignItems: 'flex-end' },
  streakRow:      { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  streakFire:     { fontSize: 20 },
  streakNum:      { fontSize: 32, fontWeight: '700', color: '#fff', lineHeight: 36 },
  streakLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  streakSub:      { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 },
  headerBottom:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  premiumBadge:   { backgroundColor: '#C9A227', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  premiumBadgeText:{ fontSize: 13, fontWeight: '600', color: '#fff' },
  premiumBtn:     { borderWidth: 1, borderColor: '#C9A227', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  premiumBtnText: { fontSize: 13, fontWeight: '600', color: '#C9A227' },

  // ── RECOVERY
  recoveryCard:       { marginHorizontal: 16, marginTop: 16, backgroundColor: 'rgba(184,150,46,0.08)', borderWidth: 1.5, borderColor: '#B8962E', borderRadius: 20, padding: 24, alignItems: 'center', gap: 10 },
  recoveryEmoji:      { fontSize: 32 },
  recoveryTitle:      { fontSize: 18, fontWeight: '600', color: '#163026', textAlign: 'center' },
  recoverySub:        { fontSize: 14, color: '#6B6357', textAlign: 'center', lineHeight: 22 },
  recoveryRevBtn:     { width: '100%', backgroundColor: '#B8962E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  recoveryRevBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  recoveryContinueText:{ fontSize: 14, color: '#6B6357' },

  // ── SESSION CARD
  sessionCard: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 24, padding: 28, ...CARD_SHADOW },
  eyebrow:     { fontSize: 10, fontWeight: '600', letterSpacing: 2, color: '#B8962E', textTransform: 'uppercase' },
  subLabel:    { fontSize: 10, fontWeight: '500', color: '#B8962E', textTransform: 'uppercase', letterSpacing: 1.5 },
  surahName:   { fontSize: 20, fontWeight: '600', color: '#163026', marginTop: 6, marginBottom: 2 },
  surahSub:    { fontSize: 14, color: '#6B6357', marginBottom: 10 },
  chip:        { alignSelf: 'flex-start', backgroundColor: 'rgba(22,48,38,0.08)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  chipText:    { fontSize: 12, color: '#163026' },
  dashedSep:   { borderTopWidth: 1.5, borderColor: '#E2D9CC', borderStyle: 'dashed', marginVertical: 20 },
  revItem:     { fontSize: 14, color: '#163026', lineHeight: 22 },
  revMore:     { fontSize: 13, color: '#6B6357', marginTop: 2 },
  noRevChip:   { marginTop: 10, alignSelf: 'flex-start', backgroundColor: 'rgba(184,150,46,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  noRevText:   { fontSize: 13, color: '#B8962E' },

  doneBanner:     { marginTop: 24, padding: 16, backgroundColor: 'rgba(22,48,38,0.06)', borderRadius: 12, alignItems: 'center' },
  doneBannerText: { fontSize: 15, color: '#163026', fontWeight: '500' },

  sessionHint:     { fontSize: 12, fontStyle: 'italic', color: '#A09890', textAlign: 'center', marginTop: 16 },
  gradientBtnWrap: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  gradientBtn:     { padding: 16, alignItems: 'center', borderRadius: 12 },
  gradientBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  goldBtn:     { marginTop: 12, backgroundColor: '#B8962E', paddingVertical: 14, borderRadius: 12, alignItems: 'center', shadowColor: '#B8962E', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  goldBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  // Paywall overlay
  blockedWrap:    { marginTop: 16, position: 'relative' },
  paywallOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(245,240,230,0.92)', borderRadius: 16, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 8 },
  paywallIcon:    { fontSize: 28 },
  paywallTitle:   { fontSize: 16, fontWeight: '700', color: '#163026', textAlign: 'center' },
  paywallSub:     { fontSize: 13, color: '#6B6357', textAlign: 'center', lineHeight: 20 },

  // ── OBJECTIF
  objectifCard:  { marginHorizontal: 16, marginTop: 24, backgroundColor: '#fff', borderRadius: 20, padding: 24, ...CARD_SHADOW },
  progressBarBg: { height: 6, backgroundColor: '#E2D9CC', borderRadius: 3, overflow: 'hidden', marginTop: 16 },
  progressBarFill:{ height: '100%', backgroundColor: '#163026', borderRadius: 3 },
  objectifCount: { fontSize: 13, color: '#6B6357', marginTop: 10 },
  objectifEst:   { fontSize: 14, fontStyle: 'italic', color: '#6B6357', marginTop: 8, lineHeight: 22 },

  // ── MOTIVATION
  motivCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: 'rgba(22,48,38,0.04)', borderRadius: 16, borderLeftWidth: 3, borderLeftColor: '#B8962E', paddingVertical: 20, paddingHorizontal: 24 },
  motivText:  { fontSize: 15, fontStyle: 'italic', color: '#163026', lineHeight: 26 },

  // ── FEEDBACK
  feedbackCard:   { marginHorizontal: 16, marginTop: 16, backgroundColor: '#EDE5D0', borderRadius: 16, padding: 20 },
  feedbackRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  feedbackPrompt: { fontSize: 14, color: '#6B6357' },
  feedbackAction: { fontSize: 14, fontWeight: '500', color: '#B8962E' },
  feedbackThanks: { fontSize: 14, color: '#163026' },
  feedbackInput:  { marginTop: 16, borderWidth: 1.5, borderColor: '#E2D9CC', borderRadius: 10, padding: 12, backgroundColor: '#fff', color: '#163026', fontSize: 16, minHeight: 100, textAlignVertical: 'top' },

  // ── SHARED
  solidBtn:     { backgroundColor: '#163026', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  solidBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  noPlanTitle:  { fontSize: 20, fontWeight: '700', color: '#163026', textAlign: 'center' },
  errorText:    { fontSize: 15, color: '#C0392B', textAlign: 'center' },
});
