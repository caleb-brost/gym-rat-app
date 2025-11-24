import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthSession } from '@/features/auth/hooks';
import { useExercises } from '@/features/exercises/hooks';
import { WorkoutCard, WorkoutFormModal } from '@/features/workouts/components';
import { useWorkouts } from '@/features/workouts/hooks';
import type { Workout, WorkoutFormValues } from '@/features/workouts/types';
import { toWorkoutPayload } from '@/features/workouts/utils';
import { getSupabaseErrorMessage } from '@/lib/supabase/errors';

export default function WorkoutScreen() {
  const { userId, loading: authLoading } = useAuthSession();
  const {
    workouts,
    loading,
    error,
    creating,
    deletingId,
    refresh,
    createWorkout,
    deleteWorkout,
  } = useWorkouts(userId);
  const {
    exercises,
    loading: exerciseOptionsLoading,
    error: exerciseOptionsError,
  } = useExercises();

  const [modalVisible, setModalVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenModal = () => {
    setModalVisible(true);
    setFormError(null);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setFormError(null);
  };

  const handleSubmit = async (values: WorkoutFormValues) => {
    setFormError(null);

    try {
      const payload = toWorkoutPayload(values);
      await createWorkout(payload);
      setModalVisible(false);
    } catch (submitError) {
      setFormError(getSupabaseErrorMessage(submitError, 'Unable to save workout.'));
    }
  };

  const confirmDelete = (workout: Workout) => {
    if (Platform.OS === 'web') {
      const shouldDelete = typeof window !== 'undefined' ? window.confirm(`Delete ${workout.name}?`) : false;
      if (shouldDelete) {
        void deleteWorkout(workout.id);
      }
      return;
    }

    Alert.alert('Delete workout', `Delete ${workout.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deleteWorkout(workout.id) },
    ]);
  };

  const isBusy = loading || authLoading;

  const listContent = useMemo(() => {
    if (!userId && !authLoading) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>Sign in to create and manage workouts.</Text>
        </View>
      );
    }

    if (isBusy) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="small" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (workouts.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>No workouts yet. Create one to get started.</Text>
        </View>
      );
    }

    return (
      <View style={styles.listContent}>
        {workouts.map((workout) => (
          <WorkoutCard
            key={workout.id}
            workout={workout}
            deleting={deletingId === workout.id}
            onDelete={confirmDelete}
          />
        ))}
      </View>
    );
  }, [userId, authLoading, isBusy, error, workouts, refresh, deletingId]);

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Workouts</Text>
        <TouchableOpacity
          style={[styles.newButton, (!userId || creating) && styles.newButtonDisabled]}
          onPress={handleOpenModal}
          disabled={!userId || creating}
        >
          <Text style={styles.newButtonText}>{creating ? 'Saving...' : 'New workout'}</Text>
        </TouchableOpacity>
      </View>

      {exerciseOptionsError ? (
        <Text style={styles.warningText}>{exerciseOptionsError}</Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>{listContent}</ScrollView>

      <WorkoutFormModal
        visible={modalVisible}
        submitting={creating}
        error={formError}
        exerciseOptions={exercises}
        exerciseOptionsLoading={exerciseOptionsLoading}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonDisabled: {
    opacity: 0.5,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  warningText: {
    color: '#d97706',
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  listContent: {
    paddingBottom: 24,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  infoText: {
    color: '#555',
    fontSize: 15,
    textAlign: 'center',
  },
  errorText: {
    color: '#d14343',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
