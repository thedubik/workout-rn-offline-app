import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainTabParamList = {
  Dashboard: undefined;
  Workouts: undefined;
  Exercises: undefined;
  History: undefined;
  Progress: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ActiveWorkout: { templateId?: string } | undefined;
  WorkoutSummary: undefined;
  ExerciseDetail: { exerciseId: string };
  CreateExercise: { exerciseId?: string } | undefined;
  CreateTemplate: { templateId?: string } | undefined;
  Settings: undefined;
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

export type MainTabScreenProps<RouteName extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, RouteName>,
  NativeStackScreenProps<RootStackParamList>
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
