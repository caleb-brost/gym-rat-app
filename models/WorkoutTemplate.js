export default class Workout extends BaseModel {
  #exercises;
  #name;
  #note;

  constructor(name, note = '', exercises = []) {
    super();

    this.name = name;
    this.note = note;
    this.exercises = exercises;
  }

  get exercises() {
    return this.#exercises;
  }

  set exercises(exercises) {
    if (!Array.isArray(exercises)) throw new Error('Exercises must be an array');
    else if (!exercises.every(e => e instanceof Exercise)) throw new Error('Exercises must be an array of Exercise instances');
    this.#exercises = exercises;
  }

  get name() {
    return this.#name;
  }

  set name(name) {
    if (typeof name !== 'string') throw new Error('Name must be a string');
    this.#name = name;
  }

  get note() {
    return this.#note;
  }

  set note(note) {
    if (typeof note !== 'string') throw new Error('Note must be a string');
    this.#note = note;
  }

  clone() {
    return new Workout(this.name, this.note, this.exercises);
  }
}