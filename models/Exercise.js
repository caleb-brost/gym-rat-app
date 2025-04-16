import Set from './Set.js';
import Interval from './Interval.js';
import BaseModel from './BaseModel.js';
import supabase from '../db/supabaseClient.js';

export default class Exercise extends BaseModel {
  #sets;
  #intervals;
  #restTime;
  #orderIndex;
  
  constructor(name, sets = [], intervals = [], restTime = 0, notes = '', orderIndex = 1) {
    super(name, notes);

    this.#sets = sets;
    this.#intervals = intervals;
    this.#restTime = restTime;
    this.#orderIndex = orderIndex;
  }
  
  set restTime(restTime) {
    if (restTime < 0 || restTime > BaseModel.MAX_REST_TIME) throw new Error('Rest time must be a non-negative number less than ' + BaseModel.MAX_REST_TIME + ' seconds');
    this.#restTime = restTime;
  }
  
  set orderIndex(orderIndex) {
    if (orderIndex < 0 || orderIndex > BaseModel.MAX_ORDER_INDEX) throw new Error('Order index must be a non-negative number less than ' + BaseModel.MAX_ORDER_INDEX);
    this.#orderIndex = orderIndex;
  }

  get orderIndex() {
    return this.#orderIndex;
  }
  
  get restTime() {
    return this.#restTime;
  }
  
  set sets(sets) {
    if (!Array.isArray(sets)) throw new Error('Sets must be an array');
    this.#sets = sets;
  }
  
  get sets() {
    // Ensure we always return an array
    if (!Array.isArray(this.#sets)) {
      this.#sets = [];
    }
    return this.#sets;
  }
  
  set intervals(intervals) {
    if (!Array.isArray(intervals)) throw new Error('Intervals must be an array');
    this.#intervals = intervals;
  }
  
  get intervals() {
    return this.#intervals;
  }
  
  addSet(set) {
    // Initialize #sets if it's not already an array
    if (!Array.isArray(this.#sets)) {
      this.#sets = [];
    }
    
    if (!set) {
      // Create a new Set with default values
      set = new Set(0, 0, this.#sets.length + 1, 0);
    } else if (!(set instanceof Set)) {
      throw new Error('Set must be an instance of Set');
    }
    
    this.#sets.push(set);

    return this.#sets;
  }
  
  addInterval(interval) {
    if (!interval instanceof Interval) throw new Error('Interval must be an instance of Interval');
    else if (!this.intervals) this.intervals = [];
    else this.intervals.push(interval);
  }

  async saveToDatabase(templateId, workoutId, setIsLoading) {
    const { data: exercise, error: exerciseError } = await supabase
          .from('exercises')
          .insert({
            workout_id: workoutId,
            name: this.name,
            notes: this.notes,
            exercise_order: this.orderIndex,
            rest_time: this.restTime,
            workout_template_id: templateId
          })
          .select();
          
        if (exerciseError) throw exerciseError;

        const exerciseId = exercise[0].id; // test this
        const exerciseTemplateId = exercise[0].workout_template_id; // test this
        
        for (const set of this.sets) {
          console.log("Try saving set:", set.setOrder);
          await set.saveToDatabase(exerciseId, exerciseTemplateId, setIsLoading);
          console.log("Set saved successfully");
        }

        return true;
  }
  
  updateSet(setIndex, field, value) {
    // Initialize #sets if it's not already an array
    if (!Array.isArray(this.#sets)) {
      this.#sets = [];
      return this.#sets; // Return early since there's no set to update
    }
    
    if (!this.#sets[setIndex]) throw new Error('Invalid set index');
    
    // Use Set class methods to update values
    const set = this.#sets[setIndex];
    switch(field) {
      case 'weight':
        set.weight = value;
        break;
      case 'reps':
        set.reps = value;
        break;
      case 'rpe':
        set.rpe = value;
        break;
      case 'setOrder':
        set.setOrder = value;
        break;
      default:
        throw new Error(`Unknown set field: ${field}`);
    }
    
    return this.#sets;
  }

  removeSet(index) {
    if (Array.isArray(this.#sets) && index >= 0 && index < this.#sets.length) {
      this.#sets.splice(index, 1);
      // Update set orders
      this.#sets.forEach((set, i) => {
        set.setOrder = i + 1;
      });
    }
  }

  setName(name) {
    if (!name || typeof name !== 'string') throw new Error('Name must be a non-empty string');
    this.name = name;
    return this.name;
  }
  
  clone() {
    return new Exercise(this.name, this.sets, this.intervals, this.restTime, this.notes, this.orderIndex);
  }
}
