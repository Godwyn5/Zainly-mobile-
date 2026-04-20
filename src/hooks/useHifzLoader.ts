import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { ReviewItem } from '@/types';

// ─── Quran JSON types ─────────────────────────────────────────────────────────

type QuranVerse = { id: number; text: string; transliteration?: string };
type QuranSurah = { id: number; transliteration: string; name: string; verses: QuranVerse[] };
type QuranFrVerse = { id: number; translation: string };
type QuranFrSurah = { verses: QuranFrVerse[] };

// ─── Module-level cache (shared with session/revision loaders) ────────────────

let cachedQuran:   QuranSurah[]   | null = null;
let cachedQuranFr: QuranFrSurah[] | null = null;

// ─── Enriched item type ───────────────────────────────────────────────────────

export type EnrichedReviewItem = ReviewItem & {
  arabicText:      string;
  transliteration: string;
  translation:     string;
  globalNum:       number; // 1-based global ayah index — used for audio URL
};

// ─── Load result ──────────────────────────────────────────────────────────────

export type HifzLoadResult =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; message: string }
  | { status: 'ready'; items: EnrichedReviewItem[] };

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHifzLoader() {
  const [result, setResult] = useState<HifzLoadResult>({ status: 'loading' });
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

        // 2. Fetch ALL review_items — requête EXACTE de la web app (loadHifz) :
        //    aucun filtre sur mastered / next_review — Mon Hifz = tous les ayats mémorisés
        const itemsPromise = supabase
          .from('review_items')
          .select('*')
          .eq('user_id', authUser.id)
          .order('surah_number', { ascending: true });

        // 3. Load quran JSON in parallel (module-level cache)
        if (!cachedQuran || !cachedQuranFr) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const [q, qfr] = await Promise.all([
            Promise.resolve(require('../../assets/data/quran.json') as QuranSurah[]),
            Promise.resolve(require('../../assets/data/quran_fr.json') as QuranFrSurah[]),
          ]);
          if (!cachedQuran)   cachedQuran   = q;
          if (!cachedQuranFr) cachedQuranFr = qfr;
        }

        const { data: allItems, error: hifzErr } = await itemsPromise;
        if (hifzErr) throw hifzErr;

        if (!allItems || allItems.length === 0) {
          setResult({ status: 'empty' });
          return;
        }

        const quran   = cachedQuran!;
        const quranFr = cachedQuranFr!;

        // 4. Enrich each item — identique web app (loadHifz inline enrichment)
        const enriched: EnrichedReviewItem[] = allItems.map(item => {
          const surahIdx         = (item.surah_number as number) - 1;
          const ayatId           = item.ayah as number;
          const verse            = quran[surahIdx]?.verses?.find(v => v.id === ayatId);
          const verseFr          = quranFr[surahIdx]?.verses?.find(v => v.id === ayatId);
          const globalAyatOffset = quran.slice(0, surahIdx).reduce((acc, s) => acc + (s.verses?.length ?? 0), 0);
          return {
            id:               item.id as string,
            user_id:          item.user_id as string,
            surah_number:     item.surah_number as number,
            ayah:             ayatId,
            next_review:      item.next_review as string,
            review_cycle:     item.review_cycle as number,
            ease_factor:      (item.ease_factor as number) ?? 2.0,
            mastered:         item.mastered as boolean,
            final_test_status: item.final_test_status as ReviewItem['final_test_status'],
            created_at:       item.created_at as string,
            arabicText:       verse?.text ?? '',
            transliteration:  verse?.transliteration ?? '',
            translation:      verseFr?.translation ?? '',
            globalNum:        globalAyatOffset + ayatId,
          };
        });

        setResult({ status: 'ready', items: enriched });
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
