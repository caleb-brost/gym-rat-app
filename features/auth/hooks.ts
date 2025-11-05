import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/db/supabaseClient';
import type { AuthState, SignInPayload, SignUpPayload } from './types';
import {
  ensureProfile,
  getCurrentSession,
  signIn,
  signOut,
  signUp,
  uploadAvatar,
} from './api';
import type { AvatarUploadInput } from './api';

const initialState: AuthState = {
  userId: null,
  email: null,
  username: null,
  avatarUrl: null,
  loading: true,
  error: null,
};

export const useAuthSession = () => {
  const [state, setState] = useState<AuthState>(initialState);

  const refresh = useCallback(async () => {
    console.log('[useAuthSession] refresh:start');
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const session = await getCurrentSession();
      console.log('[useAuthSession] refresh:session', session);
      setState({
        userId: session?.userId ?? null,
        email: session?.email ?? null,
        username: session?.username ?? null,
        avatarUrl: session?.avatarUrl ?? null,
        loading: false,
        error: null,
      });
      console.log('[useAuthSession] refresh:done');
    } catch (error) {
      console.log('[useAuthSession] refresh:error', error);
      setState({
        userId: null,
        email: null,
        username: null,
        avatarUrl: null,
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log('[useAuthSession] refresh:done (error)');
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void refresh();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[useAuthSession] onAuthStateChange', event, session?.user?.id);
      if (!isMounted) {
        return;
      }

      if (event === 'SIGNED_OUT') {
        console.log('[useAuthSession] handling SIGNED_OUT event');
        setState({ ...initialState, loading: false, error: null });
        return;
      }

      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          await refresh();
        } else {
          setState({ ...initialState, loading: false, error: null });
        }
        return;
      }

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        await refresh();
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [refresh]);

  const handleSignOut = useCallback(async () => {
    console.log('[useAuthSession] signOut:start');
    setState((prev) => ({ ...prev, loading: true, error: null }));

    let signOutError: unknown = null;
    try {
      await signOut();
    } catch (error) {
      signOutError = error;
      console.log('[useAuthSession] signOut:error', error);
    }

    setState({
      ...initialState,
      loading: false,
      error:
        signOutError instanceof Error
          ? signOutError.message
          : signOutError
          ? String(signOutError)
          : null,
    });
    console.log('[useAuthSession] signOut:done');
  }, []);

  return {
    ...state,
    signOut: handleSignOut,
    refresh,
  };
};

export const useAuthMutations = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = useCallback(async (payload: SignInPayload) => {
    setSubmitting(true);
    setError(null);

    try {
      return await signIn(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const handleSignUp = useCallback(async (payload: SignUpPayload) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await signUp(payload);
      const baseUsername =
        response.username ?? payload.email.split('@')[0]?.toLowerCase() ?? null;
      const profile = await ensureProfile({
        userId: response.userId,
        username: baseUsername,
        avatarUrl: response.avatarUrl,
      });

      return {
        ...response,
        username: profile.username,
        avatarUrl: profile.avatar_url,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    submitting,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
  };
};

export const useAvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (input: AvatarUploadInput) => {
      setUploading(true);
      setError(null);

      try {
        return await uploadAvatar(input);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  const resetError = useCallback(() => setError(null), []);

  return {
    upload,
    uploading,
    error,
    resetError,
  };
};
