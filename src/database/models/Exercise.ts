import { Model } from '@nozbe/watermelondb';
import { field, json, text } from '@nozbe/watermelondb/decorators';
import type { Equipment, ExerciseType, MuscleGroup } from '../../types/exercise';

const sanitizeMuscleGroups = (raw: unknown): MuscleGroup[] => (Array.isArray(raw) ? raw : []);

export default class ExerciseModel extends Model {
  static table = 'exercises';

  @text('name') name!: string;

  @json('muscle_groups', sanitizeMuscleGroups) muscleGroups!: MuscleGroup[];

  @field('equipment') equipment!: Equipment;

  @field('exercise_type') type!: ExerciseType;

  @field('is_custom') isCustom!: boolean;

  @text('notes') notes?: string;

  @field('created_at') createdAt!: number;
}
