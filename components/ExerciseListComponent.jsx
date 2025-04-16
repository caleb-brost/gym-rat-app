import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import EditNameModal from './EditNameModal';
import Exercise from '../models/Exercise';
import Set from '../models/Set';
import ExerciseComponent from './ExerciseComponent';

const ExerciseListComponent = ({ 
  exercises, 
  onUpdateExercise, 
  onRemoveExercise,
  onAddExercise,
  setExerciseModalVisible,
  setExerciseIndex
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [tempName, setTempName] = useState('');

  const handleAddExercise = () => {
    const newExercise = new Exercise('Untitled', [], [], 0, '', exercises.length + 1);
    newExercise.addSet(new Set(0, 0, 1, 0)); // Add default set
    onAddExercise(newExercise);
  };

  const handleEditName = (exercise, index) => {
    setEditingExercise({ exercise, index });
    setTempName(exercise.name);
    setEditModalVisible(true);
  };

  const handleSaveName = () => {
    if (editingExercise) {
      const updatedExercise = editingExercise.exercise;
      updatedExercise.name = tempName;
      onUpdateExercise(editingExercise.index, updatedExercise);
      setEditModalVisible(false);
      setEditingExercise(null);
    }
  };

  return (
    <View style={styles.exercisesContainer}>
      <Text style={styles.sectionTitle}>Exercises</Text>

      <EditNameModal
        visible={editModalVisible}
        title="Edit Exercise Name"
        value={tempName}
        onChangeText={setTempName}
        onSave={handleSaveName}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingExercise(null);
        }}
        placeholder="Enter exercise name"
      />
      
      {exercises.length > 0 ? (
        exercises.map((exercise, index) => (
          <ExerciseComponent
            key={index}
            exercise={exercise}
            onUpdate={(updatedExercise) => onUpdateExercise(index, updatedExercise)}
            onRemove={() => onRemoveExercise(index)}
            onEdit={() => handleEditName(exercise, index)}
          />  
        ))
      ) : (
        <View style={styles.emptyExercisesContainer}>
          <Text style={styles.emptyText}>No exercises added yet</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddExercise}
      >
        <Text style={styles.addButtonText}>+ Add Exercise</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  exercisesContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyExercisesContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginVertical: 10,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
};

export default ExerciseListComponent;
