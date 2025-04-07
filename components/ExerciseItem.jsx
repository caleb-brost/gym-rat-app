import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditNameModal from './EditNameModal';

export default function ExerciseItem({ 
  exercise, 
  index, 
  updateExercise, 
  removeExercise,
  isRemovable = true
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempExerciseName, setTempExerciseName] = useState(exercise.name || 'Untitled');
  const displayName = exercise.name || 'Untitled';
  // Initialize sets array if it doesn't exist or is just a number
  const [setCount, setSetCount] = useState(typeof exercise.sets === 'number' ? exercise.sets : exercise.sets.length || 1);
  const [setDetails, setSetDetails] = useState(
    Array.isArray(exercise.sets) ? 
    exercise.sets : 
    Array(setCount).fill().map((_, i) => ({ weight: 0, reps: 0, setNumber: i + 1 }))
  );
  
  // Update the exercise with the new set details
  const updateSetDetails = (setIndex, field, value) => {
    const newSetDetails = [...setDetails];
    newSetDetails[setIndex][field] = value;
    setSetDetails(newSetDetails);
    
    // Update the parent component's state
    updateExercise(index, 'sets', newSetDetails);
  };
  
  // Add a new set
  const addSet = () => {
    const newSetDetails = [...setDetails, { weight: 0, reps: 0, setNumber: setDetails.length + 1 }];
    setSetDetails(newSetDetails);
    setSetCount(newSetDetails.length);
    
    // Update the parent component's state
    updateExercise(index, 'sets', newSetDetails);
  };
  
  // Remove a set
  const removeSet = (setIndex) => {
    const newSetDetails = [...setDetails];
    newSetDetails.splice(setIndex, 1);
    
    // Update set numbers
    newSetDetails.forEach((set, idx) => {
      set.setNumber = idx + 1;
    });
    
    setSetDetails(newSetDetails);
    setSetCount(newSetDetails.length);
    
    // Update the parent component's state
    updateExercise(index, 'sets', newSetDetails);
  };
  // Save the exercise name from the modal
  const saveExerciseName = () => {
    updateExercise(index, 'name', tempExerciseName);
    setModalVisible(false);
  };
  
  // Cancel editing the exercise name
  const cancelExerciseNameEdit = () => {
    setTempExerciseName(exercise.name || 'Untitled');
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
        {setDetails.map((set, setIndex) => (
          <View key={setIndex} style={styles.setItem}>
            <View style={styles.setHeader}>
              <Text style={styles.setNumber}>Set {set.setNumber}</Text>
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
                  onChangeText={(value) => updateSetDetails(setIndex, 'weight', parseInt(value) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                />
              </View>
              
              <View style={styles.numberInputContainer}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.numberInput}
                  value={set.reps.toString()}
                  onChangeText={(value) => updateSetDetails(setIndex, 'reps', parseInt(value) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
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
