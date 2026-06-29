import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import type { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { ActiveWorkoutScreen, WorkoutSummaryScreen } from '../screens/ActiveWorkout';
import { CreateExerciseScreen, ExerciseDetailScreen } from '../screens/Exercises';
import { CreateTemplateScreen } from '../screens/Workouts';
import { SettingsScreen } from '../screens/Settings';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: theme.typography.fontWeight.bold as '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="WorkoutSummary"
        component={WorkoutSummaryScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
      <Stack.Screen
        name="CreateExercise"
        component={CreateExerciseScreen}
        options={{ presentation: 'modal', title: 'New Exercise' }}
      />
      <Stack.Screen
        name="CreateTemplate"
        component={CreateTemplateScreen}
        options={{ presentation: 'modal', title: 'New Template' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
};
