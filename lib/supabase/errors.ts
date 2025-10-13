import type { PostgrestError } from '@supabase/supabase-js';

const isPostgrestError = (error: unknown): error is PostgrestError =>
  typeof error === 'object' &&
  error !== null &&
  'message' in error &&
  typeof (error as Record<string, unknown>).message === 'string';

export const getSupabaseErrorMessage = (error: unknown, fallback: string): string => {
  if (isPostgrestError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
