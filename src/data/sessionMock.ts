import type { Ayat, SessionState } from '@/types';

export const sessionMock: SessionState = {
  surahNumber: 2,
  surahName: 'Al-Baqara',
  startAyah: 255,
  endAyah: 257,
  currentIndex: 0,
  phase: 'listen',
  listenCount: 0,
  saving: false,
  error: null,
  ayats: [
    {
      id: 255,
      text: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ',
      translation: 'Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par lui-même.',
    },
    {
      id: 256,
      text: 'لَآ إِكْرَاهَ فِى ٱلدِّينِ ۖ قَد تَّبَيَّنَ ٱلرُّشْدُ مِنَ ٱلْغَىِّ',
      translation: 'Nulle contrainte en religion. La bonne voie se distingue clairement de l\'égarement.',
    },
    {
      id: 257,
      text: 'ٱللَّهُ وَلِىُّ ٱلَّذِينَ ءَامَنُوا۟ يُخْرِجُهُم مِّنَ ٱلظُّلُمَـٰتِ إِلَى ٱلنُّورِ',
      translation: 'Allah est le Maître des croyants. Il les fait sortir des ténèbres vers la lumière.',
    },
  ],
};
