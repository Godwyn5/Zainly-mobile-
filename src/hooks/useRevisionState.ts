import { useState, useCallback, useRef } from 'react';
import { REVISION_MOCK, CYCLE_DAYS, nextReviewDate, srsMessage, type RevisionItem } from '@/data/revisionMock';

export type RevisionPhase = 'recall' | 'revealed';

export type RevisionState = {
  items: RevisionItem[];
  currentIndex: number;
  phase: RevisionPhase;
  showTranslit: boolean;
  srsMsg: string;
  saving: boolean;
  done: boolean;
};

export type RevisionActions = {
  reveal: () => void;
  toggleTranslit: () => void;
  answer: (remembered: boolean) => void;
  progress: number; // 0-100
};

export function useRevisionState(): { state: RevisionState; actions: RevisionActions } {
  // Swap REVISION_MOCK for Supabase fetch here
  const [items]        = useState<RevisionItem[]>(REVISION_MOCK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase]               = useState<RevisionPhase>('recall');
  const [showTranslit, setShowTranslit] = useState(false);
  const [srsMsg, setSrsMsg]             = useState('');
  const [saving, setSaving]             = useState(false);
  const [done, setDone]                 = useState(false);

  const answerGuardRef = useRef(false);

  const reveal = useCallback(() => {
    setPhase('revealed');
  }, []);

  const toggleTranslit = useCallback(() => {
    setShowTranslit(v => !v);
  }, []);

  const answer = useCallback((remembered: boolean) => {
    if (answerGuardRef.current || saving) return;
    answerGuardRef.current = true;
    setSaving(true);

    const item       = items[currentIndex];
    const curCycle   = item.review_cycle ?? 1;
    const nextCycle  = remembered ? Math.min(curCycle + 1, CYCLE_DAYS.length - 1) : 1;
    const _nextDate  = nextReviewDate(nextCycle); // used when Supabase is wired
    const msg        = srsMessage(remembered, curCycle);

    setSrsMsg(msg);

    // TODO (Supabase): update review_items set review_cycle, next_review, mastered where id = item.id
    // await supabase.from('review_items').update({ review_cycle: nextCycle, next_review: _nextDate, ... }).eq('id', item.id)

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
  }, [currentIndex, items, saving]);

  const progress = items.length > 0
    ? ((currentIndex + (phase === 'revealed' ? 1 : 0)) / items.length) * 100
    : 0;

  return {
    state: {
      items,
      currentIndex,
      phase,
      showTranslit,
      srsMsg,
      saving,
      done,
    },
    actions: { reveal, toggleTranslit, answer, progress },
  };
}
