export type ExerciseCategory = 'Push' | 'Pull' | 'Legs' | 'Mobility' | 'Cardio' | 'Other';

export type ExerciseType = 'weight' | 'time' | 'distance';

export type ExerciseMuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Quadriceps'
  | 'Hamstrings'
  | 'Glutes'
  | 'Shoulders'
  | 'Rear Deltoids'
  | 'Traps'
  | 'Biceps'
  | 'Triceps'
  | 'Calves'
  | 'Core'
  | 'Forearms';

export interface Equipment {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory | null;
  muscleGroups: ExerciseMuscleGroup[];
  description: string | null;
  type: ExerciseType;
  equipmentId: string | null;
  equipmentName: string | null;
  equipmentIconUrl: string | null;
  imageUrl: string | null;
  createdAt: string | null;
  userId: string | null;
}

export type NewExercisePayload = {
  name: string;
  category?: ExerciseCategory | null;
  muscleGroups?: ExerciseMuscleGroup[];
  description?: string | null;
  type?: ExerciseType;
  equipmentId?: string | null;
  imageUrl?: string | null;
  userId?: string | null;
};
