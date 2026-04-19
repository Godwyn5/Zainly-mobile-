// ─── Supabase row types ───────────────────────────────────────────────────────

export interface Progress {
  id: string;
  user_id: string;
  current_surah: number;
  current_ayah: number;
  streak: number;
  total_memorized: number;
  last_session_date: string | null;
  session_dates: string[];
  last_session_difficulty: number | null;
}

export interface ReviewItem {
  id: string;
  user_id: string;
  surah_number: number;
  ayah: number;
  next_review: string;
  review_cycle: number;
  ease_factor: number;
  mastered: boolean;
  final_test_status: 'pending' | 'validated' | 'reinforce';
  created_at: string;
}

// ─── Session types ────────────────────────────────────────────────────────────

export interface Ayat {
  id: number;
  text: string;
  translation?: string;
}

export type SessionPhase =
  | 'loading'
  | 'listen'
  | 'test'
  | 'reveal'
  | 'final-intro'
  | 'final-recitation'
  | 'final-sincerity'
  | 'final-success'
  | 'final-reinforce';

export interface SessionState {
  ayats: Ayat[];
  currentIndex: number;
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  phase: SessionPhase;
  listenCount: number;
  saving: boolean;
  error: string | null;
}

// ─── Navigation types ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/onboarding': undefined;
  '(app)/(tabs)/today': undefined;
  '(app)/(tabs)/hifz': undefined;
  '(app)/(tabs)/profile': undefined;
  '(app)/session': undefined;
  '(app)/revision': undefined;
  '(app)/done': undefined;
};
