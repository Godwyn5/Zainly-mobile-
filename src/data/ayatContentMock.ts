// Mock du contenu textuel des ayats (arabe + translittération + traduction)
// Structure identique à quran.json / quran_fr.json de la web app
// Swap : remplacer par fetch('/data/quran.json') + fetch('/data/quran_fr.json')
// ou requête Supabase si les versets sont stockés en base.

export type AyatContent = {
  arabic: string;
  transliteration: string;
  translation: string;
};

// Clé : `${surahNumber}:${ayah}`
export const AYAT_CONTENT_MOCK: Record<string, AyatContent> = {
  // Al-Fatiha
  '1:1': { arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', transliteration: 'Bismillāhi r-raḥmāni r-raḥīm', translation: 'Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux.' },
  '1:2': { arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', transliteration: 'Al-ḥamdu lillāhi rabbi l-ʿālamīn', translation: 'Louange à Allah, Seigneur des mondes,' },
  '1:3': { arabic: 'الرَّحْمَٰنِ الرَّحِيمِ', transliteration: 'Ar-raḥmāni r-raḥīm', translation: 'le Tout Miséricordieux, le Très Miséricordieux,' },
  '1:4': { arabic: 'مَالِكِ يَوْمِ الدِّينِ', transliteration: 'Māliki yawmi d-dīn', translation: 'Maître du Jour de la rétribution.' },
  '1:5': { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', transliteration: 'Iyyāka naʿbudu wa-iyyāka nastaʿīn', translation: 'C\'est Toi [Seul] que nous adorons, et c\'est Toi [Seul] dont nous implorons le secours.' },
  '1:6': { arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', transliteration: 'Ihdinā ṣ-ṣirāṭa l-mustaqīm', translation: 'Guide-nous dans le droit chemin,' },
  '1:7': { arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', transliteration: 'Ṣirāṭa llaḏīna anʿamta ʿalayhim ġayri l-maġḍūbi ʿalayhim wa-lā ḍ-ḍāllīn', translation: 'le chemin de ceux que Tu as comblés de bienfaits, non pas de ceux qui ont encouru Ta colère, ni des égarés.' },

  // An-Nas (114)
  '114:1': { arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', transliteration: 'Qul aʿūḏu bi-rabbi n-nās', translation: 'Dis : "Je cherche protection auprès du Seigneur des hommes,' },
  '114:2': { arabic: 'مَلِكِ النَّاسِ', transliteration: 'Maliki n-nās', translation: 'du Roi des hommes,' },
  '114:3': { arabic: 'إِلَٰهِ النَّاسِ', transliteration: 'Ilāhi n-nās', translation: 'du Dieu des hommes,' },
  '114:4': { arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', transliteration: 'Min šarri l-waswāsi l-ḫannās', translation: 'contre le mal du tentateur furtif,' },
  '114:5': { arabic: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', transliteration: 'Al-laḏī yuwaswisu fī ṣudūri n-nās', translation: 'qui souffle le mal dans les poitrines des hommes,' },
  '114:6': { arabic: 'مِنَ الْجِنَّةِ وَالنَّاسِ', transliteration: 'Mina l-jinnati wa-n-nās', translation: 'qu\'il soit d\'entre les djinns ou d\'entre les hommes."' },

  // Al-Falaq (113)
  '113:1': { arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', transliteration: 'Qul aʿūḏu bi-rabbi l-falaq', translation: 'Dis : "Je cherche protection auprès du Seigneur de l\'aube naissante,' },
  '113:2': { arabic: 'مِن شَرِّ مَا خَلَقَ', transliteration: 'Min šarri mā ḫalaq', translation: 'contre le mal de ce qu\'Il a créé,' },
  '113:3': { arabic: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', transliteration: 'Wa-min šarri ġāsiqin iḏā waqab', translation: 'contre le mal de l\'obscurité quand elle s\'étend,' },
  '113:4': { arabic: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', transliteration: 'Wa-min šarri n-naffāṯāti fī l-ʿuqad', translation: 'contre le mal des [femmes] souffleuses sur les nœuds,' },
  '113:5': { arabic: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', transliteration: 'Wa-min šarri ḥāsidin iḏā ḥasad', translation: 'et contre le mal de l\'envieux quand il envie."' },

  // Al-Ikhlas (112)
  '112:1': { arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', transliteration: 'Qul huwa llāhu aḥad', translation: 'Dis : "Il est Allah, Unique.' },
  '112:2': { arabic: 'اللَّهُ الصَّمَدُ', transliteration: 'Allāhu ṣ-ṣamad', translation: 'Allah, le Seul à être imploré pour ce que nous désirons.' },
  '112:3': { arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', transliteration: 'Lam yalid wa-lam yūlad', translation: 'Il n\'a pas engendré, n\'a pas été engendré non plus.' },
  '112:4': { arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', transliteration: 'Wa-lam yakun lahu kufuwan aḥad', translation: 'Et nul n\'est égal à Lui."' },
};

export function getAyatContent(surahNumber: number, ayah: number): AyatContent | null {
  return AYAT_CONTENT_MOCK[`${surahNumber}:${ayah}`] ?? null;
}
