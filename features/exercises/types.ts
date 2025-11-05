export interface Exercise {
  id: string;
  name: string;
  category: string | null;
  targetMuscles: string[];
  notes: string | null;
  equipment: string | null;
  createdAt: string | null;
  userId: string | null;
}

export type NewExercisePayload = {
  name: string;
  category?: string;
  targetMuscles?: string[];
  notes?: string;
  equipment?: string;
  userId?: string;
};
