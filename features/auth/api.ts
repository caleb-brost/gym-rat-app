import { supabase } from '@/db/supabaseClient';
import type { Database } from '@/types/supabase';

import type { AuthResponse, SignInPayload, SignUpPayload } from './types';

type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];

const persistAvatarUrl = async (userId: string, avatarUrl: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    throw error;
  }
};

const appendCacheBuster = (url: string, timestamp = Date.now()) => {
  if (url.includes('?v=') || url.includes('&v=')) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
};

const toAuthResponse = (
  user: NonNullable<Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user']>,
  profile: Pick<ProfilesRow, 'username' | 'avatar_url' | 'created_at'> | null,
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
): Promise<Pick<ProfilesRow, 'username' | 'avatar_url' | 'created_at'> | null> => {
  console.log('[auth/api] getProfile', userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  let profile = data;

  if (profile) {
    if (!profile.avatar_url || profile.avatar_url.trim() === '') {
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(userId);

      if (publicUrlData?.publicUrl) {
        const cacheBustedUrl = appendCacheBuster(publicUrlData.publicUrl);

        profile = {
          ...profile,
          avatar_url: cacheBustedUrl,
        };

        await persistAvatarUrl(userId, cacheBustedUrl).catch(() => undefined);
      }
    } else if (!profile.avatar_url.includes('?v=') && !profile.avatar_url.includes('&v=')) {
      const cacheBustedUrl = appendCacheBuster(profile.avatar_url);
      profile = {
        ...profile,
        avatar_url: cacheBustedUrl,
      };

      await persistAvatarUrl(userId, cacheBustedUrl).catch(() => undefined);
    }
  }

  return profile;
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
  console.log('[auth/api] signOut:start');
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error && error.message !== 'Auth session missing!') {
    console.log('[auth/api] signOut:error', error);
    throw error;
  }
  console.log('[auth/api] signOut:done', error?.message);
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

  const payload: ProfilesInsert = {
    id: userId,
    username: effectiveUsername,
    avatar_url: avatarUrl ?? null,
  };

  const { data: existing, error: lookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: payload.username,
        avatar_url: payload.avatar_url ?? null,
      })
      .eq('id', userId)
      .select('username, avatar_url, created_at');

    if (error) {
      throw error;
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (row) {
      return row as Pick<ProfilesRow, 'username' | 'avatar_url' | 'created_at'>;
    }

    const profile = await getProfile(userId).catch(() => null);
    if (profile) {
      return profile;
    }

    throw new Error('Unable to update user profile.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert(payload)
    .select('username, avatar_url, created_at');

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (row) {
    return row as Pick<ProfilesRow, 'username' | 'avatar_url' | 'created_at'>;
  }

  const profile = await getProfile(userId).catch(() => null);
  if (profile) {
    return profile;
  }

  throw new Error('Unable to create user profile.');
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
  const publicUrlWithVersion = appendCacheBuster(publicUrlData.publicUrl);

  const profile = await ensureProfile({
    userId,
    avatarUrl: publicUrlWithVersion,
  });

  return {
    avatarUrl: publicUrlWithVersion,
    username: profile.username,
  };
};
