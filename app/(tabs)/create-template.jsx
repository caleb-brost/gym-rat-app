import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import ExerciseItem from '../../components/ExerciseItem';
import Ionicons from '@expo/vector-icons/Ionicons';
import EditNameModal from '../../components/EditNameModal';
import Workout from '../../models/Workout';

export default function CreateTemplateScreen() {
  // Create a Workout model instance and use state to track it
  const [workoutTemplate, setWorkoutTemplate] = useState(() => new Workout('Untitled Template'));
  
  // UI state
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [templateNoteModalVisible, setTemplateNoteModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Helper to update the template and trigger a re-render
  const updateTemplate = (updater) => {
    const updatedTemplate = workoutTemplate.clone();
    updater(updatedTemplate);
    // re-render the component
    setWorkoutTemplate(updatedTemplate);
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
            <Text style={styles.templateName}>{workoutTemplate.name}</Text>
            <TouchableOpacity 
              onPress={() => setTemplateModalVisible(true)}
              style={styles.editButton}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {workoutTemplate.notes ? (
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
                  onPress={() => {
                    updateTemplate(template => template.notes = '');
                  }}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>{workoutTemplate.notes}</Text>
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
                value={workoutTemplate.notes}
                onChangeText={(value) => {
                  updateTemplate(template => template.notes = value);
                }}
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
                  onPress={() => setTemplateNoteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={() => setTemplateNoteModalVisible(false)}
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
          value={workoutTemplate.name}
          onChangeText={(value) => updateTemplate(template => template.name = value)}
          onSave={() => setTemplateModalVisible(false)}
          onCancel={() => setTemplateModalVisible(false)}
          placeholder="Template name"
        />

        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {workoutTemplate.exercises.length > 0 ? (
            workoutTemplate.exercises.map((exercise, index) => (
              <ExerciseItem
                key={index}
                exercise={exercise}
                index={index}
                updateExercise={(field, value) => {
                  updateTemplate(template => template.updateExercise(index, field, value));
                }}
                removeExercise={() => {
                  updateTemplate(template => template.removeExercise(index));
                }}
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
            onPress={() => {
              updateTemplate(template => template.addExercise('Untitled', 1));
            }}
          >
            <Text style={styles.addButtonText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={() => workoutTemplate.saveToDatabase(setIsLoading)}
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