/**
 * Estimated 1-rep max using the Epley formula.
 * A single rep is already a 1RM, so it's returned as-is.
 */
export const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};
