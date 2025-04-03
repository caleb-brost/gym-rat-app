export default class Interval {
  #distance;
  #duration; // in seconds
  
  constructor(distance = 0, duration = 0) {
    this.#distance = distance;
    this.#duration = duration;
  }
  
  set distance(distance) {
    if (distance < 0) throw new Error('Distance must be a non-negative number');
    this.#distance = distance;
  }
  
  get distance() {
    return this.#distance;
  }
  
  set duration(duration) {
    if (duration < 0) throw new Error('Duration must be a non-negative number');
    this.#duration = duration;
  }
  
  get duration() {
    return this.#duration;
  }
  
  clone() {
    return new Interval(this.#distance, this.#duration);
  }
}