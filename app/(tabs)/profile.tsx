import { useAuthSession } from '@/features/auth/hooks';
import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { email, userId, username, loading, error, signOut } = useAuthSession();

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.buttonContainer}>
        {email ? (
          <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
            <Text style={styles.signOutLabel}>Sign out</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {email ? (
        <View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{username ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          {userId ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID</Text>
              <Text style={styles.infoValue}>{userId}</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      ) : (
        <View>
          <Text style={styles.subtitle}>You are not signed in.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Link href="/sign-in" style={styles.link}>
            Go to sign-in
          </Link>
          <Link href="/sign-up" style={styles.linkSecondary}>
            Create an account
          </Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 10,
    paddingHorizontal: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
    buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginRight: 10,
  },
  signOutButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  signOutLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#777',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#222',
  },
  error: {
    color: '#d14343',
    marginBottom: 12,
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    marginBottom: 8,
  },
  linkSecondary: {
    color: '#555',
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
