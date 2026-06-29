import type { WeightUnit } from '../types/settings';

const KG_TO_LBS = 2.20462262;

/** Converts a weight stored in kg to the given display unit. */
export const fromKg = (weightKg: number, unit: WeightUnit): number =>
  unit === 'lbs' ? weightKg * KG_TO_LBS : weightKg;

/** Converts a weight entered in the given display unit back to kg for storage. */
export const toKg = (weight: number, unit: WeightUnit): number =>
  unit === 'lbs' ? weight / KG_TO_LBS : weight;

/** Rounds a display weight to a sensible precision (whole numbers above 10). */
export const roundWeight = (weight: number): number => {
  if (weight >= 10) return Math.round(weight);
  return Math.round(weight * 10) / 10;
};

/** Formats a weight stored in kg for display, e.g. `"60 kg"` / `"132 lbs"`. */
export const formatWeight = (weightKg: number, unit: WeightUnit): string =>
  `${roundWeight(fromKg(weightKg, unit))} ${unit}`;

/** Generates a short unique id for client-side-only entities (active sets/exercises). */
export const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
