import { supabase } from '@/db/supabaseClient';
import type { Database } from '@/types/supabase';
import { useAvatarUpload } from '@/features/auth/hooks';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useState } from 'react';

type UseProfileAvatarArgs = {
  userId: string | null;
  avatarUrl: string | null;
  refresh: () => Promise<void>;
};

type UserProfile = Database['public']['Tables']['users']['Row'] | null;

type UseProfileDetailsArgs = {
  userId: string | null;
};

const persistAvatarUrl = async (userId: string, avatarUrl: string) => {
  const { error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    return;
  }
};

const appendCacheBuster = (url: string, timestamp = Date.now()) => {
  if (url.includes('?v=') || url.includes('&v=')) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${timestamp}`;
};

export const useProfileDetails = ({ userId }: UseProfileDetailsArgs) => {
  const [profile, setProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .maybeSingle();

      if (supabaseError) {
        throw supabaseError;
      }

      let resolvedProfile = data;

      if (resolvedProfile) {
        if (!resolvedProfile.avatar_url || resolvedProfile.avatar_url.trim() === '') {
          const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(userId);

          if (publicUrlData?.publicUrl) {
            const cacheBustedUrl = appendCacheBuster(publicUrlData.publicUrl);
            resolvedProfile = {
              ...resolvedProfile,
              avatar_url: cacheBustedUrl,
            };

            await persistAvatarUrl(userId, cacheBustedUrl).catch(() => undefined);
          }
        } else if (
          !resolvedProfile.avatar_url.includes('?v=') &&
          !resolvedProfile.avatar_url.includes('&v=')
        ) {
          const cacheBustedUrl = appendCacheBuster(resolvedProfile.avatar_url);
          resolvedProfile = {
            ...resolvedProfile,
            avatar_url: cacheBustedUrl,
          };

          await persistAvatarUrl(userId, cacheBustedUrl).catch(() => undefined);
        }
      }

      setProfile(resolvedProfile);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
};

export const useProfileAvatar = ({
  userId,
  avatarUrl,
  refresh,
}: UseProfileAvatarArgs) => {
  const { upload, uploading, error: uploadError, resetError } = useAvatarUpload();
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLocalPreview(null);
      setPickerError(null);
    }
  }, [userId]);

  const currentAvatar = useMemo(
    () => localPreview ?? avatarUrl ?? null,
    [avatarUrl, localPreview],
  );

  const pickAvatar = useCallback(async () => {
    if (!userId) {
      return;
    }

    resetError();
    setPickerError(null);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setPickerError('Permission to access the photo library is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.uri) {
        setPickerError('Unable to read the selected image.');
        return;
      }

      setLocalPreview(asset.uri);

      const response = await upload({
        userId,
        uri: asset.uri,
        mimeType: asset.mimeType ?? undefined,
      });

      if (response?.avatarUrl) {
        setLocalPreview(response.avatarUrl);
      }

      await refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setPickerError(message);
      setLocalPreview(avatarUrl ?? null);
    }
  }, [avatarUrl, refresh, resetError, upload, userId]);

  const clearPickerError = useCallback(() => setPickerError(null), []);

  return {
    currentAvatar,
    pickAvatar,
    uploading,
    uploadError,
    pickerError,
    clearPickerError,
    canEdit: Boolean(userId),
  };
};

export type UseProfileAvatarReturn = ReturnType<typeof useProfileAvatar>;
