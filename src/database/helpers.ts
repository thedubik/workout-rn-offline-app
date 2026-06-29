import { Q } from '@nozbe/watermelondb';
import { database } from './index';
import ExerciseModel from './models/Exercise';
import WorkoutSessionModel from './models/WorkoutSession';
import WorkoutTemplateModel from './models/WorkoutTemplate';
import type { Exercise } from '../types/exercise';
import type { SessionExercise, SetLog, TemplateExercise, WorkoutSession, WorkoutTemplate } from '../types/workout';

export const exercisesCollection = () => database.collections.get<ExerciseModel>('exercises');
export const templatesCollection = () =>
  database.collections.get<WorkoutTemplateModel>('workout_templates');
export const sessionsCollection = () =>
  database.collections.get<WorkoutSessionModel>('workout_sessions');

export const toExercise = (model: ExerciseModel): Exercise => ({
  id: model.id,
  name: model.name,
  muscleGroups: model.muscleGroups,
  equipment: model.equipment,
  type: model.type,
  isCustom: model.isCustom,
  notes: model.notes ?? undefined,
  createdAt: model.createdAt,
});

export const toTemplate = (model: WorkoutTemplateModel): WorkoutTemplate => ({
  id: model.id,
  name: model.name,
  exercises: model.exercises,
  createdAt: model.createdAt,
  lastPerformedAt: model.lastPerformedAt ?? undefined,
});

export const toSession = (model: WorkoutSessionModel): WorkoutSession => ({
  id: model.id,
  templateId: model.templateId ?? undefined,
  name: model.name,
  startedAt: model.startedAt,
  finishedAt: model.finishedAt,
  duration: model.duration,
  totalVolume: model.totalVolume,
  exercises: model.exercises,
  notes: model.notes ?? undefined,
});

// ---------------------------------------------------------------------------
// Exercises
// ---------------------------------------------------------------------------

export async function fetchExercises(): Promise<Exercise[]> {
  const records = await exercisesCollection().query(Q.sortBy('name', Q.asc)).fetch();
  return records.map(toExercise);
}

export async function fetchExerciseById(id: string): Promise<Exercise | null> {
  try {
    const record = await exercisesCollection().find(id);
    return toExercise(record);
  } catch {
    return null;
  }
}

export interface CreateExerciseInput {
  name: string;
  muscleGroups: Exercise['muscleGroups'];
  equipment: Exercise['equipment'];
  type: Exercise['type'];
  notes?: string;
}

export async function createExercise(input: CreateExerciseInput): Promise<Exercise> {
  const record = await exercisesCollection().create((exercise) => {
    exercise.name = input.name;
    exercise.muscleGroups = input.muscleGroups;
    exercise.equipment = input.equipment;
    exercise.type = input.type;
    exercise.isCustom = true;
    exercise.notes = input.notes;
    exercise.createdAt = Date.now();
  });
  return toExercise(record);
}

export async function updateExercise(id: string, input: Partial<CreateExerciseInput>): Promise<void> {
  const record = await exercisesCollection().find(id);
  await record.update((exercise) => {
    if (input.name !== undefined) exercise.name = input.name;
    if (input.muscleGroups !== undefined) exercise.muscleGroups = input.muscleGroups;
    if (input.equipment !== undefined) exercise.equipment = input.equipment;
    if (input.type !== undefined) exercise.type = input.type;
    if (input.notes !== undefined) exercise.notes = input.notes;
  });
}

export async function deleteExercise(id: string): Promise<void> {
  const record = await exercisesCollection().find(id);
  await record.destroyPermanently();
}

// ---------------------------------------------------------------------------
// Workout templates
// ---------------------------------------------------------------------------

export async function fetchTemplates(): Promise<WorkoutTemplate[]> {
  const records = await templatesCollection().query(Q.sortBy('created_at', Q.desc)).fetch();
  return records.map(toTemplate);
}

export async function fetchTemplateById(id: string): Promise<WorkoutTemplate | null> {
  try {
    const record = await templatesCollection().find(id);
    return toTemplate(record);
  } catch {
    return null;
  }
}

export interface SaveTemplateInput {
  name: string;
  exercises: TemplateExercise[];
}

export async function createTemplate(input: SaveTemplateInput): Promise<WorkoutTemplate> {
  const record = await templatesCollection().create((template) => {
    template.name = input.name;
    template.exercises = input.exercises;
    template.createdAt = Date.now();
  });
  return toTemplate(record);
}

export async function updateTemplate(id: string, input: SaveTemplateInput): Promise<void> {
  const record = await templatesCollection().find(id);
  await record.update((template) => {
    template.name = input.name;
    template.exercises = input.exercises;
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  const record = await templatesCollection().find(id);
  await record.destroyPermanently();
}

export async function markTemplatePerformed(id: string, timestamp: number): Promise<void> {
  try {
    const record = await templatesCollection().find(id);
    await record.update((template) => {
      template.lastPerformedAt = timestamp;
    });
  } catch {
    // Template may have been deleted; ignore.
  }
}

// ---------------------------------------------------------------------------
// Workout sessions
// ---------------------------------------------------------------------------

export async function fetchSessions(): Promise<WorkoutSession[]> {
  const records = await sessionsCollection().query(Q.sortBy('started_at', Q.desc)).fetch();
  return records.map(toSession);
}

export async function fetchSessionById(id: string): Promise<WorkoutSession | null> {
  try {
    const record = await sessionsCollection().find(id);
    return toSession(record);
  } catch {
    return null;
  }
}

export type CreateSessionInput = Omit<WorkoutSession, 'id'>;

export async function createSession(input: CreateSessionInput): Promise<WorkoutSession> {
  const record = await sessionsCollection().create((session) => {
    session.templateId = input.templateId;
    session.name = input.name;
    session.startedAt = input.startedAt;
    session.finishedAt = input.finishedAt;
    session.duration = input.duration;
    session.totalVolume = input.totalVolume;
    session.exercises = input.exercises;
    session.notes = input.notes;
  });
  return toSession(record);
}

export async function deleteSession(id: string): Promise<void> {
  const record = await sessionsCollection().find(id);
  await record.destroyPermanently();
}

/** All logged sets for a given exercise, newest session first. */
export interface ExerciseHistoryEntry {
  sessionId: string;
  date: number;
  sets: SetLog[];
}

export async function fetchExerciseHistory(exerciseId: string): Promise<ExerciseHistoryEntry[]> {
  const sessions = await fetchSessions();
  const entries: ExerciseHistoryEntry[] = [];

  sessions.forEach((session) => {
    const match = session.exercises.find((ex: SessionExercise) => ex.exerciseId === exerciseId);
    if (match && match.sets.length > 0) {
      entries.push({ sessionId: session.id, date: session.startedAt, sets: match.sets });
    }
  });

  return entries;
}

/** Most recent completed sets logged for an exercise (used as "previous performance"). */
export async function fetchLastPerformance(exerciseId: string): Promise<SetLog[] | null> {
  const history = await fetchExerciseHistory(exerciseId);
  return history.length > 0 ? history[0].sets : null;
}

// ---------------------------------------------------------------------------
// Maintenance
// ---------------------------------------------------------------------------

/** Permanently wipes all locally stored data (exercises, templates, sessions). */
export async function clearAllData(): Promise<void> {
  await database.write(async () => {
    await database.unsafeResetDatabase();
  });
}
