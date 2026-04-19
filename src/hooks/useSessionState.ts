import { useState, useCallback, useRef } from 'react';
import type { SessionState } from '@/types';
import { sessionMock } from '@/data/sessionMock';

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
  finish: (validated: boolean) => void;
};

export type SessionHook = {
  state: SessionState & SessionExtras;
  actions: SessionActions;
};

function freshState(override?: Partial<SessionState>): SessionState {
  return { ...sessionMock, phase: 'listen', currentIndex: 0, listenCount: 0, saving: false, error: null, ...override };
}

export function useSessionState(initialOverride?: Partial<SessionState>): SessionHook {
  const overrideRef = useRef(initialOverride);
  const [state, setState] = useState<SessionState>(() => freshState(initialOverride));
  const [showRevealAnswer, setShowRevealAnswer] = useState(false);
  const [successMsg, setSuccessMsg] = useState('Bien ✓');
  const [showSuccess, setShowSuccess] = useState(false);
  const [retryMsg, setRetryMsg] = useState(false);
  const handledRef = useRef(false);

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

  const finish = useCallback((_validated: boolean) => {
    setState(s => ({ ...s, saving: true }));
    // Supabase persistence hooks in here
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
