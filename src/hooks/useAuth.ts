import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useAuth] mount — calling getSession()');
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('[useAuth] getSession resolved — session:', !!data.session, '| error:', error?.message ?? null);
      setSession(data.session);
      console.log('[useAuth] setLoading(false)');
      setLoading(false);
    }).catch(err => {
      console.log('[useAuth] getSession THREW:', err?.message ?? err);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log('[useAuth] onAuthStateChange — event:', _event, '| session:', !!newSession);
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return error;
  }

  return { session, loading, user: session?.user ?? null, signIn, signUp, signOut, resetPassword };
}
