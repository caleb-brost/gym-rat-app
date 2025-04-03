import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import { Link } from 'expo-router';

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

export default function DashboardScreen() {
  // Sample data for today's workout
  const [todaysWorkout] = useState(
    new Workout(
      'Push Day',
      [
        new Exercise('Bench Press', [
          new Set(185, 8, 1),
          new Set(195, 6, 2)
        ]),
        new Exercise('Shoulder Press', [
          new Set(135, 10, 1),
          new Set(145, 8, 2)
        ]),
        new Exercise('Triceps Extension', [
          new Set(120, 10, 1),
          new Set(130, 8, 2)
        ])
      ]
    )
  );

  // Sample data for recent workouts
  const [recentWorkouts] = useState([
    { name: 'Pull Day', date: '2025-04-02', duration: '65 mins' },
    { name: 'Leg Day', date: '2025-04-01', duration: '55 mins' },
  ]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Workout</Text>
        <View style={styles.workoutCard}>
          <Text style={styles.workoutName}>{todaysWorkout.name}</Text>
          <View style={styles.exerciseList}>
            {todaysWorkout.exercises.map((exercise, index) => (
              <Text key={index} style={styles.exerciseText}>• {exercise.name}</Text>
            ))}
          </View>
          <Link href="/(workout)/active" asChild>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {recentWorkouts.map((workout, index) => (
          <View key={index} style={styles.recentWorkoutCard}>
            <Text style={styles.recentWorkoutName}>{workout.name}</Text>
            <Text style={styles.recentWorkoutDate}>{workout.date}</Text>
            <Text style={styles.recentWorkoutDuration}>{workout.duration}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  exerciseList: {
    marginBottom: 12,
  },
  exerciseText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#555',
  },
  startButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  recentWorkoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  recentWorkoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recentWorkoutDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  recentWorkoutDuration: {
    fontSize: 14,
    color: '#3498db',
    marginTop: 4,
  },
});
