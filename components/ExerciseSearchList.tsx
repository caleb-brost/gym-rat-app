import Fuse from 'fuse.js';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { EXERCISES, Exercise } from '../data/TempData';
import { ExerciseListItem } from './ExerciseListItem';

interface ExerciseListItemProps {
    onSelect?: (exercise: Exercise) => void;
}

export const ExerciseSearchList: React.FC<ExerciseListItemProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(EXERCISES, {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'category', weight: 0.25 },
        { name: 'muscles', weight: 0.15 },
      ],
      threshold: 0.4,
    });
  }, []);

  const results = useMemo(() => {
    if (!query) return EXERCISES;
    return fuse.search(query).map(result => result.item);
  }, [query, fuse]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search exercises..."
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <ExerciseListItem
            name={item.name}
            category={item.category}
            muscles={item.muscles}
            onPress={() => onSelect?.(item)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
});
