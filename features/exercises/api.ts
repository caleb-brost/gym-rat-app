import { supabase } from '@/db/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Exercise, NewExercisePayload } from './types';

type ExerciseRow = Database['public']['Tables']['exercises']['Row'];

const mapExerciseRow = (row: ExerciseRow): Exercise => ({
  id: row.id,
  name: row.name,
  category: row.category,
  targetMuscles: row.target_muscles ?? [],
  notes: row.notes,
  equipment: row.equipment,
  createdAt: row.created_at,
  userId: row.user_id,
});

export const listExercises = async (): Promise<Exercise[]> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapExerciseRow);
};

export const createExercise = async (payload: NewExercisePayload): Promise<Exercise> => {
  const insertPayload: Database['public']['Tables']['exercises']['Insert'] = {
    name: payload.name.trim(),
    category: payload.category?.trim() || null,
    target_muscles: payload.targetMuscles && payload.targetMuscles.length > 0 ? payload.targetMuscles : null,
    notes: payload.notes?.trim() || null,
    equipment: payload.equipment ?? null,
    user_id: payload.userId ?? null,
  };

  const { data, error } = await supabase
    .from('exercises')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !data) {
    throw error;
  }

  return mapExerciseRow(data);
};

export const getExercise = async (id: string): Promise<Exercise | null> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    throw error;
  }

  return data ? mapExerciseRow(data) : null;
}

export const updateExercise = async (id: string, payload: Partial<NewExercisePayload>): Promise<Exercise> => {
  const updatePayload: Database['public']['Tables']['exercises']['Update'] = {
    ...(payload.name !== undefined && { name: payload.name.trim() }),
    ...(payload.category !== undefined && {
      category: payload.category?.trim() || null,
    }),
    ...(payload.targetMuscles !== undefined && {
      target_muscles:
        payload.targetMuscles.length > 0 ? payload.targetMuscles : null,
    }),
    ...(payload.notes !== undefined && {
      notes: payload.notes?.trim() || null,
    }),
    ...(payload.equipment !== undefined && {
      equipment: payload.equipment ?? null,
    }),
    ...(payload.userId !== undefined && {
      user_id: payload.userId ?? null,
    }),
  };

  const { data, error } = await supabase
    .from('exercises')
    .update(updatePayload)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw error;
  }

  return mapExerciseRow(data);
};

export const deleteExercise = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
};

export const exercisesApi = {
  create: createExercise,
  get: getExercise,
  update: updateExercise,
  delete: deleteExercise,
  list: listExercises,
};
