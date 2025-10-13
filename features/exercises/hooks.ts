import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseErrorMessage } from '@/lib/supabase/errors';
import { createExercise, listExercises } from './api';
import type { Exercise, NewExercisePayload } from './types';

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
        const exercise = await createExercise(payload);
        setExercises((prev) =>
          [...prev, exercise].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setError(null);
        return exercise;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  return {
    exercises,
    loading,
    error,
    creating,
    refresh,
    createExercise: handleCreate,
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
