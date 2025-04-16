import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import SetComponent from './SetComponent';
import Set from '../models/Set';

const ExerciseComponent = ({ exercise, onRemove, onUpdate, onEdit }) => {
  const handleAddSet = () => {
    const newSet = new Set(0, 0, exercise.sets.length + 1, 0);

    exercise.sets.push(newSet);
    onUpdate(exercise);
  };

  const handleRemoveSet = (index) => {
    exercise.sets.splice(index, 1);
    onUpdate(exercise);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
      <View style={styles.noteContainer}>
        <TextInput
          style={styles.noteInput}
          value={exercise.notes}
          onChangeText={(text) => {
            exercise.notes = text;
            onUpdate(exercise);
          }}
          placeholder="Add notes for this exercise..."
          multiline
          numberOfLines={2}
        />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.setNumberTitle}>Set</Text>
        <View style={styles.labelsContainer}>
          <Text style={styles.setLabel}>Weight</Text>
          <Text style={styles.setLabel}>Reps</Text>
          <Text style={styles.setLabel}>RPE   </Text>{/* Don't question the spacing, it works */}
        </View>
      </View>
      
      {exercise.sets.map((set, setIndex) => (
        <SetComponent 
        key={setIndex} 
        set={set} 
        onUpdate={() => onUpdate(exercise)}
        onRemove={() => handleRemoveSet(setIndex)}
        />
      ))}
      
      <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  noteContainer: {
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    minHeight: 60,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textDecorationLine: 'underline',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  setNumberTitle: {
    width: 30,
    marginRight: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  labelsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    marginRight: 40,
  },
  setLabel: {
    width: '30%',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  addSetButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addSetText: {
    color: 'white',
    fontWeight: '500',
  },
  removeButton: {
    padding: 4,
  }
});

export default ExerciseComponent;
