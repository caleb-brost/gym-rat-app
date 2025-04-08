export default class Set {
  #MAX_WEIGHT = 1000; // temp value
  #MAX_REPS = 1000; // temp value
  #MAX_SET_ORDER = 50; // temp value
  #MAX_RPE = 10; // temp value

  #weight;
  #reps;
  #rpe;
  #setOrder;
  
  constructor(weight = 0, reps = 0, setOrder = 1, rpe = 0) {
    this.weight = weight;
    this.reps = reps;
    this.setOrder = setOrder;
    this.rpe = rpe;
  }

  set weight(weight) {
    if (weight < 0 || weight > this.#MAX_WEIGHT) throw new Error('Weight must be a non-negative number less than ' + this.#MAX_WEIGHT);
    this.#weight = weight;
  }

  get weight() {
    return this.#weight;
  }

  set reps(reps) {
    if (reps < 0 || reps > this.#MAX_REPS) throw new Error('Reps must be a non-negative number less than ' + this.#MAX_REPS);
    this.#reps = reps;
  }

  get reps() {
    return this.#reps;
  }

  set rpe(rpe) {
    if (rpe < 0 || rpe > this.#MAX_RPE) throw new Error('RPE must be a number between 0 and ' + this.#MAX_RPE);
    this.#rpe = rpe;
  }

  get rpe() {
    return this.#rpe;
  }

  set setOrder(setOrder) {
    if (setOrder < 1 || setOrder > this.#MAX_SET_ORDER) throw new Error('Set order must be a positive integer less than ' + this.#MAX_SET_ORDER);
    this.#setOrder = setOrder;
  }

  get setOrder() {
    return this.#setOrder;
  }

  map() {
    console.log("MAP!!");
  }
  clone() {
    return new Set(this.#weight, this.#reps, this.#setOrder, this.#rpe);
  }
}