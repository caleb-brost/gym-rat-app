import BaseModel from './BaseModel';
import Set from './Set';

export default class ExerciseTemplate extends BaseModel {

  #sets;
  #orderIndex;
  #setDetails = [];

  constructor(name = '', sets = 3, note = '', orderIndex = 0) {
    super(name, note);
    
    // Initialize private fields directly to avoid errors with setters
    this.#sets = sets;
    this.#orderIndex = orderIndex;
    
    // Initialize default set details
    this.initializeSetDetails();
  }

  get sets() {
    return this.#sets;
  }

  set sets(sets) {
    const setsNum = Number(sets);
    if (isNaN(setsNum) || setsNum < 0) throw new Error('Sets must be a positive number');
    this.#sets = setsNum;
    
    // Update set details if the number of sets changes
    this.updateSetDetailsCount();
  }
  
  // Get all set details
  get setDetails() {
    return this.#setDetails;
  }
  
  // Set all set details at once
  set setDetails(details) {
    if (!Array.isArray(details)) throw new Error('Set details must be an array');
    
    // Convert any plain objects to Set instances
    this.#setDetails = details.map((detail, index) => {
      if (detail instanceof Set) {
        return detail;
      } else {
        return new Set(
          detail.weight || 0,
          detail.reps || 0,
          index + 1,
          detail.rpe || 0
        );
      }
    });
    
    // Update the sets count to match the details
    this.#sets = this.#setDetails.length;
  }

  get orderIndex() {
    return this.#orderIndex;
  }

  set orderIndex(orderIndex) {
    const indexNum = Number(orderIndex);
    if (isNaN(indexNum) || indexNum < 0) throw new Error('Order index must be a positive number');
    this.#orderIndex = indexNum;
  }

  // Initialize set details based on the current sets count
  initializeSetDetails() {
    // Only initialize if empty
    if (this.#setDetails.length === 0) {
      this.#setDetails = Array(this.#sets).fill().map((_, i) => {
        return new Set(0, 0, i + 1, 0);
      });
    }
  }
  
  // Update set details count if the number of sets changes
  updateSetDetailsCount() {
    const currentCount = this.#setDetails.length;
    
    if (this.#sets > currentCount) {
      // Add more sets
      const newSets = Array(this.#sets - currentCount).fill().map((_, i) => {
        return new Set(0, 0, currentCount + i + 1, 0);
      });
      this.#setDetails = [...this.#setDetails, ...newSets];
    } else if (this.#sets < currentCount) {
      // Remove excess sets
      this.#setDetails = this.#setDetails.slice(0, this.#sets);
    }
  }
  
  // Add a new set
  addSet() {
    const newSet = new Set(0, 0, this.#setDetails.length + 1, 0);
    // Create a new array to avoid reference issues
    this.#setDetails = [...this.#setDetails, newSet];
    this.#sets = this.#setDetails.length;
    return newSet;
  }
  
  // Remove a set at the specified index
  removeSet(index) {
    if (index < 0 || index >= this.#setDetails.length) {
      throw new Error('Invalid set index');
    }
    
    // Create a new array to avoid reference issues
    const newSetDetails = [...this.#setDetails];
    newSetDetails.splice(index, 1);
    
    // Update set order numbers
    newSetDetails.forEach((set, idx) => {
      set.setOrder = idx + 1;
    });
    
    this.#setDetails = newSetDetails;
    this.#sets = this.#setDetails.length;
  }
  
  // Update a specific set detail
  updateSetDetail(setIndex, field, value) {
    if (setIndex < 0 || setIndex >= this.#setDetails.length) {
      throw new Error('Invalid set index');
    }
    
    // Create a new array to avoid reference issues
    const newSetDetails = [...this.#setDetails];
    const set = newSetDetails[setIndex];
    set[field] = value;
    
    this.#setDetails = newSetDetails;
  }
  
  // Convert to a plain object for database operations
  toJSON() {
    return {
      name: this.name,
      sets: this.sets,
      notes: this.notes,
      template_id: this.templateId,
      order_index: this.orderIndex,
      set_details: this.#setDetails.map(set => ({
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe,
        set_order: set.setOrder
      }))
    };
  }
  
  // Create a copy of this exercise template
  clone() {
    const clone = new ExerciseTemplate(
      this.name,
      this.sets,
      this.notes,
      this.templateId,
      this.orderIndex
    );
    
    // Clone the set details
    clone.setDetails = this.#setDetails.map(set => set.clone());
    
    return clone;
  }
}