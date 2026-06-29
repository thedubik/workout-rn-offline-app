import { useMemo } from 'react';
import { Platform } from 'react-native';
import { matchFont } from '@shopify/react-native-skia';

/** Shared Skia font for chart axis labels, matched against the system font. */
export function useChartFont(size = 11) {
  return useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
        fontSize: size,
        fontWeight: '400',
      }),
    [size],
  );
}
