import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditNameModal from './EditNameModal';
import Exercise from '../models/Exercise';

export default function ExerciseItem({ 
  exercise, 
  index, 
  updateExercise, 
  removeExercise,
  isRemovable = true
}) {
  // Convert exercise to Exercise if it's not already
  const [exerciseModel, setExerciseModel] = useState(() => {
    if (exercise instanceof Exercise) {
      return exercise;
    } else {
      const newExercise = new Exercise(
        exercise.name || 'Untitled',
        Array.isArray(exercise.sets) ? exercise.sets.length : (exercise.sets || 1),
        '',  // notes
        null, // templateId
        exercise.orderIndex || index  
      );
      
      // If exercise has sets, add them to the model
      if (Array.isArray(exercise.sets)) {
        newExercise.sets = exercise.sets;
        console.log(newExercise.sets.length);
      }
      
      return newExercise;
    }
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [tempExerciseName, setTempExerciseName] = useState(exerciseModel.name || 'Untitled');
  const displayName = exerciseModel.name || 'Untitled';
  
  // Use the sets from the exercise model
  const [sets, setSets] = useState(() => {
    // Ensure that we always have an array for sets
    const exerciseSets = exerciseModel.sets;
    return Array.isArray(exerciseSets) ? exerciseSets : [];
  });
  const [setCount, setSetCount] = useState(Array.isArray(sets) ? sets.length : 0);
  
  // Update the parent component when our model changes
  // Using a ref to track if we need to update the parent
  const initialRender = useRef(true);
  const modelRef = useRef(exerciseModel);
  
  useEffect(() => {
    // Skip the initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    // Only update if the model has actually changed
    if (modelRef.current !== exerciseModel) {
      modelRef.current = exerciseModel;
      // Notify parent component of model changes
      updateExercise(index, 'model', exerciseModel);
    }
  }, [exerciseModel, index, updateExercise]);
  
  // Update a specific set detail
  const updateSet = (setIndex, field, value) => {
    try {
      // Create a copy of the current sets
      const updatedSets = [...sets];
      
      // Update the specific field in the set
      if (updatedSets[setIndex]) {
        updatedSets[setIndex][field] = value;
      }
      
      // Update the model with the modified sets
      exerciseModel.sets = updatedSets;
      
      // Update our local state to reflect the change
      setSets(updatedSets);
      
      // Notify parent component of the change
      updateExercise(index, 'sets', updatedSets);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  // Add a new set
  const addSet = () => {
    // Create a copy of the current sets
    const updatedSets = [...sets];
    
    // Add a new set with default values
    updatedSets.push({
      weight: 0,
      reps: 0,
      rpe: 0,
      set_order: updatedSets.length + 1
    });
    
    // Update the model with the modified sets
    exerciseModel.sets = updatedSets;
    
    // Update our local state to reflect the change
    setSets(updatedSets);
    setSetCount(updatedSets.length);
    
    // Notify parent component of the change
    updateExercise(index, 'sets', updatedSets);
  };
  
  // Remove a set
  const removeSet = (setIndex) => {
    // Create a copy of the current sets
    const updatedSets = [...sets];
    
    // Remove the set at the specified index
    updatedSets.splice(setIndex, 1);
    
    // Update set_order for remaining sets
    updatedSets.forEach((set, idx) => {
      set.set_order = idx + 1;
    });
    
    // Update the model with the modified sets
    exerciseModel.sets = updatedSets;
    
    // Update our local state to reflect the change
    setSets(updatedSets);
    setSetCount(updatedSets.length);
    
    // Notify parent component of the change
    updateExercise(index, 'sets', updatedSets);
  };
  // Save the exercise name from the modal
  const saveExerciseName = () => {
    try {
      // Update the model's name
      exerciseModel.name = tempExerciseName;
      
      // Create a new model reference to trigger the useEffect
      setExerciseModel(exerciseModel.clone());
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  // Cancel editing the exercise name
  const cancelExerciseNameEdit = () => {
    setTempExerciseName(exerciseModel.name || 'Untitled');
    setModalVisible(false);
  };

  return (
    <View style={styles.exerciseItem}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseNameContainer}>
          <Text style={styles.exerciseName}>{displayName}</Text>
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            style={styles.editButton}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        {isRemovable && (
          <TouchableOpacity 
            onPress={() => removeExercise(index)}
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Modal for editing exercise name */}
      <EditNameModal
        visible={modalVisible}
        title="Edit Exercise Name"
        value={tempExerciseName}
        onChangeText={setTempExerciseName}
        onSave={saveExerciseName}
        onCancel={cancelExerciseNameEdit}
        placeholder="Exercise name"
      />
      
      <View style={styles.setsContainer}>
        {Array.isArray(sets) && sets.map((set, setIndex) => (
          <View key={setIndex} style={styles.setItem}>
            <View style={styles.setHeader}>
              <Text style={styles.setNumber}>Set {set.setOrder}</Text>
              <TouchableOpacity 
                onPress={() => removeSet(setIndex)}
                style={styles.removeSetButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle-outline" size={18} color="#e74c3c" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.setDetailsContainer}>
              <View style={styles.numberInputContainer}>
                <Text style={styles.inputLabel}>Weight</Text>
                <TextInput
                  style={styles.numberInput}
                  value={set.weight.toString()}
                  onChangeText={(value) => updateSet(setIndex, 'weight', parseInt(value) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                />
              </View>
              
              <View style={styles.numberInputContainer}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.numberInput}
                  value={set.reps.toString()}
                  onChangeText={(value) => updateSet(setIndex, 'reps', parseInt(value) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                />
              </View>

              <View style={styles.numberInputContainer}>
                <Text style={styles.inputLabel}>RPE</Text>
                <TextInput
                  style={styles.numberInput}
                  value={set.rpe > 0 ? set.rpe.toString() : ''}
                  onChangeText={(value) => updateSet(setIndex, 'rpe', parseInt(value) || 0)}
                  keyboardType="number-pad"
                  placeholder="0-10"
                  maxLength={2}
                />
              </View>
            </View>
          </View>
        ))}
        
        <TouchableOpacity 
          style={styles.addSetButton}
          onPress={addSet}
        >
          <Text style={styles.addSetButtonText}>+ Add Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  editButton: {
    padding: 4,
  },
  removeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeSetButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  setsContainer: {
    marginTop: 16,
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  setItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  rpeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  rpeLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  rpeValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  removeSetButton: {
    padding: 4,
  },
  setDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numberInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  numberInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  addSetButton: {
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#4682b4',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addSetButtonText: {
    color: '#4682b4',
    fontWeight: '600',
    fontSize: 14,
  },
});
