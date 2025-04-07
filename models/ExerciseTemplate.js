import BaseModel from './BaseModel';

export default class ExerciseTemplate extends BaseModel {
  #name;
  #sets;
  #reps;
  #note;
  #templateId;
  #orderIndex;

  constructor(name = '', sets = 3, reps = 10, note = '', templateId = null, orderIndex = 0) {
    super();
    
    // Initialize private fields directly to avoid errors with setters
    this.#name = typeof name === 'string' ? name : '';
    this.#sets = Number(sets) || 3;
    this.#reps = Number(reps) || 10;
    this.#note = typeof note === 'string' ? note : '';
    this.#templateId = templateId;
    this.#orderIndex = Number(orderIndex) || 0;
  }

  get name() {
    return this.#name;
  }

  set name(name) {
    if (typeof name !== 'string') throw new Error('Name must be a string');
    this.#name = name;
  }

  get sets() {
    return this.#sets;
  }

  set sets(sets) {
    const setsNum = Number(sets);
    if (isNaN(setsNum) || setsNum < 0) throw new Error('Sets must be a positive number');
    this.#sets = setsNum;
  }
  
  get reps() {
    return this.#reps;
  }

  set reps(reps) {
    const repsNum = Number(reps);
    if (isNaN(repsNum) || repsNum < 0) throw new Error('Reps must be a positive number');
    this.#reps = repsNum;
  }
  
  get templateId() {
    return this.#templateId;
  }

  set templateId(templateId) {
    this.#templateId = templateId;
  }

  get orderIndex() {
    return this.#orderIndex;
  }

  set orderIndex(orderIndex) {
    const indexNum = Number(orderIndex);
    if (isNaN(indexNum) || indexNum < 0) throw new Error('Order index must be a positive number');
    this.#orderIndex = indexNum;
  }

  get note() {
    return this.#note;
  }

  set note(note) {
    if (typeof note !== 'string') throw new Error('Note must be a string');
    this.#note = note;
  }

  // Convert to a plain object for database operations
  toJSON() {
    return {
      name: this.name,
      sets: this.sets,
      reps: this.reps,
      note: this.note,
      template_id: this.templateId,
      order_index: this.orderIndex
    };
  }

  // Create a copy of this exercise template
  clone() {
    return new ExerciseTemplate(
      this.name,
      this.sets,
      this.reps,
      this.note,
      this.templateId,
      this.orderIndex
    );
  }
}