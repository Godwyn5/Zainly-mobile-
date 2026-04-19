// ─── Rythmes ─────────────────────────────────────────────────────────────────

export type Rhythm = {
  ayah: number;
  label: string;
  desc: string;
  motivation: string;
};

export const RHYTHMS: Rhythm[] = [
  { ayah: 1, label: '1 ayat / jour',  desc: 'Parfait pour commencer en douceur',     motivation: 'Tu construis une habitude solide.' },
  { ayah: 2, label: '2 ayats / jour', desc: 'Un rythme stable et durable',           motivation: 'La régularité fait tout.' },
  { ayah: 3, label: '3 ayats / jour', desc: 'Un excellent équilibre',                motivation: 'Un excellent point de départ.' },
  { ayah: 4, label: '4 ayats / jour', desc: 'Tu progresses rapidement',              motivation: 'Tu avances vite et bien.' },
  { ayah: 5, label: '5 ayats / jour', desc: 'Très engagé — résultats visibles',      motivation: 'Peu le font — bravo.' },
  { ayah: 6, label: '6 ayats / jour', desc: 'Niveau avancé — forte discipline',      motivation: 'Discipline maximale.' },
];

// ─── Ordre Zainly (du plus court au plus long, début par Juz Amma) ────────────

export const ZAINLY_ORDER: string[] = [
  'Al-Fatiha','An-Nas','Al-Falaq','Al-Ikhlas','Al-Masad','An-Nasr','Al-Kafirun',
  'Al-Kawthar','Al-Maun','Quraysh','Al-Fil','Al-Humaza','Al-Asr','At-Takathur',
  'Al-Qaria','Al-Adiyat','Az-Zalzala','Al-Bayyina','Al-Qadr','Al-Alaq','At-Tin',
  'Ash-Sharh','Ad-Duha','Al-Layl','Ash-Shams','Al-Balad','Al-Fajr','Al-Ghashiya',
  'Al-Ala','At-Tariq','Al-Buruj','Al-Inshiqaq','Al-Mutaffifin','Al-Infitar',
  'At-Takwir','Abasa','An-Naziat','An-Naba','Al-Mursalat','Al-Insan','Al-Qiyama',
  'Al-Muddaththir','Al-Muzzammil','Al-Jinn','Nuh','Al-Maarij','Al-Haqqa',
  'Al-Qalam','Al-Mulk','At-Tahrim','At-Talaq','At-Taghabun','Al-Munafiqun',
  'Al-Jumua','As-Saf','Al-Mumtahana','Al-Hashr','Al-Mujadila','Ad-Dukhan',
  'Al-Jathiya','Al-Ahqaf','Az-Zukhruf','Ash-Shura','Fussilat','Ghafir',
  'Az-Zumar','Sad','As-Saffat','Ya-Sin','Fatir','Saba','Al-Ahzab','As-Sajda',
  'Luqman','Ar-Rum','Al-Ankabut','Al-Qasas','An-Naml','Ash-Shuara','Al-Furqan',
  'An-Nur','Al-Muminun','Al-Hajj','Al-Anbiya','Ta-Ha','Maryam','Al-Kahf',
  'Al-Isra','An-Nahl','Al-Hijr','Ibrahim','Ar-Rad','Yusuf','Hud','Yunus',
  'At-Tawba','Al-Anfal','Al-Araf','Al-Anam','Al-Maida','An-Nisa','Al-Imran',
  'Al-Baqara','Muhammad','Al-Fath','Al-Hujurat','Qaf','Adh-Dhariyat','At-Tur',
  'An-Najm','Al-Qamar','Ar-Rahman','Al-Waqia','Al-Hadid',
];

// ─── Ordre Coranique (pour affichage du numéro) ───────────────────────────────

export const QURAN_ORDER: string[] = [
  'Al-Fatiha','Al-Baqara','Al-Imran','An-Nisa','Al-Maida','Al-Anam','Al-Araf',
  'Al-Anfal','At-Tawba','Yunus','Hud','Yusuf','Ar-Rad','Ibrahim','Al-Hijr',
  'An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha','Al-Anbiya','Al-Hajj',
  'Al-Muminun','An-Nur','Al-Furqan','Ash-Shuara','An-Naml','Al-Qasas',
  'Al-Ankabut','Ar-Rum','Luqman','As-Sajda','Al-Ahzab','Saba','Fatir','Ya-Sin',
  'As-Saffat','Sad','Az-Zumar','Ghafir','Fussilat','Ash-Shura','Az-Zukhruf',
  'Ad-Dukhan','Al-Jathiya','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf',
  'Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqia','Al-Hadid',
  'Al-Mujadila','Al-Hashr','Al-Mumtahana','As-Saf','Al-Jumua','Al-Munafiqun',
  'At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqa',
  'Al-Maarij','Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyama',
  'Al-Insan','Al-Mursalat','An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar',
  'Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiya',
  'Al-Fajr','Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin',
  'Al-Alaq','Al-Qadr','Al-Bayyina','Az-Zalzala','Al-Adiyat','Al-Qaria',
  'At-Takathur','Al-Asr','Al-Humaza','Al-Fil','Quraysh','Al-Maun','Al-Kawthar',
  'Al-Kafirun','An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas',
];

// ─── Nombre d'ayats par sourate (ordre coranique) ────────────────────────────

export const SURAH_AYAT: number[] = [
  7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,
  112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,
  59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,
  52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,
  21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6,
];

// ─── Sourates du Juz Amma (Juz 30) ───────────────────────────────────────────

export const JUZ_30: string[] = [
  'An-Naba','An-Naziat','Abasa','At-Takwir','Al-Infitar','Al-Mutaffifin',
  'Al-Inshiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiya','Al-Fajr',
  'Al-Balad','Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq',
  'Al-Qadr','Al-Bayyina','Az-Zalzala','Al-Adiyat','Al-Qaria','At-Takathur',
  'Al-Asr','Al-Humaza','Al-Fil','Quraysh','Al-Maun','Al-Kawthar','Al-Kafirun',
  'An-Nasr','Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getSurahAyatCount(name: string): number {
  const idx = QURAN_ORDER.indexOf(name);
  return idx >= 0 ? (SURAH_AYAT[idx] ?? 0) : 0;
}

export function getSurahNumber(name: string): number {
  return QURAN_ORDER.indexOf(name) + 1;
}

export type PartialSurah = { from: number; to: number };

export function calcRemainingAyats(
  known: string[],
  partial: Record<string, PartialSurah>,
): number {
  const knownSet = new Set(known);
  let memorized = 0;
  for (const name of known) {
    const p = partial[name];
    if (p && p.from && p.to && p.to >= p.from) {
      memorized += p.to - p.from + 1;
    } else {
      memorized += getSurahAyatCount(name);
    }
  }
  const total = SURAH_AYAT.reduce((a, b) => a + b, 0);
  return Math.max(0, total - memorized);
}

export function calcEstimatedYears(
  ayahPerDay: number,
  known: string[],
  partial: Record<string, PartialSurah>,
): number {
  const remaining = calcRemainingAyats(known, partial);
  const weeks = Math.ceil(remaining / (ayahPerDay * 6));
  return Math.max(1, Math.round(weeks / 52.18));
}

export const LOADING_PHRASES = [
  'Analyse de tes réponses...',
  'Personnalisation de ton rythme...',
  'Sélection des sourates...',
  'Ton plan est prêt',
];
