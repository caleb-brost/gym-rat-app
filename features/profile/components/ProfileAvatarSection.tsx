import React from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { profileStyles } from '../styles';

type ProfileAvatarSectionProps = {
  currentAvatar: string | null;
  pickAvatar: () => void | Promise<void>;
  canEdit: boolean;
  uploading: boolean;
  pickerError: string | null;
  uploadError: string | null;
};

export const ProfileAvatarSection = ({
  currentAvatar,
  pickAvatar,
  canEdit,
  uploading,
  pickerError,
  uploadError,
}: ProfileAvatarSectionProps) => {
  const disabled = !canEdit || uploading;

  return (
    <View style={profileStyles.avatarSection}>
      <TouchableOpacity
        onPress={pickAvatar}
        disabled={disabled}
        style={[
          profileStyles.avatarButton,
          !currentAvatar && profileStyles.avatarPlaceholder,
        ]}
        activeOpacity={0.8}
      >
        {currentAvatar ? (
          <Image source={{ uri: currentAvatar }} style={profileStyles.avatarImage} />
        ) : (
          <Text style={profileStyles.avatarPlaceholderLabel}>Add photo</Text>
        )}
        <View style={profileStyles.avatarOverlay}>
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={profileStyles.avatarOverlayLabel}>
              {currentAvatar ? 'Change' : 'Upload'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <Text style={profileStyles.avatarHint}>
        Tap to {currentAvatar ? 'change' : 'add'} your profile photo.
      </Text>
      {pickerError ? <Text style={profileStyles.error}>{pickerError}</Text> : null}
      {uploadError ? <Text style={profileStyles.error}>{uploadError}</Text> : null}
    </View>
  );
};
