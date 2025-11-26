import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
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
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <ExerciseCard
            name={item.name}
            category={item.category}
            type={item.type}
            muscleGroups={item.muscleGroups}
            equipmentName={item.equipmentName}
            onPress={() => onSelect?.(item)}
          />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  cardWrapper: {
    marginBottom: 3,
  },
});
