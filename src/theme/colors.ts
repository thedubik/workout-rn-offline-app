export const lightColors = {
  background: '#F5F6FA',
  backgroundSecondary: '#ECEEF4',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E4E7EC',
  borderLight: '#EFF1F5',

  text: '#14151A',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  primary: '#5B5FEF',
  primaryMuted: '#E7E8FD',
  onPrimary: '#FFFFFF',

  secondary: '#FF6B35',
  secondaryMuted: '#FFE6DB',

  success: '#22C55E',
  successMuted: '#DCFCE7',
  warning: '#F59E0B',
  warningMuted: '#FEF3C7',
  error: '#EF4444',
  errorMuted: '#FEE2E2',
  info: '#3B82F6',
  infoMuted: '#DBEAFE',

  overlay: 'rgba(15, 17, 24, 0.45)',
  shadow: 'rgba(20, 21, 26, 0.08)',

  chartLine: '#5B5FEF',
  chartLineSecondary: '#FF6B35',
  chartGrid: '#E4E7EC',
  chartArea: 'rgba(91, 95, 239, 0.12)',

  tabBarActive: '#5B5FEF',
  tabBarInactive: '#9CA3AF',

  pr: '#F59E0B',
  warmup: '#9CA3AF',
};

export const darkColors: typeof lightColors = {
  background: '#0B0D12',
  backgroundSecondary: '#10131B',
  surface: '#181B25',
  surfaceElevated: '#202432',
  border: '#2A2E3C',
  borderLight: '#23273500',

  text: '#F5F6FA',
  textSecondary: '#9AA0AC',
  textMuted: '#6B7280',
  textInverse: '#14151A',

  primary: '#8285F4',
  primaryMuted: '#262A4A',
  onPrimary: '#0B0D12',

  secondary: '#FF8A5C',
  secondaryMuted: '#3A2A22',

  success: '#34D399',
  successMuted: '#103527',
  warning: '#FBBF24',
  warningMuted: '#3A2E0E',
  error: '#F87171',
  errorMuted: '#3A1B1B',
  info: '#60A5FA',
  infoMuted: '#142A47',

  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.4)',

  chartLine: '#8285F4',
  chartLineSecondary: '#FF8A5C',
  chartGrid: '#2A2E3C',
  chartArea: 'rgba(130, 133, 244, 0.16)',

  tabBarActive: '#8285F4',
  tabBarInactive: '#6B7280',

  pr: '#FBBF24',
  warmup: '#6B7280',
};

export type ColorPalette = typeof lightColors;
