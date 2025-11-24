export type DistanceUnit = 'm' | 'km' | 'ft' | 'mi';

export interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  durationSeconds: number | null;
  distanceValue: number | null;
  distanceUnit: DistanceUnit | null;
  restSeconds: number | null;
  rpe: number | null;
  notes: string | null;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  notes: string | null;
  isTemplate: boolean;
  createdAt: string | null;
  userId: string;
  exercises: WorkoutExercise[];
}

export interface NewWorkoutSetPayload {
  setNumber?: number;
  reps?: number | null;
  weight?: number | null;
  durationSeconds?: number | null;
  distanceValue?: number | null;
  distanceUnit?: DistanceUnit | null;
  restSeconds?: number | null;
  rpe?: number | null;
  notes?: string | null;
}

export interface NewWorkoutExercisePayload {
  exerciseId: string;
  orderIndex?: number;
  sets: NewWorkoutSetPayload[];
}

export interface NewWorkoutPayload {
  name: string;
  notes?: string | null;
  isTemplate?: boolean;
  userId: string;
  exercises: NewWorkoutExercisePayload[];
}

export interface WorkoutSetFormValues {
  tempId: string;
  setNumber: number;
  reps: string;
  weight: string;
}

export interface WorkoutExerciseFormValues {
  tempId: string;
  exerciseId: string | null;
  exerciseName: string | null;
  sets: WorkoutSetFormValues[];
}

export interface WorkoutFormValues {
  name: string;
  notes: string;
  exercises: WorkoutExerciseFormValues[];
}
