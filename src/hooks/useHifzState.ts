import { useState, useMemo } from 'react';
import type { ReviewItem } from '@/types';
import { ZAINLY_ORDER, QURAN_ORDER } from '@/data/onboardingData';
import { HIFZ_MOCK } from '@/data/hifzMock';

export type HifzSurahGroup = {
  surahNumber: number;
  surahName: string;
  items: ReviewItem[];
  validatedCount: number;
  reinforceCount: number;
  pendingCount: number;
};


// Position in Zainly order for sorting — key is surah number (1-indexed)
const ZAINLY_POSITION: Record<number, number> = Object.fromEntries(
  ZAINLY_ORDER.map((name, i) => [QURAN_ORDER.indexOf(name) + 1, i])
);

function getSurahName(num: number): string {
  return QURAN_ORDER[num - 1] ?? `Sourate ${num}`;
}

export function useHifzState() {
  const [expandedSurah, setExpandedSurah] = useState<number | null>(null);

  // Swap HIFZ_MOCK for real Supabase fetch here
  const items: ReviewItem[] = HIFZ_MOCK;

  const groups = useMemo<HifzSurahGroup[]>(() => {
    const map: Record<number, ReviewItem[]> = {};
    for (const item of items) {
      const sn = item.surah_number;
      if (!map[sn]) map[sn] = [];
      map[sn].push(item);
    }

    return Object.entries(map)
      .map(([snStr, surahItems]) => {
        const sn = Number(snStr);
        const sorted = [...surahItems].sort((a, b) => a.ayah - b.ayah);
        return {
          surahNumber: sn,
          surahName: getSurahName(sn),
          items: sorted,
          validatedCount: sorted.filter(i => i.final_test_status === 'validated').length,
          reinforceCount: sorted.filter(i => i.final_test_status === 'reinforce').length,
          pendingCount:   sorted.filter(i => i.final_test_status === 'pending').length,
        };
      })
      .sort((a, b) => {
        const pa = ZAINLY_POSITION[a.surahNumber] ?? Infinity;
        const pb = ZAINLY_POSITION[b.surahNumber] ?? Infinity;
        return pa - pb;
      });
  }, [items]);

  const totalAyats     = items.length;
  const totalValidated = items.filter(i => i.final_test_status === 'validated').length;
  const totalReinforce = items.filter(i => i.final_test_status === 'reinforce').length;

  function toggleExpanded(sn: number) {
    setExpandedSurah(prev => prev === sn ? null : sn);
  }

  return {
    groups,
    totalAyats,
    totalValidated,
    totalReinforce,
    expandedSurah,
    toggleExpanded,
    isEmpty: items.length === 0,
  };
}
