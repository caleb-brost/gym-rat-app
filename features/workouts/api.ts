import { supabase } from '@/db/supabaseClient';
import type { Database } from '@/types/supabase';
import type { NewWorkoutPayload, Workout } from './types';

const workoutSelect = `
  id,
  name,
  notes,
  created_at,
  is_template,
  user_id,
  workout_exercises:workout_exercises!workout_exercises_workout_id_fkey (
    id,
    exercise_id,
    order_index,
    workout_sets:workout_sets!workout_sets_workout_exercise_id_fkey (
      id,
      set_number,
      reps,
      weight,
      duration_seconds,
      distance_value,
      distance_unit,
      rest_seconds,
      rpe,
      notes,
      completed
    )
  )
`;

type WorkoutRow = Database['public']['Tables']['workouts']['Row'];
type WorkoutExerciseRow = Database['public']['Tables']['workout_exercises']['Row'];
type WorkoutSetRow = Database['public']['Tables']['workout_sets']['Row'];
type ExerciseRow = Database['public']['Tables']['exercises']['Row'];

type WorkoutQueryRow = WorkoutRow & {
  workout_exercises: Array<
    WorkoutExerciseRow & {
      workout_sets: WorkoutSetRow[] | null;
    }
  > | null;
};
type WorkoutExerciseInsertResult = Pick<WorkoutExerciseRow, 'id' | 'order_index'>;
type WorkoutExerciseIdRow = Pick<WorkoutExerciseRow, 'id'>;
type WorkoutIdRow = Pick<WorkoutRow, 'id'>;
type ExerciseNameRow = Pick<ExerciseRow, 'id' | 'name'>;
interface ExerciseNameLookup {
  [id: string]: string | undefined;
}

const mapWorkoutRow = (row: WorkoutQueryRow, exerciseNames: ExerciseNameLookup): Workout => ({
  id: row.id,
  name: row.name,
  notes: row.notes,
  isTemplate: row.is_template,
  createdAt: row.created_at,
  userId: row.user_id,
  exercises: (row.workout_exercises ?? [])
    .slice()
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((exercise) => ({
      id: exercise.id,
      exerciseId: exercise.exercise_id,
      exerciseName: exerciseNames[exercise.exercise_id] ?? 'Exercise',
      orderIndex: exercise.order_index ?? 0,
      sets: (exercise.workout_sets ?? [])
        .slice()
        .sort((a, b) => (a.set_number ?? 0) - (b.set_number ?? 0))
        .map((set) => ({
          id: set.id,
          setNumber: set.set_number ?? 0,
          reps: set.reps,
          weight: set.weight,
          durationSeconds: set.duration_seconds,
          distanceValue: set.distance_value,
          distanceUnit: set.distance_unit,
          restSeconds: set.rest_seconds,
          rpe: set.rpe,
          notes: set.notes,
          completed: set.completed ?? false,
        })),
    })),
});

const collectExerciseIds = (rows: WorkoutQueryRow[]): string[] => {
  const ids = new Set<string>();

  rows.forEach((row) => {
    (row.workout_exercises ?? []).forEach((exercise) => {
      if (exercise.exercise_id) {
        ids.add(exercise.exercise_id);
      }
    });
  });

  return Array.from(ids);
};

const fetchExerciseNameLookup = async (
  rows: WorkoutQueryRow[],
): Promise<ExerciseNameLookup> => {
  const ids = collectExerciseIds(rows);

  if (ids.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('exercises')
    .select('id, name')
    .in('id', ids)
    .returns<ExerciseNameRow[]>();

  if (error) {
    throw error;
  }

  const lookup: ExerciseNameLookup = {};

  (data ?? []).forEach((exercise) => {
    lookup[exercise.id] = exercise.name;
  });

  return lookup;
};

export const listWorkouts = async (userId: string): Promise<Workout[]> => {
  const { data, error } = await supabase
    .from('workouts')
    .select(workoutSelect)
    .eq('user_id', userId)
    .eq('is_template', true)
    .order('created_at', { ascending: false })
    .order('order_index', { ascending: true, foreignTable: 'workout_exercises' })
    .order('set_number', {
      ascending: true,
      foreignTable: 'workout_exercises.workout_sets',
    })
    .returns<WorkoutQueryRow[]>();

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const exerciseNames = await fetchExerciseNameLookup(rows);
  return rows.map((row) => mapWorkoutRow(row, exerciseNames));
};

export const getWorkout = async (id: string): Promise<Workout | null> => {
  const { data, error } = await supabase
    .from('workouts')
    .select(workoutSelect)
    .eq('id', id)
    .returns<WorkoutQueryRow[]>()
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const exerciseNames = await fetchExerciseNameLookup([data]);
  return mapWorkoutRow(data, exerciseNames);
};

export const createWorkout = async (payload: NewWorkoutPayload): Promise<Workout> => {
  const insertPayload: Database['public']['Tables']['workouts']['Insert'] = {
    name: payload.name.trim(),
    notes: payload.notes?.trim() || null,
    is_template: payload.isTemplate ?? true,
    user_id: payload.userId,
  };

  const { data: workoutRow, error: workoutError } = await supabase
    .from('workouts')
    .insert(insertPayload)
    .select('id')
    .returns<WorkoutIdRow[]>()
    .single();

  if (workoutError || !workoutRow) {
    throw workoutError;
  }

  const workoutId = workoutRow.id;

  if (payload.exercises.length > 0) {
    const exercisePayloads: Database['public']['Tables']['workout_exercises']['Insert'][] =
      payload.exercises.map((exercise, index) => ({
        workout_id: workoutId,
        exercise_id: exercise.exerciseId,
        order_index: exercise.orderIndex ?? index,
      }));

    const { data: createdExercises, error: exerciseError } = await supabase
      .from('workout_exercises')
      .insert(exercisePayloads)
      .select('id, order_index')
      .returns<WorkoutExerciseInsertResult[]>();

    if (exerciseError) {
      throw exerciseError;
    }

    if (createdExercises && createdExercises.length > 0) {
      const setPayloads: Database['public']['Tables']['workout_sets']['Insert'][] = [];

      const sortedCreated = [...createdExercises].sort(
        (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0),
      );
      const sortedPayload = [...payload.exercises].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
      );

      sortedCreated.forEach((createdExercise, index) => {
        const matchingPayload = sortedPayload[index];
        if (!matchingPayload) {
          return;
        }

        (matchingPayload.sets ?? []).forEach((set, setIndex) => {
          setPayloads.push({
            workout_exercise_id: createdExercise.id,
            set_number: set.setNumber ?? setIndex + 1,
            reps: set.reps ?? null,
            weight: set.weight ?? null,
            duration_seconds: set.durationSeconds ?? null,
            distance_value: set.distanceValue ?? null,
            distance_unit: set.distanceUnit ?? null,
            rest_seconds: set.restSeconds ?? null,
            rpe: set.rpe ?? null,
            notes: set.notes?.trim() || null,
            completed: false,
          });
        });
      });

      if (setPayloads.length > 0) {
        const { error: setError } = await supabase.from('workout_sets').insert(setPayloads);
        if (setError) {
          throw setError;
        }
      }
    }
  }

  const workout = await getWorkout(workoutId);

  if (!workout) {
    throw new Error('Unable to load workout after creation.');
  }

  return workout;
};

export const deleteWorkout = async (id: string): Promise<void> => {
  const { data: workoutExerciseRows, error: workoutExerciseError } = await supabase
    .from('workout_exercises')
    .select('id')
    .eq('workout_id', id)
    .returns<WorkoutExerciseIdRow[]>();

  if (workoutExerciseError) {
    throw workoutExerciseError;
  }

  const workoutExerciseIds = (workoutExerciseRows ?? []).map((row) => row.id);

  if (workoutExerciseIds.length > 0) {
    const { error: setError } = await supabase
      .from('workout_sets')
      .delete()
      .in('workout_exercise_id', workoutExerciseIds);

    if (setError) {
      throw setError;
    }
  }

  const { error: deleteExercisesError } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('workout_id', id);

  if (deleteExercisesError) {
    throw deleteExercisesError;
  }

  const { error: workoutError } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id);

  if (workoutError) {
    throw workoutError;
  }
};

export const workoutsApi = {
  list: listWorkouts,
  get: getWorkout,
  create: createWorkout,
  delete: deleteWorkout,
};
