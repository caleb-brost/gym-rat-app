import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import type { Workout } from '../../types';
import { useActiveWorkout } from '../ActiveWorkoutProvider';
import type { ActiveWorkoutExercise, ActiveWorkoutSet } from '../types';

interface ActiveWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  templates: Workout[];
  exerciseOptions: Exercise[];
  exerciseOptionsLoading?: boolean;
}

const formatTime = (iso: string | undefined | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
};

const TemplateOptionCard: React.FC<{
  workout: Workout;
  onSelect: (workout: Workout) => void;
}> = ({ workout, onSelect }) => (
  <TouchableOpacity style={styles.templateCard} onPress={() => onSelect(workout)}>
    <View style={styles.templateHeader}>
      <Text style={styles.templateTitle}>{workout.name}</Text>
      <Text style={styles.templateMeta}>
        {workout.exercises.length} exercise{workout.exercises.length === 1 ? '' : 's'}
      </Text>
    </View>
    {workout.notes ? <Text style={styles.templateNotes}>{workout.notes}</Text> : null}
  </TouchableOpacity>
);

const SetRow: React.FC<{
  set: ActiveWorkoutSet;
  onChange: (key: 'reps' | 'weight', value: string) => void;
  onToggleComplete: () => void;
  onRemove: () => void;
}> = ({ set, onChange, onToggleComplete, onRemove }) => (
  <View style={[styles.setRow, set.completed && styles.setRowCompleted]}>
    <TouchableOpacity
      accessibilityRole="checkbox"
      style={[styles.checkButton, set.completed && styles.checkButtonActive]}
      onPress={onToggleComplete}
    >
      <Text style={[styles.checkMark, set.completed && styles.checkMarkActive]}>
        {set.completed ? '✓' : ''}
      </Text>
    </TouchableOpacity>
    <View style={styles.setFields}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Reps</Text>
        <TextInput
          value={set.reps}
          onChangeText={(text) => onChange('reps', text)}
          keyboardType="numeric"
          style={styles.textInput}
          placeholder="10"
        />
      </View>
      <View style={[styles.inputGroup, styles.inputGroupLast]}>
        <Text style={styles.inputLabel}>Weight</Text>
        <TextInput
          value={set.weight}
          onChangeText={(text) => onChange('weight', text)}
          keyboardType="numeric"
          style={styles.textInput}
          placeholder="135"
        />
      </View>
    </View>
    <TouchableOpacity onPress={onRemove} style={styles.removeSetButton}>
      <Text style={styles.removeSetText}>✕</Text>
    </TouchableOpacity>
  </View>
);

const ExerciseCard: React.FC<{
  exercise: ActiveWorkoutExercise;
  onAddSet: () => void;
  onRemove: () => void;
  onChangeSet: (setId: string, key: 'reps' | 'weight', value: string) => void;
  onToggleSet: (setId: string) => void;
  onRemoveSet: (setId: string) => void;
}> = ({ exercise, onAddSet, onRemove, onChangeSet, onToggleSet, onRemoveSet }) => (
  <View style={styles.exerciseCard}>
    <View style={styles.exerciseHeader}>
      <View>
        <Text style={styles.exerciseTitle}>{exercise.exerciseName}</Text>
        <Text style={styles.exerciseSubtitle}>
          {exercise.sets.length} set{exercise.sets.length === 1 ? '' : 's'}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove}>
        <Text style={styles.removeExerciseText}>Remove</Text>
      </TouchableOpacity>
    </View>

    {exercise.sets.map((set) => (
      <SetRow
        key={set.id}
        set={set}
        onChange={(key, value) => onChangeSet(set.id, key, value)}
        onToggleComplete={() => onToggleSet(set.id)}
        onRemove={() => onRemoveSet(set.id)}
      />
    ))}

    <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
      <Text style={styles.addSetText}>Add set</Text>
    </TouchableOpacity>
  </View>
);

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  visible,
  onClose,
  templates,
  exerciseOptions,
  exerciseOptionsLoading = false,
}) => {
  const {
    activeWorkout,
    isActive,
    startFromTemplate,
    startEmpty,
    updateName,
    updateNotes,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    toggleSetComplete,
    finishWorkout,
    resetWorkout,
  } = useActiveWorkout();
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPickerVisible(false);
    }
  }, [visible]);

  const templateCountText = useMemo(() => {
    if (!templates.length) return 'No templates yet';
    if (templates.length === 1) return '1 template available';
    return `${templates.length} templates available`;
  }, [templates.length]);

  const handleSelectTemplate = (workout: Workout) => {
    startFromTemplate(workout);
  };

  const handleAddExercise = (exercise: Exercise) => {
    addExercise(exercise);
    setPickerVisible(false);
  };

  const handleFinish = () => {
    finishWorkout();
    onClose();
  };

  const handleReset = () => {
    if (!activeWorkout) {
      return;
    }

    if (Platform.OS === 'web') {
      const shouldClear =
        typeof window !== 'undefined'
          ? window.confirm('Clear the active workout? This removes your progress.')
          : false;
      if (shouldClear) {
        resetWorkout();
      }
      return;
    }

    Alert.alert('Clear active workout?', 'This removes your current sets and notes.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: resetWorkout },
    ]);
  };

  const exerciseOptionsSorted = useMemo(
    () => [...exerciseOptions].sort((a, b) => a.name.localeCompare(b.name)),
    [exerciseOptions],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {isActive ? 'Active Workout' : 'Start a workout'}
              </Text>
              <Text style={styles.modalSubtitle}>{templateCountText}</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          {activeWorkout ? (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.section}>
                <Text style={styles.label}>Workout name</Text>
                <TextInput
                  style={styles.titleInput}
                  value={activeWorkout.name}
                  onChangeText={updateName}
                  placeholder="Leg day"
                />
              </View>
              <View style={styles.sectionRow}>
                <Text style={styles.metaText}>
                  Started {formatTime(activeWorkout.startedAt)}
                </Text>
                {activeWorkout.templateId ? (
                  <Text style={styles.templateBadge}>Template copy</Text>
                ) : null}
              </View>
              <View style={styles.section}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.notesInput, styles.card]}
                  value={activeWorkout.notes}
                  onChangeText={updateNotes}
                  placeholder="How's the session going?"
                  multiline
                />
              </View>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Exercises</Text>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setPickerVisible(true)}
                >
                  <Text style={styles.secondaryButtonText}>Add exercise</Text>
                </TouchableOpacity>
              </View>

              {activeWorkout.exercises.length === 0 ? (
                <View style={[styles.card, styles.emptyCard]}>
                  <Text style={styles.emptyText}>
                    No exercises yet. Add one to start logging sets.
                  </Text>
                </View>
              ) : (
                activeWorkout.exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onAddSet={() => addSet(exercise.id)}
                    onRemove={() => removeExercise(exercise.id)}
                    onChangeSet={(setId, key, value) => {
                      const change = key === 'reps' ? { reps: value } : { weight: value };
                      updateSet(exercise.id, setId, change);
                    }}
                    onToggleSet={(setId) => toggleSetComplete(exercise.id, setId)}
                    onRemoveSet={(setId) => removeSet(exercise.id, setId)}
                  />
                ))
              )}
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={[styles.card, styles.emptyCard]}>
                <Text style={styles.sectionTitle}>Start fresh</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => startEmpty()}>
                  <Text style={styles.primaryButtonText}>Start empty workout</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Or pick a template</Text>
              </View>
              {templates.length === 0 ? (
                <Text style={styles.emptyText}>No templates yet. Create one first.</Text>
              ) : (
                templates.map((workout) => (
                  <TemplateOptionCard
                    key={workout.id}
                    workout={workout}
                    onSelect={handleSelectTemplate}
                  />
                ))
              )}
            </ScrollView>
          )}

          <View style={styles.footerRow}>
            {isActive ? (
              <>
                <TouchableOpacity style={styles.ghostButton} onPress={handleReset}>
                  <Text style={styles.ghostButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
                  <Text style={styles.primaryButtonText}>Finish</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.secondaryButtonWide} onPress={onClose}>
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Add exercise</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
            {exerciseOptionsLoading ? (
              <View style={styles.pickerStatus}>
                <ActivityIndicator size="small" />
              </View>
            ) : exerciseOptionsSorted.length === 0 ? (
              <View style={styles.pickerStatus}>
                <Text style={styles.emptyText}>No exercises available.</Text>
              </View>
            ) : (
              <ScrollView style={styles.pickerList}>
                {exerciseOptionsSorted.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.pickerOption}
                    onPress={() => handleAddExercise(exercise)}
                  >
                    <Text style={styles.pickerOptionTitle}>{exercise.name}</Text>
                    <Text style={styles.pickerOptionMeta}>
                      {exercise.muscleGroups?.join(', ') || 'No muscles tagged'}
                    </Text>
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
    backgroundColor: '#f2f2f2',
    paddingTop: 36,
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  modalSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  closeText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    backgroundColor: '#fff',
    color: '#222',
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: 'top',
    padding: 12,
  },
  metaText: {
    color: '#777',
    fontSize: 13,
  },
  templateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#e7ebff',
    color: '#3c5cff',
    borderRadius: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyCard: {
    padding: 16,
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e4',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  templateMeta: {
    fontSize: 12,
    color: '#777',
  },
  templateNotes: {
    marginTop: 8,
    color: '#555',
    fontSize: 13,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 14,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  exerciseSubtitle: {
    color: '#777',
    marginTop: 2,
    fontSize: 12,
  },
  removeExerciseText: {
    color: '#d14343',
    fontWeight: '600',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  setRowCompleted: {
    backgroundColor: '#e9f6ef',
    borderColor: '#cbe7d7',
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkButtonActive: {
    backgroundColor: '#3c5cff',
    borderColor: '#3c5cff',
  },
  checkMark: {
    color: '#3c5cff',
    fontWeight: '700',
  },
  checkMarkActive: {
    color: '#fff',
  },
  setFields: {
    flex: 1,
    flexDirection: 'row',
  },
  inputGroup: {
    flex: 1,
    marginRight: 10,
  },
  inputGroupLast: {
    marginRight: 0,
  },
  inputLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    color: '#222',
  },
  removeSetButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  removeSetText: {
    color: '#d14343',
    fontWeight: '600',
    fontSize: 16,
  },
  addSetButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe4ff',
    backgroundColor: '#f5f7ff',
  },
  addSetText: {
    color: '#3c5cff',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dfe3eb',
    backgroundColor: '#fff',
  },
  secondaryButtonWide: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dfe3eb',
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#222',
    fontWeight: '600',
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  ghostButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e3e3e3',
    backgroundColor: '#f8f8f8',
  },
  ghostButtonText: {
    color: '#444',
    fontWeight: '600',
  },
  footerRow: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pickerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '80%',
    overflow: 'hidden',
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
    fontWeight: '700',
  },
  pickerStatus: {
    padding: 24,
    alignItems: 'center',
  },
  pickerList: {
    maxHeight: '75%',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f7f7f7',
  },
  pickerOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  pickerOptionMeta: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
});
