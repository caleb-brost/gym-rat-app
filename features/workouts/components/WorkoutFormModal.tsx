import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Exercise } from '@/features/exercises/types';
import type { WorkoutExerciseFormValues, WorkoutFormValues } from '../types';
import {
  createEmptyWorkoutExerciseForm,
  createEmptyWorkoutFormValues,
  createEmptyWorkoutSetForm,
} from '../utils';

interface WorkoutFormModalProps {
  visible: boolean;
  submitting: boolean;
  error?: string | null;
  exerciseOptions: Exercise[];
  exerciseOptionsLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: WorkoutFormValues) => Promise<void> | void;
}

export const WorkoutFormModal: React.FC<WorkoutFormModalProps> = ({
  visible,
  submitting,
  error,
  exerciseOptions,
  exerciseOptionsLoading = false,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<WorkoutFormValues>(createEmptyWorkoutFormValues());
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [pickerExerciseIndex, setPickerExerciseIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!visible) {
      setValues(createEmptyWorkoutFormValues());
      setFieldError(null);
      setPickerExerciseIndex(null);
    }
  }, [visible]);

  const handleAddExercise = () => {
    setValues((prev) => ({
      ...prev,
      exercises: [...prev.exercises, createEmptyWorkoutExerciseForm()],
    }));
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setValues((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((exercise) => exercise.tempId !== exerciseId),
    }));
  };

  const handleAddSet = (exerciseId: string) => {
    setValues((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => {
        if (exercise.tempId !== exerciseId) {
          return exercise;
        }
        return {
          ...exercise,
          sets: [...exercise.sets, createEmptyWorkoutSetForm(exercise.sets.length + 1)],
        };
      }),
    }));
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setValues((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => {
        if (exercise.tempId !== exerciseId) {
          return exercise;
        }
        const filteredSets = exercise.sets.filter((set) => set.tempId !== setId);
        return {
          ...exercise,
          sets: filteredSets.map((set, index) => ({
            ...set,
            setNumber: index + 1,
          })),
        };
      }),
    }));
  };

  const handleSetValueChange = (
    exerciseId: string,
    setId: string,
    key: 'reps' | 'weight',
    value: string,
  ) => {
    setValues((prev) => ({
      ...prev,
      exercises: prev.exercises.map((exercise) => {
        if (exercise.tempId !== exerciseId) {
          return exercise;
        }
        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.tempId === setId
              ? {
                  ...set,
                  [key]: value,
                }
              : set,
          ),
        };
      }),
    }));
  };

  const exercisePickerVisible = pickerExerciseIndex !== null;

  const sortedExerciseOptions = useMemo(
    () => [...exerciseOptions].sort((a, b) => a.name.localeCompare(b.name)),
    [exerciseOptions],
  );

  const handleSelectExercise = (exercise: Exercise) => {
    if (pickerExerciseIndex === null) {
      return;
    }

    setValues((prev) => ({
      ...prev,
      exercises: prev.exercises.map((item, index) =>
        index === pickerExerciseIndex
          ? { ...item, exerciseId: exercise.id, exerciseName: exercise.name }
          : item,
      ),
    }));
    setPickerExerciseIndex(null);
  };

  const readyExercises = values.exercises.filter((exercise) => !!exercise.exerciseId);

  const handleSubmit = async () => {
    if (!values.name.trim()) {
      setFieldError('Workout name is required.');
      return;
    }

    if (readyExercises.length === 0) {
      setFieldError('Add at least one exercise.');
      return;
    }

    setFieldError(null);
    await onSubmit(values);
  };

  const renderExercise = (exercise: WorkoutExerciseFormValues, index: number) => (
    <View key={exercise.tempId} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View>
          <Text style={styles.exerciseTitle}>Exercise {index + 1}</Text>
          <Text style={styles.exerciseSubtitle}>
            {exercise.exerciseName ?? 'No exercise selected'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleRemoveExercise(exercise.tempId)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.selectExerciseButton}
        onPress={() => setPickerExerciseIndex(index)}
      >
        <Text style={styles.selectExerciseButtonText}>
          {exercise.exerciseId ? 'Change exercise' : 'Choose exercise'}
        </Text>
      </TouchableOpacity>

      {exercise.sets.map((set) => (
        <View key={set.tempId} style={styles.setRow}>
          <Text style={styles.setLabel}>Set {set.setNumber}</Text>
          <View style={styles.setInputsRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reps</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={set.reps}
                onChangeText={(text) => handleSetValueChange(exercise.tempId, set.tempId, 'reps', text)}
                placeholder="10"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={set.weight}
                onChangeText={(text) =>
                  handleSetValueChange(exercise.tempId, set.tempId, 'weight', text)
                }
                placeholder="135"
              />
            </View>
            <TouchableOpacity
              style={styles.removeSetButton}
              onPress={() => handleRemoveSet(exercise.tempId, set.tempId)}
            >
              <Text style={styles.removeText}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addSetButton}
        onPress={() => handleAddSet(exercise.tempId)}
      >
        <Text style={styles.addSetText}>Add set</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Workout</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Workout name</Text>
              <TextInput
                style={styles.textInput}
                value={values.name}
                onChangeText={(text) =>
                  setValues((prev) => ({
                    ...prev,
                    name: text,
                  }))
                }
                placeholder="Leg day"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={values.notes}
                onChangeText={(text) =>
                  setValues((prev) => ({
                    ...prev,
                    notes: text,
                  }))
                }
                placeholder="Optional notes"
                multiline
              />
            </View>

            <View style={styles.exercisesHeaderRow}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <TouchableOpacity style={styles.addExerciseButton} onPress={handleAddExercise}>
                <Text style={styles.addExerciseText}>Add exercise</Text>
              </TouchableOpacity>
            </View>

            {values.exercises.length === 0 ? (
              <Text style={styles.emptyHint}>Add exercises to build your workout.</Text>
            ) : (
              values.exercises.map(renderExercise)
            )}

            {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.primaryButtonText}>
                {submitting ? 'Saving...' : 'Save Workout'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={exercisePickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerExerciseIndex(null)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Choose exercise</Text>
              <TouchableOpacity onPress={() => setPickerExerciseIndex(null)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>

            {exerciseOptionsLoading ? (
              <View style={styles.pickerStatus}>
                <ActivityIndicator size="small" />
              </View>
            ) : sortedExerciseOptions.length === 0 ? (
              <View style={styles.pickerStatus}>
                <Text style={styles.emptyHint}>No exercises available.</Text>
              </View>
            ) : (
              <ScrollView>
                {sortedExerciseOptions.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.pickerOption}
                    onPress={() => handleSelectExercise(exercise)}
                  >
                    <Text style={styles.pickerOptionText}>{exercise.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 48,
  },
  modalHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  closeText: {
    color: '#007AFF',
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  exercisesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExerciseButton: {
    backgroundColor: '#f0f4ff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addExerciseText: {
    color: '#3155ff',
    fontWeight: '500',
  },
  exerciseCard: {
    borderWidth: 1,
    borderColor: '#e3e3e3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseSubtitle: {
    color: '#666',
    marginTop: 2,
  },
  removeText: {
    color: '#d14343',
    fontWeight: '500',
  },
  selectExerciseButton: {
    borderWidth: 1,
    borderColor: '#c1c9ff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  selectExerciseButtonText: {
    color: '#3155ff',
    fontWeight: '500',
  },
  setRow: {
    marginBottom: 12,
  },
  setLabel: {
    fontWeight: '500',
    marginBottom: 6,
  },
  setInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    flex: 1,
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  removeSetButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5ff',
  },
  addSetText: {
    color: '#3155ff',
    fontWeight: '500',
  },
  footerRow: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#555',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#777',
    fontSize: 14,
    marginBottom: 16,
  },
  errorText: {
    color: '#d14343',
    marginTop: 8,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerStatus: {
    padding: 24,
    alignItems: 'center',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  pickerOptionText: {
    fontSize: 16,
  },
});
