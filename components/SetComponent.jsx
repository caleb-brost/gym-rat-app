import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const SetComponent = ({ set, onUpdate, onRemove }) => {
  const handleUpdate = (field, value) => {
    // Convert to number or use 0 if invalid
    let numValue = parseInt(value) || 0;
    
    // Silently limit values to their maximum allowed values
    switch (field) {
      case 'weight':
        numValue = Math.min(numValue, 10000);
        break;
      case 'reps':
        numValue = Math.min(numValue, 1000);
        break;
      case 'rpe':
        numValue = Math.min(numValue, 10);
        break;
    }
    
    set[field] = numValue;
    onUpdate();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.setNumber}>{set.setOrder}</Text>
      <View style={styles.inputsContainer}>
        <TextInput
          style={styles.input}
          value={set.weight.toString()}
          onChangeText={(value) => handleUpdate('weight', value)}
          keyboardType="numeric"
          placeholder="Weight"
          maxLength={5}
        />
        <TextInput
          style={styles.input}
          value={set.reps.toString()}
          onChangeText={(value) => handleUpdate('reps', value)}
          keyboardType="numeric"
          placeholder="Reps"
          maxLength={4}
        />
        <TextInput
          style={styles.input}
          value={set.rpe.toString()}
          onChangeText={(value) => handleUpdate('rpe', value)}
          keyboardType="numeric"
          placeholder="RPE"
          maxLength={2}
        />
      </View>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Ionicons name="close-circle" size={18} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 8,
    width: '100%',
  },
  setNumber: {
    width: 30,
    textAlign: 'center',
    marginRight: 8,
  },
  inputsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
  },
  input: {
    width: '30%',
    height: 36,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginHorizontal: 4,
    textAlign: 'center',
    paddingHorizontal: 2,
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  }
});

export default SetComponent;