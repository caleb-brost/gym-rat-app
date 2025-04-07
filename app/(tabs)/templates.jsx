import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import WorkoutCard from '../../components/WorkoutCard';
import supabase from '../../db/supabaseClient.js';


export default function TemplatesScreen() {
  const [templates, setTemplates] = useState([]);

  const retrieveTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts_templates')
        .select('*');
      if (error) throw error;
      setTemplates(data);
      console.log('Templates retrieved:', data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  };

  useEffect(() => {
    retrieveTemplates();
  }, []);

  const startWorkout = (template) => {
    // Store the selected workout in localStorage or AsyncStorage
    // For now, just navigate to the workout screen
    console.log('Starting workout:', template.name);
    router.push('/(workout)/active');
  };

  const createNewTemplate = () => {
    // Navigate to the create template screen
    router.push('/(workout)/create-template');
  };

  return (
    <ScrollView style={styles.container}>
      {templates.map((template, index) => (
        <WorkoutCard
          key={index}
          workout={template}
          handleStartWorkout={startWorkout}
          buttonText="Use Template"
        />
      ))}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity style={styles.createButton} onPress={createNewTemplate}>
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
