// Mock des review_items enrichis — structure identique à ce que la web app construit après
// avoir joint review_items + quran.json + quran_fr.json.
// Swap : remplacer par le fetch Supabase + enrichissement dans useRevisionState.

export type RevisionItem = {
  id: string;
  surah_number: number;
  ayah: number;
  review_cycle: number;
  ease_factor: number;
  mastered: boolean;
  final_test_status: 'pending' | 'validated' | 'reinforce';
  // Enriched fields (from quran.json / quran_fr.json)
  surahLabel: string;
  arabicText: string;
  transliteration: string;
  translation: string;
};

export const REVISION_MOCK: RevisionItem[] = [
  {
    id: 'r1',
    surah_number: 114, ayah: 3,
    review_cycle: 2, ease_factor: 2.0, mastered: false, final_test_status: 'reinforce',
    surahLabel: 'An-Nas',
    arabicText: 'إِلَٰهِ النَّاسِ',
    transliteration: 'Ilāhi n-nās',
    translation: 'du Dieu des hommes,',
  },
  {
    id: 'r2',
    surah_number: 114, ayah: 4,
    review_cycle: 2, ease_factor: 2.0, mastered: false, final_test_status: 'reinforce',
    surahLabel: 'An-Nas',
    arabicText: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
    transliteration: 'Min šarri l-waswāsi l-ḫannās',
    translation: 'contre le mal du tentateur furtif,',
  },
  {
    id: 'r3',
    surah_number: 113, ayah: 3,
    review_cycle: 2, ease_factor: 2.1, mastered: false, final_test_status: 'reinforce',
    surahLabel: 'Al-Falaq',
    arabicText: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
    transliteration: 'Wa-min šarri ġāsiqin iḏā waqab',
    translation: 'contre le mal de l\'obscurité quand elle s\'étend,',
  },
  {
    id: 'r4',
    surah_number: 1, ayah: 6,
    review_cycle: 3, ease_factor: 2.3, mastered: false, final_test_status: 'validated',
    surahLabel: 'Al-Fatiha',
    arabicText: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    transliteration: 'Ihdinā ṣ-ṣirāṭa l-mustaqīm',
    translation: 'Guide-nous dans le droit chemin,',
  },
  {
    id: 'r5',
    surah_number: 1, ayah: 7,
    review_cycle: 3, ease_factor: 2.3, mastered: false, final_test_status: 'validated',
    surahLabel: 'Al-Fatiha',
    arabicText: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration: 'Ṣirāṭa llaḏīna anʿamta ʿalayhim ġayri l-maġḍūbi ʿalayhim wa-lā ḍ-ḍāllīn',
    translation: 'le chemin de ceux que Tu as comblés de bienfaits, non pas de ceux qui ont encouru Ta colère, ni des égarés.',
  },
];

// SRS logic — identique à la web app
export const CYCLE_DAYS = [1, 3, 7, 14, 30, 60] as const;

export function nextReviewDate(cycle: number): string {
  const days = CYCLE_DAYS[Math.min(cycle, CYCLE_DAYS.length - 1)];
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function srsMessage(remembered: boolean, cycle: number): string {
  if (!remembered) return 'Cet ayat reviendra demain pour être renforcé';
  const nextCycle = Math.min(cycle + 1, CYCLE_DAYS.length - 1);
  if (nextCycle >= CYCLE_DAYS.length - 1) return 'Maîtrisé — plus de révision nécessaire';
  return 'Bien retenu';
}
