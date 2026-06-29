import { ColorPalette, darkColors, lightColors } from './colors';
import { Radius, radius, Spacing, spacing } from './spacing';
import { Typography, typography } from './typography';

export interface Theme {
  colors: ColorPalette;
  spacing: Spacing;
  radius: Radius;
  typography: Typography;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  radius,
  typography,
  isDark: true,
};
