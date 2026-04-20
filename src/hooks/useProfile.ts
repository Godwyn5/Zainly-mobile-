import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type ProfileData = {
  email:               string;
  isPremium:           boolean;
  planType:            'monthly' | 'yearly' | null;
  subscriptionStatus:  'active' | 'canceled' | 'past_due' | null;
  premiumSince:        string | null; // ISO date string
};

export type ProfileResult =
  | { status: 'loading' }
  | { status: 'ready'; data: ProfileData }
  | { status: 'error'; message: string };

export function useProfile() {
  const [result, setResult] = useState<ProfileResult>({ status: 'loading' });

  const load = useCallback(async () => {
    setResult({ status: 'loading' });
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) {
        setResult({ status: 'error', message: 'Non connecté. Reconnecte-toi.' });
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('is_premium, plan_type, subscription_status, premium_since')
        .eq('id', user.id)
        .maybeSingle();

      if (profileErr) {
        setResult({ status: 'error', message: profileErr.message });
        return;
      }

      if (!profile) {
        setResult({ status: 'error', message: 'Profil introuvable. Contacte le support si le problème persiste.' });
        return;
      }

      setResult({
        status: 'ready',
        data: {
          email:              user.email ?? '',
          isPremium:          profile.is_premium === true,
          planType:           (profile.plan_type as ProfileData['planType']) ?? null,
          subscriptionStatus: (profile.subscription_status as ProfileData['subscriptionStatus']) ?? null,
          premiumSince:       (profile.premium_since as string) ?? null,
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inattendue.';
      setResult({ status: 'error', message: msg });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { result, reload: load };
}
