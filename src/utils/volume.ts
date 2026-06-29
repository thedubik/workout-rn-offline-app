interface VolumeSet {
  weight: number;
  reps: number;
  isWarmup?: boolean;
}

/** Volume contributed by a single set (kg). Warm-up sets don't count. */
export const calculateSetVolume = (set: VolumeSet): number => {
  if (set.isWarmup) return 0;
  return set.weight * set.reps;
};

/** Total working volume (kg) across a list of sets. */
export const calculateTotalVolume = (sets: VolumeSet[]): number =>
  sets.reduce((total, set) => total + calculateSetVolume(set), 0);
