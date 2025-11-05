import type {
  ExerciseCategory,
  ExerciseMuscleGroup,
  ExerciseType,
  NewExercisePayload,
} from './types';

export const parseCommaSeparatedList = (value: string): string[] =>
  value
    .split(',')
    .map((muscle) => muscle.trim())
    .filter(Boolean);

export const sortExercisesByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export interface ExerciseFormValues {
  name: string;
  category: ExerciseCategory | '';
  type: ExerciseType;
  muscleGroups: ExerciseMuscleGroup[];
  equipmentId: string | null;
  description: string;
}

interface ToPayloadOptions {
  includeEmpty?: boolean;
}

export const toExercisePayload = (
  values: ExerciseFormValues,
  options: ToPayloadOptions = {},
): NewExercisePayload => ({
  name: values.name,
  category: values.category ? values.category : options.includeEmpty ? null : undefined,
  type: values.type,
  muscleGroups:
    values.muscleGroups.length > 0
      ? values.muscleGroups
      : options.includeEmpty
        ? []
        : undefined,
  equipmentId:
    values.equipmentId !== null
      ? values.equipmentId
      : options.includeEmpty
        ? null
        : undefined,
  description:
    values.description
      ? values.description
      : options.includeEmpty
        ? ''
        : undefined,
});
