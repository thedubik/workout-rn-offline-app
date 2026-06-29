import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'exercises',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'muscle_groups', type: 'string' },
        { name: 'equipment', type: 'string' },
        { name: 'exercise_type', type: 'string' },
        { name: 'is_custom', type: 'boolean' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'workout_templates',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'exercises', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'last_performed_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'workout_sessions',
      columns: [
        { name: 'template_id', type: 'string', isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'started_at', type: 'number' },
        { name: 'finished_at', type: 'number' },
        { name: 'duration', type: 'number' },
        { name: 'total_volume', type: 'number' },
        { name: 'exercises', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
      ],
    }),
  ],
});
