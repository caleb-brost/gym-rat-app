import type { NewExercisePayload } from './types';

export const parseCommaSeparatedList = (value: string): string[] =>
  value
    .split(',')
    .map((muscle) => muscle.trim())
    .filter(Boolean);

export const sortExercisesByName = <T extends { name: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export interface ExerciseFormValues {
  name: string;
  category: string;
  targetMuscles: string[];
  equipment: string[];
  notes: string;
}

interface ToPayloadOptions {
  includeEmpty?: boolean;
}

export const toExercisePayload = (
  values: ExerciseFormValues,
  options: ToPayloadOptions = {},
): NewExercisePayload => ({
  name: values.name,
  category: values.category ? values.category : undefined,
  targetMuscles:
    values.targetMuscles.length > 0
      ? values.targetMuscles
      : options.includeEmpty
        ? []
        : undefined,
  equipment:
    values.equipment.length > 0
      ? values.equipment
      : options.includeEmpty
        ? []
        : undefined,
  notes:
    values.notes
      ? values.notes
      : options.includeEmpty
        ? ''
        : undefined,
});
