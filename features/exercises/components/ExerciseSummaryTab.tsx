import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../types';

interface ExerciseSummaryTabProps {
  mode: 'create' | 'edit';
  exercise?: Exercise | null;
  formValues: {
    name: string;
    category: string;
    muscles: string[];
    equipment: string;
    notes: string;
  };
}

export const ExerciseSummaryTab: React.FC<ExerciseSummaryTabProps> = ({
  mode,
  exercise,
  formValues,
}) => {
  const details = useMemo(() => {
    if (mode === 'edit' && exercise) {
      return {
        title: exercise.name,
        category: exercise.category ?? '',
        targetMuscles: exercise.targetMuscles,
        equipment: exercise.equipment ?? [],
        notes: exercise.notes ?? '',
        createdAt: exercise.createdAt ?? '',
        userId: exercise.userId ?? '',
        id: exercise.id,
      };
    }

    return {
      title: formValues.name.trim(),
      category: formValues.category.trim(),
      targetMuscles: formValues.muscles.map((muscle) => muscle.trim()).filter(Boolean),
      equipment: formValues.equipment.trim().length
        ? [formValues.equipment.trim()]
        : [],
      notes: formValues.notes.trim(),
      createdAt: '',
      userId: '',
      id: '',
    };
  }, [mode, exercise, formValues]);

  const detailItems = useMemo(
    () => [
      { label: 'Name', value: details.title },
      { label: 'Category', value: details.category },
      {
        label: 'Target Muscles',
        value: details.targetMuscles.length ? details.targetMuscles.join(', ') : '',
      },
      {label: 'Equipment', value: details.equipment.length},
      { label: 'Notes', value: details.notes },
      { label: 'Created At', value: details.createdAt },
      { label: 'User ID', value: details.userId },
      { label: 'Exercise ID', value: details.id },
    ],
    [details],
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        {detailItems.map(({ label, value }) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value || '—'}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#222',
  },
});
