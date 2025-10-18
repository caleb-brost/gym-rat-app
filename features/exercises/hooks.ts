import { supabase } from '@/db/supabaseClient';
import { getSupabaseErrorMessage } from '@/lib/supabase/errors';
import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createExercise, deleteExercise, listExercises, updateExercise } from './api';
import type { Exercise, NewExercisePayload } from './types';
import { sortExercisesByName } from './utils';

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listExercises();
      setExercises(data);
    } catch (refreshError) {
      setError(getSupabaseErrorMessage(refreshError, 'Failed to load exercises.'));
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(
    async (payload: NewExercisePayload) => {
      setCreating(true);
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        payload.userId = session?.user?.id.trim();

        if (!payload.userId) {
          throw new Error('You must be signed in to create an exercise.');
        }

        const exercise = await createExercise({ ...payload});
        setExercises((prev) => sortExercisesByName([...prev, exercise]));
        setError(null);
        return exercise;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  const handleUpdate = useCallback(
    async (id: string, payload: Partial<NewExercisePayload>) => {
      setUpdatingId(id);
      try {
        const updated = await updateExercise(id, payload);
        setExercises((prev) =>
          sortExercisesByName(
            prev.map((exercise) => (exercise.id === id ? updated : exercise)),
          ),
        );
        setError(null);
        return updated;
      } finally {
        setUpdatingId(null);
      }
    },
    [],
  );

  const handleDelete = useCallback(
      async (id: string) => {
    setDeletingId(id);
    try {
      await deleteExercise(id);
      setExercises((prev) => prev.filter((exercises) => exercises.id !== id));
      setError(null);
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    exercises,
    loading,
    error,
    creating,
    updatingId,
    deletingId,
    refresh,
    createExercise: handleCreate,
    updateExercise: handleUpdate,
    deleteExercise: handleDelete,
  };
};

export const useExerciseSearch = (exercises: Exercise[]) => {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    if (exercises.length === 0) {
      return null;
    }

    return new Fuse(exercises, {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'category', weight: 0.25 },
        { name: 'targetMuscles', weight: 0.15 },
      ],
      threshold: 0.4,
    });
  }, [exercises]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return exercises;
    }

    if (!fuse) {
      return exercises;
    }

    return fuse.search(query).map((result) => result.item);
  }, [query, exercises, fuse]);

  return {
    query,
    setQuery,
    results,
    isFiltering: query.trim().length > 0,
  };
};
