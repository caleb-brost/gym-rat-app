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
import type {
  ExerciseCategory,
  ExerciseMuscleGroup,
  ExerciseType,
} from '../types';
import { ExerciseCatagorySelect } from './ExerciseCatagorySelect';

const CATEGORY_OPTIONS: ExerciseCategory[] = [
  'Push',
  'Pull',
  'Legs',
  'Mobility',
  'Cardio',
  'Other',
];

const TYPE_OPTIONS: Array<{ label: string; value: ExerciseType }> = [
  { label: 'Weight', value: 'weight' },
  { label: 'Time', value: 'time' },
  { label: 'Distance', value: 'distance' },
];

const MUSCLES_OPTIONS: ExerciseMuscleGroup[] = [
  'Chest',
  'Back',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Shoulders',
  'Rear Deltoids',
  'Traps',
  'Biceps',
  'Triceps',
  'Calves',
  'Core',
  'Forearms',
];

type EquipmentOption = { label: string; value: string };

interface ExerciseEditTabProps {
  name: string;
  category: ExerciseCategory | '';
  type: ExerciseType;
  muscleGroups: ExerciseMuscleGroup[];
  equipmentId: string | null;
  equipmentOptions: EquipmentOption[];
  description: string;
  fieldError?: string | null;
  submitError?: string | null;
  mode: 'create' | 'edit';
  submitting: boolean;
  deleting: boolean;
  canEdit?: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onChangeName: (value: string) => void;
  onChangeCategory: (value: ExerciseCategory | '') => void;
  onChangeType: (value: ExerciseType) => void;
  onChangeMuscleGroups: (value: ExerciseMuscleGroup[]) => void;
  onChangeEquipmentId: (value: string | null) => void;
  onChangeDescription: (value: string) => void;
}

export const ExerciseEditTab: React.FC<ExerciseEditTabProps> = ({
  name,
  category,
  type,
  muscleGroups,
  equipmentId,
  equipmentOptions,
  description,
  fieldError,
  submitError,
  mode,
  submitting,
  deleting,
  canEdit = true,
  onCancel,
  onSubmit,
  onDelete,
  onChangeName,
  onChangeCategory,
  onChangeType,
  onChangeMuscleGroups,
  onChangeEquipmentId,
  onChangeDescription,
}) => {
  const equipmentSelectOptions: EquipmentOption[] =
    equipmentOptions.length > 0
      ? equipmentOptions
      : [];

  const hasEquipmentChoices = equipmentSelectOptions.length > 0;

  return (
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
              placeholderTextColor="#999"
              returnKeyType="next"
            />
          </View>
          <View style={styles.fieldGroup}>
            <ExerciseCatagorySelect
              value={category}
              onSelect={(value) => onChangeCategory(value as ExerciseCategory | '')}
              onClear={() => onChangeCategory('')}
              options={CATEGORY_OPTIONS}
              label="Category"
              disabled={submitting}
            />
          </View>
          <View style={styles.fieldGroup}>
            <ExerciseCatagorySelect
              value={type}
              onSelect={(value) => onChangeType(value as ExerciseType)}
              options={TYPE_OPTIONS}
              label="Exercise Type"
              allowClear={false}
              disabled={submitting}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.fieldGroup}>
            <ExerciseCatagorySelect
              multiSelect
              value={muscleGroups}
              onSelect={(values) =>
                onChangeMuscleGroups(values as ExerciseMuscleGroup[])
              }
              onClear={() => onChangeMuscleGroups([])}
              options={MUSCLES_OPTIONS}
              label="Muscle Groups"
              disabled={submitting}
            />
          </View>

          <View style={styles.fieldGroup}>
            <ExerciseCatagorySelect
              value={equipmentId ?? ''}
              onSelect={(value) =>
                onChangeEquipmentId(value.trim().length > 0 ? value : null)
              }
              onClear={() => onChangeEquipmentId(null)}
              options={equipmentSelectOptions}
              label="Equipment"
              disabled={submitting || !hasEquipmentChoices}
            />
            {!hasEquipmentChoices ? (
              <Text style={styles.helperText}>
                No equipment added yet. Create equipment in Supabase to enable selection.
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.fieldGroup}>
            <Text style={styles.sectionTitle}>Description</Text>

            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Coaching Notes</Text>
              <Text style={[styles.badge, styles.optionalBadge]}>Optional</Text>
            </View>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={onChangeDescription}
              autoCapitalize="sentences"
              placeholder="Add setup cues, tempo, or progressions."
              placeholderTextColor="#999"
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
            style={[
              styles.actionButton,
              styles.deleteButton,
              (!canEdit || submitting || deleting) && styles.disabledButton,
            ]}
            onPress={() => onDelete?.()}
            disabled={submitting || deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>
                Delete{!canEdit ? ' 🔒' : ''}
              </Text>
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
};

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
  descriptionInput: {
    minHeight: 120,
  },
  formError: {
    color: '#d14343',
    fontSize: 13,
    marginBottom: 12,
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
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
