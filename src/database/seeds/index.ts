import { database } from '../index';
import ExerciseModel from '../models/Exercise';
import { defaultExercises } from './defaultExercises';

/**
 * Populates the exercise library with the default exercises on first launch.
 * No-op if any exercises already exist (custom or seeded).
 */
export async function seedDatabaseIfNeeded(): Promise<void> {
  const exercisesCollection = database.collections.get<ExerciseModel>('exercises');
  const existingCount = await exercisesCollection.query().fetchCount();

  if (existingCount > 0) {
    return;
  }

  await database.write(async () => {
    const records = defaultExercises.map((exercise) =>
      exercisesCollection.prepareCreate((record) => {
        record.name = exercise.name;
        record.muscleGroups = exercise.muscleGroups;
        record.equipment = exercise.equipment;
        record.type = exercise.type;
        record.isCustom = false;
        record.notes = undefined;
        record.createdAt = Date.now();
      }),
    );

    await database.batch(...records);
  });
}

export { defaultExercises } from './defaultExercises';
