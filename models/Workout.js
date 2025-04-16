import BaseModel from './BaseModel.js';
import Exercise from './Exercise.js';
import supabase from '../db/supabaseClient.js';
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
    this.#exercises = exercises.map((exercise) => {
      if (exercise instanceof Exercise) {
        return exercise;
      } else {
        // Create a new Exercise from the plain object
        return new Exercise(exercise.name, exercise.sets, exercise.intervals, exercise.restTime, exercise.notes, exercise.orderIndex);
      }
    });
  }
  
  // Add a new exercise to the template
  addExercise(name = 'Untitled', sets = []) {
    const exercise = new Exercise(name, sets, [], 0, '', this.#exercises.length + 1);
    this.#exercises = [...this.#exercises, exercise];
    return exercise;
  }
  
  // Remove an exercise at the specified index
  removeExercise(index) {
    if (index < 0 || index >= this.#exercises.length) {
      throw new Error('Invalid exercise index');
    }

    this.#exercises = this.#exercises.filter((_, i) => i !== index);
  }
  
  // Update a specific exercise
  updateExercise(index, field, value) {
    if (index < 0 || index >= this.#exercises.length) {
      throw new Error('Invalid exercise index');
    }

    if (field === 'model') {
      this.#exercises[index] = value;
    } else {
      this.#exercises[index][field] = value;
    }
    

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
      alert('Please enter a template name');
      return false;
    }
    if (!this.exercises.length) {
      alert('Please add at least one exercise');
      return false;
    }
    if (!this.exercises[0].sets.length) {
      alert('Please add at least one set to each exercise');
      return false;
    }

    if (setIsLoading) setIsLoading(true);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to create a template');
      }

      // Insert the workout template into the database
      const { data: template, error: templateError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          title: this.name,
          notes: this.notes,
        })
        .select();
      
      if (templateError) throw templateError;

      // get newly created workout template id
      
      const templateId = template[0].template_id; // test this
      const workoutId = template[0].id;
      
      // Insert exercises for the template
      if (!this.#exercises) throw new Error('No exercises found');
      if (!this.#exercises[0].sets) throw new Error('No sets found');

      for (const exercise of this.#exercises) {
        console.log('Saving exercise:', exercise.name, 'order:', exercise.orderIndex);

        // Save the exercise to the database
        await exercise.saveToDatabase(templateId, workoutId, setIsLoading);
      }

      alert('Workout template created successfully!');
      
      return true;
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
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