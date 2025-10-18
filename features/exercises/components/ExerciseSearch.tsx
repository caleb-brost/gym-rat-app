import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useExerciseSearch } from '../hooks';
import type { Exercise } from '../types';
import { ExerciseList } from './ExerciseList';
import { ExerciseSearchBar } from './ExerciseSearchBar';

interface ExerciseSearchProps {
  exercises: Exercise[];
  onSelect?: (exercise: Exercise) => void;
}

export const ExerciseSearch: React.FC<ExerciseSearchProps> = ({ exercises, onSelect }) => {
  const { query, setQuery, results } = useExerciseSearch(exercises);

  return (
    <View style={styles.container}>
      <ExerciseSearchBar value={query} onChange={setQuery} />
      <ExerciseList exercises={results} onSelect={onSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f2f2f2' },
});
