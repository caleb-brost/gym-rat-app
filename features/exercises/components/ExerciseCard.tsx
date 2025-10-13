import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExerciseCardProps {
  name: string;
  category: string | null;
  targetMuscles: string[];
  onPress?: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  name,
  category,
  targetMuscles,
  onPress,
}) => (
  <TouchableOpacity style={styles.container} onPress={onPress}>
    <View style={styles.textContainer}>
      <Text style={styles.name}>{name}</Text>
      {category ? <Text style={styles.category}>{category}</Text> : null}
      {targetMuscles.length > 0 ? (
        <Text style={styles.muscles}>{targetMuscles.join(', ')}</Text>
      ) : null}
    </View>
  </TouchableOpacity>
);

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
