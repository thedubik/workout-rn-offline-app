import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme';
import type { MainTabParamList } from './types';
import { DashboardScreen } from '../screens/Dashboard';
import { WorkoutsScreen } from '../screens/Workouts';
import { ExercisesScreen } from '../screens/Exercises';
import { HistoryScreen } from '../screens/History';
import { ProgressScreen } from '../screens/Progress';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Dashboard: 'view-dashboard-outline',
  Workouts: 'dumbbell',
  Exercises: 'weight-lifter',
  History: 'history',
  Progress: 'chart-line',
};

interface TabBarIconProps {
  routeName: keyof MainTabParamList;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ routeName, color, size }) => (
  <Icon name={TAB_ICONS[routeName]} size={size} color={color} />
);

export const MainTabNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium as '500',
        },
        tabBarIcon: ({ color, size }) => <TabBarIcon routeName={route.name} color={color} size={size} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
};
