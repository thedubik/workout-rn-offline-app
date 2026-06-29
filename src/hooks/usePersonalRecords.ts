import { useMemo } from 'react';
import type { ExerciseHistoryEntry } from '../database/helpers';
import type { PersonalRecord } from '../types/workout';
import { calculateOneRepMax } from '../utils/oneRepMax';
import { calculateTotalVolume } from '../utils/volume';
import { useExerciseHistory } from './useExerciseHistory';

export interface PersonalRecordsSummary {
  maxWeight: PersonalRecord | null;
  maxOneRepMax: PersonalRecord | null;
  maxVolume: PersonalRecord | null;
  maxReps: PersonalRecord | null;
}

const EMPTY_SUMMARY: PersonalRecordsSummary = {
  maxWeight: null,
  maxOneRepMax: null,
  maxVolume: null,
  maxReps: null,
};

/** Computes best-ever PRs (heaviest set, best 1RM, biggest session volume, most reps) from history. */
export function computePersonalRecords(
  history: ExerciseHistoryEntry[],
  exerciseId: string,
): PersonalRecordsSummary {
  const summary: PersonalRecordsSummary = { ...EMPTY_SUMMARY };

  history.forEach((entry) => {
    const workingSets = entry.sets.filter((set) => !set.isWarmup);
    if (workingSets.length === 0) return;

    const sessionVolume = calculateTotalVolume(workingSets);
    if (!summary.maxVolume || sessionVolume > summary.maxVolume.value) {
      summary.maxVolume = {
        exerciseId,
        type: 'volume',
        value: sessionVolume,
        achievedAt: entry.date,
        sessionId: entry.sessionId,
      };
    }

    workingSets.forEach((set) => {
      if (!summary.maxWeight || set.weight > summary.maxWeight.value) {
        summary.maxWeight = {
          exerciseId,
          type: 'weight',
          value: set.weight,
          achievedAt: set.completedAt,
          sessionId: entry.sessionId,
        };
      }

      if (!summary.maxReps || set.reps > summary.maxReps.value) {
        summary.maxReps = {
          exerciseId,
          type: 'reps',
          value: set.reps,
          achievedAt: set.completedAt,
          sessionId: entry.sessionId,
        };
      }

      const oneRepMax = calculateOneRepMax(set.weight, set.reps);
      if (!summary.maxOneRepMax || oneRepMax > summary.maxOneRepMax.value) {
        summary.maxOneRepMax = {
          exerciseId,
          type: 'oneRepMax',
          value: oneRepMax,
          achievedAt: set.completedAt,
          sessionId: entry.sessionId,
        };
      }
    });
  });

  return summary;
}

export interface UsePersonalRecordsResult {
  records: PersonalRecordsSummary;
  loading: boolean;
}

/** Best-ever PRs for an exercise, derived from its logged session history. */
export function usePersonalRecords(exerciseId: string | undefined): UsePersonalRecordsResult {
  const { history, loading } = useExerciseHistory(exerciseId);

  const records = useMemo(
    () => (exerciseId ? computePersonalRecords(history, exerciseId) : EMPTY_SUMMARY),
    [history, exerciseId],
  );

  return { records, loading };
}
