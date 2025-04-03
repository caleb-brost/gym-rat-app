import Exercise from './Exercise.js';
import BaseModel from './BaseModel.js';

export default class Workout extends BaseModel {
  #exercises;
  #startTime;
  #endTime;
  #active;
  
  constructor(name, notes = '', exercises = [], startTime, endTime, active) {
    super();

    this.name = name;
    this.notes = notes;
    this.exercises = exercises;
    this.startTime = startTime;
    this.endTime = endTime;
    this.active = active;
  }
  
  set exercises(exercises) {
    if (!Array.isArray(exercises)) throw new Error('Exercises must be an array');
    else if (!exercises.every(e => e instanceof Exercise)) throw new Error('Exercises must be an array of Exercise instances');
    this.#exercises = exercises;
  }
  
  get exercises() {
    return this.#exercises;
  }
  
  set startTime(startTime) {
    if (!startTime || typeof startTime !== 'string') throw new Error('Start time must be a string');
    this.#startTime = startTime;
  }
  
  get startTime() {
    return this.#startTime;
  }
  
  set endTime(endTime) {
    if (!endTime || typeof endTime !== 'string') throw new Error('End time must be a string');
    else if (endTime < this.startTime) throw new Error('End time must be after start time');
    else if (endTime > this.startTime + BaseModel.MAX_WORKOUT_DURATION) throw new Error('End time must be within max workout duration of ' + BaseModel.MAX_WORKOUT_DURATION + ' seconds');
    this.#endTime = endTime;
  }
  
  get endTime() {
    return this.#endTime;
  }
  
  set active(active) {
    if (typeof active !== 'boolean') throw new Error('Active must be a boolean');
    this.#active = active;
  }
  
  get active() {
    return this.#active;
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
  
  clone() {
    return new Workout(this.name, this.exercises, this.startTime, this.endTime, this.active);
  }
}