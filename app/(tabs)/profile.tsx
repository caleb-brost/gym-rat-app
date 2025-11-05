import { useAuthSession } from '@/features/auth/hooks';
import { ProfileAvatarSection } from '@/features/profile/components/ProfileAvatarSection';
import { useProfileAvatar, useProfileDetails } from '@/features/profile/hooks';
import { profileStyles } from '@/features/profile/styles';
import { Link } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const {
    email,
    userId,
    username,
    avatarUrl,
    loading,
    error,
    signOut,
    refresh,
  } = useAuthSession();
  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refresh: refreshProfile,
  } = useProfileDetails({ userId });

  const combinedRefresh = useCallback(async () => {
    await refresh();
    await refreshProfile();
  }, [refresh, refreshProfile]);

  const effectiveAvatarUrl = profile?.avatar_url ?? avatarUrl;

  const {
    currentAvatar,
    pickAvatar,
    uploading,
    uploadError,
    pickerError,
    canEdit,
  } = useProfileAvatar({
    userId,
    avatarUrl: effectiveAvatarUrl,
    refresh: combinedRefresh,
  });

  if (pickerError) console.log("This is the error:", pickerError);

  if (loading || profileLoading) {
    return (
      <View style={profileStyles.centerContent}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={profileStyles.root}>
      <View style={profileStyles.buttonContainer}>
        {email ? (
          <TouchableOpacity onPress={signOut} style={profileStyles.signOutButton}>
            <Text style={profileStyles.signOutLabel}>Sign out</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {email ? (
        <View>
          <ProfileAvatarSection
            currentAvatar={currentAvatar}
            pickAvatar={pickAvatar}
            canEdit={canEdit}
            uploading={uploading}
            pickerError={pickerError}
            uploadError={uploadError}
          />
          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Username</Text>
            <Text style={profileStyles.infoValue}>{profile?.username ?? username ?? '—'}</Text>
          </View>
          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Email</Text>
            <Text style={profileStyles.infoValue}>{email}</Text>
          </View>
          {userId ? (
            <View style={profileStyles.infoRow}>
              <Text style={profileStyles.infoLabel}>User ID</Text>
              <Text style={profileStyles.infoValue}>{userId}</Text>
            </View>
          ) : null}
          {profile?.created_at ? (
            <View style={profileStyles.infoRow}>
              <Text style={profileStyles.infoLabel}>Joined</Text>
              <Text style={profileStyles.infoValue}>
                {new Date(profile.created_at).toLocaleString()}
              </Text>
            </View>
          ) : null}
          {error ? <Text style={profileStyles.error}>{error}</Text> : null}
          {profileError ? <Text style={profileStyles.error}>{profileError}</Text> : null}
        </View>
      ) : (
        <View>
          <Text style={profileStyles.subtitle}>You are not signed in.</Text>
          {error ? <Text style={profileStyles.error}>{error}</Text> : null}
          <Link href="/sign-in" style={profileStyles.link}>
            Go to sign-in
          </Link>
          <Link href="/sign-up" style={profileStyles.linkSecondary}>
            Create an account
          </Link>
        </View>
      )}
    </View>
  );
}
