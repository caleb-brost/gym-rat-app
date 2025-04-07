import BaseModel from './BaseModel.js';
import ExerciseTemplate from './ExerciseTemplate.js';

export default class WorkoutTemplate extends BaseModel {
  #exercises = [];

  constructor(name, notes = '', exercises = []) {
    super(name, notes);
    this.exercises = exercises;
  }

  get exercises() {
    return this.#exercises;
  }

  set exercises(exercises) {
    if (!Array.isArray(exercises)) throw new Error('Exercises must be an array');
    
    // Convert any plain objects to ExerciseTemplate instances
    this.#exercises = exercises.map((exercise, index) => {
      if (exercise instanceof ExerciseTemplate) {
        // Update the order index
        exercise.orderIndex = index;
        return exercise;
      } else {
        // Create a new ExerciseTemplate from the plain object
        return new ExerciseTemplate(
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
  addExercise(name = 'Untitled', sets = 3) {
    const exercise = new ExerciseTemplate(name, sets, '', null, this.#exercises.length);
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
    
    if (field === 'model' && value instanceof ExerciseTemplate) {
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
  
  // Clone this workout template
  clone() {
    const clone = new WorkoutTemplate(this.name, this.notes);
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