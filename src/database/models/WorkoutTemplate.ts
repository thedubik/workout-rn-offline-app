import { Model } from '@nozbe/watermelondb';
import { field, json, text } from '@nozbe/watermelondb/decorators';
import type { TemplateExercise } from '../../types/workout';

const sanitizeExercises = (raw: unknown): TemplateExercise[] => (Array.isArray(raw) ? raw : []);

export default class WorkoutTemplateModel extends Model {
  static table = 'workout_templates';

  @text('name') name!: string;

  @json('exercises', sanitizeExercises) exercises!: TemplateExercise[];

  @field('created_at') createdAt!: number;

  @field('last_performed_at') lastPerformedAt?: number;
}
