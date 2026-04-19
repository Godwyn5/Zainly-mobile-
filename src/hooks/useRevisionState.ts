import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { CYCLE_DAYS, nextReviewDate, srsMessage, type RevisionItem } from '@/data/revisionMock';

export type RevisionPhase = 'recall' | 'revealed';

export type RevisionState = {
  items: RevisionItem[];
  currentIndex: number;
  phase: RevisionPhase;
  showTranslit: boolean;
  srsMsg: string;
  saving: boolean;
  done: boolean;
  error: string | null;
};

export type RevisionActions = {
  reveal: () => void;
  toggleTranslit: () => void;
  answer: (remembered: boolean) => void;
  progress: number; // 0-100
};

export function useRevisionState(
  initialItems: RevisionItem[],
  userId: string,
): { state: RevisionState; actions: RevisionActions } {
  const [items]                         = useState<RevisionItem[]>(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase]               = useState<RevisionPhase>('recall');
  const [showTranslit, setShowTranslit] = useState(false);
  const [srsMsg, setSrsMsg]             = useState('');
  const [saving, setSaving]             = useState(false);
  const [done, setDone]                 = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const answerGuardRef = useRef(false);

  const reveal = useCallback(() => {
    setPhase('revealed');
  }, []);

  const toggleTranslit = useCallback(() => {
    setShowTranslit(v => !v);
  }, []);

  const answer = useCallback(async (remembered: boolean) => {
    if (answerGuardRef.current || saving) return;
    answerGuardRef.current = true;
    setSaving(true);

    const item       = items[currentIndex];
    const curCycle   = item.review_cycle ?? 1;
    // SRS — identique web app exactement :
    const nextCycle  = remembered ? Math.min(curCycle + 1, CYCLE_DAYS.length - 1) : 1;
    const nextReview = nextReviewDate(nextCycle);
    const mastered   = remembered && curCycle >= CYCLE_DAYS.length - 1;
    const msg        = srsMessage(remembered, curCycle);

    // Persistance Supabase — identique web app
    const { error: updateErr } = await supabase
      .from('review_items')
      .update({
        review_cycle: nextCycle,
        next_review:  nextReview,
        mastered,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', item.id);

    if (updateErr) {
      setError(updateErr.message ?? 'Erreur lors de la sauvegarde. Réessaie.');
      setSaving(false);
      answerGuardRef.current = false;
      return;
    }

    setSrsMsg(msg);
    setSaving(false);

    const isLast = currentIndex >= items.length - 1;

    if (isLast) {
      setTimeout(() => {
        setDone(true);
        answerGuardRef.current = false;
      }, 500);
    } else {
      setTimeout(() => {
        setCurrentIndex(i => i + 1);
        setPhase('recall');
        setShowTranslit(false);
        setSrsMsg('');
        answerGuardRef.current = false;
      }, 500);
    }
  }, [currentIndex, items, saving, userId]);

  const progress = items.length > 0
    ? ((currentIndex + (phase === 'revealed' ? 1 : 0)) / items.length) * 100
    : 0;

  return {
    state: { items, currentIndex, phase, showTranslit, srsMsg, saving, done, error },
    actions: { reveal, toggleTranslit, answer, progress },
  };
}
