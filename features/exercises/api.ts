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
  isCustom: row.is_custom,
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
    target_muscles:
      payload.targetMuscles && payload.targetMuscles.length > 0 ? payload.targetMuscles : null,
    notes: payload.notes?.trim() || null,
    equipment: payload.equipment ?? null,
    user_id: payload.userId ?? null,
    is_custom: true,
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

export const exercisesApi = {
  list: listExercises,
  create: createExercise,
};
