import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Text, View } from 'react-native';
import { router } from 'expo-router';

// Define simple classes for workout data structure if needed
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

export default function WorkoutScreen() {
  // Create a sample workout for demonstration
  const [activeWorkout, setActiveWorkout] = useState(
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
  
  // Function to update a set's weight or reps
  const updateSet = (exerciseIndex, setIndex, field, value) => {
    // This would need to update the activeWorkout state
    // Implementation would depend on your state management approach
    console.log(`Updating ${field} for exercise ${exerciseIndex}, set ${setIndex} to ${value}`);
  };
  
  // Function to add a new set to an exercise
  const addSet = (exerciseIndex) => {
    // This would need to add a new set to the specified exercise
    // Implementation would depend on your state management approach
    console.log(`Adding new set to exercise ${exerciseIndex}`);
  };
  
  // Function to end the workout
  const endWorkout = () => {
    // Save the workout to history (would use AsyncStorage in a real app)
    Alert.alert('Workout Completed', 'Your workout has been saved to history.');
  };
  
  return (
    <ScrollView style={styles.container}>
      {activeWorkout.exercises.map((exercise, exerciseIndex) => (
        <View key={exerciseIndex} style={styles.exerciseContainer}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          
          {exercise.sets?.map((set, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              <Text style={styles.setNumber}>Set {setIndex + 1}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Weight"
                  keyboardType="numeric"
                  value={set.weight.toString()}
                  onChangeText={(text) => {
                    updateSet(exerciseIndex, setIndex, 'weight', text);
                  }}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={set.reps.toString()}
                  onChangeText={(text) => {
                    updateSet(exerciseIndex, setIndex, 'reps', text);
                  }}
                />
              </View>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addSetButton}
            onPress={() => addSet(exerciseIndex)}
          >
            <Text style={styles.addSetButtonText}>Add Set</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity 
        style={styles.finishButton}
        onPress={() => {
          // End the workout and navigate
          endWorkout();
          router.replace('/(tabs)');
        }}
      >
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  noWorkoutText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  finishButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  exerciseContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  setContainer: {
    marginBottom: 10,
  },
  setNumber: {
    fontSize: 16,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: 40,
    marginHorizontal: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  addSetButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addSetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
