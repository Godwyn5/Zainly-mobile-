import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PartialSurah } from '@/data/onboardingData';
import { JUZ_30, calcEstimatedYears } from '@/data/onboardingData';
import { STORAGE_KEYS } from '@/lib/storageKeys';

export type OnboardingStep = 'rhythm' | 'surahs' | 'loading' | 'plan' | 'complete';

export type OnboardingState = {
  step: OnboardingStep;
  ayahPerDay: number | null;
  knownSurahs: string[];
  partialSurahs: Record<string, PartialSurah>;
  juzFilter: number;
  expandedPartial: string | null;
  loading: boolean;
  loadingPercent: number;
  loadingPhrase: string;
  error: string | null;
  plan: GeneratedPlan | null;
};

export type GeneratedPlan = {
  ayahPerDay: number;
  estimatedYears: number;
  knownSurahs: string[];
  partialSurahs: Record<string, PartialSurah>;
};

export type OnboardingActions = {
  setAyahPerDay: (n: number) => void;
  goToSurahs: () => void;
  goBackToRhythm: () => void;
  toggleSurah: (name: string) => void;
  selectNone: () => void;
  selectJuzAmma: () => void;
  setJuzFilter: (juz: number) => void;
  setExpandedPartial: (name: string | null) => void;
  setPartialFrom: (name: string, val: string) => void;
  setPartialTo: (name: string, val: string) => void;
  generate: () => Promise<void>;
  estimatedYears: number | null;
};

export function useOnboardingState(): { state: OnboardingState; actions: OnboardingActions } {
  const [step, setStep] = useState<OnboardingStep>('rhythm');
  const [ayahPerDay, setAyahPerDayState] = useState<number | null>(null);
  const [knownSurahs, setKnownSurahs] = useState<string[]>([]);
  const [partialSurahs, setPartialSurahs] = useState<Record<string, PartialSurah>>({});
  const [juzFilter, setJuzFilterState] = useState(0);
  const [expandedPartial, setExpandedPartialState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const [loadingPhrase, setLoadingPhrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);

  const setAyahPerDay = useCallback((n: number) => setAyahPerDayState(n), []);

  const goToSurahs = useCallback(() => setStep('surahs'), []);
  const goBackToRhythm = useCallback(() => setStep('rhythm'), []);

  const toggleSurah = useCallback((name: string) => {
    setKnownSurahs(prev => {
      const isKnown = prev.includes(name);
      if (isKnown) {
        setPartialSurahs(p => { const n = { ...p }; delete n[name]; return n; });
        setExpandedPartialState(e => e === name ? null : e);
        return prev.filter(s => s !== name);
      }
      return [...prev, name];
    });
  }, []);

  const selectNone = useCallback(() => {
    setKnownSurahs([]);
    setPartialSurahs({});
    setExpandedPartialState(null);
  }, []);

  const selectJuzAmma = useCallback(() => {
    setKnownSurahs(prev => {
      const next = [...prev];
      JUZ_30.forEach(s => { if (!next.includes(s)) next.push(s); });
      return next;
    });
  }, []);

  const setJuzFilter = useCallback((juz: number) => setJuzFilterState(juz), []);

  const setExpandedPartial = useCallback((name: string | null) => setExpandedPartialState(name), []);

  const setPartialFrom = useCallback((name: string, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) {
      setPartialSurahs(p => ({ ...p, [name]: { ...(p[name] ?? { from: num, to: num }), from: num } }));
    }
  }, []);

  const setPartialTo = useCallback((name: string, val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) {
      setPartialSurahs(p => ({ ...p, [name]: { ...(p[name] ?? { from: 1, to: num }), to: num } }));
    }
  }, []);

  const generate = useCallback(async () => {
    if (!ayahPerDay) return;
    setError(null);
    setLoading(true);
    setStep('loading');

    // Animate loading: 3 phrases over ~800ms total
    const PHRASES = [
      'Analyse de tes réponses...',
      'Personnalisation de ton rythme...',
      'Ton plan est prêt',
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => { setLoadingPhrase(PHRASES[0]); setLoadingPercent(30); }, 0));
    timers.push(setTimeout(() => { setLoadingPhrase(PHRASES[1]); setLoadingPercent(65); }, 300));
    timers.push(setTimeout(() => { setLoadingPhrase(PHRASES[2]); setLoadingPercent(100); }, 650));

    try {
      // Supabase API call plugs in here — replace the delay below
      await new Promise(res => setTimeout(res, 800));

      timers.forEach(clearTimeout);
      setLoadingPercent(100);
      setLoadingPhrase('Ton plan est prêt');

      const generatedPlan: GeneratedPlan = {
        ayahPerDay,
        estimatedYears: calcEstimatedYears(ayahPerDay, knownSurahs, partialSurahs),
        knownSurahs,
        partialSurahs,
      };

      // Save answers and plan — ONBOARDING_DONE is written only on final CTA ("Commencer aujourd'hui")
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_RESULT, JSON.stringify(generatedPlan));

      setTimeout(() => {
        setPlan(generatedPlan);
        setLoading(false);
        setStep('plan');
      }, 150);
    } catch (err: any) {
      timers.forEach(clearTimeout);
      setError(err?.message ?? 'Une erreur est survenue.');
      setLoadingPercent(0);
      setLoading(false);
      setStep('surahs');
    }
  }, [ayahPerDay, knownSurahs, partialSurahs]);

  const estimatedYears = ayahPerDay
    ? calcEstimatedYears(ayahPerDay, knownSurahs, partialSurahs)
    : null;

  return {
    state: {
      step,
      ayahPerDay,
      knownSurahs,
      partialSurahs,
      juzFilter,
      expandedPartial,
      loading,
      loadingPercent,
      loadingPhrase,
      error,
      plan,
    },
    actions: {
      setAyahPerDay,
      goToSurahs,
      goBackToRhythm,
      toggleSurah,
      selectNone,
      selectJuzAmma,
      setJuzFilter,
      setExpandedPartial,
      setPartialFrom,
      setPartialTo,
      generate,
      estimatedYears,
    },
  };
}
