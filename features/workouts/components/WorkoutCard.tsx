import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Workout } from '../types';

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (workout: Workout) => void;
  deleting?: boolean;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onDelete, deleting }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{workout.name}</Text>
          {workout.notes ? <Text style={styles.notes}>{workout.notes}</Text> : null}
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
          onPress={() => onDelete(workout)}
          disabled={!!deleting}
        >
          <Text style={styles.deleteButtonText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
        </TouchableOpacity>
      </View>

      {workout.exercises.length === 0 ? (
        <Text style={styles.emptyExercises}>No exercises added yet.</Text>
      ) : (
        workout.exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseBlock}>
            <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
            {exercise.sets.length === 0 ? (
              <Text style={styles.setPlaceholder}>No sets configured.</Text>
            ) : (
              exercise.sets.map((set) => (
                <Text key={set.id} style={styles.setLine}>
                  Set {set.setNumber}: {set.reps !== null ? `${set.reps} reps` : '— reps'}
                  {set.weight !== null ? ` @ ${set.weight} lb` : ''}
                </Text>
              ))
            )}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e7ff',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  notes: {
    marginTop: 4,
    color: '#555',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    color: '#d14343',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyExercises: {
    fontSize: 13,
    color: '#777',
  },
  exerciseBlock: {
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
    marginBottom: 6,
  },
  setPlaceholder: {
    fontSize: 13,
    color: '#777',
  },
  setLine: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});
