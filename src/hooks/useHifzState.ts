import { useState, useMemo } from 'react';
import { ZAINLY_ORDER, QURAN_ORDER } from '@/data/onboardingData';
import type { EnrichedReviewItem } from '@/hooks/useHifzLoader';

export type HifzSurahGroup = {
  surahNumber: number;
  surahName: string;
  items: EnrichedReviewItem[];
  validatedCount: number;
  reinforceCount: number;
  pendingCount: number;
};

// Position in Zainly order for sorting — identique web app (zainlyPos map)
const ZAINLY_POSITION: Record<number, number> = Object.fromEntries(
  ZAINLY_ORDER.map((name, i) => [QURAN_ORDER.indexOf(name) + 1, i])
);

function getSurahName(num: number): string {
  return QURAN_ORDER[num - 1] ?? `Sourate ${num}`;
}

export function useHifzState(initialItems: EnrichedReviewItem[]) {
  const [expandedSurah, setExpandedSurah] = useState<number | null>(null);

  const groups = useMemo<HifzSurahGroup[]>(() => {
    // Group by surah_number — identique web app
    const map: Record<number, EnrichedReviewItem[]> = {};
    for (const item of initialItems) {
      const sn = item.surah_number;
      if (!map[sn]) map[sn] = [];
      map[sn].push(item);
    }

    return Object.entries(map)
      .map(([snStr, surahItems]) => {
        const sn = Number(snStr);
        // Sort ayats ascending within each surah — identique web app (.sort((a,b) => a.ayah - b.ayah))
        const sorted = [...surahItems].sort((a, b) => a.ayah - b.ayah);
        return {
          surahNumber:    sn,
          surahName:      getSurahName(sn),
          items:          sorted,
          validatedCount: sorted.filter(i => i.final_test_status === 'validated').length,
          reinforceCount: sorted.filter(i => i.final_test_status === 'reinforce').length,
          pendingCount:   sorted.filter(i => i.final_test_status === 'pending').length,
        };
      })
      // Sort groups by Zainly order — identique web app (zainlyPos)
      .sort((a, b) => {
        const pa = ZAINLY_POSITION[a.surahNumber] ?? Infinity;
        const pb = ZAINLY_POSITION[b.surahNumber] ?? Infinity;
        return pa - pb;
      });
  }, [initialItems]);

  const totalAyats     = initialItems.length;
  const totalValidated = initialItems.filter(i => i.final_test_status === 'validated').length;
  const totalReinforce = initialItems.filter(i => i.final_test_status === 'reinforce').length;

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
  };
}
