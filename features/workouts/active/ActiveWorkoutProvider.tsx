import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Exercise } from '@/features/exercises/types';
import type { Workout } from '../types';
import type { ActiveWorkoutExercise, ActiveWorkoutSet, ActiveWorkoutState } from './types';
import {
  cloneWorkoutToActive,
  createEmptyActiveExercise,
  createEmptyActiveSet,
  createEmptyActiveWorkout,
} from './utils';

type SetUpdate = Partial<Pick<ActiveWorkoutSet, 'reps' | 'weight' | 'completed'>>;

interface ActiveWorkoutContextValue {
  activeWorkout: ActiveWorkoutState | null;
  isActive: boolean;
  startFromTemplate: (workout: Workout) => void;
  startEmpty: (name?: string) => void;
  updateName: (name: string) => void;
  updateNotes: (notes: string) => void;
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, changes: SetUpdate) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
  finishWorkout: () => void;
  resetWorkout: () => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextValue | undefined>(undefined);

const updateExercises = (
  workout: ActiveWorkoutState,
  exerciseId: string,
  updater: (exercise: ActiveWorkoutExercise) => ActiveWorkoutExercise,
): ActiveWorkoutState => ({
  ...workout,
  exercises: workout.exercises.map((exercise) =>
    exercise.id === exerciseId ? updater(exercise) : exercise,
  ),
});

export const ActiveWorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);

  const startFromTemplate = useCallback((workout: Workout) => {
    setActiveWorkout(cloneWorkoutToActive(workout));
  }, []);

  const startEmpty = useCallback((name?: string) => {
    setActiveWorkout(createEmptyActiveWorkout(name));
  }, []);

  const updateName = useCallback((name: string) => {
    setActiveWorkout((prev) => (prev ? { ...prev, name } : prev));
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setActiveWorkout((prev) => (prev ? { ...prev, notes } : prev));
  }, []);

  const addExercise = useCallback((exercise: Exercise) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }

      const nextExercise = createEmptyActiveExercise(exercise, prev.exercises.length);

      return {
        ...prev,
        exercises: [...prev.exercises, nextExercise],
      };
    });
  }, []);

  const removeExercise = useCallback((exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }

      const remaining = prev.exercises.filter((exercise) => exercise.id !== exerciseId);

      return {
        ...prev,
        exercises: remaining.map((exercise, index) => ({
          ...exercise,
          orderIndex: index,
        })),
      };
    });
  }, []);

  const addSet = useCallback((exerciseId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }

      return updateExercises(prev, exerciseId, (exercise) => ({
        ...exercise,
        sets: [...exercise.sets, createEmptyActiveSet(exercise.sets.length + 1)],
      }));
    });
  }, []);

  const removeSet = useCallback((exerciseId: string, setId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }

      return updateExercises(prev, exerciseId, (exercise) => {
        const remainingSets = exercise.sets.filter((set) => set.id !== setId);
        const normalizedSets =
          remainingSets.length > 0
            ? remainingSets.map((set, index) => ({
                ...set,
                setNumber: index + 1,
              }))
            : [createEmptyActiveSet(1)];

        return {
          ...exercise,
          sets: normalizedSets,
        };
      });
    });
  }, []);

  const updateSet = useCallback((exerciseId: string, setId: string, changes: SetUpdate) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }

      return updateExercises(prev, exerciseId, (exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...changes } : set)),
      }));
    });
  }, []);

  const toggleSetComplete = useCallback((exerciseId: string, setId: string) => {
    setActiveWorkout((prev) => {
      if (!prev) {
        return prev;
      }

      return updateExercises(prev, exerciseId, (exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) =>
          set.id === setId ? { ...set, completed: !set.completed } : set,
        ),
      }));
    });
  }, []);

  const finishWorkout = useCallback(() => {
    setActiveWorkout((prev) => (prev ? { ...prev, endedAt: new Date().toISOString() } : prev));
  }, []);

  const resetWorkout = useCallback(() => {
    setActiveWorkout(null);
  }, []);

  const value = useMemo(
    () => ({
      activeWorkout,
      isActive: !!activeWorkout,
      startFromTemplate,
      startEmpty,
      updateName,
      updateNotes,
      addExercise,
      removeExercise,
      addSet,
      removeSet,
      updateSet,
      toggleSetComplete,
      finishWorkout,
      resetWorkout,
    }),
    [
      activeWorkout,
      startFromTemplate,
      startEmpty,
      updateName,
      updateNotes,
      addExercise,
      removeExercise,
      addSet,
      removeSet,
      updateSet,
      toggleSetComplete,
      finishWorkout,
      resetWorkout,
    ],
  );

  return <ActiveWorkoutContext.Provider value={value}>{children}</ActiveWorkoutContext.Provider>;
};

export const useActiveWorkout = (): ActiveWorkoutContextValue => {
  const context = useContext(ActiveWorkoutContext);
  if (!context) {
    throw new Error('useActiveWorkout must be used inside an ActiveWorkoutProvider.');
  }
  return context;
};
