import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function WorkoutCard({ workout, handleStartWorkout, buttonText = 'Start Workout' }) {
  return (
    <View style={styles.templateCard}>
      <Text style={styles.templateName}>{workout.name}</Text>
      <View style={styles.exerciseList}>
        {workout.exercises && workout.exercises.map((exercise, index) => (
          <Text key={index} style={styles.exercise}>
            • {exercise.name} x {exercise.sets?.length || '?'}
          </Text>
        ))}
      </View>
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => handleStartWorkout(workout)}
      >
        <Text style={styles.startButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

// This is a helper function to use with FlatList
// Usage example: <FlatList data={workouts} renderItem={renderWorkoutCard(handleStartWorkout)} />
export const renderWorkoutCard = (handleStartWorkout, buttonText) => ({ item }) => (
  <WorkoutCard 
    workout={item} 
    handleStartWorkout={handleStartWorkout}
    buttonText={buttonText}
  />
);

const styles = StyleSheet.create({
  templateCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3, // Keep elevation for Android
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exerciseList: {
    marginTop: 8,
  },
  exercise: {
    fontSize: 14,
    color: '#555',
  },
  startButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

/*
Original styles

templateCard: {
  padding: 15,
  borderRadius: 10,
  marginBottom: 15,
  borderColor: '#777',
  borderWidth: 0.5,
  width: '48%',
},
templateName: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 10,
},
exerciseList: {
  marginBottom: 15,
},
exercise: {
  fontSize: 16,
  marginBottom: 5,
  color: '#777',
},
startButton: {
  backgroundColor: '#007AFF',
  padding: 10,
  borderRadius: 5,
  alignSelf: 'center',
},
startButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},
*/