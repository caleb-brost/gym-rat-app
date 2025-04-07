import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import supabase from '../../db/supabaseClient.js';
import ExerciseItem from '../../components/ExerciseItem';
import Ionicons from '@expo/vector-icons/Ionicons';
import EditNameModal from '../../components/EditNameModal';

export default function CreateTemplateScreen() {
  const [templateName, setTemplateName] = useState('Untitled Template');
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [templateNote, setTemplateNote] = useState('');
  const [templateNoteModalVisible, setTemplateNoteModalVisible] = useState(false);
  const [tempTemplateName, setTempTemplateName] = useState('Untitled Template');
  const [tempTemplateNote, setTempTemplateNote] = useState('');
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addExercise = () => {
    setExercises([...exercises, { name: 'Untitled', sets: [{ weight: 0, reps: 0, setNumber: 1 }] }]);
  };

  const removeExercise = (index) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };

  const updateExercise = (index, field, value) => {
    const updatedExercises = [...exercises];
    updatedExercises[index][field] = value;
    setExercises(updatedExercises);
  };

  const saveTemplate = async () => {
    // Validate inputs
    if (!templateName.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return;
    }

    setIsLoading(true);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a template');
        setIsLoading(false);
        return;
      }

      // Insert the template
      const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .insert([
          { 
            creator_id: user.id,
            title: templateName,
            note: templateNote,
          }
        ])
        .select();

      if (templateError) throw templateError;
      
      // Insert exercises for the template
      const exercisesData = exercises.map((exercise, index) => {
        // Process the exercise data for database insertion
        const setCount = Array.isArray(exercise.sets) ? exercise.sets.length : 1;
        const defaultReps = Array.isArray(exercise.sets) && exercise.sets.length > 0 ? 
          exercise.sets[0].reps : 0;
        
        return {
          template_id: template[0].id,
          name: exercise.name,
          sets: setCount,
          reps: defaultReps,
          order_index: index,
          // Store the full set details as JSON if needed
          set_details: Array.isArray(exercise.sets) ? JSON.stringify(exercise.sets) : null
        };
      });

      const { error: exercisesError } = await supabase
        .from('exercise_templates')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      Alert.alert(
        'Success', 
        'Workout template created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error creating template:', error);
      Alert.alert('Error', error.message || 'Failed to create template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Workout Template</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Template Name</Text>
          <View style={styles.templateNameContainer}>
            <Text style={styles.templateName}>{templateName}</Text>
            <TouchableOpacity 
              onPress={() => setTemplateModalVisible(true)}
              style={styles.editButton}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {templateNote ? (
          <View style={styles.formGroup}>
            <View style={styles.noteLabelContainer}>
              <Text style={styles.label}>Note</Text>
              <View style={styles.noteActions}>
                <TouchableOpacity 
                  onPress={() => setTemplateNoteModalVisible(true)}
                  style={styles.editButton}
                >
                  <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setTemplateNote('')}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>{templateNote}</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.addNoteButton}
            onPress={() => setTemplateNoteModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#666" />
            <Text style={styles.addNoteText}>Add Note</Text>
          </TouchableOpacity>
        )}
        
        {/* Modal for editing template note */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={templateNoteModalVisible}
          onRequestClose={() => setTemplateNoteModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Edit Template Note</Text>
              
              <TextInput
                style={styles.noteInput}
                value={tempTemplateNote}
                onChangeText={setTempTemplateNote}
                placeholder="Add details about this template..."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setTempTemplateNote(templateNote);
                    setTemplateNoteModalVisible(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={() => {
                    setTemplateNote(tempTemplateNote);
                    setTemplateNoteModalVisible(false);
                  }}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {/* Modal for editing template name */}
        <EditNameModal
          visible={templateModalVisible}
          title="Edit Template Name"
          value={tempTemplateName}
          onChangeText={setTempTemplateName}
          onSave={() => {
            setTemplateName(tempTemplateName);
            setTemplateModalVisible(false);
          }}
          onCancel={() => {
            setTempTemplateName(templateName);
            setTemplateModalVisible(false);
          }}
          placeholder="Template name"
        />

        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {exercises.length > 0 ? (
            exercises.map((exercise, index) => (
              <ExerciseItem
                key={index}
                exercise={exercise}
                index={index}
                updateExercise={updateExercise}
                removeExercise={removeExercise}
                isRemovable={true}
              />
            ))
          ) : (
            <View style={styles.emptyExercisesContainer}>
              <Text style={styles.emptyText}>No exercises added yet</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addExercise}
          >
            <Text style={styles.addButtonText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={saveTemplate}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Template'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  templateNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  templateName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  noteLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  noteContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
  },
  addNoteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  noteInput: {
    width: '100%',
    height: 120,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  editButton: {
    padding: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  exercisesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyExercisesContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },

  addButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#97c2fc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});