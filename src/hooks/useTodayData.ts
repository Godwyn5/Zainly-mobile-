import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SURAH_AYAT, QURAN_ORDER } from '@/data/onboardingData';
import type { MemorizationCard, RevisionItem } from '@/data/todayMock';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getSurahName(surahNumber: number): string {
  return QURAN_ORDER[(surahNumber ?? 1) - 1] ?? `Sourate ${surahNumber}`;
}

function getSurahAyatCount(surahNumber: number): number {
  return SURAH_AYAT[(surahNumber ?? 1) - 1] ?? 7;
}

// Fidèle à la web app: 2 min/ayat (web app n'a pas de données exactes — approximation)
const MINUTES_PER_AYAT = 2;

// review_cycle → strength label (mapping depuis final_test_status)
function toStrength(status: string): RevisionItem['strength'] {
  if (status === 'validated') return 'strong';
  if (status === 'reinforce') return 'weak';
  return 'medium';
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type TodayLoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'no_plan' }
  | { status: 'ready'; data: TodayScreenData };

export type TodayScreenData = {
  date: Date;
  streak: number;
  revisionCount: number;
  sessionDone: boolean;
  memorizationCard: MemorizationCard;
  revisions: RevisionItem[];
  recoveryMode: boolean;
  daysSinceLastSession: number;
  totalMemorized: number;
  sessionDates: string[];
  ayahPerDay: number;
  isPremium: boolean;
  isSessionBlocked: boolean;
  estMonths: number | null;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTodayData() {
  const [state, setState] = useState<TodayLoadState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      // 1. Auth check
      const { data: { user: authUser }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !authUser) {
        setState({ status: 'error', message: 'Non connecté. Reconnecte-toi.' });
        return;
      }

      const today = todayStr();

      // 2. Fetch en parallèle — identique à la web app
      const [
        { data: planRows,     error: planErr  },
        { data: progressRows, error: progErr  },
        { data: reviewData,   error: revErr   },
        { data: profileData },
      ] = await Promise.all([
        supabase.from('plans').select('ayah_per_day, minutes_per_session, days_per_week').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('progress').select('current_surah, current_ayah, streak, total_memorized, last_session_date, session_dates').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('review_items').select('id, surah_number, ayah, final_test_status, next_review').eq('user_id', authUser.id).eq('mastered', false).lte('next_review', today),
        supabase.from('profiles').select('is_premium').eq('id', authUser.id).maybeSingle(),
      ]);

      if (planErr || progErr || revErr) {
        const msg = (planErr ?? progErr ?? revErr)?.message ?? 'Erreur de chargement.';
        setState({ status: 'error', message: msg });
        return;
      }

      const plan     = planRows?.[0] ?? null;
      const progress = progressRows?.[0] ?? null;

      if (!plan || !progress) {
        setState({ status: 'no_plan' });
        return;
      }

      // 3. Calculs mémorisation — fidèle à la web app
      const currentSurah   = (progress.current_surah as number) ?? 1;
      const currentAyah    = (progress.current_ayah as number) ?? 0;
      const ayahPerDay     = (plan.ayah_per_day as number) ?? 2;
      const surahTotalAyat = getSurahAyatCount(currentSurah);
      const memStart       = currentAyah + 1;
      const memEnd         = Math.min(currentAyah + ayahPerDay, surahTotalAyat);
      const ayatCount      = Math.max(0, memEnd - memStart + 1);

      // 4. Métriques streak / session
      const streak         = (progress.streak as number) ?? 0;
      const sessionDone    = (progress.last_session_date as string) === today;
      const totalMemorized = (progress.total_memorized as number) ?? 0;
      const sessionDates   = Array.isArray(progress.session_dates) ? (progress.session_dates as string[]) : [];
      const isPremium      = profileData?.is_premium === true;
      const sessionsCount  = sessionDates.length;
      const isSessionBlocked = !isPremium && sessionsCount >= 5;

      // Estimation mois restants — identique web app
      const daysPerWeek = (plan.days_per_week as number) ?? 6;
      const ayatLeft    = Math.max(0, 6236 - totalMemorized);
      const estMonths: number | null = ayatLeft === 0 ? 0
        : (ayahPerDay > 0 && daysPerWeek > 0)
          ? Math.max(1, Math.ceil(Math.ceil(ayatLeft / ayahPerDay) / daysPerWeek / 4.33))
          : null;

      // Recovery mode — identique web app dashboard.js lines 251-257
      // Condition : inactif >= 5 jours depuis la dernière session
      let recoveryMode         = false;
      let daysSinceLastSession = 0;
      const lastSession = progress.last_session_date as string | null;
      if (lastSession) {
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const lastDate = new Date(lastSession + 'T00:00:00');
        daysSinceLastSession = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastSession >= 5) recoveryMode = true;
      }

      // 5. Révisions du jour — groupées par sourate pour l'affichage
      const reviews = reviewData ?? [];
      const revisionCount = reviews.length;

      // Grouper par sourate (identique à l'affichage web app)
      const grouped: Record<number, { min: number; max: number; status: string; count: number }> = {};
      for (const r of reviews) {
        const sn = r.surah_number as number;
        const ay = r.ayah as number;
        if (!grouped[sn]) {
          grouped[sn] = { min: ay, max: ay, status: r.final_test_status as string, count: 1 };
        } else {
          grouped[sn].min = Math.min(grouped[sn].min, ay);
          grouped[sn].max = Math.max(grouped[sn].max, ay);
          grouped[sn].count++;
          // Statut dominant: reinforce > medium > validated
          if (r.final_test_status === 'reinforce') grouped[sn].status = 'reinforce';
        }
      }

      const revisions: RevisionItem[] = Object.entries(grouped).map(([snStr, g]) => {
        const sn = Number(snStr);
        return {
          id: `rev-${sn}`,
          surahNumber: sn,
          surahName: getSurahName(sn),
          ayatRange: [g.min, g.max],
          lastReviewedDaysAgo: 0, // non disponible sans updated_at dans la sélection
          strength: toStrength(g.status),
        };
      });

      // 6. MemorizationCard
      const memorizationCard: MemorizationCard = {
        surahNumber: currentSurah,
        surahName: getSurahName(currentSurah),
        surahNameAr: '', // non stocké en DB — cosmétique, vide acceptable
        ayatRange: [memStart, memEnd],
        estimatedMinutes: Math.max(1, ayatCount * MINUTES_PER_AYAT),
      };

      setState({
        status: 'ready',
        data: {
          date: new Date(),
          streak,
          revisionCount,
          sessionDone,
          memorizationCard,
          revisions,
          recoveryMode,
          daysSinceLastSession,
          totalMemorized,
          sessionDates,
          ayahPerDay,
          isPremium,
          isSessionBlocked,
          estMonths,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inattendue.';
      setState({ status: 'error', message: msg });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { state, reload: load };
}
