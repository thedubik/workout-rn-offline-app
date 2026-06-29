/** SetLog — individual completed set, weight always stored in kg */
export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup: boolean;
  completedAt: number;
}

/** SessionExercise — exercise within a completed session */
export interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

/** WorkoutSession — completed workout log */
export interface WorkoutSession {
  id: string;
  templateId?: string;
  name: string;
  startedAt: number;
  finishedAt: number;
  duration: number;
  totalVolume: number;
  exercises: SessionExercise[];
  notes?: string;
}

/** TemplateExercise — exercise slot inside a saved template */
export interface TemplateExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  order: number;
}

/** WorkoutTemplate — saved routine */
export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: number;
  lastPerformedAt?: number;
}

/** ActiveSet — a set being logged in the current workout */
export interface ActiveSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup: boolean;
  isCompleted: boolean;
  completedAt: number | null;
  previous?: { weight: number; reps: number } | null;
}

/** ActiveExercise — exercise + sets within the in-progress workout */
export interface ActiveExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: ActiveSet[];
}

export interface PersonalRecord {
  exerciseId: string;
  type: 'weight' | 'volume' | 'oneRepMax' | 'reps';
  value: number;
  achievedAt: number;
  sessionId: string;
}
