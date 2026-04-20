import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Ayat } from '@/types';

// ─── Quran JSON types ────────────────────────────────────────────────────────

type QuranVerse = { id: number; text: string; transliteration?: string };
type QuranSurah = { id: number; transliteration: string; name: string; verses: QuranVerse[] };

type QuranFrVerse = { id: number; translation: string };
type QuranFrSurah = { verses: QuranFrVerse[] };

// ─── Module-level cache (identical pattern to web app) ───────────────────────

let cachedQuran:   QuranSurah[]   | null = null;
let cachedQuranFr: QuranFrSurah[] | null = null;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionLoadStatus =
  | 'loading'
  | 'ready'
  | 'session_done_today'
  | 'quran_complete'
  | 'premium_blocked'
  | 'error';

export type SessionLoadResult =
  | { status: 'loading' }
  | { status: 'session_done_today' }
  | { status: 'quran_complete' }
  | { status: 'premium_blocked'; sessionsCount: number }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      userId: string;
      surahNumber: number;
      surahName: string;
      savedAyah: number;       // current_ayah snapshot at load time (used in finish())
      ayahPerDay: number;
      surahTotalVerses: number;
      progress: Record<string, unknown>;
      ayats: Ayat[];
    };

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSessionLoader() {
  const [result, setResult] = useState<SessionLoadResult>({ status: 'loading' });
  const loadRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    async function load() {
      setResult({ status: 'loading' });
      try {
        // 1. Auth
        const { data: { user: authUser }, error: userErr } = await supabase.auth.getUser();
        if (userErr || !authUser) {
          setResult({ status: 'error', message: 'Non connecté. Reconnecte-toi.' });
          return;
        }

        // 2. Fetch progress + plan + profile in parallel — Supabase is the single source of truth
        const today0 = todayStr();
        const [{ data: progRows }, { data: planRows }, { data: profile }] = await Promise.all([
          supabase.from('progress').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(1),
          supabase.from('plans').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(1),
          supabase.from('profiles').select('is_premium').eq('id', authUser.id).maybeSingle(),
        ]);

        const progRow = progRows?.[0] ?? null;
        const planRow = planRows?.[0] ?? null;

        if (!progRow || !planRow) {
          setResult({ status: 'error', message: 'Plan ou progression introuvable.' });
          return;
        }

        // 3. Premium gate — identique web app (session/page.js:177-190)
        // Count today immediately (deduplicated) — prevents bypass by abandoning mid-session
        const isPremium = profile?.is_premium === true;
        const rawDates = Array.isArray(progRow.session_dates) ? (progRow.session_dates as string[]) : [];
        const sessionDates = rawDates.includes(today0) ? rawDates : [...rawDates, today0];
        const sessionsCount = sessionDates.length;
        if (!isPremium && sessionsCount >= 5) {
          setResult({ status: 'premium_blocked', sessionsCount });
          return;
        }
        // Persist session start immediately so abandoning mid-session still counts
        if (!rawDates.includes(today0)) {
          await supabase.from('progress').update({ session_dates: sessionDates }).eq('user_id', authUser.id);
        }

        // 4. Session already done today guard — identique web app
        if (progRow.last_session_date === today0) {
          setResult({ status: 'session_done_today' });
          return;
        }

        // 5. Load quran JSON — bundled assets (module-level cache)
        if (!cachedQuran || !cachedQuranFr) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const [q, qfr] = await Promise.all([
            Promise.resolve(require('../../assets/data/quran.json') as QuranSurah[]),
            Promise.resolve(require('../../assets/data/quran_fr.json') as QuranFrSurah[]),
          ]);
          if (!cachedQuran)   cachedQuran   = q;
          if (!cachedQuranFr) cachedQuranFr = qfr;
        }
        const quran   = cachedQuran!;
        const quranFr = cachedQuranFr!;

        // 6. Position from progress — Supabase only, no params override
        let currentSurah = (progRow.current_surah as number) ?? 1;
        let currentAyah  = (progRow.current_ayah as number) ?? 0;
        const ayahPerDay = (planRow.ayah_per_day as number) ?? 2;

        // 7. End-of-surah loop — identical to web app
        while (true) {
          if (currentSurah > 114) {
            setResult({ status: 'quran_complete' });
            return;
          }

          const surahIdx = currentSurah - 1;
          const surah    = quran[surahIdx];
          if (!surah) {
            setResult({ status: 'error', message: `Sourate ${currentSurah} introuvable.` });
            return;
          }

          const startAyah = currentAyah + 1;
          if (startAyah > surah.verses.length) {
            // Surah exhausted — advance in Supabase and loop
            const { error: advErr } = await supabase
              .from('progress')
              .update({ current_surah: currentSurah + 1, current_ayah: 0 })
              .eq('user_id', authUser.id);
            if (advErr) {
              setResult({ status: 'error', message: 'Erreur lors de la progression de sourate.' });
              return;
            }
            currentSurah += 1;
            currentAyah   = 0;
            continue;
          }

          // 8. Slice ayats for this session
          const endAyah = Math.min(startAyah + ayahPerDay - 1, surah.verses.length);
          const surahFr = quranFr[surahIdx];
          // globalAyatOffset — sum of verses in all preceding surahs (identique web app globalAyatNumber)
          const globalAyatOffset = quran.slice(0, surahIdx).reduce((acc, s) => acc + (s.verses?.length ?? 0), 0);
          const ayats: Ayat[] = surah.verses
            .filter(v => v.id >= startAyah && v.id <= endAyah)
            .map(v => ({
              id:          v.id,
              text:        v.text,
              translation: surahFr?.verses?.find(fv => fv.id === v.id)?.translation ?? '',
              globalNum:   globalAyatOffset + v.id,
            }));

          setResult({
            status:            'ready',
            userId:            authUser.id,
            surahNumber:       currentSurah,
            surahName:         surah.transliteration ?? surah.name ?? `Sourate ${currentSurah}`,
            savedAyah:         currentAyah,
            ayahPerDay,
            surahTotalVerses:  surah.verses.length,
            progress:          progRow as Record<string, unknown>,
            ayats,
          });
          return;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erreur inattendue.';
        setResult({ status: 'error', message: msg });
      }
    }

    loadRef.current = load;
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { result, reload: () => loadRef.current?.() };
}
