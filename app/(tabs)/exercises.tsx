import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ExerciseSearch } from '@/features/exercises/components/ExerciseSearch';
import { getSupabaseErrorMessage } from '@/lib/supabase/errors';
import { useExercises } from '@/features/exercises/hooks';
import type { Exercise, NewExercisePayload } from '@/features/exercises/types';

const parseMuscles = (value: string) =>
  value
    .split(',')
    .map((muscle) => muscle.trim())
    .filter(Boolean);

const defaultExerciseMessage = 'No exercises found yet. Create one to get started.';

export default function ExercisesScreen() {
  const { exercises, loading, error, creating, createExercise } = useExercises();
  const [isModalVisible, setModalVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formMuscles, setFormMuscles] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formGlobalError, setFormGlobalError] = useState<string | null>(null);

  const resetForm = () => {
    setFormName('');
    setFormCategory('');
    setFormMuscles('');
    setFormError(null);
    setFormGlobalError(null);
  };

  const closeModal = () => {
    if (creating) {
      return;
    }

    setModalVisible(false);
    resetForm();
  };

  const handleNewExercise = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleSelect = (exercise: Exercise) => {
    console.log('Selected exercise:', exercise.name);
  };

  const handleCreateExercise = async () => {
    const name = formName.trim();

    if (!name) {
      setFormError('Name is required.');
      return;
    }

    const category = formCategory.trim();
    const targetMuscles = parseMuscles(formMuscles);

    setFormError(null);
    setFormGlobalError(null);

    const payload: NewExercisePayload = {
      name,
      category: category || undefined,
      targetMuscles: targetMuscles.length > 0 ? targetMuscles : undefined,
    };

    try {
      await createExercise(payload);
      setModalVisible(false);
      resetForm();
    } catch (createError) {
      setFormGlobalError(getSupabaseErrorMessage(createError, 'Unable to create exercise.'));
    }
  };

  let content: React.ReactNode;

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
        <Text style={styles.emptyText}>{defaultExerciseMessage}</Text>
      </View>
    );
  } else {
    content = <ExerciseSearch exercises={exercises} onSelect={handleSelect} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.newButton} onPress={handleNewExercise}>
          <Text style={styles.buttonText}>New</Text>
        </TouchableOpacity>
      </View>

      {content}

      <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalKeyboard}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>New Exercise</Text>

              <TextInput
                style={styles.input}
                placeholder="Name"
                value={formName}
                onChangeText={setFormName}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                placeholder="Category (optional)"
                value={formCategory}
                onChangeText={setFormCategory}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Target muscles (comma separated)"
                value={formMuscles}
                onChangeText={setFormMuscles}
                multiline
              />

              {formError ? <Text style={styles.formError}>{formError}</Text> : null}
              {formGlobalError ? (
                <Text style={styles.formError}>{formGlobalError}</Text>
              ) : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={closeModal}
                  disabled={creating}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.saveButton,
                    creating && styles.disabledButton,
                  ]}
                  onPress={handleCreateExercise}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
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
    color: 'white',
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
  modalKeyboard: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: '#222',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formError: {
    color: '#d14343',
    fontSize: 13,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
