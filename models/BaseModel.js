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
  #note;

  constructor(name, note = '') {
    this.name = name;
    this.note = note;
  }

  set name(name) {
    if (name.length > BaseModel.#MAX_NAME_LENGTH && typeof name !== 'string') throw new Error('Name must be a string that does not exceed max character length of ' + BaseModel.#MAX_NAME_LENGTH);
    this.#name = name;
  }

  get name() {
    return this.#name;
  }

  set note(note) {
    if (note.length > BaseModel.#MAX_NOTES_LENGTH && typeof note !== 'string') throw new Error('Notes must be a string that does not exceed max character length of ' + BaseModel.#MAX_NOTES_LENGTH);
    this.#note = note;
  }

  get note() {
    return this.#note;
  }

  clone() {
    return new BaseModel(this.#name, this.#note);
  }
}