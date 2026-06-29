import { create } from 'zustand';
import type { Exercise } from '../types/exercise';
import type { ActiveExercise, ActiveSet, SetLog, WorkoutSession } from '../types/workout';
import { calculateTotalVolume } from '../utils/volume';
import { generateId } from '../utils/units';

export interface RestTimerState {
  duration: number;
  startedAt: number;
}

export interface WorkoutStoreState {
  isActive: boolean;
  startedAt: number | null;
  finishedAt: number | null;
  templateId?: string;
  name: string;
  exercises: ActiveExercise[];
  restTimer: RestTimerState | null;
  lastSession: WorkoutSession | null;
}

export interface WorkoutStore extends WorkoutStoreState {
  startWorkout: (options?: { name?: string; templateId?: string }) => void;
  setName: (name: string) => void;
  addExercise: (exercise: Exercise, targetSets?: number, previousSets?: SetLog[] | null) => void;
  removeExercise: (exerciseId: string) => void;
  reorderExercises: (exercises: ActiveExercise[]) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<Pick<ActiveSet, 'weight' | 'reps' | 'rpe' | 'isWarmup'>>,
  ) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
  logSet: (exerciseId: string, set: SetLog) => void;
  startRestTimer: (duration: number) => void;
  clearRestTimer: () => void;
  finishWorkout: () => WorkoutSession;
  cancelWorkout: () => void;
  reset: () => void;
}

const initialState: WorkoutStoreState = {
  isActive: false,
  startedAt: null,
  finishedAt: null,
  templateId: undefined,
  name: 'Workout',
  exercises: [],
  restTimer: null,
  lastSession: null,
};

const buildActiveSet = (setNumber: number, previous?: SetLog | null): ActiveSet => ({
  id: generateId(),
  setNumber,
  weight: previous?.weight ?? 0,
  reps: previous?.reps ?? 0,
  rpe: undefined,
  isWarmup: false,
  isCompleted: false,
  completedAt: null,
  previous: previous ? { weight: previous.weight, reps: previous.reps } : null,
});

export const useWorkoutStore = create<WorkoutStore>()((set, get) => ({
  ...initialState,

  startWorkout: (options) =>
    set({
      ...initialState,
      isActive: true,
      startedAt: Date.now(),
      name: options?.name ?? 'Workout',
      templateId: options?.templateId,
      exercises: [],
    }),

  setName: (name) => set({ name }),

  addExercise: (exercise, targetSets = 3, previousSets = null) =>
    set((state) => {
      const sets = Array.from({ length: Math.max(1, targetSets) }, (_, index) =>
        buildActiveSet(index + 1, previousSets?.[index]),
      );
      const newExercise: ActiveExercise = {
        id: generateId(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets,
      };
      return { exercises: [...state.exercises, newExercise] };
    }),

  removeExercise: (exerciseId) =>
    set((state) => ({ exercises: state.exercises.filter((ex) => ex.id !== exerciseId) })),

  reorderExercises: (exercises) => set({ exercises }),

  addSet: (exerciseId) =>
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const last = ex.sets[ex.sets.length - 1];
        const newSet: ActiveSet = {
          id: generateId(),
          setNumber: ex.sets.length + 1,
          weight: last?.weight ?? 0,
          reps: last?.reps ?? 0,
          rpe: undefined,
          isWarmup: false,
          isCompleted: false,
          completedAt: null,
          previous: null,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }),
    })),

  removeSet: (exerciseId, setId) =>
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const remaining = ex.sets
          .filter((s) => s.id !== setId)
          .map((s, index) => ({ ...s, setNumber: index + 1 }));
        return { ...ex, sets: remaining };
      }),
    })),

  updateSet: (exerciseId, setId, patch) =>
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        };
      }),
    })),

  toggleSetComplete: (exerciseId, setId) =>
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id !== setId) return s;
            const isCompleted = !s.isCompleted;
            return { ...s, isCompleted, completedAt: isCompleted ? Date.now() : null };
          }),
        };
      }),
    })),

  logSet: (exerciseId, log) =>
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex;
        const existing = ex.sets.find((s) => s.setNumber === log.setNumber);
        if (existing) {
          return {
            ...ex,
            sets: ex.sets.map((s) =>
              s.id === existing.id
                ? {
                    ...s,
                    weight: log.weight,
                    reps: log.reps,
                    rpe: log.rpe,
                    isWarmup: log.isWarmup,
                    isCompleted: true,
                    completedAt: log.completedAt,
                  }
                : s,
            ),
          };
        }
        return {
          ...ex,
          sets: [
            ...ex.sets,
            {
              id: generateId(),
              setNumber: log.setNumber,
              weight: log.weight,
              reps: log.reps,
              rpe: log.rpe,
              isWarmup: log.isWarmup,
              isCompleted: true,
              completedAt: log.completedAt,
              previous: null,
            },
          ],
        };
      }),
    })),

  startRestTimer: (duration) => set({ restTimer: { duration, startedAt: Date.now() } }),

  clearRestTimer: () => set({ restTimer: null }),

  finishWorkout: () => {
    const state = get();
    const finishedAt = Date.now();
    const session = buildSessionFromState(state, finishedAt);
    set({ isActive: false, finishedAt, lastSession: session });
    return session;
  },

  cancelWorkout: () => set({ ...initialState }),

  reset: () => set({ ...initialState }),
}));

/** Builds the WorkoutSession payload (completed sets only) from the current store state. */
export const buildSessionFromState = (
  state: WorkoutStoreState,
  finishedAt: number = Date.now(),
): WorkoutSession => {
  const startedAt = state.startedAt ?? finishedAt;

  const exercises = state.exercises
    .map((ex) => ({
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      sets: ex.sets
        .filter((s) => s.isCompleted)
        .map(
          (s, index): SetLog => ({
            setNumber: index + 1,
            weight: s.weight,
            reps: s.reps,
            rpe: s.rpe,
            isWarmup: s.isWarmup,
            completedAt: s.completedAt ?? finishedAt,
          }),
        ),
    }))
    .filter((ex) => ex.sets.length > 0);

  const allSets = exercises.flatMap((ex) => ex.sets);

  return {
    id: generateId(),
    templateId: state.templateId,
    name: state.name,
    startedAt,
    finishedAt,
    duration: Math.max(0, Math.round((finishedAt - startedAt) / 1000)),
    totalVolume: calculateTotalVolume(allSets),
    exercises,
  };
};
