export type MemorizationCard = {
  surahNumber: number;
  surahName: string;
  surahNameAr: string;
  ayatRange: [number, number];
  estimatedMinutes: number;
};

export type RevisionItem = {
  id: string;
  surahNumber: number;
  surahName: string;
  ayatRange: [number, number];
  lastReviewedDaysAgo: number;
  strength: 'weak' | 'medium' | 'strong';
};

export type TodayData = {
  date: Date;
  streak: number;
  revisionCount: number;
  memorizationCard: MemorizationCard;
  revisions: RevisionItem[];
};

export const todayMock: TodayData = {
  date: new Date(),
  streak: 4,
  revisionCount: 3,
  memorizationCard: {
    surahNumber: 2,
    surahName: 'Al-Baqara',
    surahNameAr: 'البقرة',
    ayatRange: [255, 257],
    estimatedMinutes: 2,
  },
  revisions: [
    {
      id: 'r1',
      surahNumber: 1,
      surahName: 'Al-Fatiha',
      ayatRange: [1, 7],
      lastReviewedDaysAgo: 3,
      strength: 'strong',
    },
    {
      id: 'r2',
      surahNumber: 2,
      surahName: 'Al-Baqara',
      ayatRange: [1, 5],
      lastReviewedDaysAgo: 7,
      strength: 'medium',
    },
    {
      id: 'r3',
      surahNumber: 2,
      surahName: 'Al-Baqara',
      ayatRange: [255, 255],
      lastReviewedDaysAgo: 14,
      strength: 'weak',
    },
  ],
};
