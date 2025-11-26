import Fuse from 'fuse.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseErrorMessage } from '@/lib/supabase/errors';
import { createWorkout, deleteWorkout, listWorkouts } from './api';
import type { NewWorkoutPayload, Workout } from './types';

export const useWorkouts = (userId: string | null) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setWorkouts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listWorkouts(userId);
      setWorkouts(data);
    } catch (refreshError) {
      setError(getSupabaseErrorMessage(refreshError, 'Failed to load workouts.'));
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleCreate = useCallback(
    async (payload: Omit<NewWorkoutPayload, 'userId'>) => {
      if (!userId) {
        throw new Error('You must be signed in to create a workout.');
      }

      setCreating(true);

      try {
        const workout = await createWorkout({ ...payload, userId });
        setWorkouts((prev) => [workout, ...prev]);
        setError(null);
        return workout;
      } catch (err) {
        setError(getSupabaseErrorMessage(err, 'Unable to create workout.'));
        throw err;
      } finally {
        setCreating(false);
      }
    },
    [userId],
  );

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWorkout(id);
      setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
    } catch (err) {
      setError(getSupabaseErrorMessage(err, 'Unable to delete workout.'));
      throw err;
    } finally {
      setDeletingId(null);
    }
  }, []);

  return {
    workouts,
    loading,
    error,
    creating,
    deletingId,
    refresh,
    createWorkout: handleCreate,
    deleteWorkout: handleDelete,
  };
};

export const useWorkoutSearch = (workouts: Workout[]) => {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    if (workouts.length === 0) {
      return null;
    }

    return new Fuse(workouts, {
      keys: [
        { name: 'name', weight: 0.7 },
        { name: 'notes', weight: 0.3 },
      ],
      threshold: 0.4,
    });
  }, [workouts]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return workouts;
    }

    if (!fuse) {
      return workouts;
    }

    return fuse.search(query).map((result) => result.item);
  }, [query, workouts, fuse]);

  return {
    query,
    setQuery,
    results,
    isFiltering: query.trim().length > 0,
  };
};
