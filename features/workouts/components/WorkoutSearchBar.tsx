import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

interface WorkoutSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const WorkoutSearchBar: React.FC<WorkoutSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search workouts...',
}) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="while-editing"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f2f2f2',
    color: '#222',
  },
});
