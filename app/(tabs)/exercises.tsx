import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ExerciseSearchList } from '../../components/ExerciseSearchList';

export default function ExercisesScreen() {
  const handleSelect = (exercise: { name: string; category: string; muscles: string[] }) => {
    console.log('Selected Exercise:', exercise.name);
  };

  const handleNewExercise = () => {
    console.log("New Exercise pressed");
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff"}}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.newButton} onPress={handleNewExercise}>
          <Text style={styles.buttonText}>New</Text>
        </TouchableOpacity>
      </View>

      <ExerciseSearchList onSelect={handleSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginRight: 10,
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

