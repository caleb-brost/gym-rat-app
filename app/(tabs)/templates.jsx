import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';

// Define workout data structures
class Set {
  constructor(weight, reps, setNumber) {
    this.weight = weight;
    this.reps = reps;
    this.setNumber = setNumber;
    this.completed = false;
  }
}

class Exercise {
  constructor(name, sets = []) {
    this.name = name;
    this.sets = sets;
  }
}

class Workout {
  constructor(name, exercises = [], date = new Date()) {
    this.name = name;
    this.exercises = exercises;
    this.date = date;
    this.completed = false;
  }
}

export default function TemplatesScreen() {
  // Use local state instead of context
  const [templates] = useState([
    new Workout(
      'Push Day',
      [
        new Exercise('Bench Press', [
          new Set(135, 10, 1),
          new Set(135, 9, 2),
          new Set(120, 7, 3)
        ]),
        new Exercise('Shoulder Press', [new Set(0, 0, 1)]),
        new Exercise('Triceps Extension', [new Set(0, 0, 1)])
      ]
    ),
    new Workout(
      'Pull Day',
      [
        new Exercise('Deadlift', [new Set(0, 0, 1)]),
        new Exercise('Barbell Row', [new Set(0, 0, 1)]),
        new Exercise('Bicep Curl', [new Set(0, 0, 1)])
      ]
    ),
    new Workout(
      'Leg Day',
      [
        new Exercise('Squat', [new Set(0, 0, 1)]),
        new Exercise('Romanian Deadlift', [new Set(0, 0, 1)]),
        new Exercise('Calf Raises', [new Set(0, 0, 1)])
      ]
    ),
  ]);

  const startWorkout = (template) => {
    // Store the selected workout in localStorage or AsyncStorage
    // For now, just navigate to the workout screen
    console.log('Starting workout:', template.name);
    router.push('/(workout)/active');
  };

  const renderItem = ({ item }) => (
    <View style={styles.templateCard}>
      <Text style={styles.templateName}>{item.name}</Text>
      <View style={styles.exerciseList}>
        {item.exercises.map((exercise, index) => (
          <Text key={index} style={styles.exerciseText}>• {exercise.name}</Text>
        ))}
      </View>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => startWorkout(item)}
      >
        <Text style={styles.startButtonText}>Start</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={templates}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.createButtonContainer}>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create New Template</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: { justifyContent: 'space-between' },
  templateCard: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseList: {
    marginBottom: 12,
  },
  exerciseText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createButtonContainer: { marginTop: 20, alignItems: 'center' },
  createButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: { color: '#fff', fontWeight: 'bold' },
});
