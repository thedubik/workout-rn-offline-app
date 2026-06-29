import type { Equipment, ExerciseType, MuscleGroup } from '../../types/exercise';

export interface DefaultExerciseSeed {
  name: string;
  muscleGroups: MuscleGroup[];
  equipment: Equipment;
  type: ExerciseType;
}

/**
 * Preloaded exercise library shown on first launch.
 * 60+ exercises spanning every muscle group + cardio.
 */
export const defaultExercises: DefaultExerciseSeed[] = [
  // Chest
  { name: 'Bench Press', muscleGroups: ['Chest'], equipment: 'Barbell', type: 'strength' },
  { name: 'Incline Bench Press', muscleGroups: ['Chest'], equipment: 'Barbell', type: 'strength' },
  { name: 'Decline Bench Press', muscleGroups: ['Chest'], equipment: 'Barbell', type: 'strength' },
  { name: 'Dumbbell Bench Press', muscleGroups: ['Chest'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Dumbbell Flyes', muscleGroups: ['Chest'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Push-ups', muscleGroups: ['Chest', 'Arms'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Cable Crossover', muscleGroups: ['Chest'], equipment: 'Cable', type: 'strength' },
  { name: 'Cable Fly', muscleGroups: ['Chest'], equipment: 'Cable', type: 'strength' },
  { name: 'Chest Press Machine', muscleGroups: ['Chest'], equipment: 'Machine', type: 'strength' },

  // Back
  { name: 'Pull-ups', muscleGroups: ['Back', 'Arms'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Chin-ups', muscleGroups: ['Back', 'Arms'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Barbell Row', muscleGroups: ['Back'], equipment: 'Barbell', type: 'strength' },
  { name: 'Lat Pulldown', muscleGroups: ['Back'], equipment: 'Cable', type: 'strength' },
  { name: 'Seated Cable Row', muscleGroups: ['Back'], equipment: 'Cable', type: 'strength' },
  { name: 'Deadlift', muscleGroups: ['Back', 'Legs'], equipment: 'Barbell', type: 'strength' },
  { name: 'T-Bar Row', muscleGroups: ['Back'], equipment: 'Machine', type: 'strength' },
  { name: 'Single-Arm Dumbbell Row', muscleGroups: ['Back'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Pullover', muscleGroups: ['Back', 'Chest'], equipment: 'Dumbbell', type: 'strength' },

  // Legs
  { name: 'Squat', muscleGroups: ['Legs'], equipment: 'Barbell', type: 'strength' },
  { name: 'Leg Press', muscleGroups: ['Legs'], equipment: 'Machine', type: 'strength' },
  { name: 'Romanian Deadlift', muscleGroups: ['Legs', 'Back'], equipment: 'Barbell', type: 'strength' },
  { name: 'Leg Curl', muscleGroups: ['Legs'], equipment: 'Machine', type: 'strength' },
  { name: 'Leg Extension', muscleGroups: ['Legs'], equipment: 'Machine', type: 'strength' },
  { name: 'Calf Raises', muscleGroups: ['Legs'], equipment: 'Machine', type: 'strength' },
  { name: 'Lunges', muscleGroups: ['Legs'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Hip Thrust', muscleGroups: ['Legs'], equipment: 'Barbell', type: 'strength' },
  { name: 'Bulgarian Split Squat', muscleGroups: ['Legs'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Hack Squat', muscleGroups: ['Legs'], equipment: 'Machine', type: 'strength' },
  { name: 'Goblet Squat', muscleGroups: ['Legs'], equipment: 'Dumbbell', type: 'strength' },

  // Shoulders
  { name: 'Overhead Press', muscleGroups: ['Shoulders'], equipment: 'Barbell', type: 'strength' },
  { name: 'Lateral Raises', muscleGroups: ['Shoulders'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Front Raises', muscleGroups: ['Shoulders'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Face Pulls', muscleGroups: ['Shoulders', 'Back'], equipment: 'Cable', type: 'strength' },
  { name: 'Arnold Press', muscleGroups: ['Shoulders'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Shrugs', muscleGroups: ['Shoulders'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Upright Row', muscleGroups: ['Shoulders'], equipment: 'Barbell', type: 'strength' },
  { name: 'Reverse Pec Deck', muscleGroups: ['Shoulders', 'Back'], equipment: 'Machine', type: 'strength' },

  // Arms
  { name: 'Barbell Curl', muscleGroups: ['Arms'], equipment: 'Barbell', type: 'strength' },
  { name: 'Hammer Curl', muscleGroups: ['Arms'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Preacher Curl', muscleGroups: ['Arms'], equipment: 'Barbell', type: 'strength' },
  { name: 'Cable Curl', muscleGroups: ['Arms'], equipment: 'Cable', type: 'strength' },
  { name: 'Concentration Curl', muscleGroups: ['Arms'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Tricep Pushdown', muscleGroups: ['Arms'], equipment: 'Cable', type: 'strength' },
  { name: 'Skull Crushers', muscleGroups: ['Arms'], equipment: 'Barbell', type: 'strength' },
  { name: 'Overhead Tricep Extension', muscleGroups: ['Arms'], equipment: 'Dumbbell', type: 'strength' },
  { name: 'Close-Grip Bench Press', muscleGroups: ['Arms', 'Chest'], equipment: 'Barbell', type: 'strength' },
  { name: 'Dips', muscleGroups: ['Arms', 'Chest'], equipment: 'Bodyweight', type: 'strength' },

  // Core
  { name: 'Plank', muscleGroups: ['Core'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Side Plank', muscleGroups: ['Core'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Crunches', muscleGroups: ['Core'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Bicycle Crunch', muscleGroups: ['Core'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Leg Raises', muscleGroups: ['Core'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Hanging Leg Raise', muscleGroups: ['Core'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Russian Twist', muscleGroups: ['Core'], equipment: 'Bodyweight', type: 'strength' },
  { name: 'Mountain Climbers', muscleGroups: ['Core'], equipment: 'Bodyweight', type: 'cardio' },
  { name: 'Ab Wheel', muscleGroups: ['Core'], equipment: 'Other', type: 'strength' },

  // Cardio
  { name: 'Running', muscleGroups: ['Cardio'], equipment: 'Other', type: 'cardio' },
  { name: 'Cycling', muscleGroups: ['Cardio'], equipment: 'Other', type: 'cardio' },
  { name: 'Jump Rope', muscleGroups: ['Cardio'], equipment: 'Other', type: 'cardio' },
  { name: 'Rowing Machine', muscleGroups: ['Cardio', 'Back'], equipment: 'Machine', type: 'cardio' },
  { name: 'Elliptical', muscleGroups: ['Cardio'], equipment: 'Machine', type: 'cardio' },
  { name: 'Stair Climber', muscleGroups: ['Cardio', 'Legs'], equipment: 'Machine', type: 'cardio' },
  { name: 'Swimming', muscleGroups: ['Cardio'], equipment: 'Other', type: 'cardio' },
  { name: 'Battle Ropes', muscleGroups: ['Cardio', 'Arms'], equipment: 'Other', type: 'cardio' },
];
