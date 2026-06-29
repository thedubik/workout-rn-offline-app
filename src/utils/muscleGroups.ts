import { MUSCLE_GROUPS, MuscleGroup } from '../types/exercise';

export { MUSCLE_GROUPS };
export type { MuscleGroup };

/** Accent color used for badges/chips for each muscle group. */
export const muscleGroupColors: Record<MuscleGroup, string> = {
  Chest: '#EF4444',
  Back: '#3B82F6',
  Legs: '#22C55E',
  Shoulders: '#F59E0B',
  Arms: '#8B5CF6',
  Core: '#EC4899',
  Cardio: '#06B6D4',
};

/** MaterialCommunityIcons icon name for each muscle group. */
export const muscleGroupIcons: Record<MuscleGroup, string> = {
  Chest: 'weight-lifter',
  Back: 'human-handsup',
  Legs: 'run',
  Shoulders: 'arm-flex-outline',
  Arms: 'arm-flex',
  Core: 'yoga',
  Cardio: 'heart-pulse',
};
