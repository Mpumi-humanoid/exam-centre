import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthContext from './AuthContext';
import { getSupabase, supabase } from '../lib/supabaseClient';
import { ProfileError, describeAuthError, fetchProfileRow } from './profile';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState('');

  const loadProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return null;
    }
    const client = getSupabase();
    const data = await fetchProfileRow(client, user.id);
    if (data.is_active === false) {
      // Deactivated by an admin: end the session and explain why.
      await client.auth.signOut();
      throw new ProfileError('ACCOUNT_INACTIVE', 'This account has been deactivated.');
    }
    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setError('');
      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      Promise.resolve().then(() => loadProfile(nextSession.user)).catch((profileError) => {
        if (active) {
          console.error('Could not load account profile:', profileError);
          setProfile(null);
          setError(describeAuthError(profileError));
        }
      }).finally(() => {
        if (active) setLoading(false);
      });
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) throw sessionError;
      if (active && data.session) {
        setSession(data.session);
        return loadProfile(data.session.user);
      }
      return null;
    }).catch((sessionError) => {
      if (active) {
        console.error('Could not restore authentication session:', sessionError);
        setError(sessionError instanceof ProfileError
          ? describeAuthError(sessionError)
          : 'Your session could not be restored. Please sign in again.');
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email, password) => {
    const client = getSupabase();
    const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    let nextProfile;
    try {
      nextProfile = await loadProfile(data.user);
    } catch (profileError) {
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) console.error('Could not clear a session without an account profile:', signOutError);
      throw profileError;
    }
    return { session: data.session, profile: nextProfile };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    const client = getSupabase();
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) throw signOutError;
  }, []);

  const value = useMemo(() => ({
    session, user: session?.user || null, profile, loading, error, signIn, signOut, refreshProfile: loadProfile,
  }), [session, profile, loading, error, signIn, signOut, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
