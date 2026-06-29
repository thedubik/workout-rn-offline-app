import { Model } from '@nozbe/watermelondb';
import { field, json, text } from '@nozbe/watermelondb/decorators';
import type { SessionExercise } from '../../types/workout';

const sanitizeExercises = (raw: unknown): SessionExercise[] => (Array.isArray(raw) ? raw : []);

export default class WorkoutSessionModel extends Model {
  static table = 'workout_sessions';

  @field('template_id') templateId?: string;

  @text('name') name!: string;

  @field('started_at') startedAt!: number;

  @field('finished_at') finishedAt!: number;

  @field('duration') duration!: number;

  @field('total_volume') totalVolume!: number;

  @json('exercises', sanitizeExercises) exercises!: SessionExercise[];

  @text('notes') notes?: string;
}
