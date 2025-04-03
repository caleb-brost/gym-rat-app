export default class BaseModel {
  static #MAX_NAME_LENGTH = 50; // temp value
  static #MAX_NOTES_LENGTH = 255; // temp value
  static #MAX_REST_TIME = 1800; // temp value
  static #MAX_WORKOUT_DURATION = 86400; // temp value
  static #MAX_EXERCISES = 50; // temp value
  static #MAX_SETS = 50; // temp value
  static #MAX_INTERVALS = 50; // temp value
  static #MAX_RPE = 10; // temp value
  static #MAX_DISTANCE = 1000; // temp value
  static #MAX_DURATION = 1000; // temp value

  #name;
  #notes;

  constructor(name, notes = '') {
    this.name = name;
    this.notes = notes;
  }

  set name(name) {
    if (!name) throw new Error('Name cannot be empty');
    else if (name.length > BaseModel.#MAX_NAME_LENGTH && typeof name !== 'string') throw new Error('Name must be a string that does not exceed max character length of ' + BaseModel.#MAX_NAME_LENGTH);
    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  set notes(notes) {
    if (notes.length > BaseModel.#MAX_NOTES_LENGTH && typeof notes !== 'string') throw new Error('Notes must be a string that does not exceed max character length of ' + BaseModel.#MAX_NOTES_LENGTH);
    this.#notes = notes;
  }

  get notes() {
    return this.#notes;
  }

  clone() {
    return new BaseModel(this.#name, this.#notes);
  }
}