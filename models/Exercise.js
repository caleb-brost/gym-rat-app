import Set from './Set.js';
import Interval from './Interval.js';
import BaseModel from './BaseModel.js';

export default class Exercise extends BaseModel {
  #sets;
  #intervals;
  #restTime;
  
  constructor(name, sets = [], intervals = [], restTime = 0, notes = '') {
    super(name, notes);

    this.#sets = sets;
    this.#intervals = intervals;
    this.#restTime = restTime;
  }
  
  set restTime(restTime) {
    if (restTime < 0 || restTime > BaseModel.MAX_REST_TIME) throw new Error('Rest time must be a non-negative number less than ' + BaseModel.MAX_REST_TIME + ' seconds');
    this.#restTime = restTime;
  }
  
  get restTime() {
    return this.#restTime;
  }
  
  set sets(sets) {
    if (!Array.isArray(sets)) throw new Error('Sets must be an array');
    this.#sets = sets;
  }
  
  get sets() {
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
    if (!set instanceof Set) throw new Error('Set must be an instance of Set');
    else if (!this.sets) this.sets = [];
    else this.sets.push(set);
  }
  
  addInterval(interval) {
    if (!interval instanceof Interval) throw new Error('Interval must be an instance of Interval');
    else if (!this.intervals) this.intervals = [];
    else this.intervals.push(interval);
  }
  
  clone() {
    return new Exercise(this.name, this.sets, this.intervals, this.restTime, this.notes);
  }
}
