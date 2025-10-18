import { supabase } from '@/db/supabaseClient';
import type { Database } from '@/types/supabase';

import type { AuthResponse, SignInPayload, SignUpPayload } from './types';

type UsersRow = Database['public']['Tables']['users']['Row'];
type UsersInsert = Database['public']['Tables']['users']['Insert'];

const toAuthResponse = (
  user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>,
  profile: Pick<UsersRow, 'username' | 'avatar_url'> | null,
  sessionCreated: boolean,
): AuthResponse => ({
  userId: user.id,
  email: user.email ?? null,
  username: profile?.username ?? null,
  avatarUrl: profile?.avatar_url ?? null,
  sessionCreated,
});

const getProfile = async (
  userId: string,
): Promise<Pick<UsersRow, 'username' | 'avatar_url'> | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('username, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const signIn = async ({ email, password }: SignInPayload): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw error ?? new Error('Unable to sign in.');
  }

  const profile = await getProfile(data.user.id).catch(() => null);
  return toAuthResponse(data.user, profile, Boolean(data.session));
};

export const signUp = async ({ email, password }: SignUpPayload): Promise<AuthResponse> => {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    throw error ?? new Error('Unable to sign up.');
  }

  const profile = await getProfile(data.user.id).catch(() => null);
  return toAuthResponse(data.user, profile, Boolean(data.session));
};

export const getCurrentSession = async (): Promise<AuthResponse | null> => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  if (!session?.user) {
    return null;
  }

  const profile = await getProfile(session.user.id).catch(() => null);
  return toAuthResponse(session.user, profile, true);
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

interface EnsureProfileInput {
  userId: string;
  username?: string | null;
  avatarUrl?: string | null;
}

export const ensureProfile = async ({ userId, username, avatarUrl }: EnsureProfileInput) => {
  let effectiveUsername = username?.trim() ?? '';

  if (!effectiveUsername) {
    const existing = await getProfile(userId).catch(() => null);
    effectiveUsername = existing?.username ?? `user-${userId.slice(0, 8)}`;
  }

  const payload: UsersInsert = {
    id: userId,
    auth_id: userId,
    username: effectiveUsername,
    avatar_url: avatarUrl ?? null,
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'id' })
    .select('username, avatar_url')
    .single();

  if (error) {
    throw error;
  }

  return data as Pick<UsersRow, 'username' | 'avatar_url'>;
};

export interface AvatarUploadInput {
  userId: string;
  uri: string;
  mimeType?: string | null;
}

export const uploadAvatar = async ({ userId, uri, mimeType }: AvatarUploadInput) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const contentType = mimeType ?? blob.type ?? 'image/jpeg';
  const path = userId; // constrained by storage policies

  const bucket = supabase.storage.from('avatars');

  const { error: uploadError } = await bucket.upload(path, blob, {
    upsert: true,
    contentType,
    cacheControl: '3600',
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data: publicUrlData } = bucket.getPublicUrl(path);

  const profile = await ensureProfile({
    userId,
    avatarUrl: publicUrlData.publicUrl,
  });

  return {
    avatarUrl: publicUrlData.publicUrl,
    username: profile.username,
  };
};
