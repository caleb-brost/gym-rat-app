import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useWorkoutSearch } from '../hooks';
import type { Workout } from '../types';
import { WorkoutCard } from './WorkoutCard';
import { WorkoutSearchBar } from './WorkoutSearchBar';

interface WorkoutSearchProps {
  workouts: Workout[];
  deletingId?: string | null;
  onDelete: (workout: Workout) => void;
}

export const WorkoutSearch: React.FC<WorkoutSearchProps> = ({
  workouts,
  deletingId,
  onDelete,
}) => {
  const { query, setQuery, results } = useWorkoutSearch(workouts);
  const hasResults = results.length > 0;

  return (
    <View style={styles.container}>
      <WorkoutSearchBar value={query} onChange={setQuery} placeholder="Search workouts..." />

      {hasResults ? (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        >
          {results.map((workout) => (
            <View key={workout.id} style={styles.cardWrapper}>
              <WorkoutCard
                workout={workout}
                deleting={deletingId === workout.id}
                onDelete={onDelete}
              />
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>No workouts match your search.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f2f2f2',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 3,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
