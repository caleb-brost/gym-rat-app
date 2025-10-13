import React from 'react';
import { FlatList } from 'react-native';
import type { Exercise } from '../types';
import { ExerciseCard } from './ExerciseCard';

interface ExerciseListProps {
  exercises: Exercise[];
  onSelect?: (exercise: Exercise) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onSelect }) => {
  return (
    <FlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ExerciseCard
          name={item.name}
          category={item.category}
          targetMuscles={item.targetMuscles}
          onPress={() => onSelect?.(item)}
        />
      )}
    />
  );
};
