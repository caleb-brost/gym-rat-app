import BaseModel from './BaseModel.js';
import Exercise from './Exercise.js';
import Set from './Set.js';
import supabase from '../db/supabaseClient.js';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export default class Workout extends BaseModel {
  #exercises = [];
  #startTime;
  #endTime;
  #active;

  constructor(name = 'Untitled', notes = '', exercises = [], startTime = null, endTime = null, active = false) {
    super(name, notes);
    
    this.exercises = exercises;
    this.startTime = startTime;
    this.endTime = endTime;
    this.active = active;
  }

  get startTime() {
    return this.#startTime;
  }

  set startTime(startTime) {
    if (startTime > this.endTime) throw new Error('Start time must be before end time');
    this.#startTime = startTime;
  }

  get endTime() {
    return this.#endTime;
  }

  set endTime(endTime) {
    if (endTime < this.startTime) throw new Error('End time must be after start time');
    else if (endTime > this.startTime + BaseModel.MAX_WORKOUT_DURATION) throw new Error('End time must be within max workout duration of ' + BaseModel.MAX_WORKOUT_DURATION + ' seconds');
    this.#endTime = endTime;
  }

  get active() {
    return this.#active;
  }

  set active(active) {
    if (typeof active !== 'boolean') throw new Error('Active must be a boolean');
    this.#active = active;
  }

  start() {
    if (this.active) throw new Error('Workout is already active');
    this.startTime = new Date().toISOString();
    this.active = true;
  }

  end() {
    this.endTime = new Date().toISOString();
    this.active = false;
    
    // Calculate duration
    if (this.startTime && this.endTime) {
      const start = new Date(this.startTime).getTime();
      const end = new Date(this.endTime).getTime();
      this.duration = Math.floor((end - start) / 1000); // in seconds
    }
  }

  get exercises() {
    return this.#exercises;
  }

  set exercises(exercises) {
    if (!Array.isArray(exercises)) throw new Error('Exercises must be an array');
    
    // Convert any plain objects to Exercise instances
    this.#exercises = exercises.map((exercise, index) => {
      if (exercise instanceof Exercise) {
        // Update the order index
        exercise.orderIndex = index;
        return exercise;
      } else {
        // Create a new Exercise from the plain object
        return new Exercise(
          exercise.name || 'Untitled',
          Array.isArray(exercise.sets) ? exercise.sets.length : (exercise.sets || 1),
          exercise.notes || '',
          exercise.templateId,
          index
        );
      }
    });
  }
  
  // Add a new exercise to the template
  addExercise(name = 'Untitled', sets) {
    const exercise = new Exercise(name, sets, '', null, this.#exercises.length);
    this.#exercises = [...this.#exercises, exercise];
    return exercise;
  }
  
  // Remove an exercise at the specified index
  removeExercise(index) {
    if (index < 0 || index >= this.#exercises.length) {
      throw new Error('Invalid exercise index');
    }
    
    const newExercises = [...this.#exercises];
    newExercises.splice(index, 1);
    
    // Update the order indices
    newExercises.forEach((exercise, i) => {
      exercise.orderIndex = i;
    });
    
    this.#exercises = newExercises;
  }
  
  // Update a specific exercise
  updateExercise(index, field, value) {
    if (index < 0 || index >= this.#exercises.length) {
      throw new Error('Invalid exercise index');
    }
    
    // Create a new array to avoid reference issues
    const newExercises = [...this.#exercises];
    const exercise = newExercises[index];
    
    if (field === 'model' && value instanceof Exercise) {
      // Replace the entire model
      value.orderIndex = index;
      newExercises[index] = value;
    } else {
      // Update a specific field
      exercise[field] = value;
    }
    
    this.#exercises = newExercises;
  }
  
  // Get exercise by index
  getExercise(index) {
    if (index < 0 || index >= this.#exercises.length) {
      throw new Error('Invalid exercise index');
    }
    
    return this.#exercises[index];
  }

  // Save the template to the database
  async saveToDatabase(setIsLoading) {
    // Validate inputs
    if (!this.name.trim()) {
      Alert.alert('Error', 'Please enter a template name');
      return false;
    }

    if (setIsLoading) setIsLoading(true);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a template');
      }

      console.log('Saving template for user:', user.id);

      // Insert the workout template into the database
      const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .insert([
          { 
            creator_id: user.id,
            title: this.name,
            note: this.notes,
          }
        ])
        .select();
      
      if (templateError) throw templateError;
      
      // Insert exercises for the template
      for (const exercise of this.#exercises) {
        const { error: exerciseError } = await supabase
          .from('exercise_templates')
          .insert({
            template_id: template[0].id, // check this
            name: exercise.name,
            sets: exercise.sets,
            note: exercise.notes,
            order_index: exercise.orderIndex,
            // Store the full set details as JSON
            set_details: JSON.stringify((() => {
              // Get the sets from the exercise
              const exerciseSets = exercise.sets;
              
              // If sets is not an array or is undefined, return an empty array
              if (!exerciseSets || !Array.isArray(exerciseSets)) {
                return [];
              }
              
              // Map the sets to the correct format
              return exerciseSets.map(set => {
                // If it's a Set instance, extract its properties
                if (set instanceof Set) {
                  return {
                    weight: set.weight,
                    reps: set.reps,
                    rpe: set.rpe,
                    set_order: set.setOrder
                  };
                }
                // Otherwise, use the object as is
                return set;
              });
            })())
          });
        
        if (exerciseError) throw exerciseError;
      }

      Alert.alert(
        'Success', 
        'Workout template created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
      return true;
    } catch (error) {
      console.error('Error creating template:', error);
      Alert.alert('Error', error.message || 'Failed to create template');
      return false;
    } finally {
      if (setIsLoading) setIsLoading(false);
    }
  }
  
  // Clone this workout template
  clone() {
    const clone = new Workout(this.name, this.notes);
    clone.exercises = this.#exercises.map(exercise => exercise.clone());
    return clone;
  }
  
  // Convert to a plain object for database operations
  toJSON() {
    return {
      name: this.name,
      notes: this.notes,
      exercises: this.exercises.map(exercise => exercise.toJSON())
    };
  }
}