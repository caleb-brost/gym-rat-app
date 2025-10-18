import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ExerciseCatagorySelect } from './ExerciseCatagorySelect';

const CATEGORY_OPTIONS = [
  'Push',
  'Pull',
  'Legs',
  'Mobility',
  'Cardio',
  'Other',
];

const EQUIPMENT_OPTIONS = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Smith Machine',
  'Kettlebell',
  'Bodyweight',
  'Resistance Band',
  'Other',
];

const MUSCLES_OPTIONS = [
  'Chest',
  'Back',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Calves',
  'Core',
  'Forearms',
];

interface ExerciseEditTabProps {
  name: string;
  category: string;
  muscles: string[];
  equipment: string;
  notes: string;
  fieldError?: string | null;
  submitError?: string | null;
  mode: 'create' | 'edit';
  submitting: boolean;
  deleting: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onChangeName: (value: string) => void;
  onChangeCategory: (value: string) => void;
  onChangeMuscles: (value: string[]) => void;
  onChangeEquipment: (value: string) => void;
  onChangeNotes: (value: string) => void;
}

export const ExerciseEditTab: React.FC<ExerciseEditTabProps> = ({
  name,
  category,
  muscles,
  equipment,
  notes,
  fieldError,
  submitError,
  mode,
  submitting,
  deleting,
  onCancel,
  onSubmit,
  onDelete,
  onChangeName,
  onChangeCategory,
  onChangeMuscles,
  onChangeEquipment,
  onChangeNotes,
}) => (
  <View style={styles.container}>
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basics</Text>
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Name</Text>
            <Text style={[styles.badge, styles.requiredBadge]}>Required</Text>
          </View>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={onChangeName}
            autoCapitalize="words"
            placeholder="e.g. Bench Press"
            placeholderTextColor={'#999'}
            returnKeyType="next"
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.fieldGroup}>
          <ExerciseCatagorySelect
            value={category}
            onSelect={onChangeCategory}
            onClear={() => onChangeCategory('')}
            options={CATEGORY_OPTIONS}
            label="Category"
            disabled={submitting}
          />
        </View>
        <View style={styles.fieldGroup}>
          <ExerciseCatagorySelect
            multiSelect
            value={muscles}
            onSelect={onChangeMuscles}
            onClear={() => onChangeMuscles([])}
            options={MUSCLES_OPTIONS}
            label="Muscle Groups"
            disabled={submitting}
          />
        </View>

        <View style={styles.fieldGroup}>
          <ExerciseCatagorySelect
            value={equipment}
            onSelect={onChangeEquipment}
            onClear={() => onChangeEquipment('')}
            options={EQUIPMENT_OPTIONS}
            label="Equipment"
            disabled={submitting}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.fieldGroup}>
          <Text style={styles.sectionTitle}>Notes</Text>

          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Coaching Notes</Text>
            <Text style={[styles.badge, styles.optionalBadge]}>Optional</Text>
          </View>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={onChangeNotes}
            autoCapitalize="sentences"
            placeholder="Add setup cues, tempo, or progressions."
            placeholderTextColor={'#999'}
            multiline
          />
        </View>
      </View>

      {fieldError ? <Text style={styles.formError}>{fieldError}</Text> : null}
      {submitError ? <Text style={styles.formError}>{submitError}</Text> : null}
    </ScrollView>

    <View style={styles.actionsRow}>
      {mode === 'edit' && onDelete ? (
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete?.()}
          disabled={submitting || deleting}
        >
          {deleting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.actionPlaceholder} />
      )}
      <TouchableOpacity
        style={[styles.actionButton, styles.cancelButton]}
        onPress={onCancel}
        disabled={submitting}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.actionButton,
          styles.saveButton,
          submitting && styles.disabledButton,
        ]}
        onPress={() => onSubmit()}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
    marginBottom: 16,
  },
  formContent: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  badge: {
    marginLeft: 8,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  requiredBadge: {
    color: '#c01f1f',
    backgroundColor: '#fde8e8',
  },
  optionalBadge: {
    color: '#666',
    backgroundColor: '#f1f1f1',
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
  notesInput: {
    minHeight: 120,
  },
  formError: {
    color: '#d14343',
    fontSize: 13,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
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
  deleteButton: {
    backgroundColor: '#d14343',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionPlaceholder: {
    width: 88,
  },
});
