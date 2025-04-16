import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import TemplateHeaderComponent from '../../components/TemplateHeaderComponent';
import ExerciseListComponent from '../../components/ExerciseListComponent';
import SaveButtonComponent from '../../components/SaveButtonComponent';
import Workout from '../../models/Workout';

const CreateTemplateScreen = ({ navigation }) => {
  const [workoutTemplate, setWorkoutTemplate] = useState(new Workout('Untitled'));
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const updateTemplate = (updater) => {
    setWorkoutTemplate(prev => {
      const newTemplate = prev.clone();
      updater(newTemplate);
      return newTemplate;
    });
  };

  const handleSaveTemplate = async () => {
    setIsLoading(true);
    try {
      await workoutTemplate.saveToDatabase(setIsLoading);
      navigation.goBack();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = (newExercise) => {
    updateTemplate(template => {
      template.addExercise(newExercise.name, newExercise.sets);
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TemplateHeaderComponent
          templateName={workoutTemplate.name}
          templateNotes={workoutTemplate.notes}
          onNameChange={(value) => updateTemplate(t => t.name = value)}
          onNotesChange={(value) => updateTemplate(t => t.notes = value)}
          modalVisible={templateModalVisible}
          setModalVisible={setTemplateModalVisible}
        />

        <ExerciseListComponent
          exercises={workoutTemplate.exercises}
          onUpdateExercise={(index, exercise) => 
            updateTemplate(t => t.updateExercise(index, 'model', exercise))
          }
          onRemoveExercise={(index) => {
            console.log('Removing exercise at index:', index);
            updateTemplate(t => t.removeExercise(index));
          }}
          onAddExercise={handleAddExercise}
        />

        <SaveButtonComponent
          onSave={handleSaveTemplate}
          isLoading={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
});

export default CreateTemplateScreen;