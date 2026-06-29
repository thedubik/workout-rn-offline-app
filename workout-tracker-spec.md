# Workout Tracker — React Native CLI

> Cross-platform fitness tracking app (iOS + Android). Offline-first, no backend, no Expo.
> Built with the latest React Native 0.76+ New Architecture (Fabric + TurboModules).

---

## Tech Stack

| Category      | Library                                               | Version |
| ------------- | ----------------------------------------------------- | ------- |
| Framework     | react-native (CLI)                                    | 0.8+    |
| Language      | TypeScript                                            | 5.x     |
| Navigation    | @react-navigation/native + bottom-tabs + native-stack | v7      |
| Storage       | react-native-mmkv                                     | 3.x     |
| ORM / DB      | WatermelonDB                                          | 0.27+   |
| State         | Zustand                                               | 5.x     |
| Animations    | react-native-reanimated                               | 3.x     |
| Gestures      | react-native-gesture-handler                          | 2.x     |
| Charts        | react-native-skia + Victory Native XL                 | latest  |
| UI primitives | @shopify/flash-list                                   | latest  |
| Forms         | react-hook-form + zod                                 | latest  |
| Date utils    | date-fns                                              | 3.x     |
| Icons         | react-native-vector-icons                             | latest  |
| Haptics       | react-native-haptic-feedback                          | latest  |
| Testing       | Jest + @testing-library/react-native                  | latest  |
| Linting       | ESLint (airbnb-typescript) + Prettier                 | latest  |

> No Expo. No Firebase. Pure offline React Native CLI project.

---

## App Overview

A clean, fast workout tracker where users can:

- Create and manage custom exercises
- Build workout templates
- Log workouts with sets, reps, weight
- Track progress over time with charts
- View workout history

---

## Screens & Navigation Structure

```
RootNavigator (Stack)
├── MainTabs (Bottom Tab Navigator)
│   ├── DashboardScreen
│   ├── WorkoutsScreen
│   ├── ExercisesScreen
│   ├── HistoryScreen
│   └── ProgressScreen
└── Modal Screens (presented as modals)
    ├── ActiveWorkoutScreen
    ├── ExerciseDetailScreen
    ├── CreateExerciseScreen
    ├── CreateTemplateScreen
    └── WorkoutSummaryScreen
```

---

## Screen Descriptions

### 1. DashboardScreen

- Weekly summary: workouts completed, total volume (kg), total time
- Streak counter (consecutive training days)
- "Start Workout" CTA button — opens template picker or blank workout
- Recent workouts list (last 3)
- Motivational weekly progress bar

### 2. WorkoutsScreen

- List of saved workout templates
- Each card shows: name, muscle groups, estimated duration, last performed date
- FAB button to create new template
- Swipe-to-delete on templates
- Search/filter by muscle group

### 3. ExercisesScreen

- Full exercise library (user-created + default preloaded exercises)
- Filter by muscle group: Chest, Back, Legs, Shoulders, Arms, Core, Cardio
- Search by name
- Each item shows: name, muscle group, equipment type
- Tap to view ExerciseDetailScreen
- FAB to add custom exercise

### 4. HistoryScreen

- Calendar view (monthly) with dots on workout days
- List of past workouts sorted by date
- Each item: workout name, date, duration, total volume
- Tap to expand and see full workout log

### 5. ProgressScreen

- Select any exercise from library
- Chart showing: max weight over time / total volume over time / 1RM estimate
- Time range selector: 1M / 3M / 6M / 1Y / All
- Personal records (PR) highlighted on chart
- Stats cards: current PR, total sessions, avg reps

### 6. ActiveWorkoutScreen (modal, full screen)

- Timer (elapsed time, running in background)
- Current workout name (editable)
- List of exercises with sets
- Each set row: set number, previous performance (from last session), weight input, reps input, done checkbox
- Rest timer between sets (configurable: 30s / 60s / 90s / 2min / custom)
- Add exercise button
- Reorder exercises via drag-and-drop
- Finish Workout → WorkoutSummaryScreen
- Cancel with confirmation dialog

### 7. WorkoutSummaryScreen

- Total duration, total volume, total sets
- List of all exercises and sets completed
- Personal records achieved (highlighted)
- "Save" button → stores to WatermelonDB
- "Discard" button

### 8. CreateExerciseScreen

- Name input
- Muscle group selector (multi-select chips)
- Equipment type selector: Barbell / Dumbbell / Machine / Bodyweight / Cable / Other
- Exercise type: Strength / Cardio / Mobility
- Notes textarea
- Save button

### 9. CreateTemplateScreen

- Template name input
- Add exercises from library (searchable modal)
- Reorder via drag-and-drop
- Set default sets count per exercise
- Save template

---

## Data Models (WatermelonDB)

```typescript
// Exercise — predefined or user-created
interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[]; // stored as JSON string in DB
  equipment: string;
  type: "strength" | "cardio" | "mobility";
  isCustom: boolean;
  notes?: string;
  createdAt: number;
}

// WorkoutTemplate — saved routine
interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: TemplateExercise[]; // JSON
  createdAt: number;
  lastPerformedAt?: number;
}

// WorkoutSession — completed workout log
interface WorkoutSession {
  id: string;
  templateId?: string;
  name: string;
  startedAt: number;
  finishedAt: number;
  duration: number; // seconds
  totalVolume: number; // kg
  exercises: SessionExercise[]; // JSON
  notes?: string;
}

// SessionExercise — exercise within a session
interface SessionExercise {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

// SetLog — individual set
interface SetLog {
  setNumber: number;
  weight: number; // kg or lbs
  reps: number;
  rpe?: number; // Rate of Perceived Exertion 1-10
  isWarmup: boolean;
  completedAt: number;
}
```

---

## Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSpinner.tsx
│   ├── workout/
│   │   ├── SetRow.tsx
│   │   ├── ExerciseBlock.tsx
│   │   ├── RestTimer.tsx
│   │   └── WorkoutCard.tsx
│   ├── charts/
│   │   ├── ProgressChart.tsx
│   │   └── VolumeChart.tsx
│   └── calendar/
│       └── WorkoutCalendar.tsx
│
├── screens/
│   ├── Dashboard/
│   │   └── DashboardScreen.tsx
│   ├── Workouts/
│   │   ├── WorkoutsScreen.tsx
│   │   └── CreateTemplateScreen.tsx
│   ├── Exercises/
│   │   ├── ExercisesScreen.tsx
│   │   ├── ExerciseDetailScreen.tsx
│   │   └── CreateExerciseScreen.tsx
│   ├── History/
│   │   └── HistoryScreen.tsx
│   ├── Progress/
│   │   └── ProgressScreen.tsx
│   ├── ActiveWorkout/
│   │   ├── ActiveWorkoutScreen.tsx
│   │   └── WorkoutSummaryScreen.tsx
│   └── index.ts
│
├── navigation/
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│   └── types.ts            ← typed route params
│
├── store/
│   ├── workoutStore.ts     ← active workout state (Zustand)
│   ├── settingsStore.ts    ← units (kg/lbs), theme, rest timer defaults
│   └── index.ts
│
├── database/
│   ├── index.ts            ← WatermelonDB setup
│   ├── schema.ts           ← DB schema definition
│   ├── models/
│   │   ├── Exercise.ts
│   │   ├── WorkoutTemplate.ts
│   │   └── WorkoutSession.ts
│   └── seeds/
│       └── defaultExercises.ts   ← 50+ preloaded exercises
│
├── hooks/
│   ├── useWorkoutTimer.ts
│   ├── useRestTimer.ts
│   ├── useExerciseHistory.ts
│   └── usePersonalRecords.ts
│
├── utils/
│   ├── volume.ts           ← calculate total volume
│   ├── oneRepMax.ts        ← Epley formula for 1RM estimate
│   ├── formatDuration.ts
│   └── muscleGroups.ts
│
├── theme/
│   ├── colors.ts           ← light + dark palette
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
│
└── types/
    ├── exercise.ts
    ├── workout.ts
    └── navigation.ts
```

---

## Default Exercise Library (seeds)

Preload 50+ exercises on first app launch:

**Chest:** Bench Press, Incline Bench Press, Dumbbell Flyes, Push-ups, Cable Crossover
**Back:** Pull-ups, Barbell Row, Lat Pulldown, Seated Cable Row, Deadlift
**Legs:** Squat, Leg Press, Romanian Deadlift, Leg Curl, Leg Extension, Calf Raises, Lunges
**Shoulders:** Overhead Press, Lateral Raises, Front Raises, Face Pulls, Arnold Press
**Arms:** Barbell Curl, Hammer Curl, Tricep Pushdown, Skull Crushers, Dips
**Core:** Plank, Crunches, Leg Raises, Russian Twist, Ab Wheel
**Cardio:** Running, Cycling, Jump Rope, Rowing Machine

---

## Key Technical Implementation Notes

### WatermelonDB setup

```typescript
// database/index.ts
import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import { Exercise, WorkoutSession, WorkoutTemplate } from "./models";

const adapter = new SQLiteAdapter({ schema, jsi: true });

export const database = new Database({
  adapter,
  modelClasses: [Exercise, WorkoutSession, WorkoutTemplate],
});
```

### Active workout state (Zustand)

```typescript
// store/workoutStore.ts
interface WorkoutStore {
  isActive: boolean;
  startedAt: number | null;
  name: string;
  exercises: ActiveExercise[];
  startWorkout: (template?: WorkoutTemplate) => void;
  addExercise: (exercise: Exercise) => void;
  logSet: (exerciseId: string, set: SetLog) => void;
  finishWorkout: () => WorkoutSession;
  cancelWorkout: () => void;
}
```

### Rest timer (background)

Use `react-native-background-timer` to keep rest timer running when app is backgrounded. Show local notification when rest is complete.

### 1RM Estimate (Epley formula)

```typescript
// utils/oneRepMax.ts
export const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};
```

### Units (kg / lbs)

Store preference in MMKV. All values saved in kg internally, converted for display.

```typescript
// store/settingsStore.ts
interface SettingsStore {
  unit: "kg" | "lbs";
  restTimerDefault: number; // seconds
  theme: "light" | "dark" | "system";
}
```

---

## Animations & UX Details

- Set completion → checkmark with spring animation (Reanimated)
- Swipe-to-delete on templates and history items (Gesture Handler)
- Rest timer → circular progress ring (Skia)
- New PR achieved → confetti burst or badge animation (Reanimated)
- Drag-to-reorder exercises in active workout (react-native-draggable-flatlist)
- All lists → FlashList for performance
- Bottom sheet for exercise picker (Gorhom Bottom Sheet)

---

## Settings Screen (bonus, simple)

- Units toggle: kg / lbs
- Default rest timer duration
- Theme: Light / Dark / System
- Clear all data (with confirmation)
- App version

---

## Getting Started

```bash
# 1. Init project
npx @react-native-community/cli init WorkoutTracker --template react-native-template-typescript

# 2. Install dependencies
yarn add @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
yarn add react-native-screens react-native-safe-area-context
yarn add react-native-gesture-handler react-native-reanimated
yarn add react-native-mmkv
yarn add @nozbe/watermelondb @nozbe/with-observables
yarn add zustand
yarn add react-hook-form zod @hookform/resolvers
yarn add @shopify/flash-list
yarn add react-native-vector-icons
yarn add date-fns
yarn add react-native-haptic-feedback
yarn add @gorhom/bottom-sheet
yarn add react-native-draggable-flatlist
yarn add react-native-background-timer

# 3. iOS pods
cd ios && pod install && cd ..

# 4. Run
yarn ios
yarn android
```

---

## Claude Code Prompt (використай це для старту)

```
I want to build a Workout Tracker mobile app using React Native CLI (no Expo), TypeScript, and the New Architecture (Fabric).

Tech stack:
- Navigation: React Navigation v7 (bottom tabs + native stack)
- Database: WatermelonDB with SQLite adapter (JSI mode)
- State: Zustand v5
- Animations: Reanimated 3 + Gesture Handler 2
- Lists: FlashList
- Storage: react-native-mmkv for settings
- Charts: Victory Native XL
- Forms: react-hook-form + zod

Please follow the project structure defined in the spec. Start by:
1. Setting up the project structure and all dependencies
2. Configuring WatermelonDB schema and models
3. Setting up React Navigation with typed routes
4. Creating the Zustand stores
5. Building the TabNavigator with placeholder screens
6. Seeding the default exercise library

Use the data models and file structure from the spec exactly.
```

---

## Screenshots Placeholder

| Dashboard                                 | Active Workout                      | Progress                                | History                               |
| ----------------------------------------- | ----------------------------------- | --------------------------------------- | ------------------------------------- |
| ![dashboard](./screenshots/dashboard.png) | ![active](./screenshots/active.png) | ![progress](./screenshots/progress.png) | ![history](./screenshots/history.png) |

---

## Author

Built by [Vitalii Dubanovskyi](https://github.com/thedubik) · [LinkedIn](https://www.linkedin.com/in/vitalii-dubanovskyi-a48459228)
