import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { ExerciseModel, WorkoutSessionModel, WorkoutTemplateModel } from './models';
import { schema } from './schema';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error) => {
    console.error('Failed to set up WatermelonDB', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [ExerciseModel, WorkoutTemplateModel, WorkoutSessionModel],
});
