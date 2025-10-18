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
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const session = await getCurrentSession();
      setState({
        userId: session?.userId ?? null,
        email: session?.email ?? null,
        username: session?.username ?? null,
        avatarUrl: session?.avatarUrl ?? null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        userId: null,
        email: null,
        username: null,
        avatarUrl: null,
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void refresh();

    const { data: subscription } = supabase.auth.onAuthStateChange(async () => {
      if (!isMounted) {
        return;
      }

      await refresh();
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [refresh]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setState({ ...initialState, loading: false });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : String(error),
      }));
    }
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
