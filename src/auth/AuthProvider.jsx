import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AuthContext from './AuthContext';
import { describeAuthError, fetchProfileRow } from './profile';
import { getSupabase, supabase } from '../lib/supabaseClient';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  // True only while we restore a saved session when the app first opens.
  const [initializing, setInitializing] = useState(Boolean(supabase));
  // True while a profile request is in flight for a signed-in user.
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState('');

  const profileRef = useRef(null);
  const inflight = useRef(new Map());

  // Loads the profile once per user. If sign-in and the auth listener both ask at the
  // same moment they share one request instead of racing each other.
  const loadProfile = useCallback((user) => {
    if (!user) {
      profileRef.current = null;
      setProfile(null);
      return Promise.resolve(null);
    }
    const pending = inflight.current.get(user.id);
    if (pending) return pending;

    const request = fetchProfileRow(getSupabase(), user.id)
      .then((data) => {
        profileRef.current = data;
        setProfile(data);
        return data;
      })
      .finally(() => inflight.current.delete(user.id));
    inflight.current.set(user.id, request);
    return request;
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    // A session without a usable profile is no use to anyone, so end it and say why.
    async function rejectSession(profileError) {
      console.error('Could not load account profile:', profileError);
      if (!active) return;
      profileRef.current = null;
      setProfile(null);
      setError(describeAuthError(profileError));
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) console.error('Could not clear a session without a profile:', signOutError);
    }

    function syncProfile(user) {
      setProfileLoading(true);
      return loadProfile(user)
        .then(() => { if (active) setError(''); })
        .catch(rejectSession)
        .finally(() => { if (active) setProfileLoading(false); });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession?.user) {
        profileRef.current = null;
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      // Token refreshes and tab re-focus events fire this callback again for the same
      // user. Only fetch the profile when we do not already have it.
      if (profileRef.current?.id === nextSession.user.id) return;
      setProfileLoading(true);
      // Supabase asks us not to call its API from inside this callback, so defer.
      setTimeout(() => { if (active) syncProfile(nextSession.user); }, 0);
    });

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) throw sessionError;
      if (active && data.session) {
        setSession(data.session);
        return syncProfile(data.session.user);
      }
      return null;
    }).catch((sessionError) => {
      if (active) {
        console.error('Could not restore authentication session:', sessionError);
        setError('Your session could not be restored. Please sign in again.');
      }
    }).finally(() => {
      if (active) setInitializing(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email, password) => {
    const client = getSupabase();
    setError('');
    const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    try {
      const nextProfile = await loadProfile(data.user);
      return { session: data.session, profile: nextProfile };
    } catch (profileError) {
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) console.error('Could not clear a session without an account profile:', signOutError);
      throw profileError;
    }
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    const client = getSupabase();
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) throw signOutError;
  }, []);

  const value = useMemo(() => ({
    session,
    user: session?.user || null,
    profile,
    initializing,
    profileLoading,
    error,
    signIn,
    signOut,
    refreshProfile: loadProfile,
  }), [session, profile, initializing, profileLoading, error, signIn, signOut, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
