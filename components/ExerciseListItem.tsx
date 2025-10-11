import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExerciseListItemProps {
  name: string;
  category: string;
  muscles: string[];
  onPress?: () => void;
}

export const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  name,
  category,
  muscles,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.muscles}>{muscles.join(', ')}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  textContainer: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  muscles: {
    fontSize: 13,
    color: '#999',
  },
});
