import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';

export default function HistoryScreen() {
  // Use local state for workout history
  const [workoutHistory] = useState([
    {
      date: '2025-03-30',
      name: 'Push Day',
      exercises: [
        { name: 'Bench Press', sets: [{ weight: '185', reps: '8' }, { weight: '195', reps: '6' }] },
        { name: 'Shoulder Press', sets: [{ weight: '135', reps: '10' }, { weight: '145', reps: '8' }] },
      ],
    },
    // Add more workout history items here
  ]);

  return (
    <ScrollView style={styles.container}>
      {workoutHistory.map((workout, index) => (
        <View key={index} style={styles.workoutCard}>
          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.date}>{workout.date}</Text>
          
          {workout.exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.setsContainer}>
                {exercise.sets.map((set, setIndex) => (
                  <Text key={setIndex} style={styles.setInfo}>
                    Set {setIndex + 1}: {set.weight}lbs × {set.reps} reps
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  noHistoryText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#777',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  workoutCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: '#777',
    borderWidth: 0.5,
  },
  date: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  exerciseContainer: {
    marginBottom: 15,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  setsContainer: {
    marginLeft: 15,
  },
  setInfo: {
    fontSize: 16,
    color: '#777',
    marginBottom: 3,
  },
});
