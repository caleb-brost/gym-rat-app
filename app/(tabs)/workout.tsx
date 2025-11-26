import { useAuthSession } from '@/features/auth/hooks';
import { useExercises } from '@/features/exercises/hooks';
import { WorkoutFormModal, WorkoutSearch } from '@/features/workouts/components';
import { useWorkouts } from '@/features/workouts/hooks';
import type { Workout, WorkoutFormValues } from '@/features/workouts/types';
import { toWorkoutPayload } from '@/features/workouts/utils';
import { getSupabaseErrorMessage } from '@/lib/supabase/errors';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

  const confirmDelete = useCallback(
    (workout: Workout) => {
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
    },
    [deleteWorkout],
  );

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
      <WorkoutSearch workouts={workouts} deletingId={deletingId} onDelete={confirmDelete} />
    );
  }, [authLoading, deletingId, error, isBusy, refresh, userId, workouts, confirmDelete]);

  return (
    <View style={styles.root}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.newButton, (!userId || creating) && styles.newButtonDisabled]}
          onPress={handleOpenModal}
          disabled={!userId || creating}
        >
          <Text style={styles.buttonText}>{creating ? 'Saving...' : 'New'}</Text>
        </TouchableOpacity>
      </View>

      {exerciseOptionsError ? (
        <Text style={styles.warningText}>{exerciseOptionsError}</Text>
      ) : null}

      {listContent}

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
    backgroundColor: '#f2f2f2',
    paddingTop: 10,
    paddingHorizontal: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    marginRight: 10,
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  newButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  warningText: {
    color: '#d14343',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#d14343',
    fontSize: 14,
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
