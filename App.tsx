/**
 * Workout Tracker
 * Offline-first React Native workout logging app.
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme, type Theme as NavigationTheme } from '@react-navigation/native';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider, useTheme } from './src/theme';
import type { Theme } from './src/theme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { seedDatabaseIfNeeded } from './src/database/seeds';
import { LoadingSpinner } from './src/components/common';

const buildNavigationTheme = (theme: Theme): NavigationTheme => {
  const base = theme.isDark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.error,
    },
  };
};

function AppContent({ ready }: { ready: boolean }): React.JSX.Element {
  const theme = useTheme();

  if (!ready) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer theme={buildNavigationTheme(theme)}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

function App(): React.JSX.Element {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedDatabaseIfNeeded().finally(() => setReady(true));
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <AppContent ready={ready} />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
