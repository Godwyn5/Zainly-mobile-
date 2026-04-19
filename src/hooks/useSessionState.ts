import { useState, useCallback, useRef } from 'react';
import type { SessionState } from '@/types';
import { supabase } from '@/lib/supabase';
import { sessionMock } from '@/data/sessionMock';

// ─── Helpers (identiques web app) ────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Session context from loader ─────────────────────────────────────────────

export type SessionContext = {
  userId: string;
  surahNumber: number;
  savedAyah: number;        // current_ayah snapshot before this session
  surahTotalVerses: number; // used to compute newAyah
  progress: Record<string, unknown>;
};

const SUCCESS_MSGS = ['Parfait', 'Excellent', 'Très bien'];

export type SessionExtras = {
  showRevealAnswer: boolean;
  successMsg: string;
  showSuccess: boolean;
  retryMsg: boolean;
};

export type SessionActions = {
  incrementListen: () => void;
  skipToTest: () => void;
  advanceToTest: () => void;
  revealAyat: () => void;
  handleRevealChoice: (remembered: boolean) => void;
  continueValidated: () => void;
  goToRecitation: () => void;
  showAnswer: () => void;
  goToSincerity: () => void;
  handleFinalSuccess: () => void;
  handleFinalReinforce: () => void;
  retry: () => void;
  finish: (validated: boolean) => Promise<void>;
};

export type SessionHook = {
  state: SessionState & SessionExtras;
  actions: SessionActions;
};

function freshState(override?: Partial<SessionState>): SessionState {
  return { ...sessionMock, phase: 'listen', currentIndex: 0, listenCount: 0, saving: false, error: null, ...override };
}

export function useSessionState(
  initialOverride?: Partial<SessionState>,
  sessionCtx?: SessionContext,
): SessionHook {
  const overrideRef  = useRef(initialOverride);
  const sessionCtxRef = useRef(sessionCtx);
  const [state, setState] = useState<SessionState>(() => freshState(initialOverride));
  const [showRevealAnswer, setShowRevealAnswer] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Bien ✓');
  const [showSuccess, setShowSuccess] = useState(false);
  const [retryMsg, setRetryMsg] = useState(false);
  const handledRef     = useRef(false);
  const saveHandledRef = useRef(false);
  const stateRef       = useRef(state);
  stateRef.current     = state;

  const incrementListen = useCallback(() => {
    setState(s => ({ ...s, listenCount: Math.min(s.listenCount + 1, 3) }));
  }, []);

  const skipToTest = useCallback(() => {
    setState(s => ({ ...s, listenCount: 3, phase: 'test' }));
  }, []);

  const advanceToTest = useCallback(() => {
    setState(s => ({ ...s, phase: 'test' }));
  }, []);

  const revealAyat = useCallback(() => {
    setState(s => ({ ...s, phase: 'reveal' }));
  }, []);

  const handleRevealChoice = useCallback((remembered: boolean) => {
    if (handledRef.current) return;
    handledRef.current = true;

    if (remembered) {
      const msg = SUCCESS_MSGS[Math.floor(Math.random() * SUCCESS_MSGS.length)];
      setSuccessMsg(msg);
      setShowSuccess(true);
      setState(s => ({ ...s, phase: 'validated' }));
    } else {
      handledRef.current = false;
      setRetryMsg(true);
      setState(s => ({ ...s, phase: 'listen', listenCount: 0 }));
      setTimeout(() => setRetryMsg(false), 1600);
    }
  }, []);

  const continueValidated = useCallback(() => {
    setShowSuccess(false);
    handledRef.current = false;
    setState(s => {
      const next = s.currentIndex + 1;
      if (next < s.ayats.length) {
        return { ...s, currentIndex: next, phase: 'listen', listenCount: 0 };
      }
      return { ...s, phase: 'final-intro' };
    });
  }, []);

  const goToRecitation = useCallback(() => {
    setState(s => ({ ...s, phase: 'final-recitation' }));
  }, []);

  const showAnswer = useCallback(() => setShowRevealAnswer(true), []);

  const goToSincerity = useCallback(() => {
    setShowRevealAnswer(false);
    setState(s => ({ ...s, phase: 'final-sincerity' }));
  }, []);

  const handleFinalSuccess = useCallback(() => {
    setState(s => ({ ...s, phase: 'final-success' }));
  }, []);

  const handleFinalReinforce = useCallback(() => {
    setState(s => ({ ...s, phase: 'final-reinforce' }));
  }, []);

  const retry = useCallback(() => {
    setState(freshState(overrideRef.current));
    setShowRevealAnswer(false);
    setRetryMsg(false);
    setShowSuccess(false);
    handledRef.current = false;
  }, []);

  const finish = useCallback(async (validated: boolean) => {
    if (saveHandledRef.current) return;
    saveHandledRef.current = true;
    setState(s => ({ ...s, saving: true }));

    const ctx = sessionCtxRef.current;
    if (!ctx) {
      // No real context — mock mode, just mark done
      setState(s => ({ ...s, saving: false }));
      saveHandledRef.current = false;
      return;
    }

    try {
      const today    = todayStr();
      const tomorrow = tomorrowStr();

      // R7: re-fetch fresh progress to avoid stale snapshot — identique web app
      const { data: freshProgRows } = await supabase
        .from('progress')
        .select('streak,total_memorized,session_dates,last_session_date')
        .eq('user_id', ctx.userId)
        .order('created_at', { ascending: false })
        .limit(1);
      const freshProg = freshProgRows?.[0] ?? ctx.progress;

      // 1. Insert review_items — skip on duplicate (23505)
      const finalStatus = validated ? 'validated' : 'reinforce';
      const currentAyats = stateRef.current.ayats;
      let insertedCount = 0;
      for (const ayat of currentAyats) {
        const { error: e } = await supabase.from('review_items').insert({
          user_id:           ctx.userId,
          surah_number:      ctx.surahNumber,
          ayah:              ayat.id,
          next_review:       tomorrow,
          review_cycle:      1,
          final_test_status: finalStatus,
        });
        if (e && e.code !== '23505' && !(e.message ?? '').includes('duplicate')) {
          setState(s => ({ ...s, saving: false, error: `Erreur sauvegarde révisions: ${e.message}` }));
          saveHandledRef.current = false;
          return;
        }
        if (!e) insertedCount++;
      }

      // 2. Compute new progress fields — identique web app
      const newAyah = Math.min(ctx.savedAyah + currentAyats.length, ctx.surahTotalVerses);
      const alreadyDoneToday = (freshProg as Record<string, unknown>).last_session_date === today;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`;
      const lastDate   = (freshProg as Record<string, unknown>).last_session_date as string | null;
      const streakBase = (lastDate === yStr || lastDate === today) ? ((freshProg as Record<string, unknown>).streak as number ?? 0) : 0;
      const newStreak  = alreadyDoneToday ? streakBase : streakBase + 1;
      const newTotal   = validated
        ? ((freshProg as Record<string, unknown>).total_memorized as number ?? 0) + insertedCount
        : ((freshProg as Record<string, unknown>).total_memorized as number ?? 0);
      const existingDates  = Array.isArray((freshProg as Record<string, unknown>).session_dates) ? (freshProg as Record<string, unknown>).session_dates as string[] : [];
      const newSessionDates = existingDates.includes(today) ? existingDates : [...existingDates, today];

      // 3. Update progress
      const { error: progErr } = await supabase
        .from('progress')
        .update({
          current_ayah:       newAyah,
          last_session_date:  today,
          streak:             newStreak,
          total_memorized:    newTotal,
          session_dates:      newSessionDates,
        })
        .eq('user_id', ctx.userId);

      if (progErr) {
        setState(s => ({ ...s, saving: false, error: 'Erreur mise à jour progression. Réessaie.' }));
        saveHandledRef.current = false;
        return;
      }

      setState(s => ({ ...s, saving: false }));
      saveHandledRef.current = false;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inattendue.';
      setState(s => ({ ...s, saving: false, error: msg }));
      saveHandledRef.current = false;
    }
  }, []);

  return {
    state: { ...state, showRevealAnswer, successMsg, showSuccess, retryMsg },
    actions: {
      incrementListen,
      skipToTest,
      advanceToTest,
      revealAyat,
      handleRevealChoice,
      continueValidated,
      goToRecitation,
      showAnswer,
      goToSincerity,
      handleFinalSuccess,
      handleFinalReinforce,
      retry,
      finish,
    },
  };
}
