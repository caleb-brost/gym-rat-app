import type { Exercise } from '@/features/exercises/types';
import type { Workout, WorkoutExercise, WorkoutSet } from '../types';
import type { ActiveWorkoutExercise, ActiveWorkoutSet, ActiveWorkoutState } from './types';

export const createTempId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createEmptyActiveSet = (setNumber: number): ActiveWorkoutSet => ({
  id: createTempId(),
  setNumber,
  reps: '',
  weight: '',
  completed: false,
});

export const createActiveSetFromTemplate = (
  set: WorkoutSet,
  fallbackOrder: number,
): ActiveWorkoutSet => ({
  id: createTempId(),
  templateSetId: set.id,
  setNumber: set.setNumber ?? fallbackOrder,
  reps: set.reps !== null ? String(set.reps) : '',
  weight: set.weight !== null ? String(set.weight) : '',
  completed: false,
});

export const createEmptyActiveExercise = (
  exercise: Pick<Exercise, 'id' | 'name'>,
  orderIndex: number,
): ActiveWorkoutExercise => ({
  id: createTempId(),
  exerciseId: exercise.id,
  exerciseName: exercise.name,
  orderIndex,
  sets: [createEmptyActiveSet(1)],
});

export const createActiveExerciseFromTemplate = (
  exercise: WorkoutExercise,
  orderIndex: number,
): ActiveWorkoutExercise => ({
  id: createTempId(),
  templateExerciseId: exercise.id,
  exerciseId: exercise.exerciseId,
  exerciseName: exercise.exerciseName,
  orderIndex,
  sets:
    exercise.sets.length > 0
      ? exercise.sets.map((set, index) => createActiveSetFromTemplate(set, index + 1))
      : [createEmptyActiveSet(1)],
});

export const createEmptyActiveWorkout = (name?: string): ActiveWorkoutState => ({
  id: createTempId(),
  name: name?.trim() || 'New Workout',
  notes: '',
  startedAt: new Date().toISOString(),
  endedAt: null,
  exercises: [],
});

export const cloneWorkoutToActive = (workout: Workout): ActiveWorkoutState => ({
  id: createTempId(),
  templateId: workout.id,
  name: `${workout.name} (Active)`,
  notes: workout.notes ?? '',
  startedAt: new Date().toISOString(),
  endedAt: null,
  exercises: workout.exercises
    .slice()
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map((exercise, index) => createActiveExerciseFromTemplate(exercise, index)),
});
