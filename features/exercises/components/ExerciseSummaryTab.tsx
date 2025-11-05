import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Exercise } from '../types';

interface ExerciseSummaryTabProps {
  mode: 'create' | 'edit';
  exercise?: Exercise | null;
  formValues: {
    name: string;
    category: string;
    type: string;
    muscleGroups: string[];
    equipmentName: string | null;
    description: string;
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
        type: exercise.type,
        muscleGroups: exercise.muscleGroups,
        equipmentName: exercise.equipmentName ?? '',
        description: exercise.description ?? '',
        createdAt: exercise.createdAt ?? '',
        userId: exercise.userId ?? '',
        id: exercise.id,
      };
    }

    return {
      title: formValues.name.trim(),
      category: formValues.category.trim(),
      type: formValues.type,
      muscleGroups: formValues.muscleGroups
        .map((muscle) => muscle.trim())
        .filter(Boolean),
      equipmentName: formValues.equipmentName ?? '',
      description: formValues.description.trim(),
      createdAt: '',
      userId: '',
      id: '',
    };
  }, [mode, exercise, formValues]);

  const detailItems = useMemo(
    () => [
      { label: 'Name', value: details.title },
      { label: 'Category', value: details.category },
      { label: 'Type', value: details.type },
      {
        label: 'Muscle Groups',
        value: details.muscleGroups.length ? details.muscleGroups.join(', ') : '',
      },
      { label: 'Equipment', value: details.equipmentName },
      { label: 'Description', value: details.description },
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
