import type { NewWorkoutPayload, WorkoutExerciseFormValues, WorkoutFormValues, WorkoutSetFormValues } from './types';

const randomId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const createEmptyWorkoutSetForm = (setNumber: number): WorkoutSetFormValues => ({
  tempId: randomId(),
  setNumber,
  reps: '',
  weight: '',
});

export const createEmptyWorkoutExerciseForm = (): WorkoutExerciseFormValues => ({
  tempId: randomId(),
  exerciseId: null,
  exerciseName: null,
  sets: [createEmptyWorkoutSetForm(1)],
});

export const createEmptyWorkoutFormValues = (): WorkoutFormValues => ({
  name: '',
  notes: '',
  exercises: [],
});

const parseNumberInput = (value: string): number | null => {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const toWorkoutPayload = (
  values: WorkoutFormValues,
  { isTemplate = true }: { isTemplate?: boolean } = {},
): Omit<NewWorkoutPayload, 'userId'> => ({
  name: values.name.trim(),
  notes: values.notes.trim() ? values.notes.trim() : null,
  isTemplate,
  exercises: values.exercises
    .filter((exercise) => !!exercise.exerciseId)
    .map((exercise, index) => ({
      exerciseId: exercise.exerciseId!,
      orderIndex: index,
      sets: exercise.sets.map((set, setIndex) => ({
        setNumber: set.setNumber || setIndex + 1,
        reps: parseNumberInput(set.reps),
        weight: parseNumberInput(set.weight),
      })),
    })),
});
