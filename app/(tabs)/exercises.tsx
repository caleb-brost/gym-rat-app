import { ExerciseFormModal, ExerciseSearch } from '@/features/exercises/components';
import { useExercises } from '@/features/exercises/hooks';
import type { Exercise } from '@/features/exercises/types';
import { toExercisePayload } from '@/features/exercises/utils';
import { getSupabaseErrorMessage } from '@/lib/supabase/errors';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const emptyStateMessage = 'No exercises found yet. Create one to get started.';

type ModalState =
  | { visible: false }
  | { visible: true; mode: 'create'; exercise: null }
  | { visible: true; mode: 'edit'; exercise: Exercise };

const initialModalState: ModalState = { visible: false };

export default function ExercisesScreen() {
  const {
    exercises,
    loading,
    error,
    creating,
    updatingId,
    deletingId,
    createExercise,
    updateExercise,
    deleteExercise,
  } = useExercises();

  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [modalError, setModalError] = useState<string | null>(null);

  const selectedExercise = useMemo(
    () => (modalState.visible && modalState.mode === 'edit' ? modalState.exercise : null),
    [modalState],
  );

  const isSubmitting = useMemo(() => {
    if (!modalState.visible) {
      return false;
    }

    if (modalState.mode === 'create') {
      return creating;
    }

    return selectedExercise ? updatingId === selectedExercise.id : false;
  }, [modalState, creating, updatingId, selectedExercise]);

  const isDeleting = useMemo(() => {
    if (!modalState.visible || modalState.mode !== 'edit' || !selectedExercise) {
      return false;
    }
    return deletingId === selectedExercise.id;
  }, [modalState, deletingId, selectedExercise]);

  const closeModal = () => {
    setModalState(initialModalState);
    setModalError(null);
  };

  const handleNewExercise = () => {
    setModalState({ visible: true, mode: 'create', exercise: null });
    setModalError(null);
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setModalState({ visible: true, mode: 'edit', exercise });
    setModalError(null);
  };

  const handleSubmit = async (values: {
    name: string;
    category: string;
    targetMuscles: string[];
    equipment: string[];
    notes: string;
  }) => {
    setModalError(null);

    const payload = toExercisePayload(values, {
      includeEmpty: modalState.visible && modalState.mode === 'edit',
    });

    try {
      if (modalState.visible && modalState.mode === 'edit' && modalState.exercise) {
        await updateExercise(modalState.exercise.id, payload);
      } else {
        await createExercise(payload);
      }

      closeModal();
    } catch (submitError) {
      setModalError(getSupabaseErrorMessage(submitError, 'Unable to save exercise.'));
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedExercise) {
      return;
    }

    if (Platform.OS === 'web') {
      handleDelete();
      return;
    }

    Alert.alert(
      'Delete exercise',
      `Are you sure you want to delete "${selectedExercise.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
    );
  };

  const handleDelete = async () => {
    if (!selectedExercise) {
      return;
    }

    setModalError(null);

    try {
      await deleteExercise(selectedExercise.id);
      closeModal();
    } catch (deleteError) {
      setModalError(getSupabaseErrorMessage(deleteError, 'Unable to delete exercise.'));
    }
  };

  let content: React.ReactNode = null;

  if (loading) {
    content = (
      <View style={styles.centerContent}>
        <ActivityIndicator size="small" />
      </View>
    );
  } else if (error) {
    content = (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  } else if (exercises.length === 0) {
    content = (
      <View style={styles.centerContent}>
        <Text style={styles.emptyText}>{emptyStateMessage}</Text>
      </View>
    );
  } else {
    content = <ExerciseSearch exercises={exercises} onSelect={handleSelectExercise} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.newButton} onPress={handleNewExercise}>
          <Text style={styles.buttonText}>New</Text>
        </TouchableOpacity>
      </View>

      {content}

      <ExerciseFormModal
        visible={modalState.visible}
        mode={modalState.visible ? modalState.mode : 'create'}
        initialExercise={selectedExercise ?? undefined}
        submitting={isSubmitting}
        deleting={isDeleting}
        error={modalError}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onDelete={modalState.visible && modalState.mode === 'edit' ? handleConfirmDelete : undefined}
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
    marginTop: 10,
    marginRight: 10,
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d14343',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
