export interface ActiveWorkoutSet {
  id: string;
  setNumber: number;
  reps: string;
  weight: string;
  completed: boolean;
  templateSetId?: string;
}

export interface ActiveWorkoutExercise {
  id: string;
  exerciseId: string | null;
  exerciseName: string;
  orderIndex: number;
  sets: ActiveWorkoutSet[];
  templateExerciseId?: string;
}

export interface ActiveWorkoutState {
  id: string;
  templateId?: string;
  name: string;
  notes: string;
  startedAt: string;
  endedAt?: string | null;
  exercises: ActiveWorkoutExercise[];
}
