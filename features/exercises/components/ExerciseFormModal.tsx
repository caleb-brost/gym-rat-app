import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  Equipment,
  Exercise,
  ExerciseCategory,
  ExerciseMuscleGroup,
  ExerciseType,
} from '../types';
import type { ExerciseFormValues } from '../utils';
import { ExerciseEditTab } from './ExerciseEditTab';
import { ExerciseSummaryTab } from './ExerciseSummaryTab';

type ViewTab = 'summary' | 'history' | 'analytics';

const VIEW_TABS: Array<{ key: ViewTab; label: string }> = [
  { key: 'summary', label: 'Summary' },
  { key: 'history', label: 'History' },
  { key: 'analytics', label: 'Analytics' },
];
const PlaceholderTab: React.FC<{ label: string }> = ({ label }) => (
  <ScrollView
    style={styles.placeholderScroll}
    contentContainerStyle={styles.placeholderContent}
    keyboardShouldPersistTaps="handled"
  >
    <View style={styles.emptyTabCard}>
      <Text style={styles.placeholderTitle}>{label} coming soon</Text>
    </View>
  </ScrollView>
);

interface ExerciseFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  initialExercise?: Exercise | null;
  canEdit?: boolean;
  submitting: boolean;
  error?: string | null;
  deleting?: boolean;
  equipmentOptions: Equipment[];
  onClose: () => void;
  onSubmit: (values: ExerciseFormValues) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export const ExerciseFormModal: React.FC<ExerciseFormModalProps> = ({
  visible,
  mode,
  initialExercise,
  canEdit = true,
  submitting,
  error,
  deleting = false,
  equipmentOptions,
  onClose,
  onSubmit,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory | ''>('');
  const [type, setType] = useState<ExerciseType>('weight');
  const [muscleGroups, setMuscleGroups] = useState<ExerciseMuscleGroup[]>([]);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [viewTab, setViewTab] = useState<ViewTab>('summary');

  const title = useMemo(
    () => (mode === 'create' ? 'New Exercise' : 'Edit Exercise'),
    [mode],
  );

  useEffect(() => {
    if (!visible) {
      setName('');
      setCategory('');
      setType('weight');
      setMuscleGroups([]);
      setEquipmentId(null);
      setDescription('');
      setFieldError(null);
      setIsEditing(mode === 'create');
      setViewTab('summary');
      return;
    }

    if (initialExercise) {
      setName(initialExercise.name);
      setCategory(initialExercise.category ?? '');
      setType(initialExercise.type);
      setMuscleGroups(initialExercise.muscleGroups ? [...initialExercise.muscleGroups] : []);
      setEquipmentId(initialExercise.equipmentId ?? null);
      setDescription(initialExercise.description ?? '');
    } else {
      setName('');
      setCategory('');
      setType('weight');
      setMuscleGroups([]);
      setEquipmentId(null);
      setDescription('');
    }
    setFieldError(null);
    setIsEditing(mode === 'create');
    setViewTab('summary');
  }, [visible, initialExercise, mode]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setFieldError('Name is required.');
      return;
    }

    setFieldError(null);

    const payload: ExerciseFormValues = {
      name: trimmedName,
      category,
      type,
      muscleGroups,
      equipmentId,
      description,
    };

    await onSubmit(payload);
  };

  const equipmentSelectOptions = useMemo(
    () =>
      equipmentOptions.map((option) => ({
        label: option.name,
        value: option.id,
      })),
    [equipmentOptions],
  );

  const selectedEquipmentName = useMemo(() => {
    if (!equipmentId) {
      return null;
    }

    const match = equipmentOptions.find((option) => option.id === equipmentId);
    return match ? match.name : null;
  }, [equipmentOptions, equipmentId]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalKeyboard}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.headerRow}>
              <Text style={styles.modalTitle}>{title}</Text>
              {mode === 'edit' && canEdit ? (
                <TouchableOpacity
                  onPress={() => {
                    setIsEditing((current) => !current);
                  }}
                  style={styles.headerAction}
                >
                  <Text style={styles.headerActionText}>{isEditing ? 'View' : 'Edit'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {mode === 'edit' && !isEditing ? (
              <View style={styles.tabRow}>
                {VIEW_TABS.map(({ key, label }) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.tabButton, viewTab === key && styles.tabButtonActive]}
                    onPress={() => setViewTab(key)}
                    disabled={viewTab === key}
                  >
                    <Text
                      style={[styles.tabLabel, viewTab === key && styles.tabLabelActive]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {isEditing ? (
              <ExerciseEditTab
                name={name}
                category={category}
                type={type}
                muscleGroups={muscleGroups}
                equipmentId={equipmentId}
                equipmentOptions={equipmentSelectOptions}
                description={description}
                fieldError={fieldError}
                submitError={error}
                mode={mode}
                submitting={submitting}
                deleting={deleting}
                onCancel={onClose}
                onSubmit={handleSubmit}
                canEdit={canEdit}
                onDelete={mode === 'edit' && canEdit ? onDelete : undefined}
                onChangeName={setName}
                onChangeCategory={setCategory}
                onChangeType={setType}
                onChangeMuscleGroups={setMuscleGroups}
                onChangeEquipmentId={setEquipmentId}
                onChangeDescription={setDescription}
              />
            ) : viewTab === 'summary' ? (
              <ExerciseSummaryTab
                mode={mode}
                exercise={initialExercise}
                formValues={{
                  name,
                  category,
                  type,
                  muscleGroups,
                  equipmentName: selectedEquipmentName,
                  description,
                }}
              />
            ) : viewTab === 'history' ? (
              <PlaceholderTab label="History" />
            ) : (
              <PlaceholderTab label="Analytics" />
            )}

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalKeyboard: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#f2f2f2' : 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    height: 570,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerActionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#007AFF',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    marginBottom: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  tabLabelActive: {
    color: '#111',
  },
  emptyTabCard: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderScroll: {
    flex: 1,
  },
  placeholderContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 8,
  },
  placeholderTitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
