import { useEffect, useState } from 'react';
import { useWorkoutStore } from '../store/workoutStore';

/** Elapsed time (seconds) since the active workout started, ticking every second. */
export function useWorkoutTimer(): number {
  const isActive = useWorkoutStore((state) => state.isActive);
  const startedAt = useWorkoutStore((state) => state.startedAt);
  const [elapsed, setElapsed] = useState(() =>
    startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0,
  );

  useEffect(() => {
    if (!isActive || !startedAt) {
      setElapsed(0);
      return undefined;
    }

    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isActive, startedAt]);

  return elapsed;
}
