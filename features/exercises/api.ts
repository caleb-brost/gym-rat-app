import { supabase } from '@/db/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Exercise, NewExercisePayload } from './types';

type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
export const ADMIN_USER_ID = 'd308b30f-f210-4906-8444-c131191e087d';

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
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const ownerIds = new Set<string>([ADMIN_USER_ID]);
  const currentUserId = session?.user?.id;

  if (currentUserId) {
    ownerIds.add(currentUserId);
  }

  const filters: string[] = Array.from(ownerIds).map((id) => `user_id.eq.${id}`);
  filters.push('user_id.is.null');

  const query = supabase
    .from('exercises')
    .select('*')
    .order('name', { ascending: true });

  if (filters.length > 0) {
    query.or(filters.join(','));
  }

  const { data, error } = await query;

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
      equipment: payload.equipment?.trim() || null,
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
