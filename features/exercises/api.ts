import { supabase } from '@/db/supabaseClient';
import type { Database } from '@/types/supabase';
import type {
  Equipment,
  Exercise,
  ExerciseType,
  NewExercisePayload,
} from './types';

type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
type EquipmentRow = Database['public']['Tables']['equipment']['Row'];
type ExerciseQueryRow = ExerciseRow & {
  equipment: Pick<EquipmentRow, 'id' | 'name' | 'description' | 'icon_url'> | null;
};
export const ADMIN_USER_ID = 'd308b30f-f210-4906-8444-c131191e087d';

const normalizeType = (value: ExerciseRow['type']): ExerciseType => {
  if (value === 'time' || value === 'distance' || value === 'weight') {
    return value;
  }
  return 'weight';
};

const mapExerciseRow = (row: ExerciseQueryRow): Exercise => ({
  id: row.id,
  name: row.name,
  category: row.category,
  muscleGroups: row.muscle_groups ?? [],
  description: row.description,
  type: normalizeType(row.type),
  equipmentId: row.equipment_id,
  equipmentName: row.equipment?.name ?? null,
  equipmentIconUrl: row.equipment?.icon_url ?? null,
  imageUrl: row.image_url ?? null,
  createdAt: row.created_at,
  userId: row.user_id,
});

const mapEquipmentRow = (row: EquipmentRow): Equipment => ({
  id: row.id,
  name: row.name,
  description: row.description,
  iconUrl: row.icon_url,
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
    .select(
      '*, equipment:equipment_id(id, name, description, icon_url)',
    )
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
    category: payload.category ?? null,
    type: payload.type ?? 'weight',
    muscle_groups:
      payload.muscleGroups && payload.muscleGroups.length > 0
        ? payload.muscleGroups
        : null,
    description: payload.description?.trim() || null,
    equipment_id: payload.equipmentId ?? null,
    image_url: payload.imageUrl?.trim() || null,
    user_id: payload.userId ?? null,
  };

  const { data, error } = await supabase
    .from('exercises')
    .insert(insertPayload)
    .select('*, equipment:equipment_id(id, name, description, icon_url)')
    .single();

  if (error || !data) {
    throw error;
  }

  return mapExerciseRow(data);
};

export const getExercise = async (id: string): Promise<Exercise | null> => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*, equipment:equipment_id(id, name, description, icon_url)')
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
      category: payload.category ?? null,
    }),
    ...(payload.type !== undefined && {
      type: payload.type,
    }),
    ...(payload.muscleGroups !== undefined && {
      muscle_groups:
        payload.muscleGroups.length > 0 ? payload.muscleGroups : null,
    }),
    ...(payload.description !== undefined && {
      description: payload.description?.trim() || null,
    }),
    ...(payload.equipmentId !== undefined && {
      equipment_id: payload.equipmentId ?? null,
    }),
    ...(payload.imageUrl !== undefined && {
      image_url: payload.imageUrl?.trim() || null,
    }),
    ...(payload.userId !== undefined && {
      user_id: payload.userId ?? null,
    }),
  };

  const { data, error } = await supabase
    .from('exercises')
    .update(updatePayload)
    .eq('id', id)
    .select('*, equipment:equipment_id(id, name, description, icon_url)')
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

export const listEquipment = async (): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapEquipmentRow);
};

export const exercisesApi = {
  create: createExercise,
  get: getExercise,
  update: updateExercise,
  delete: deleteExercise,
  list: listExercises,
  listEquipment,
};
