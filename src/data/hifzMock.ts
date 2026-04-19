import type { ReviewItem } from '@/types';

// Mock data structuré exactement comme la table Supabase review_items
// Prêt pour swap : remplacer par supabase.from('review_items').select('*').eq('user_id', uid)
export const HIFZ_MOCK: ReviewItem[] = [
  // Al-Fatiha (surah 1) — 7 ayats complets, tous validés
  { id: '1',  user_id: 'mock', surah_number: 1, ayah: 1, next_review: '2026-04-20', review_cycle: 4, ease_factor: 2.5, mastered: false, final_test_status: 'validated', created_at: '2026-01-01' },
  { id: '2',  user_id: 'mock', surah_number: 1, ayah: 2, next_review: '2026-04-20', review_cycle: 4, ease_factor: 2.5, mastered: false, final_test_status: 'validated', created_at: '2026-01-01' },
  { id: '3',  user_id: 'mock', surah_number: 1, ayah: 3, next_review: '2026-04-20', review_cycle: 4, ease_factor: 2.5, mastered: false, final_test_status: 'validated', created_at: '2026-01-01' },
  { id: '4',  user_id: 'mock', surah_number: 1, ayah: 4, next_review: '2026-04-20', review_cycle: 4, ease_factor: 2.5, mastered: false, final_test_status: 'validated', created_at: '2026-01-01' },
  { id: '5',  user_id: 'mock', surah_number: 1, ayah: 5, next_review: '2026-04-20', review_cycle: 4, ease_factor: 2.5, mastered: false, final_test_status: 'validated', created_at: '2026-01-01' },
  { id: '6',  user_id: 'mock', surah_number: 1, ayah: 6, next_review: '2026-04-20', review_cycle: 4, ease_factor: 2.5, mastered: false, final_test_status: 'validated', created_at: '2026-01-01' },
  { id: '7',  user_id: 'mock', surah_number: 1, ayah: 7, next_review: '2026-04-20', review_cycle: 4, ease_factor: 2.5, mastered: false, final_test_status: 'validated', created_at: '2026-01-01' },

  // An-Nas (surah 114) — 6 ayats, mix validated/reinforce
  { id: '8',  user_id: 'mock', surah_number: 114, ayah: 1, next_review: '2026-04-19', review_cycle: 2, ease_factor: 2.1, mastered: false, final_test_status: 'validated', created_at: '2026-02-10' },
  { id: '9',  user_id: 'mock', surah_number: 114, ayah: 2, next_review: '2026-04-19', review_cycle: 2, ease_factor: 2.1, mastered: false, final_test_status: 'validated', created_at: '2026-02-10' },
  { id: '10', user_id: 'mock', surah_number: 114, ayah: 3, next_review: '2026-04-19', review_cycle: 2, ease_factor: 2.0, mastered: false, final_test_status: 'reinforce', created_at: '2026-02-10' },
  { id: '11', user_id: 'mock', surah_number: 114, ayah: 4, next_review: '2026-04-19', review_cycle: 2, ease_factor: 2.0, mastered: false, final_test_status: 'reinforce', created_at: '2026-02-10' },
  { id: '12', user_id: 'mock', surah_number: 114, ayah: 5, next_review: '2026-04-19', review_cycle: 1, ease_factor: 1.8, mastered: false, final_test_status: 'pending',   created_at: '2026-02-11' },
  { id: '13', user_id: 'mock', surah_number: 114, ayah: 6, next_review: '2026-04-19', review_cycle: 1, ease_factor: 1.8, mastered: false, final_test_status: 'pending',   created_at: '2026-02-11' },

  // Al-Falaq (surah 113) — 5 ayats, en cours
  { id: '14', user_id: 'mock', surah_number: 113, ayah: 1, next_review: '2026-04-21', review_cycle: 3, ease_factor: 2.3, mastered: false, final_test_status: 'validated', created_at: '2026-03-01' },
  { id: '15', user_id: 'mock', surah_number: 113, ayah: 2, next_review: '2026-04-21', review_cycle: 3, ease_factor: 2.3, mastered: false, final_test_status: 'validated', created_at: '2026-03-01' },
  { id: '16', user_id: 'mock', surah_number: 113, ayah: 3, next_review: '2026-04-21', review_cycle: 2, ease_factor: 2.1, mastered: false, final_test_status: 'reinforce', created_at: '2026-03-02' },
  { id: '17', user_id: 'mock', surah_number: 113, ayah: 4, next_review: '2026-04-22', review_cycle: 1, ease_factor: 1.9, mastered: false, final_test_status: 'pending',   created_at: '2026-03-05' },
  { id: '18', user_id: 'mock', surah_number: 113, ayah: 5, next_review: '2026-04-22', review_cycle: 1, ease_factor: 1.9, mastered: false, final_test_status: 'pending',   created_at: '2026-03-05' },

  // Al-Ikhlas (surah 112) — 4 ayats validés
  { id: '19', user_id: 'mock', surah_number: 112, ayah: 1, next_review: '2026-04-25', review_cycle: 5, ease_factor: 2.6, mastered: false, final_test_status: 'validated', created_at: '2026-03-10' },
  { id: '20', user_id: 'mock', surah_number: 112, ayah: 2, next_review: '2026-04-25', review_cycle: 5, ease_factor: 2.6, mastered: false, final_test_status: 'validated', created_at: '2026-03-10' },
  { id: '21', user_id: 'mock', surah_number: 112, ayah: 3, next_review: '2026-04-25', review_cycle: 5, ease_factor: 2.6, mastered: false, final_test_status: 'validated', created_at: '2026-03-10' },
  { id: '22', user_id: 'mock', surah_number: 112, ayah: 4, next_review: '2026-04-25', review_cycle: 5, ease_factor: 2.6, mastered: false, final_test_status: 'validated', created_at: '2026-03-10' },
];
