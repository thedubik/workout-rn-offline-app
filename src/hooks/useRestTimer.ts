import { useCallback, useEffect, useState } from 'react';
import BackgroundTimer from 'react-native-background-timer';
import { useWorkoutStore } from '../store/workoutStore';

export interface UseRestTimerResult {
  isActive: boolean;
  duration: number;
  remaining: number;
  /** 0 → just started, 1 → finished. */
  progress: number;
  start: (seconds: number) => void;
  addTime: (seconds: number) => void;
  skip: () => void;
}

/** Tracks the shared rest-timer countdown, ticking even while the app is backgrounded. */
export function useRestTimer(): UseRestTimerResult {
  const restTimer = useWorkoutStore((state) => state.restTimer);
  const startRestTimer = useWorkoutStore((state) => state.startRestTimer);
  const clearRestTimer = useWorkoutStore((state) => state.clearRestTimer);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!restTimer) return undefined;

    setNow(Date.now());
    const id = BackgroundTimer.setInterval(() => setNow(Date.now()), 1000);
    return () => BackgroundTimer.clearInterval(id);
  }, [restTimer]);

  const duration = restTimer?.duration ?? 0;
  const elapsed = restTimer ? (now - restTimer.startedAt) / 1000 : 0;
  const remaining = restTimer ? Math.max(0, Math.ceil(duration - elapsed)) : 0;
  const progress = restTimer && duration > 0 ? Math.min(1, Math.max(0, elapsed / duration)) : 0;

  useEffect(() => {
    if (restTimer && remaining <= 0) {
      clearRestTimer();
    }
  }, [restTimer, remaining, clearRestTimer]);

  const addTime = useCallback(
    (seconds: number) => {
      if (!restTimer) return;
      startRestTimer(Math.max(0, remaining) + seconds);
    },
    [restTimer, remaining, startRestTimer],
  );

  return {
    isActive: !!restTimer,
    duration,
    remaining,
    progress,
    start: startRestTimer,
    addTime,
    skip: clearRestTimer,
  };
}
