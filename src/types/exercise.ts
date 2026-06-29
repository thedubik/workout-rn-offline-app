export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Bodyweight',
  'Cable',
  'Other',
] as const;

export type Equipment = (typeof EQUIPMENT_TYPES)[number];

export const EXERCISE_TYPES = ['strength', 'cardio', 'mobility'] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

/** Exercise — predefined or user-created */
export interface Exercise {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
  type: ExerciseType;
  isCustom: boolean;
  notes?: string;
  createdAt: number;
}
