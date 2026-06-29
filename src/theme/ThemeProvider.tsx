import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { darkTheme, lightTheme, Theme } from './themes';

const ThemeContext = createContext<Theme>(lightTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themePreference = useSettingsStore((state) => state.theme);
  const systemScheme = useColorScheme();

  const theme = useMemo(() => {
    const isDark =
      themePreference === 'system' ? systemScheme === 'dark' : themePreference === 'dark';
    return isDark ? darkTheme : lightTheme;
  }, [themePreference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => useContext(ThemeContext);
