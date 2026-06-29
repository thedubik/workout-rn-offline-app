import { fetchExerciseById, fetchLastPerformance } from '../database/helpers';
import { useWorkoutStore } from '../store/workoutStore';
import type { WorkoutTemplate } from '../types/workout';

/**
 * Initializes the workout store for a new active workout, optionally pre-filling
 * exercises and target sets from a template (with the most recent performance as
 * the "previous" reference for each set).
 */
export async function startWorkoutFromTemplate(template?: WorkoutTemplate | null): Promise<void> {
  const { startWorkout, addExercise } = useWorkoutStore.getState();
  startWorkout({ name: template?.name, templateId: template?.id });

  if (!template) return;

  const sortedExercises = [...template.exercises].sort((a, b) => a.order - b.order);

  const prepared = await Promise.all(
    sortedExercises.map(async (templateExercise) => ({
      templateExercise,
      exercise: await fetchExerciseById(templateExercise.exerciseId),
      previousSets: await fetchLastPerformance(templateExercise.exerciseId),
    })),
  );

  prepared.forEach(({ templateExercise, exercise, previousSets }) => {
    if (!exercise) return;
    addExercise(exercise, templateExercise.targetSets, previousSets);
  });
}
