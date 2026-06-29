import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchExerciseHistory, type ExerciseHistoryEntry } from '../database/helpers';

export interface UseExerciseHistoryResult {
  history: ExerciseHistoryEntry[];
  loading: boolean;
  refresh: () => void;
}

/** Loads the logged-set history for an exercise, refreshing whenever the screen regains focus. */
export function useExerciseHistory(exerciseId: string | undefined): UseExerciseHistoryResult {
  const [history, setHistory] = useState<ExerciseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!exerciseId) {
      setHistory([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    fetchExerciseHistory(exerciseId)
      .then((entries) => {
        if (!cancelled) setHistory(entries);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [exerciseId, reloadToken]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return { history, loading, refresh };
}
