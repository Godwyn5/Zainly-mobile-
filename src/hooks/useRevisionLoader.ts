import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RevisionItem } from '@/data/revisionMock';

// ─── Quran JSON types ────────────────────────────────────────────────────────

type QuranVerse = { id: number; text: string; transliteration?: string };
type QuranSurah = { id: number; transliteration: string; name: string; verses: QuranVerse[] };
type QuranFrVerse = { id: number; translation: string };
type QuranFrSurah = { verses: QuranFrVerse[] };

// ─── Module-level cache (shared with useSessionLoader) ───────────────────────

let cachedQuran:   QuranSurah[]   | null = null;
let cachedQuranFr: QuranFrSurah[] | null = null;

// ─── Helpers — identiques web app ────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localMidnightISO(): string {
  const today = todayStr();
  const midnightLocal = new Date(); midnightLocal.setHours(0, 0, 0, 0);
  const offMin  = -midnightLocal.getTimezoneOffset();
  const offSign = offMin >= 0 ? '+' : '-';
  const offHH   = String(Math.floor(Math.abs(offMin) / 60)).padStart(2, '0');
  const offMM   = String(Math.abs(offMin) % 60).padStart(2, '0');
  return `${today}T00:00:00${offSign}${offHH}:${offMM}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type RevisionLoadStatus = 'loading' | 'ready' | 'empty' | 'error';

export type RevisionLoadResult =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; userId: string; items: RevisionItem[] };

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRevisionLoader() {
  const [result, setResult] = useState<RevisionLoadResult>({ status: 'loading' });
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

        const today          = todayStr();
        const startTodayStr  = localMidnightISO();

        // 2. Fetch review_items — requête EXACTE de la web app :
        //    mastered = false
        //    next_review <= today
        //    created_at < local midnight (exclude items created today — just memorized)
        const { data: reviewData, error: reviewErr } = await supabase
          .from('review_items')
          .select('*')
          .eq('user_id', authUser.id)
          .eq('mastered', false)
          .lte('next_review', today)
          .lt('created_at', startTodayStr);

        if (reviewErr) {
          setResult({ status: 'error', message: 'Erreur lors du chargement des révisions.' });
          return;
        }

        if (!reviewData || reviewData.length === 0) {
          setResult({ status: 'empty' });
          return;
        }

        // 3. Load quran JSON (module-level cache — shared avec useSessionLoader)
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

        // 4. Enrich — identique web app
        const enriched: RevisionItem[] = reviewData.map(item => {
          const surahIdx  = (item.surah_number ?? 1) - 1;
          const surah     = quran[surahIdx];
          const surahFr   = quranFr[surahIdx];
          const ayatId    = item.ayah as number;
          const verse     = surah?.verses?.find(v => v.id === ayatId);
          const verseFr   = surahFr?.verses?.find(v => v.id === ayatId);
          const globalAyatOffset = quran.slice(0, surahIdx).reduce((acc, s) => acc + (s.verses?.length ?? 0), 0);
          return {
            id:               item.id as string,
            surah_number:     item.surah_number as number,
            ayah:             ayatId,
            review_cycle:     item.review_cycle as number,
            ease_factor:      (item.ease_factor as number) ?? 2.0,
            mastered:         item.mastered as boolean,
            final_test_status: item.final_test_status as RevisionItem['final_test_status'],
            arabicText:       verse?.text ?? '',
            transliteration:  verse?.transliteration ?? '',
            translation:      verseFr?.translation ?? '',
            surahLabel:       surah?.transliteration ?? surah?.name ?? `Sourate ${item.surah_number}`,
            globalNum:        globalAyatOffset + ayatId,
          };
        });

        setResult({ status: 'ready', userId: authUser.id, items: enriched });
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
